import {
  Activity,
  LayoutDashboard,
  Palette,
  Stethoscope,
  UsersRound,
  Building2,
  LogOut,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';

const navLinks = [
  { href: '/hospital/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/hospital/settings', label: 'Branding & AI', icon: Palette },
  { href: '/hospital/doctors', label: 'Doctors', icon: Stethoscope },
  { href: '/hospital/patients', label: 'Patients', icon: UsersRound },
  { href: '/hospital/analytics', label: 'Analytics', icon: Activity },
];

export default function HospitalAdminLayout({
  title,
  subtitle,
  actions,
  children,
  hospitalName = 'Hospital',
}) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-slate-800 bg-slate-950 px-6 py-8 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Hospital</p>
            <p className="text-lg font-semibold line-clamp-1">{hospitalName}</p>
          </div>
        </div>
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
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 px-4 py-3 text-xs text-slate-400">
          <p className="font-semibold text-slate-200">Hospital Admin</p>
          <p>Management Console</p>
        </div>
      </aside>

      <div className="ml-72 flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-8 py-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Hospital Admin</p>
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {actions && <div className="flex items-center gap-3">{actions}</div>}
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-500">{user?.email || 'admin@hospital.com'}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-500" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-slate-50">
          <div className="mx-auto w-full max-w-6xl px-8 py-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

