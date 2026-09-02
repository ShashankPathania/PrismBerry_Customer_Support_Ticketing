/**
 * TicketDetails — Client ticket view with conversation thread.
 * Clients can view their ticket details, see agent responses,
 * and reply back in the conversation thread.
 */
import { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  MessagesSquare,
  MessageSquare,
  Send,
  Loader2
} from 'lucide-react';

export default function TicketDetails() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Response state
  const [responses, setResponses] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replySuccess, setReplySuccess] = useState('');
  const threadEndRef = useRef(null);

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
      setError(err.response?.data?.detail || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      const res = await api.get(`/tickets/${id}/responses`);
      setResponses(res.data);
    } catch (err) {
      // silently ignore
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
      setReplySuccess('Reply sent!');
      setTimeout(() => setReplySuccess(''), 3000);
      fetchResponses();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reply.');
    } finally {
      setSendingReply(false);
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

          {/* ====== Conversation Thread ====== */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            <div className="p-5 border-b border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <MessagesSquare className="w-4 h-4 text-indigo-400" /> Conversation
                <span className="text-[10px] bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                  {responses.length} {responses.length === 1 ? 'reply' : 'replies'}
                </span>
              </h2>
            </div>

            {/* Messages */}
            <div className="max-h-[400px] overflow-y-auto p-5 space-y-4">
              {responses.length === 0 ? (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs font-semibold">No replies yet. A support agent will respond shortly.</p>
                  <p className="text-[10px] text-slate-600">You can also send a message to provide more details.</p>
                </div>
              ) : (
                responses.map((r) => (
                  <div
                    key={r.id}
                    className={`flex gap-3 ${r.author_role === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    {r.author_role !== 'client' && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[80%] space-y-1 ${r.author_role === 'client' ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-300">{r.author_name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          r.author_role === 'agent'
                            ? 'bg-indigo-500/15 text-indigo-300'
                            : 'bg-emerald-500/15 text-emerald-300'
                        }`}>
                          {r.author_role === 'agent' ? 'Support Agent' : 'You'}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(r.created_at).toLocaleString()}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap break-words ${
                          r.author_role === 'client'
                            ? 'bg-emerald-600/10 border border-emerald-500/20 text-slate-200 rounded-br-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        {r.message}
                      </div>
                    </div>

                    {r.author_role === 'client' && (
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Client Reply Box */}
            {ticket.status !== 'Resolved' && (
              <div className="p-4 border-t border-slate-800 bg-slate-900/40">
                <form onSubmit={handleSendReply} className="flex items-end gap-3">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Add a reply or provide more details..."
                    rows={2}
                    className="flex-1 p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-40 transition-all cursor-pointer shadow-lg shrink-0"
                  >
                    {sendingReply ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>
                {replySuccess && (
                  <p className="text-[11px] text-emerald-400 font-semibold mt-2">{replySuccess}</p>
                )}
              </div>
            )}

            {ticket.status === 'Resolved' && (
              <div className="p-4 border-t border-slate-800 bg-emerald-500/5 text-center">
                <p className="text-xs text-emerald-400 font-semibold">This ticket has been resolved. No further replies can be added.</p>
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
