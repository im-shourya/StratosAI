from flask import Flask, jsonify
from flask_cors import CORS
import time

app = Flask(__name__)
CORS(app)

START_TIME = time.time()

# Dummy configuration - this would eventually be loaded from a config or database
MODEL_VERSION = "v1.0.0"
LAST_RETRAIN_DATE = "2026-06-12"

@app.route('/ml/health', methods=['GET'])
def health_check():
    """
    Health check endpoint returning model metadata.
    """
    uptime_seconds = time.time() - START_TIME
    
    return jsonify({
        "status": "healthy",
        "model_version": MODEL_VERSION,
        "last_retrain_date": LAST_RETRAIN_DATE,
        "uptime_seconds": round(uptime_seconds, 2)
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
