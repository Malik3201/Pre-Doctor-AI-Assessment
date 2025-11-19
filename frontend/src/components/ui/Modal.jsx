import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const modalRoot = typeof document !== 'undefined' ? document.body : null;

export default function Modal({ open, onClose, title, children, footer, className }) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !modalRoot) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-8">
      <div
        className={cn(
          'relative w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>
        {title && <h3 className="mb-6 text-xl font-semibold text-slate-900">{title}</h3>}
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    modalRoot,
  );
}

