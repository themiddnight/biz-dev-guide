import type { ChatMessage } from '../types';

export interface ChatHistoryItem {
  role: ChatMessage['role'];
  content: string;
}

// Earlier questions alone say what the chat is about; a follow-up ("what did point 2 mean?") nearly
// always refers to the latest answer, so that is the only answer resent.
const HISTORY_QUESTIONS = 5;
// A full Thai answer is ~1,400 tokens and Groq's free tier allows 8,000 tokens a minute per model,
// so a follow-up carries only the head of the latest answer.
const ANSWER_MAX = 1200;

/**
 * The last few questions plus the latest answer, in order. Shared with server/ask-ai.ts, which
 * applies the same bound to what clients send.
 */
export function compactHistory(items: ChatHistoryItem[]): ChatHistoryItem[] {
  const questions = items.filter((m) => m.role === 'user').slice(-HISTORY_QUESTIONS);
  const answer = items.filter((m) => m.role === 'assistant').at(-1);
  return items
    .filter((m) => m === answer || questions.includes(m))
    .map(({ role, content }) => ({
      role,
      content: role === 'assistant' && content.length > ANSWER_MAX ? `${content.slice(0, ANSWER_MAX)}…` : content,
    }));
}

/** History for a new question: no welcome message, no error replies. */
export function buildChatHistory(messages: ChatMessage[]): ChatHistoryItem[] {
  return compactHistory(
    messages
      .filter((m) => m.id !== 'welcome' && (m.role === 'user' || m.source))
      .map(({ role, content }) => ({ role, content })),
  );
}
