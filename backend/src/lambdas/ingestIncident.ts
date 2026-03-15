import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { putIncident } from '../lib/dynamo';
import { created, badRequest, serverError, parseBody } from '../lib/http';
import { buildIncidentContext } from '../lib/enrich';
import { runTriageAnalysis } from '../lib/claude';
import { CreateIncidentInput, Incident } from '../types';

/**
 * POST /incidents
 *
 * Entry point for the incident triage pipeline.
 *
 * Pipeline:
 *   1. Validate inbound incident data (from a monitoring webhook or the demo UI)
 *   2. Assign an ID and timestamp
 *   3. enrichIncidentContext — assemble the structured signal context for analysis
 *   4. analyzeIncident     — send context to Claude, receive structured triage
 *   5. Persist the full incident + triage result to DynamoDB
 *   6. Return the complete record to the caller
 *
 * Steps 3 and 4 are implemented as reusable modules so they can also be
 * triggered independently via their own Lambda endpoints.
 */
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    // 1. Parse and validate the request body
    const input = parseBody<CreateIncidentInput>(event.body);
    if (!input) return badRequest('Request body is required');

    const { title, service, severity, region, environment, assignedTeam, summary } = input;
    if (!title || !service || !severity || !region || !environment || !assignedTeam || !summary) {
      return badRequest('Missing required fields: title, service, severity, region, environment, assignedTeam, summary');
    }

    // 2. Build the incident skeleton
    const id = generateIncidentId();
    const incident: Incident = {
      id,
      title,
      service,
      severity,
      status:       'investigating',
      region,
      environment,
      detectedAt:   new Date().toISOString(),
      assignedTeam,
      summary,
      metrics:      input.metrics    ?? [],
      logs:         input.logs       ?? [],
      deployment:   input.deployment ?? defaultDeployment(environment),
      triage:       placeholderTriage(), // will be replaced in step 4
    };

    // 3. Build enriched context (aggregates signals for the AI layer)
    const context = buildIncidentContext(incident);

    // 4. Run AI triage — Claude is called server-side only
    const triage = await runTriageAnalysis(context);
    incident.triage = triage;

    // 5. Persist the full incident record
    await putIncident(incident);

    // 6. Return the complete incident to the client
    return created(incident);
  } catch (err) {
    return serverError(err);
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateIncidentId(): string {
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `INC-${suffix}`;
}

function placeholderTriage(): Incident['triage'] {
  return {
    probableCause:     'Analysis pending',
    confidence:        0,
    impactedComponent: 'Unknown',
    reasoning:         '',
    actions:           [],
    analysisId:        '',
    generatedAt:       new Date().toISOString(),
  };
}

function defaultDeployment(env: string): Incident['deployment'] {
  return {
    version:       'unknown',
    deployedAt:    new Date().toISOString(),
    minutesBefore: 0,
    team:          'Unknown',
    environment:   env as Incident['deployment']['environment'],
    changeType:    'Unknown',
    commit:        'unknown',
  };
}
