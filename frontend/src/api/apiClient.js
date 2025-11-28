import axios from 'axios';
import { triggerAuthLogout } from '../utils/authEvents';
import { getBrowserTenant } from '../utils/tenant';
import { API_BASE_URL, envConfig } from '../config/env';

// Use environment variable for API base URL, fallback to /api for local development
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

if (!envConfig.isApiBaseUrlConfigured) {
  console.info('[API] Using fallback base URL:', API_BASE_URL);
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add subdomain header for multi-tenant routing (works with Vercel backend)
  const tenant = typeof window !== 'undefined' ? getBrowserTenant() : null;
  if (tenant?.subdomain) {
    config.headers['X-Tenant-Subdomain'] = tenant.subdomain;
    console.log('✅ Sending X-Tenant-Subdomain header:', tenant.subdomain);
  } else if (tenant) {
    console.log('⚠️ No subdomain detected. Current hostname:', tenant.host || 'root domain');
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 && !error.config?.__isAuthRequest && !error.config?.__isPublicRequest) {
      triggerAuthLogout({ message: 'Your session expired. Please log in again.' });
    }
    return Promise.reject(error);
  },
);

export default apiClient;

