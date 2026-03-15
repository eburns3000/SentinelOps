// ─── Core domain types ────────────────────────────────────────────────────────
// These mirror the frontend types in src/types/index.ts intentionally.
// When connecting the frontend to this backend, both sides share this contract.

export type Severity      = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'acknowledged' | 'mitigated' | 'resolved';
export type Environment   = 'production' | 'staging' | 'development';

export interface MetricPoint {
  label:    string;
  baseline: string;
  current:  string;
  unit:     string;
  trend:    'up' | 'down' | 'stable';
  severity: 'critical' | 'warning' | 'normal';
  pct:      number; // 0-100, used by the frontend progress bar
}

export interface LogEntry {
  ts:      string; // HH:mm:ss.mmm
  level:   'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  service: string;
  message: string;
}

export interface DeploymentContext {
  version:         string;
  deployedAt:      string; // ISO-8601
  minutesBefore:   number; // minutes between deploy and incident onset
  team:            string;
  environment:     Environment;
  changeType:      string;
  relatedService?: string;
  commit:          string;
}

export interface AITriage {
  probableCause:    string;
  confidence:       number; // 0-100
  impactedComponent: string;
  reasoning:        string;
  actions:          string[];
  analysisId:       string;
  generatedAt:      string; // ISO-8601
}

export interface Incident {
  id:           string;
  title:        string;
  service:      string;
  severity:     Severity;
  status:       IncidentStatus;
  region:       string;
  environment:  Environment;
  detectedAt:   string; // ISO-8601
  assignedTeam: string;
  summary:      string;
  metrics:      MetricPoint[];
  logs:         LogEntry[];
  deployment:   DeploymentContext;
  triage:       AITriage;
}

// ─── API request / response shapes ───────────────────────────────────────────

/** Body for POST /incidents */
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

/** Body for PATCH /incidents/{id}/status */
export interface UpdateStatusInput {
  status: IncidentStatus;
}

/** Structured context passed to the AI analysis layer */
export interface IncidentContext {
  id:         string;
  title:      string;
  service:    string;
  severity:   Severity;
  environment: Environment;
  region:     string;
  detectedAt: string;
  summary:    string;
  metrics:    MetricPoint[];
  logs:       LogEntry[];
  deployment: DeploymentContext;
}
