import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import { Incident, IncidentStatus } from '../types';

// ─── Client (module-level singleton for Lambda warm starts) ───────────────────

const raw = new DynamoDBClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
const client = DynamoDBDocumentClient.from(raw);

const TABLE = process.env.DYNAMODB_TABLE_NAME ?? 'sentinelops-incidents';

// ─── Operations ───────────────────────────────────────────────────────────────

/** Write a full incident record (create or overwrite). */
export async function putIncident(incident: Incident): Promise<void> {
  await client.send(
    new PutCommand({
      TableName: TABLE,
      Item: incident,
    })
  );
}

/** Read a single incident by ID. Returns null if not found. */
export async function getIncident(id: string): Promise<Incident | null> {
  const result = await client.send(
    new GetCommand({
      TableName: TABLE,
      Key: { id },
    })
  );
  return (result.Item as Incident) ?? null;
}

/**
 * List all incidents, sorted newest-first by detectedAt.
 * Uses a full table scan — acceptable for demo scale.
 * In production, replace with a GSI on detectedAt.
 */
export async function listIncidents(): Promise<Incident[]> {
  const result = await client.send(
    new ScanCommand({ TableName: TABLE })
  );

  const items = (result.Items ?? []) as Incident[];
  return items.sort(
    (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
  );
}

/** Patch only the status field on an existing incident. */
export async function updateStatus(
  id: string,
  status: IncidentStatus
): Promise<void> {
  await client.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: 'SET #s = :status',
      ExpressionAttributeNames: { '#s': 'status' },
      ExpressionAttributeValues: { ':status': status },
      ConditionExpression: 'attribute_exists(id)',
    })
  );
}

/** Patch the triage field on an existing incident after re-analysis. */
export async function updateTriage(
  id: string,
  triage: Incident['triage']
): Promise<void> {
  await client.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { id },
      UpdateExpression: 'SET triage = :triage',
      ExpressionAttributeValues: { ':triage': triage },
      ConditionExpression: 'attribute_exists(id)',
    })
  );
}
