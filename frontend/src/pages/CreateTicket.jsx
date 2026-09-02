/**
 * CreateTicket — Dedicated form for clients to raise support tickets.
 * Displays immediate clear acknowledgment after creation showing
 * auto-classified department, urgency, and assigned agent.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { StatusBadge, UrgencyBadge } from '../components/StatusBadge';

export default function CreateTicket() {
  const navigate = useNavigate();

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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Create Support Ticket</h1>
          <p className="text-sm text-surface-500 mt-1">Our automated system will classify and route your request to an agent</p>
        </div>
        <Link
          to="/dashboard"
          className="text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Acknowledgment View when Ticket Created */}
      {createdTicket ? (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-[var(--shadow-elevated)] p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto ring-8 ring-emerald-50/50">
            ✓
          </div>

          <div>
            <h2 className="text-2xl font-bold text-surface-900">Ticket Submitted Successfully!</h2>
            <p className="text-surface-600 mt-2">
              Your ticket <span className="font-mono font-bold text-primary-700">{createdTicket.ticket_number}</span> has been created and automatically routed.
            </p>
          </div>

          {/* Classification Banner */}
          <div className="bg-surface-50 p-5 rounded-xl border border-surface-200 text-left grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-surface-500 font-medium">Assigned Department</p>
              <p className="text-sm font-bold text-surface-900 mt-1">{createdTicket.department}</p>
            </div>
            <div>
              <p className="text-xs text-surface-500 font-medium">Assigned Agent</p>
              <p className="text-sm font-bold text-surface-900 mt-1">
                {createdTicket.agent_name || 'General Pool'}
              </p>
            </div>
            <div>
              <p className="text-xs text-surface-500 font-medium">Urgency Level</p>
              <div className="mt-1">
                <UrgencyBadge urgency={createdTicket.urgency} />
              </div>
            </div>
          </div>

          {createdTicket.tags && (
            <div className="text-left bg-primary-50/50 p-4 rounded-lg border border-primary-100">
              <p className="text-xs font-semibold text-primary-800 uppercase tracking-wider mb-1">Auto-detected Tags</p>
              <p className="text-xs text-primary-700 font-mono">{createdTicket.tags}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-surface-100">
            <Link
              to={`/tickets/${createdTicket.id}`}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-600 transition-all text-sm"
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
              className="w-full sm:w-auto px-6 py-2.5 bg-surface-100 text-surface-700 font-semibold rounded-lg hover:bg-surface-200 transition-all text-sm cursor-pointer"
            >
              Submit Another Ticket
            </button>
          </div>
        </div>
      ) : (
        /* Ticket Creation Form */
        <div className="bg-white rounded-xl border border-surface-200 shadow-[var(--shadow-card)] p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-surface-800 mb-1.5">
                Subject / Short Summary <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm placeholder-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                placeholder="e.g., Unable to process credit card payment on checkout"
              />
              <p className="text-xs text-surface-400 mt-1">Include key terms like 'payment', 'crash', or 'urgent' for accurate classification.</p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-surface-800 mb-1.5">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-surface-300 bg-white text-surface-900 text-sm placeholder-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-y"
                placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, or relevant background."
              />
            </div>

            <div>
              <label htmlFor="attachment" className="block text-sm font-semibold text-surface-800 mb-1.5">
                Attachment (Optional)
              </label>
              <input
                id="attachment"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-surface-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all cursor-pointer"
              />
              {file && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  Selected file: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-surface-100 flex items-center justify-end gap-3">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-900 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-primary-600 disabled:opacity-60 transition-all shadow-sm cursor-pointer text-sm"
              >
                {loading ? 'Analyzing & Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
