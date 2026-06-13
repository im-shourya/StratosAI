FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5001

# Using 4 workers as a robust default (approx. 2 * Available CPU Cores + 1 for typical dual-core setups)
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5001", "--workers", "4"]
