import { cn } from '../../utils/cn';

export default function Switch({ checked = false, onChange, label, className }) {
  return (
    <label className={cn('flex items-center gap-3 text-sm font-medium text-slate-700', className)}>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition',
          checked ? 'bg-blue-600' : 'bg-slate-300',
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 rounded-full bg-white shadow transition',
            checked ? 'translate-x-5' : 'translate-x-1',
          )}
        />
      </button>
      {label && <span className="text-slate-600">{label}</span>}
    </label>
  );
}

