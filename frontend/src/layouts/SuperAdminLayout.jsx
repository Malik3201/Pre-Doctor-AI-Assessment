import {
  Activity,
  Building2,
  Cpu,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';

const navLinks = [
  { href: '/super/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/super/hospitals', label: 'Hospitals', icon: Building2 },
  { href: '/super/plans', label: 'Plans', icon: CreditCard },
  { href: '/super/ai-settings', label: 'AI Settings', icon: Cpu },
  { href: '/super/analytics', label: 'Analytics', icon: Activity },
];

export default function SuperAdminLayout({ title, subtitle, actions, children }) {
  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar brand={{ name: 'Super Admin', icon: ShieldCheck }} links={navLinks} />
      <div className="flex flex-1 flex-col bg-slate-50">
        <Topbar title={title} subtitle={subtitle} actions={actions} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

