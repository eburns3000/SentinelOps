import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getIncident, updateTriage } from '../lib/dynamo';
import { ok, notFound, serverError } from '../lib/http';
import { buildIncidentContext } from '../lib/enrich';
import { runTriageAnalysis } from '../lib/claude';

/**
 * POST /incidents/{id}/analyze
 *
 * Re-runs AI triage on an existing incident. Useful when:
 *   - New metrics or log evidence has been added
 *   - The initial analysis needs to be refreshed after enrichment
 *   - An engineer wants a second opinion on the root cause
 *
 * Flow:
 *   1. Read the incident from DynamoDB
 *   2. Build enriched context (metrics, logs, deployment)
 *   3. Send structured context to Claude via the AI analysis layer
 *   4. Persist the new triage result to DynamoDB
 *   5. Return the updated triage
 *
 * The Anthropic API key is retrieved from AWS SSM Parameter Store at runtime.
 * The frontend never calls Claude directly.
 */
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return notFound('Incident ID required');

    // 1. Load incident
    const incident = await getIncident(id);
    if (!incident) return notFound(`Incident ${id} not found`);

    // 2. Build context snapshot for the AI layer
    const context = buildIncidentContext(incident);

    // 3. Call Claude — API key resolved from SSM, never exposed to frontend
    const triage = await runTriageAnalysis(context);

    // 4. Persist updated triage
    await updateTriage(id, triage);

    // 5. Return the new analysis
    return ok({ incidentId: id, triage });
  } catch (err) {
    return serverError(err);
  }
}
