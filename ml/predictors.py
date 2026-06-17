# =============================================================
#  StratosAI — predictors.py
#  All derived business metrics calculated AFTER XGBoost predictions.
#  No ML model here — pure business logic formulas.
#
#  Contains:
#    - calculate_roi()
#    - calculate_transformation_score()
#    - calculate_readiness_and_risk()
#    - run_scenario_simulator()
#    - explain_prediction()  (SHAP)
# =============================================================

import numpy as np
import pandas as pd
from feature_engineering import engineer_features, REVENUE_FEATURES


# ─────────────────────────────────────────────────────────────────
#  1. ROI PREDICTOR
#  Formula: ROI (%) = ((predicted_revenue - investment) / investment) × 100
# ─────────────────────────────────────────────────────────────────

def calculate_roi(annual_predicted_revenue: float, investment_amount: float) -> dict:
    """
    Calculates ROI from the Revenue Impact Model output.

    Args:
        annual_predicted_revenue: Model 1 output (USD/year)
        investment_amount:        User's AI budget input (USD)

    Returns dict with:
        roi_percentage          — headline ROI %
        annual_net_benefit      — revenue - investment
        quarterly_revenue_impact— annual / 4
        payback_months          — months to break even
        roi_12m / roi_36m       — 1-year and 3-year ROI estimates
    """
    investment_amount = max(investment_amount, 1.0)  # avoid div-by-zero

    annual_net_benefit      = annual_predicted_revenue - investment_amount
    roi_pct                 = (annual_net_benefit / investment_amount) * 100
    quarterly_rev_impact    = annual_predicted_revenue / 4
    monthly_net             = annual_net_benefit / 12
    payback_months          = investment_amount / max(monthly_net, 0.01)

    # Multi-year projections (assume 15% annual improvement compounding)
    roi_12m = roi_pct
    roi_36m = roi_pct * (1 + 0.15) ** 2  # 3-year compounded

    return {
        "roi_percentage":           round(roi_pct, 2),
        "annual_net_benefit":       round(annual_net_benefit, 2),
        "quarterly_revenue_impact": round(quarterly_rev_impact, 2),
        "payback_months":           round(max(payback_months, 0), 1),
        "roi_12m":                  round(roi_12m, 2),
        "roi_36m":                  round(roi_36m, 2),
    }


# ─────────────────────────────────────────────────────────────────
#  2. AI TRANSFORMATION SCORE
#  Weighted composite: maturity(30%) + automation(25%) +
#                      adoption(20%) + training(15%) + deployments(10%)
# ─────────────────────────────────────────────────────────────────

def calculate_transformation_score(
    ai_adoption_level: float,        # 0.0–1.0 (raw dataset value)
    automation_rate: float,          # 0.0–1.0
    employee_training_hours: float,  # raw hours
    num_ai_deployments: int,
    ai_maturity_score: float,        # 1.0–10.0
    max_training_hours: float = 197.9,
    max_deployments:    int   = 58,
) -> float:
    """
    Produces a 0–100 score reflecting how advanced the company's
    AI transformation is. Higher = more transformed = lower risk.

    Uses the ACTUAL dataset column ranges:
      ai_adoption_level: 0.01–1.0  (not 1-5 ordinal)
      ai_maturity_score: 1.0–10.0
    """
    # Normalise each component to 0–1
    maturity_norm     = (ai_maturity_score - 1.0) / 9.0        # 1-10 → 0-1
    automation_norm   = float(automation_rate)                  # already 0-1
    adoption_scaled   = float(ai_adoption_level)                # already 0-1
    training_scaled   = min(employee_training_hours / max_training_hours, 1.0)
    deployment_scaled = min(num_ai_deployments / max_deployments, 1.0)

    score = (
        maturity_norm     * 0.30 +
        automation_norm   * 0.25 +
        adoption_scaled   * 0.20 +
        training_scaled   * 0.15 +
        deployment_scaled * 0.10
    ) * 100

    return round(score, 2)


# ─────────────────────────────────────────────────────────────────
#  3. READINESS LEVEL + RISK SCORE
# ─────────────────────────────────────────────────────────────────

def calculate_readiness_and_risk(transformation_score: float) -> dict:
    """
    Derives Readiness Level (HIGH/MEDIUM/LOW) and Risk Score (%)
    from the AI Transformation Score.

    Risk is the inverse of readiness — 80 transformation = 20% risk.
    """
    if transformation_score >= 70:
        readiness_level = "HIGH"
        readiness_color = "green"
    elif transformation_score >= 40:
        readiness_level = "MEDIUM"
        readiness_color = "amber"
    else:
        readiness_level = "LOW"
        readiness_color = "red"

    risk_score = round(100.0 - transformation_score, 2)
    risk_label = (
        "HIGH"   if risk_score >= 60 else
        "MEDIUM" if risk_score >= 30 else
        "LOW"
    )

    return {
        "readiness_level": readiness_level,
        "readiness_color": readiness_color,
        "risk_score":      risk_score,
        "risk_label":      risk_label,
        "transformation_score": transformation_score,
    }


