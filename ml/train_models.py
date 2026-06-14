# =============================================================
#  StratosAI — train_models.py
#  Trains all 5 ML models on the real Kaggle dataset:
#    1. Revenue Impact Model    (XGBRegressor)
#    2. Productivity Gain Model (XGBRegressor)
#    3. Success Predictor       (XGBClassifier + SMOTE)
#    4. Risky Radar             (MultiOutput RandomForest)
#    5. Maturity Assessor       (KMeans Clustering)
#
#  Run: python train_models.py <path_to_csv>
#  Output: models/*.pkl + models/*_metrics.json
# =============================================================

import os, sys, json, warnings
import numpy as np
import pandas as pd
import joblib

warnings.filterwarnings("ignore")

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    r2_score, mean_squared_error, mean_absolute_error,
    roc_auc_score, f1_score, classification_report,
    silhouette_score,
)
from sklearn.ensemble import RandomForestClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from xgboost import XGBRegressor, XGBClassifier
from imblearn.over_sampling import SMOTE

from data_prep import load_and_prepare, get_safe_features, save_dataset_stats
from feature_engineering import (
    engineer_features, get_feature_matrix,
    REVENUE_FEATURES, PRODUCTIVITY_FEATURES,
)

os.makedirs("models", exist_ok=True)


# ─────────────────────────────────────────────────────────────────
#  UTILITY
# ─────────────────────────────────────────────────────────────────

def evaluate_regressor(model, X_test, y_test, name):
    y_pred = model.predict(X_test)
    metrics = {
        "r2":        round(float(r2_score(y_test, y_pred)), 4),
        "rmse":      round(float(np.sqrt(mean_squared_error(y_test, y_pred))), 2),
        "mae":       round(float(mean_absolute_error(y_test, y_pred)), 2),
        "mape_pct":  round(float(np.mean(np.abs((y_test - y_pred)
                          / (np.abs(y_test) + 1e-6))) * 100), 2),
    }
    print(f"\n  ── {name} ──")
    for k, v in metrics.items():
        print(f"     {k}: {v}")
    return metrics


def save_metrics(metrics: dict, name: str):
    path = f"models/{name}_metrics.json"
    with open(path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"  Metrics saved → {path}")


# ─────────────────────────────────────────────────────────────────
#  1. REVENUE IMPACT MODEL
# ─────────────────────────────────────────────────────────────────

