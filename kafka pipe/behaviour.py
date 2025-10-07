"""
Behavior Fraud Detection Model Service
Follows the same pattern as transaction model
Port: 8020
"""

import json
import os
import sys
import threading
import time
from importlib import import_module
from pathlib import Path
from typing import Optional, Tuple

from confluent_kafka import Consumer, Producer
from flask import Flask

# Path setup
HERE = Path(__file__).resolve().parent
POSSIBLE_ROOTS = [HERE.parent]
parents = list(HERE.parents)
for depth in range(1, min(3, len(parents))):
    POSSIBLE_ROOTS.append(parents[depth])
for candidate in POSSIBLE_ROOTS:
    if candidate and str(candidate) not in sys.path:
        sys.path.append(str(candidate))

# Import config from kafka pipe directory
sys.path.insert(0, str(HERE))
from config import *

try:
    import numpy as np
    import pandas as pd
except Exception:
    np = None
    pd = None

# Import error tracking
IMPORT_ERROR: Optional[Exception] = None
_LOADER = None

# Try to import predict_fraud_behavior module
for module_name in (
    "predict_fraud_behavior",
    "models.predict_fraud_behavior",
):
    try:
        mod = import_module(module_name)
    except ModuleNotFoundError as exc:
        IMPORT_ERROR = exc
        continue
    except Exception as exc:
        IMPORT_ERROR = exc
        continue

    if hasattr(mod, "load_artifacts") and callable(getattr(mod, "load_artifacts")):
        _LOADER = ("artifacts", getattr(mod, "load_artifacts"))
        IMPORT_ERROR = None
        break

# Configuration
MODEL_PATH = Path(os.getenv(
    "BEH_MODEL_PATH",
    HERE.parent / "models" / "notebooks" / "geo_stream" / "saved_models"
))
DEFAULT_THRESHOLD = float(os.getenv("BEH_DECISION_THRESHOLD", "0.5"))

# Note: BOOTSTRAP_SERVERS, TOPIC_BEH_RAW, TOPIC_BEH_SCORED 
# are imported from config.py in kafka pipe directory


class ModelState:
    """State management for behavior model"""
    
    def __init__(self) -> None:
        self.artifacts = None
        self.load_error: Optional[str] = None

    def ready(self) -> bool:
        return self.artifacts is not None and pd is not None


STATE = ModelState()


def _load_model_bundle() -> None:
    """Load all model artifacts"""
    if _LOADER is None:
        STATE.load_error = f"predict_fraud_behavior import failed: {IMPORT_ERROR}"
        return
    
    kind, loader = _LOADER
    try:
        STATE.artifacts = loader(MODEL_PATH)
        STATE.load_error = None
    except FileNotFoundError as exc:
        STATE.load_error = f"models not found at {MODEL_PATH}: {exc}"
        return
    except Exception as exc:
        STATE.load_error = f"failed loading models: {exc}"
        return


def initialize_state() -> None:
    """Initialize state if not already loaded"""
    if STATE.artifacts is None:
        _load_model_bundle()


def _fallback_context(reason: str) -> dict:
    """Generate fallback response when prediction fails"""
    return {
        "model_ready": STATE.ready(),
        "reason": reason,
        "model_error": STATE.load_error,
    }


def _safe_float(val) -> Optional[float]:
    """Safely convert value to float"""
    try:
        if val in (None, ""):
            return None
        return float(val)
    except Exception:
        return None


