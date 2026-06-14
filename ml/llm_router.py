# =============================================================
#  StratosAI — llm_router.py
#  3-tier LLM fallback chain:
#    Tier 1: Ollama (local — free, private)
#    Tier 2: Google Gemini API (cloud fallback)
#    Tier 3: Anthropic Claude API (final fallback)
#
#  Usage:
#    from llm_router import generate_narrative
#    result = generate_narrative(ml_payload, company_profile)
# =============================================================

import os
import json
import requests
import traceback

# ── Environment variables (.env file or Railway dashboard) ──────
OLLAMA_BASE_URL  = os.getenv("OLLAMA_BASE_URL",  "http://localhost:11434")
OLLAMA_MODEL     = os.getenv("OLLAMA_MODEL",     "llama3")         # or mistral, gemma2:2b
GEMINI_API_KEY   = os.getenv("GEMINI_API_KEY",   "")
CLAUDE_API_KEY   = os.getenv("ANTHROPIC_API_KEY","")
LLM_TIMEOUT_SEC  = int(os.getenv("LLM_TIMEOUT",  "45"))


# ─────────────────────────────────────────────────────────────────
#  PROMPT BUILDER
# ─────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are StratosAI, an expert Corporate AI Investment Advisor with 20 years of enterprise experience.
You analyse AI investment data and generate precise, board-ready strategic recommendations.

STRICT OUTPUT RULES:
1. Respond ONLY in valid JSON — no markdown, no preamble, no trailing text.
2. Use exactly these keys: summary, top_risks, quick_wins, twelve_month_roadmap, budget_verdict, overall_risk
3. top_risks, quick_wins, twelve_month_roadmap must be arrays of strings (3-4 items each).
4. Be specific to the company's numbers — no generic advice.
5. summary must be exactly 2 sentences.
"""


def build_prompt(company_profile: dict, ml_results: dict) -> str:
    """
    Constructs the full prompt string to send to any LLM.
    Combines company profile from chatbot with ML predictions.

    Args:
        company_profile: Raw chatbot answers dict
        ml_results:      Full prediction payload from Flask /ml/predict/full
    """
    industry   = company_profile.get("industry",        "Technology")
    investment = company_profile.get("ai_investment_usd", 1_000_000)
    maturity   = company_profile.get("ai_maturity_score", 5.0)

    roi         = ml_results.get("roi", {})
    readiness   = ml_results.get("readiness", {})
    risk_scores = ml_results.get("risk_scores", {})
    maturity_r  = ml_results.get("maturity", {})
    scenarios   = ml_results.get("scenarios", {})

    high_risks = [
        domain.title()
        for domain, info in risk_scores.items()
        if isinstance(info, dict) and info.get("label") == "HIGH"
    ]

    return f"""{SYSTEM_PROMPT}

COMPANY PROFILE:
  Industry:         {industry}
  AI Investment:    ${investment:,.0f}
  AI Maturity Score:{maturity}/10
  Maturity Tier:    {maturity_r.get('maturity_label', 'N/A')} (Tier {maturity_r.get('maturity_tier', '?')}/5)
  Peer Percentile:  {maturity_r.get('peer_percentile', 50)}th percentile

ML MODEL PREDICTIONS:
  Predicted ROI (12M):       {roi.get('roi_12m', 'N/A')}%
  Predicted ROI (36M):       {roi.get('roi_36m', 'N/A')}%
  Annual Net Benefit:        ${roi.get('annual_net_benefit', 0):,.0f}
  Payback Period:            {roi.get('payback_months', 'N/A')} months
  Quarterly Revenue Impact:  ${roi.get('quarterly_revenue_impact', 0):,.0f}
  Readiness Level:           {readiness.get('readiness_level', 'N/A')}
  Risk Score:                {readiness.get('risk_score', 'N/A')}/100
  Transformation Score:      {readiness.get('transformation_score', 'N/A')}/100
  HIGH Risk Domains:         {', '.join(high_risks) if high_risks else 'None'}

