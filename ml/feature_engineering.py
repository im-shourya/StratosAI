# =============================================================
#  StratosAI — feature_engineering.py
#  Interaction feature creation + categorical encoding
#  Mapped to actual Kaggle dataset columns (post data_prep rename)
# =============================================================

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# ── Columns available AFTER data_prep rename ────────────────────
#   investment_amount, ai_adoption_level (0-1), ai_adoption_level_int (1-5),
#   automation_rate, employee_training_hours, ai_maturity_score (1-10),
#   num_ai_deployments, industry, industry_encoded, country, country_encoded,
#   year, years_since_2015, maturity_norm
#   revenue_impact (target 1), productivity_gain (target 2)


# ─────────────────────────────────────────────────────────────────
#  FEATURE SETS
# ─────────────────────────────────────────────────────────────────

# Raw base features safe to use for BOTH models
BASE_FEATURES = [
    "investment_amount",
    "ai_adoption_level",          # continuous 0-1
    "ai_adoption_level_int",      # ordinal 1-5
    "automation_rate",
    "employee_training_hours",
    "ai_maturity_score",          # 1-10
    "num_ai_deployments",
    "industry_encoded",
    "country_encoded",
    "years_since_2015",
]

# Interaction features shared by both models
SHARED_INTERACTIONS = [
    "investment_per_deployment",  # capital efficiency
    "training_per_deployment",    # training intensity per live system
    "investment_maturity",        # investment × maturity signal
    "automation_maturity",        # automation × adoption (flywheel)
    "training_adoption",          # people + workflow synergy
]

# Extra interactions only for the Revenue Impact Model (Model 1)
REVENUE_INTERACTIONS = [
    "investment_training",        # capital × training amplification
    "automation_investment",      # industrial-scale AI signal
    "deployment_training",        # deployed AI actually used by staff
]

# Full feature lists per model
REVENUE_FEATURES  = BASE_FEATURES + SHARED_INTERACTIONS + REVENUE_INTERACTIONS
PRODUCTIVITY_FEATURES = BASE_FEATURES + SHARED_INTERACTIONS


# ─────────────────────────────────────────────────────────────────
#  CORE FUNCTION
# ─────────────────────────────────────────────────────────────────

def engineer_features(df: pd.DataFrame, for_revenue_model: bool = False) -> pd.DataFrame:
    """
    Build interaction features on top of the base columns.

    Args:
        df:                DataFrame that has already been through data_prep.
        for_revenue_model: If True, also compute the 3 revenue-specific
                           interaction features (investment_training, etc.).

    Returns:
        DataFrame with all engineered columns appended. The caller should
        then select only the columns in REVENUE_FEATURES or
        PRODUCTIVITY_FEATURES before passing to the model.
    """
    df = df.copy()
    eps = 1e-6  # prevent division-by-zero

    # ── Shared interaction features (both models) ────────────────
    df["investment_per_deployment"] = (
        df["investment_amount"] / (df["num_ai_deployments"] + eps)
    )
    df["training_per_deployment"] = (
        df["employee_training_hours"] / (df["num_ai_deployments"] + eps)
    )
    # investment_maturity: scales investment by maturity level (0-1 × raw USD)
    df["investment_maturity"] = (
        df["investment_amount"] * df["ai_adoption_level"]
    )
    # automation_maturity: flywheel — high automation + high adoption
    df["automation_maturity"] = (
        df["automation_rate"] * df["ai_adoption_level"]
    )
    # training_adoption: synergy between training hours and automation rate
    df["training_adoption"] = (
        df["employee_training_hours"] * df["automation_rate"]
    )

    # ── Revenue-model-specific interactions ──────────────────────
    if for_revenue_model:
        df["investment_training"] = (
            df["investment_amount"] * df["employee_training_hours"]
        )
        df["automation_investment"] = (
            df["automation_rate"] * df["investment_amount"]
        )
        df["deployment_training"] = (
            df["num_ai_deployments"] * df["employee_training_hours"]
        )

    return df


def get_feature_matrix(df: pd.DataFrame, for_revenue_model: bool) -> pd.DataFrame:
    """
    Full pipeline: engineer features then return only the columns
    the model was trained on (no target, no leakage, no IDs).
    """
    df_eng = engineer_features(df, for_revenue_model=for_revenue_model)
    cols = REVENUE_FEATURES if for_revenue_model else PRODUCTIVITY_FEATURES
    # Only keep columns that exist (robust to partial inference payloads)
    available = [c for c in cols if c in df_eng.columns]
    return df_eng[available]


# ─────────────────────────────────────────────────────────────────
#  SINGLE-ROW INFERENCE HELPER
#  Used by the Flask API: turn a flat dict from the chatbot into
#  a properly engineered single-row DataFrame.
# ─────────────────────────────────────────────────────────────────

INDUSTRY_ORDER = [
    "Financial Services", "Healthcare", "Technology", "Retail",
    "Manufacturing", "Logistics", "Energy", "Education",
    "Agriculture", "Telecom",
]

def build_inference_row(payload: dict) -> pd.DataFrame:
    """
    Convert a chatbot answer dict (14 Q&A fields) into a single-row
    DataFrame ready for engineer_features().

    Expected payload keys (from NestJS AssessmentService):
        industry              str   — e.g. "Healthcare"
        ai_investment_usd     float — total budget in USD
        ai_adoption_level     float — 0.0 to 1.0 (chatbot maps text → float)
        automation_rate       float — 0.0 to 1.0
        employee_training_hrs float — hours per employee
        ai_maturity_score     float — 1.0 to 10.0
        num_deployments       int   — live AI systems
        country               str   — e.g. "United States"
        year                  int   — assessment year (default 2025)
    """
    industry = payload.get("industry", "Technology")
    year     = int(payload.get("year", 2025))

    ai_adoption_raw = float(payload.get("ai_adoption_level", 0.5))
    ai_adoption_int = int(min(5, max(1, round(ai_adoption_raw * 5))))

    row = {
        "investment_amount":       float(payload.get("ai_investment_usd", 1_000_000)),
        "ai_adoption_level":       ai_adoption_raw,
        "ai_adoption_level_int":   ai_adoption_int,
        "automation_rate":         float(payload.get("automation_rate", 0.3)),
        "employee_training_hours": float(payload.get("employee_training_hrs", 50.0)),
        "ai_maturity_score":       float(payload.get("ai_maturity_score", 5.0)),
        "num_ai_deployments":      int(payload.get("num_deployments", 10)),
        "industry_encoded":        INDUSTRY_ORDER.index(industry)
                                   if industry in INDUSTRY_ORDER else len(INDUSTRY_ORDER),
        "country_encoded":         1000,  # neutral fallback at inference time
        "years_since_2015":        year - 2015,
    }
    return pd.DataFrame([row])


# ── Quick test ───────────────────────────────────────────────────
if __name__ == "__main__":
    sample = build_inference_row({
        "industry": "Healthcare",
        "ai_investment_usd": 2_000_000,
        "ai_adoption_level": 0.6,
        "automation_rate": 0.45,
        "employee_training_hrs": 80,
        "ai_maturity_score": 7.0,
        "num_deployments": 20,
    })
    result = engineer_features(sample, for_revenue_model=True)
    print("Inference row features:")
    print(result.T.to_string())
    print(f"\nRevenue feature count : {len(REVENUE_FEATURES)}")
    print(f"Productivity feature count: {len(PRODUCTIVITY_FEATURES)}")