def score_behavior(ev: dict) -> Tuple[Optional[float], dict]:
    """
    Score a behavior event and return probability and context
    
    Args:
        ev: Event dictionary from Kafka with client_hash, event_time, latitude, longitude
        
    Returns:
        Tuple of (probability, context_dict)
    """
    if not STATE.ready() or pd is None:
        return None, _fallback_context(
            "model_unavailable" if STATE.artifacts is None else "pandas_missing"
        )

    # Producer sends "client_hash" field (from CSV column "client_id")
    client_id = str(ev.get("client_hash", "")).strip()
    
    # Extract only the fields needed by the model
    latitude = _safe_float(ev.get("latitude"))
    longitude = _safe_float(ev.get("longitude"))
    event_time = ev.get("event_time")
    
    # Validate required fields
    if latitude is None or longitude is None or not event_time:
        return None, _fallback_context("missing_required_fields")
    
    # Prepare transaction data for feature calculation
    # Model expects: client_id, event_time, latitude, longitude
    transaction_data = {
        "client_id": client_id,
        "event_time": event_time,
        "latitude": latitude,
        "longitude": longitude,
    }

    start = time.perf_counter()
    
    try:
        # Import the module functions dynamically
        mod = sys.modules.get("predict_fraud_behavior")
        if mod is None:
            for name in ("predict_fraud_behavior", "models.predict_fraud_behavior"):
                try:
                    mod = import_module(name)
                    break
                except:
                    continue
        
        if mod is None:
            return None, _fallback_context("module_not_found")
        
        # Calculate features
        features = mod.calculate_features(
            transaction_data,
            STATE.artifacts['risk_zones']
        )
        
        # Generate prediction
        probability, specialist_probas = mod.predict_fraud_probability(
            features,
            STATE.artifacts
        )
        
    except Exception as exc:
        return None, _fallback_context(f"prediction_failed: {exc}")
    
    latency_ms = (time.perf_counter() - start) * 1000.0

    ctx = {
        "latency_ms": round(latency_ms, 3),
        "model_error": STATE.load_error,
        "features": features,
        "specialist_probas": specialist_probas,
    }
    
    return float(probability), ctx


# Flask app
app = Flask(__name__)
producer = Producer({"bootstrap.servers": BOOTSTRAP_SERVERS})


def consume_and_score() -> None:
    """Main consumer loop - consumes from raw topic, scores, produces to scored topic"""
    initialize_state()
    
    if not STATE.ready():
        app.logger.warning("[beh-model] model not ready at startup: %s", STATE.load_error)
    
    consumer = Consumer(
        {
            "bootstrap.servers": BOOTSTRAP_SERVERS,
            "group.id": "beh-model",
            "auto.offset.reset": "latest",
        }
    )
    consumer.subscribe([TOPIC_BEH_RAW])

    app.logger.info(f"[beh-model] consuming from {TOPIC_BEH_RAW}")
    
    while True:
        msg = consumer.poll(0.5)
        if msg is None:
            continue
        if msg.error():
            app.logger.warning("[beh-model] %s", msg.error())
            continue

        ev = json.loads(msg.value().decode("utf-8"))
        
        # Producer sends "client_hash" field
        client_id = ev.get("client_hash")
        
        prob, ctx = score_behavior(ev)
        
        if prob is None:
            app.logger.warning(
                "[beh-model] skipping client %s: %s",
                client_id,
                ctx.get("reason") or ctx.get("model_error") or "no probability",
            )
            continue

        risk_score = round(prob, 6)
        decision = "flag" if prob >= DEFAULT_THRESHOLD else "ok"
        
        # Get threshold from artifacts if available
        threshold = DEFAULT_THRESHOLD
        if STATE.artifacts and 'threshold_config' in STATE.artifacts:
            threshold = STATE.artifacts['threshold_config'].get('optimal_threshold', DEFAULT_THRESHOLD)
        
        if "latency_ms" in ctx:
            app.logger.debug(
                "[beh-model] client %s scored in %.3f ms (prob=%.4f)",
                client_id,
                ctx["latency_ms"],
                prob,
            )

        # Build output message matching transaction model format
        out = {
            "kind": "score",
            "stream": "behaviour",
            "event_time": ev.get("event_time"),
            "client_id": client_id,
            "features_version": "v1",
            "model_version": "ensemble-behavior",
            "risk_score": risk_score,
            "decision": decision,
            "source": "beh-model",
            "context": {
                "latitude": ev.get("latitude"),
                "longitude": ev.get("longitude"),
                "threshold": threshold,
                "prediction_probability": prob,
                "specialist_probas": ctx.get("specialist_probas", {}),
                "latency_ms": ctx.get("latency_ms"),
            },
        }
        
        producer.produce(
            TOPIC_BEH_SCORED,
            key=(str(client_id) if client_id is not None else "").encode(),
            value=json.dumps(out).encode(),
        )
        producer.poll(0)


# Start consumer thread
threading.Thread(target=consume_and_score, daemon=True).start()


@app.get("/health")
def health():
    """Health check endpoint"""
    return {
        "status": "ok" if STATE.ready() else "degraded",
        "service": "behavior-model",
        "model_loaded": STATE.artifacts is not None,
        "model_path": str(MODEL_PATH),
        "model_error": STATE.load_error,
        "models_available": list(STATE.artifacts.keys()) if STATE.artifacts else [],
    }


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8030, debug=False)