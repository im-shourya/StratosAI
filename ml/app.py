# =============================================================
#  StratosAI — app.py
#  Flask ML Service — Port 5001
#  All endpoints per MASTER_PLAN.md:
#    POST /ml/predict/roi
#    POST /ml/predict/success
#    POST /ml/assess/risk
#    POST /ml/assess/maturity
#    POST /ml/optimize/budget
#    POST /ml/recommend
#    POST /ml/predict/full   ← convenience: all predictions in one call
#    GET  /ml/health
# =============================================================

import os
import json
import joblib
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

from data_prep          import load_and_prepare
from feature_engineering import build_inference_row, engineer_features
from predictors         import (
    calculate_roi,
    calculate_transformation_score,
    calculate_readiness_and_risk,
    run_scenario_simulator,
    explain_prediction,
    predict_risk_scores,
    assess_maturity,
    extract_tf_params,
)
from budget_optimizer   import optimize_budget, get_default_initiatives
from llm_router         import generate_narrative

app  = Flask(__name__)
CORS(app)   # allow NestJS on port 3001 to call this service

# ── Load all models at startup ───────────────────────────────────
MODELS = {}

def load_models():
    model_files = {
        "revenue":      "models/revenue_impact_model.pkl",
        "revenue_cols": "models/revenue_feature_cols.pkl",
        "productivity": "models/productivity_gain_model.pkl",
        "prod_cols":    "models/productivity_feature_cols.pkl",
        "success":      "models/success_predictor.pkl",
        "success_cols": "models/success_feature_cols.pkl",
        "risk":         "models/risk_radar.pkl",
        "maturity":     "models/maturity_assessor.pkl",
        "stats":        "models/dataset_stats.json",
    }
    for key, path in model_files.items():
        if not os.path.exists(path):
            print(f"[startup] WARNING: {path} not found — run train_models.py first")
            MODELS[key] = None
            continue
        if path.endswith(".json"):
            with open(path) as f:
                MODELS[key] = json.load(f)
        else:
            MODELS[key] = joblib.load(path)
        print(f"[startup] Loaded: {path}")

load_models()

# ── Load a small training reference for maturity peer comparison ─
DF_TRAIN_REF = None
CSV_PATH = os.getenv("DATASET_CSV", "corporate_ai_adoption_dataset.csv")
if os.path.exists(CSV_PATH):
    DF_TRAIN_REF = load_and_prepare(CSV_PATH, sample_size=10_000)
    print(f"[startup] Training reference loaded: {len(DF_TRAIN_REF):,} rows")


# ─────────────────────────────────────────────────────────────────
#  HELPER
# ─────────────────────────────────────────────────────────────────

def get_payload() -> dict:
    data = request.get_json(silent=True) or {}
    return data

def err(msg: str, code: int = 400):
    return jsonify({"error": msg}), code

def _build_features(payload: dict, for_revenue: bool) -> pd.DataFrame:
    """Build engineered feature row from chatbot payload."""
    row = build_inference_row(payload)
    return engineer_features(row, for_revenue_model=for_revenue)


@app.route("/", methods=["GET"])
def index():
    return jsonify({"message": "StratosAI ML Engine is running successfully on Hugging Face!", "status": "active"}), 200

# ─────────────────────────────────────────────────────────────────
#  GET /ml/health
# ─────────────────────────────────────────────────────────────────

@app.route("/ml/health", methods=["GET"])
def health():
    loaded = {k: (v is not None) for k, v in MODELS.items()}
    all_ok = all(loaded.values())
    return jsonify({
        "status":  "healthy" if all_ok else "degraded",
        "models":  loaded,
        "dataset": DF_TRAIN_REF is not None,
    }), 200 if all_ok else 206


# ─────────────────────────────────────────────────────────────────
#  POST /ml/predict/roi
# ─────────────────────────────────────────────────────────────────

