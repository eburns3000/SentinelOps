import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getIncident } from '../lib/dynamo';
import { ok, notFound, serverError } from '../lib/http';
import { buildIncidentContext } from '../lib/enrich';

/**
 * POST /incidents/{id}/enrich
 *
 * Reads an existing incident from DynamoDB and returns its enriched context —
 * the structured signal snapshot that will be forwarded to the AI analysis layer.
 *
 * In production this Lambda would aggregate signals from real sources:
 *   - CloudWatch Metrics API for current metric values
 *   - CloudWatch Logs Insights for recent log entries
 *   - AWS CodeDeploy / deployment metadata APIs
 *   - Internal service registry for dependency graph
 *
 * For the demo, it formats the context from the stored incident record and
 * demonstrates the enrichment contract the analyzeIncident Lambda expects.
 */
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return notFound('Incident ID required');

    const incident = await getIncident(id);
    if (!incident) return notFound(`Incident ${id} not found`);

    const context = buildIncidentContext(incident);
    return ok({ incidentId: id, context });
  } catch (err) {
    return serverError(err);
  }
}
