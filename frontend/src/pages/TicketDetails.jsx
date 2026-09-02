/**
 * TicketDetails — Client ticket view.
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import {
  Ticket,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Paperclip,
  Download,
  AlertCircle,
  Tag,
  ShieldCheck
} from 'lucide-react';

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
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-sm font-bold text-red-400">{error || 'Ticket not found.'}</p>
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
              {ticket.ticket_number}
            </span>
            <StatusBadge status={ticket.status} />
            <UrgencyBadge urgency={ticket.urgency} />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight break-words">{ticket.subject}</h1>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h2>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap break-words font-medium">
              {ticket.description}
            </div>

            {ticket.attachment_path && (
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-400" /> Attached File
                </p>
                <a
                  href={`/${ticket.attachment_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-indigo-300 hover:text-white text-xs font-semibold hover:border-indigo-500 transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  {ticket.attachment_name || 'Download Attachment'}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Metadata</h2>

            <div className="space-y-3 text-xs">
              <div>
                <p className="text-[11px] text-slate-500 font-medium">Target Department</p>
                <p className="font-bold text-white mt-0.5">{ticket.department}</p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500 font-medium">Assigned Support Agent</p>
                <div className="mt-1">
                  {ticket.agent_name ? (
                    <div className="flex items-center gap-2 text-indigo-300 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{ticket.agent_name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">Unassigned Pool</span>
                  )}
                </div>
              </div>

              {ticket.tags && (
                <div>
                  <p className="text-[11px] text-slate-500 font-medium mb-1">Keywords / Tags</p>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-indigo-300 flex items-center gap-1.5 flex-wrap">
                    <Tag className="w-3 h-3 text-slate-500" />
                    {ticket.tags}
                  </div>
                </div>
              )}

              <hr className="border-slate-800" />

              <div>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Created Date
                </p>
                <p className="text-slate-300 font-medium mt-0.5">
                  {new Date(ticket.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Last Updated
                </p>
                <p className="text-slate-300 font-medium mt-0.5">
                  {new Date(ticket.updated_at).toLocaleString()}
                </p>
              </div>

              {ticket.resolved_at && (
                <div>
                  <p className="text-[11px] text-emerald-400 font-medium">Resolved Timestamp</p>
                  <p className="text-emerald-300 font-bold mt-0.5">
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
