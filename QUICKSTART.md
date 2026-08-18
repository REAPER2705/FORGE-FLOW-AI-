# ForgeFlow AI — Quick Start

## 30-Second Setup

### 1. Prerequisites Installed?
- ✅ Node.js 18+ 
- ✅ MongoDB Community Server
- ✅ Docker & Docker Compose

### 2. Create Environment Files

**Backend:**
```bash
cd server
cp .env.example .env
```

**Frontend:**
```bash
cd ../client
cp .env.example .env
```

### 3. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd ../client
npm install
```

---

## Run Everything (4 Terminal Windows)

### Terminal 1: MongoDB
```bash
# macOS
brew services start mongodb-community

# Windows
# Start MongoDB from Start Menu
```

### Terminal 2: n8n Docker
```bash
cd <project-root>
docker compose up -d

# Verify: Open http://localhost:5678
```

### Terminal 3: Backend
```bash
cd server
npm run dev
```

**Expected Output:**
```
╔════════════════════════════════════════╗
║     ForgeFlow AI Backend Started       ║
╚════════════════════════════════════════╝
  Server: http://localhost:5000
  Health: http://localhost:5000/api/health
```

### Terminal 4: Frontend
```bash
cd client
npm run dev
```

**Expected Output:**
```
  VITE v4.2.0  ready in X ms
  ➜  Local:   http://localhost:5173/
```

---

## Verify It Works

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "service": "ForgeFlow API",
  "status": "healthy"
}
```

### 2. Open Frontend
- http://localhost:5173

You should see:
- ✅ Header with green "API: Connected" indicator
- ✅ Sidebar with navigation
- ✅ Dashboard with KPI cards

### 3. Navigate Pages
- Dashboard ✅
- Factory Twin ✅
- Machines ✅
- Incidents ✅
- Maintenance ✅
- AI Copilot ✅
- Reports ✅
- Automation ✅

---

## API Endpoints

All return `{ "success": true, "data": [] }`:

```
GET  /api/health
GET  /api/machines
GET  /api/incidents
GET  /api/work-orders
GET  /api/automation/executions
GET  /api/telemetry
GET  /api/reports
```

---

## Stop Everything

### Backend
```
Ctrl+C in backend terminal
```

### Frontend
```
Ctrl+C in frontend terminal
```

### n8n
```bash
docker compose down
```

### MongoDB
```bash
# macOS
brew services stop mongodb-community

# Windows
# Stop from Services
```

---

## Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongosh

# If not, restart it
brew services start mongodb-community  # macOS
```

### Frontend won't connect to API
- Check backend is running on port 5000
- Verify VITE_API_URL=http://localhost:5000
- Check browser console for errors

### Port already in use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### n8n not starting
```bash
docker compose down
docker compose up -d
```

---

## What's Implemented (Phase 1)

✅ Express backend with 15+ API endpoints
✅ MongoDB with 5 Mongoose schemas
✅ React frontend with 8 pages
✅ API polling every 5 seconds
✅ Error handling middleware
✅ CORS configuration
✅ Health check endpoint
✅ Dark theme UI with Tailwind CSS
✅ API connectivity indicator
✅ Professional navigation

---

## What's NOT Implemented Yet (Phases 2-7)

❌ Telemetry simulator
❌ Anomaly detection
❌ AI (Gemini)
❌ LangGraph agents
❌ n8n workflows
❌ PDF reports
❌ Charts and graphs
❌ Digital twin visualization

---

## Documentation

- **PHASE1_SETUP.md** - Full setup guide with troubleshooting
- **PHASE1_COMPLETION.md** - Detailed completion report
- **README.md** - Project overview

---

## Phase 1 Status

🟢 **COMPLETE AND VERIFIED**

Ready to move to Phase 2: Factory Simulation

---

**Last Updated:** Phase 1 Foundation
**Status:** Production Ready (Foundation Layer)
