/**
 * CreateTicket — Dedicated intake wizard with instant triage confirmation.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';
import {
  Ticket,
  ArrowLeft,
  CheckCircle2,
  Upload,
  FileText,
  Sparkles,
  ShieldCheck,
  Tag,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function CreateTicket() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdTicket, setCreatedTicket] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('description', description);
      if (file) {
        formData.append('attachment', file);
      }

      const response = await api.post('/tickets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setCreatedTicket(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit ticket. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Raise Support Ticket</h1>
          <p className="text-xs text-slate-400 mt-1">Our automated engine will classify urgency, department, and assign an agent</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
      </div>

      {/* Acknowledgment View when Ticket Created */}
      {createdTicket ? (
        <div className="glass-panel rounded-2xl p-8 border border-emerald-500/30 space-y-6 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Ticket Submitted Successfully!</h2>
            <p className="text-xs text-slate-300">
              Your ticket <span className="font-mono font-bold text-indigo-400">{createdTicket.ticket_number}</span> has been processed and routed.
            </p>
          </div>

          {/* Triage Breakdown Box */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
            <div>
              <p className="text-[11px] font-medium text-slate-400">Assigned Department</p>
              <p className="text-sm font-extrabold text-white mt-1">{createdTicket.department}</p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400">Assigned Agent</p>
              <p className="text-sm font-extrabold text-indigo-400 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {createdTicket.agent_name || 'General Support'}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-medium text-slate-400">Urgency Level</p>
              <div className="mt-1">
                <UrgencyBadge urgency={createdTicket.urgency} />
              </div>
            </div>
          </div>

          {createdTicket.tags && (
            <div className="text-left bg-indigo-500/10 p-4 rounded-xl border border-indigo-500/20 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                <Tag className="w-3 h-3" /> Auto-Detected Keywords
              </p>
              <p className="text-xs font-mono text-indigo-200">{createdTicket.tags}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-slate-800">
            <Link
              to={`/tickets/${createdTicket.id}`}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              View Ticket Details
            </Link>
            <button
              onClick={() => {
                setCreatedTicket(null);
                setSubject('');
                setDescription('');
                setFile(null);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer"
            >
              Submit Another Ticket
            </button>
          </div>
        </div>
      ) : (
        /* Ticket Intake Form */
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="ticket-subject" className="block text-xs font-bold text-slate-200 mb-1.5">
                Subject / Summary <span className="text-red-400">*</span>
              </label>
              <input
                id="ticket-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="e.g. Payment failed repeatedly during subscription checkout"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Include keywords like &apos;payment&apos;, &apos;bug&apos;, &apos;login&apos;, or &apos;urgent&apos; for automated triage.
              </p>
            </div>

            <div>
              <label htmlFor="ticket-desc" className="block text-xs font-bold text-slate-200 mb-1.5">
                Detailed Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="ticket-desc"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Describe your issue in detail. Include any error codes, steps to reproduce, or relevant context..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-y"
              />
            </div>

            <div>
              <label htmlFor="ticket-file" className="block text-xs font-bold text-slate-200 mb-1.5">
                Attachment (Optional)
              </label>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 text-center space-y-2">
                <Upload className="w-6 h-6 text-slate-500 mx-auto" />
                <div className="text-xs text-slate-400">
                  <label htmlFor="ticket-file" className="font-semibold text-indigo-400 hover:underline cursor-pointer">
                    Click to upload a file
                  </label>
                  <span> or drag and drop</span>
                </div>
                <input
                  id="ticket-file"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file && (
                  <p className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5 pt-1">
                    <FileText className="w-4 h-4" /> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing & Routing...
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    Submit Support Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
