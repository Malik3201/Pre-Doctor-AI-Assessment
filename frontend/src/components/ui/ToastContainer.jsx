import Toast from './Toast';

export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="flex w-full max-w-sm flex-col gap-3 sm:max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
}

