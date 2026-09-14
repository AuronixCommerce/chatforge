'use server';

import { z } from 'zod';
import { generateGroqResponse } from '@/lib/ai/groq';

const schema = z.object({ prompt: z.string().min(1).max(10000), userName: z.string().min(1).max(200) });
export type GenerateDirectEmailInput = z.infer<typeof schema>;

export async function generateDirectEmail(input: GenerateDirectEmailInput): Promise<string> {
  const parsed = schema.parse(input);
  const result = await generateGroqResponse({
    maxTokens: 4000,
    temperature: 0.4,
    messages: [
      { role: 'system', content: 'You are an expert SaaS email copywriter. Return only a complete responsive HTML email with inline CSS. Do not use markdown fences.' },
      { role: 'user', content: `Address the email to ${parsed.userName}. Prompt: ${parsed.prompt}` },
    ],
  });
  return result.reply;
}
