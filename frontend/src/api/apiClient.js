import axios from 'axios';
import { triggerAuthLogout } from '../utils/authEvents';

// Extract subdomain from current URL for multi-tenant routing
const extractSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // localhost case: dhq.localhost
  if (parts.length === 2 && parts[1] === 'localhost' && parts[0] !== 'www') {
    return parts[0];
  }
  
  // production case: dhq.yourdomain.com
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }
  
  return null;
};

// Use environment variable for API base URL, fallback to /api for local development
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add subdomain header for multi-tenant routing (works with Vercel backend)
  const subdomain = extractSubdomain();
  if (subdomain) {
    config.headers['X-Tenant-Subdomain'] = subdomain;
  }
  
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !error.config?.__isAuthRequest) {
      triggerAuthLogout({ message: 'Your session expired. Please log in again.' });
    }
    return Promise.reject(error);
  },
);

export default apiClient;

