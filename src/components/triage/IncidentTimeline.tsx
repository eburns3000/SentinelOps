import {
  AlertTriangle, Brain, CheckCircle, Bell,
  RotateCcw, MessageSquare, User, Shield,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

export type EventType =
  | 'detected'
  | 'analysis'
  | 'status'
  | 'escalation'
  | 'rollback'
  | 'notification'
  | 'assign';

export interface TimelineEvent {
  id: number;
  type: EventType;
  description: string;
  actor?: string;
  ts: Date;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: 'UTC',
  });
}

const EVENT_META: Record<EventType, { icon: React.ReactNode; dot: string }> = {
  detected:     { icon: <AlertTriangle size={10} />, dot: 'bg-red-500 text-red-900'      },
  analysis:     { icon: <Brain         size={10} />, dot: 'bg-indigo-500 text-indigo-900' },
  status:       { icon: <CheckCircle   size={10} />, dot: 'bg-emerald-500 text-emerald-900' },
  escalation:   { icon: <Bell          size={10} />, dot: 'bg-amber-400 text-amber-900'  },
  rollback:     { icon: <RotateCcw     size={10} />, dot: 'bg-orange-400 text-orange-900' },
  notification: { icon: <MessageSquare size={10} />, dot: 'bg-sky-400 text-sky-900'      },
  assign:       { icon: <User          size={10} />, dot: 'bg-violet-400 text-violet-900' },
};

// ── Component ──────────────────────────────────────────────────────────────────

export default function IncidentTimeline({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => b.ts.getTime() - a.ts.getTime());

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Shield size={12} className="text-slate-600" />
          <p className="panel-title">Incident Timeline</p>
        </div>
        <span className="text-[10px] text-slate-700 tabular-nums">{events.length} events</span>
      </div>

      <div className="px-5 py-4">
        {sorted.length === 0 && (
          <p className="text-[12px] text-slate-700 py-4 text-center">No events yet</p>
        )}

        <div className="relative">
          {/* Vertical connector line */}
          {sorted.length > 1 && (
            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-slate-800" />
          )}

          <div className="space-y-0">
            {sorted.map((event, i) => {
              const meta = EVENT_META[event.type];
              const isLast = i === sorted.length - 1;
              return (
                <div key={event.id} className="flex items-start gap-3 group">
                  {/* Icon dot */}
                  <div
                    className={`relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.dot} ${isLast ? 'opacity-50' : ''}`}
                  >
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 min-w-0 pb-4 ${isLast ? 'pb-0' : ''}`}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] text-slate-300 leading-snug group-hover:text-slate-200 transition-colors">
                        {event.description}
                      </p>
                      <span className="text-[10px] text-slate-700 font-mono flex-shrink-0 mt-px">
                        {formatTime(event.ts)}
                      </span>
                    </div>
                    {event.actor && (
                      <p className="text-[10px] text-slate-600 mt-0.5">{event.actor}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
