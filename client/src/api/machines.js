// Machines API
// API methods for machine endpoints

import client from './client';

export const machinesAPI = {
  getAllMachines: async () => {
    try {
      const response = await client.get('/api/machines');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMachine: async (id) => {
    try {
      const response = await client.get(`/api/machines/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMachineTelemetry: async (id, timeRange = '1H') => {
    try {
      const response = await client.get(`/api/machines/${id}/telemetry`, {
        params: { timeRange },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default machinesAPI;
