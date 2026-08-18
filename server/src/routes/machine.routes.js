// Machine Routes
// API endpoints for machine management

import { Machine } from '../models/Machine.js';
import TelemetryService from '../services/telemetry.service.js';

export const setupMachineRoutes = (app) => {
  app.get('/api/machines', async (req, res, next) => {
    try {
      const machines = await Machine.find().exec();

      res.json({
        success: true,
        data: machines,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/machines/:id', async (req, res, next) => {
    try {
      const { id } = req.params;

      // Try to find by _id first, then by machineId
      let machine = await Machine.findById(id).exec();

      if (!machine) {
        machine = await Machine.findOne({ machineId: id }).exec();
      }

      if (!machine) {
        return res.status(404).json({
          success: false,
          error: `Machine ${id} not found`,
        });
      }

      res.json({
        success: true,
        data: machine,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/machines/:id/telemetry', async (req, res, next) => {
    try {
      const { id } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;

      // Find machine by _id or machineId
      let machine = await Machine.findById(id).exec();

      if (!machine) {
        machine = await Machine.findOne({ machineId: id }).exec();
      }

      if (!machine) {
        return res.status(404).json({
          success: false,
          error: `Machine ${id} not found`,
        });
      }

      // Get telemetry history
      const history = await TelemetryService.getTelemetryHistory(machine.machineId, limit);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  });
};

export default setupMachineRoutes;
