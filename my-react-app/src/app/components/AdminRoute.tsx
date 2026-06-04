import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function AdminRoute() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/activities" replace />;
  }

  return <Outlet />;
}