SCENARIO ANALYSIS:
  Conservative (1.0×): ROI = {scenarios.get('conservative', {}).get('roi_pct', 'N/A')}%
  Cautious (1.2×):     ROI = {scenarios.get('cautious', {}).get('roi_pct', 'N/A')}%
  Aggressive (1.5×):   ROI = {scenarios.get('aggressive', {}).get('roi_pct', 'N/A')}%
  Board Decision:      {scenarios.get('board_recommendation', 'N/A')}

Generate a concise board-level AI strategy recommendation in JSON format.
"""


# ─────────────────────────────────────────────────────────────────
#  TIER 1: OLLAMA (local, free, private)
# ─────────────────────────────────────────────────────────────────

def _call_ollama(prompt: str) -> str:
    """
    Calls the local Ollama server.
    Setup: ollama pull llama3 (or mistral / gemma2:2b)
    """
    url  = f"{OLLAMA_BASE_URL}/api/generate"
    body = {
        "model":  OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": 0.3,   # low temp for consistent JSON
            "top_p": 0.9,
        },
    }
    resp = requests.post(url, json=body, timeout=LLM_TIMEOUT_SEC)
    resp.raise_for_status()
    return resp.json()["response"].strip()


# ─────────────────────────────────────────────────────────────────
#  TIER 2: GOOGLE GEMINI (cloud fallback)
# ─────────────────────────────────────────────────────────────────

def _call_gemini(prompt: str) -> str:
    """
    Calls the Gemini 1.5 Flash API.
    Requires: GEMINI_API_KEY env var
    """
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY not set")

    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    model    = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.3,
            max_output_tokens=800,
        ),
    )
    return response.text.strip()


# ─────────────────────────────────────────────────────────────────
#  TIER 3: CLAUDE API (final fallback — claude-sonnet-4-6)
# ─────────────────────────────────────────────────────────────────

def _call_claude(prompt: str) -> str:
    """
    Calls Anthropic Claude claude-sonnet-4-6 as the final fallback.
    Requires: ANTHROPIC_API_KEY env var
    """
    if not CLAUDE_API_KEY:
        raise ValueError("ANTHROPIC_API_KEY not set")

    headers = {
        "x-api-key":         CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type":      "application/json",
    }
    body = {
        "model":      "claude-sonnet-4-6",
        "max_tokens": 800,
        "messages":   [{"role": "user", "content": prompt}],
    }
    resp = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers=headers,
        json=body,
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["content"][0]["text"].strip()


# ─────────────────────────────────────────────────────────────────
#  ROUTER — tries each tier in order
# ─────────────────────────────────────────────────────────────────

def _parse_json_response(raw: str) -> dict:
    """
    Safely parse LLM response as JSON.
    Strips markdown code fences if the LLM wrapped the JSON.
    """
    clean = raw.strip()
    # Strip ```json ... ``` if present
    if clean.startswith("```"):
        lines = clean.split("\n")
        clean = "\n".join(lines[1:-1] if lines[-1] == "```" else lines[1:])
    return json.loads(clean)


def generate_narrative(company_profile: dict, ml_results: dict) -> dict:
    """
    Main entry point. Builds the prompt, tries Ollama → Gemini → Claude.
    Returns a dict with keys:
        response     — parsed JSON recommendation dict
        raw          — raw LLM string output
        source       — "ollama" | "gemini" | "claude"
        model        — model name used
        error        — error message if all tiers failed
    """
    prompt = build_prompt(company_profile, ml_results)
    tiers  = [
        ("ollama",  _call_ollama,  OLLAMA_MODEL),
        ("gemini",  _call_gemini,  "gemini-1.5-flash"),
        ("claude",  _call_claude,  "claude-sonnet-4-6"),
    ]

    for source, fn, model_name in tiers:
        try:
            print(f"[LLMRouter] Trying {source} ({model_name})...")
            raw      = fn(prompt)
            parsed   = _parse_json_response(raw)
            print(f"[LLMRouter] ✅ Success via {source}")
            return {
                "response": parsed,
                "raw":      raw,
                "source":   source,
                "model":    model_name,
            }
        except json.JSONDecodeError as e:
            print(f"[LLMRouter] {source} returned non-JSON: {e} — trying next tier")
        except requests.exceptions.ConnectionError:
            print(f"[LLMRouter] {source} not reachable — trying next tier")
        except requests.exceptions.Timeout:
            print(f"[LLMRouter] {source} timed out ({LLM_TIMEOUT_SEC}s) — trying next tier")
        except Exception as e:
            print(f"[LLMRouter] {source} error: {e} — trying next tier")

    # All tiers failed — return a rule-based fallback
    print("[LLMRouter] All tiers failed — using rule-based fallback")
    return {
        "response": _rule_based_fallback(ml_results),
        "raw":      "{}",
        "source":   "rule_engine",
        "model":    "fallback",
    }


def _rule_based_fallback(ml_results: dict) -> dict:
    """
    Pure Python rule-based narrative when all LLMs fail.
    Guarantees the API always returns a usable response.
    """
    roi         = ml_results.get("roi", {})
    readiness   = ml_results.get("readiness", {})
    risk_scores = ml_results.get("risk_scores", {})
    scenarios   = ml_results.get("scenarios", {})

    roi_pct  = roi.get("roi_percentage", 0)
    rl       = readiness.get("readiness_level", "MEDIUM")
    board    = scenarios.get("board_recommendation", "DELAY EXPANSION")

    high_domains = [
        d.title() for d, v in risk_scores.items()
        if isinstance(v, dict) and v.get("label") == "HIGH"
    ]

    return {
        "summary": (
            f"The AI initiative shows a projected ROI of {roi_pct:.1f}% "
            f"with {rl} organisational readiness. "
            f"Board recommendation: {board}."
        ),
        "top_risks": high_domains if high_domains else [
            "Insufficient training investment",
            "Low automation baseline",
            "Undefined success metrics",
        ],
        "quick_wins": [
            "Run a 90-day AI pilot in the highest-ROI use case",
            "Establish data quality baseline across all business units",
            "Assign a dedicated AI programme manager",
        ],
        "twelve_month_roadmap": [
            "Q1: Data audit and infrastructure readiness",
            "Q2: Pilot programme launch and KPI definition",
            "Q3: Scale successful pilots organisation-wide",
            "Q4: ROI measurement and next-phase planning",
        ],
        "budget_verdict": (
            f"At the current investment level, payback is projected in "
            f"{roi.get('payback_months', 'N/A')} months. "
            f"Consider the {board.lower().replace('approve ', '')} scenario."
        ),
        "overall_risk": readiness.get("risk_label", "MEDIUM"),
    }


# ── Quick test ───────────────────────────────────────────────────
if __name__ == "__main__":
    dummy_profile = {
        "industry":           "Healthcare",
        "ai_investment_usd":  2_000_000,
        "ai_maturity_score":  6.5,
    }
    dummy_ml = {
        "roi": {"roi_percentage": 142, "roi_12m": 142, "roi_36m": 188,
                "annual_net_benefit": 1_500_000, "payback_months": 16,
                "quarterly_revenue_impact": 875_000},
        "readiness": {"readiness_level": "MEDIUM", "risk_score": 45,
                      "transformation_score": 55, "risk_label": "MEDIUM"},
        "risk_scores": {
            "technical":  {"score": 72, "label": "HIGH"},
            "financial":  {"score": 45, "label": "MEDIUM"},
            "talent":     {"score": 80, "label": "HIGH"},
            "regulatory": {"score": 55, "label": "MEDIUM"},
            "market":     {"score": 30, "label": "LOW"},
        },
        "scenarios": {
            "conservative": {"roi_pct": 142},
            "cautious":     {"roi_pct": 171},
            "aggressive":   {"roi_pct": 198},
            "board_recommendation": "APPROVE CAUTIOUS EXPANSION",
        },
        "maturity": {"maturity_label": "Scaling", "maturity_tier": 3,
                     "peer_percentile": 58},
    }
    result = generate_narrative(dummy_profile, dummy_ml)
    print(f"Source: {result['source']} ({result['model']})")
    print(json.dumps(result["response"], indent=2))
