import { useState } from 'react';
import { Brain, ArrowRight, Cpu, Loader2 } from 'lucide-react';
import { AITriage } from '../../types';
import { reanalyzeIncident } from '../../services/api';
import { ToastMessage } from '../ui/Toast';
import { EventType } from './IncidentTimeline';

// Confidence ring — indigo = confident, amber = moderate, slate = low
// Red is reserved for severity/threat signals, NOT for AI confidence scores.
function ConfidenceRing({ pct }: { pct: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const filled = (pct / 100) * circ;

  const stroke =
    pct >= 70 ? '#6366f1' : pct >= 50 ? '#f59e0b' : '#475569';

  const textColor =
    pct >= 70 ? 'text-indigo-300' : pct >= 50 ? 'text-amber-300' : 'text-slate-400';

  return (
    <div className="flex flex-col items-center gap-1 flex-shrink-0">
      <div className="relative flex items-center justify-center">
        <svg width="68" height="68" className="-rotate-90">
          <circle cx="34" cy="34" r={r} fill="none" stroke="#1e293b" strokeWidth="4" />
          <circle
            cx="34"
            cy="34"
            r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.7s ease, stroke 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-[17px] font-bold leading-none ${textColor}`}>{pct}%</span>
        </div>
      </div>
      <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
        Confidence
      </span>
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' UTC';
}

interface Props {
  triage: AITriage;
  incidentId: string;
  onTriageUpdate: (triage: AITriage) => void;
  onToast: (t: Omit<ToastMessage, 'id'>) => void;
  onEvent: (type: EventType, description: string, actor?: string) => void;
}

export default function AITriagePanel({ triage, incidentId, onTriageUpdate, onToast, onEvent }: Props) {
  const [analyzing, setAnalyzing] = useState(false);

  async function handleReanalyze() {
    setAnalyzing(true);
    try {
      const result = await reanalyzeIncident(incidentId);
      onTriageUpdate(result.triage);
      onToast({ type: 'success', title: 'Re-analysis complete', body: result.incidentId });
      onEvent('analysis', 'AI triage re-analysis completed', 'claude-sonnet-4-5');
    } catch {
      onToast({ type: 'error', title: 'Re-analysis failed', body: 'Anthropic API may be unavailable' });
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div
      className="panel overflow-hidden"
      style={{
        boxShadow: '0 0 0 1px rgba(99,102,241,0.18), 0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-indigo-600/20 border border-indigo-500/30 rounded-md flex items-center justify-center flex-shrink-0">
            <Brain size={13} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-200 leading-none">
              AI Triage Analysis
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5 font-mono">{triage.analysisId}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest">Analyzed</p>
          <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
            {formatDateTime(triage.generatedAt)}
          </p>
        </div>
      </div>

      {/* ── Root cause + confidence ─────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-slate-800 border-l-2 border-l-indigo-500/40">
        <div className="flex items-center gap-5">
          <ConfidenceRing pct={triage.confidence} />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
              Probable Root Cause
            </p>
            <p className="text-[15px] font-semibold text-slate-100 leading-snug">
              {triage.probableCause}
            </p>
            <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-slate-800">
              <Cpu size={11} className="text-slate-600 flex-shrink-0" />
              <span className="text-[11px] text-slate-500">
                Impacted component
              </span>
              <span className="font-mono text-[11px] text-slate-300 ml-1">
                {triage.impactedComponent}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reasoning ──────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 border-b border-slate-800">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
          Analysis
        </p>
        <p className="text-[12px] text-slate-400 leading-[1.7]">{triage.reasoning}</p>
      </div>

      {/* ── Recommended actions ─────────────────────────────────────────────── */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
          Recommended Actions
        </p>
        <ol className="space-y-2.5">
          {triage.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3 group cursor-default">
              <span className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-px bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-500 group-hover:border-indigo-500/40 group-hover:text-indigo-400 transition-colors">
                {i + 1}
              </span>
              <p className="flex-1 text-[12px] text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                {action}
              </p>
              <ArrowRight
                size={11}
                className="mt-0.5 flex-shrink-0 text-slate-800 group-hover:text-indigo-600 transition-colors"
              />
            </li>
          ))}
        </ol>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-slate-800 bg-[#080b10]/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse-slow" />
          <span className="text-[10px] text-slate-600 font-mono">
            claude-sonnet-4-5 · Anthropic
          </span>
        </div>
        <button
          onClick={handleReanalyze}
          disabled={analyzing}
          className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {analyzing && <Loader2 size={11} className="animate-spin" />}
          {analyzing ? 'Analyzing…' : 'Request re-analysis'}
        </button>
      </div>
    </div>
  );
}
