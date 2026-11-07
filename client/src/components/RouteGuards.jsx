import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from './ui';

// Pages that need a logged-in user. adminOnly also requires the admin role.
export function ProtectedRoute({ adminOnly = false }) {
  const { user, ready, isAdmin } = useAuth();
  const location = useLocation();
  if (!ready) return <PageLoader label="Checking your session" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Log in and Sign up: someone already logged in goes straight to the app.
export function GuestRoute() {
  const { user, ready } = useAuth();
  if (!ready) return <PageLoader label="Checking your session" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
