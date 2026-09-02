/**
 * Sidebar — navigation component for authenticated users.
 * Shows different nav items based on user role (client vs agent).
 */
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const clientLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/tickets/new', label: 'New Ticket', icon: '➕' },
  ];

  const agentLinks = [
    { to: '/agent/dashboard', label: 'Dashboard', icon: '📊' },
  ];

  const links = user?.role === 'agent' ? agentLinks : clientLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-surface-200 flex flex-col z-40 shadow-[var(--shadow-card)]">
      {/* Logo */}
      <div className="p-6 border-b border-surface-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          PrismBerry
        </h1>
        <p className="text-xs text-surface-500 mt-1">Support Desk</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 text-primary-700 shadow-sm'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              }`
            }
          >
            <span className="text-base">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="p-4 border-t border-surface-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 truncate">{user?.name}</p>
            <p className="text-xs text-surface-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full px-4 py-2 text-sm font-medium text-surface-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
