# LabLink — Deployment Guide

This guide covers deployment instructions for running LabLink in production across multiple environments.

Because LabLink combines a high-performance Express backend with a compiled React SPA, it supports **unified single-port deployment** where Express serves both the REST API and the static frontend SPA bundle.

---

## Deployment Option 1: Docker (Recommended for Containerized Environments)

LabLink includes a production-ready multi-stage `Dockerfile` and `docker-compose.yml`.

### Quickstart with Docker Compose
```bash
# Clone the repository
git clone https://github.com/Chida-46/unreal_prompt.git
cd unreal_prompt

# (Optional) Set your Gemini API key in an environment variable
export GEMINI_API_KEY="your-gemini-api-key"

# Build and start container
docker compose up -d --build
```

The application will be live at:
**`http://localhost:5000`**

### Direct Docker Run
```bash
docker build -t lablink:latest .
docker run -p 5000:5000 -e GEMINI_API_KEY="your-key" lablink:latest
```

---

## Deployment Option 2: Render (1-Click Web Service)

LabLink includes a pre-configured `render.yaml` specification.

1. Create a free account at [render.com](https://render.com/).
2. Click **New +** $\rightarrow$ **Blueprint** (or **Web Service**).
3. Connect your GitHub repository: `https://github.com/Chida-46/unreal_prompt`.
4. Configure the build parameters:
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     npm install --prefix backend && npm install --prefix frontend && npm run build && npm run seed
     ```
   - **Start Command:**
     ```bash
     npm start
     ```
5. In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `GEMINI_API_KEY` = *your Google AI Studio API key*
   - `AI_PROVIDER` = `gemini`
6. Click **Create Web Service**. Your live public URL will be generated automatically (e.g., `https://lablink.onrender.com`).

---

## Deployment Option 3: Railway / Fly.io

1. Connect your GitHub repository to Railway or Fly.io.
2. Railway detects the `Dockerfile` automatically.
3. Add the `GEMINI_API_KEY` environment variable in the dashboard.
4. Deploy! Railway provisions an HTTPS domain and mounts the container automatically.

---

## Deployment Option 4: Linux Virtual Private Server (VPS / Ubuntu)

### 1. Provision Node.js 22 & Git
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

### 2. Clone & Build
```bash
git clone https://github.com/Chida-46/unreal_prompt.git /var/www/lablink
cd /var/www/lablink

npm install --prefix backend
npm install --prefix frontend
npm run build
npm run seed
```

### 3. Setup Process Manager (PM2)
```bash
sudo npm install -g pm2
pm2 start backend/dist/index.js --name "lablink"
pm2 save
pm2 startup
```

### 4. Reverse Proxy with Nginx (Optional)
```nginx
server {
    listen 80;
    server_name lablink.yourdomain.edu;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Health Check & Verification

Once deployed, verify the deployment by requesting the health endpoint:

```bash
curl -i https://your-deployment-url/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-11-23T16:40:00.000Z",
  "service": "LabLink API & Scheduling Engine",
  "version": "1.0.0",
  "auth": "NONE (Academic Demonstration Mode)",
  "security": {
    "rateLimiting": "ACTIVE",
    "securityHeaders": "ACTIVE",
    "transactions": "SQLITE_IMMEDIATE"
  }
}
```
