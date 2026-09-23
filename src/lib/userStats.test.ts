import { describe, expect, it } from 'vitest';
import { DEFAULT_USER_STATS, parseUserStats } from './userStats';

describe('parseUserStats', () => {
  it('returns defaults when nothing is saved', () => {
    expect(parseUserStats(null)).toEqual(DEFAULT_USER_STATS);
  });

  it('returns defaults for unparseable JSON', () => {
    expect(parseUserStats('{not json')).toEqual(DEFAULT_USER_STATS);
  });

  it('keeps read chapters and bookmarks, drops legacy gamification fields', () => {
    const legacy = JSON.stringify({
      xp: 420,
      level: 3,
      levelTitle: 'Bridge Builder',
      xpClaims: ['read:ch1'],
      quizzesCompleted: 2,
      correctAnswers: 14,
      aiQuestionsAsked: 5,
      plainModeEnabled: true,
      readChapters: ['ch1', 'ch2'],
      bookmarks: ['ch3'],
    });
    expect(parseUserStats(legacy)).toEqual({ readChapters: ['ch1', 'ch2'], bookmarks: ['ch3'] });
  });

  it('ignores non-array read chapters or bookmarks', () => {
    expect(parseUserStats(JSON.stringify({ readChapters: 'ch1', bookmarks: null }))).toEqual(DEFAULT_USER_STATS);
  });
});
