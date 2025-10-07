import json
import math
import os
import sys
import threading
import time
from importlib import import_module
from pathlib import Path
from typing import Optional, Tuple

from confluent_kafka import Consumer, Producer
from flask import Flask

HERE = Path(__file__).resolve().parent
POSSIBLE_ROOTS = [HERE.parent]
parents = list(HERE.parents)
for depth in range(1, min(3, len(parents))):
    POSSIBLE_ROOTS.append(parents[depth])
for candidate in POSSIBLE_ROOTS:
    if candidate and str(candidate) not in sys.path:
        sys.path.append(str(candidate))

from config import *

try:
    import numpy as np  # type: ignore
    import pandas as pd  # type: ignore
except Exception:  # pragma: no cover
    np = None  # type: ignore
    pd = None  # type: ignore

try:
    from database.dbconnection import DB_CONFIG, get_db  # type: ignore
except Exception:  # pragma: no cover
    DB_CONFIG = {}  # type: ignore
    get_db = None  # type: ignore

IMPORT_ERROR: Optional[Exception] = None
_LOADER = None

# Try to import predict_fraud module 
for module_name in (
    "predict_fraud",
    "models.predict_fraud",
    "TAP.models.predict_fraud",
    "TAP.TAP.models.predict_fraud",
):
    try:
        mod = import_module(module_name)
    except ModuleNotFoundError as exc:  # pragma: no cover - keep searching
        IMPORT_ERROR = exc
        continue
    except Exception as exc:  # pragma: no cover
        IMPORT_ERROR = exc
        continue

    if hasattr(mod, "load_artifacts") and callable(getattr(mod, "load_artifacts")):
        _LOADER = ("artifacts", getattr(mod, "load_artifacts"))
        IMPORT_ERROR = None
        break
    if hasattr(mod, "load_model") and callable(getattr(mod, "load_model")):
        _LOADER = ("model", getattr(mod, "load_model"))
        IMPORT_ERROR = None
        break



MODEL_PATH = Path(os.getenv("TXN_MODEL_PATH", HERE.parent / "fraud_pipeline.pkl"))  # default model path
DEFAULT_THRESHOLD = float(os.getenv("TXN_DECISION_THRESHOLD", "0.5"))  # default threshold
DB_TABLE = os.getenv("TXN_DB_TABLE", "tx_test")


class ModelState:
    def __init__(self) -> None:
        self.model = None
        self.feature_names = None
        self.label_encoder = None
        self.load_error: Optional[str] = None
        self.reference_df = None
        self.reference_error: Optional[str] = None

    def ready(self) -> bool:
        return self.model is not None and pd is not None


STATE = ModelState()


def _db_configured() -> bool:
    if not callable(get_db):
        STATE.reference_error = "database connector unavailable"
        return False
    if not DB_TABLE:
        STATE.reference_error = "TXN_DB_TABLE not configured"
        return False
    return True


def _load_reference_from_db() -> Optional[pd.DataFrame]:
    if not _db_configured() or pd is None:
        return None

    try:
        conn = get_db()
    except Exception as exc:  # pragma: no cover
        STATE.reference_error = f"database connection failed: {exc}"
        return None

    table = DB_TABLE
    schema = os.getenv("TXN_DB_SCHEMA") or DB_CONFIG.get("database") if isinstance(DB_CONFIG, dict) else None
    if schema and "." not in table:
        table = f"{schema}.{table}"

    query = f"SELECT * FROM {table}"
    try:
        df = pd.read_sql(query, conn)
    except Exception as exc:  # pragma: no cover
        STATE.reference_error = f"database query failed: {exc}"
        return None
    finally:
        try:
            conn.close()
        except Exception:
            pass

    if "link_id" not in df.columns:
        STATE.reference_error = "database table missing link_id column"
        return None

    rename_map = {
        "tx_nameOrig": "nameOrig",
    }
    df = df.rename(columns=rename_map)

    if "newbalanceOrig" in df.columns and "newbalanceOrg" not in df.columns:
        df["newbalanceOrg"] = df["newbalanceOrig"]

    if "label_isFraud" not in df.columns and "isFraud" in df.columns:
        df["label_isFraud"] = df["isFraud"]

    df["link_id"] = df["link_id"].astype(str)
    return df


def _load_model_bundle() -> None:
    if _LOADER is None:
        STATE.load_error = f"predict_fraud import failed: {IMPORT_ERROR}"
        return
    kind, loader = _LOADER
    try:
        bundle = loader(MODEL_PATH if kind == "artifacts" else str(MODEL_PATH))
    except FileNotFoundError as exc:
        STATE.load_error = f"model not found at {MODEL_PATH}: {exc}"
        return
    except Exception as exc:  # pragma: no cover
        STATE.load_error = f"failed loading model: {exc}"
        return

    if isinstance(bundle, dict):
        STATE.model = bundle.get("model") or bundle
        STATE.feature_names = bundle.get("feature_names")
        STATE.label_encoder = bundle.get("label_encoder")
    else:
        STATE.model = bundle
        STATE.feature_names = None
        STATE.label_encoder = None

