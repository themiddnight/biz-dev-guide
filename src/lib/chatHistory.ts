import type { ChatMessage } from '../types';

export interface ChatHistoryItem {
  role: ChatMessage['role'];
  content: string;
}

// Shared with server/ask-ai.ts, which applies the same bound to what clients send.
export const HISTORY_TURNS = 4;
// A full Thai answer is ~1,400 tokens and Groq's free tier allows 8,000 tokens a minute per model,
// so a follow-up carries only the head of each earlier answer.
const ANSWER_MAX = 1200;

/** The last few real turns before a new question: no welcome message, no error replies. */
export function buildChatHistory(messages: ChatMessage[]): ChatHistoryItem[] {
  return messages
    .filter((m) => m.id !== 'welcome' && (m.role === 'user' || m.source))
    .slice(-HISTORY_TURNS)
    .map(({ role, content }) => ({
      role,
      content: role === 'assistant' && content.length > ANSWER_MAX ? `${content.slice(0, ANSWER_MAX)}…` : content,
    }));
}
