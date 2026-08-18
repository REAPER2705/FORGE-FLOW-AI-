// Simulation Control Routes
// API endpoints for telemetry simulator control

import TelemetrySimulator from '../simulator/telemetrySimulator.js';

// Global simulator instance
let simulator = null;

// Initialize simulator on first use
const getSimulator = () => {
  if (!simulator) {
    simulator = new TelemetrySimulator();
  }
  return simulator;
};

export const setupSimulationRoutes = (app) => {
  app.post('/api/simulation/start', async (req, res, next) => {
    try {
      const sim = getSimulator();
      const success = await sim.start();

      res.json({
        success: true,
        message: success ? 'Simulator started' : 'Simulator already running',
        status: sim.getStatus(),
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/simulation/warning', async (req, res, next) => {
    try {
      const { machineId } = req.body;

      if (!machineId || typeof machineId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'machineId is required and must be a string',
        });
      }

      const sim = getSimulator();

      if (!sim.isRunning) {
        return res.status(400).json({
          success: false,
          error: 'Simulator is not running. Call /api/simulation/start first',
        });
      }

      await sim.triggerWarning(machineId);

      res.json({
        success: true,
        message: `Warning triggered for ${machineId}`,
        status: sim.getStatus(),
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/simulation/critical', async (req, res, next) => {
    try {
      const { machineId } = req.body;

      if (!machineId || typeof machineId !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'machineId is required and must be a string',
        });
      }

      const sim = getSimulator();

      if (!sim.isRunning) {
        return res.status(400).json({
          success: false,
          error: 'Simulator is not running. Call /api/simulation/start first',
        });
      }

      await sim.triggerCritical(machineId);

      res.json({
        success: true,
        message: `Critical state triggered for ${machineId}`,
        status: sim.getStatus(),
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/simulation/reset', async (req, res, next) => {
    try {
      const sim = getSimulator();

      if (!sim.isRunning) {
        return res.status(400).json({
          success: false,
          error: 'Simulator is not running',
        });
      }

      await sim.reset();

      res.json({
        success: true,
        message: 'Simulator reset to NORMAL',
        status: sim.getStatus(),
      });
    } catch (error) {
      next(error);
    }
  });
};

export default setupSimulationRoutes;
