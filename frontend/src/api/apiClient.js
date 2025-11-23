import axios from 'axios';
import { triggerAuthLogout } from '../utils/authEvents';

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

