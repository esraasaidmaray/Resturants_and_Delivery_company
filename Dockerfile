# Multi-stage Dockerfile for Hugging Face Spaces (Next.js + Python AI Backend)

# Stage 1: Build Next.js Frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Runtime Environment with Python and Node.js
FROM python:3.11-slim
WORKDIR /app

# Install Node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY ai_backend/requirements.txt ./ai_backend/
RUN pip install --no-cache-dir -r ai_backend/requirements.txt

# Copy application files
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY . .

# Set environment variables for Hugging Face Spaces
ENV PORT=7860
ENV HOSTNAME="0.0.0.0"
ENV PYTHON_BACKEND_URL="http://127.0.0.1:8000"

# Expose default Hugging Face Spaces port
EXPOSE 7860

# Start script running Python backend on 8000 and Next.js frontend on 7860
CMD ["sh", "-c", "python -m uvicorn ai_backend.main:app --host 127.0.0.1 --port 8000 & PORT=7860 npx next start --hostname 0.0.0.0 --port 7860"]
