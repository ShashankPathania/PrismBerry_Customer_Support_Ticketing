/**
 * AdminDashboard — Administrator management portal.
 * Perform full CRUD operations on support agents, view system metrics,
 * and reassign ticket workloads.
 */
import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Crown,
  Users,
  ShieldCheck,
  UserCheck,
  Ticket,
  PlusCircle,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Building,
  KeyRound
} from 'lucide-react';

export default function AdminDashboard() {
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [agentEmail, setAgentEmail] = useState('');
  const [agentPassword, setAgentPassword] = useState('');
  const [agentDepartment, setAgentDepartment] = useState('Technical Support');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [agentsRes, statsRes] = await Promise.all([
        api.get('/admin/agents'),
        api.get('/admin/stats')
      ]);
      setAgents(agentsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!agentName || !agentEmail || !agentPassword) {
      setError('Please complete all agent creation fields.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/admin/agents', {
        name: agentName,
        email: agentEmail,
        password: agentPassword,
        department: agentDepartment,
      });

      setSuccessMsg(`Support Agent "${response.data.name}" created successfully!`);
      setShowAddModal(false);
      setAgentName('');
      setAgentEmail('');
      setAgentPassword('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create support agent.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAgent = async (agentId, agentNameStr) => {
    if (!window.confirm(`Are you sure you want to remove agent "${agentNameStr}"? Unresolved tickets will be automatically reassigned.`)) {
      return;
    }

    try {
      setError('');
      setSuccessMsg('');
      const res = await api.delete(`/admin/agents/${agentId}`);
      setSuccessMsg(`Agent "${agentNameStr}" removed. (${res.data.reassigned_tickets} active tickets reassigned)`);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove agent.');
    }
  };

  const filteredAgents = agents.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      (a.department && a.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/20 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-semibold mb-2">
            <Crown className="w-3.5 h-3.5" /> Administrator Workspace
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            System Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage support staff, provision agent department access, and monitor platform ticket workload.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Add Support Agent
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
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

      {/* Overview Metrics */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-purple-500 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Total Support Agents</p>
            <p className="text-2xl font-extrabold text-white">{stats.total_agents}</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Total Clients</p>
            <p className="text-2xl font-extrabold text-white">{stats.total_clients}</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-indigo-500 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Total Tickets</p>
            <p className="text-2xl font-extrabold text-white">{stats.total_tickets}</p>
          </div>

          <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500 space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Active Unresolved</p>
            <p className="text-2xl font-extrabold text-amber-400">
              {(stats.tickets_by_status.New || 0) + (stats.tickets_by_status.Open || 0) + (stats.tickets_by_status['In Progress'] || 0)}
            </p>
          </div>
        </div>
      )}

      {/* Agents Table Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xl space-y-4">
        {/* Header & Search */}
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            Support Agent Directory
          </h2>

          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search agent name, email..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs">Fetching agent directory...</p>
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <p className="text-sm font-bold">No agents found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">Agent</th>
                  <th className="py-3.5 px-5">Email Address</th>
                  <th className="py-3.5 px-5">Department</th>
                  <th className="py-3.5 px-5">Active Workload</th>
                  <th className="py-3.5 px-5">Joined Date</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredAgents.map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-5 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {ag.name.charAt(0)}
                        </div>
                        <span>{ag.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-5 font-mono text-slate-400 whitespace-nowrap">
                      {ag.email}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 font-semibold text-[11px]">
                        {ag.department || 'General Support'}
                      </span>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                        ag.active_tickets_count > 3 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-300'
                      }`}>
                        <Ticket className="w-3 h-3" />
                        {ag.active_tickets_count} active
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-400 whitespace-nowrap">
                      {new Date(ag.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteAgent(ag.id, ag.name)}
                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add New Support Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl border border-indigo-500/30">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                Add New Support Agent
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  required
                  placeholder="e.g. Rachel Green"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  required
                  placeholder="agent@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={agentPassword}
                  onChange={(e) => setAgentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department Assignment
                </label>
                <select
                  value={agentDepartment}
                  onChange={(e) => setAgentDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing">Billing</option>
                  <option value="Account Support">Account Support</option>
                  <option value="General Support">General Support</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Provisioning...
                    </>
                  ) : (
                    'Provision Agent Account'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
