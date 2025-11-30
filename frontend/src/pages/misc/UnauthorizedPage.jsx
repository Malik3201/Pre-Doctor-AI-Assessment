import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Access limited</p>
      <h1 className="mt-4 text-4xl font-semibold text-slate-900">Unauthorized Access</h1>
      <p className="mt-4 max-w-sm text-sm text-slate-500">
        This section is restricted. If you think this is an error, contact your administrator or log
        in with a different role.
      </p>
      <Button as={Link} to="/auth/login" className="mt-8" variant="outline">
        Switch account
      </Button>
    </div>
  );
}

