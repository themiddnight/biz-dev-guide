import { describe, it, expect } from 'vitest';
import { applyXpClaims, unclaimed, seedLegacyClaims, xpKey, qualifiesQuizMaster } from './xp';
import { LEVEL_TIERS } from '../data/badgesData';
import type { UserStats } from '../types';

const base = (over: Partial<UserStats> = {}): UserStats => ({
  xp: 0,
  level: 1,
  levelTitle: LEVEL_TIERS[0].title,
  quizzesCompleted: 0,
  correctAnswers: 0,
  aiQuestionsAsked: 0,
  readChapters: [],
  bookmarks: [],
  xpClaims: [],
  ...over,
});

describe('applyXpClaims', () => {
  it('awards a key once and ignores repeats', () => {
    const once = applyXpClaims(base(), [{ key: xpKey.mode('experienced'), amount: 15 }]);
    expect(once.xp).toBe(15);
    const twice = applyXpClaims(once, [{ key: xpKey.mode('experienced'), amount: 15 }]);
    expect(twice).toBe(once);
  });

  it('stays capped across repeated mode toggles', () => {
    let s = base();
    for (let i = 0; i < 10; i++) {
      s = applyXpClaims(s, [{ key: xpKey.mode(i % 2 ? 'beginner' : 'experienced'), amount: 15 }]);
    }
    expect(s.xp).toBe(30);
  });

  it('dedupes duplicate keys within one batch', () => {
    const s = applyXpClaims(base(), [
      { key: xpKey.quiz(1), amount: 25 },
      { key: xpKey.quiz(1), amount: 25 },
      { key: xpKey.quiz(2), amount: 25 },
    ]);
    expect(s.xp).toBe(50);
    expect(s.xpClaims).toEqual(['quiz:1', 'quiz:2']);
  });

  it('recomputes the level tier', () => {
    const top = LEVEL_TIERS[LEVEL_TIERS.length - 1];
    const s = applyXpClaims(base(), [{ key: 'x', amount: top.minXp }]);
    expect(s.level).toBe(top.level);
    expect(s.levelTitle).toBe(top.title);
  });
});

describe('unclaimed', () => {
  it('filters out keys already on the profile', () => {
    const s = base({ xpClaims: ['read:s1'] });
    expect(unclaimed(s, [{ key: 'read:s1', amount: 30 }, { key: 'read:s2', amount: 30 }])).toEqual([
      { key: 'read:s2', amount: 30 },
    ]);
  });
});

describe('seedLegacyClaims', () => {
  it('claims read chapters and the saved mode', () => {
    expect(seedLegacyClaims(base({ readChapters: ['s1', 's2'] }), 'beginner')).toEqual([
      'read:s1',
      'read:s2',
      'mode:beginner',
    ]);
  });
});

describe('qualifiesQuizMaster', () => {
  it('needs a round of at least 6 and at least 80%', () => {
    expect(qualifiesQuizMaster(5, 6)).toBe(true);
    expect(qualifiesQuizMaster(4, 6)).toBe(false);
    expect(qualifiesQuizMaster(7, 8)).toBe(true);
    expect(qualifiesQuizMaster(6, 8)).toBe(false);
    expect(qualifiesQuizMaster(16, 20)).toBe(true);
    expect(qualifiesQuizMaster(5, 5)).toBe(false);
  });
});
