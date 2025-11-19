import { cn } from '../../utils/cn';

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900',
        className,
      )}
    >
      {Icon && <Icon className="mb-4 h-10 w-10 text-slate-300" />}
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

