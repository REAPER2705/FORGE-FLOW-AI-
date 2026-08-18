// Automation API
// API methods for automation endpoints

import client from './client';

export const automationAPI = {
  getExecutions: async () => {
    try {
      const response = await client.get('/api/automation/executions');
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
};

export default automationAPI;
