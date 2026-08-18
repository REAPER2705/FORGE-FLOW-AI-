// Analysis Routes
// API endpoints for triggering and retrieving analysis results

import AnalysisService from '../services/analysis.service.js';
import IncidentService from '../services/incident.service.js';
import MaintenanceService from '../services/maintenance.service.js';

export const setupAnalysisRoutes = (app) => {
  // Analyze specific machine
  app.post('/api/analysis/machine/:machineId', async (req, res, next) => {
    try {
      const { machineId } = req.params;

      if (!machineId) {
        return res.status(400).json({
          success: false,
          error: 'machineId is required',
        });
      }

      const result = await AnalysisService.analyzeAndRecommend(machineId);

      res.json({
        success: true,
        data: result || { message: 'Machine operating normally' },
      });
    } catch (error) {
      next(error);
    }
  });

  // Analyze all machines
  app.post('/api/analysis/all', async (req, res, next) => {
    try {
      const results = await AnalysisService.analyzeAllMachines();

      res.json({
        success: true,
        data: results,
        count: results.length,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get dashboard summary
  app.get('/api/analysis/summary', async (req, res, next) => {
    try {
      const summary = await AnalysisService.getDashboardSummary();

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get incidents
  app.get('/api/incidents', async (req, res, next) => {
    try {
      const incidents = await IncidentService.getOpenIncidents();

      res.json({
        success: true,
        data: incidents,
      });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/incidents/:incidentId', async (req, res, next) => {
    try {
      const { incidentId } = req.params;

      const incident = await IncidentService.getIncident(incidentId);

      if (!incident) {
        return res.status(404).json({
          success: false,
          error: 'Incident not found',
        });
      }

      res.json({
        success: true,
        data: incident,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get maintenance work orders
  app.get('/api/maintenance/pending', async (req, res, next) => {
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

  app.get('/api/maintenance/machine/:machineId', async (req, res, next) => {
    try {
      const { machineId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;

      const history = await MaintenanceService.getMaintenanceHistory(machineId, limit);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  });

  // Update work order status
  app.patch('/api/maintenance/:workOrderId', async (req, res, next) => {
    try {
      const { workOrderId } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'status is required',
        });
      }

      const workOrder = await MaintenanceService.updateWorkOrderStatus(workOrderId, status);

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

export default setupAnalysisRoutes;
