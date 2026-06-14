# =============================================================
#  StratosAI — budget_optimizer.py
#  Linear Programming budget allocation across AI initiatives.
#  Uses scipy.optimize.linprog (HiGHS solver).
#  No ML model — pure operations research.
# =============================================================

import numpy as np
from scipy.optimize import linprog


# ── Default initiatives library ──────────────────────────────────
# Used when the user hasn't provided their own initiative list.
# ROI and risk_score are baseline estimates; XGBoost predictions
# override these at runtime when available.
DEFAULT_INITIATIVES = {
    "Financial Services": [
        {"name": "Fraud Detection ML",          "cost_pct": 0.40, "roi": 2.8, "risk_score": 35},
        {"name": "Customer Churn Predictor",    "cost_pct": 0.30, "roi": 2.1, "risk_score": 28},
        {"name": "Process Automation (RPA+AI)", "cost_pct": 0.20, "roi": 1.6, "risk_score": 20},
        {"name": "Talent & Training Reserve",   "cost_pct": 0.10, "roi": 0.8, "risk_score": 10},
    ],
    "Healthcare": [
        {"name": "Diagnostic AI (Imaging)",     "cost_pct": 0.45, "roi": 3.1, "risk_score": 55},
        {"name": "Patient Flow Optimizer",      "cost_pct": 0.25, "roi": 1.8, "risk_score": 30},
        {"name": "EHR NLP Extraction",          "cost_pct": 0.20, "roi": 1.5, "risk_score": 25},
        {"name": "Staff Training + Upskilling", "cost_pct": 0.10, "roi": 0.7, "risk_score": 10},
    ],
    "Retail": [
        {"name": "Demand Forecasting ML",       "cost_pct": 0.35, "roi": 2.4, "risk_score": 30},
        {"name": "Personalisation Engine",      "cost_pct": 0.30, "roi": 2.0, "risk_score": 35},
        {"name": "Inventory Optimisation",      "cost_pct": 0.25, "roi": 1.7, "risk_score": 22},
        {"name": "Chatbot Customer Service",    "cost_pct": 0.10, "roi": 0.9, "risk_score": 15},
    ],
    "Manufacturing": [
        {"name": "Predictive Maintenance AI",   "cost_pct": 0.40, "roi": 2.9, "risk_score": 40},
        {"name": "Quality Control Vision AI",   "cost_pct": 0.30, "roi": 2.2, "risk_score": 35},
        {"name": "Supply Chain Optimiser",      "cost_pct": 0.20, "roi": 1.5, "risk_score": 28},
        {"name": "Workforce Planning AI",       "cost_pct": 0.10, "roi": 0.8, "risk_score": 15},
    ],
    "Technology": [
        {"name": "Code Review AI (Copilot)",    "cost_pct": 0.30, "roi": 2.5, "risk_score": 20},
        {"name": "Customer Success Predictor",  "cost_pct": 0.30, "roi": 2.2, "risk_score": 28},
        {"name": "MLOps & Retraining Pipeline", "cost_pct": 0.25, "roi": 1.8, "risk_score": 30},
        {"name": "AI Talent & Upskilling",      "cost_pct": 0.15, "roi": 1.0, "risk_score": 12},
    ],
    "Logistics": [
        {"name": "Route Optimisation AI",       "cost_pct": 0.40, "roi": 2.7, "risk_score": 30},
        {"name": "Demand Signal Processing",    "cost_pct": 0.25, "roi": 1.9, "risk_score": 25},
        {"name": "Warehouse Robotics AI",       "cost_pct": 0.25, "roi": 2.1, "risk_score": 45},
        {"name": "Driver Coaching AI",          "cost_pct": 0.10, "roi": 0.9, "risk_score": 20},
    ],
    "Energy": [
        {"name": "Grid Optimisation ML",        "cost_pct": 0.40, "roi": 2.6, "risk_score": 50},
        {"name": "Predictive Asset Failure",    "cost_pct": 0.30, "roi": 2.3, "risk_score": 40},
        {"name": "Energy Demand Forecasting",   "cost_pct": 0.20, "roi": 1.7, "risk_score": 30},
        {"name": "Compliance AI",               "cost_pct": 0.10, "roi": 0.7, "risk_score": 25},
    ],
    "Education": [
        {"name": "Adaptive Learning Engine",    "cost_pct": 0.40, "roi": 1.9, "risk_score": 30},
        {"name": "Student Success Predictor",   "cost_pct": 0.30, "roi": 1.5, "risk_score": 25},
        {"name": "Content Recommendation AI",   "cost_pct": 0.20, "roi": 1.2, "risk_score": 20},
        {"name": "Admin Automation (NLP)",      "cost_pct": 0.10, "roi": 0.8, "risk_score": 15},
    ],
}
# Default for industries not explicitly listed
DEFAULT_INITIATIVES["Agriculture"] = DEFAULT_INITIATIVES["Manufacturing"]
DEFAULT_INITIATIVES["Telecom"]     = DEFAULT_INITIATIVES["Technology"]


