import api from '../api/axios';

export const contactService = {
  get: async () => {
    try {
      const response = await api.get('/contact');
      return response;
    } catch (error) {
      throw error;
    }
  }
};
