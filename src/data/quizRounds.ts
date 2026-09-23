import type { QuizQuestion } from '../types';
import type { Role } from './rolePerspective';

export type QuizRound = 'basics' | Role | 'all';

export const QUIZ_ROUNDS: readonly QuizRound[] = ['basics', 'eng', 'biz', 'all'];

export const QUIZ_ROUND_META: Record<QuizRound, { label: string }> = {
  basics: { label: 'พื้นฐาน (ทุกสาย)' },
  biz: { label: 'สาย Business' },
  eng: { label: 'สาย Engineering' },
  all: { label: 'ทั้งหมด' },
};

/** basics → forRole 'both'; biz/eng → that role; all → role-specific first, then basics. */
export function getQuizRound(qs: QuizQuestion[], round: QuizRound): QuizQuestion[] {
  if (round === 'basics') return qs.filter((q) => q.forRole === 'both');
  if (round === 'all') return [...qs.filter((q) => q.forRole !== 'both'), ...qs.filter((q) => q.forRole === 'both')];
  return qs.filter((q) => q.forRole === round);
}

export const defaultQuizRound = (role: Role | null): QuizRound => role ?? 'basics';

export function parseQuizRound(raw: string | null): QuizRound | null {
  return QUIZ_ROUNDS.find((r) => r === raw) ?? null;
}

/** An explicit past choice wins; otherwise the reader's own round; otherwise basics (D12). */
export function initialQuizRound(stored: string | null, role: Role | null): QuizRound {
  return parseQuizRound(stored) ?? defaultQuizRound(role);
}
