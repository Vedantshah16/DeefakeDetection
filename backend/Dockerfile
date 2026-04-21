# =============================================
#  TrueSight AI — Backend
#  FastAPI + PyTorch EfficientNet-B4
# =============================================
FROM python:3.11-slim

# System dependencies for OpenCV headless and PyTorch
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first (better layer caching)
COPY requirements.txt .

# PyTorch CPU-only wheel (saves ~600MB vs default CUDA build)
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY main.py database.py model.py ./
COPY ai_model/ ./ai_model/

# Copy entrypoint (decodes Firebase SA from env var → file)
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
