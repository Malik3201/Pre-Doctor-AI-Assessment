import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import ErrorBanner from '../../components/shared/ErrorBanner';
import useTenant from '../../hooks/useTenant';
import apiClient from '../../api/apiClient';
import useAuth from '../../hooks/useAuth';

export default function PatientRegisterPage() {
  const { subdomain, isRoot } = useTenant();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [status, setStatus] = useState({ error: '', success: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!subdomain || isRoot) {
      setStatus({
        error: 'Patient self-registration is only available on hospital-specific subdomains.',
        success: '',
      });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setStatus({ error: 'Passwords do not match.', success: '' });
      return;
    }

    setStatus({ error: '', success: '' });
    setIsSubmitting(true);
    try {
      const payload = { name: form.name.trim(), email: form.email.trim(), password: form.password };
      await apiClient.post('/auth/patient/register', payload, { __isAuthRequest: true });
      await login({ email: payload.email, password: payload.password });
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setStatus({
        error: err?.response?.data?.message || 'Unable to register at this time.',
        success: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Patient Enrollment"
      subtitle="Available only when accessing through your hospital subdomain."
    >
      {status.error && <ErrorBanner message={status.error} className="mb-4" />}
      {status.success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {status.success}
        </div>
      )}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="John Carter"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@domain.com"
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
            placeholder="Create a secure password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Register'}
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">
        Hospital administrators can also create patient accounts manually from their dashboard.
      </p>
    </AuthLayout>
  );
}

