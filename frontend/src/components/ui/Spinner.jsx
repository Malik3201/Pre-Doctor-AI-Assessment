import { cn } from '../../utils/cn';

export default function Spinner({ className }) {
  return (
    <span
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600',
        className,
      )}
    />
  );
}

