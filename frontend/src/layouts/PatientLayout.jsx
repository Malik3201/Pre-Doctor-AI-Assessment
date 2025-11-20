import { useEffect, useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/apiClient';
import Spinner from '../components/ui/Spinner';
import { PatientBrandingProvider } from '../context/PatientBrandingContext';

export default function PatientLayout({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [branding, setBranding] = useState({ hospital: null, isLoading: true, error: '' });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const response = await apiClient.get('/hospital/settings');
        if (isMounted) {
          setBranding({ hospital: response.data?.hospital, isLoading: false, error: '' });
        }
      } catch (err) {
        if (isMounted) {
          setBranding({
            hospital: null,
            isLoading: false,
            error: err?.response?.data?.message || 'Unable to load hospital branding.',
          });
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const colors = useMemo(() => {
    const primary = branding.hospital?.primaryColor || '#0f172a';
    const secondary = branding.hospital?.secondaryColor || '#38bdf8';
    return { primary, secondary };
  }, [branding.hospital]);

  const resolvedHospitalName =
    branding.hospital?.name ||
    branding.hospital?.settings?.hospitalName ||
    branding.hospital?.displayName ||
    '';
  const hospitalName = resolvedHospitalName || (branding.isLoading ? '' : 'Your Hospital');

  const assistantName =
    branding.hospital?.settings?.assistantName ||
    branding.hospital?.assistantName ||
    'AI assistant';

  const logo = branding.hospital?.logo;

  const isDashboard = location.pathname === '/app/dashboard';

  return (
    <PatientBrandingProvider value={{ hospitalName, assistantName, colors }}>
      <div className="min-h-screen bg-slate-50">
      <header
        className="border-b bg-white px-6 py-4"
        style={{ borderColor: `${colors.primary}33`, boxShadow: `0 1px 0 ${colors.primary}22` }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wide" style={{ color: colors.primary }}>
              {hospitalName}
            </p>
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition"
              style={{
                border: `1px solid ${colors.primary}33`,
                color: colors.primary,
                backgroundColor: 'white',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = `${colors.primary}0d`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <LogOut className="mr-1 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {branding.isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Spinner className="h-8 w-8 border-slate-300" />
          </div>
        ) : (
          <>
            {!isDashboard && (
              <button
                type="button"
                onClick={() => navigate('/app/dashboard')}
                className="mb-6 text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                &larr; Back to dashboard
              </button>
            )}
            {actions && <div className="mb-6 flex items-center justify-end">{actions}</div>}
            {children}
          </>
        )}
      </main>
      </div>
    </PatientBrandingProvider>
  );
}

