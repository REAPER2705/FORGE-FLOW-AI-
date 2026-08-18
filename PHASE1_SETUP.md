# ForgeFlow AI — Phase 1: Foundation Setup Guide

## Prerequisites

Before starting, ensure you have installed:
- Node.js 18+ (https://nodejs.org/)
- MongoDB Community Server (https://www.mongodb.com/try/download/community)
- Docker & Docker Compose (https://www.docker.com/products/docker-desktop/)
- Git

## Step 1: Environment Setup

### Backend Configuration

```bash
cd server
cp .env.example .env
```

The `.env` file will contain:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/forgeflow
GEMINI_API_KEY=
N8N_WEBHOOK_URL=http://localhost:5678/webhook/forgeflow-incident
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Note:** GEMINI_API_KEY is optional for Phase 1. Leave it empty.

### Frontend Configuration

```bash
cd ../client
cp .env.example .env
```

The `.env` file will contain:
```env
VITE_API_URL=http://localhost:5000
```

## Step 2: Install Dependencies

### Backend
```bash
cd server
npm install
```

### Frontend
```bash
cd ../client
npm install
```

## Step 3: MongoDB Setup

### Option A: Local Installation (Recommended for Phase 1)

1. **Install MongoDB Community Server:**
   - Download from: https://www.mongodb.com/try/download/community
   - Follow the installation guide for your OS
   - MongoDB will run on `mongodb://127.0.0.1:27017` by default

2. **Verify MongoDB is running:**
   ```bash
   mongosh
   ```
   If MongoDB connects successfully, you're ready.

### Option B: Docker (Alternative)

```bash
docker run -d -p 27017:27017 --name forgeflow-mongodb mongo:latest
```

## Step 4: Start n8n with Docker

```bash
docker compose up -d
```

Verify n8n is running:
- Open http://localhost:5678
- n8n should be accessible

## Step 5: Start Backend

```bash
cd server
npm run dev
```

Expected output:
```
╔════════════════════════════════════════╗
║     ForgeFlow AI Backend Started       ║
╚════════════════════════════════════════╝
  Server: http://localhost:5000
  Health: http://localhost:5000/api/health
  Environment: development

✓ MongoDB connected successfully
```

## Step 6: Start Frontend

Open a new terminal:

```bash
cd client
npm run dev
```

Expected output:
```
  VITE v4.2.0  ready in X ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

## Step 7: Verify Everything Works

### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "service": "ForgeFlow API",
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Frontend Check

1. Open http://localhost:5173 in your browser
2. You should see the ForgeFlow Dashboard
3. The API status indicator should show "Connected" (green dot)
4. Navigate through the pages using the sidebar

### API Routes Check

```bash
# Get empty machines list
curl http://localhost:5000/api/machines

# Get empty incidents list
curl http://localhost:5000/api/incidents

# Get empty work orders list
curl http://localhost:5000/api/work-orders
```

All should return:
```json
{
  "success": true,
  "data": []
}
```

## Troubleshooting

### MongoDB Connection Fails

**Error:** `connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
- Make sure MongoDB is installed and running
- If using Docker, run: `docker run -d -p 27017:27017 mongo:latest`
- Check that port 27017 is not blocked by a firewall

### Frontend Cannot Connect to Backend

**Error:** `API: Disconnected` in the UI

**Solution:**
- Verify backend is running on port 5000
- Check that VITE_API_URL is set correctly
- Ensure CORS is enabled (it should be by default)
- Check browser console for network errors

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Kill process using port 5000 (macOS/Linux)
lsof -ti:5000 | xargs kill -9

# On Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### n8n Not Starting

**Error:** Docker container crashes

**Solution:**
```bash
# Remove old container
docker rm forgeflow-n8n

# Start fresh
docker compose up -d
```

## Phase 1 Verification Checklist

- [ ] MongoDB is running and accessible
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] GET /api/health returns success
- [ ] API status indicator shows "Connected" in UI
- [ ] All page routes are accessible (Dashboard, Machines, etc.)
- [ ] API returns empty arrays for GET /api/machines, /api/incidents, etc.
- [ ] No console errors in browser
- [ ] No console errors in backend
- [ ] n8n is running on http://localhost:5678

## Next Steps

After Phase 1 verification, proceed to Phase 2: Factory Simulation

Phase 2 will implement:
- Telemetry simulator
- Machine state management
- Anomaly detection
- Sample data generation

## File Structure Summary

```
ForgeFlow AI/
├── server/
│   ├── src/
│   │   ├── app.js              ✓ Express setup
│   │   ├── config/
│   │   │   ├── env.js          ✓ Environment config
│   │   │   └── database.js     ✓ MongoDB connection
│   │   ├── models/
│   │   │   ├── Machine.js      ✓ Mongoose schema
│   │   │   ├── Telemetry.js    ✓ Mongoose schema
│   │   │   ├── Incident.js     ✓ Mongoose schema
│   │   │   ├── WorkOrder.js    ✓ Mongoose schema
│   │   │   └── AutomationExecution.js ✓ Mongoose schema
│   │   ├── routes/             ✓ All routes implemented
│   │   ├── middleware/         ✓ Error & validation
│   │   └── .env               (create manually)
│   └── package.json           ✓ Dependencies ready
├── client/
│   ├── src/
│   │   ├── main.jsx           ✓ React entry point
│   │   ├── App.jsx            ✓ Router setup
│   │   ├── components/        ✓ Header, Sidebar, Layout
│   │   ├── pages/             ✓ All pages implemented
│   │   ├── api/               ✓ API clients ready
│   │   ├── hooks/             ✓ usePolling, useHealthCheck
│   │   └── .env               (create manually)
│   └── package.json           ✓ Dependencies ready
├── n8n/
│   ├── .env.example           ✓ n8n config
│   └── compose.yaml           (in root docker-compose)
├── docker-compose.yaml        ✓ n8n only (MongoDB local)
└── README.md                  ✓ Project documentation

✓ = Complete
