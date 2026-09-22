import { describe, it, expect } from 'vitest';
import { parseRole, parseLevelMode, parseChapterLevels, planRoleChoice, planChapterLevelChoice } from './rolePrefs';
import type { LevelInputs } from '../data/rolePerspective';

const IDS = ['s1', 's2', 's6'];

describe('parseRole', () => {
  it('round-trips valid values', () => {
    expect(parseRole('biz')).toBe('biz');
    expect(parseRole('eng')).toBe('eng');
  });
  it('defaults to null on garbage', () => {
    expect(parseRole(null)).toBeNull();
    expect(parseRole('')).toBeNull();
    expect(parseRole('pm')).toBeNull();
    expect(parseRole('BIZ')).toBeNull();
  });
});

describe('parseLevelMode', () => {
  it('round-trips valid values', () => {
    expect(parseLevelMode('auto')).toBe('auto');
    expect(parseLevelMode('beginner')).toBe('beginner');
    expect(parseLevelMode('experienced')).toBe('experienced');
  });
  it('defaults to auto on garbage', () => {
    expect(parseLevelMode(null)).toBe('auto');
    expect(parseLevelMode('expert')).toBe('auto');
  });
});

describe('parseChapterLevels', () => {
  it('round-trips valid values', () => {
    const value = { s1: 'experienced', s6: 'beginner' };
    expect(parseChapterLevels(JSON.stringify(value), IDS)).toEqual(value);
  });
  it('defaults to {} on null, non-JSON and non-objects', () => {
    expect(parseChapterLevels(null, IDS)).toEqual({});
    expect(parseChapterLevels('{nope', IDS)).toEqual({});
    expect(parseChapterLevels('null', IDS)).toEqual({});
    expect(parseChapterLevels('[1,2]', IDS)).toEqual({});
    expect(parseChapterLevels('"s1"', IDS)).toEqual({});
  });
  it('drops unknown ids and bad levels', () => {
    const raw = JSON.stringify({ s1: 'experienced', s99: 'beginner', s2: 'expert', s6: 3 });
    expect(parseChapterLevels(raw, IDS)).toEqual({ s1: 'experienced' });
  });
});

describe('planRoleChoice', () => {
  it('re-choosing the current role keeps per-chapter overrides', () => {
    expect(planRoleChoice('eng', 'eng', true)).toEqual({ changeRole: false, dismissFirstVisit: false });
    expect(planRoleChoice('biz', 'biz', false).changeRole).toBe(false);
  });
  it('a different role changes (and clears overrides)', () => {
    expect(planRoleChoice('eng', 'biz', true).changeRole).toBe(true);
    expect(planRoleChoice(null, 'eng', false)).toEqual({ changeRole: true, dismissFirstVisit: false });
    expect(planRoleChoice('eng', null, true).changeRole).toBe(true);
  });
  it('"no role" on first visit still dismisses the card even though the role is unchanged', () => {
    expect(planRoleChoice(null, null, false)).toEqual({ changeRole: false, dismissFirstVisit: true });
    expect(planRoleChoice(null, null, true)).toEqual({ changeRole: false, dismissFirstVisit: false });
  });
});

describe('planChapterLevelChoice', () => {
  const eng = { id: 's1', home: 'eng' as const }; // role default for eng reader: experienced
  const base: LevelInputs = { role: 'eng', baseLevel: 'beginner', levelMode: 'auto', chapterLevels: {} };

  it('pressing the active role-default level is a no-op (no redundant override)', () => {
    expect(planChapterLevelChoice(base, eng, 'experienced')).toEqual({ kind: 'noop' });
  });
  it('pressing the other level writes an override', () => {
    expect(planChapterLevelChoice(base, eng, 'beginner')).toEqual({ kind: 'set', level: 'beginner' });
  });
  it('pressing the already-active override level is a no-op', () => {
    const i = { ...base, chapterLevels: { s1: 'beginner' as const } };
    expect(planChapterLevelChoice(i, eng, 'beginner')).toEqual({ kind: 'noop' });
  });
  it('choosing the role default while overridden removes the override', () => {
    const i = { ...base, chapterLevels: { s1: 'beginner' as const } };
    expect(planChapterLevelChoice(i, eng, 'experienced')).toEqual({ kind: 'clear' });
  });
  it('under a global level mode, the global level is the fallback', () => {
    const g: LevelInputs = { ...base, levelMode: 'beginner' };
    expect(planChapterLevelChoice(g, eng, 'beginner')).toEqual({ kind: 'noop' });
    expect(planChapterLevelChoice(g, eng, 'experienced')).toEqual({ kind: 'set', level: 'experienced' });
    const o = { ...g, chapterLevels: { s1: 'experienced' as const } };
    expect(planChapterLevelChoice(o, eng, 'beginner')).toEqual({ kind: 'clear' });
  });
});
