import api from '../api/axios';

export const articleService = {
  getAll: async () => {
    try {
      const response = await api.get('/articles');
      return response;
    } catch (error) {
      throw error;
    }
  },

  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/articles/${slug}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};
