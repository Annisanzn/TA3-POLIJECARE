import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false, // Changed to false to fix CORS
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Return the full response, not just data
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Handle unauthorized
    if (response?.status === 401) {
      localStorage.removeItem('token');
      // Don't redirect automatically, let the component handle it
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
