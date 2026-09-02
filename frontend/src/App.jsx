/**
 * App — Main application entry point with Router, AuthProvider,
 * and role-protected layout routes.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ClientDashboard from './pages/ClientDashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import AgentDashboard from './pages/AgentDashboard';
import AgentTicketDetails from './pages/AgentTicketDetails';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'agent' ? '/agent/dashboard' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Client Routes */}
          <Route
            element={
              <ProtectedRoute requiredRole="client">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<ClientDashboard />} />
            <Route path="/tickets/new" element={<CreateTicket />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
          </Route>

          {/* Support Agent Routes */}
          <Route
            element={
              <ProtectedRoute requiredRole="agent">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/tickets/:id" element={<AgentTicketDetails />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
