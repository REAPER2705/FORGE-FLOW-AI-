// Telemetry Routes
// API endpoints for telemetry data

import TelemetryService from '../services/telemetry.service.js';
import { Machine } from '../models/Machine.js';

export const setupTelemetryRoutes = (app) => {
  app.get('/api/telemetry', async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;

      // Get all machines
      const machines = await Machine.find().exec();

      if (machines.length === 0) {
        return res.json({
          success: true,
          data: [],
        });
      }

      // Get latest telemetry for all machines
      const telemetryData = [];

      for (const machine of machines) {
        const history = await TelemetryService.getTelemetryHistory(machine.machineId, limit);
        telemetryData.push({
          machineId: machine.machineId,
          machineName: machine.name,
          readings: history,
        });
      }

      res.json({
        success: true,
        data: telemetryData,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/telemetry/:machineId', async (req, res, next) => {
    try {
      const { machineId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;

      if (!machineId) {
        return res.status(400).json({
          success: false,
          error: 'machineId is required',
        });
      }

      // Verify machine exists
      const machine = await Machine.findOne({ machineId }).exec();

      if (!machine) {
        return res.status(404).json({
          success: false,
          error: `Machine ${machineId} not found`,
        });
      }

      // Get telemetry history
      const history = await TelemetryService.getTelemetryHistory(machineId, limit);

      res.json({
        success: true,
        data: {
          machineId,
          machineName: machine.name,
          readings: history,
        },
      });
    } catch (error) {
      next(error);
    }
  });
};

export default setupTelemetryRoutes;
