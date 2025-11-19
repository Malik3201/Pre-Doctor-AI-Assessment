import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">404</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-4 max-w-sm text-sm text-slate-500">
        The route you are trying to access does not exist. Double-check the path or return to the
        dashboard.
      </p>
      <Button as={Link} to="/auth/login" className="mt-8">
        Back to login
      </Button>
    </div>
  );
}

