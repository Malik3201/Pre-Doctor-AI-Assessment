import { cn } from '../../utils/cn';

const toneMap = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  high: 'bg-rose-50 text-rose-700 border-rose-100',
};

export default function RiskBadge({ level, className }) {
  const normalized = (level || '').toLowerCase();
  const styles = toneMap[normalized] || 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        styles,
        className,
      )}
    >
      {normalized || 'unknown'} risk
    </span>
  );
}

