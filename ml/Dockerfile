# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Install system dependencies (libgomp1 is required for XGBoost!)
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy requirements and install them
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the ML codebase (including your .pkl models)
COPY . .

# Expose the port Hugging Face expects (7860)
EXPOSE 7860

# Run the Flask app on port 7860
CMD ["flask", "run", "--host=0.0.0.0", "--port=7860"]
