// Telemetry API
// API methods for telemetry endpoints

import client from './client';

export const telemetryAPI = {
  getAllTelemetry: async () => {
    try {
      const response = await client.get('/api/telemetry');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getTelemetryByMachine: async (machineId, limit = 50) => {
    try {
      const response = await client.get(`/api/telemetry/${machineId}`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default telemetryAPI;