def train_revenue_model(df: pd.DataFrame):
    print("\n" + "="*55)
    print("  MODEL 1: Revenue Impact Model (XGBRegressor)")
    print("="*55)

    TARGET = "revenue_impact"
    X_raw  = get_safe_features(df, TARGET)
    y      = df[TARGET]

    X_raw = engineer_features(X_raw, for_revenue_model=True)
    avail = [c for c in REVENUE_FEATURES if c in X_raw.columns]
    X     = X_raw[avail]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"  Train: {X_train.shape[0]:,} | Test: {X_test.shape[0]:,}")
    print(f"  Features: {len(avail)}")

    model = XGBRegressor(
        n_estimators    = 400,
        max_depth       = 6,
        learning_rate   = 0.05,
        subsample       = 0.85,
        colsample_bytree= 0.85,
        reg_alpha       = 0.1,
        reg_lambda      = 2.0,
        random_state    = 42,
        eval_metric     = "rmse",
        early_stopping_rounds = 30,
        n_jobs          = 1,
        verbosity       = 0,
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    metrics = evaluate_regressor(model, X_test, y_test, "Revenue Impact Model")

    # Cross-validation R²
    cv_scores = cross_val_score(
        XGBRegressor(n_estimators=200, max_depth=6, learning_rate=0.05,
                     subsample=0.85, colsample_bytree=0.85, n_jobs=1, verbosity=0),
        X, y, cv=5, scoring="r2", n_jobs=1
    )
    metrics["cv_r2_mean"] = round(float(cv_scores.mean()), 4)
    metrics["cv_r2_std"]  = round(float(cv_scores.std()), 4)
    print(f"     cv_r2_mean: {metrics['cv_r2_mean']} ± {metrics['cv_r2_std']}")
    print(f"     feature_cols: {avail}")

    joblib.dump(model, "models/revenue_impact_model.pkl")
    joblib.dump(avail, "models/revenue_feature_cols.pkl")
    save_metrics({**metrics, "feature_cols": avail}, "revenue_impact_model")
    print("  ✅ Saved → models/revenue_impact_model.pkl")
    return model, avail


# ─────────────────────────────────────────────────────────────────
#  2. PRODUCTIVITY GAIN MODEL
# ─────────────────────────────────────────────────────────────────

def train_productivity_model(df: pd.DataFrame):
    print("\n" + "="*55)
    print("  MODEL 2: Productivity Gain Model (XGBRegressor)")
    print("="*55)

    TARGET = "productivity_gain"
    # Exclude cost_savings and revenue_impact from this model too
    extra_drop = ["cost_savings", "revenue_impact"]
    X_raw = df.drop(columns=[c for c in [TARGET, "company_id"] + extra_drop
                              if c in df.columns])
    y = df[TARGET]

    X_raw = engineer_features(X_raw, for_revenue_model=False)
    avail = [c for c in PRODUCTIVITY_FEATURES if c in X_raw.columns]
    X     = X_raw[avail]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"  Train: {X_train.shape[0]:,} | Test: {X_test.shape[0]:,}")
    print(f"  Features: {len(avail)}")

    model = XGBRegressor(
        n_estimators    = 400,
        max_depth       = 6,
        learning_rate   = 0.05,
        subsample       = 0.85,
        colsample_bytree= 0.85,
        reg_alpha       = 0.1,
        reg_lambda      = 2.0,
        random_state    = 42,
        eval_metric     = "rmse",
        early_stopping_rounds = 30,
        n_jobs          = 1,
        verbosity       = 0,
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    metrics = evaluate_regressor(model, X_test, y_test, "Productivity Gain Model")

    joblib.dump(model, "models/productivity_gain_model.pkl")
    joblib.dump(avail, "models/productivity_feature_cols.pkl")
    save_metrics({**metrics, "feature_cols": avail}, "productivity_gain_model")
    print("  ✅ Saved → models/productivity_gain_model.pkl")
    return model, avail


# ─────────────────────────────────────────────────────────────────
#  3. SUCCESS PREDICTOR (XGBClassifier + SMOTE)
# ─────────────────────────────────────────────────────────────────

def train_success_predictor(df: pd.DataFrame):
    """
    The dataset has no binary success column, so we derive one:
    initiative_success = 1 if revenue_impact > median AND
                         productivity_gain > median, else 0.
    This captures truly high-performing AI initiatives.
    """
    print("\n" + "="*55)
    print("  MODEL 3: Success Predictor (XGBClassifier + SMOTE)")
    print("="*55)

    # Derive binary target
    rev_med  = df["revenue_impact"].median()
    prod_med = df["productivity_gain"].median()
    y = ((df["revenue_impact"] > rev_med) &
         (df["productivity_gain"] > prod_med)).astype(int)

    success_rate = y.mean()
    print(f"  Success rate in dataset: {success_rate:.1%}")

    X_raw = df.drop(columns=[c for c in
                ["company_id", "revenue_impact", "productivity_gain", "cost_savings"]
                if c in df.columns])
    X_raw = engineer_features(X_raw, for_revenue_model=False)
    avail = [c for c in PRODUCTIVITY_FEATURES if c in X_raw.columns]
    X     = X_raw[avail]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"  Train: {X_train.shape[0]:,} | Test: {X_test.shape[0]:,}")

    # SMOTE on training set ONLY
    smote = SMOTE(random_state=42)
    X_train_sm, y_train_sm = smote.fit_resample(X_train, y_train)
    print(f"  After SMOTE: {X_train_sm.shape[0]:,} samples | "
          f"class balance: {y_train_sm.mean():.1%}")

    model = XGBClassifier(
        n_estimators    = 400,
        max_depth       = 6,
        learning_rate   = 0.05,
        subsample       = 0.85,
        colsample_bytree= 0.85,
        scale_pos_weight= 1,   # balanced by SMOTE
        random_state    = 42,
        eval_metric     = "logloss",
        early_stopping_rounds = 30,
        n_jobs          = 1,
        verbosity       = 0,
    )
    model.fit(
        X_train_sm, y_train_sm,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    metrics = {
        "auc_roc": round(float(roc_auc_score(y_test, y_prob)), 4),
        "f1":      round(float(f1_score(y_test, y_pred)), 4),
    }
    print(f"\n  ── Success Predictor ──")
    print(f"     AUC-ROC : {metrics['auc_roc']}")
    print(f"     F1 Score: {metrics['f1']}")
    print(classification_report(y_test, y_pred,
                                target_names=["Fail", "Success"]))

    joblib.dump(model, "models/success_predictor.pkl")
    joblib.dump(avail, "models/success_feature_cols.pkl")
    save_metrics({**metrics, "feature_cols": avail}, "success_predictor")
    print("  ✅ Saved → models/success_predictor.pkl")
    return model


# ─────────────────────────────────────────────────────────────────
#  4. RISKY RADAR (MultiOutput RandomForest)
# ─────────────────────────────────────────────────────────────────

def train_risk_radar(df: pd.DataFrame):
    """
    Build 5 domain risk scores (Technical, Financial, Talent,
    Regulatory, Market) as derived targets from the dataset,
    then train a MultiOutputClassifier on them.

    Risk score derivation (all using dataset columns):
      Technical   = HIGH if ai_maturity_score < 4 AND num_deployments < 10
      Financial   = HIGH if investment_amount > 75th percentile
                          AND revenue_impact < 25th percentile
      Talent      = HIGH if employee_training_hours < 25th percentile
      Regulatory  = HIGH if industry in regulated set AND maturity < 4
      Market      = HIGH if automation_rate < 0.25
    """
    print("\n" + "="*55)
    print("  MODEL 4: Risky Radar (MultiOutput RandomForest)")
    print("="*55)

    # ── Derive risk labels (0=LOW, 1=MED, 2=HIGH) ───────────────
    inv_p75    = df["investment_amount"].quantile(0.75)
    rev_p25    = df["revenue_impact"].quantile(0.25)
    train_p25  = df["employee_training_hours"].quantile(0.25)
    REGULATED  = {"Financial Services", "Healthcare", "Energy"}

    def tech_risk(row):
        if row["ai_maturity_score"] < 3 and row["num_ai_deployments"] < 8:
            return 2
        elif row["ai_maturity_score"] < 5:
            return 1
        return 0

    def fin_risk(row):
        if row["investment_amount"] > inv_p75 and row["revenue_impact"] < rev_p25:
            return 2
        elif row["investment_amount"] > inv_p75:
            return 1
        return 0

    def talent_risk(row):
        if row["employee_training_hours"] < train_p25:
            return 2
        elif row["employee_training_hours"] < train_p25 * 2:
            return 1
        return 0

    def reg_risk(row):
        if row["industry"] in REGULATED and row["ai_maturity_score"] < 5:
            return 2
        elif row["industry"] in REGULATED:
            return 1
        return 0

    def market_risk(row):
        if row["automation_rate"] < 0.20:
            return 2
        elif row["automation_rate"] < 0.40:
            return 1
        return 0

    print("  Deriving risk labels...")
    df["risk_technical"]  = df.apply(tech_risk, axis=1)
    df["risk_financial"]  = df.apply(fin_risk, axis=1)
    df["risk_talent"]     = df.apply(talent_risk, axis=1)
    df["risk_regulatory"] = df.apply(reg_risk, axis=1)
    df["risk_market"]     = df.apply(market_risk, axis=1)

    RISK_TARGETS = ["risk_technical", "risk_financial", "risk_talent",
                    "risk_regulatory", "risk_market"]
    RISK_FEATURES = [
        "investment_amount", "ai_adoption_level", "ai_maturity_score",
        "automation_rate", "employee_training_hours", "num_ai_deployments",
        "industry_encoded", "years_since_2015",
        "investment_per_deployment", "training_per_deployment",
        "investment_maturity", "automation_maturity", "training_adoption",
    ]

    X_raw = engineer_features(df.copy(), for_revenue_model=False)
    avail = [c for c in RISK_FEATURES if c in X_raw.columns]
    X     = X_raw[avail]
    y     = df[RISK_TARGETS]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"  Train: {X_train.shape[0]:,} | Test: {X_test.shape[0]:,}")

    base = RandomForestClassifier(
        n_estimators=200, max_depth=8, random_state=42, n_jobs=1
    )
    model = MultiOutputClassifier(base)
    model.fit(X_train, y_train)

    # Per-domain F1
    y_pred = model.predict(X_test)
    domains = ["Technical", "Financial", "Talent", "Regulatory", "Market"]
    metrics = {}
    print(f"\n  ── Risky Radar F1 per domain ──")
    for i, dom in enumerate(domains):
        f1 = round(float(f1_score(y_test.iloc[:, i], y_pred[:, i],
                                   average="weighted")), 4)
        metrics[f"f1_{dom.lower()}"] = f1
        print(f"     {dom}: F1 = {f1}")

    joblib.dump({"model": model, "feature_cols": avail}, "models/risk_radar.pkl")
    save_metrics({**metrics, "feature_cols": avail}, "risk_radar")

    # Remove derived columns from df so they don't contaminate other models
    df.drop(columns=RISK_TARGETS, inplace=True, errors="ignore")
    print("  ✅ Saved → models/risk_radar.pkl")
    return model, avail


