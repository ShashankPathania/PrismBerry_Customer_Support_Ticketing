/**
 * AgentDashboard — Support Agent Command Console.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Ticket,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  User,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AgentDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, urgencyFilter, departmentFilter, sortBy]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const params = { sort_by: sortBy };
      if (statusFilter) params.status_filter = statusFilter;
      if (urgencyFilter) params.urgency = urgencyFilter;
      if (departmentFilter) params.department = departmentFilter;

      const response = await api.get('/tickets', { params });
      setTickets(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  const formatTicketAge = (dateString) => {
    const created = new Date(dateString);
    const now = new Date();
    const diffMinutes = Math.floor((now - created) / (1000 * 60));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Client-side search filtering
  const filteredTickets = tickets.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.ticket_number.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      (t.client_name && t.client_name.toLowerCase().includes(q)) ||
      t.department.toLowerCase().includes(q)
    );
  });

  const totalAssigned = tickets.length;
  const newCount = tickets.filter((t) => t.status === 'New').length;
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length;
  const highCriticalCount = tickets.filter((t) => t.urgency === 'High' || t.urgency === 'Critical').length;
  const resolvedCount = tickets.filter((t) => t.status === 'Resolved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Support Agent Console • {user?.department || 'All Departments'}
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Agent Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage incoming customer support tickets, triage analysis, and status resolution workflows.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Console
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-slate-400 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Assigned</p>
          <p className="text-2xl font-extrabold text-white">{totalAssigned}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-purple-500 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400">New</p>
          <p className="text-2xl font-extrabold text-purple-400">{newCount}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">In Progress</p>
          <p className="text-2xl font-extrabold text-amber-400">{inProgressCount}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-red-500 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-400">High / Critical</p>
          <p className="text-2xl font-extrabold text-red-400">{highCriticalCount}</p>
        </div>

        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500 space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Resolved</p>
          <p className="text-2xl font-extrabold text-emerald-400">{resolvedCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Real-time search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, subject, client..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Urgencies</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Departments</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Billing">Billing</option>
              <option value="Account Support">Account Support</option>
              <option value="General Support">General Support</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First (SLA Priority)</option>
            </select>

            {(statusFilter || urgencyFilter || departmentFilter || sortBy !== 'newest' || searchQuery) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setUrgencyFilter('');
                  setDepartmentFilter('');
                  setSortBy('newest');
                  setSearchQuery('');
                }}
                className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-bold transition-colors"
                title="Clear Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl">
        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Fetching assigned tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-200">No tickets match criteria</h3>
            <p className="text-xs text-slate-400">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Ticket #</th>
                  <th className="py-3.5 px-5">Subject</th>
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Urgency</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Age / SLA Response</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-bold text-indigo-400 whitespace-nowrap">
                      {t.ticket_number}
                    </td>
                    <td className="py-4 px-5 font-semibold text-white max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-medium text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        {t.client_name || 'Client'}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-slate-400 font-medium whitespace-nowrap">
                      {t.department}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <UrgencyBadge urgency={t.urgency} />
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {formatTicketAge(t.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <Link
                        to={`/agent/tickets/${t.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white font-bold text-xs transition-all shadow-sm"
                      >
                        Manage <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
