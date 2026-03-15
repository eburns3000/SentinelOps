import { IncidentContext } from '../types';

/**
 * Build the structured prompt sent to Claude for incident triage.
 *
 * Design goals:
 *   - Give Claude concrete, structured evidence (not free-form prose)
 *   - Enforce JSON output via explicit schema and rules
 *   - Guide reasoning toward operationally useful conclusions
 *   - Keep token usage lean — no padding, no repetition
 */
export function buildTriagePrompt(ctx: IncidentContext): string {
  const metricsBlock = ctx.metrics
    .map((m) => `  ${m.label}: ${m.baseline} → ${m.current} (trend: ${m.trend}, severity: ${m.severity})`)
    .join('\n');

  const logsBlock = ctx.logs
    .map((l) => `  [${l.ts}] ${l.level}  ${l.message}`)
    .join('\n');

  const deployBlock = [
    `  Version:       ${ctx.deployment.version} (commit ${ctx.deployment.commit})`,
    `  Change type:   ${ctx.deployment.changeType}`,
    `  Deployed at:   ${ctx.deployment.deployedAt}`,
    `  Owning team:   ${ctx.deployment.team}`,
    `  Time before incident onset: ${ctx.deployment.minutesBefore} minutes`,
    ctx.deployment.relatedService
      ? `  Related dependency: ${ctx.deployment.relatedService}`
      : null,
  ]
    .filter(Boolean)
    .join('\n');

  return `You are a senior site reliability engineer performing AI-assisted incident triage.

Analyze the following incident context and return a structured root-cause analysis.

---

## Incident
Service:      ${ctx.service}
Severity:     ${ctx.severity}
Environment:  ${ctx.environment}
Region:       ${ctx.region}
Detected:     ${ctx.detectedAt}
Summary:      ${ctx.summary}

## Metrics at Incident Onset
${metricsBlock}

## Recent Log Entries
${logsBlock}

## Deployment Context
${deployBlock}

---

Return ONLY a valid JSON object matching this exact schema:

{
  "probableCause": "<one concise sentence naming the root cause>",
  "confidence": <integer 0–100 reflecting evidence strength>,
  "impactedComponent": "<specific service, database, or resource at fault>",
  "reasoning": "<2–4 sentences synthesizing the evidence — reference specific metrics and log messages>",
  "actions": [
    "<specific, immediately executable action>",
    "... 4–6 actions in priority order"
  ]
}

Reasoning guidelines:
- High confidence (>75) requires multiple corroborating signals across metrics AND logs
- If CPU is normal but latency is elevated, rule out compute saturation as the primary cause
- A deployment within 30 minutes of onset is a strong causal signal — reference it explicitly
- Log error messages are stronger evidence than metrics alone
- Actions must be specific enough for an on-call engineer to execute without further context

Return ONLY the JSON object. No markdown fences, no explanation, no preamble.`;
}
