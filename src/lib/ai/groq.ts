import { z } from 'zod';

export const DEFAULT_GROQ_MODEL = process.env.GROQ_DEFAULT_MODEL || 'llama-3.3-70b-versatile';
export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type GroqChatOptions = { messages: ChatMessage[]; model?: string; temperature?: number; maxTokens?: number; signal?: AbortSignal };

const responseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().optional() }) })).min(1),
  usage: z.object({ prompt_tokens: z.number().optional(), completion_tokens: z.number().optional(), total_tokens: z.number().optional() }).optional(),
});

function getApiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_NOT_CONFIGURED');
  return key;
}

function normalizeError(status: number, body: string) {
  if (status === 401 || status === 403) return new Error('GROQ_CONFIGURATION_ERROR');
  if (status === 429) return new Error('GROQ_RATE_LIMITED');
  console.error('Groq request failed', { status, body: body.slice(0, 500) });
  return new Error('GROQ_UNAVAILABLE');
}

async function request(options: GroqChatOptions, stream: boolean) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST', headers: { Authorization: `Bearer ${getApiKey()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: options.model || DEFAULT_GROQ_MODEL, messages: options.messages, temperature: options.temperature ?? 0.7, max_tokens: options.maxTokens ?? 800, stream }),
    signal: options.signal, cache: 'no-store',
  });
  if (!response.ok) throw normalizeError(response.status, await response.text());
  return response;
}

export async function generateGroqResponse(options: GroqChatOptions) {
  const response = await request(options, false);
  const parsed = responseSchema.safeParse(await response.json());
  if (!parsed.success) throw new Error('GROQ_INVALID_RESPONSE');
  return { reply: parsed.data.choices[0].message.content || '', usage: parsed.data.usage };
}

export async function streamGroqResponse(options: GroqChatOptions) {
  const response = await request(options, true);
  if (!response.body) throw new Error('GROQ_INVALID_RESPONSE');
  return response.body;
}
