/**
 * StatusBadge & UrgencyBadge — Premium visual indicators with Lucide icons.
 */
import {
  Sparkles,
  FolderOpen,
  Clock,
  CheckCircle2,
  Flame,
  AlertTriangle,
  AlertCircle,
  Info
} from 'lucide-react';

export function StatusBadge({ status }) {
  const configs = {
    'New': {
      label: 'New',
      icon: Sparkles,
      style: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
    },
    'Open': {
      label: 'Open',
      icon: FolderOpen,
      style: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
    },
    'In Progress': {
      label: 'In Progress',
      icon: Clock,
      style: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    'Resolved': {
      label: 'Resolved',
      icon: CheckCircle2,
      style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    }
  };

  const config = configs[status] || {
    label: status,
    icon: Info,
    style: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.style} whitespace-nowrap shadow-sm`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

export function UrgencyBadge({ urgency }) {
  const configs = {
    'Critical': {
      label: 'Critical',
      icon: Flame,
      style: 'bg-red-500/15 text-red-400 border-red-500/30 ring-1 ring-red-500/20'
    },
    'High': {
      label: 'High',
      icon: AlertTriangle,
      style: 'bg-orange-500/15 text-orange-400 border-orange-500/30'
    },
    'Medium': {
      label: 'Medium',
      icon: AlertCircle,
      style: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    },
    'Low': {
      label: 'Low',
      icon: Info,
      style: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    }
  };

  const config = configs[urgency] || {
    label: urgency,
    icon: Info,
    style: 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  };

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.style} whitespace-nowrap shadow-sm`}>
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}
