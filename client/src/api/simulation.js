// Simulation API
// API methods for simulation control endpoints

import client from './client';

export const simulationAPI = {
  start: async () => {
    try {
      const response = await client.post('/api/simulation/start');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  triggerWarning: async (machineId) => {
    try {
      const response = await client.post('/api/simulation/warning', { machineId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  triggerCritical: async (machineId) => {
    try {
      const response = await client.post('/api/simulation/critical', { machineId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  reset: async () => {
    try {
      const response = await client.post('/api/simulation/reset');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default simulationAPI;
