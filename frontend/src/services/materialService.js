import axios from '../api/axios';

const materialService = {
  // Get materials with pagination and filters
  async getMaterials(params = {}) {
    const response = await axios.get('/operator/materials', { params });
    return response.data;
  },

  // Upload material (file or link)
  async createMaterial(formData) {
    const response = await axios.post('/operator/materials', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete material
  async deleteMaterial(id) {
    const response = await axios.delete(`/operator/materials/${id}`);
    return response.data;
  },

  // Get file URL
  getFileUrl(filePath) {
    if (!filePath) return '#';
    // Encode the file path to handle spaces and special characters
    const encodedPath = encodeURIComponent(filePath);
    return `${axios.defaults.baseURL}/storage/${encodedPath}`;
  },
};

export default materialService;
