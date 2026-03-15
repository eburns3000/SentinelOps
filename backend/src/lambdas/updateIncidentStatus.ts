import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { updateStatus, getIncident } from '../lib/dynamo';
import { ok, badRequest, notFound, serverError, parseBody } from '../lib/http';
import { UpdateStatusInput, IncidentStatus } from '../types';

const VALID_STATUSES: IncidentStatus[] = [
  'open',
  'investigating',
  'acknowledged',
  'mitigated',
  'resolved',
];

/**
 * PATCH /incidents/{id}/status
 *
 * Updates the lifecycle status of an incident.
 * This is the workflow integration point — called when engineers
 * acknowledge, mitigate, or resolve an incident from the dashboard.
 *
 * Body: { "status": "acknowledged" | "mitigated" | "resolved" | ... }
 */
export async function handler(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  try {
    const id = event.pathParameters?.id;
    if (!id) return notFound('Incident ID required');

    const body = parseBody<UpdateStatusInput>(event.body);
    if (!body?.status) {
      return badRequest('Request body must include a "status" field');
    }

    if (!VALID_STATUSES.includes(body.status)) {
      return badRequest(
        `Invalid status "${body.status}". Must be one of: ${VALID_STATUSES.join(', ')}`
      );
    }

    // Confirm the incident exists before updating
    const existing = await getIncident(id);
    if (!existing) return notFound(`Incident ${id} not found`);

    await updateStatus(id, body.status);

    return ok({ incidentId: id, status: body.status });
  } catch (err) {
    return serverError(err);
  }
}
