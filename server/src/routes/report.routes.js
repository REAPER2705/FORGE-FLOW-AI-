// Report Routes
// API endpoints for report generation

import ReportService from '../services/report.service.js';

export const setupReportRoutes = (app) => {
  // Get all reports (empty for now, placeholder for future)
  app.get('/api/reports', async (req, res, next) => {
    try {
      const reports = await ReportService.listReports();
      res.json({
        success: true,
        data: reports,
      });
    } catch (error) {
      next(error);
    }
  });

  // Generate factory health report
  app.post('/api/reports/generate', async (req, res, next) => {
    try {
      const report = await ReportService.generateFactoryHealthReport();
      res.json({
        success: true,
        data: report,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  });

  // Get factory health summary (quick endpoint)
  app.get('/api/reports/health', async (req, res, next) => {
    try {
      const report = await ReportService.generateFactoryHealthReport();
      res.json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  });
};

export default setupReportRoutes;
