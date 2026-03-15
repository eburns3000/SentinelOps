import { GitCommit, AlertTriangle } from 'lucide-react';
import { DeploymentContext } from '../../types';

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

function Row({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-slate-800/50 last:border-0 gap-4">
      <span className="text-[11px] text-slate-500 flex-shrink-0 leading-snug">{label}</span>
      <span
        className={`text-[11px] text-right leading-snug ${
          highlight
            ? 'text-amber-300 font-semibold'
            : mono
            ? 'font-mono text-slate-300'
            : 'text-slate-300 font-medium'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// Simple, accurate deployment-to-incident timeline
function DeployTimeline({ minutesBefore }: { minutesBefore: number }) {
  return (
    <div className="mx-5 mt-4 mb-1 border border-slate-700/60 rounded-lg p-4 bg-slate-800/30">
      {/* Node row */}
      <div className="flex items-center gap-0">
        {/* Deploy node */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />
          <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">Deployed</span>
        </div>

        {/* Gap line */}
        <div className="flex-1 flex flex-col items-center gap-1 mx-3">
          <div className="w-full flex items-center gap-1">
            <div className="flex-1 border-t border-dashed border-slate-700" />
            <div className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 flex-shrink-0">
              <span className="text-[10px] font-semibold text-amber-300">
                {minutesBefore}m gap
              </span>
            </div>
            <div className="flex-1 border-t border-dashed border-slate-700" />
          </div>
        </div>

        {/* Incident node */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400 ring-2 ring-red-400/20" />
          <span className="text-[10px] text-slate-500 font-mono whitespace-nowrap">Incident</span>
        </div>
      </div>
    </div>
  );
}

export default function DeploymentPanel({ deployment }: { deployment: DeploymentContext }) {
  const isRecent = deployment.minutesBefore <= 30;

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <GitCommit size={13} className="text-slate-500" />
          <p className="panel-title">Deployment Context</p>
        </div>
        {isRecent && (
          <div className="flex items-center gap-1 text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5 font-medium">
            <AlertTriangle size={10} />
            Recent deploy
          </div>
        )}
      </div>

      <DeployTimeline minutesBefore={deployment.minutesBefore} />

      <div className="px-5 pb-4 pt-3">
        <Row label="Version"            value={deployment.version}                    mono />
        <Row label="Commit"             value={deployment.commit}                     mono />
        <Row label="Change type"        value={deployment.changeType}                      />
        <Row label="Deployed at"        value={formatDateTime(deployment.deployedAt)} mono />
        <Row label="Owning team"        value={deployment.team}                            />
        {deployment.relatedService && (
          <Row label="Dependency"       value={deployment.relatedService}             mono />
        )}
        <Row
          label="Deploy-to-onset gap"
          value={`${deployment.minutesBefore} minutes`}
          highlight={isRecent}
        />
      </div>
    </div>
  );
}
