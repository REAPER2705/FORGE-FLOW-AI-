// Work Orders API
// API methods for work order endpoints

import client from './client';

export const workOrdersAPI = {
  getAllWorkOrders: async () => {
    try {
      const response = await client.get('/api/work-orders');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createWorkOrder: async (data) => {
    try {
      const response = await client.post('/api/work-orders', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateWorkOrder: async (id, data) => {
    try {
      const response = await client.patch(`/api/work-orders/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default workOrdersAPI;