# ─────────────────────────────────────────────────────────────────
#  4. SCENARIO SIMULATOR — BOARD DECISION MAKER
# ─────────────────────────────────────────────────────────────────

def run_scenario_simulator(
    base_investment: float,
    revenue_model,          # trained XGBRegressor
    revenue_feature_cols: list,
    feature_dict: dict,     # raw chatbot payload (pre-engineering)
) -> dict:
    """
    Runs 3 parallel predictions at 1.0×, 1.2×, 1.5× investment.
    Returns ROI per scenario + automated board recommendation.

    Args:
        base_investment:      User's original investment amount
        revenue_model:        Loaded revenue_impact_model.pkl
        revenue_feature_cols: Column list used during training
        feature_dict:         Raw input dict from chatbot
    """
    multipliers = {
        "conservative": 1.0,
        "cautious":     1.2,
        "aggressive":   1.5,
    }
    results = {}

    for scenario, mult in multipliers.items():
        scaled_inv = base_investment * mult

        # Build a fresh feature dict with scaled investment
        row = {**feature_dict, "ai_investment_usd": scaled_inv}

        # Import here to avoid circular dependency
        from feature_engineering import build_inference_row
        X = build_inference_row(row)
        X = engineer_features(X, for_revenue_model=True)
        avail = [c for c in revenue_feature_cols if c in X.columns]
        X = X[avail]

        pred_revenue = float(revenue_model.predict(X)[0])
        roi_data     = calculate_roi(pred_revenue, scaled_inv)

        results[scenario] = {
            "investment":    round(scaled_inv, 2),
            "pred_revenue":  round(pred_revenue, 2),
            "roi_pct":       roi_data["roi_percentage"],
            "payback_months": roi_data["payback_months"],
            "quarterly_impact": roi_data["quarterly_revenue_impact"],
        }

    # ── Board recommendation logic ───────────────────────────────
    base_roi = results["conservative"]["roi_pct"]
    caut_roi = results["cautious"]["roi_pct"]
    aggr_roi = results["aggressive"]["roi_pct"]

    if base_roi == 0:
        recommendation = "DELAY EXPANSION"
        confidence     = "LOW"
    elif aggr_roi >= base_roi * 1.30:
        recommendation = "APPROVE AGGRESSIVE EXPANSION"
        confidence     = "HIGH"
    elif caut_roi >= base_roi * 1.15:
        recommendation = "APPROVE CAUTIOUS EXPANSION"
        confidence     = "MEDIUM"
    else:
        recommendation = "DELAY EXPANSION"
        confidence     = "LOW"

    results["board_recommendation"] = recommendation
    results["confidence_level"]     = confidence
    return results


# ─────────────────────────────────────────────────────────────────
#  5. SHAP EXPLAINABILITY
# ─────────────────────────────────────────────────────────────────

def explain_prediction(model, X_single: pd.DataFrame) -> dict:
    """
    Returns SHAP-based explanation for a single company prediction.
    Identifies the top 5 features boosting and top 5 hurting the prediction.

    Args:
        model:    Trained XGBRegressor (revenue or productivity model)
        X_single: Single-row DataFrame with correct feature columns

    Returns dict with base_value, top_boosters, top_risks.
    """
    try:
        import shap
        explainer   = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(X_single)
        sv          = shap_values[0]

        importance = sorted(
            zip(X_single.columns.tolist(), sv),
            key=lambda x: abs(x[1]),
            reverse=True,
        )

        positives = [(f, round(float(v), 4)) for f, v in importance if v > 0][:5]
        negatives = [(f, round(float(v), 4)) for f, v in importance if v < 0][:5]

        return {
            "base_value":    round(float(explainer.expected_value), 2),
            "top_boosters":  [{"feature": f, "impact": v} for f, v in positives],
            "top_risks":     [{"feature": f, "impact": v} for f, v in negatives],
        }

    except ImportError:
        return {"error": "shap not installed — run: pip install shap"}
    except Exception as e:
        return {"error": str(e)}


# ─────────────────────────────────────────────────────────────────
#  6. RISK RADAR PREDICTOR
# ─────────────────────────────────────────────────────────────────

