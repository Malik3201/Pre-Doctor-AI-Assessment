/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ToastContainer from '../components/ui/ToastContainer';

export const ToastContext = createContext({
  showToast: () => {},
  dismissToast: () => {},
});

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ title, description, variant = 'info', duration = 5000 }) => {
      toastId += 1;
      const id = toastId;
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
    },
    [dismissToast],
  );

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex justify-center px-4 sm:justify-end sm:px-6">
        <AnimatePresence initial={false}>
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

