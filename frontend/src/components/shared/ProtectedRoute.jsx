import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useTenant from '../../hooks/useTenant';
import Spinner from '../ui/Spinner';

export default function ProtectedRoute({ children, requiredRole, requireSubdomain = false }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { subdomain } = useTenant();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner className="h-8 w-8 border-slate-300" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requireSubdomain && !subdomain) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
}

