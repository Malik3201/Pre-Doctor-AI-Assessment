import { cn } from '../../utils/cn';

export default function Card({ className, children }) {
  return (
    <div className={cn('rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm', className)}>
      {children}
    </div>
  );
}

