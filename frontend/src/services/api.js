import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// JWT token 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('farmfi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('farmfi_token');
      localStorage.removeItem('farmfi_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