def optimize_budget(
    initiatives: list,
    total_budget: float,
    risk_tolerance: float = 0.5,
) -> list:
    """
    Maximises risk-adjusted portfolio ROI across AI initiatives
    using scipy Linear Programming (HiGHS solver).

    Args:
        initiatives:     List of dicts:
                         [{name, cost, roi, risk_score (0-100)}, ...]
        total_budget:    Total available AI budget (USD)
        risk_tolerance:  0.0 = fully risk-averse, 1.0 = risk-neutral
                         Modulates how much risk penalises the objective.

    Returns:
        List of allocation dicts sorted by expected ROI descending:
        [{name, allocated_budget, allocation_pct, expected_roi, risk_score}]
    """
    n     = len(initiatives)
    costs = np.array([float(i["cost"])      for i in initiatives])
    rois  = np.array([float(i["roi"])       for i in initiatives])
    risks = np.array([float(i["risk_score"]) / 100.0 for i in initiatives])

    # Risk-adjusted ROI per initiative
    adj_roi = rois * (1.0 - risks * (1.0 - risk_tolerance))

    # linprog minimises — negate to maximise
    c = -adj_roi

    # Constraint: sum of (cost × allocation) ≤ total_budget
    A_ub = [costs.tolist()]
    b_ub = [total_budget]

    # Each x[i] ∈ [0, 1] = proportion of initiative cost allocated
    bounds = [(0.0, 1.0)] * n

    result = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

    if result.status != 0:
        # Fallback: proportional allocation if LP fails
        return _fallback_allocation(initiatives, total_budget)

    allocations = []
    for i, x in enumerate(result.x):
        if x > 0.04:  # skip allocations < 4%
            alloc_budget = costs[i] * x
            allocations.append({
                "name":             initiatives[i]["name"],
                "allocated_budget": round(alloc_budget, 2),
                "allocation_pct":   round(x * 100, 1),
                "expected_roi":     round(float(rois[i] * x), 3),
                "risk_score":       int(initiatives[i]["risk_score"]),
                "risk_label":       _risk_label(initiatives[i]["risk_score"]),
            })

    return sorted(allocations, key=lambda a: a["expected_roi"], reverse=True)


def get_default_initiatives(industry: str, total_budget: float) -> list:
    """
    Returns the default initiative set for an industry with costs
    calculated from the budget and cost_pct splits.
    """
    templates = DEFAULT_INITIATIVES.get(industry, DEFAULT_INITIATIVES["Technology"])
    return [
        {
            "name":       t["name"],
            "cost":       round(total_budget * t["cost_pct"], 2),
            "roi":        t["roi"],
            "risk_score": t["risk_score"],
        }
        for t in templates
    ]


def _fallback_allocation(initiatives: list, total_budget: float) -> list:
    """Simple proportional fallback if LP solver fails."""
    total_cost = sum(i["cost"] for i in initiatives)
    scale      = min(1.0, total_budget / max(total_cost, 1))
    return [
        {
            "name":             i["name"],
            "allocated_budget": round(i["cost"] * scale, 2),
            "allocation_pct":   round(scale * 100, 1),
            "expected_roi":     round(i["roi"] * scale, 3),
            "risk_score":       i["risk_score"],
            "risk_label":       _risk_label(i["risk_score"]),
        }
        for i in initiatives
    ]


def _risk_label(score: float) -> str:
    return "HIGH" if score >= 70 else "MEDIUM" if score >= 40 else "LOW"


# ── Quick test ───────────────────────────────────────────────────
if __name__ == "__main__":
    budget     = 300_000
    industry   = "Financial Services"
    initiatives = get_default_initiatives(industry, budget)

    print(f"Industry: {industry} | Budget: ${budget:,}")
    print(f"Initiatives: {[i['name'] for i in initiatives]}\n")

    result = optimize_budget(initiatives, budget, risk_tolerance=0.4)

    print("Optimised Allocation:")
    for a in result:
        print(f"  {a['name']:<35} "
              f"${a['allocated_budget']:>9,.0f}  "
              f"({a['allocation_pct']:.1f}%)  "
              f"ROI×{a['expected_roi']:.2f}  "
              f"Risk: {a['risk_label']}")
