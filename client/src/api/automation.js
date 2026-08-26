// Automation API
// API methods for automation endpoints (test and production)

import client from './client';

export const automationAPI = {
  // Send test automation report
  sendTestAutomation: async (email) => {
    try {
      const response = await client.post('/api/automation/test', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get automation executions
  getExecutions: async (limit = 20) => {
    try {
      const response = await client.get('/api/automation/executions', {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get statistics
  getStatistics: async () => {
    try {
      const response = await client.get('/api/automation/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get incident executions
  getIncidentExecutions: async (incidentId) => {
    try {
      const response = await client.get(`/api/automation/incident/${incidentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get execution status
  getExecutionStatus: async (executionId) => {
    try {
      const response = await client.get(`/api/automation/execution/${executionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default automationAPI;
