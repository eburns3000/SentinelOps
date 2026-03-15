export type Severity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'open' | 'investigating' | 'acknowledged' | 'mitigated' | 'resolved';
export type Environment = 'production' | 'staging' | 'development';

export interface MetricPoint {
  label: string;
  baseline: string;
  current: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  severity: 'critical' | 'warning' | 'normal';
  pct: number; // 0-100 fill for the bar
}

export interface LogEntry {
  ts: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  service: string;
  message: string;
}

export interface DeploymentContext {
  version: string;
  deployedAt: string;
  minutesBefore: number;
  team: string;
  environment: Environment;
  changeType: string;
  relatedService?: string;
  commit: string;
}

export interface AITriage {
  probableCause: string;
  confidence: number;
  impactedComponent: string;
  reasoning: string;
  actions: string[];
  analysisId: string;
  generatedAt: string;
}

export interface Incident {
  id: string;
  title: string;
  service: string;
  severity: Severity;
  status: IncidentStatus;
  region: string;
  environment: Environment;
  detectedAt: string;
  assignedTeam: string;
  summary: string;
  metrics: MetricPoint[];
  logs: LogEntry[];
  deployment: DeploymentContext;
  triage: AITriage;
}
