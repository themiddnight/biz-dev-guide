import type { QuizQuestion } from '../types';
import type { Role } from './rolePerspective';
import type { TrackKey } from './readingTracks';

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

/**
 * Spec F-07: questions on the chapters just read come first, in anchor order; then the rest in
 * reading-track order; then off-track questions in bank order. Stable; returns a new array.
 */
export function orderQuizRound(
  qs: QuizQuestion[],
  { trackIds, anchors }: { trackIds: readonly string[]; anchors: readonly string[] },
): QuizQuestion[] {
  const rank = (q: QuizQuestion): [number, number] => {
    const anchor = q.chapterId ? anchors.indexOf(q.chapterId) : -1;
    if (anchor >= 0) return [0, anchor];
    const onTrack = q.chapterId ? trackIds.indexOf(q.chapterId) : -1;
    return onTrack >= 0 ? [1, onTrack] : [2, 0];
  };
  return qs
    .map((q, i) => ({ q, i, r: rank(q) }))
    .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.i - b.i)
    .map(({ q }) => q);
}

/** The chapter open in the guide first, then read chapters newest first (they are stored in read order). */
export function quizAnchors(currentChapterId: string | null, readChapters: readonly string[]): string[] {
  const newestFirst = [...readChapters].reverse();
  return [...new Set(currentChapterId ? [currentChapterId, ...newestFirst] : newestFirst)];
}

/** Role rounds follow their own track; basics and all follow the reader's, else the beginner track. */
export function quizTrackKey(round: QuizRound, role: Role | null): TrackKey {
  return round === 'biz' || round === 'eng' ? round : role ?? 'beginner';
}

/**
 * Ordering cannot help when the round has no question on any chapter just read. Returns the first
 * anchor chapter the basics round covers, so the tab can point there; null when no hint applies.
 */
export function basicsHintChapter(round: QuizRound, qs: QuizQuestion[], anchors: readonly string[]): string | null {
  if (round === 'basics') return null;
  const covers = (list: QuizQuestion[], id: string) => list.some((q) => q.chapterId === id);
  const roundQs = getQuizRound(qs, round);
  if (anchors.some((id) => covers(roundQs, id))) return null;
  const basics = getQuizRound(qs, 'basics');
  return anchors.find((id) => covers(basics, id)) ?? null;
}
