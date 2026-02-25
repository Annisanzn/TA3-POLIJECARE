import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor — tambahkan token auth jika ada
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

// Response interceptor — kembalikan response asli, jangan ubah struktur error
api.interceptors.response.use(
  (response) => {
    // Kembalikan full response tanpa modifikasi
    return response;
  },
  (error) => {
    // Handle 401 — hapus token invalid
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
    }

    // Jangan ubah struktur error — biarkan komponen yang menanganinya
    // Ini penting agar error.response, error.response.data, dll tetap ada
    return Promise.reject(error);
  }
);

export default api;
