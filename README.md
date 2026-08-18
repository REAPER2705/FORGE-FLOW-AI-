# ForgeFlow AI - Industrial Operations Platform

An AI-powered industrial operations platform demonstrating simulated IoT telemetry, real-time machine monitoring, and automated maintenance workflows.

## 📋 Project Structure

```
forgeflow-ai/
├── server/                 # Backend Node.js/Express API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── models/        # MongoDB Mongoose schemas
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic
│   │   ├── controllers/   # Request handlers
│   │   ├── ai/            # LangGraph agents
│   │   ├── simulator/     # Telemetry simulator
│   │   └── middleware/    # Express middleware
│   └── package.json
├── client/                 # Frontend React/Vite application
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── api/           # API client methods
│   │   └── utils/         # Helper functions
│   └── package.json
├── n8n/                    # n8n automation configuration
│   ├── compose.yaml       # Docker Compose for n8n
│   └── .env.example
└── docker-compose.yaml    # Full stack Docker setup

```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- MongoDB Community Server
- Google Gemini API Key

### Setup

1. **Clone repository**
   ```bash
   cd c:\Projects\Forge Flow AI
   ```

2. **Setup Backend**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your Gemini API Key
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../client
   cp .env.example .env
   npm install
   ```

4. **Start MongoDB & n8n**
   ```bash
   cd ..
   docker-compose up -d
   ```

5. **Run Backend**
   ```bash
   cd server
   npm run dev
   ```

6. **Run Frontend**
   ```bash
   cd ../client
   npm run dev
   ```

7. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - n8n: http://localhost:5678

## 📚 Development Phases

- [ ] Phase 1: Foundation (Express, MongoDB, React setup)
- [ ] Phase 2: Factory Simulation (Telemetry, Anomaly Detection)
- [ ] Phase 3: Dashboard (UI, Charts, Polling)
- [ ] Phase 4: AI (Gemini, LangGraph, Agents)
- [ ] Phase 5: n8n Automation (Webhooks, Workflows)
- [ ] Phase 6: Maintenance (Work Orders, Tracking)
- [ ] Phase 7: Reports & Polish (PDF, Error Handling)

## 🏗️ Architecture

- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Backend**: Express.js + MongoDB + Mongoose
- **AI**: Google Gemini + LangGraph
- **Automation**: n8n with Docker
- **Communication**: REST API with polling (no WebSockets)

## 🔌 API Endpoints

**Machines**
- GET /api/machines
- GET /api/machines/:id
- GET /api/machines/:id/telemetry

**Incidents**
- GET /api/incidents
- GET /api/incidents/:id
- POST /api/incidents

**Work Orders**
- GET /api/work-orders
- POST /api/work-orders
- PATCH /api/work-orders/:id

**AI & Automation**
- POST /api/copilot
- POST /api/automation/incident
- GET /api/automation/executions

**Simulation Control**
- POST /api/simulation/start
- POST /api/simulation/warning
- POST /api/simulation/critical
- POST /api/simulation/reset

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/forgeflow
GEMINI_API_KEY=your_key_here
N8N_WEBHOOK_URL=http://localhost:5678/webhook/forgeflow-incident
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 🎯 Demo Flow

1. Start ForgeFlow
2. Telemetry simulator generates data
3. Factory operates normally
4. Trigger M-104 degradation
5. Machine becomes CRITICAL
6. Incident created and sent to n8n
7. AI analysis via Gemini + LangGraph
8. Work order generated
9. Dashboard updates
10. PDF report generated

## 📖 Documentation

- See PRD.txt for complete technical requirements
- Each phase has acceptance criteria
- Code should follow modular, maintainable patterns

## 🤝 Contributing

Follow the phase-based development approach. Test each phase before proceeding.

