#!/usr/bin/env python3
"""Simple API for fraud prediction.

Endpoints:
- GET /predict?link_id=...

Environment variables:
- CSV_PATH: path to the input CSV (default: datasets merged tx file)
- MODEL_PATH: path to the saved model (default: notebook saved model path)

Run:
  python3 /home/opc/TAP/models/api.py
  
Check Endpoint:
http://localhost:8000/predict_batch?link_ids=2,3,4&minimal=true

"""
import os
import sys
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# Ensure we can import sibling module
HERE = os.path.dirname(os.path.abspath(__file__))
if HERE not in sys.path:
    sys.path.insert(0, HERE)

from predict_fraud import (
    load_model,
    compute_probabilities,
)

import pandas as pd


CSV_PATH = os.getenv(
    "CSV_PATH",
    "/home/opc/datasets/merged_datasets/tx_linked_with_entity.csv",
)
MODEL_PATH = os.getenv(
    "MODEL_PATH",
    "/home/opc/TAP/models/notebooks/tx_stream/saved_models/fraud_pipeline.pkl",
)


app = FastAPI(title="Fraud Prediction API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ModelBundle:
    def __init__(self, model_obj):
        # Saved artifact may be a dict with model, feature_names, label_encoder
        self.raw = model_obj
        self.model = model_obj
        self.feature_names = None
        self.label_encoder = None
        if isinstance(model_obj, dict):
            self.model = model_obj.get("model", model_obj)
            self.feature_names = model_obj.get("feature_names")
            self.label_encoder = model_obj.get("label_encoder")


def _prepare_features(df: pd.DataFrame, feature_names, label_encoder) -> pd.DataFrame:
    X = df
    if feature_names:
        missing = [c for c in feature_names if c not in X.columns]
        if missing:
            raise HTTPException(status_code=400, detail={"error": f"Missing feature columns: {missing}"})
        X = X[feature_names].copy()
    # Minimal preprocessing: encode 'type' via provided encoder if exists
    if "type" in X.columns:
        col = X["type"]
        if label_encoder is not None:
            try:
                X["type"] = label_encoder.transform(col.astype(str))
            except Exception:
                mapping = {cls: i for i, cls in enumerate(getattr(label_encoder, "classes_", []))}
                X["type"] = col.astype(str).map(mapping).fillna(-1).astype(int)
        else:
            try:
                X["type"] = pd.to_numeric(col, errors="ignore")
            except Exception:
                pass
    # Coerce other object columns if numeric-like
    for c in X.select_dtypes(include=["object"]).columns:
        if c == "type":
            continue
        X[c] = pd.to_numeric(X[c], errors="ignore")
    return X


# Load once at startup for performance
try:
    _MODEL_BUNDLE: Optional[ModelBundle] = ModelBundle(load_model(MODEL_PATH))
except Exception as e:
    _MODEL_BUNDLE = None
    _MODEL_LOAD_ERR = str(e)
else:
    _MODEL_LOAD_ERR = None

try:
    _DF: Optional[pd.DataFrame] = pd.read_csv(CSV_PATH)
except Exception as e:
    _DF = None
    _CSV_LOAD_ERR = str(e)
else:
    _CSV_LOAD_ERR = None

# To check API status
@app.get("/health")
def health():
    return {
        "ok": _MODEL_BUNDLE is not None and _DF is not None,
        "model_path": MODEL_PATH,
        "csv_path": CSV_PATH,
        "model_loaded": _MODEL_BUNDLE is not None,
        "csv_loaded": _DF is not None,
        "model_error": _MODEL_LOAD_ERR,
        "csv_error": _CSV_LOAD_ERR,
        "columns": list(_DF.columns) if _DF is not None else [],
        "rows": int(_DF.shape[0]) if _DF is not None else 0,
        "features_used": _MODEL_BUNDLE.feature_names if _MODEL_BUNDLE else None,
    }


@app.get("/predict")
def predict(
    link_id: str = Query(..., description="link_id to score"),
    minimal: bool = Query(True, description="If true, return only link_id and probabilities"),
    debug: bool = Query(False, description="If true, include raw probability array"),
):
    if _MODEL_BUNDLE is None:
        raise HTTPException(status_code=500, detail={"error": f"Model not loaded: {_MODEL_LOAD_ERR}"})
    if _DF is None:
        raise HTTPException(status_code=500, detail={"error": f"CSV not loaded: {_CSV_LOAD_ERR}"})
    df = _DF
    if "link_id" not in df.columns:
        raise HTTPException(status_code=400, detail={"error": "CSV does not contain 'link_id' column."})
    matched = df[df["link_id"].astype(str) == str(link_id)].copy()
    if matched.empty:
        return {
            "link_id": str(link_id),
            #"features_used": _MODEL_BUNDLE.feature_names or [],
            "results": [],
            #"average_fraud_probability": 0.0,
            #"count": 0,
        }
    # Remove any stale fraud_probability column to enforce fresh computation
    if "fraud_probability" in matched.columns:
        del matched["fraud_probability"]
    X = _prepare_features(matched, _MODEL_BUNDLE.feature_names, _MODEL_BUNDLE.label_encoder)
    probs = compute_probabilities(_MODEL_BUNDLE.model, X)  # raw 0-1
    raw_probs = list(map(float, probs))
    matched["probability"] = raw_probs
    payload = {
        "link_id": str(link_id),
        "results": [
            {
            "link_id": str(row["link_id"]),
             "probability": float(row["probability"]) 
            }
            for _, row in matched.iterrows()
        ],
    }
    if not minimal:
        payload.update({
            # "features_used": _MODEL_BUNDLE.feature_names or list(X.columns),
            # "average_probability": float(matched["probability"].mean()),
            # "count": int(matched.shape[0]),
        })
    if debug:
        payload["raw_probabilities"] = raw_probs
    return payload


@app.get("/predict_batch")
def predict_batch(
    link_ids: str = Query(..., description="Comma-separated link_id values"),
    minimal: bool = Query(True, description="If true, only return link_id & probability list"),
    debug: bool = Query(False, description="Include raw probability arrays per link_id"),
):
    """Batch prediction for multiple link_ids.

    Returns a flat list of row-level probabilities. If non-minimal, also returns
    per-link aggregates (count, average_probability). Debug mode adds raw arrays.
    """
    if _MODEL_BUNDLE is None:
        raise HTTPException(status_code=500, detail={"error": f"Model not loaded: {_MODEL_LOAD_ERR}"})
    if _DF is None:
        raise HTTPException(status_code=500, detail={"error": f"CSV not loaded: {_CSV_LOAD_ERR}"})
    df = _DF
    if "link_id" not in df.columns:
        raise HTTPException(status_code=400, detail={"error": "CSV does not contain 'link_id' column."})

    # Parse and normalize link_ids list (remove empties, dedupe preserving order)
    raw_list = [x.strip() for x in link_ids.split(",") if x.strip()]
    seen = set()
    ordered_ids = []
    for lid in raw_list:
        if lid not in seen:
            seen.add(lid)
            ordered_ids.append(lid)

    if not ordered_ids:
        return {"link_ids": [], "results": []}

    all_rows = []
    aggregates = {}  # link_id -> {sum, count}
    debug_map = {}   # link_id -> list of raw probs

    for lid in ordered_ids:
        subset = df[df["link_id"].astype(str) == lid].copy()
        if subset.empty:
            continue
        if "fraud_probability" in subset.columns:
            del subset["fraud_probability"]
        X = subset
        if _MODEL_BUNDLE.feature_names:
            missing = [c for c in _MODEL_BUNDLE.feature_names if c not in X.columns]
            if missing:
                # Skip this lid with an error record rather than failing whole batch
                all_rows.append({"link_id": lid, "error": f"Missing features: {missing}"})
                continue
            X = X[_MODEL_BUNDLE.feature_names].copy()
        if "type" in X.columns:
            col = X["type"]
            if _MODEL_BUNDLE.label_encoder is not None:
                try:
                    X["type"] = _MODEL_BUNDLE.label_encoder.transform(col.astype(str))
                except Exception:
                    mapping = {cls: i for i, cls in enumerate(getattr(_MODEL_BUNDLE.label_encoder, "classes_", []))}
                    X["type"] = col.astype(str).map(mapping).fillna(-1).astype(int)
            else:
                try:
                    X["type"] = pd.to_numeric(col, errors="ignore")
                except Exception:
                    pass
        for c in X.select_dtypes(include=["object"]).columns:
            if c == "type":
                continue
            X[c] = pd.to_numeric(X[c], errors="ignore")
        probs = compute_probabilities(_MODEL_BUNDLE.model, X)
        probs = list(map(float, probs))
        # Append row-level results
        for p in probs:
            all_rows.append({"link_id": lid, "probability": p})
        # Aggregate
        aggregates.setdefault(lid, {"sum": 0.0, "count": 0})
        aggregates[lid]["sum"] += sum(probs)
        aggregates[lid]["count"] += len(probs)
        if debug:
            debug_map[lid] = probs

    response = {"link_ids": ordered_ids, "results": all_rows}
    if not minimal:
        response["aggregates"] = {
            lid: {
                "average_probability": (vals["sum"] / vals["count"]) if vals["count"] else 0.0,
                "count": vals["count"],
            }
            for lid, vals in aggregates.items()
        }
    if debug:
        response["raw_probabilities"] = debug_map
    return response


if __name__ == "__main__":
    try:
        import uvicorn
    except Exception:
        print("uvicorn is not installed. Install with: pip install uvicorn fastapi", file=sys.stderr)
        sys.exit(1)
    uvicorn.run("api:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=False)
