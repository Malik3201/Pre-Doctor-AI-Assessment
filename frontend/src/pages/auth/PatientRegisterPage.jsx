import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import ErrorBanner from '../../components/shared/ErrorBanner';
import Spinner from '../../components/ui/Spinner';
import useTenant from '../../hooks/useTenant';
import apiClient from '../../api/apiClient';
import useAuth from '../../hooks/useAuth';
import { useHospitalBranding } from '../../context/HospitalBrandingContext';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function PatientRegisterPage() {
  const { subdomain, isRoot } = useTenant();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { branding, loading: brandingLoading, error: brandingError } = useHospitalBranding();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    gender: 'prefer_not_to_say',
    cnic: '',
  });
  const [status, setStatus] = useState({ error: '', success: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (branding.mode === 'global' || !subdomain) {
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

    const parsedAge = Number(form.age);
    if (Number.isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      setStatus({ error: 'Please provide a valid age between 1 and 120.', success: '' });
      return;
    }

    const nextErrors = {};
    const cleanedCnic = form.cnic.replace(/\D/g, '');
    if (!cleanedCnic) {
      nextErrors.cnic = 'CNIC is required.';
    } else if (!/^\d{13}$/.test(cleanedCnic)) {
      nextErrors.cnic = 'Please enter a valid 13-digit CNIC.';
    }

    if (Object.keys(nextErrors).length) {
      setFormErrors(nextErrors);
      return;
    }

    setFormErrors({});
    setStatus({ error: '', success: '' });
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        age: parsedAge,
        gender: form.gender,
        cnic: form.cnic.trim(),
      };
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

  const layoutSubtitle =
    branding.mode === 'hospital'
      ? `Register as a patient of ${branding.name}`
      : 'Available only when accessing through your hospital subdomain.';

  if (brandingLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <AuthLayout title="Patient Enrollment" subtitle={layoutSubtitle}>
      {brandingError && (
        <ErrorBanner message={brandingError} className="mb-4" />
      )}
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
          <Label htmlFor="cnic">CNIC / National ID</Label>
          <Input
            id="cnic"
            name="cnic"
            placeholder="12345-1234567-1"
            value={form.cnic}
            onChange={handleChange}
            required
          />
          {formErrors.cnic && <p className="mt-1 text-xs text-rose-600">{formErrors.cnic}</p>}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a secure password"
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
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            name="age"
            type="number"
            min="1"
            max="120"
            placeholder="e.g. 32"
            value={form.age}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select id="gender" name="gender" value={form.gender} onChange={handleChange}>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || branding.mode === 'global' || !subdomain}
          style={{ backgroundColor: branding.primaryColor || '#0F62FE' }}
        >
          {isSubmitting ? 'Submitting...' : 'Register'}
        </Button>
      </form>
      <p className="mt-6 text-center text-xs text-slate-500">
        Hospital administrators can also create patient accounts manually from their dashboard.
      </p>
    </AuthLayout>
  );
}

