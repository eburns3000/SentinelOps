import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { getIncident, listIncidents } from '../lib/dynamo';
import { ok, notFound, serverError } from '../lib/http';

/**
 * GET /incidents        → list all incidents (newest first)
 * GET /incidents/{id}   → get a single incident
 */
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;

    if (id) {
      const incident = await getIncident(id);
      if (!incident) return notFound(`Incident ${id} not found`);
      return ok(incident);
    }

    const incidents = await listIncidents();
    return ok(incidents);
  } catch (err) {
    return serverError(err);
  }
}