# Load the reference DataFrame (tx_linked_with_entity.csv)
def _load_reference_frame() -> None:
    if pd is None:
        STATE.reference_error = "pandas not installed"
        return

    df = _load_reference_from_db()
    if df is None:
        if STATE.reference_error is None:
            STATE.reference_error = "reference database unavailable"
        return

    df["link_id"] = df["link_id"].astype(str)
    # Ensure all feature columns exist
    STATE.reference_df = df.set_index("link_id", drop=False)
    STATE.reference_error = None


def initialize_state() -> None:
    if STATE.model is None:
        _load_model_bundle()
    if STATE.reference_df is None:
        _load_reference_frame()


def _fallback_context(reason: str) -> dict:
    return {
        "model_ready": STATE.ready(),
        "reason": reason,
        "model_error": STATE.load_error,
        "reference_error": STATE.reference_error,
    }


def _build_event_row(ev: dict) -> Optional[pd.DataFrame]:
    if pd is None:
        return None

    def _to_int(val, default: int = 0) -> int:
        try:
            if val in (None, ""):
                return default
            return int(float(val))
        except Exception:
            return default

    def _to_float(val, default: float = 0.0) -> float:
        try:
            if val in (None, ""):
                return default
            return float(val)
        except Exception:
            return default

    new_after = _to_float(ev.get("src_balance_after"))
    row = {
        "link_id": _to_int(ev.get("link_id"), default=-1),
        "entity_id": _to_int(ev.get("entity_id")),
        "label_isFraud": 0,
        "step": _to_int(ev.get("tx_step")),
        "type": ev.get("tx_type", ""),
        "amount": _to_float(ev.get("amount")),
        "oldbalanceOrg": _to_float(ev.get("src_balance_before")),
        "newbalanceOrg": new_after,
        "newbalanceOrig": new_after,
        "oldbalanceDest": _to_float(ev.get("dst_balance_before")),
        "newbalanceDest": _to_float(ev.get("dst_balance_after")),
        "isFlaggedFraud": _to_int(ev.get("isFlaggedFraud"), default=0),
        "tx_day_int": _to_int(ev.get("tx_day")),
    }

    if STATE.feature_names:
        for col in STATE.feature_names:
            row.setdefault(col, 0)

    return pd.DataFrame([row])


def _reference_row(link_id: str) -> Tuple[Optional[pd.DataFrame], bool]:
    if STATE.reference_df is None or pd is None:
        return None, False
    try:
        row = STATE.reference_df.loc[[str(link_id)]]
    except KeyError:
        return None, False
    return row.copy(), True


def _safe_float(val) -> Optional[float]:
    try:
        if val in (None, ""):
            return None
        return float(val)
    except Exception:
        return None


def _resolve_new_balance(ev: dict, raw_df: Optional[pd.DataFrame]) -> Optional[float]:
    if raw_df is not None and pd is not None:
        try:
            series = raw_df.iloc[0]
        except Exception:
            series = None
        if series is not None:
            for col in ("newbalanceOrig", "newbalanceOrg", "newBalanceOrig", "src_balance_after"):
                if col in series.index:
                    val = _safe_float(series[col])
                    if val is not None:
                        return val

    for key in ("newbalanceOrig", "newbalanceOrg", "newBalanceOrig", "src_balance_after"):
        val = _safe_float(ev.get(key))
        if val is not None:
            return val

    return None

# Prepare features DataFrame for prediction
def _prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    if pd is None:
        raise RuntimeError("pandas not available")

    X = df.copy()
    features = STATE.feature_names
    if features:
        for col in features:
            if col not in X.columns:
                X[col] = 0
        X = X[features].copy()

    # Encode type using provided label encoder if available
    if "type" in X.columns:
        col = X["type"]
        if STATE.label_encoder is not None:
            try:
                X["type"] = STATE.label_encoder.transform(col.astype(str))
            except Exception:
                mapping = {
                    cls: idx for idx, cls in enumerate(getattr(STATE.label_encoder, "classes_", []))
                }
                X["type"] = col.astype(str).map(mapping).fillna(-1).astype(int)
        else:
            X["type"] = pd.to_numeric(col, errors="coerce").fillna(-1)

    # Coerce other object columns to numeric where possible
    if np is not None:
        obj_cols = X.select_dtypes(include=["object", "category"]).columns
        for c in obj_cols:
            if c == "type":
                continue
            X[c] = pd.to_numeric(X[c], errors="coerce").fillna(0)

        for col in X.columns:
            if pd.api.types.is_float_dtype(X[col]):
                X[col] = X[col].astype(np.float32)
            elif pd.api.types.is_integer_dtype(X[col]):
                X[col] = X[col].astype(np.int32)
            else:
                X[col] = pd.to_numeric(X[col], errors="coerce").fillna(0).astype(np.float32)

    return X

