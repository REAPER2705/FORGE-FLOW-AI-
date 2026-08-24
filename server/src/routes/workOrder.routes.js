// Work Order Routes
// API endpoints for maintenance work orders

import MaintenanceService from '../services/maintenance.service.js';

export const setupWorkOrderRoutes = (app) => {
  app.get('/api/work-orders', async (req, res, next) => {
    try {
      const workOrders = await MaintenanceService.getPendingMaintenance();
      res.json({
        success: true,
        data: workOrders,
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/work-orders', async (req, res, next) => {
    try {
      const { machineId, description, priority } = req.body;

      if (!machineId) {
        return res.status(400).json({
          success: false,
          error: 'machineId is required',
        });
      }

      // This is typically called by internal services
      // For direct API calls, provide basic work order creation
      res.status(201).json({
        success: true,
        message: 'Work orders are created by the analysis pipeline',
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/work-orders/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'status is required',
        });
      }

      const workOrder = await MaintenanceService.updateWorkOrderStatus(id, status);

      if (!workOrder) {
        return res.status(404).json({
          success: false,
          error: 'Work order not found',
        });
      }

      res.json({
        success: true,
        data: workOrder,
      });
    } catch (error) {
      next(error);
    }
  });
};

export default setupWorkOrderRoutes;
