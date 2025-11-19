import { useEffect, useMemo, useState } from 'react';
import { LogOut } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/apiClient';
import Spinner from '../components/ui/Spinner';
import ErrorBanner from '../components/shared/ErrorBanner';

export default function PatientLayout({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth();
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

  const logo = branding.hospital?.logo;
  const hospitalName = branding.hospital?.name || 'Your Hospital';

  return (
    <div className="min-h-screen bg-slate-50">
      <header
        className="border-b bg-white px-6 py-4"
        style={{ borderColor: `${colors.primary}1a` }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            {logo ? (
              <img src={logo} alt={hospitalName} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <div
                className="h-10 w-10 rounded-full"
                style={{ backgroundColor: `${colors.primary}26` }}
              />
            )}
            <div>
              <p
                className="text-xs uppercase tracking-wide"
                style={{ color: colors.primary }}
              >
                {hospitalName}
              </p>
              <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="mr-1 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {branding.error && (
        <div className="mx-auto max-w-4xl px-6 pt-4">
          <ErrorBanner message={branding.error} />
        </div>
      )}

      <main className="mx-auto max-w-4xl px-6 py-8">
        {branding.isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Spinner className="h-8 w-8 border-slate-300" />
          </div>
        ) : (
          <>
            {actions && <div className="mb-6 flex items-center justify-end">{actions}</div>}
            {children}
          </>
        )}
      </main>
    </div>
  );
}

