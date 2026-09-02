/**
 * TicketDetails — Detailed view for a client to inspect their ticket.
 * Displays ticket subject, description, auto-triage info, assigned agent,
 * status timeline, and download link for attachments.
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl border border-red-200 text-center space-y-4">
        <p className="text-red-600 font-semibold">{error || 'Ticket not found.'}</p>
        <Link to="/dashboard" className="inline-block text-sm text-primary-600 font-medium">
          ← Back to Dashboard
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
          to="/dashboard"
          className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-[var(--shadow-card)] space-y-4">
            <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">Description</h2>
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
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-[var(--shadow-card)] space-y-4">
            <h2 className="text-sm font-semibold text-surface-500 uppercase tracking-wider">Ticket Info</h2>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-surface-400">Department</p>
                <p className="font-semibold text-surface-800">{ticket.department}</p>
              </div>

              <div>
                <p className="text-xs text-surface-400">Assigned Agent</p>
                <p className="font-semibold text-surface-800">
                  {ticket.agent_name ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      {ticket.agent_name}
                    </span>
                  ) : (
                    <span className="text-surface-400 italic">Unassigned</span>
                  )}
                </p>
              </div>

              {ticket.tags && (
                <div>
                  <p className="text-xs text-surface-400 mb-1">Tags</p>
                  <p className="font-mono text-xs text-surface-700 bg-surface-100 p-2 rounded">
                    {ticket.tags}
                  </p>
                </div>
              )}

              <hr className="border-surface-100" />

              <div>
                <p className="text-xs text-surface-400">Submitted On</p>
                <p className="text-xs text-surface-700 font-medium">
                  {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-surface-400">Last Updated</p>
                <p className="text-xs text-surface-700 font-medium">
                  {new Date(ticket.updated_at).toLocaleString()}
                </p>
              </div>

              {ticket.resolved_at && (
                <div>
                  <p className="text-xs text-emerald-600 font-medium">Resolved On</p>
                  <p className="text-xs text-emerald-700 font-semibold">
                    {new Date(ticket.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
