// Automation API
// API methods for automation endpoints

import client from './client';

export const automationAPI = {
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

  getStatistics: async () => {
    try {
      const response = await client.get('/api/automation/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getIncidentExecutions: async (incidentId) => {
    try {
      const response = await client.get(`/api/automation/incident/${incidentId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  triggerIncidentWorkflow: async (data) => {
    try {
      const response = await client.post('/api/automation/incident', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

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
