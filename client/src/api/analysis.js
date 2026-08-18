// Analysis API
// API methods for analysis and incident endpoints

import client from './client';

export const analysisAPI = {
  getDashboardSummary: async () => {
    try {
      const response = await client.get('/api/analysis/summary');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  analyzeAllMachines: async () => {
    try {
      const response = await client.post('/api/analysis/all');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  analyzeMachine: async (machineId) => {
    try {
      const response = await client.post(`/api/analysis/machine/${machineId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPendingMaintenance: async () => {
    try {
      const response = await client.get('/api/maintenance/pending');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getMachineMaintenanceHistory: async (machineId, limit = 20) => {
    try {
      const response = await client.get(`/api/maintenance/machine/${machineId}`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateWorkOrderStatus: async (workOrderId, status) => {
    try {
      const response = await client.patch(`/api/maintenance/${workOrderId}`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default analysisAPI;