# Predict probability using the loaded model
def _predict_probability(features: pd.DataFrame) -> float:
    model = STATE.model
    if model is None:
        raise RuntimeError("model not loaded")

    if hasattr(model, "predict_proba"):
        proba = model.predict_proba(features)
        if proba.ndim == 2 and proba.shape[1] > 1:
            return float(proba[0, 1])
        return float(proba[0])
    if hasattr(model, "decision_function"):
        score = float(model.decision_function(features)[0])
        return 1.0 / (1.0 + math.exp(-score))
    if hasattr(model, "predict"):
        pred = model.predict(features)
        return float(pred[0])
    raise RuntimeError("model lacks prediction interface")

# Score a transaction event and return probability and context (newBalanceOrg)
def score_transaction(ev: dict) -> Tuple[Optional[float], dict]:
    if not STATE.ready() or pd is None:
        return None, _fallback_context(
            "model_unavailable" if STATE.model is None else "pandas_missing"
        )

    link_id = str(ev.get("link_id", "")).strip()
    features_df, used_reference = _reference_row(link_id) if link_id else (None, False)

    if features_df is None:
        return None, _fallback_context("reference_row_missing")

    new_balance_val = _resolve_new_balance(ev, features_df)
    tx_amount_val = _safe_float(ev.get("amount"))

    try:
        X = _prepare_features(features_df)
    except Exception as exc:  # pragma: no cover
        ctx = _fallback_context(f"feature_prep_failed: {exc}")
        return None, ctx

    start = time.perf_counter()
    try:
        prob = _predict_probability(X)
    except Exception as exc:  # pragma: no cover
        ctx = _fallback_context(f"prediction_failed: {exc}")
        return None, ctx
    latency_ms = (time.perf_counter() - start) * 1000.0

    ctx = {
        "used_reference_row": used_reference,
        "feature_cols": list(X.columns),
        "latency_ms": round(latency_ms, 3),
        "model_error": STATE.load_error,
        "reference_error": STATE.reference_error,
    }
    if tx_amount_val is not None:
        ctx["tx_amount"] = tx_amount_val
    ctx["tx_amount_raw"] = ev.get("amount")
    if new_balance_val is not None:
        ctx["new_balance"] = new_balance_val
    ctx["new_balance_source"] = "reference" if used_reference else "event"
    return float(prob), ctx


app = Flask(__name__)
producer = Producer({"bootstrap.servers": BOOTSTRAP_SERVERS})


def consume_and_score() -> None:
    initialize_state()
    if not STATE.ready():
        app.logger.warning("[txn-model] model not ready at startup: %s", STATE.load_error)
    if STATE.reference_df is None and STATE.reference_error:
        app.logger.warning("[txn-model] reference data unavailable: %s", STATE.reference_error)

    consumer = Consumer(
        {
            "bootstrap.servers": BOOTSTRAP_SERVERS,
            "group.id": "txn-model",
            "auto.offset.reset": "latest",
        }
    )
    consumer.subscribe([TOPIC_TXN_RAW])

    while True:
        msg = consumer.poll(0.5)
        if msg is None:
            continue
        if msg.error():
            app.logger.warning("[txn-model] %s", msg.error())
            continue

        ev = json.loads(msg.value().decode("utf-8"))
        link_id = ev.get("link_id")
        prob, ctx = score_transaction(ev)
        if prob is None:
            app.logger.warning(
                "[txn-model] skipping link %s: %s",
                link_id,
                ctx.get("reason") or ctx.get("model_error") or "no probability",
            )
            continue

        risk_score = round(prob, 6)
        decision = "flag" if prob >= DEFAULT_THRESHOLD else "ok"
        ctx.setdefault("threshold", DEFAULT_THRESHOLD)
        ctx.setdefault("prediction_probability", prob)
        display_amount = ctx.get("new_balance")
        if display_amount is None:
            display_amount = ctx.get("tx_amount")
        if display_amount is None:
            display_amount = ev.get("amount")
        if "latency_ms" in ctx:
            app.logger.debug(
                "[txn-model] link %s scored in %.3f ms (ref=%s, prob=%.4f)",
                link_id,
                ctx["latency_ms"],
                ctx.get("used_reference_row"),
                prob,
            )

        out = {
            "kind": "score",
            "stream": "transaction",
            "event_time": ev.get("event_time"),
            "link_id": link_id,
            "features_version": "v1",
            "model_version": "fraud-pipeline",
            "risk_score": risk_score,
            "decision": decision,
            "source": "txn-model",
            "context": {
                "tx_type": ev.get("tx_type"),
                "amount": display_amount,
                **ctx,
            },
        }
        producer.produce(
            TOPIC_TXN_SCORED,
            key=(str(link_id) if link_id is not None else "").encode(),
            value=json.dumps(out).encode(),
        )
        producer.poll(0)


threading.Thread(target=consume_and_score, daemon=True).start()


@app.get("/health")
def health():
    return {
        "status": "ok" if STATE.ready() else "degraded",
        "service": "transaction-model",
        "model_loaded": STATE.model is not None,
        "model_path": str(MODEL_PATH),
        "model_error": STATE.load_error,
        "reference_loaded": STATE.reference_df is not None,
        "reference_source": "database" if _db_configured() else None,
        "reference_error": STATE.reference_error,
    }


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8010, debug=False)
