// src/axios.js
import axios from 'axios';

// Create instance
const api = axios.create({
  baseURL: `${import.meta.env.BASE_URL}`, // Adjust based on your backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor (optional for token refresh or error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You could handle unauthorized here, e.g., logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default api;
