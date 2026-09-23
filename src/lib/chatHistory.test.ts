import { describe, it, expect } from 'vitest';
import type { ChatMessage } from '../types';
import { buildChatHistory } from './chatHistory';

const msg = (id: string, role: ChatMessage['role'], content: string, source?: ChatMessage['source']): ChatMessage =>
  ({ id, role, content, timestamp: '', source });

describe('buildChatHistory', () => {
  it('skips the welcome and error messages', () => {
    const history = buildChatHistory([
      msg('welcome', 'assistant', 'สวัสดี'),
      msg('1', 'user', 'q1'),
      msg('2', 'assistant', 'ขออภัย รับคำตอบไม่สำเร็จ'),
      msg('3', 'user', 'q2'),
      msg('4', 'assistant', 'a2', 'fallback'),
    ]);
    expect(history).toEqual([
      { role: 'user', content: 'q1' },
      { role: 'user', content: 'q2' },
      { role: 'assistant', content: 'a2' },
    ]);
  });

  it('keeps the last 5 questions but only the latest answer, in order', () => {
    const messages = [1, 2, 3, 4, 5, 6, 7].flatMap((n) => [
      msg(`q${n}`, 'user', `q${n}`),
      msg(`a${n}`, 'assistant', `a${n}`, 'groq'),
    ]);
    expect(buildChatHistory(messages).map((m) => m.content)).toEqual(['q3', 'q4', 'q5', 'q6', 'q7', 'a7']);
  });

  it('keeps the latest answer when the last question got no reply', () => {
    const history = buildChatHistory([
      msg('1', 'user', 'q1'),
      msg('2', 'assistant', 'a1', 'groq'),
      msg('3', 'user', 'q2'),
      msg('4', 'assistant', 'ขออภัย รับคำตอบไม่สำเร็จ'),
    ]);
    expect(history.map((m) => m.content)).toEqual(['q1', 'a1', 'q2']);
  });

  it('truncates long answers to their head, but never the user text', () => {
    const long = 'ก'.repeat(3000);
    const [q, a] = buildChatHistory([msg('1', 'user', long), msg('2', 'assistant', long, 'groq')]);
    expect(q.content).toBe(long);
    expect(a.content).toBe(`${'ก'.repeat(1200)}…`);
  });
});
