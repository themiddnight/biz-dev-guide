import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './ask-ai';

const post = (body: string) =>
  POST(new Request('http://localhost/api/ask-ai', { method: 'POST', body }));

describe('POST /api/ask-ai (Vercel function)', () => {
  // No provider keys: the handler must answer from the built-in knowledge base without network.
  beforeEach(() => {
    vi.stubEnv('GROQ_API_KEY', '');
    vi.stubEnv('GEMINI_API_KEY', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('answers from the fallback knowledge base when no provider key is set', async () => {
    const res = await post(JSON.stringify({ question: 'PM กับ PjM ต่างกันยังไง' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.source).toBe('fallback');
    expect(data.answer).toContain('Product Manager');
  });

  it('rejects a missing question with 400 JSON', async () => {
    const res = await post(JSON.stringify({ role: 'business' }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: 'พิมพ์คำถามก่อน' });
  });

  it('treats a non-JSON body as a missing question', async () => {
    const res = await post('not json');
    expect(res.status).toBe(400);
  });
});
