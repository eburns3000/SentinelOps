import Anthropic from '@anthropic-ai/sdk';
import { getAnthropicApiKey } from './ssm';
import { AITriage, IncidentContext } from '../types';
import { buildTriagePrompt } from '../prompts/triage';

// Module-level client cache — reused across warm Lambda invocations.
let anthropic: Anthropic | undefined;

async function getClient(): Promise<Anthropic> {
  if (anthropic) return anthropic;
  const apiKey = await getAnthropicApiKey();
  anthropic = new Anthropic({ apiKey });
  return anthropic;
}

/**
 * Send an enriched incident context to Claude and return a structured
 * AI triage result matching the AITriage interface.
 *
 * The frontend never calls this function — it executes only inside Lambda.
 */
export async function runTriageAnalysis(ctx: IncidentContext): Promise<AITriage> {
  const client = await getClient();
  const prompt = buildTriagePrompt(ctx);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  // Extract the text content from the response
  const content = message.content.find((b) => b.type === 'text');
  if (!content || content.type !== 'text') {
    throw new Error('Claude returned an unexpected response format');
  }

  // Strip any markdown code fences Claude might add defensively
  const raw = content.text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');

  let parsed: Omit<AITriage, 'analysisId' | 'generatedAt'>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${raw.slice(0, 200)}`);
  }

  // Validate required fields are present
  if (
    typeof parsed.probableCause !== 'string' ||
    typeof parsed.confidence !== 'number' ||
    typeof parsed.impactedComponent !== 'string' ||
    typeof parsed.reasoning !== 'string' ||
    !Array.isArray(parsed.actions)
  ) {
    throw new Error('Claude response missing required triage fields');
  }

  return {
    ...parsed,
    analysisId: `ai-triage-${message.id.slice(-8)}`,
    generatedAt: new Date().toISOString(),
  };
}
