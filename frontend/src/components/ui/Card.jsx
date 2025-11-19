import { cn } from '../../utils/cn';

export default function Card({ className, children }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900', className)}>
      {children}
    </div>
  );
}

