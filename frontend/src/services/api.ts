/**
 * SentinelOps API service
 *
 * This module is the integration boundary between the React frontend
 * and the SentinelOps Lambda backend.
 *
 * ── Switching from mock data to live backend ──────────────────────────────────
 * The dashboard currently imports from `src/data/incidents.ts` (static mock).
 * To wire in the real backend:
 *   1. Set VITE_API_URL in your .env.local (or CloudFront/S3 env config)
 *   2. Replace the import in Dashboard.tsx:
 *        - import { INCIDENTS } from '../data/incidents';
 *        + import { fetchIncidents } from '../services/api';
 *      and call fetchIncidents() in a useEffect.
 *   3. Wire createIncident() to the WorkloadIntake form submit.
 *   4. Wire reanalyze() to the "Request re-analysis" button in AITriagePanel.
 *   5. Wire updateStatus() to the "Mark Acknowledged" / "Mark Mitigated" actions.
 *
 * The frontend never touches the Anthropic API directly — all AI calls go
 * through the backend Lambda (analyzeIncident) which reads the key from SSM.
 */

import {
  Incident,
  IncidentStatus,
  Severity,
  Environment,
  MetricPoint,
  LogEntry,
  DeploymentContext,
  AITriage,
} from '../types';

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

// ─── Internal fetch helper ────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status} — ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Incidents ────────────────────────────────────────────────────────────────

/** Fetch all incidents, sorted newest-first. */
export function fetchIncidents(): Promise<Incident[]> {
  return request<Incident[]>('/incidents');
}

/** Fetch a single incident by ID including its triage result. */
export function fetchIncident(id: string): Promise<Incident> {
  return request<Incident>(`/incidents/${id}`);
}

// ─── Ingest ───────────────────────────────────────────────────────────────────

export interface CreateIncidentInput {
  title:        string;
  service:      string;
  severity:     Severity;
  region:       string;
  environment:  Environment;
  assignedTeam: string;
  summary:      string;
  metrics:      MetricPoint[];
  logs:         LogEntry[];
  deployment:   DeploymentContext;
}

/**
 * Submit a new incident.
 *
 * The backend pipeline runs synchronously:
 *   ingestIncident → enrichIncidentContext → analyzeIncident (Claude)
 *
 * Returns the full incident including the AI triage result.
 * Expect ~5-10 seconds for the Claude API call to complete.
 */
export function createIncident(input: CreateIncidentInput): Promise<Incident> {
  return request<Incident>('/incidents', {
    method: 'POST',
    body:   JSON.stringify(input),
  });
}

// ─── Analysis ─────────────────────────────────────────────────────────────────

/**
 * Trigger a fresh AI analysis on an existing incident.
 * Useful when new evidence has been added or when an engineer wants
 * a second analysis pass.
 */
export function reanalyzeIncident(id: string): Promise<{ incidentId: string; triage: AITriage }> {
  return request(`/incidents/${id}/analyze`, { method: 'POST' });
}

/**
 * Fetch the enriched signal context for an incident without running analysis.
 * Useful for debugging what data the AI layer received.
 */
export function fetchEnrichedContext(id: string): Promise<{ incidentId: string; context: unknown }> {
  return request(`/incidents/${id}/enrich`, { method: 'POST' });
}

// ─── Status management ────────────────────────────────────────────────────────

/**
 * Update the lifecycle status of an incident.
 * Called from the Response Actions panel (acknowledge, mitigate, resolve).
 */
export function updateIncidentStatus(
  id: string,
  status: IncidentStatus
): Promise<{ incidentId: string; status: IncidentStatus }> {
  return request(`/incidents/${id}/status`, {
    method: 'PATCH',
    body:   JSON.stringify({ status }),
  });
}
