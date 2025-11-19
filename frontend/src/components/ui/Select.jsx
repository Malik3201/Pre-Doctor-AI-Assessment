import { cn } from '../../utils/cn';

export default function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

