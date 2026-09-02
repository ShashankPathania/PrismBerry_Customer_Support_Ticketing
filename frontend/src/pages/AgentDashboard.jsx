/**
 * AgentDashboard — Support agent console.
 * View assigned tickets, filter by urgency/department/status/response times,
 * view key metrics, and jump to manage ticket resolution.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';

export default function AgentDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // "newest", "oldest"

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

  // Format relative response time / ticket age
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

  // Metrics (calculated from all fetched assigned tickets)
  const totalAssigned = tickets.length;
  const newCount = tickets.filter(t => t.status === 'New').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const highCriticalCount = tickets.filter(t => t.urgency === 'High' || t.urgency === 'Critical').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Support Agent Console</h1>
          <p className="text-sm text-surface-500 mt-1">Manage and resolve support tickets assigned to you</p>
        </div>
        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-surface-200 text-surface-700 font-semibold rounded-lg hover:bg-surface-50 transition-colors text-sm cursor-pointer shadow-sm"
        >
          🔄 Refresh Tickets
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Assigned</p>
          <p className="text-2xl font-extrabold text-surface-900 mt-1">{totalAssigned}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">New</p>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{newCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{inProgressCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">High / Critical</p>
          <p className="text-2xl font-extrabold text-red-700 mt-1">{highCriticalCount}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 shadow-[var(--shadow-card)] flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-surface-400">Filters:</span>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-surface-300 text-xs font-medium bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-surface-300 text-xs font-medium bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="">All Urgencies</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-surface-300 text-xs font-medium bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-100"
          >
            <option value="">All Departments</option>
            <option value="Technical Support">Technical Support</option>
            <option value="Billing">Billing</option>
            <option value="Account Support">Account Support</option>
            <option value="General Support">General Support</option>
          </select>

          {/* Response Time / Age Sort */}
          <div className="flex items-center gap-1.5 border-l border-surface-200 pl-4">
            <span className="text-xs text-surface-400 font-medium">Response Time:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-surface-300 text-xs font-medium bg-white text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-100"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First (SLA Priority)</option>
            </select>
          </div>
        </div>

        {(statusFilter || urgencyFilter || departmentFilter || sortBy !== 'newest') && (
          <button
            onClick={() => {
              setStatusFilter('');
              setUrgencyFilter('');
              setDepartmentFilter('');
              setSortBy('newest');
            }}
            className="text-xs text-red-600 hover:text-red-800 font-semibold transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-[var(--shadow-card)] overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm border-b border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-surface-400">
            <div className="animate-spin inline-block h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mb-2"></div>
            <p className="text-sm">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl mb-2 font-mono">📋</p>
            <h3 className="text-base font-semibold text-surface-800 mb-1">No tickets match criteria</h3>
            <p className="text-sm text-surface-500">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Ticket #</th>
                  <th className="py-3.5 px-5">Subject</th>
                  <th className="py-3.5 px-5">Client</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Urgency</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Age / Response Time</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-surface-700">
                      {t.ticket_number}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-surface-900 max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="py-3.5 px-5 text-surface-700 text-xs font-medium">
                      {t.client_name || 'Client'}
                    </td>
                    <td className="py-3.5 px-5 text-surface-600 text-xs">
                      {t.department}
                    </td>
                    <td className="py-3.5 px-5">
                      <UrgencyBadge urgency={t.urgency} />
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-5 text-surface-600 text-xs whitespace-nowrap font-medium">
                      <span className="inline-flex items-center gap-1 bg-surface-100 px-2 py-0.5 rounded text-surface-700">
                        ⏱️ {formatTicketAge(t.created_at)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        to={`/agent/tickets/${t.id}`}
                        className="px-3 py-1.5 bg-primary-50 text-primary-700 font-semibold rounded text-xs hover:bg-primary-100 transition-colors inline-block"
                      >
                        Manage →
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
