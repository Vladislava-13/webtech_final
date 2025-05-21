
# ---- Build React frontend ----
FROM node:20.19.2 AS builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
COPY frontend ./frontend
RUN cd frontend && npm install && npm run build

# ---- Build Express backend ----
WORKDIR /app
COPY backend/package*.json ./backend/
COPY backend ./backend
RUN cd backend && npm install 

RUN apt-get update && apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  libgbm1 \
  libpango1.0-0 \
  libasound2 \
  libpangocairo-1.0-0 \
  libgtk-3-0 \
  libxshmfence1 \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

EXPOSE 3000
CMD ["node", "backend/src/index.js"]
