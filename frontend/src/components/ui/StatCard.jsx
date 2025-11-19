import Card from './Card';
import { cn } from '../../utils/cn';

export default function StatCard({ label, value, icon: Icon, change, changeLabel, className }) {
  return (
    <Card className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-semibold text-slate-900 dark:text-white">{value}</span>
        {change && (
          <span
            className={cn(
              'text-xs font-medium',
              change.startsWith('-') ? 'text-rose-500' : 'text-emerald-500',
            )}
          >
            {change} {changeLabel}
          </span>
        )}
      </div>
    </Card>
  );
}

