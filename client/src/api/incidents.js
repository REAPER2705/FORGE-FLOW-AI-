// Incidents API
// API methods for incident endpoints

import client from './client';

export const incidentsAPI = {
  getAllIncidents: async () => {
    try {
      const response = await client.get('/api/incidents');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getIncident: async (id) => {
    try {
      const response = await client.get(`/api/incidents/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createIncident: async (data) => {
    try {
      const response = await client.post('/api/incidents', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default incidentsAPI;
