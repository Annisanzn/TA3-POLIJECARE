import axios from '../api/axios';

export const userService = {
  // Get users with pagination and filters
  getUsers: async (params = {}) => {
    const response = await axios.get('/operator/users', {
      params: {
        page: params.page ?? 1,
        per_page: params.per_page ?? 6,
        search: params.search ?? '',
        role: params.role ?? 'all',
      },
    });

    return response.data;
  },

  // Get user statistics
  getUserStats: async () => {
    try {
      // Try authenticated route first
      const response = await axios.get('/operator/users-stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats from /operator/users-stats:', error);
      
      // Fallback: get stats from test-users endpoint
      try {
        console.log('Trying fallback route /test-users for stats...');
        const response = await axios.get('/test-users', {
          params: {
            page: 1,
            per_page: 1,
          }
        });
        
        if (response.success && response.data?.stats) {
          return {
            success: true,
            data: response.data.stats
          };
        }
        throw new Error('No stats in response');
      } catch (fallbackError) {
        console.error('Error fetching user stats from fallback route:', fallbackError);
        
        if (error.response?.status === 401 || fallbackError.response?.status === 401) {
          console.warn('Authentication failed. Please login as operator.');
        }
        throw error;
      }
    }
  },

  // Create a new user
  createUser: async (userData) => {
    try {
      const response = await axios.post('/operator/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update a user
  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(`/operator/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`/operator/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};