#!/usr/bin/env python3
"""predict_fraud.py

Usage examples:

python3 /home/opc/TAP/models/predict_fraud.py \
    --csv /home/opc/datasets/merged_datasets/tx_linked_with_entity.csv \
    --link-id 1 \
    --model "/home/opc/TAP/models/notebooks/tx_stream/saved_models/fraud_pipeline.pkl"
    --json
    
"""
import argparse
import os
import sys
import pickle
import json
try:
    import joblib
except Exception: 
    joblib = None

def load_model(path):
    """Load a pickled model with compatibility fixes for old module paths.

    Handles pickles that reference symbols like 'XGBClassifier' (no module)
    """
    # Try joblib first (common for sklearn pipelines)
    if joblib is not None:
        try:
            return joblib.load(path)
        except Exception:
            pass

    with open(path, "rb") as f:
        try:
            return pickle.load(f)
        except ModuleNotFoundError:
            import importlib

            class CompatUnpickler(pickle.Unpickler):
                def find_class(self, module, name):
                    # Fix legacy/bad module paths seen in some pickles
                    if module == "XGBClassifier":
                        mod = importlib.import_module("xgboost.sklearn")
                        return getattr(mod, "XGBClassifier")
                    if module == "sklearn.externals.joblib":
                        module = "joblib"
                    # Prefer loading from xgboost.sklearn when available
                    if module == "xgboost" and name == "XGBClassifier":
                        module = "xgboost.sklearn"
                    mod = importlib.import_module(module)
                    return getattr(mod, name)

            f.seek(0)
            return CompatUnpickler(f).load()


def compute_probabilities(model, X):
    """Return raw probabilities (0-1) for the positive class.

    NOTE: Previously returned percentages (0-100). Adjusted per request
    to keep raw values. If only decision_function is available we apply
    a logistic to map scores to (0,1). If only predict is available we
    treat outputs as class labels (0/1) and convert to float.
    """
    import numpy as np
    if hasattr(model, "predict_proba"):
        probs = model.predict_proba(X)
        pos = probs[:, 1] if probs.ndim == 2 and probs.shape[1] >= 2 else probs[:, 0]
        return pos.astype(float)
    if hasattr(model, "decision_function"):
        from scipy.special import expit
        scores = model.decision_function(X)
        return expit(scores).astype(float)
    if hasattr(model, "predict"):
        preds = model.predict(X)
        return np.array(preds, dtype=float)
    raise RuntimeError("Model does not support predict_proba, decision_function, or predict")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--csv", required=True, help="Input CSV file")
    parser.add_argument("--link-id", required=True, help="link_id value to filter rows")
    parser.add_argument("--model", default="fraud_pipeline.pkl", help="Model pickle file")
    parser.add_argument("--json", action="store_true", help="Print JSON instead of CSV (frontend-friendly)")
    parser.add_argument("--debug", action="store_true", help="Print internal debug info (raw probabilities, feature matrix head)")
    args = parser.parse_args()

    import pandas as pd
    loaded = load_model(args.model)
    model = loaded
    feature_names = None
    label_encoder = None
    if isinstance(loaded, dict):
        model = loaded.get("model", loaded)
        feature_names = loaded.get("feature_names")
        label_encoder = loaded.get("label_encoder")

    df = pd.read_csv(args.csv)
    if "link_id" not in df.columns:
        print("CSV does not contain 'link_id' column.", file=sys.stderr)
        sys.exit(1)
    matches = df[df["link_id"].astype(str) == str(args.link_id)].copy()
    if matches.empty:
        print(f"No rows found for link_id={args.link_id}")
        sys.exit(0)
    # Ensure we don't reuse an existing probability column from prior runs.
    if "fraud_probability" in matches.columns:
        del matches["fraud_probability"]
    # Build feature matrix X
    X = matches
    if feature_names:
        missing = [c for c in feature_names if c not in X.columns]
        if missing:
            print(f"Missing required feature columns: {missing}", file=sys.stderr)
            sys.exit(1)
        X = X[feature_names].copy()

    # Minimal preprocessing: encode 'type' if label encoder provided
    if "type" in X.columns:
        col = X["type"]
        if label_encoder is not None:
            try:
                X["type"] = label_encoder.transform(col.astype(str))
            except Exception:
                # Fallback: map known classes, unknown -> -1
                try:
                    mapping = {cls: i for i, cls in enumerate(getattr(label_encoder, "classes_", []))}
                    X["type"] = col.astype(str).map(mapping).fillna(-1).astype(int)
                except Exception:
                    pass
        else:
            # Try to coerce to numeric if already encoded as strings
            try:
                X["type"] = pd.to_numeric(col, errors="ignore")
            except Exception:
                pass

    # Coerce other object columns that look numeric
    for c in X.select_dtypes(include=["object"]).columns:
        if c == "type":
            continue
        X[c] = pd.to_numeric(X[c], errors="ignore")

    probs = compute_probabilities(model, X)  # raw 0-1 probabilities
    raw_probs = list(map(float, probs))
    matches["probability"] = raw_probs  # keep raw (no percentage, no rounding)

    if args.debug:
        print("[DEBUG] Feature columns used:", feature_names or list(X.columns), file=sys.stderr)
        print("[DEBUG] First rows of feature matrix:", file=sys.stderr)
        try:
            print(X.head().to_string(), file=sys.stderr)
        except Exception:
            pass
    print("[DEBUG] Raw model probabilities (0-1):", raw_probs, file=sys.stderr)

    if args.json:
        payload = {
            "link_id": str(args.link_id),
            # "features_used": feature_names or list(X.columns),
            "results": [
                {
                    "link_id": str(row["link_id"]),
                    "probability": float(row["probability"]),
                }
                for _, row in matches.iterrows()
            ],
            # "average_probability": float(matches["probability"].mean()),
            # "count": int(matches.shape[0]),
        }
        if args.debug:
            payload["raw_probabilities"] = raw_probs
        print(json.dumps(payload, ensure_ascii=False))
        return
    # Plain CSV with only link_id and raw probability
    print(matches[["link_id", "probability"]].to_csv(index=False))
    # avg = matches["probability"].mean()  # commented out per minimal output request
    # print(f"Average probability for link_id={args.link_id}: {avg:.6f}")


