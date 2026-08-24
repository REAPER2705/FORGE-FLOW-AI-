// Reports API
// API methods for report generation and retrieval

import client from './client';

export const reportsAPI = {
  // Get all reports
  getReports: async () => {
    try {
      const response = await client.get('/api/reports');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Generate factory health report
  generateHealthReport: async () => {
    try {
      const response = await client.post('/api/reports/generate');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get health summary
  getHealthSummary: async () => {
    try {
      const response = await client.get('/api/reports/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default reportsAPI;
