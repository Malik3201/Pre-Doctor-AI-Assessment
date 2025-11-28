import { DEFAULT_TENANT, getBrowserTenant } from '../utils/tenant';

export default function useTenant() {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_TENANT };
  }

  return getBrowserTenant();
}

