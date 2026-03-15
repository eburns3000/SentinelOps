import { useState, useRef, useEffect } from 'react';
import {
  Bell, Settings, RefreshCw, ChevronRight, Menu,
  AlertTriangle, Info, ExternalLink,
  Moon, FileText, LogOut, Keyboard,
} from 'lucide-react';

const NOW = new Date('2026-03-15T09:35:00Z');

function formatDateTime(d: Date): string {
  return d.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC',
  }) + ' UTC';
}

const NOTIFICATIONS = [
  {
    id: 1, type: 'critical' as const,
    title: 'payments-api error rate 34%',
    sub: 'INC-7841 · 12m ago',
  },
  {
    id: 2, type: 'warning' as const,
    title: 'orders-api p99 latency spike',
    sub: 'INC-7839 · 28m ago',
  },
  {
    id: 3, type: 'info' as const,
    title: 'auth-service triage complete',
    sub: 'INC-7836 · 1h ago',
  },
];

const notifIcon = {
  critical: <AlertTriangle size={12} className="text-red-400" />,
  warning:  <AlertTriangle size={12} className="text-amber-400" />,
  info:     <Info          size={12} className="text-indigo-400" />,
};

const SETTINGS_ITEMS = [
  { icon: Moon,        label: 'Appearance',       sub: 'Dark mode' },
  { icon: Keyboard,    label: 'Keyboard shortcuts', sub: '? to open' },
  { icon: FileText,    label: 'Documentation',     sub: 'docs.sentinelops.io', external: true },
  { icon: LogOut,      label: 'Sign out',          sub: 'J. Chen', danger: true },
];

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, cb]);
}

interface Props {
  loading?: boolean;
  onMenuToggle?: () => void;
}

export default function TopBar({ loading = false, onMenuToggle }: Props) {
  const [showNotif, setShowNotif]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const notifRef    = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useClickOutside(notifRef,    () => setShowNotif(false));
  useClickOutside(settingsRef, () => setShowSettings(false));

  return (
    <header className="sticky top-0 z-20 bg-[#080b10]/95 backdrop-blur-sm border-b border-slate-800/80 px-4 sm:px-6 py-0">
      <div className="flex items-center justify-between h-11">

        {/* Left: hamburger (mobile) + breadcrumb */}
        <div className="flex items-center gap-2">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
            >
              <Menu size={15} />
            </button>
          )}
          <nav className="flex items-center gap-1.5 text-[12px]">
            <span className="hidden sm:inline text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">
              SentinelOps
            </span>
            <ChevronRight size={12} className="hidden sm:inline text-slate-700" />
            <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">
              Incidents
            </span>
            <ChevronRight size={12} className="text-slate-700" />
            <span className="text-slate-300 font-medium">Active</span>
          </nav>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-700 font-mono mr-2 hidden md:block">
            {formatDateTime(NOW)}
          </span>

          {/* Refresh */}
          <button
            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all"
            title="Refresh"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-indigo-400' : ''} />
          </button>

          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => { setShowNotif((v) => !v); setShowSettings(false); }}
              className="relative w-8 h-8 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all"
              title="Notifications"
            >
              <Bell size={13} className={showNotif ? 'text-slate-300' : ''} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>

            {showNotif && (
              <div className="absolute right-0 top-10 w-72 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">
                    Notifications
                  </span>
                  <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 rounded-full px-1.5 py-0.5 font-semibold">
                    {NOTIFICATIONS.length} new
                  </span>
                </div>
                <div className="divide-y divide-slate-800/60">
                  {NOTIFICATIONS.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => setShowNotif(false)}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors text-left"
                    >
                      <span className="mt-0.5 flex-shrink-0">{notifIcon[n.type]}</span>
                      <div className="min-w-0">
                        <p className="text-[12px] text-slate-300 font-medium leading-snug truncate">
                          {n.title}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{n.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowNotif(false)}
                  className="w-full px-4 py-2.5 text-[11px] text-slate-500 hover:text-slate-300 border-t border-slate-800 transition-colors text-center"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          {/* Settings */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => { setShowSettings((v) => !v); setShowNotif(false); }}
              className="w-8 h-8 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-slate-800 transition-all"
              title="Settings"
            >
              <Settings size={13} className={showSettings ? 'text-slate-300' : ''} />
            </button>

            {showSettings && (
              <div className="absolute right-0 top-10 w-52 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-widest">
                    Settings
                  </p>
                </div>
                <div className="py-1">
                  {SETTINGS_ITEMS.map(({ icon: Icon, label, sub, external, danger }) => (
                    <button
                      key={label}
                      onClick={() => setShowSettings(false)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/60 transition-colors text-left ${danger ? 'hover:bg-red-500/10' : ''}`}
                    >
                      <Icon size={13} className={danger ? 'text-red-500/70' : 'text-slate-500'} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-[12px] font-medium leading-none ${danger ? 'text-red-400' : 'text-slate-300'}`}>
                          {label}
                        </p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>
                      </div>
                      {external && <ExternalLink size={10} className="text-slate-700 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          {/* Avatar */}
          <div className="flex items-center gap-2 rounded-md px-2 py-1.5 cursor-pointer hover:bg-slate-800 transition-colors group">
            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-bold text-white leading-none">JC</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-300 transition-colors hidden sm:inline">
              J. Chen
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
