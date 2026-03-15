import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

// Module-level cache — reused across Lambda invocations on the same warm instance.
let cachedKey: string | undefined;

/**
 * Return the Anthropic API key.
 *
 * Resolution order:
 *   1. ANTHROPIC_API_KEY env var  — local development shortcut only
 *   2. AWS SSM Parameter Store    — production path (SecureString, decrypted at runtime)
 *
 * The frontend never receives or uses this key.
 */
export async function getAnthropicApiKey(): Promise<string> {
  // Local dev: allow env var override so SSM is not required for local testing.
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY;
  }

  if (cachedKey) return cachedKey;

  const paramPath =
    process.env.SSM_API_KEY_PATH ?? '/sentinelops/anthropic-api-key';

  const ssm = new SSMClient({ region: process.env.AWS_REGION ?? 'us-east-1' });
  const result = await ssm.send(
    new GetParameterCommand({ Name: paramPath, WithDecryption: true })
  );

  const value = result.Parameter?.Value;
  if (!value) {
    throw new Error(
      `Anthropic API key not found in SSM at path: ${paramPath}`
    );
  }

  cachedKey = value;
  return cachedKey;
}
