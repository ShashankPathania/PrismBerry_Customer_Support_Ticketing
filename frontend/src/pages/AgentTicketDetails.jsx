/**
 * AgentTicketDetails — Dedicated agent workspace for resolving tickets.
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  Paperclip,
  Download,
  Sparkles,
  Tag,
  ShieldCheck,
  AlertCircle,
  Loader2,
  BrainCircuit
} from 'lucide-react';

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
      setSuccessMsg(`Status updated to "${newStatus}"`);

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
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="glass-panel p-8 rounded-2xl text-center space-y-4 max-w-xl mx-auto">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <p className="text-sm font-bold text-red-400">{error}</p>
        <Link to="/agent/dashboard" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Return to Console
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
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
          to="/agent/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
        </Link>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {/* Client Details Box */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Client Contact</p>
                <p className="text-sm font-extrabold text-white">{ticket.client_name || 'Client'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-medium text-slate-400">Created On</p>
              <p className="text-xs font-semibold text-slate-300 mt-0.5">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ticket Issue Description</h2>
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
                  {ticket.attachment_name || 'Download File'}
                </a>
              </div>
            )}
          </div>

          {/* Automated Triage Breakdown */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-400" /> Automated Triage Engine Analysis
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Determined Department</p>
                <p className="text-sm font-extrabold text-white">{ticket.department}</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <p className="text-[11px] font-medium text-slate-400">Classified Urgency</p>
                <div className="mt-1">
                  <UrgencyBadge urgency={ticket.urgency} />
                </div>
              </div>
            </div>

            {ticket.tags && (
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-slate-400">Extracted Keyword Tags</p>
                <div className="flex flex-wrap gap-2">
                  {ticket.tags.split(',').map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs flex items-center gap-1">
                      <Tag className="w-3 h-3 text-indigo-400" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Lifecycle Controls */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" /> Status Lifecycle Controls
            </h2>

            <div className="space-y-2">
              <p className="text-xs text-slate-400 font-medium">Update Ticket Status:</p>
              <div className="grid grid-cols-1 gap-2">
                {['New', 'Open', 'In Progress', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    disabled={updating || ticket.status === st}
                    className={`w-full px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      ticket.status === st
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                    } disabled:opacity-50`}
                  >
                    <span>{st}</span>
                    {ticket.status === st && <span className="text-[10px] uppercase font-extrabold bg-white/20 px-2 py-0.5 rounded">Active</span>}
                  </button>
                ))}
              </div>
            </div>

            {ticket.status !== 'Resolved' && (
              <button
                onClick={() => handleStatusChange('Resolved')}
                disabled={updating}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Ticket as Resolved
                  </>
                )}
              </button>
            )}

            <div className="space-y-2 text-xs text-slate-400 pt-4 border-t border-slate-800">
              <p className="flex justify-between"><span className="text-slate-500 font-medium">Created:</span> <span>{new Date(ticket.created_at).toLocaleString()}</span></p>
              <p className="flex justify-between"><span className="text-slate-500 font-medium">Updated:</span> <span>{new Date(ticket.updated_at).toLocaleString()}</span></p>
              {ticket.resolved_at && (
                <p className="flex justify-between text-emerald-400 font-bold">
                  <span>Resolved:</span> <span>{new Date(ticket.resolved_at).toLocaleString()}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
