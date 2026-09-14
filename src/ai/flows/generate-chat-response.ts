'use server';

import { z } from 'zod';
import { ChatMessage, generateGroqResponse, streamGroqResponse } from '@/lib/ai/groq';

const inputSchema = z.object({
  message: z.string().trim().min(1).max(8000),
  instructions: z.string().max(20000).default('You are a helpful assistant.'),
  qa: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  history: z.array(z.object({ role: z.enum(['user', 'model', 'assistant']), content: z.array(z.object({ text: z.string() })).optional(), text: z.string().optional() })).default([]),
  model: z.string().optional(), temperature: z.number().min(0).max(2).optional(), maxTokens: z.number().int().min(1).max(8000).optional(),
});

export type GenerateChatResponseInput = z.infer<typeof inputSchema>;
export type GenerateChatResponseOutput = { reply: string; usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } };

function toMessages(input: GenerateChatResponseInput): ChatMessage[] {
  const qa = input.qa.length ? `\nKnown answers:\n${input.qa.map(item => `Q: ${item.question}\nA: ${item.answer}`).join('\n')}` : '';
  const history = input.history.map(item => ({ role: (item.role === 'model' ? 'assistant' : item.role) as 'user' | 'assistant', content: item.content?.[0]?.text || item.text || '' })).filter(item => item.content);
  return [{ role: 'system', content: `${input.instructions}${qa}` }, ...history, { role: 'user', content: input.message }];
}

export async function generateChatResponse(input: GenerateChatResponseInput): Promise<GenerateChatResponseOutput> {
  const parsed = inputSchema.parse(input);
  return generateGroqResponse({ messages: toMessages(parsed), model: parsed.model, temperature: parsed.temperature, maxTokens: parsed.maxTokens });
}

export async function generateChatResponseStream(input: GenerateChatResponseInput) {
  const parsed = inputSchema.parse(input);
  return { stream: await streamGroqResponse({ messages: toMessages(parsed), model: parsed.model, temperature: parsed.temperature, maxTokens: parsed.maxTokens }), response: Promise.resolve() };
}

export async function generateNewsletterEmail(input: { prompt: string }): Promise<string> {
  const result = await generateGroqResponse({ maxTokens: 4000, temperature: 0.4, messages: [
    { role: 'system', content: 'Generate only a complete responsive HTML email with inline CSS. Do not include markdown fences or commentary.' },
    { role: 'user', content: input.prompt },
  ] });
  return result.reply;
}