@app.route("/ml/predict/roi", methods=["POST"])
def predict_roi():
    """
    Input (JSON):
        ai_investment_usd, ai_adoption_level, automation_rate,
        employee_training_hrs, ai_maturity_score, num_deployments,
        industry, country, year

    Output:
        roi_percentage, roi_12m, roi_36m, annual_net_benefit,
        payback_months, quarterly_revenue_impact,
        transformation_score, readiness_level, risk_score
    """
    p = get_payload()
    if not p:
        return err("No JSON body received")

    if MODELS["revenue"] is None:
        return err("Revenue model not loaded — run train_models.py", 503)

    X     = _build_features(p, for_revenue=True)
    cols  = MODELS["revenue_cols"]
    avail = [c for c in cols if c in X.columns]
    X_in  = X[avail]

    pred_revenue = float(MODELS["revenue"].predict(X_in)[0])
    investment   = float(p.get("ai_investment_usd", 1_000_000))

    roi_data = calculate_roi(pred_revenue, investment)

    tf_params = extract_tf_params(p)
    stats     = MODELS.get("stats") or {}
    tf_score  = calculate_transformation_score(
        **tf_params,
        max_training_hours = stats.get("max_training_hours", 197.9),
        max_deployments    = stats.get("max_deployments",    58),
    )
    readiness = calculate_readiness_and_risk(tf_score)

    return jsonify({
        **roi_data,
        "transformation_score": tf_score,
        **readiness,
        "predicted_revenue":    round(pred_revenue, 2),
    })


# ─────────────────────────────────────────────────────────────────
#  POST /ml/predict/success
# ─────────────────────────────────────────────────────────────────

@app.route("/ml/predict/success", methods=["POST"])
def predict_success():
    """
    Output:
        success_probability (0-100%)
        success_label (High / Medium / Low)
        confidence
    """
    p = get_payload()

    if MODELS["success"] is None:
        return err("Success model not loaded", 503)

    X     = _build_features(p, for_revenue=False)
    cols  = MODELS["success_cols"]
    avail = [c for c in cols if c in X.columns]
    X_in  = X[avail]

    prob       = float(MODELS["success"].predict_proba(X_in)[0][1])
    prob_pct   = round(prob * 100, 1)
    label      = "High" if prob_pct >= 65 else "Medium" if prob_pct >= 40 else "Low"
    confidence = "HIGH" if abs(prob - 0.5) > 0.25 else "MEDIUM" if abs(prob - 0.5) > 0.10 else "LOW"

    return jsonify({
        "success_probability": prob_pct,
        "success_label":       label,
        "confidence":          confidence,
    })


# ─────────────────────────────────────────────────────────────────
#  POST /ml/assess/risk
# ─────────────────────────────────────────────────────────────────

@app.route("/ml/assess/risk", methods=["POST"])
def assess_risk():
    """
    Output:
        risk_scores: {technical, financial, talent, regulatory, market}
        each with {score (0-100), label (HIGH/MEDIUM/LOW)}
        overall_risk: HIGH/MEDIUM/LOW
    """
    p = get_payload()

    if MODELS["risk"] is None:
        return err("Risk model not loaded", 503)

    X      = _build_features(p, for_revenue=False)
    scores = predict_risk_scores(MODELS["risk"], X)

    high_count   = sum(1 for v in scores.values() if v["label"] == "HIGH")
    overall_risk = "HIGH" if high_count >= 2 else "MEDIUM" if high_count == 1 else "LOW"

    return jsonify({
        "risk_scores":  scores,
        "overall_risk": overall_risk,
    })


# ─────────────────────────────────────────────────────────────────
#  POST /ml/assess/maturity
# ─────────────────────────────────────────────────────────────────

@app.route("/ml/assess/maturity", methods=["POST"])
def assess_maturity_endpoint():
    p = get_payload()
    if MODELS["maturity"] is None:
        return err("Maturity model not loaded", 503)
    try:
        if DF_TRAIN_REF is not None:
            result = assess_maturity(MODELS["maturity"], p, DF_TRAIN_REF)
        else:
            # Fallback if training ref not loaded
            adoption = float(p.get("ai_adoption_level", 0.5))
            maturity_score = float(p.get("ai_maturity_score", 5.0))
            tier = max(1, min(5, int(round(maturity_score / 2))))
            labels = {1:"Exploring",2:"Experimenting",3:"Scaling",4:"Optimising",5:"Leading"}
            result = {
                "maturity_tier": tier,
                "maturity_label": labels[tier],
                "peer_percentile": round(adoption * 100, 1),
                "gap_areas": [],
            }
        return jsonify(result)
    except Exception as e:
        # Safe fallback
        maturity_score = float(p.get("ai_maturity_score", 5.0))
        tier = max(1, min(5, int(round(maturity_score / 2))))
        labels = {1:"Exploring",2:"Experimenting",3:"Scaling",4:"Optimising",5:"Leading"}
        return jsonify({
            "maturity_tier": tier,
            "maturity_label": labels[tier],
            "peer_percentile": 50.0,
            "gap_areas": [],
        })


