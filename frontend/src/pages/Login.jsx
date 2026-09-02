/**
 * Login page — Modern SaaS Auth screen with ambient backdrop gradients,
 * input group icons, and instant 1-click Demo Account switches for ALL roles.
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Ticket,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Loader2,
  Crown,
  Wrench,
  CreditCard,
  KeyRound,
  Headphones
} from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, customEmail = null, customPass = null) => {
    if (e) e.preventDefault();
    setError('');

    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    if (!targetEmail || !targetPass) {
      setError('Please fill in both email and password fields.');
      return;
    }

    setLoading(true);

    try {
      await login(targetEmail, targetPass);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    handleSubmit(null, demoEmail, 'password123');
  };

  const demoAccounts = [
    { label: 'Client', email: 'client@example.com', icon: UserCheck, color: 'text-emerald-400', border: 'border-emerald-500/30' },
    { label: 'Tech Agent', email: 'tech@example.com', icon: Wrench, color: 'text-indigo-400', border: 'border-indigo-500/30' },
    { label: 'Billing Agent', email: 'billing@example.com', icon: CreditCard, color: 'text-amber-400', border: 'border-amber-500/30' },
    { label: 'Account Agent', email: 'account@example.com', icon: KeyRound, color: 'text-purple-400', border: 'border-purple-500/30' },
    { label: 'General Agent', email: 'general@example.com', icon: Headphones, color: 'text-sky-400', border: 'border-sky-500/30' },
    { label: 'System Admin', email: 'admin@example.com', icon: Crown, color: 'text-yellow-400', border: 'border-yellow-500/30' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <Ticket className="w-3.5 h-3.5" /> Support Desk Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome back to <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">PrismBerry</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Sign in to your client, agent, or admin workspace
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In to Workspace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
              Instant 1-Click Demo Login (All Roles)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {demoAccounts.map(({ label, email: dEmail, icon: Icon, color, border }) => (
                <button
                  key={dEmail}
                  type="button"
                  onClick={() => handleQuickLogin(dEmail)}
                  className={`p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border ${border} text-xs font-medium text-slate-300 hover:text-white flex flex-col items-center gap-1 transition-all cursor-pointer text-center group`}
                >
                  <Icon className={`w-4 h-4 ${color} group-hover:scale-110 transition-transform`} />
                  <span className="font-semibold text-[11px]">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Don&apos;t have a client account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