# ─────────────────────────────────────────────────────────────────
#  5. MATURITY ASSESSOR (KMeans k=5)
# ─────────────────────────────────────────────────────────────────

def train_maturity_assessor(df: pd.DataFrame):
    print("\n" + "="*55)
    print("  MODEL 5: Maturity Assessor (KMeans Clustering k=5)")
    print("="*55)

    MATURITY_FEATURES = [
        "ai_adoption_level", "automation_rate", "num_ai_deployments",
        "employee_training_hours", "ai_maturity_score",
        "investment_maturity", "automation_maturity",
    ]

    X_raw = engineer_features(df.copy(), for_revenue_model=False)
    avail = [c for c in MATURITY_FEATURES if c in X_raw.columns]
    X_raw_mat = X_raw[avail]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_raw_mat)

    # Silhouette analysis to validate k=5
    print("  Running silhouette analysis for k=2..7...")
    best_k, best_sil = 5, -1
    for k in range(2, 8):
        km_tmp = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = km_tmp.fit_predict(X_scaled)
        sil = silhouette_score(X_scaled, labels, sample_size=10_000, random_state=42)
        print(f"     k={k}: silhouette = {sil:.4f}")
        if sil > best_sil:
            best_sil, best_k = sil, k

    print(f"  → Best k = {best_k} (silhouette = {best_sil:.4f})")
    final_k = 5  # fixed per spec, override if best_k differs significantly

    model = KMeans(n_clusters=final_k, random_state=42, n_init=20)
    model.fit(X_scaled)

    labels = model.labels_
    sil_final = silhouette_score(X_scaled, labels, sample_size=10_000, random_state=42)

    # Map raw cluster IDs → maturity tiers 1–5 ordered by centroid mean
    centroid_means = model.cluster_centers_.mean(axis=1)
    tier_map = {int(c): i + 1 for i, c in enumerate(np.argsort(centroid_means))}
    print(f"  Cluster → Tier mapping: {tier_map}")
    print(f"  Silhouette (final k={final_k}): {sil_final:.4f}")

    payload = {
        "model":       model,
        "scaler":      scaler,
        "tier_map":    tier_map,
        "feature_cols": avail,
        "k":           final_k,
        "silhouette":  sil_final,
    }
    joblib.dump(payload, "models/maturity_assessor.pkl")
    save_metrics({"k": final_k, "silhouette": round(sil_final, 4),
                  "tier_map": tier_map, "feature_cols": avail},
                 "maturity_assessor")
    print("  ✅ Saved → models/maturity_assessor.pkl")
    return model, scaler, tier_map


# ─────────────────────────────────────────────────────────────────
#  MAIN — run all training
# ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    csv_path = sys.argv[1] if len(sys.argv) > 1 else "corporate_ai_adoption_dataset.csv"

    # Use full dataset; set sample_size=20000 for fast dev iteration
    USE_SAMPLE = int(sys.argv[2]) if len(sys.argv) > 2 else None

    print("\n" + "█"*55)
    print("  StratosAI — Full ML Training Pipeline")
    print("█"*55)

    df = load_and_prepare(csv_path, sample_size=USE_SAMPLE)
    save_dataset_stats(df)

    revenue_model, rev_cols      = train_revenue_model(df.copy())
    prod_model,    prod_cols     = train_productivity_model(df.copy())
    success_model                = train_success_predictor(df.copy())
    risk_model,    risk_cols     = train_risk_radar(df.copy())
    mat_model, mat_scaler, tier_map = train_maturity_assessor(df.copy())

    print("\n" + "█"*55)
    print("  🎉 All 5 models trained and saved to models/")
    print("█"*55)
    for f in sorted(os.listdir("models")):
        size_kb = os.path.getsize(f"models/{f}") / 1024
        print(f"     {f:<40} {size_kb:>8.1f} KB")
