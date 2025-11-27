import { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Plus,
  LogOut,
  Heart,
  User,
  Settings,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/apiClient';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { PatientBrandingProvider } from '../context/PatientBrandingContext';
import { cn } from '../utils/cn';

const navLinks = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/checkup/new', label: 'New Checkup', icon: Plus },
  { href: '/app/reports', label: 'My Reports', icon: FileText },
  { href: '/app/settings', label: 'Settings', icon: Settings },
];

export default function PatientLayout({ title, subtitle, actions, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const appointmentWhatsApp = branding.hospital?.settings?.appointmentWhatsApp || '';

  const logo = branding.hospital?.logo;

  return (
    <PatientBrandingProvider value={{ hospitalName, assistantName, colors, appointmentWhatsApp }}>
      <div className="min-h-screen bg-slate-100 text-slate-900">
        {/* Sidebar Navigation */}
        <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-slate-800 bg-slate-950 px-6 py-8 text-white">
          {/* Branding Section */}
          <div className="flex items-center gap-3">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: `${colors.primary}33` }}
            >
              {logo ? (
                <img src={logo} alt={hospitalName} className="h-8 w-8 rounded-xl object-cover" />
              ) : (
                <Heart className="h-5 w-5" style={{ color: colors.secondary }} />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Patient Portal
              </p>
              <p className="truncate text-lg font-semibold">{hospitalName || 'Healthcare'}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-10 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.href}
                  to={link.href}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition',
                      'hover:bg-white/10 hover:text-white',
                      isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400',
                    )
                  }
                  style={({ isActive }) => 
                    isActive ? { backgroundColor: `${colors.primary}20` } : {}
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User Info Panel at Bottom */}
          <div className="mt-auto space-y-3">
            <div className="rounded-2xl border border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                  <User className="h-4 w-4 text-slate-300" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold text-slate-200">{user?.name}</p>
                  <p className="truncate text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 px-4 py-3 text-xs text-slate-400">
              <p className="font-semibold text-slate-200">Patient Access</p>
              <p>Powered by Pre-Doctor AI</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="ml-72 flex min-h-screen flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {hospitalName}
                </p>
                <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
                {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {actions && <div className="flex items-center gap-3">{actions}</div>}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-500" 
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-slate-50">
            <div className="mx-auto w-full max-w-6xl px-8 py-10">
              {branding.isLoading ? (
                <div className="flex min-h-[300px] items-center justify-center">
                  <Spinner className="h-8 w-8 border-slate-300" />
                </div>
              ) : (
                children
              )}
            </div>
          </main>
        </div>
      </div>
    </PatientBrandingProvider>
  );
}

