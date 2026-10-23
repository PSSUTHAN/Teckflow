# ==============================================================
# TeckFlow - Python + HTML/CSS/JS + MySQL Docker Container
# ==============================================================
FROM python:3.12-slim

WORKDIR /app

# Set Python environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=3000 \
    NODE_ENV=production

# Install system dependencies required for mysqlclient
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    default-libmysqlclient-dev \
    pkg-config \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source files
COPY app.py db.py schema.sql ./
COPY templates/ ./templates/
COPY static/ ./static/

# Create persistent storage directory for local database fallback
RUN mkdir -p .data && useradd -m appuser && chown -R appuser:appuser /app

# Run as non-root user
USER appuser

# Expose web server port
EXPOSE 3000

# Container health check targeting Flask /api/health
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start production WSGI server
CMD ["gunicorn", "--workers=2", "--bind=0.0.0.0:3000", "app:app"]
