import { cn } from '../../utils/cn';

export default function Label({ className, children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('mb-1 block text-sm font-medium text-slate-600', className)}
    >
      {children}
    </label>
  );
}

