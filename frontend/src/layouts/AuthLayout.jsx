import { ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-slate-900" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <ShieldCheck className="h-8 w-8" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Pre-Doctor AI</p>
              <p className="text-2xl font-semibold">Hospital Intelligence Suite</p>
            </div>
          </div>
          <p className="mt-12 max-w-sm text-sm text-slate-300">
            Deliver a calm, guided pre-assessment experience for every patient while keeping your
            care teams coordinated and informed.
          </p>
        </div>
        <div className="relative z-10 text-sm text-slate-400">
          Secure • Multi-tenant • HIPAA-ready (target)
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl"
        >
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-wide text-blue-600">{title}</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-900">Pre-Doctor AI</h2>
            {subtitle && <p className="mt-2 text-sm text-slate-500">{subtitle}</p>}
          </div>
          {children}
        </MotionDiv>
      </div>
    </div>
  );
}

