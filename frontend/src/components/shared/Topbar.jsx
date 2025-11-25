import { Menu, Bell, LogOut } from 'lucide-react';
import Button from '../ui/Button';
import useAuth from '../../hooks/useAuth';

export default function Topbar({ title, subtitle, actions }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Overview</p>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {actions}
        <button
          type="button"
          className="hidden rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 md:inline-flex"
          aria-label="Toggle navigation"
        >
          <Menu className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div className="text-left">
          <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
          <p className="text-xs text-slate-500">{user?.role}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={logout} className="text-slate-500">
          <LogOut className="mr-1 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}

