// Incident Routes
// API endpoints for incident management

import IncidentService from '../services/incident.service.js';

export const setupIncidentRoutes = (app) => {
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

  app.get('/api/incidents/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      const incident = await IncidentService.getIncident(id);

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

  app.post('/api/incidents', async (req, res, next) => {
    try {
      // Incidents are created by the analysis pipeline
      res.status(201).json({
        success: true,
        message: 'Incidents are created by the analysis pipeline',
      });
    } catch (error) {
      next(error);
    }
  });
};

export default setupIncidentRoutes;
