import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

const defaultBranding = {
  mode: 'loading',
  name: 'Pre-Doctor AI',
  logo: null,
  primaryColor: '#0F62FE',
  secondaryColor: '#020617',
  tagline: 'Hospital Intelligence Suite',
  subdomain: null,
};

const HospitalBrandingContext = createContext({
  loading: true,
  error: null,
  branding: defaultBranding,
  refresh: () => {},
});

export function HospitalBrandingProvider({ children }) {
  const [branding, setBranding] = useState(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBranding = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get('/public/hospital-meta', { __isPublicRequest: true });
      setBranding({
        ...defaultBranding,
        ...data,
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to load hospital branding meta', err);
      setBranding({
        ...defaultBranding,
        mode: 'global',
      });
      setError('Unable to load brand information. Showing default experience.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  return (
    <HospitalBrandingContext.Provider
      value={{
        loading,
        error,
        branding,
        refresh: fetchBranding,
      }}
    >
      {children}
    </HospitalBrandingContext.Provider>
  );
}

export function useHospitalBranding() {
  const context = useContext(HospitalBrandingContext);
  if (!context) {
    throw new Error('useHospitalBranding must be used within a HospitalBrandingProvider');
  }
  return context;
}

