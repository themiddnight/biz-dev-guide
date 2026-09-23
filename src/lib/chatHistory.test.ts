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

  it('keeps only the last 4 messages, in order', () => {
    const messages = [1, 2, 3].flatMap((n) => [msg(`q${n}`, 'user', `q${n}`), msg(`a${n}`, 'assistant', `a${n}`, 'groq')]);
    expect(buildChatHistory(messages).map((m) => m.content)).toEqual(['q2', 'a2', 'q3', 'a3']);
  });

  it('truncates long answers to their head, but never the user text', () => {
    const long = 'ก'.repeat(3000);
    const [q, a] = buildChatHistory([msg('1', 'user', long), msg('2', 'assistant', long, 'groq')]);
    expect(q.content).toBe(long);
    expect(a.content).toBe(`${'ก'.repeat(1200)}…`);
  });
});
