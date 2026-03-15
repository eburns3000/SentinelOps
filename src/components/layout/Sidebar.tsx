import { Shield, Activity, Search, X } from 'lucide-react';
import { Incident, Severity } from '../../types';
import { SeverityDot, StatusBadge } from '../ui/Badge';
import { useState } from 'react';

const NOW = new Date('2026-03-15T09:35:00Z');

function formatTimeAgo(isoString: string): string {
  const then = new Date(isoString);
  const diffMin = Math.floor((NOW.getTime() - then.getTime()) / 60000);
  if (diffMin < 60) return `${diffMin}m ago`;
  const h = Math.floor(diffMin / 60);
  const m = diffMin % 60;
  return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
}

const severityOrder: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

interface Props {
  incidents: Incident[];
  selectedId: string;
  onSelect: (id: string) => void;
  systemHealth: { ok: number; degraded: number; critical: number };
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ incidents, selectedId, onSelect, systemHealth, open = true, onClose }: Props) {
  const [query, setQuery] = useState('');

  const filtered = incidents
    .filter(
      (inc) =>
        query === '' ||
        inc.title.toLowerCase().includes(query.toLowerCase()) ||
        inc.service.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const total = systemHealth.ok + systemHealth.degraded + systemHealth.critical;

  return (
    <aside className={`fixed inset-y-0 left-0 w-80 bg-[#0b0f18] border-r border-slate-800/80 flex flex-col z-30 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
      {/* ── Brand ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield size={14} className="text-white" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-white tracking-tight leading-none">
            SentinelOps
          </p>
          <p className="text-slate-600 text-[10px] mt-0.5 tracking-wide">
            Incident Intelligence Platform
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
            <span className="text-emerald-400 text-[10px] font-semibold tracking-widest">LIVE</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden text-slate-600 hover:text-slate-400 transition-colors">
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* ── System health ─────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            Service Health
          </p>
          <div className="flex items-center gap-1">
            <Activity size={10} className="text-slate-700" />
            <span className="text-[10px] text-slate-700">{total} services</span>
          </div>
        </div>
        {/* Segmented bar */}
        <div className="flex rounded-sm overflow-hidden h-1.5 gap-px bg-slate-800">
          <div
            className="bg-emerald-500 transition-all"
            style={{ width: `${(systemHealth.ok / total) * 100}%` }}
          />
          <div
            className="bg-amber-400 transition-all"
            style={{ width: `${(systemHealth.degraded / total) * 100}%` }}
          />
          <div
            className="bg-red-500 transition-all"
            style={{ width: `${(systemHealth.critical / total) * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {systemHealth.ok} healthy
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {systemHealth.degraded} degraded
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {systemHealth.critical} critical
          </span>
        </div>
      </div>

      {/* ── Queue header + search ─────────────────────────────────────────── */}
      <div className="px-4 pt-3.5 pb-2">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            Incident Queue
          </p>
          <span className="text-[10px] font-semibold text-slate-600 bg-slate-800 border border-slate-700/60 rounded px-1.5 py-0.5 tabular-nums">
            {filtered.length}
          </span>
        </div>
        <div className="relative">
          <Search
            size={12}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search incidents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-slate-300 placeholder-slate-700 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/15 transition-all"
          />
        </div>
      </div>

      {/* ── Incident list ─────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {filtered.length === 0 && (
          <p className="text-center text-slate-700 text-[12px] py-8">No incidents found</p>
        )}
        {filtered.map((inc) => {
          const isActive = inc.id === selectedId;
          return (
            <button
              key={inc.id}
              onClick={() => onSelect(inc.id)}
              className={`w-full text-left px-3 py-3 rounded-lg mt-1 transition-all group ${
                isActive ? 'incident-item-active' : 'incident-item hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-1 flex-shrink-0">
                  <SeverityDot severity={inc.severity} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[12px] font-medium leading-snug truncate ${
                      isActive ? 'text-slate-100' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {inc.title}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 truncate font-mono">
                    {inc.service}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={inc.status} />
                    <span className="text-[10px] text-slate-700 ml-auto tabular-nums">
                      {formatTimeAgo(inc.detectedAt)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-600">AI Engine</p>
            <p className="text-[10px] text-slate-700 mt-0.5 font-mono">claude-sonnet-4-5</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-medium text-slate-600">Environment</p>
            <p className="text-[10px] text-slate-700 mt-0.5">Production · us-east-1</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
