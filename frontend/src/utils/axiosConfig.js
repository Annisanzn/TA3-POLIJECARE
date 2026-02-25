import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor — tambahkan token auth
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

// Response interceptor — jangan ubah struktur error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized — hapus token dan redirect jika bukan di halaman home
    if (error.response?.status === 401 && window.location.pathname !== '/') {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      console.log('🔐 Token expired or invalid, redirecting to home...');
      window.location.href = '/';
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden - insufficient permissions');
    }

    // Jangan ubah struktur error — biarkan error asli terpropagasi
    return Promise.reject(error);
  }
);

export default api;
