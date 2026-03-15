import { Terminal, Copy } from 'lucide-react';
import { LogEntry } from '../../types';

const levelStyle: Record<LogEntry['level'], string> = {
  ERROR: 'text-red-400',
  WARN:  'text-amber-400',
  INFO:  'text-sky-400',
  DEBUG: 'text-slate-500',
};

const levelBg: Record<LogEntry['level'], string> = {
  ERROR: 'bg-red-500/10 border-red-500/25',
  WARN:  'bg-amber-500/10 border-amber-500/25',
  INFO:  'bg-sky-500/10 border-sky-500/25',
  DEBUG: 'bg-slate-800 border-slate-700',
};

// Width is fixed so timestamps and level badges align across all rows
const levelWidth: Record<LogEntry['level'], string> = {
  ERROR: 'w-10',
  WARN:  'w-9',
  INFO:  'w-8',
  DEBUG: 'w-11',
};

export default function LogsPanel({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Terminal size={13} className="text-slate-500" />
          <p className="panel-title">Log Stream</p>
        </div>
        <button className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-400 transition-colors">
          <Copy size={11} />
          Copy
        </button>
      </div>

      {/* Terminal chrome */}
      <div className="bg-[#06090e] border-b border-slate-800 px-4 py-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-600">
          {logs[0]?.service} / stderr
        </span>
        <span className="font-mono text-[10px] text-slate-700">
          {logs.length} entries
        </span>
      </div>

      {/* Log entries */}
      <div className="bg-[#06090e] px-4 py-3 space-y-1.5 overflow-x-auto">
        {logs.map((log, i) => (
          <div key={i} className="flex items-start gap-2.5 group min-w-0">
            <span className="font-mono text-[10px] text-slate-700 mt-px flex-shrink-0 w-[76px] tabular-nums">
              {log.ts}
            </span>
            <span
              className={`inline-flex items-center justify-center rounded border text-[9px] font-bold tracking-wider flex-shrink-0 mt-px ${levelBg[log.level]} ${levelStyle[log.level]} ${levelWidth[log.level]} py-px`}
            >
              {log.level}
            </span>
            <span className="font-mono text-[11px] text-slate-400 leading-relaxed break-words group-hover:text-slate-300 transition-colors min-w-0">
              {log.message}
            </span>
          </div>
        ))}
      </div>

      <div className="px-4 py-2.5 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-700">
          Showing {logs.length} most recent entries
        </span>
        <button className="text-[11px] text-indigo-500 hover:text-indigo-400 transition-colors">
          Open log explorer
        </button>
      </div>
    </div>
  );
}
