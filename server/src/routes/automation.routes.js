// Automation Routes
// API endpoints for n8n automation management (test and production)

import N8nService from '../services/n8n.service.js';

export const setupAutomationRoutes = (app) => {
  // Send test automation report
  app.post('/api/automation/test', async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email address required',
        });
      }

      const execution = await N8nService.sendTestAutomation(email);

      res.status(201).json({
        success: true,
        message: 'Test report sent successfully',
        executionId: execution.executionId,
        data: execution,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to send test report',
      });
    }
  });

  // Get all automation executions
  app.get('/api/automation/executions', async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const executions = await N8nService.getExecutions(limit);

      res.json({
        success: true,
        data: executions,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get automation statistics
  app.get('/api/automation/stats', async (req, res, next) => {
    try {
      const stats = await N8nService.getStatistics();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get executions for incident
  app.get('/api/automation/incident/:incidentId', async (req, res, next) => {
    try {
      const executions = await N8nService.getIncidentExecutions(req.params.incidentId);

      res.json({
        success: true,
        data: executions,
      });
    } catch (error) {
      next(error);
    }
  });

  // Get execution status
  app.get('/api/automation/execution/:executionId', async (req, res, next) => {
    try {
      const execution = await N8nService.getExecutionById(req.params.executionId);

      if (!execution) {
        return res.status(404).json({
          success: false,
          error: 'Execution not found',
        });
      }

      res.json({
        success: true,
        data: execution,
      });
    } catch (error) {
      next(error);
    }
  });
};

export default setupAutomationRoutes;