def predict_for_link(csv_path: str, model_path: str, link_id: str):
    """Programmatic helper for APIs/frontends: returns a JSON-serializable dict."""
    import pandas as pd
    loaded = load_model(model_path)
    model = loaded
    feature_names = None
    label_encoder = None
    if isinstance(loaded, dict):
        model = loaded.get("model", loaded)
        feature_names = loaded.get("feature_names")
        label_encoder = loaded.get("label_encoder")

    df = pd.read_csv(csv_path)
    if "link_id" not in df.columns:
        raise ValueError("CSV does not contain 'link_id' column.")
    matches = df[df["link_id"].astype(str) == str(link_id)].copy()
    if matches.empty:
        return {
            "link_id": str(link_id),
            "features_used": feature_names or [],
            "results": [],
            "average_fraud_probability": 0.0,
            "count": 0,
        }
    X = matches
    if feature_names:
        missing = [c for c in feature_names if c not in X.columns]
        if missing:
            raise ValueError(f"Missing required feature columns: {missing}")
        X = X[feature_names].copy()
    if "type" in X.columns:
        col = X["type"]
        if label_encoder is not None:
            try:
                X["type"] = label_encoder.transform(col.astype(str))
            except Exception:
                mapping = {cls: i for i, cls in enumerate(getattr(label_encoder, "classes_", []))}
                X["type"] = col.astype(str).map(mapping).fillna(-1).astype(int)
    for c in X.select_dtypes(include=["object"]).columns:
        if c == "type":
            continue
        X[c] = pd.to_numeric(X[c], errors="ignore")
    probs = compute_probabilities(model, X)
    matches["probability"] = list(map(float, probs))
    return {
        "link_id": str(link_id),
        # "features_used": feature_names or list(X.columns),
        "results": [
            {
                "link_id": str(row["link_id"]),
                "probability": float(row["probability"]),
            }
            for _, row in matches.iterrows()
        ],
        # "average_probability": float(matches["probability"].mean()),
        # "count": int(matches.shape[0]),
    }

if __name__ == "__main__":
    main()
