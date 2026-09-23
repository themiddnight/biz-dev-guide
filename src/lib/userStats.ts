import type { UserStats } from '../types';

export const USER_STATS_KEY = 'be_guide_stats';

export const DEFAULT_USER_STATS: UserStats = { readChapters: [], bookmarks: [] };

const stringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

/**
 * Reads saved stats. Only reading state survives: profiles saved while the guide
 * still had XP, levels and quiz tallies keep their read chapters and bookmarks,
 * and everything else is dropped.
 */
export function parseUserStats(saved: string | null): UserStats {
  if (!saved) return DEFAULT_USER_STATS;
  try {
    const parsed = JSON.parse(saved) as Record<string, unknown> | null;
    return { readChapters: stringList(parsed?.readChapters), bookmarks: stringList(parsed?.bookmarks) };
  } catch {
    return DEFAULT_USER_STATS;
  }
}
