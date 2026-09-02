/**
 * ProtectedRoute — guards routes based on authentication and role.
 * Redirects unauthenticated users to login, and wrong-role users to their respective dashboards.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Wrong role — redirect to correct dashboard for user's role
    const defaultPath =
      user.role === 'admin'
        ? '/admin/dashboard'
        : user.role === 'agent'
        ? '/agent/dashboard'
        : '/dashboard';

    return <Navigate to={defaultPath} replace />;
  }

  return children;
}