def predict_risk_scores(risk_model_payload: dict, X: pd.DataFrame) -> dict:
    """
    Returns 0–100 risk scores per domain.

    Supports two model formats:
      - "isolation_forest": Per-domain IsolationForest models (v2, no leakage)
      - Legacy: MultiOutputClassifier (v1, deprecated)

    Args:
        risk_model_payload: loaded dict from risk_radar.pkl
        X:                  Engineered single-row DataFrame
    """
    domains = ["technical", "financial", "talent", "regulatory", "market"]
    scores  = {}

    model_type = risk_model_payload.get("type", "legacy")

    if model_type == "isolation_forest":
        # ── New: Isolation Forest per domain ─────────────────────
        domain_models  = risk_model_payload["domain_models"]
        domain_scalers = risk_model_payload["domain_scalers"]
        domain_features = risk_model_payload["domain_features"]

        for domain in domains:
            if domain not in domain_models:
                scores[domain] = 50.0  # neutral fallback
                continue

            feats  = domain_features[domain]
            avail  = [c for c in feats if c in X.columns]
            X_in   = X[avail].copy()

            scaler = domain_scalers[domain]
            X_scaled = scaler.transform(X_in)

            iso = domain_models[domain]
            raw_score = float(iso.decision_function(X_scaled)[0])

            # decision_function: more negative = more anomalous = higher risk
            # Typical range is roughly [-0.5, 0.5] but varies.
            # We use a sigmoid-like mapping to convert to 0–100:
            #   risk = 100 / (1 + exp(10 * raw_score))
            # When raw_score = 0 → risk ≈ 50 (borderline)
            # When raw_score = -0.3 → risk ≈ 95 (high anomaly)
            # When raw_score = +0.3 → risk ≈ 5 (normal)
            import math
            risk = 100.0 / (1.0 + math.exp(10.0 * raw_score))
            scores[domain] = round(risk, 1)

    else:
        # ── Legacy: MultiOutputClassifier (kept for backward compat) ──
        model     = risk_model_payload["model"]
        feat_cols = risk_model_payload["feature_cols"]
        avail     = [c for c in feat_cols if c in X.columns]
        X_in      = X[avail]

        for i, domain in enumerate(domains):
            estimator   = model.estimators_[i]
            classes     = list(estimator.classes_)
            proba       = estimator.predict_proba(X_in)[0]

            if 2 in classes:
                high_idx = classes.index(2)
                scores[domain] = round(float(proba[high_idx]) * 100, 1)
            else:
                non_low_idx = classes.index(1) if 1 in classes else 0
                scores[domain] = round(float(proba[non_low_idx]) * 100, 1)

    # Classify each domain
    def label(s):
        return "HIGH" if s >= 70 else "MEDIUM" if s >= 40 else "LOW"

    return {
        domain: {"score": scores[domain], "label": label(scores[domain])}
        for domain in domains
    }


# ─────────────────────────────────────────────────────────────────
#  7. MATURITY ASSESSOR PREDICTOR
# ─────────────────────────────────────────────────────────────────

def assess_maturity(maturity_payload: dict, company_features: dict,
                    df_train: pd.DataFrame) -> dict:
    """
    Returns maturity tier (1-5), peer percentile, and gap analysis.

    Args:
        maturity_payload: loaded dict from maturity_assessor.pkl
        company_features: raw chatbot payload dict
        df_train:         training DataFrame for peer comparison
    """
    model     = maturity_payload["model"]
    scaler    = maturity_payload["scaler"]
    tier_map  = maturity_payload["tier_map"]
    feat_cols = maturity_payload["feature_cols"]

    from feature_engineering import build_inference_row
    X_raw = build_inference_row(company_features)
    X_eng = engineer_features(X_raw, for_revenue_model=False)
    avail = [c for c in feat_cols if c in X_eng.columns]
    X_scaled = scaler.transform(X_eng[avail])

    cluster      = int(model.predict(X_scaled)[0])
    maturity_tier = tier_map.get(cluster, 3)

    # Peer percentile: what % of companies have LOWER adoption level
    adoption_val = float(company_features.get("ai_adoption_level", 0.5))
    peer_pct = float(
        (df_train["ai_adoption_level"] < adoption_val).mean() * 100
    )

    # Gap areas: which dimensions are below median
    gap_areas = []
    medians = df_train[avail].median()
    company_vals = pd.Series(X_eng[avail].values[0], index=avail)
    for col in avail:
        if company_vals[col] < medians[col] * 0.8:  # 20% below median
            gap_areas.append(col.replace("_", " ").title())

    tier_labels = {1: "Exploring", 2: "Experimenting", 3: "Scaling",
                   4: "Optimising", 5: "Leading"}

    return {
        "maturity_tier":    maturity_tier,
        "maturity_label":   tier_labels.get(maturity_tier, "Scaling"),
        "peer_percentile":  round(peer_pct, 1),
        "gap_areas":        gap_areas[:3],  # top 3 gaps
    }


# ─────────────────────────────────────────────────────────────────
#  HELPER: extract transformation score params from raw payload
# ─────────────────────────────────────────────────────────────────

def extract_tf_params(payload: dict) -> dict:
    """Maps chatbot payload keys to calculate_transformation_score() args."""
    return {
        "ai_adoption_level":       float(payload.get("ai_adoption_level", 0.5)),
        "automation_rate":         float(payload.get("automation_rate", 0.3)),
        "employee_training_hours": float(payload.get("employee_training_hrs", 50)),
        "num_ai_deployments":      int(payload.get("num_deployments", 10)),
        "ai_maturity_score":       float(payload.get("ai_maturity_score", 5.0)),
    }
