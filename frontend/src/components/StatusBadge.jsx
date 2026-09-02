/**
 * StatusBadge — colored badge for ticket status and urgency.
 * Provides consistent visual indicators across the app.
 */

const STATUS_STYLES = {
  'New': 'bg-purple-50 text-purple-700 ring-purple-200',
  'Open': 'bg-blue-50 text-blue-700 ring-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 ring-amber-200',
  'Resolved': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

const URGENCY_STYLES = {
  'Low': 'bg-green-50 text-green-700 ring-green-200',
  'Medium': 'bg-yellow-50 text-yellow-700 ring-yellow-200',
  'High': 'bg-orange-50 text-orange-700 ring-orange-200',
  'Critical': 'bg-red-50 text-red-700 ring-red-200',
};

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-surface-100 text-surface-600 ring-surface-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${style}`}>
      {status}
    </span>
  );
}

export function UrgencyBadge({ urgency }) {
  const style = URGENCY_STYLES[urgency] || 'bg-surface-100 text-surface-600 ring-surface-200';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${style}`}>
      {urgency}
    </span>
  );
}
