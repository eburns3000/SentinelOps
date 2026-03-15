import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricPoint } from '../../types';

const barColor: Record<MetricPoint['severity'], string> = {
  critical: 'bg-red-500',
  warning:  'bg-amber-400',
  normal:   'bg-emerald-500',
};

const currentColor: Record<MetricPoint['severity'], string> = {
  critical: 'text-red-400',
  warning:  'text-amber-400',
  normal:   'text-emerald-400',
};

const TrendIcon = {
  up:     TrendingUp,
  down:   TrendingDown,
  stable: Minus,
};

function trendColor(trend: MetricPoint['trend'], severity: MetricPoint['severity']): string {
  if (trend === 'stable') return 'text-slate-700';
  if (severity === 'normal') return trend === 'down' ? 'text-emerald-500' : 'text-slate-600';
  return 'text-red-500';
}

export default function MetricsPanel({ metrics }: { metrics: MetricPoint[] }) {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="panel-title">Metrics &amp; Evidence</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Observed signals at incident onset</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded px-2 py-0.5 font-mono">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse-slow" />
          live
        </span>
      </div>

      <div className="px-5 divide-y divide-slate-800/50">
        {metrics.map((m) => {
          const Icon = TrendIcon[m.trend];
          const iconCls = trendColor(m.trend, m.severity);

          return (
            <div key={m.label} className="py-3.5 first:pt-3 last:pb-3">
              {/* Label row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-medium text-slate-300">{m.label}</span>
                  <Icon size={11} className={iconCls} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-600 font-mono">
                    <span className="text-slate-700">base</span> {m.baseline}
                  </span>
                  <span className={`text-[13px] font-bold font-mono tabular-nums ${currentColor[m.severity]}`}>
                    {m.current}
                  </span>
                </div>
              </div>
              {/* Bar */}
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${barColor[m.severity]}`}
                  style={{ width: `${m.pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
