/**
 * Sidebar — Responsive navigation sidebar.
 * Desktop: fixed side panel.
 * Mobile: drawer slide-over with hamburger toggle.
 * Supports Client, Agent, and Admin roles.
 */
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  ShieldCheck,
  User,
  Ticket,
  Sparkles,
  Crown,
  Users,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();

  const clientLinks = [
    { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { to: '/tickets/new', label: 'Raise New Ticket', icon: PlusCircle },
  ];

  const agentLinks = [
    { to: '/agent/dashboard', label: 'Agent Console', icon: LayoutDashboard },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Portal', icon: Crown },
  ];

  let links = clientLinks;
  if (user?.role === 'agent') links = agentLinks;
  if (user?.role === 'admin') links = adminLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800/80 flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                PrismBerry
              </h1>
              <p className="text-[11px] font-medium text-indigo-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Support Desk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Menu Navigation
            </p>
            <nav className="space-y-1.5">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-500/5'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
              {user?.role === 'admin' ? (
                <Crown className="w-5 h-5 text-yellow-400" />
              ) : user?.role === 'agent' ? (
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              ) : (
                <User className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] font-medium text-slate-400 capitalize flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    user?.role === 'admin'
                      ? 'bg-yellow-400'
                      : user?.role === 'agent'
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                ></span>
                {user?.role} {user?.department ? `• ${user.department}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 border border-transparent transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
