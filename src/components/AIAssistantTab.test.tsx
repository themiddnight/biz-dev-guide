import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AIAssistantTab, AnswerMarkdown, QuickPromptChips, answerSourceLabel, fallbackNotice } from './AIAssistantTab';

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
    expect(answerSourceLabel('gemini', 'gemini-3.8-flash')).toBe('Gemini · gemini-3.8-flash');
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

describe('mobile chat layout (F-05)', () => {
  const html = renderToStaticMarkup(<AIAssistantTab />);
  const classesOf = (marker: string) =>
    (html.match(new RegExp(`<div ${marker}[^>]*class="([^"]*)"`))?.[1] ?? '').split(' ');

  it('the thread is a scroll box from sm only; below sm the page scrolls', () => {
    const thread = classesOf('data-chat-thread="true"');
    expect(thread).toEqual(expect.arrayContaining(['sm:min-h-[420px]', 'sm:max-h-[600px]', 'sm:overflow-y-auto']));
    const sizing = thread.filter((c) => /(^|:)(min-h|max-h|overflow-y)-/.test(c));
    expect(sizing.every((c) => c.startsWith('sm:'))).toBe(true);
  });

  it('the input block sticks to the bottom below sm', () => {
    const input = classesOf('data-chat-input="true"');
    expect(input).toEqual(expect.arrayContaining(['max-sm:sticky', 'max-sm:bottom-0', 'max-sm:z-20', 'max-sm:bg-base-200']));
    expect(input).toContain('max-sm:pb-[max(0.5rem,env(safe-area-inset-bottom))]');
  });

  it('the free-tier note sits under the input from sm and under the thread below sm, outside the sticky block', () => {
    const note = 'AI ตัวนี้ใช้ Groq และ Gemini แบบฟรี';
    expect(html.split(note)).toHaveLength(3);
    expect(html).toMatch(/<p data-quota-note="mobile" class="sm:hidden[^"]*">AI ตัวนี้ใช้/);
    expect(html).toMatch(/<p data-quota-note="desktop" class="max-sm:hidden[^"]*">AI ตัวนี้ใช้/);
    const mobileAt = html.indexOf('data-quota-note="mobile"');
    expect(mobileAt).toBeGreaterThan(html.indexOf('data-chat-thread'));
    expect(mobileAt).toBeLessThan(html.indexOf('data-chat-input'));
  });
});

describe('AnswerMarkdown (F-02)', () => {
  // The s09 answer from run 2026-09-25: a <br> list and an unmatched ** in table cells.
  const S09 = [
    '| กลยุทธ์ | วิธีทำ |',
    '|---|---|',
    '| **“ขยายความเร็ว”** – ทำแคมเปญเร็วขึ้น** | **ขั้นตอน:**1️⃣ วางแผน<br>2️⃣ ทำ<br>3️⃣ วัดผล |',
  ].join('\n');

  it('renders cell line breaks as <br> with no raw <br> or ** left', () => {
    const html = renderToStaticMarkup(<AnswerMarkdown content={S09} />);
    expect(html).toContain('<table');
    expect(html).not.toContain('&lt;br');
    expect(html).not.toContain('**');
    expect(html.match(/<br\/>/g)).toHaveLength(2);
    expect(html).toMatch(/<strong[^>]*>ขั้นตอน:<\/strong>/);
  });
});

describe('QuickPromptChips (F-04)', () => {
  const AC_PROMPT = 'ช่วยเขียน Acceptance Criteria ให้ระบบชำระเงิน';
  const chips = (html: string) => html.split('</button>').slice(0, -1);

  it('disables every chip while an answer loads and spins only the tapped one', () => {
    const html = renderToStaticMarkup(<QuickPromptChips loading activePrompt={AC_PROMPT} onPick={() => {}} />);
    const all = chips(html);
    expect(all).toHaveLength(5);
    expect(all.every((c) => /<button[^>]*disabled=""/.test(c))).toBe(true);
    expect(all.map((c) => c.includes('animate-spin'))).toEqual([false, true, false, false, false]);
    expect(all[1]).toContain(AC_PROMPT);
    expect(html).toContain('disabled:opacity-60');
    expect(html).toContain('disabled:cursor-not-allowed');
  });

  it('is enabled and spinner-free when idle', () => {
    const html = renderToStaticMarkup(<QuickPromptChips loading={false} activePrompt={null} onPick={() => {}} />);
    expect(html).not.toContain('disabled=""');
    expect(html).not.toContain('animate-spin');
  });
});

describe('chat messages are scroll targets (F-04)', () => {
  it('each message carries its id and clears the sticky header when scrolled to', () => {
    const html = renderToStaticMarkup(<AIAssistantTab />);
    expect(html).toMatch(/<div data-msg-id="welcome" class="[^"]*scroll-mt-\[calc\(var\(--header-h\)\+8px\)\]/);
  });
});
