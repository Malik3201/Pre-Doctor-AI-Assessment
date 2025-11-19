import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import useAuth from '../../hooks/useAuth';

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

  return (
    <AuthLayout title="Secure Access" subtitle="Sign in to continue">
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
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner className="h-4 w-4 border-white" />
              Signing in...
            </div>
          ) : (
            'Sign In'
          )}
        </Button>
        <p className="text-center text-sm text-slate-500">
          Patients registering? Please switch to your hospital subdomain and use the register
          option.
        </p>
      </form>
    </AuthLayout>
  );
}

