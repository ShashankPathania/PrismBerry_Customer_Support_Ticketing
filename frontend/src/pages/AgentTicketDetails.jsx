/**
 * AgentTicketDetails — Dedicated agent workspace for resolving tickets.
 * Includes:
 *  - Reply composer for sending responses to clients
 *  - Full conversation thread display
 *  - AI Reply Suggestions powered by Groq
 *  - Status lifecycle controls
 *  - Automated triage breakdown
 */
import { useState, useEffect, useRef } from 'react';
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
  BrainCircuit,
  Bot,
  Copy,
  Check,
  MessageSquare,
  Send,
  MessagesSquare
} from 'lucide-react';

export default function AgentTicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Response/Reply state
  const [responses, setResponses] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const threadEndRef = useRef(null);

  // AI Reply Generator State
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTicket();
    fetchResponses();
  }, [id]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses]);

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

  const fetchResponses = async () => {
    try {
      const res = await api.get(`/tickets/${id}/responses`);
      setResponses(res.data);
    } catch (err) {
      // silently ignore if no responses yet
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

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || sendingReply) return;

    try {
      setSendingReply(true);
      setError('');
      await api.post(`/tickets/${id}/responses`, { message: replyText });
      setReplyText('');
      setSuccessMsg('Reply sent successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchResponses();
      fetchTicket(); // refresh status if it auto-changed
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const handleGenerateAiReply = async () => {
    try {
      setLoadingAi(true);
      setError('');
      const response = await api.post('/chatbot/suggest-reply', { ticket_id: parseInt(id) });
      setAiSuggestion(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate AI reply suggestion.');
    } finally {
      setLoadingAi(false);
    }
  };

  const handleUseSuggestion = () => {
    if (aiSuggestion?.suggested_reply) {
      setReplyText(aiSuggestion.suggested_reply);
    }
  };

  const handleCopySuggestion = () => {
    if (aiSuggestion?.suggested_reply) {
      navigator.clipboard.writeText(aiSuggestion.suggested_reply);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
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

          {/* ====== Conversation Thread ====== */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MessagesSquare className="w-4 h-4 text-indigo-400" /> Conversation Thread
                <span className="text-[10px] bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  {responses.length} {responses.length === 1 ? 'reply' : 'replies'}
                </span>
              </h2>
            </div>

            {/* Messages list */}
            <div className="max-h-[420px] overflow-y-auto p-5 space-y-4">
              {responses.length === 0 ? (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold">No replies yet. Send the first response to this client.</p>
                </div>
              ) : (
                responses.map((r) => (
                  <div
                    key={r.id}
                    className={`flex gap-3 ${r.author_role === 'agent' ? 'justify-end' : 'justify-start'}`}
                  >
                    {r.author_role !== 'agent' && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[80%] space-y-1 ${r.author_role === 'agent' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-300">{r.author_name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          r.author_role === 'agent'
                            ? 'bg-indigo-500/15 text-indigo-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}>
                          {r.author_role === 'agent' ? 'Agent' : 'Client'}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(r.created_at).toLocaleString()}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                          r.author_role === 'agent'
                            ? 'bg-indigo-600/15 border border-indigo-500/25 text-slate-200 rounded-br-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {r.message}
                      </div>
                    </div>

                    {r.author_role === 'agent' && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Reply Composer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/40">
              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to the client..."
                  rows={3}
                  className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
                />
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateAiReply}
                    disabled={loadingAi}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/15 border border-purple-500/25 text-purple-300 text-[11px] font-semibold hover:bg-purple-600/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loadingAi ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Suggest Reply</>
                    )}
                  </button>

                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer"
                  >
                    {sendingReply ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Reply</>
                    )}
                  </button>
                </div>
              </form>

              {/* AI Suggestion Panel */}
              {aiSuggestion && (
                <div className="mt-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" /> AI Generated Suggestion
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleUseSuggestion}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-500 transition-all cursor-pointer"
                      >
                        Use as Reply
                      </button>
                      <button
                        onClick={handleCopySuggestion}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold hover:bg-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copied ? <><Check className="w-3 h-3 text-emerald-400" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                  </div>

                  {aiSuggestion.key_points && (
                    <div className="flex flex-wrap gap-1.5">
                      {aiSuggestion.key_points.map((point, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-medium">
                          {point}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {aiSuggestion.suggested_reply}
                  </div>
                </div>
              )}
            </div>
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
