import { LEVEL_TIERS } from '../data/badgesData';
import type { UserStats } from '../types';

// Every XP award is keyed. A key pays out once per profile, so repeating the
// action (toggling a mode, unmarking and re-marking a chapter, remounting a
// card, retaking the quiz) cannot farm XP.
export const xpKey = {
  mode: (level: string) => `mode:${level}`,
  read: (chapterId: string) => `read:${chapterId}`,
  dilemma: (chapterId: string) => `dilemma:${chapterId}`,
  quiz: (questionId: number) => `quiz:${questionId}`,
  ai: (n: number) => `ai:${n}`,
  badge: (badgeId: string) => `badge:${badgeId}`,
};

// Only the first few AI questions pay XP; the rest are free to ask.
export const AI_XP_QUESTION_CAP = 5;

export interface XpClaim {
  key: string;
  amount: number;
}

export const levelForXp = (xp: number) =>
  LEVEL_TIERS.slice().reverse().find((t) => xp >= t.minXp) || LEVEL_TIERS[0];

export const unclaimed = (stats: UserStats, claims: XpClaim[]): XpClaim[] => {
  const seen = new Set(stats.xpClaims);
  return claims.filter((c) => {
    if (seen.has(c.key)) return false;
    seen.add(c.key);
    return true;
  });
};

// Idempotent: safe inside a state updater that React may run twice.
export const applyXpClaims = (stats: UserStats, claims: XpClaim[]): UserStats => {
  const fresh = unclaimed(stats, claims);
  if (fresh.length === 0) return stats;
  const xp = stats.xp + fresh.reduce((sum, c) => sum + c.amount, 0);
  const tier = levelForXp(xp);
  return {
    ...stats,
    xp,
    level: tier.level,
    levelTitle: tier.title,
    xpClaims: [...stats.xpClaims, ...fresh.map((c) => c.key)],
  };
};

// Profiles saved before the ledger existed already earned XP for the chapters
// they marked read and the mode they were on; record those so they don't pay again.
export const seedLegacyClaims = (stats: UserStats, savedLevel: string | null): string[] => {
  const keys = stats.readChapters.map(xpKey.read);
  if (savedLevel) keys.push(xpKey.mode(savedLevel));
  return keys;
};

// quiz_master (D13): judged on the round actually played, not the whole bank.
// A round under 6 questions never qualifies, so a trivially small round can't count.
export const QUIZ_MASTER_MIN_ROUND = 6;
export const qualifiesQuizMaster = (score: number, roundSize: number): boolean =>
  roundSize >= QUIZ_MASTER_MIN_ROUND && score >= roundSize * 0.8;

// Quiz XP is paid per question the moment it is answered correctly, so leaving the
// round mid-way (e.g. "read the related chapter") never loses what was earned.
// The key makes it idempotent: a retake pays only for newly-correct questions.
export const quizAnswerClaims = (question: { id: number; xp: number }, correct: boolean): XpClaim[] =>
  correct ? [{ key: xpKey.quiz(question.id), amount: question.xp }] : [];
