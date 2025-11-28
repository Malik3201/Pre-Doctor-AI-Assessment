const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = rawApiBaseUrl || '/api';

export const envConfig = {
  rawApiBaseUrl,
  apiBaseUrl: API_BASE_URL,
  isApiBaseUrlConfigured: Boolean(rawApiBaseUrl),
  warnings: rawApiBaseUrl ? [] : ['VITE_API_BASE_URL is not set; falling back to /api.'],
};

if (!envConfig.isApiBaseUrlConfigured) {
  console.warn('[Env] VITE_API_BASE_URL missing. Defaulting to /api.');
}

