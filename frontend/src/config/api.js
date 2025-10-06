import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Uses the proxy in development
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Get the specific error message from the backend if it exists, otherwise show a generic message
    const message = error.response?.data?.message || 'An unexpected server error occurred. Please try again later.';
    
    // Don't show a toast for validation errors (status 400), as the component will handle it.
    if (error.response?.status === 400) {
        return Promise.reject(error);
    }
    
    if (error.response?.status === 401) {
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    } else {
      // Show the specific or generic error message for all other errors.
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;