import { APIGatewayProxyResultV2 } from 'aws-lambda';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PATCH,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

export function ok(body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode: 200,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function created(body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode: 201,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

export function badRequest(message: string): APIGatewayProxyResultV2 {
  return {
    statusCode: 400,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

export function notFound(message = 'Not found'): APIGatewayProxyResultV2 {
  return {
    statusCode: 404,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

export function serverError(err: unknown): APIGatewayProxyResultV2 {
  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error('[ERROR]', err);
  return {
    statusCode: 500,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: message }),
  };
}

/** Parse and validate the request body. Returns null if invalid JSON. */
export function parseBody<T>(body: string | null | undefined): T | null {
  if (!body) return null;
  try {
    return JSON.parse(body) as T;
  } catch {
    return null;
  }
}
