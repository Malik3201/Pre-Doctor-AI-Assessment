import { cn } from '../../utils/cn';

export default function PageHeader({ title, description, actions, className }) {
  return (
    <div className={cn('mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between', className)}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

