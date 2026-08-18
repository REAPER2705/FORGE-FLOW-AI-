// ForgeFlow AI Backend - Main Application Entry Point
// Express setup with routes, middleware, and database connection

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import config from './config/env.js';
import { connectDatabase } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import automationScheduler from './services/automationScheduler.service.js';

// Import route handlers
import { setupMachineRoutes } from './routes/machine.routes.js';
import { setupTelemetryRoutes } from './routes/telemetry.routes.js';
import { setupIncidentRoutes } from './routes/incident.routes.js';
import { setupWorkOrderRoutes } from './routes/workOrder.routes.js';
import { setupCopilotRoutes } from './routes/copilot.routes.js';
import { setupAutomationRoutes } from './routes/automation.routes.js';
import { setupReportRoutes } from './routes/report.routes.js';
import { setupSimulationRoutes } from './routes/simulation.routes.js';
import { setupAnalysisRoutes } from './routes/analysis.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'ForgeFlow API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Setup Routes
setupMachineRoutes(app);
setupTelemetryRoutes(app);
setupIncidentRoutes(app);
setupWorkOrderRoutes(app);
setupCopilotRoutes(app);
setupAutomationRoutes(app);
setupReportRoutes(app);
setupSimulationRoutes(app);
setupAnalysisRoutes(app);

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

// Start Server
const start = async () => {
  try {
    // Try to connect to MongoDB
    await connectDatabase();

    // Start analysis scheduler (every 30 seconds)
    automationScheduler.startAnalysisSchedule(30);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
  }

  app.listen(config.port, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║     ForgeFlow AI Backend Started       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log(`  Server: http://localhost:${config.port}`);
    console.log(`  Health: http://localhost:${config.port}/api/health`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log('');
  });
};

start().catch((error) => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});

export default app;
