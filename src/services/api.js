// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = {
  // Get all batches
  fetchBatches: async () => {
    try {
      const response = await axios.get(`${API_URL}/batches`);
      return response.data;
    } catch (error) {
      console.error('Error fetching batches:', error);
      throw error;
    }
  },

  // Add a new batch
  createBatch: async (batchData) => {
    try {
      const response = await axios.post(`${API_URL}/batches`, batchData);
      return response.data;
    } catch (error) {
      console.error('Error creating batch:', error);
      throw error;
    }
  },

  // Update a batch
  updateBatch: async (id, batchData) => {
    try {
      const response = await axios.put(`${API_URL}/batches/${id}`, batchData);
      return response.data;
    } catch (error) {
      console.error(`Error updating batch ${id}:`, error);
      throw error;
    }
  },

  // Delete a batch
  deleteBatch: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/batches/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting batch ${id}:`, error);
      throw error;
    }
  }
};

export default api;