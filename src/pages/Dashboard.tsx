import { useState, useEffect, useCallback, useRef } from 'react';
import { INCIDENTS } from '../data/incidents';
import { fetchIncidents } from '../services/api';
import { Incident, IncidentStatus, AITriage } from '../types';
import Sidebar from '../components/layout/Sidebar';
import IncidentHeader from '../components/triage/IncidentHeader';
import MetricsPanel from '../components/triage/MetricsPanel';
import LogsPanel from '../components/triage/LogsPanel';
import DeploymentPanel from '../components/triage/DeploymentPanel';
import AITriagePanel from '../components/triage/AITriagePanel';
import ResponseActionsPanel from '../components/triage/ResponseActionsPanel';
import IncidentTimeline, { TimelineEvent, EventType } from '../components/triage/IncidentTimeline';
import TopBar from '../components/layout/TopBar';
import ToastContainer, { ToastMessage } from '../components/ui/Toast';

const SYSTEM_HEALTH = { ok: 31, degraded: 5, critical: 3 };

let nextEventId = 100;

function seedEvents(incident: Incident): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: nextEventId++,
      type: 'detected',
      description: 'Incident detected',
      actor: 'Monitoring system',
      ts: new Date(incident.detectedAt),
    },
  ];
  if (incident.triage?.generatedAt) {
    events.push({
      id: nextEventId++,
      type: 'analysis',
      description: 'AI triage analysis completed',
      actor: 'claude-sonnet-4-5',
      ts: new Date(incident.triage.generatedAt),
    });
  }
  return events;
}

export default function Dashboard() {
  const [incidents, setIncidents] = useState<Incident[]>(INCIDENTS);
  const [selectedId, setSelectedId] = useState(INCIDENTS[0].id);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(() => seedEvents(INCIDENTS[0]));
  const toastId = useRef(0);

  useEffect(() => {
    fetchIncidents()
      .then((data) => {
        if (data.length > 0) {
          setIncidents(data);
          setSelectedId(data[0].id);
          setTimeline(seedEvents(data[0]));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Reset timeline when switching incidents
  useEffect(() => {
    const inc = incidents.find((i) => i.id === selectedId);
    if (inc) setTimeline(seedEvents(inc));
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const addToast = useCallback((t: Omit<ToastMessage, 'id'>) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev, { ...t, id }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addEvent = useCallback((type: EventType, description: string, actor?: string) => {
    setTimeline((prev) => [
      ...prev,
      { id: nextEventId++, type, description, actor, ts: new Date() },
    ]);
  }, []);

  function handleStatusChange(incidentId: string, status: IncidentStatus) {
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, status } : i))
    );
  }

  function handleTriageUpdate(incidentId: string, triage: AITriage) {
    setIncidents((prev) =>
      prev.map((i) => (i.id === incidentId ? { ...i, triage } : i))
    );
  }

  const incident = incidents.find((i) => i.id === selectedId) ?? incidents[0];

  return (
    <div className="flex min-h-screen bg-[#080b10]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        incidents={incidents}
        selectedId={selectedId}
        onSelect={(id) => { setSelectedId(id); setSidebarOpen(false); }}
        systemHealth={SYSTEM_HEALTH}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 lg:ml-80 flex flex-col min-h-screen">
        <TopBar loading={loading} onMenuToggle={() => setSidebarOpen((v) => !v)} />

        <main className="flex-1 px-6 pb-8 pt-5 overflow-y-auto">
          <IncidentHeader incident={incident} />

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
            {/* Left — AI Triage + Timeline */}
            <div className="xl:col-span-3 flex flex-col gap-5">
              <AITriagePanel
                triage={incident.triage}
                incidentId={incident.id}
                onTriageUpdate={(triage) => handleTriageUpdate(incident.id, triage)}
                onToast={addToast}
                onEvent={addEvent}
              />
              <IncidentTimeline events={timeline} />
              <MetricsPanel metrics={incident.metrics} />
            </div>

            {/* Right — Evidence stack */}
            <div className="xl:col-span-2 flex flex-col gap-5">
              <LogsPanel logs={incident.logs} />
              <DeploymentPanel deployment={incident.deployment} />
            </div>
          </div>

          <div className="mt-5">
            <ResponseActionsPanel
              incident={incident}
              onStatusChange={handleStatusChange}
              onToast={addToast}
              onEvent={addEvent}
            />
          </div>
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
