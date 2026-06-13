# StratosAI — Comprehensive Master Build Plan

This document serves as the single source of truth for all agents and developers building the **StratosAI** platform. It outlines the conversation flow, ML models, database architecture, API specs, and the final output format.

---

## 1. Chatbot Conversation Flow
14 adaptive questions across 5 phases to drive the ML inputs. Responses are stored as JSON in the MongoDB session document.

### Phase 1: Company Profile
- **Q1: Industry** (Fintech/Banking, Healthcare, Retail, Manufacturing, Logistics, SaaS, Energy, Other) → Maps to industry benchmark table.
- **Q2: Annual Revenue** (<$1M to $1B+) → Scales ROI expectations and budget recommendations.
- **Q3: Employee Count** (<50 to 5000+) → Affects implementation complexity and change management risk.

### Phase 2: AI Goals & Use Cases
- Q4–Q6 (Focus on primary objectives, top barriers, and implementation expectations)

### Phase 3: AI Maturity & Infrastructure
- Q7–Q9 (Current tools, data readiness, data governance)

### Phase 4: Budget & Implementation
- Q10–Q12 (AI Budget size, % of revenue, expected ROI timeline)

### Phase 5: Risk & Constraints
- Q13–Q14 (Risk appetite, regulatory environment, competitive pressure)

### Branching Logic Rules
- **Budget < $50K** → Skip advanced ML infrastructure questions, focus on SaaS tools.
- **Maturity = Exploring** → Recommend Pilot first, adjust ROI timeline.
- **Regulated Industry** → Add compliance risk questions.
- **No Talent** → Auto-flag talent risk, recommend partner model.

---

## 2. ML Model Specifications (Flask Service)
*Trained on Corporate AI Adoption dataset (2015–2035)*

| Model | Type | Target Variable | Features Used |
| :--- | :--- | :--- | :--- |
| **ROI Predictor** | XGBoost Regressor | `roi_percentage` | Industry, size, budget, maturity, use case, infra, timeline |
| **Success Predictor** | XGBClassifier + SMOTE | `initiative_success` (0/1) | ROI inputs + talent score, risk count, regulatory weight, data readiness |
| **Risky Radar** | Random Forest Multi-Output | Risk scores (Technical, Financial, Talent, Regulatory, Market) | Regulation level, talent, infra, budget size, concerns |
| **Maturity Assessor**| K-Means Clustering (k=5) | `maturity_tier` (1-5), `peer_gap_score` | Maturity level, infra, talent, departments, years active |
| **Budget Optimiser** | Knapsack LP + XGBoost | `budget_allocation[]` | Total budget, use cases, ROI/use case, risk/use case, complexity |

---

## 3. Database Schema

### PostgreSQL (Structured Data)
- **`assessments`**: id, user_id, session_id, company_name, industry, company_size, ai_budget, ai_maturity, status, created_at
- **`predictions`**: id, assessment_id, roi_12m, roi_36m, success_prob, maturity_score, risk_technical, risk_financial, risk_talent, risk_regulatory, model_version
- **`initiatives`**: id, assessment_id, name, use_case, allocated_budget, expected_roi, risk_score, priority, timeline_months
- **`benchmarks`**: id, industry, use_case, company_size, avg_roi_pct, success_rate, avg_timeline_mo, data_year

### MongoDB Atlas (Unstructured Data)
- **`conversations`**: _id, session_id, messages[] (role, content, timestamp), extracted_data, phase, complete
- **`reports`**: _id, assessment_id, executive_summary, recommendations[], roadmap, risk_mitigations[], budget_plan, llm_model, generated_at

---

## 4. API Endpoints

### NestJS Gateway (Port 3001)
- `POST /api/auth/login` — JWT login
- `POST /api/assessments/start` — Start session
- `POST /api/assessments/:id/respond` — Submit answer, get next question
- `GET /api/assessments/:id/status` — Check completion phase
- `POST /api/assessments/:id/analyze` — Trigger ML pipeline
- `GET /api/assessments/:id/report` — Fetch final report JSON
- `POST /api/chat/message` — Send raw message to LLM
- `GET /api/benchmarks/:industry` — Fetch PG benchmarks

### Flask ML Service (Port 5001)
- `POST /ml/predict/roi`
- `POST /ml/predict/success`
- `POST /ml/assess/risk`
- `POST /ml/assess/maturity`
- `POST /ml/optimize/budget`
- `POST /ml/recommend` (Calls Claude API for narrative formatting)
- `GET /ml/health`

---

## 5. Final Output Report (Sample Layout)

**StratosAI Strategic Report — Acme Fintech Ltd.**
*Industry: Financial Services · Revenue: $50M–$100M · AI Maturity: Experimenting*

### Key Metrics
- **Predicted ROI (36M):** 142%
- **Success Probability:** 74%
- **AI Maturity:** Level 2
- **Overall Risk:** Medium

### Risky Radar
- High: Technical, Talent
- Medium: Financial, Regulatory
- Low: Market

### Budget Optimiser (Allocation)
1. **Fraud Detection ML** — $120K (40%)
2. **Customer Churn Predictor** — $90K (30%)
3. **Process Automation (RPA+AI)** — $60K (20%)
4. **Talent & Training Reserve** — $30K (10%)

### Implementation Roadmap
- **0–3 mo:** Data Audit & Infra
- **3–6 mo:** Pilot: Fraud ML
- **6–12 mo:** Scale + Churn
- **12–18 mo:** Automation + ROI

### Top Recommendations
1. **Hire AI/ML Lead First:** 81% talent risk identified. Recruit an ML engineer before model development.
2. **Start with Fraud Detection:** Highest ROI potential with existing labeled data.
3. **Adopt Buy before Build:** At Level 2 maturity, SaaS ML tools reduce risk by 45%.
4. **Regulatory Pre-check:** Engage compliance counsel on audit trails.

**Executive Summary:** *"Acme Fintech sits at the Experimenting stage with strong data assets but critical talent gaps. A phased approach prioritizing fraud detection delivers the fastest payback while building internal ML capabilities."*
