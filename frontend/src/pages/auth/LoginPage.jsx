import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import useAuth from '../../hooks/useAuth';
import { useHospitalBranding } from '../../context/HospitalBrandingContext';
import useTenant from '../../hooks/useTenant';
import HospitalSubdomainGuide from '../../components/shared/HospitalSubdomainGuide';
import Card from '../../components/ui/Card';

const roleRedirects = {
  SUPER_ADMIN: '/super/dashboard',
  HOSPITAL_ADMIN: '/hospital/dashboard',
  PATIENT: '/app/dashboard',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { branding, loading: brandingLoading } = useHospitalBranding();
  const { isRoot } = useTenant();
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const hostParts = useMemo(() => (hostname ? hostname.split('.').filter(Boolean) : []), [hostname]);
  const isHospitalPortal =
    hostParts.length > 2 ||
    (hostParts.length === 2 && hostParts[1] === 'localhost' && hostParts[0] !== 'localhost');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { user } = await login(form);
      const destination = roleRedirects[user?.role] || '/auth/login';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to log in. Please verify your credentials.');
    }
  };

  const layoutSubtitle =
    branding.mode === 'hospital'
      ? `Sign in to ${branding.name}`
      : 'Sign in to continue';

  if (brandingLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  // Check if subdomain exists: if mode is 'not_found', hospital doesn't exist in DB
  const { subdomain } = useTenant();
  const hospitalNotFound = branding.mode === 'not_found' || (!isRoot && subdomain && branding.mode === 'global');

  // Hospital not found error page
  if (hospitalNotFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
        <div className="w-full max-w-4xl">
          <Card className="border-slate-200 bg-white shadow-xl">
            <div className="space-y-8 p-8">
              {/* Error Header */}
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                    <svg
                      className="h-8 w-8 text-rose-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <h1 className="mb-2 text-3xl font-bold text-slate-900">Hospital Not Found</h1>
                <p className="text-lg text-slate-600">
                  Please enter the correct hospital name (subdomain)
                </p>
              </div>

              {/* Subdomain Guide */}
              <div className="border-t border-slate-200 pt-8">
                <HospitalSubdomainGuide hostname={hostname} />
              </div>

              {/* Contact Message */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Or contact your hospital</span> for the correct
                  domain name
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Render login form content (reusable for both layouts)
  const loginForm = (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && <ErrorBanner message={error} />}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@hospital.com"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        style={{ backgroundColor: branding.primaryColor || '#0F62FE' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Spinner className="h-4 w-4 border-white" />
            Signing in...
          </div>
        ) : (
          'Sign In'
        )}
      </Button>
      {!isRoot && !isHospitalPortal && (
        <p className="text-center text-sm text-slate-500">
          Patients registering? Please switch to your hospital subdomain and use the register
          option.
        </p>
      )}

      {isHospitalPortal && <HospitalPatientRegisterCTA />}
    </form>
  );

  // Root domain: Full page guidance panel only
  if (isRoot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
        <div className="w-full max-w-4xl">
          <HospitalSubdomainGuide hostname={hostname} />
        </div>
      </div>
    );
  }

  // Hospital subdomain: Use existing AuthLayout (single column with hero)
  return (
    <AuthLayout title="Secure Access" subtitle={layoutSubtitle}>
      {loginForm}
    </AuthLayout>
  );
}

function HospitalPatientRegisterCTA() {
  const navigate = useNavigate();

  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
      <p className="mb-2 text-sm font-semibold text-slate-700">New patient?</p>
      <p className="text-sm text-slate-500">
        Register as a patient of this hospital to continue your AI pre-assessment and keep your
        reports linked to this care team.
      </p>
      <Button
        type="button"
        onClick={() => navigate('/auth/patient/register')}
        className="mt-4 w-full bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:outline-emerald-600"
      >
        Register as a patient
      </Button>
    </div>
  );
}

