import { firebaseConfig } from '../config/firebase';

const API_BASE_URL = firebaseConfig.apiUrl;

export const api = {
  // Example method
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test`);
      return await response.json();
    } catch (error) {
      console.error('Error connecting to backend:', error);
      throw error;
    }
  },
  
  // Add more API methods here
};
