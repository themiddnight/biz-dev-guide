import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import {
  ROLES, otherRole, resolveChapterLevel, getActiveTrackKey,
  type ChapterHome, type LevelInputs,
} from './rolePerspective';

const EXPECTED_HOME: Record<string, ChapterHome> = {
  s1: 'shared', s2: 'biz', s3: 'biz', s4: 'shared', s5: 'eng',
  s6: 'eng', s7: 'eng', s8: 'eng', s9: 'eng', s10: 'eng',
  s11: 'shared', s12: 'shared', s13: 'eng', s14: 'shared', s15: 'eng',
  s16: 'biz', s17: 'biz', s18: 'biz', s19: 'biz',
};

const ch = (id: string) => {
  const c = CHAPTERS.find(x => x.id === id);
  if (!c) throw new Error(`missing ${id}`);
  return c;
};

const inputs = (over: Partial<LevelInputs> = {}): LevelInputs => ({
  role: null,
  baseLevel: 'beginner',
  levelMode: 'auto',
  chapterLevels: {},
  ...over,
});

describe('chapter home', () => {
  it('every chapter has a valid home', () => {
    for (const c of CHAPTERS) expect(['biz', 'eng', 'shared']).toContain(c.home);
  });
  it('matches the spec table exactly', () => {
    expect(Object.fromEntries(CHAPTERS.map(c => [c.id, c.home]))).toEqual(EXPECTED_HOME);
  });
});

describe('resolveChapterLevel', () => {
  it('role null ignores chapterLevels and levelMode', () => {
    const i = inputs({ baseLevel: 'experienced', levelMode: 'beginner', chapterLevels: { s6: 'beginner' } });
    expect(resolveChapterLevel(i, ch('s6'))).toEqual({ level: 'experienced', source: 'base' });
    expect(resolveChapterLevel(inputs(), ch('s2'))).toEqual({ level: 'beginner', source: 'base' });
  });
  it('role defaults from chapter home', () => {
    expect(resolveChapterLevel(inputs({ role: 'eng' }), ch('s6'))).toEqual({ level: 'experienced', source: 'role' });
    expect(resolveChapterLevel(inputs({ role: 'eng' }), ch('s2'))).toEqual({ level: 'beginner', source: 'role' });
    expect(resolveChapterLevel(inputs({ role: 'biz' }), ch('s6'))).toEqual({ level: 'beginner', source: 'role' });
    expect(resolveChapterLevel(inputs({ role: 'biz' }), ch('s2'))).toEqual({ level: 'experienced', source: 'role' });
    for (const role of ROLES) {
      expect(resolveChapterLevel(inputs({ role, baseLevel: 'experienced' }), ch('s11'))).toEqual({ level: 'beginner', source: 'role' });
    }
  });
  it('a chapter override beats levelMode', () => {
    const i = inputs({ role: 'eng', levelMode: 'beginner', chapterLevels: { s2: 'experienced' } });
    expect(resolveChapterLevel(i, ch('s2'))).toEqual({ level: 'experienced', source: 'chapter' });
    expect(resolveChapterLevel(i, ch('s3'))).toEqual({ level: 'beginner', source: 'global' });
  });
  it('levelMode beats home', () => {
    expect(resolveChapterLevel(inputs({ role: 'eng', levelMode: 'beginner' }), ch('s6'))).toEqual({ level: 'beginner', source: 'global' });
    expect(resolveChapterLevel(inputs({ role: 'biz', levelMode: 'experienced' }), ch('s6'))).toEqual({ level: 'experienced', source: 'global' });
  });
});

describe('otherRole', () => {
  it('is an involution', () => {
    for (const r of ROLES) {
      expect(otherRole(r)).not.toBe(r);
      expect(otherRole(otherRole(r))).toBe(r);
    }
  });
});

describe('getActiveTrackKey', () => {
  it('role wins, else base level', () => {
    expect(getActiveTrackKey('biz', 'experienced')).toBe('biz');
    expect(getActiveTrackKey('eng', 'beginner')).toBe('eng');
    expect(getActiveTrackKey(null, 'experienced')).toBe('experienced');
    expect(getActiveTrackKey(null, 'beginner')).toBe('beginner');
  });
});
