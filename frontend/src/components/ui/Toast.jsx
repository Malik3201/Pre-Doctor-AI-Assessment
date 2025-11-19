import { motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const variantMap = {
  success: {
    icon: CheckCircle2,
    styles: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  },
  error: {
    icon: TriangleAlert,
    styles: 'bg-rose-50 border-rose-200 text-rose-800',
  },
  warning: {
    icon: TriangleAlert,
    styles: 'bg-amber-50 border-amber-200 text-amber-800',
  },
  info: {
    icon: Info,
    styles: 'bg-slate-50 border-slate-200 text-slate-800',
  },
};

export default function Toast({ toast, onDismiss }) {
  const MotionDiv = motion.div;
  const config = variantMap[toast.variant] || variantMap.info;
  const Icon = config.icon;

  return (
    <MotionDiv
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg',
        config.styles,
      )}
    >
      <Icon className="mt-0.5 h-5 w-5" />
      <div className="flex-1 text-sm">
        {toast.title && <p className="font-semibold">{toast.title}</p>}
        {toast.description && <p className="mt-0.5 text-xs opacity-90">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-full p-1 text-slate-500 transition hover:bg-white/60"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </MotionDiv>
  );
}

