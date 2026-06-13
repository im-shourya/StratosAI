from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model references
MODELS = {}
START_TIME = time.time()
MODEL_VERSION = "v1.0.0"
LAST_RETRAIN_DATE = "2026-06-12"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML models exactly once on startup
    logger.info("Loading ML models into memory...")
    # Simulate loading delays
    # MODELS['revenue_model'] = joblib.load('models/revenue_model.joblib')
    # MODELS['risk_model'] = joblib.load('models/risk_model.joblib')
    MODELS['loaded'] = True
    logger.info("All ML models successfully pre-loaded.")
    yield
    # Clean up models on shutdown
    logger.info("Shutting down, unloading models...")
    MODELS.clear()

app = FastAPI(
    title="StratosAI ML API",
    description="Machine Learning Service for Corporate AI Strategy Assessment",
    version=MODEL_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FeatureDict(BaseModel):
    industry: str
    budget: float
    maturity: int

@app.post('/ml/predict/full')
async def predict_full(features: FeatureDict):
    """
    Preferred endpoint for full assessment pipeline.
    Runs ROI, Success, Risk, Maturity, and Budget optimizations in one pass.
    """
    if not MODELS.get('loaded'):
        raise HTTPException(status_code=503, detail="Models not loaded yet")

    try:
        # Dummy prediction logic representing model outputs
        return {
            "success_probability": 0.82,
            "roi": {
                "roi_12m": 45.0,
                "roi_36m": 125.0,
            },
            "maturity": {
                "maturity_tier": 2,
                "peer_gap": 0.1
            },
            "risk_scores": {
                "technical": 40,
                "financial": 30,
                "talent": 75,
                "regulatory": 20
            }
        }
    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal ML Error")

@app.get('/ml/health')
async def health_check():
    """
    Health check endpoint returning model metadata.
    """
    uptime_seconds = time.time() - START_TIME
    return {
        "status": "healthy",
        "models_loaded": list(MODELS.keys()),
        "model_version": MODEL_VERSION,
        "last_retrain_date": LAST_RETRAIN_DATE,
        "uptime_seconds": round(uptime_seconds, 2)
    }

# To run: uvicorn app:app --host 0.0.0.0 --port 5001
