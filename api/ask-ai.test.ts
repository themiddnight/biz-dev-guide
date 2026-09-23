import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './ask-ai';

const post = (body: string) =>
  POST(new Request('http://localhost/api/ask-ai', { method: 'POST', body }));

describe('POST /api/ask-ai (Vercel function)', () => {
  // No provider keys: the handler must answer from the built-in knowledge base without network.
  beforeEach(() => {
    vi.stubEnv('GROQ_API_KEY', '');
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

describe('POST /api/ask-ai with Groq', () => {
  const groqReply = (content: string, finish_reason = 'stop') =>
    Response.json({ choices: [{ message: { content }, finish_reason }] });
  const triedModels = (fetchMock: ReturnType<typeof vi.fn>) =>
    fetchMock.mock.calls.map(([, init]) => JSON.parse(init.body).model);

  beforeEach(() => {
    vi.stubEnv('GROQ_API_KEY', 'gsk_test');
    vi.stubEnv('GROQ_MODEL', '');
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('tries only the Thai-capable models, in order, until one answers', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('down', { status: 503 }))
      .mockResolvedValueOnce(groqReply('คำตอบ'));
    vi.stubGlobal('fetch', fetchMock);

    const data = await (await post(JSON.stringify({ question: 'q' }))).json();
    expect(data).toMatchObject({ answer: 'คำตอบ', source: 'groq', model: 'openai/gpt-oss-120b' });
    expect(triedModels(fetchMock)).toEqual(['qwen/qwen3.8-27b', 'openai/gpt-oss-120b']);
  });

  it('puts GROQ_MODEL first', async () => {
    vi.stubEnv('GROQ_MODEL', 'openai/gpt-oss-20b');
    const fetchMock = vi.fn().mockResolvedValue(groqReply('คำตอบ'));
    vi.stubGlobal('fetch', fetchMock);

    await post(JSON.stringify({ question: 'q' }));
    expect(triedModels(fetchMock)).toEqual(['openai/gpt-oss-20b']);
  });

  it('marks an answer cut off by the token cap', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(groqReply('1. ข้อแรก\n2. **', 'length')));

    const data = await (await post(JSON.stringify({ question: 'q' }))).json();
    expect(data.answer).toMatch(/ถูกตัดตรงนี้/);
  });
});
