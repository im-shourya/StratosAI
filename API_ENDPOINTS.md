# Backend API Endpoints

This document outlines the API endpoints for both the **NestJS Gateway** and the internal **Flask ML Service**.

## NestJS — Assessment & Chat Gateway
*Runs on port 3001*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/login` | JWT login · returns access token |
| **POST** | `/api/assessments/start` | Start new assessment session |
| **POST** | `/api/assessments/:id/respond` | Submit chatbot answer, get next question |
| **GET** | `/api/assessments/:id/status` | Check completion and current phase |
| **POST** | `/api/assessments/:id/analyze` | Trigger ML pipeline → returns predictions |
| **GET** | `/api/assessments/:id/report` | Fetch full structured report JSON |
| **POST** | `/api/chat/message` | Send message to LLM chatbot |
| **GET** | `/api/benchmarks/:industry`| Get industry ROI benchmarks from Postgres |

---

## Flask — ML Service (Internal)
*Runs on port 5001*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/ml/predict/roi` | Runs XGBRegressor → `roi_12m`, `roi_36m` |
| **POST** | `/ml/predict/success` | Runs XGBClassifier → `success_probability` |
| **POST** | `/ml/assess/risk` | Runs Risk Radar → 5 domain risk scores |
| **POST** | `/ml/assess/maturity` | Runs K-Means → `maturity_tier`, `peer_gap` |
| **POST** | `/ml/optimize/budget` | Runs LP optimizer → allocation per initiative |
| **POST** | `/ml/recommend` | Calls Claude API → narrative + roadmap JSON |
| **GET** | `/ml/health` | Model version, uptime, last retrain date |
