import { ShieldCheck, Zap, Lock, Users, Activity, CheckCircle2, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHospitalBranding } from '../context/HospitalBrandingContext';
import Spinner from '../components/ui/Spinner';

const MotionDiv = motion.div;

export default function AuthLayout({ children, title, subtitle }) {
  const { loading, branding, error: brandingError } = useHospitalBranding();

  const heroTitle = branding.mode === 'hospital' ? branding.name : 'Pre-Doctor AI';
  const heroSubtitle =
    branding.mode === 'hospital'
      ? `Smart pre-assessment intake for ${branding.name} patients.`
      : branding.tagline;
  const cardTitle =
    branding.mode === 'hospital' ? `${branding.name}` : 'Pre-Doctor AI';
  const cardSubtitle =
    branding.mode === 'hospital' ? `You are signing into: ${branding.name}` : subtitle;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  const primaryColor = branding.primaryColor || '#0F62FE';
  const bgStyle = { backgroundColor: primaryColor };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div
        className="relative hidden min-h-screen flex-1 flex-col overflow-hidden p-12 text-white lg:flex"
        style={bgStyle}
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-slate-900"
          style={{
            background: `linear-gradient(to bottom right, ${primaryColor}20, transparent 50%, ${primaryColor})`,
          }}
        />
        <div className="relative z-10 flex h-full flex-col">
          {/* Header Section */}
          <div>
            <div className="flex items-center gap-3 text-white">
              {branding.logo ? (
                <img
                  src={branding.logo}
                  alt={branding.name}
                  className="h-12 w-12 rounded-xl object-contain shadow-lg"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 shadow-lg">
                  <ShieldCheck className="h-7 w-7" />
                </div>
              )}
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  {branding.mode === 'hospital' ? 'Portal' : 'Pre-Doctor AI'}
                </p>
                <p className="text-3xl font-bold">{heroTitle}</p>
              </div>
            </div>

            {/* Main Description */}
            <div className="mt-8 max-w-md">
              <h2 className="text-xl font-semibold text-white">
                {branding.mode === 'hospital'
                  ? 'Streamlined Healthcare Experience'
                  : 'Intelligent Healthcare Platform'}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white/90">
                {branding.mode === 'hospital'
                  ? `Experience faster, smarter pre-assessment at ${branding.name}. Our AI-powered platform helps you prepare for your visit, reducing wait times and ensuring you receive the most appropriate care.`
                  : 'Transform patient intake with AI-driven pre-assessment. Reduce administrative burden, improve care coordination, and deliver exceptional patient experiences across your healthcare network.'}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 grid grid-cols-1 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-start gap-3 rounded-lg bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">AI-Powered Assessment</h3>
                  <p className="mt-1 text-sm text-white/80">
                    {branding.mode === 'hospital'
                      ? 'Get instant, intelligent pre-screening before your appointment'
                      : 'Advanced AI analyzes patient data for accurate pre-assessment'}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 rounded-lg bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Time-Saving</h3>
                  <p className="mt-1 text-sm text-white/80">
                    {branding.mode === 'hospital'
                      ? 'Complete your intake in minutes, not hours'
                      : 'Reduce patient wait times and streamline workflows'}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 rounded-lg bg-white/5 p-4 backdrop-blur-sm"
              >
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Lock className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Secure & Private</h3>
                  <p className="mt-1 text-sm text-white/80">
                    {branding.mode === 'hospital'
                      ? 'Your health information is encrypted and protected'
                      : 'Enterprise-grade security with HIPAA compliance'}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Badge */}
            {branding.mode === 'hospital' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Powered by Pre-Doctor AI
                </span>
              </motion.div>
            )}
          </div>

          {/* Footer Section */}
          <div className="mt-auto pt-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Multi-tenant</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>HIPAA-ready</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-white/60">
              {branding.mode === 'hospital'
                ? `© ${new Date().getFullYear()} ${branding.name}. All rights reserved.`
                : '© 2024 Pre-Doctor AI. All rights reserved.'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl"
        >
          <div className="mb-8">
            <p
              className="text-sm font-medium uppercase tracking-wide text-blue-600"
              style={{ color: primaryColor }}
            >
              {title}
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">{cardTitle}</h2>
            {cardSubtitle && <p className="mt-2 text-sm text-slate-500">{cardSubtitle}</p>}
            {brandingError && (
              <p className="mt-4 text-sm text-rose-600">
                {brandingError} Falling back to global branding.
              </p>
            )}
          </div>
          {children}
        </MotionDiv>
      </div>
    </div>
  );
}

