# StratosAI — Full System Architecture

This document outlines how all components connect: **chatbot → ML pipeline → report**.

## Architecture Flow

### 1. Entry Point: LLM Chatbot (Claude API)
- Collects company profile
- Asks ~14 adaptive questions
- Uses branching logic
- **Storage:** Saves conversation context to **MongoDB**
- **Output:** Passes a structured JSON payload down the pipeline

### 2. NestJS Backend (API Gateway)
- Handles Authentication / Session management
- Validates input from the frontend/chatbot
- Calls the **Flask ML API** for predictions
- **Storage:** Saves structured assessment data to **PostgreSQL**

### 3. Flask / FastAPI (ML Service)
- **Models:**
  - ROI Predictor
  - Risk Radar
  - Maturity Assessor
  - Budget Optimizer
- **Output:** Returns predictions and scores back to the backend

### 4. Database Layer
- **PostgreSQL:** Stores structured data (Assessments, Initiatives, Benchmarks)
- **MongoDB:** Stores unstructured data (Conversations, Final Reports)

### 5. Recommendation Layer
- Combines **LLM + Rule Engine**
- Generates a narrative
- Performs Roadmap generation
- Applies Industry benchmarks
- Provides Risk mitigation tips
- **Output:** A finalized, board-ready report

### 6. Output: Frontend Dashboard (Next.js)
- Displays ROI forecast charts
- Renders Risk radar visualizations
- Shows Maturity position
- Displays Budget allocation
- Allows PDF export of the final report

---

## Tech Stack Mapping

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js, Tailwind CSS, Recharts |
| **Backend** | NestJS, Passport JWT |
| **ML API** | Flask, XGBoost, Scikit-learn |
| **LLM** | Claude API (Sonnet 4.6) |
| **DB (Structured)** | PostgreSQL (Hosted on Railway) |
| **DB (Unstructured)**| MongoDB Atlas |
| **ML Deployment** | Hugging Face Spaces |
| **Frontend Deploy** | Vercel |
