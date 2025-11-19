import { NavLink } from 'react-router-dom';
import { cn } from '../../utils/cn';

export default function Sidebar({ brand, links = [], footer, className }) {
  const BrandIcon = brand?.icon;
  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-shrink-0 flex-col border-r border-slate-200/20 bg-slate-950 px-6 py-8 text-white',
        className,
      )}
    >
      <div className="mb-8 flex items-center gap-3">
        {BrandIcon && <BrandIcon className="h-6 w-6 text-blue-400" />}
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Pre-Doctor AI</p>
          <p className="text-lg font-semibold">{brand?.name || 'Control Center'}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => (
          <NavLink key={link.href} to={link.href} className="block">
            {({ isActive }) => (
              <div
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5',
                  isActive && 'bg-white/10 text-white shadow-inner',
                )}
              >
                <span
                  className={cn(
                    'absolute left-0 top-2 h-6 w-1 rounded-full bg-transparent transition',
                    isActive && 'bg-blue-400',
                  )}
                />
                <div className="flex w-full items-center gap-3">
                  {link.icon && (
                    <link.icon className={cn('h-4 w-4', isActive ? 'text-blue-200' : 'text-slate-400')} />
                  )}
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="ml-auto rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-100">
                      {link.badge}
                    </span>
                  )}
                </div>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {footer && <div className="pt-6 text-xs text-slate-500">{footer}</div>}
    </aside>
  );
}

