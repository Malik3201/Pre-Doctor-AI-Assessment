import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ErrorBanner({ message, className }) {
  if (!message) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700',
        className,
      )}
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}

