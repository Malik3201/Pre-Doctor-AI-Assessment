import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Activity, Building2, Sparkles, Stethoscope } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import useTenant from '../../hooks/useTenant';
import useAuth from '../../hooks/useAuth';

const features = [
  {
    title: 'Super Admin Control',
    description: 'Manage hospitals, plans, AI providers, and usage limits from a single command center.',
    icon: Building2,
  },
  {
    title: 'Hospital Branding & Care',
    description: 'Every hospital gets its own portal, branding, doctors directory, and patient governance.',
    icon: Stethoscope,
  },
  {
    title: 'Patient AI Checkups',
    description: 'Guided AI pre-assessments create structured reports for physicians before appointments.',
    icon: Sparkles,
  },
];

const steps = [
  'Hospitals join the platform and configure their branding.',
  'Admins onboard doctors and set AI usage policies.',
  'Patients complete AI-guided symptom assessments on hospital subdomains.',
  'Doctors review structured reports before consultations.',
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isRoot } = useTenant();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isRoot) {
      if (isAuthenticated) {
        if (user?.role === 'PATIENT') navigate('/app/dashboard', { replace: true });
        else if (user?.role === 'HOSPITAL_ADMIN') navigate('/hospital/dashboard', { replace: true });
        else if (user?.role === 'SUPER_ADMIN') navigate('/super/dashboard', { replace: true });
      } else {
        navigate('/auth/login', { replace: true });
      }
    }
  }, [isRoot, isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <Activity className="h-3.5 w-3.5 text-blue-500" />
          Pre-Doctor AI SaaS
        </div>
        <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
          Calm, hospital-grade AI pre-assessments for every patient
        </h1>
        <p className="max-w-3xl text-base text-slate-600 md:text-lg">
          Pre-Doctor AI lets hospital networks deploy branded patient portals that capture symptoms,
          generate structured reports, and equip physicians with context before appointments.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button as={Link} to="/auth/login">
            Hospital Admin Login
          </Button>
          <Button as={Link} to="/auth/patient/register" variant="outline">
            Patient Portal
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-6 pb-20">
        <section className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="h-full space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </Card>
            );
          })}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-blue-600">How it works</p>
              <h2 className="text-2xl font-semibold text-slate-900">End-to-end care workflow</h2>
            </div>
            <Button as={Link} to="/auth/login" variant="outline">
              Talk to us
            </Button>
          </div>
          <ol className="mt-6 grid gap-6 md:grid-cols-2">
            {steps.map((step, index) => (
              <li key={step} className="rounded-2xl border border-slate-100 p-5 text-sm text-slate-600">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-8 text-center text-sm text-slate-500 md:flex-row md:justify-between md:text-left">
          <p>© {new Date().getFullYear()} Pre-Doctor AI. Multi-tenant clinical intelligence.</p>
          <div className="flex items-center gap-4">
            <Link className="font-medium text-blue-600 hover:text-blue-500" to="/auth/login">
              Admin Login
            </Link>
            <Link className="font-medium text-blue-600 hover:text-blue-500" to="/auth/patient/register">
              Patient Portal
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

