import pandas as pd
import numpy as np
import json
import os

COLUMN_MAP = {
    "ai_investment_usd":          "investment_amount",
    "ai_adoption_level":          "ai_adoption_level",
    "automation_rate":            "automation_rate",
    "employee_ai_training_hours": "employee_training_hours",
    "ai_maturity_score":          "ai_maturity_score",
    "deployment_count":           "num_ai_deployments",
    "revenue_impact":             "revenue_impact",
    "productivity_gain":          "productivity_gain",
    "cost_savings":               "cost_savings",
    "industry":                   "industry",
    "country":                    "country",
    "year":                       "year",
}

LEAKAGE_COLS = ["cost_savings", "productivity_gain"]
TARGET_REVENUE      = "revenue_impact"
TARGET_PRODUCTIVITY = "productivity_gain"

DATASET_STATS = {
    "max_training_hours": 197.9,
    "max_deployments":    58,
    "max_investment":     54_170_345,
    "max_maturity_score": 10.0,
    "mean_revenue_impact": 2_591_989,
}

INDUSTRY_ORDER = [
    "Financial Services", "Healthcare", "Technology", "Retail",
    "Manufacturing", "Logistics", "Energy", "Education",
    "Agriculture", "Telecom",
]


def load_and_prepare(csv_path: str, sample_size: int = None) -> pd.DataFrame:
    print(f"[data_prep] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)

    if sample_size:
        df = df.sample(n=min(sample_size, len(df)), random_state=42).reset_index(drop=True)
        print(f"[data_prep] Sampled {len(df):,} rows")
    else:
        print(f"[data_prep] Full dataset: {len(df):,} rows")

    df = df.rename(columns=COLUMN_MAP)

    nulls = df.isnull().sum()
    if nulls.any():
        print(f"[data_prep] WARNING — nulls found:\n{nulls[nulls > 0]}")
    else:
        print("[data_prep] No nulls found ✓")

    # Fix: use .loc to avoid ChainedAssignmentWarning
    bins   = [0, 0.2, 0.4, 0.6, 0.8, 1.01]
    labels = [1, 2, 3, 4, 5]
    df = df.copy()
    df.loc[:, "ai_adoption_level_int"] = pd.cut(
        df["ai_adoption_level"], bins=bins, labels=labels
    ).astype(int)

    df.loc[:, "maturity_norm"] = (df["ai_maturity_score"] - 1) / 9.0

    country_counts = df["country"].value_counts()
    df.loc[:, "country_encoded"] = df["country"].map(country_counts).fillna(0)

    df.loc[:, "industry_encoded"] = df["industry"].apply(
        lambda x: INDUSTRY_ORDER.index(x) if x in INDUSTRY_ORDER else len(INDUSTRY_ORDER)
    )

    df.loc[:, "years_since_2015"] = df["year"] - 2015

    print(f"[data_prep] Final shape: {df.shape}")
    print(f"[data_prep] Industries: {df['industry'].unique().tolist()}")
    return df


def get_safe_features(df: pd.DataFrame, target: str) -> pd.DataFrame:
    drop_cols = LEAKAGE_COLS + [target, "company_id"]
    return df.drop(columns=[c for c in drop_cols if c in df.columns])


def save_dataset_stats(df: pd.DataFrame, out_path: str = "models/dataset_stats.json"):
    stats = {
        "max_training_hours":  float(df["employee_training_hours"].max()),
        "max_deployments":     int(df["num_ai_deployments"].max()),
        "max_investment":      float(df["investment_amount"].max()),
        "max_maturity_score":  float(df["ai_maturity_score"].max()),
        "mean_revenue_impact": float(df["revenue_impact"].mean()),
        "industries":          df["industry"].unique().tolist(),
        "countries":           df["country"].unique().tolist(),
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(stats, f, indent=2)
    print(f"[data_prep] Dataset stats saved → {out_path}")
    return stats


if __name__ == "__main__":
    import sys
    csv = sys.argv[1] if len(sys.argv) > 1 else "corporate_ai_adoption_dataset.csv"
    df  = load_and_prepare(csv, sample_size=5000)
    save_dataset_stats(df)
    print(df.head(3).to_string())
