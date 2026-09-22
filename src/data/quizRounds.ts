import type { QuizQuestion } from '../types';
import type { Role } from './rolePerspective';

export type QuizRound = 'basics' | Role | 'all';

export const QUIZ_ROUNDS: readonly QuizRound[] = ['basics', 'eng', 'biz', 'all'];

export const QUIZ_ROUND_META: Record<QuizRound, { label: string }> = {
  basics: { label: 'พื้นฐาน' },
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
