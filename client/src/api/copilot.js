// Copilot API
// API methods for AI copilot endpoints

import client from './client';

export const copilotAPI = {
  query: async (query) => {
    try {
      const response = await client.post('/api/copilot', { query });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default copilotAPI;
