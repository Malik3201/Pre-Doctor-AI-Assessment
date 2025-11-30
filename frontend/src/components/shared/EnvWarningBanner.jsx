import { envConfig } from '../../config/env';

export default function EnvWarningBanner() {
  if (envConfig.isApiBaseUrlConfigured) {
    return null;
  }

  return (
    <div className="bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
      API base URL is not configured. The app is defaulting to <code>/api</code>. Set
      <code> VITE_API_BASE_URL</code> in Vercel to avoid network errors.
    </div>
  );
}


