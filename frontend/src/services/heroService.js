import api from '../api/axios';

export const heroService = {
  get: async () => {
    try {
      const response = await api.get('/hero');
      return response;
    } catch (error) {
      throw error;
    }
  }
};
