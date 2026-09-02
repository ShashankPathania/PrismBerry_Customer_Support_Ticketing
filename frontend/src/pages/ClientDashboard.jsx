/**
 * ClientDashboard — Overview for clients showing ticket statistics
 * and a list of their submitted tickets.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';

export default function ClientDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tickets');
      setTickets(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  const total = tickets.length;
  const open = tickets.filter(t => t.status === 'New' || t.status === 'Open').length;
  const inProgress = tickets.filter(t => t.status === 'In Progress').length;
  const resolved = tickets.filter(t => t.status === 'Resolved').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Client Dashboard</h1>
          <p className="text-sm text-surface-500 mt-1">Track and manage your support requests</p>
        </div>
        <Link
          to="/tickets/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-600 shadow-sm transition-all text-sm cursor-pointer"
        >
          <span>➕</span> Raise New Ticket
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Tickets</p>
          <p className="text-3xl font-extrabold text-surface-900 mt-2">{total}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Open / New</p>
          <p className="text-3xl font-extrabold text-blue-700 mt-2">{open}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Progress</p>
          <p className="text-3xl font-extrabold text-amber-700 mt-2">{inProgress}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-[var(--shadow-card)]">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved</p>
          <p className="text-3xl font-extrabold text-emerald-700 mt-2">{resolved}</p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl border border-surface-200 shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 border-b border-surface-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-surface-900">Your Tickets</h2>
          <button
            onClick={fetchTickets}
            className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

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
            <p className="text-3xl mb-2">🎫</p>
            <h3 className="text-base font-semibold text-surface-800 mb-1">No tickets created yet</h3>
            <p className="text-sm text-surface-500 mb-4">Have an issue or technical question? Submit a ticket and our agents will assist you.</p>
            <Link
              to="/tickets/new"
              className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 font-semibold rounded-lg hover:bg-primary-100 text-sm transition-colors"
            >
              Create Your First Ticket
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200 text-surface-500 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Ticket #</th>
                  <th className="py-3.5 px-5">Subject</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Urgency</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Assigned Agent</th>
                  <th className="py-3.5 px-5">Created</th>
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
                    <td className="py-3.5 px-5 text-surface-600 text-xs font-medium">
                      {t.department}
                    </td>
                    <td className="py-3.5 px-5">
                      <UrgencyBadge urgency={t.urgency} />
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-5 text-surface-600 text-xs">
                      {t.agent_name ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {t.agent_name}
                        </span>
                      ) : (
                        <span className="text-surface-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-surface-500 text-xs whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        to={`/tickets/${t.id}`}
                        className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        View Details →
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
