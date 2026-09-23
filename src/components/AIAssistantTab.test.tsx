import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AIAssistantTab, answerSourceLabel, fallbackNotice } from './AIAssistantTab';

describe('AIAssistantTab hierarchy (spec §10.1, §10.3, §10.5)', () => {
  const html = renderToStaticMarkup(<AIAssistantTab />);
  const send = html.match(/<button[^>]*type="submit"[^>]*>/)?.[0] ?? '';

  it('send is the one primary solid and still submits the form', () => {
    expect(send).toContain('bg-primary text-primary-content border-primary');
    expect(send).toContain('absolute');
    expect(html.match(/bg-primary text-primary-content border-primary/g)).toHaveLength(1);
  });

  it('avatars are soft decorative badges; the send button is the only primary fill', () => {
    expect(html.match(/(?<![\w:/-])bg-primary(?![\w/-])/g)).toHaveLength(1);
    expect(html).toMatch(/<span class="[^"]*bg-base-300[^"]*w-7 h-7[^"]*" aria-hidden="true">/);
  });
});

describe('answerSourceLabel', () => {
  it('names the model that answered', () => {
    expect(answerSourceLabel('groq', 'qwen/qwen3.8-27b')).toBe('Groq · qwen/qwen3.8-27b');
  });
  it('falls back to the provider name for answers saved before the model was reported', () => {
    expect(answerSourceLabel('groq')).toBe('Groq AI');
    expect(answerSourceLabel('fallback')).toBe('คลังความรู้ผู้เชี่ยวชาญ');
    expect(answerSourceLabel()).toBe('Expert Assistant');
  });
});

describe('fallbackNotice', () => {
  it('says the free quota ran out when the server reports a rate limit', () => {
    expect(fallbackNotice('rate_limited')).toMatch(/โควตาฟรี/);
  });
  it('keeps the plain knowledge-base notice otherwise', () => {
    expect(fallbackNotice()).toMatch(/^โหมดคลังความรู้ผู้เชี่ยวชาญ/);
  });
});

describe('free-tier note', () => {
  it('is always shown under the input', () => {
    expect(renderToStaticMarkup(<AIAssistantTab />)).toContain('AI ตัวนี้ใช้ Groq แบบฟรี');
  });
});
