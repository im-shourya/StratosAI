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
#  4. RISKY RADAR (Isolation Forest — Unsupervised Anomaly Detection)
#
#  The previous approach derived risk labels deterministically from
#  the same features used for training (e.g., talent risk = low
#  training hours, then trained a classifier to predict that from
#  training hours). This caused perfect F1 scores (1.0) due to
#  data leakage / circular label definition.
#
#  New approach: One IsolationForest per risk domain, each trained
#  on semantically relevant features. Anomaly scores (0–100) are
#  used as risk scores. No self-referential labels.
# ─────────────────────────────────────────────────────────────────

def train_risk_radar(df: pd.DataFrame):
    """
    Train 5 separate IsolationForest models — one per risk domain.

    Each domain uses a curated subset of features that are
    semantically relevant to that domain but do NOT create a
    trivial deterministic relationship.

    Domain → Features:
      Technical:  adoption, training, years_since_2015, industry
      Financial:  investment_amount, investment_per_deployment, years_since_2015
      Talent:     adoption, automation_rate, num_deployments, industry
      Regulatory: industry_encoded, adoption, years_since_2015
      Market:     adoption, training, investment_amount, num_deployments, years_since_2015
    """
    from sklearn.ensemble import IsolationForest

    print("\n" + "="*55)
    print("  MODEL 4: Risky Radar (Isolation Forest — Unsupervised)")
    print("="*55)

    X_eng = engineer_features(df.copy(), for_revenue_model=False)

    # Feature sets per domain — intentionally exclude the "obvious"
    # feature that would trivially define risk for that domain.
    DOMAIN_FEATURES = {
        "technical": [
            "ai_adoption_level", "employee_training_hours",
            "years_since_2015", "industry_encoded",
            "investment_per_deployment", "training_adoption",
        ],
        "financial": [
            "investment_amount", "investment_per_deployment",
            "years_since_2015", "ai_adoption_level",
            "automation_maturity",
        ],
        "talent": [
            "ai_adoption_level", "automation_rate",
            "num_ai_deployments", "industry_encoded",
            "automation_maturity",
        ],
        "regulatory": [
            "industry_encoded", "ai_adoption_level",
            "years_since_2015", "num_ai_deployments",
        ],
        "market": [
            "ai_adoption_level", "employee_training_hours",
            "investment_amount", "num_ai_deployments",
            "years_since_2015", "training_per_deployment",
        ],
    }

    # Collect all unique features used across domains
    all_features = sorted(set(
        f for feats in DOMAIN_FEATURES.values() for f in feats
    ))

    domain_models  = {}
    domain_scalers = {}
    metrics        = {}

    for domain, feats in DOMAIN_FEATURES.items():
        avail = [c for c in feats if c in X_eng.columns]
        X_domain = X_eng[avail].copy()

        # Scale features per domain for stable anomaly scoring
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_domain)

        iso = IsolationForest(
            n_estimators=200,
            contamination=0.15,   # ~15% of companies are "high risk"
            random_state=42,
            n_jobs=1,
        )
        iso.fit(X_scaled)

        # Compute anomaly scores: decision_function returns negative
        # for anomalies, positive for inliers. We invert and scale to 0–100.
        raw_scores = iso.decision_function(X_scaled)
        # Lower decision_function → more anomalous → higher risk
        min_s, max_s = raw_scores.min(), raw_scores.max()
        risk_scores = (1.0 - (raw_scores - min_s) / (max_s - min_s + 1e-8)) * 100

        mean_risk = float(risk_scores.mean())
        std_risk  = float(risk_scores.std())
        metrics[f"mean_risk_{domain}"] = round(mean_risk, 2)
        metrics[f"std_risk_{domain}"]  = round(std_risk, 2)

        domain_models[domain]  = iso
        domain_scalers[domain] = scaler

        print(f"     {domain.title():>12}: mean_risk={mean_risk:.1f}  "
              f"std={std_risk:.1f}  features={len(avail)}")

    payload = {
        "type":           "isolation_forest",
        "domain_models":  domain_models,
        "domain_scalers": domain_scalers,
        "domain_features": DOMAIN_FEATURES,
        "all_features":   all_features,
    }
    joblib.dump(payload, "models/risk_radar.pkl")
    save_metrics({**metrics, "domain_features": DOMAIN_FEATURES}, "risk_radar")

    print("  ✅ Saved → models/risk_radar.pkl")
    return domain_models, all_features


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
