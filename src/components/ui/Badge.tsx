import { Severity, IncidentStatus } from '../../types';

// ─── Severity Badge ───────────────────────────────────────────────────────────

const severityConfig: Record<
  Severity,
  { label: string; dot: string; text: string; bg: string; border: string }
> = {
  critical: {
    label: 'Critical',
    dot:    'bg-red-400',
    text:   'text-red-300',
    bg:     'bg-red-500/10',
    border: 'border-red-500/30',
  },
  high: {
    label: 'High',
    dot:    'bg-orange-400',
    text:   'text-orange-300',
    bg:     'bg-orange-500/10',
    border: 'border-orange-500/30',
  },
  medium: {
    label: 'Medium',
    dot:    'bg-amber-400',
    text:   'text-amber-300',
    bg:     'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  low: {
    label: 'Low',
    dot:    'bg-sky-400',
    text:   'text-sky-300',
    bg:     'bg-sky-500/10',
    border: 'border-sky-500/30',
  },
};

export function SeverityBadge({
  severity,
  size = 'sm',
}: {
  severity: Severity;
  size?: 'xs' | 'sm';
}) {
  const c = severityConfig[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-semibold uppercase tracking-wider ${c.bg} ${c.border} ${c.text} ${
        size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-1 text-[11px]'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {c.label}
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusConfig: Record<
  IncidentStatus,
  { label: string; pulse: boolean; dot: string; text: string; bg: string; border: string }
> = {
  open: {
    label:  'Open',
    pulse:  false,
    dot:    'bg-slate-400',
    text:   'text-slate-300',
    bg:     'bg-slate-700/30',
    border: 'border-slate-600/40',
  },
  investigating: {
    label:  'Investigating',
    pulse:  true,
    dot:    'bg-red-400',
    text:   'text-red-300',
    bg:     'bg-red-500/10',
    border: 'border-red-500/30',
  },
  acknowledged: {
    label:  'Acknowledged',
    pulse:  false,
    dot:    'bg-amber-400',
    text:   'text-amber-300',
    bg:     'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  mitigated: {
    label:  'Mitigated',
    pulse:  false,
    dot:    'bg-emerald-400',
    text:   'text-emerald-300',
    bg:     'bg-emerald-500/10',
    border: 'border-emerald-500/30',
  },
  resolved: {
    label:  'Resolved',
    pulse:  false,
    dot:    'bg-slate-500',
    text:   'text-slate-400',
    bg:     'bg-slate-700/20',
    border: 'border-slate-700/40',
  },
};

export function StatusBadge({ status }: { status: IncidentStatus }) {
  const c = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ${c.bg} ${c.border} ${c.text}`}
    >
      <span className={`relative flex h-1.5 w-1.5 flex-shrink-0`}>
        {c.pulse && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${c.dot}`}
          />
        )}
        <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${c.dot}`} />
      </span>
      {c.label}
    </span>
  );
}

// ─── Severity dot (for list items) ───────────────────────────────────────────

export function SeverityDot({ severity }: { severity: Severity }) {
  const colors: Record<Severity, string> = {
    critical: 'bg-red-400',
    high:     'bg-orange-400',
    medium:   'bg-amber-400',
    low:      'bg-sky-400',
  };
  if (severity === 'critical') {
    return (
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-red-400" />
      </span>
    );
  }
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[severity]}`} />;
}

// ─── Generic tag ─────────────────────────────────────────────────────────────

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded bg-slate-800 border border-slate-700/60 px-2 py-0.5 text-[11px] font-medium text-slate-400">
      {children}
    </span>
  );
}
