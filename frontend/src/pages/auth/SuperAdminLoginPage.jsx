import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import ErrorBanner from '../../components/shared/ErrorBanner';
import useAuth from '../../hooks/useAuth';
import useTenant from '../../hooks/useTenant';

const MotionDiv = motion.div;

export default function SuperAdminLoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { isRoot } = useTenant();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if not on root domain
  if (!isRoot) {
    navigate('/auth/login', { replace: true });
    return null;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { user } = await login(form);
      if (user?.role === 'SUPER_ADMIN') {
        navigate('/super/dashboard', { replace: true });
      } else {
        setError('Access denied. Super Admin credentials required.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to log in. Please verify your credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

      <div className="relative z-10 w-full max-w-md">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-slate-700/50 bg-slate-800/90 backdrop-blur-xl p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30">
                <ShieldCheck className="h-8 w-8 text-amber-400" />
              </div>
            </div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <Lock className="h-3.5 w-3.5" />
              Restricted Access
            </div>
            <h1 className="mt-4 text-3xl font-bold text-white">Super Admin Portal</h1>
            <p className="mt-2 text-sm text-slate-400">
              Platform control and management console
            </p>
          </div>

          {/* Security Notice */}
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p className="text-xs leading-relaxed text-amber-200/90">
              This portal is restricted to authorized Super Administrators only. All access attempts
              are logged and monitored.
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <ErrorBanner message={error} />}

            <div>
              <Label htmlFor="email" className="text-slate-200">
                Administrator Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@predoctorai.online"
                value={form.email}
                onChange={handleChange}
                required
                className="border-slate-600 bg-slate-900/50 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20"
                autoComplete="username"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-200">
                Master Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter master password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="border-slate-600 bg-slate-900/50 pr-10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 focus-visible:outline-amber-500 shadow-lg shadow-amber-500/20"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4 border-white" />
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Lock className="h-4 w-4" />
                  Access Control Panel
                </div>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-slate-700/50 pt-6 text-center">
            <p className="text-xs text-slate-500">
              Pre-Doctor AI Platform Administration
            </p>
            <p className="mt-1 text-xs text-slate-600">
              © {new Date().getFullYear()} All rights reserved
            </p>
          </div>
        </MotionDiv>

        {/* Additional Security Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Forgot your credentials? Contact platform security team.
          </p>
        </div>
      </div>
    </div>
  );
}

