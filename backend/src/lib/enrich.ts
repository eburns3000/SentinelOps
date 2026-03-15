import { Incident, IncidentContext } from '../types';

/**
 * buildIncidentContext
 *
 * Transforms a raw incident record into the structured signal snapshot
 * consumed by the AI analysis layer.
 *
 * In production, this is where you would aggregate live signals:
 *   - Metrics   → CloudWatch Metrics API, Datadog, Prometheus
 *   - Logs      → CloudWatch Logs Insights, Splunk, Elastic
 *   - Deployment → AWS CodeDeploy API, GitHub Deployments API, Argo CD
 *   - Service   → Internal CMDB, AWS Service Catalog, service registry
 *
 * For the demo, the incident record already contains pre-populated context
 * (as provided by the intake form or monitoring webhook). This layer simply
 * selects and structures the fields the prompt builder expects.
 *
 * This separation is intentional: enrichment is a distinct concern from
 * storage and analysis, and decoupling it here makes the production upgrade
 * path straightforward — swap this function's data sources, keep the contract.
 */
export function buildIncidentContext(incident: Incident): IncidentContext {
  return {
    id:          incident.id,
    title:       incident.title,
    service:     incident.service,
    severity:    incident.severity,
    environment: incident.environment,
    region:      incident.region,
    detectedAt:  incident.detectedAt,
    summary:     incident.summary,
    // Pass through whatever signal data was provided at intake.
    // If these arrays are empty, Claude will note the absence of evidence
    // and calibrate confidence accordingly.
    metrics:     incident.metrics,
    logs:        incident.logs,
    deployment:  incident.deployment,
  };
}