# ─────────────────────────────────────────────────────────────────
#  POST /ml/optimize/budget
# ─────────────────────────────────────────────────────────────────

@app.route("/ml/optimize/budget", methods=["POST"])
def optimize_budget_endpoint():
    """
    Input:
        total_budget      float  — total AI investment
        industry          str    — to select default initiatives
        risk_tolerance    float  — 0.0-1.0 (default 0.5)
        initiatives       list   — optional: [{name, cost, roi, risk_score}]

    Output:
        allocations: [{name, allocated_budget, allocation_pct,
                       expected_roi, risk_score, risk_label}]
        total_allocated
        expected_portfolio_roi
    """
    p = get_payload()

    total_budget   = float(p.get("total_budget",   p.get("ai_investment_usd", 1_000_000)))
    industry       = str(p.get("industry",          "Technology"))
    risk_tolerance = float(p.get("risk_tolerance", 0.5))
    initiatives    = p.get("initiatives", None)

    if not initiatives:
        initiatives = get_default_initiatives(industry, total_budget)

    allocations = optimize_budget(initiatives, total_budget, risk_tolerance)

    total_allocated      = sum(a["allocated_budget"] for a in allocations)
    portfolio_roi        = sum(a["expected_roi"]     for a in allocations)

    return jsonify({
        "allocations":           allocations,
        "total_allocated":       round(total_allocated, 2),
        "expected_portfolio_roi": round(portfolio_roi, 3),
        "industry":              industry,
    })


# ─────────────────────────────────────────────────────────────────
#  POST /ml/recommend
# ─────────────────────────────────────────────────────────────────

@app.route("/ml/recommend", methods=["POST"])
def recommend():
    """
    Input:
        company_profile  dict — chatbot answers
        ml_results       dict — output from /ml/predict/full

    Output:
        response         dict — parsed LLM JSON recommendation
        source           str  — "ollama" | "gemini" | "claude" | "rule_engine"
        model            str  — model name used
    """
    p               = get_payload()
    company_profile = p.get("company_profile", p)
    ml_results      = p.get("ml_results",      {})

    result = generate_narrative(company_profile, ml_results)
    return jsonify(result)


# ─────────────────────────────────────────────────────────────────
#  POST /ml/predict/full  ← convenience endpoint
#  Calls all 5 models + scenario simulator + LLM in one request.
#  This is what NestJS calls from /api/assessments/:id/analyze
# ─────────────────────────────────────────────────────────────────

