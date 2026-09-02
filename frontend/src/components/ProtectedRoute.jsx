/**
 * ProtectedRoute — guards routes based on authentication and role.
 * Redirects unauthenticated users to login, and wrong-role users to their dashboard.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Wrong role — redirect to correct dashboard
    return <Navigate to={user.role === 'agent' ? '/agent/dashboard' : '/dashboard'} replace />;
  }

  return children;
}
