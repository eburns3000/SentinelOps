import { useState } from 'react';
import {
  Ticket, Bell, UserPlus, CheckCircle, BookOpen,
  RotateCcw, MessageSquare, Share2, X, ExternalLink,
  AlertTriangle, User, Hash,
} from 'lucide-react';
import { Incident, IncidentStatus } from '../../types';
import { updateIncidentStatus } from '../../services/api';
import { ToastMessage } from '../ui/Toast';
import { EventType } from './IncidentTimeline';

interface Props {
  incident: Incident;
  onStatusChange: (id: string, status: IncidentStatus) => void;
  onToast: (t: Omit<ToastMessage, 'id'>) => void;
  onEvent: (type: EventType, description: string, actor?: string) => void;
}

// ── Modal ──────────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <p className="text-[13px] font-semibold text-slate-200">{title}</p>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-400 transition-colors">
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-[12px] text-slate-300 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  );
}

// ── Jira modal ─────────────────────────────────────────────────────────────────

function JiraModal({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const severityLabel = { critical: 'P1 — Critical', high: 'P2 — High', medium: 'P3 — Medium', low: 'P4 — Low' }[incident.severity];
  return (
    <Modal title="Open Incident Ticket" onClose={onClose}>
      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono bg-slate-800/60 rounded-lg px-3 py-2">
          <Ticket size={11} className="text-indigo-400" />
          <span>PROJECT: OPS · Type: Incident · Reporter: J. Chen</span>
        </div>
        <Field label="Summary" value={incident.title} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Priority" value={severityLabel} />
          <Field label="Assignee" value={incident.assignedTeam} />
          <Field label="Service" value={incident.service} mono />
          <Field label="Environment" value={incident.environment} />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1">Description</p>
          <p className="text-[12px] text-slate-400 leading-relaxed">{incident.summary}</p>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-semibold rounded-lg py-2 transition-colors"
          >
            <ExternalLink size={11} /> Create in Jira
          </button>
          <button onClick={onClose} className="px-4 text-[12px] text-slate-500 hover:text-slate-300 border border-slate-700 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── PagerDuty modal ────────────────────────────────────────────────────────────

function PagerDutyModal({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  return (
    <Modal title="Page On-Call Engineer" onClose={onClose}>
      <div className="px-5 py-4 space-y-4">
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-red-300 leading-snug">
            This will immediately page the on-call engineer for <span className="font-semibold">{incident.assignedTeam}</span> via PagerDuty.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Escalation Policy" value={`${incident.assignedTeam} On-Call`} />
          <Field label="Urgency" value={incident.severity === 'critical' || incident.severity === 'high' ? 'High' : 'Low'} />
          <Field label="Service" value={incident.service} mono />
          <Field label="Incident ID" value={incident.id} mono />
        </div>
        <Field label="Alert Message" value={incident.title} />
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-[12px] font-semibold rounded-lg py-2 transition-colors"
          >
            <Bell size={11} /> Send Page
          </button>
          <button onClick={onClose} className="px-4 text-[12px] text-slate-500 hover:text-slate-300 border border-slate-700 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Slack modal ────────────────────────────────────────────────────────────────

function SlackModal({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const msg = `🚨 *${incident.title}*\n> ${incident.summary}\n\n*Severity:* ${incident.severity.toUpperCase()} | *Service:* \`${incident.service}\` | *ID:* ${incident.id}`;
  return (
    <Modal title="Notify #incidents" onClose={onClose}>
      <div className="px-5 py-4 space-y-4">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Hash size={11} />
          <span>Posting to <span className="text-slate-300 font-semibold">#incidents</span></span>
        </div>
        <div className="bg-slate-800/60 rounded-lg px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
          {msg}
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#4A154B] hover:bg-[#611f69] text-white text-[12px] font-semibold rounded-lg py-2 transition-colors"
          >
            <MessageSquare size={11} /> Post to Slack
          </button>
          <button onClick={onClose} className="px-4 text-[12px] text-slate-500 hover:text-slate-300 border border-slate-700 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Assign modal ───────────────────────────────────────────────────────────────

const ENGINEERS = ['Alex Kim', 'Jordan Lee', 'Sam Patel', 'Morgan Chen', 'Riley Park'];

function AssignModal({ incident, onClose, onAssign }: { incident: Incident; onClose: () => void; onAssign: (eng: string) => void }) {
  const [selected, setSelected] = useState('');
  return (
    <Modal title="Assign Owner" onClose={onClose}>
      <div className="px-5 py-4 space-y-4">
        <Field label="Incident" value={`${incident.id} — ${incident.service}`} mono />
        <div>
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-2">Select Engineer</p>
          <div className="space-y-1.5">
            {ENGINEERS.map((eng) => (
              <button
                key={eng}
                onClick={() => setSelected(eng)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                  selected === eng
                    ? 'border-indigo-500/40 bg-indigo-600/10 text-indigo-300'
                    : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <User size={11} className="text-slate-500" />
                </div>
                <span className="text-[12px] font-medium">{eng}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => { if (selected) { onAssign(selected); onClose(); } }}
            disabled={!selected}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-semibold rounded-lg py-2 transition-colors"
          >
            Assign {selected ? `to ${selected}` : ''}
          </button>
          <button onClick={onClose} className="px-4 text-[12px] text-slate-500 hover:text-slate-300 border border-slate-700 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

type ModalType = 'jira' | 'pagerduty' | 'slack' | 'assign' | null;

const primaryCls = {
  indigo: {
    card:  'bg-indigo-600/10 border-indigo-500/30 hover:bg-indigo-600/18 hover:border-indigo-500/50',
    icon:  'bg-indigo-600/20 text-indigo-400',
    label: 'text-indigo-300',
    sub:   'text-indigo-500/70',
  },
  red: {
    card:  'bg-red-500/10 border-red-500/25 hover:bg-red-500/16 hover:border-red-500/40',
    icon:  'bg-red-500/20 text-red-400',
    label: 'text-red-300',
    sub:   'text-red-500/60',
  },
};

export default function ResponseActionsPanel({ incident, onStatusChange, onToast, onEvent }: Props) {
  const [modal, setModal] = useState<ModalType>(null);

  async function handleAcknowledge() {
    try {
      await updateIncidentStatus(incident.id, 'acknowledged');
      onStatusChange(incident.id, 'acknowledged');
      onToast({ type: 'success', title: 'Incident acknowledged', body: incident.id });
      onEvent('status', 'Incident acknowledged', 'J. Chen');
    } catch {
      onToast({ type: 'error', title: 'Failed to update status', body: 'Check API connectivity' });
    }
  }

  async function handleMitigate() {
    try {
      await updateIncidentStatus(incident.id, 'mitigated');
      onStatusChange(incident.id, 'mitigated');
      onToast({ type: 'success', title: 'Incident marked mitigated', body: incident.id });
      onEvent('status', 'Incident marked as mitigated', 'J. Chen');
    } catch {
      onToast({ type: 'error', title: 'Failed to update status', body: 'Check API connectivity' });
    }
  }

  const isAcknowledged = ['acknowledged', 'mitigated', 'resolved'].includes(incident.status);

  const PRIMARY_ACTIONS = [
    { label: 'Open Incident Ticket', icon: Ticket, sub: 'Jira · ServiceNow', style: 'indigo' as const, onClick: () => { setModal('jira'); onEvent('notification', 'Jira ticket creation initiated', 'J. Chen'); } },
    { label: 'Page On-Call Engineer', icon: Bell, sub: 'PagerDuty', style: 'red' as const, onClick: () => { setModal('pagerduty'); onEvent('escalation', `On-call paged via PagerDuty`, incident.assignedTeam); } },
  ];

  const SECONDARY_ACTIONS = [
    { label: 'Assign Owner',         icon: UserPlus,      sub: 'Set responsible engineer', onClick: () => { setModal('assign'); } },
    { label: isAcknowledged ? 'Mark Mitigated' : 'Mark Acknowledged', icon: CheckCircle, sub: 'Update incident state', onClick: isAcknowledged ? handleMitigate : handleAcknowledge },
    { label: 'View Runbook',         icon: BookOpen,      sub: 'Confluence',               onClick: () => { onToast({ type: 'info', title: 'Opening runbook…', body: `${incident.service} runbook` }); onEvent('notification', `Runbook opened for ${incident.service}`, 'J. Chen'); } },
    { label: 'Initiate Rollback',    icon: RotateCcw,     sub: 'Revert last deployment',   onClick: () => { onToast({ type: 'info', title: 'Rollback initiated', body: incident.deployment.version }); onEvent('rollback', `Rollback initiated to ${incident.deployment.version}`, 'J. Chen'); } },
    { label: 'Notify #incidents',    icon: MessageSquare, sub: 'Post to Slack',            onClick: () => { setModal('slack'); onEvent('notification', 'Alert posted to #incidents', 'J. Chen'); } },
    { label: 'Export Triage Report', icon: Share2,        sub: 'PDF · Markdown',           onClick: () => { onToast({ type: 'success', title: 'Report exported', body: `${incident.id}.pdf` }); onEvent('notification', 'Triage report exported', 'J. Chen'); } },
  ];

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="panel-title">Response Actions</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Trigger workflows and integrations</p>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {PRIMARY_ACTIONS.map(({ label, icon: Icon, sub, style, onClick }) => {
              const cls = primaryCls[style];
              return (
                <button
                  key={label}
                  onClick={onClick}
                  className={`group flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${cls.card}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cls.icon}`}>
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[12px] font-semibold leading-snug ${cls.label}`}>{label}</p>
                    <p className={`text-[10px] mt-0.5 ${cls.sub}`}>{sub}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SECONDARY_ACTIONS.map(({ label, icon: Icon, sub, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="group flex flex-col items-start gap-2 rounded-lg border border-slate-800 bg-slate-800/40 px-3 py-3 text-left transition-all duration-150 hover:bg-slate-800 hover:border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
              >
                <div className="w-6 h-6 rounded bg-slate-700/70 flex items-center justify-center">
                  <Icon size={12} className="text-slate-400 group-hover:text-slate-300 transition-colors" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400 group-hover:text-slate-300 transition-colors leading-snug">
                    {label}
                  </p>
                  <p className="text-[10px] text-slate-700 mt-0.5 group-hover:text-slate-600 transition-colors">
                    {sub}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {modal === 'jira'       && <JiraModal      incident={incident} onClose={() => setModal(null)} />}
      {modal === 'pagerduty'  && <PagerDutyModal incident={incident} onClose={() => setModal(null)} />}
      {modal === 'slack'      && <SlackModal     incident={incident} onClose={() => setModal(null)} />}
      {modal === 'assign'     && <AssignModal    incident={incident} onClose={() => setModal(null)} onAssign={(eng) => onEvent('assign', `Incident assigned to ${eng}`, 'J. Chen')} />}
    </>
  );
}
