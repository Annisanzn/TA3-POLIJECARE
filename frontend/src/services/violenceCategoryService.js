import axios from '../api/axios';

const violenceCategoryService = {
  // Get categories with pagination and search
  async getCategories(params = {}) {
    const response = await axios.get('/operator/categories', { params });
    return response.data;
  },

  // Create new category
  async createCategory(categoryData) {
    const response = await axios.post('/operator/categories', categoryData);
    return response.data;
  },

  // Update category
  async updateCategory(id, categoryData) {
    const response = await axios.put(`/operator/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category
  async deleteCategory(id) {
    const response = await axios.delete(`/operator/categories/${id}`);
    return response.data;
  },
};

export default violenceCategoryService;
