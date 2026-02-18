import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000', // Backend URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle 401 Unauthorized - only redirect if not already on home page
    if (response?.status === 401 && window.location.pathname !== '/') {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      console.log('🔐 Token expired, redirecting to home...');
    }
    
    // Handle 403 Forbidden
    if (response?.status === 403) {
      console.error('Access forbidden - insufficient permissions');
    }
    
    // Create a consistent error structure
    const errorData = {
      success: false,
      message: response?.data?.message || 'Terjadi kesalahan pada server',
      errors: response?.data?.errors || null,
      status: response?.status || 500,
      data: response?.data || null
    };
    
    // Return a rejected promise with consistent structure
    return Promise.reject(errorData);
  }
);

export default api;