@app.route("/ml/predict/full", methods=["POST"])
def predict_full():
    """
    Single convenience endpoint — runs all models, returns the
    complete StratosAI report payload.

    Input: Same chatbot payload as all other endpoints.
    Output: Full report JSON (roi, productivity, success, risk,
            maturity, scenarios, budget, llm_recommendation)
    """
    p          = get_payload()
    investment = float(p.get("ai_investment_usd", 1_000_000))
    industry   = str(p.get("industry", "Technology"))
    stats      = MODELS.get("stats") or {}

    # ── 1. Revenue Impact ──────────────────────────────────────
    roi_data = {}
    tf_score = 0.0
    readiness = {}
    if MODELS["revenue"]:
        X    = _build_features(p, for_revenue=True)
        cols = MODELS["revenue_cols"]
        avail = [c for c in cols if c in X.columns]
        pred_rev = float(MODELS["revenue"].predict(X[avail])[0])
        roi_data  = calculate_roi(pred_rev, investment)

        tf_params = extract_tf_params(p)
        tf_score  = calculate_transformation_score(
            **tf_params,
            max_training_hours=stats.get("max_training_hours", 197.9),
            max_deployments   =stats.get("max_deployments",    58),
        )
        readiness = calculate_readiness_and_risk(tf_score)

    # ── 2. Productivity ────────────────────────────────────────
    prod_data = {}
    if MODELS["productivity"]:
        X    = _build_features(p, for_revenue=False)
        cols = MODELS["prod_cols"]
        avail = [c for c in cols if c in X.columns]
        prod_data = {
            "predicted_productivity_gain": round(
                float(MODELS["productivity"].predict(X[avail])[0]), 2)
        }

    # ── 3. Success Probability ─────────────────────────────────
    success_data = {}
    if MODELS["success"]:
        X    = _build_features(p, for_revenue=False)
        cols = MODELS["success_cols"]
        avail = [c for c in cols if c in X.columns]
        prob  = float(MODELS["success"].predict_proba(X[avail])[0][1])
        success_data = {
            "success_probability": round(prob * 100, 1),
            "success_label": "High" if prob >= 0.65 else "Medium" if prob >= 0.40 else "Low",
        }

    # ── 4. Risk Radar ──────────────────────────────────────────
    risk_data = {}
    if MODELS["risk"]:
        X = _build_features(p, for_revenue=False)
        risk_scores = predict_risk_scores(MODELS["risk"], X)
        high_count  = sum(1 for v in risk_scores.values() if v["label"] == "HIGH")
        risk_data   = {
            "risk_scores":  risk_scores,
            "overall_risk": "HIGH" if high_count >= 2 else "MEDIUM" if high_count == 1 else "LOW",
        }

    # ── 5. Maturity ────────────────────────────────────────────
    maturity_data = {}
    try:
        if MODELS["maturity"] and DF_TRAIN_REF is not None:
            maturity_data = assess_maturity(MODELS["maturity"], p, DF_TRAIN_REF)
        else:
            maturity_score = float(p.get("ai_maturity_score", 5.0))
            tier = max(1, min(5, int(round(maturity_score / 2))))
            labels = {1:"Exploring",2:"Experimenting",3:"Scaling",4:"Optimising",5:"Leading"}
            maturity_data = {"maturity_tier": tier, "maturity_label": labels[tier],
                             "peer_percentile": 50.0, "gap_areas": []}
    except Exception:
        maturity_score = float(p.get("ai_maturity_score", 5.0))
        tier = max(1, min(5, int(round(maturity_score / 2))))
        labels = {1:"Exploring",2:"Experimenting",3:"Scaling",4:"Optimising",5:"Leading"}
        maturity_data = {"maturity_tier": tier, "maturity_label": labels[tier],
                         "peer_percentile": 50.0, "gap_areas": []}

    # ── 6. Scenario Simulator ──────────────────────────────────
    scenario_data = {}
    try:
        if MODELS["revenue"] and MODELS["revenue_cols"]:
            scenario_data = run_scenario_simulator(
                base_investment      = investment,
                revenue_model        = MODELS["revenue"],
                revenue_feature_cols = MODELS["revenue_cols"],
                feature_dict         = p,
            )
    except Exception:
        scenario_data = {"board_recommendation": "DELAY EXPANSION", "confidence_level": "LOW"}

    # ── 7. Budget Optimiser ────────────────────────────────────
    initiatives = get_default_initiatives(industry, investment)
    budget_data = optimize_budget(
        initiatives,
        investment,
        risk_tolerance=float(p.get("risk_tolerance", 0.5)),
    )

    # ── 8. LLM Narrative ──────────────────────────────────────
    ml_results_for_llm = {
        "roi":         roi_data,
        "readiness":   {**readiness, "transformation_score": tf_score},
        "risk_scores": risk_data.get("risk_scores", {}),
        "scenarios":   scenario_data,
        "maturity":    maturity_data,
    }
    llm_result = generate_narrative(p, ml_results_for_llm)

    # ── Assemble full report ───────────────────────────────────
    return jsonify({
        "roi":                 roi_data,
        "productivity":        prod_data,
        "success":             success_data,
        "risk":                risk_data,
        "maturity":            maturity_data,
        "transformation_score": tf_score,
        "readiness":           readiness,
        "scenarios":           scenario_data,
        "budget_allocation":   budget_data,
        "llm_recommendation":  llm_result.get("response", {}),
        "llm_source":          llm_result.get("source", "unknown"),
        "llm_model":           llm_result.get("model", "unknown"),
    })


# ─────────────────────────────────────────────────────────────────
#  ERROR HANDLERS
# ─────────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────
#  ENTRY POINT
# ─────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    PORT  = int(os.getenv("PORT", 5001))
    DEBUG = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    print(f"\n🚀 StratosAI ML Service starting on port {PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
