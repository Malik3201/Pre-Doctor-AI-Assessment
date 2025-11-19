import {
  Activity,
  LayoutDashboard,
  Palette,
  Stethoscope,
  UsersRound,
  Building2,
} from 'lucide-react';
import Sidebar from '../components/shared/Sidebar';
import Topbar from '../components/shared/Topbar';

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
  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar brand={{ name: hospitalName, icon: Building2 }} links={navLinks} />
      <div className="flex flex-1 flex-col bg-slate-50">
        <Topbar title={title} subtitle={subtitle} actions={actions} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

