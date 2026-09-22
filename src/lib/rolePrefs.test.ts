import { describe, it, expect } from 'vitest';
import {
  parseRole, parseLevelMode, parseChapterLevels, planRoleChoice, planChapterLevelChoice,
  parseChapterLevelsByRole, loadChapterLevelsByRole, chapterLevelsFor, withChapterLevel,
  type ChapterLevelsByRole,
} from './rolePrefs';
import { resolveChapterLevel, type LevelInputs } from '../data/rolePerspective';
import { CHAPTERS } from '../data/chaptersData';

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
  it('a different role changes the role (overrides are kept per role)', () => {
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

describe('parseChapterLevelsByRole', () => {
  const IDS2 = ['s2', 's6', 's12'];
  it('round-trips both role sets', () => {
    const v = { biz: { s12: 'experienced' }, eng: { s2: 'experienced' } };
    expect(parseChapterLevelsByRole(JSON.stringify(v), IDS2)).toEqual(v);
  });
  it('drops unknown role keys, unknown ids and bad levels', () => {
    const raw = JSON.stringify({ pm: { s2: 'experienced' }, biz: { s99: 'beginner', s6: 'expert', s2: 'beginner' } });
    expect(parseChapterLevelsByRole(raw, IDS2)).toEqual({ biz: { s2: 'beginner' } });
  });
  it('garbage gives {} or drops that role', () => {
    expect(parseChapterLevelsByRole(null, IDS2)).toEqual({});
    expect(parseChapterLevelsByRole('{nope', IDS2)).toEqual({});
    expect(parseChapterLevelsByRole('[]', IDS2)).toEqual({});
    expect(parseChapterLevelsByRole('"x"', IDS2)).toEqual({});
    expect(parseChapterLevelsByRole(JSON.stringify({ biz: 'x' }), IDS2)).toEqual({});
    expect(parseChapterLevelsByRole(JSON.stringify({ biz: 'x', eng: { s6: 'experienced' } }), IDS2)).toEqual({ eng: { s6: 'experienced' } });
    expect(parseChapterLevelsByRole(JSON.stringify({ biz: {} }), IDS2)).toEqual({});
  });
});

describe('loadChapterLevelsByRole', () => {
  const IDS2 = ['s2', 's6', 's12'];
  const legacy = JSON.stringify({ s12: 'experienced' });
  it('new key wins over the legacy key; legacy is still migrated away', () => {
    const byRole = JSON.stringify({ biz: { s6: 'experienced' } });
    expect(loadChapterLevelsByRole(byRole, legacy, 'eng', IDS2)).toEqual({ byRole: { biz: { s6: 'experienced' } }, migrated: true });
  });
  it('legacy map moves to the stored role', () => {
    expect(loadChapterLevelsByRole(null, legacy, 'eng', IDS2)).toEqual({ byRole: { eng: { s12: 'experienced' } }, migrated: true });
  });
  it('legacy map with no role is dropped', () => {
    expect(loadChapterLevelsByRole(null, legacy, null, IDS2)).toEqual({ byRole: {}, migrated: true });
  });
  it('neither key gives {} and no migration', () => {
    expect(loadChapterLevelsByRole(null, null, 'biz', IDS2)).toEqual({ byRole: {}, migrated: false });
    const byRole = JSON.stringify({ biz: { s6: 'experienced' } });
    expect(loadChapterLevelsByRole(byRole, null, 'biz', IDS2)).toEqual({ byRole: { biz: { s6: 'experienced' } }, migrated: false });
  });
});

describe('chapterLevelsFor', () => {
  const both: ChapterLevelsByRole = { biz: { s6: 'experienced' }, eng: { s12: 'experienced' } };
  it('null role ignores both sets', () => {
    expect(chapterLevelsFor(both, null)).toEqual({});
  });
  it('returns the role set, or {} when missing', () => {
    expect(chapterLevelsFor(both, 'biz')).toEqual({ s6: 'experienced' });
    expect(chapterLevelsFor({ biz: { s6: 'experienced' } }, 'eng')).toEqual({});
  });
  it('the empty result is one shared object', () => {
    expect(chapterLevelsFor(both, null)).toBe(chapterLevelsFor({}, 'eng'));
  });
});

describe('withChapterLevel', () => {
  it('sets one role without touching the other, and does not mutate', () => {
    const input: ChapterLevelsByRole = { biz: { s6: 'experienced' } };
    const out = withChapterLevel(input, 'eng', 's12', 'experienced');
    expect(out).toEqual({ biz: { s6: 'experienced' }, eng: { s12: 'experienced' } });
    expect(input).toEqual({ biz: { s6: 'experienced' } });
  });
  it('null deletes; deleting the last entry removes the role key', () => {
    const input: ChapterLevelsByRole = { eng: { s12: 'experienced', s2: 'beginner' } };
    const one = withChapterLevel(input, 'eng', 's2', null);
    expect(one).toEqual({ eng: { s12: 'experienced' } });
    expect(withChapterLevel(one, 'eng', 's12', null)).toEqual({});
    expect(input).toEqual({ eng: { s12: 'experienced', s2: 'beginner' } });
  });
});

describe('per-role overrides round trip (R-4)', () => {
  it('an eng override on s12 does not apply to biz and comes back for eng', () => {
    const s12 = CHAPTERS.find(c => c.id === 's12')!;
    const byRole = withChapterLevel({}, 'eng', 's12', 'experienced');
    const inputs = (role: 'biz' | 'eng'): LevelInputs =>
      ({ role, baseLevel: 'beginner', levelMode: 'auto', chapterLevels: chapterLevelsFor(byRole, role) });
    expect(resolveChapterLevel(inputs('biz'), s12)).toEqual({ level: 'beginner', source: 'role' });
    expect(resolveChapterLevel(inputs('eng'), s12)).toEqual({ level: 'experienced', source: 'chapter' });
  });
});
