import useAuth from '../../hooks/useAuth';

export default function RoleGuard({ roles = [], children, fallback = null }) {
  const { user } = useAuth();

  if (roles.length === 0 || roles.includes(user?.role)) {
    return children;
  }

  return fallback;
}

