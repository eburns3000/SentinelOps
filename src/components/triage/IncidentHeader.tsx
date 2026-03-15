import {
  Globe,
  Server,
  Users,
  Clock,
  Hash,
  ExternalLink,
  MapPin,
  Timer,
} from 'lucide-react';
import { Incident } from '../../types';
import { SeverityBadge, StatusBadge, Tag } from '../ui/Badge';

const NOW = new Date('2026-03-15T09:35:00Z');

function formatDateTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' UTC';
}

function formatAge(isoString: string): string {
  const then = new Date(isoString);
  const diffMin = Math.floor((NOW.getTime() - then.getTime()) / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function MetaItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center gap-1">
        <Icon size={10} className="text-slate-700 flex-shrink-0" />
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest truncate">
          {label}
        </span>
      </div>
      <span className={`text-[12px] text-slate-300 truncate ${mono ? 'font-mono' : 'font-medium'}`}>
        {value}
      </span>
    </div>
  );
}

export default function IncidentHeader({ incident }: { incident: Incident }) {
  return (
    <div className="panel mb-5">
      {/* ── Title row ─────────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-800">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Tag>{incident.id}</Tag>
              <Tag>{incident.region}</Tag>
              <Tag>
                {incident.environment.charAt(0).toUpperCase() + incident.environment.slice(1)}
              </Tag>
            </div>
            <h1 className="text-[17px] font-semibold text-slate-100 leading-snug tracking-tight">
              {incident.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 pt-0.5">
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        </div>

        <p className="text-[13px] text-slate-400 mt-3 leading-relaxed max-w-4xl">
          {incident.summary}
        </p>
      </div>

      {/* ── Meta grid ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-4 px-6 py-4 border-b border-slate-800">
        <MetaItem icon={Server} label="Service"     value={incident.service}                   mono />
        <MetaItem icon={Globe}  label="Region"      value={incident.region}                    mono />
        <MetaItem icon={MapPin} label="Environment" value={
          incident.environment.charAt(0).toUpperCase() + incident.environment.slice(1)
        } />
        <MetaItem icon={Users}  label="Team"        value={incident.assignedTeam}                   />
        <MetaItem icon={Clock}  label="Detected"    value={formatDateTime(incident.detectedAt)} mono />
        <MetaItem icon={Timer}  label="Duration"    value={`Open ${formatAge(incident.detectedAt)}`}    />
      </div>

      {/* ── Quick links ───────────────────────────────────────────────────── */}
      <div className="px-6 py-3 flex items-center gap-5">
        <button className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
          <ExternalLink size={11} />
          Monitoring dashboard
        </button>
        <button className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
          <ExternalLink size={11} />
          Service runbook
        </button>
        <button className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
          <Hash size={11} />
          {incident.id}
        </button>
      </div>
    </div>
  );
}
