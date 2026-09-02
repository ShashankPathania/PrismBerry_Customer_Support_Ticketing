/**
 * AgentTicketDetails — Dedicated agent management screen for a ticket.
 * Allows agents to view automatic classification logic, update status,
 * resolve tickets, and view client submission info.
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';

export default function AgentTicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      setError('');
      setSuccessMsg('');

      const response = await api.patch(`/tickets/${id}/status`, { status: newStatus });
      setTicket(response.data);
      setSuccessMsg(`Ticket status updated to "${newStatus}"`);

      // Clear success message after 4s
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update ticket status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl border border-red-200 text-center space-y-4">
        <p className="text-red-600 font-semibold">{error}</p>
        <Link to="/agent/dashboard" className="inline-block text-sm text-primary-600 font-medium">
          ← Back to Console
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded">
              {ticket.ticket_number}
            </span>
            <StatusBadge status={ticket.status} />
            <UrgencyBadge urgency={ticket.urgency} />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mt-2">{ticket.subject}</h1>
        </div>

        <Link
          to="/agent/dashboard"
          className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
        >
          ← Back to Console
        </Link>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl font-medium flex items-center gap-2">
          <span>✓</span> {successMsg}
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Ticket Details & Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Info Banner */}
          <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-[var(--shadow-card)] flex items-center justify-between">
            <div>
              <p className="text-xs text-surface-400 font-medium">Submitted by Client</p>
              <p className="text-base font-bold text-surface-900 mt-0.5">{ticket.client_name || 'Client'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-surface-400 font-medium">Created Date</p>
              <p className="text-xs text-surface-700 font-semibold mt-0.5">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Ticket Description */}
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-[var(--shadow-card)] space-y-4">
            <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">Ticket Description</h2>
            <div className="text-surface-800 whitespace-pre-wrap leading-relaxed text-sm bg-surface-50 p-4 rounded-lg border border-surface-100">
              {ticket.description}
            </div>

            {ticket.attachment_path && (
              <div className="pt-4 border-t border-surface-100">
                <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Attachment</p>
                <a
                  href={`/${ticket.attachment_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-surface-100 hover:bg-surface-200 text-surface-800 text-xs font-medium rounded-lg transition-colors"
                >
                  📎 {ticket.attachment_name || 'Download File'}
                </a>
              </div>
            )}
          </div>

          {/* Automatic Triage Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-[var(--shadow-card)] space-y-4">
            <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">Automated Triage Analysis</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-surface-50 rounded-lg border border-surface-200">
                <p className="text-xs text-surface-400 font-medium">Detected Department</p>
                <p className="text-sm font-bold text-surface-900 mt-1">{ticket.department}</p>
              </div>

              <div className="p-4 bg-surface-50 rounded-lg border border-surface-200">
                <p className="text-xs text-surface-400 font-medium">Assigned Urgency</p>
                <div className="mt-1">
                  <UrgencyBadge urgency={ticket.urgency} />
                </div>
              </div>
            </div>

            {ticket.tags && (
              <div>
                <p className="text-xs text-surface-400 mb-1.5 font-medium">Matched Keyword Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {ticket.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-mono rounded-md border border-primary-100">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Agent Management Controls */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-[var(--shadow-card)] space-y-6">
            <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">Status Lifecycle Controls</h2>

            {/* Quick Status Selector */}
            <div className="space-y-2">
              <p className="text-xs text-surface-600 font-medium">Update Status to:</p>
              <div className="grid grid-cols-1 gap-2">
                {['New', 'Open', 'In Progress', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    disabled={updating || ticket.status === st}
                    className={`w-full px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      ticket.status === st
                        ? 'bg-surface-900 text-white shadow-sm ring-2 ring-surface-900'
                        : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                    } disabled:opacity-50`}
                  >
                    <span>{st}</span>
                    {ticket.status === st && <span>✓ Current</span>}
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-surface-100" />

            {/* Quick Resolve Button */}
            {ticket.status !== 'Resolved' && (
              <button
                onClick={() => handleStatusChange('Resolved')}
                disabled={updating}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>✓</span> Mark as Resolved
              </button>
            )}

            {/* Timestamps */}
            <div className="space-y-2 text-xs text-surface-500 pt-2 border-t border-surface-100">
              <p><span className="font-medium">Created:</span> {new Date(ticket.created_at).toLocaleString()}</p>
              <p><span className="font-medium">Updated:</span> {new Date(ticket.updated_at).toLocaleString()}</p>
              {ticket.resolved_at && (
                <p className="text-emerald-600 font-semibold">
                  <span>Resolved:</span> {new Date(ticket.resolved_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
