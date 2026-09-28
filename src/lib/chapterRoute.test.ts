import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../data/chaptersData';
import {
  formatChapterHash, initRouteSession, parseChapterHash, planRequest, popstateCanonicalHash,
  reduceRouteSession, resolveInitialChapter, resolvePopstatePendingRoute, resolveSectionParam,
} from './chapterRoute';

const parse = (hash: string) => parseChapterHash(hash, CHAPTERS);
const ch = (id: string) => {
  const c = CHAPTERS.find(x => x.id === id);
  if (!c) throw new Error(`missing ${id}`);
  return c;
};

describe('formatChapterHash', () => {
  it('formats and round-trips', () => {
    expect(formatChapterHash(5)).toBe('#/ch/5');
    expect(formatChapterHash(5, 'diagram')).toBe('#/ch/5/diagram');
    for (const num of [1, 15, 19]) {
      const id = `s${num}`;
      expect(parse(formatChapterHash(num))).toEqual({ chapterId: id });
      expect(parse(formatChapterHash(num, 'practice'))).toEqual({ chapterId: id, section: 'practice' });
    }
  });
});

describe('parseChapterHash', () => {
  it('chapter and section forms', () => {
    expect(parse('#/ch/5')).toEqual({ chapterId: 's5' });
    expect(parse('#/ch/5/diagram')).toEqual({ chapterId: 's5', section: 'diagram' });
    expect(parse('#/ch/5/')).toEqual({ chapterId: 's5' });
  });
  it('drops an unknown section but keeps the chapter', () => {
    expect(parse('#/ch/5/xyz')).toEqual({ chapterId: 's5' });
  });
  it('invalid -> null', () => {
    for (const h of ['#/ch/20', '#/ch/0', '#/ch/abc', '#/foo', '', '#']) expect(parse(h)).toBeNull();
  });
  it('legacy #sN', () => {
    expect(parse('#s11')).toEqual({ chapterId: 's11' });
  });
});

describe('route session', () => {
  it('starts with no hash on a bare load', () => {
    expect(initRouteSession('')).toEqual({ hashInUrl: false });
    expect(initRouteSession('#')).toEqual({ hashInUrl: false });
  });

  it('records a hash that existed at load', () => {
    expect(initRouteSession('#/ch/3')).toEqual({ hashInUrl: true });
    expect(initRouteSession('#/ch/99')).toEqual({ hashInUrl: true });
  });

  it('navigate puts a hash in the URL', () => {
    expect(reduceRouteSession(initRouteSession(''), { type: 'navigate' })).toEqual({ hashInUrl: true });
    expect(reduceRouteSession(initRouteSession('#/ch/4'), { type: 'navigate' })).toEqual({ hashInUrl: true });
  });

  it('pop follows the popped hash', () => {
    const routed = { hashInUrl: true };
    expect(reduceRouteSession(routed, { type: 'pop', hash: '' })).toEqual({ hashInUrl: false });
    expect(reduceRouteSession(routed, { type: 'pop', hash: '#' })).toEqual({ hashInUrl: false });
    expect(reduceRouteSession(initRouteSession(''), { type: 'pop', hash: '#/ch/2' })).toEqual({ hashInUrl: true });
  });
});

describe('resolveInitialChapter', () => {
  const resolve = (hash: string, stored: string | null) =>
    resolveInitialChapter(parse(hash), stored, CHAPTERS, 's1');

  it('a hash wins over the stored chapter', () => {
    expect(resolve('#/ch/4', 's12')).toEqual({ chapterId: 's4', source: 'hash' });
  });

  it('a legacy hash still wins', () => {
    expect(resolve('#s12', 's4')).toEqual({ chapterId: 's12', source: 'hash' });
  });

  it('with no hash the stored chapter is restored', () => {
    expect(resolve('', 's12')).toEqual({ chapterId: 's12', source: 'stored' });
    expect(resolve('#', 's2')).toEqual({ chapterId: 's2', source: 'stored' });
  });

  it('an unknown stored id falls through to the default', () => {
    expect(resolve('', 's99')).toEqual({ chapterId: 's1', source: 'default' });
    expect(resolve('', 'garbage')).toEqual({ chapterId: 's1', source: 'default' });
  });

  it('nothing stored and no hash gives the default', () => {
    expect(resolve('', null)).toEqual({ chapterId: 's1', source: 'default' });
  });

  it('an unparseable hash falls back to the stored chapter', () => {
    expect(resolve('#/ch/99', 's12')).toEqual({ chapterId: 's12', source: 'stored' });
  });
});

describe('resolveSectionParam', () => {
  it('a current key resolves to itself', () => {
    expect(resolveSectionParam('examples')).toEqual({ section: 'examples' });
    expect(resolveSectionParam('diagram')).toEqual({ section: 'diagram' });
  });
  it('an unknown word resolves to nothing', () => {
    expect(resolveSectionParam('bogus')).toEqual({});
  });
  it('Object.prototype member names are unknown words, not aliases', () => {
    for (const raw of ['constructor', 'toString', 'hasOwnProperty', 'valueOf']) {
      expect(resolveSectionParam(raw), raw).toEqual({});
    }
    expect(parse('#/ch/3/constructor')).toEqual({ chapterId: 's3' });
  });
});

describe('popstateCanonicalHash', () => {
  const pop = (hash: string) => {
    const route = parse(hash);
    if (!route) throw new Error(`unparseable ${hash}`);
    return popstateCanonicalHash(hash, route, ch(route.chapterId).num);
  };
  it('rewrites a non-canonical hash', () => {
    expect(pop('#/ch/3/bogus')).toBe('#/ch/3');
    expect(pop('#/ch/3/')).toBe('#/ch/3');
    expect(pop('#s3')).toBe('#/ch/3');
  });
  it('leaves a canonical hash alone', () => {
    expect(pop('#/ch/1/friction')).toBeNull();
    expect(pop('#/ch/3')).toBeNull();
  });
  it('never writes a hash onto the bare initial entry', () => {
    expect(popstateCanonicalHash('', { chapterId: 's1' }, 1)).toBeNull();
    expect(popstateCanonicalHash('#', { chapterId: 's1' }, 1)).toBeNull();
  });
});

describe('resolvePopstatePendingRoute (F-03, per-entry stored hash)', () => {
  it('a bare popstate with no stored hash falls back to the init chapter', () => {
    expect(resolvePopstatePendingRoute('', null, CHAPTERS, 's1')).toEqual({ chapterId: 's1' });
    expect(resolvePopstatePendingRoute('#', null, CHAPTERS, 's1')).toEqual({ chapterId: 's1' });
  });

  it('a bare popstate restores its own stored chapter and section', () => {
    expect(resolvePopstatePendingRoute('', '#/ch/5/examples', CHAPTERS, 's1'))
      .toEqual({ chapterId: 's5', section: 'examples' });
  });

  it('a real chapter-hash popstate ignores any stored hash', () => {
    expect(resolvePopstatePendingRoute('#/ch/3', '#/ch/5/examples', CHAPTERS, 's1'))
      .toEqual({ chapterId: 's3' });
  });

  it('a second tab-switch/navigate cycle cannot leak an older or newer entry\'s hash onto this one (re-review)', () => {
    // Tab-switch away from ch.5/examples strips entry A to bare, storing '#/ch/5/examples' on A's
    // own history.state. navigate (push) to ch.7 creates a real, unrelated entry. Tab-switch away
    // from ch.7 strips entry B to bare, storing '#/ch/7' on B's own history.state — a *different*
    // history.state object from A's, so there is no shared slot for B to overwrite.
    const entryBPushed = resolvePopstatePendingRoute('#/ch/7', null, CHAPTERS, 's1');
    expect(entryBPushed).toEqual({ chapterId: 's7' });

    // Landing back on entry A (bare) resolves from A's own stored hash, never B's.
    expect(resolvePopstatePendingRoute('', '#/ch/5/examples', CHAPTERS, 's1'))
      .toEqual({ chapterId: 's5', section: 'examples' });
    // Landing on entry B (bare) resolves from B's own stored hash — order of these two calls,
    // and whatever happened in between, cannot change either result.
    expect(resolvePopstatePendingRoute('', '#/ch/7', CHAPTERS, 's1')).toEqual({ chapterId: 's7' });
  });
});

describe('planRequest', () => {
  it('friction in a chapter without a playbook falls back to the chapter top (spec A.5)', () => {
    expect(planRequest(ch('s3'), 'friction')).toEqual({ kind: 'top' });
    expect(planRequest(ch('s1'), 'friction')).toEqual({ kind: 'section', key: 'friction' });
  });
  it('a present section opens', () => {
    expect(planRequest(ch('s1'), 'reference')).toEqual({ kind: 'section', key: 'reference' });
  });
  it('an absent section falls back to the chapter top (spec A7, A.8)', () => {
    expect(planRequest(ch('s3'), 'reference')).toEqual({ kind: 'top' });
  });
  it('the top focus goes to the chapter top', () => {
    expect(planRequest(ch('s1'), 'top')).toEqual({ kind: 'top' });
  });
});

describe('retired section keys (spec A7)', () => {
  it('primer goes to the chapter top and canonicalises to the bare chapter', () => {
    expect(parse('#/ch/3/primer')).toEqual({ chapterId: 's3', focus: 'top' });
    expect(formatChapterHash(3, parse('#/ch/3/primer')!.section)).toBe('#/ch/3');
  });

  it('workflow and checklist land on practice', () => {
    expect(parse('#/ch/3/workflow')).toEqual({ chapterId: 's3', section: 'practice' });
    expect(parse('#/ch/3/checklist')).toEqual({ chapterId: 's3', section: 'practice' });
    expect(formatChapterHash(3, parse('#/ch/3/workflow')!.section)).toBe('#/ch/3/practice');
    expect(popstateCanonicalHash('#/ch/3/checklist', parse('#/ch/3/checklist')!, 3)).toBe('#/ch/3/practice');
  });

  it('dialogue lands on examples', () => {
    expect(parse('#/ch/3/dialogue')).toEqual({ chapterId: 's3', section: 'examples' });
    expect(formatChapterHash(3, parse('#/ch/3/dialogue')!.section)).toBe('#/ch/3/examples');
  });

  it('mindset focuses the landing card and canonicalises to the bare chapter', () => {
    expect(parse('#/ch/3/mindset')).toEqual({ chapterId: 's3', focus: 'mindset' });
    expect(planRequest(ch('s3'), 'mindset')).toEqual({ kind: 'mindset' });
  });

  it('every spec A.5 hash parses and canonicalises as specified', () => {
    const cases: [hash: string, route: object, canonical: string][] = [
      ['#/ch/3/dialogue', { chapterId: 's3', section: 'examples' }, '#/ch/3/examples'],
      ['#/ch/3/workflow', { chapterId: 's3', section: 'practice' }, '#/ch/3/practice'],
      ['#/ch/3/checklist', { chapterId: 's3', section: 'practice' }, '#/ch/3/practice'],
      ['#/ch/3/primer', { chapterId: 's3', focus: 'top' }, '#/ch/3'],
      ['#/ch/3/mindset', { chapterId: 's3', focus: 'mindset' }, '#/ch/3'],
      // Canonical on load; the request effect then clears it to #/ch/3 (planRequest -> top).
      ['#/ch/3/friction', { chapterId: 's3', section: 'friction' }, '#/ch/3/friction'],
      ['#/ch/1/friction', { chapterId: 's1', section: 'friction' }, '#/ch/1/friction'],
      ['#/ch/3/bogus', { chapterId: 's3' }, '#/ch/3'],
    ];
    for (const [hash, route, canonical] of cases) {
      const parsed = parse(hash);
      expect(parsed, hash).toEqual(route);
      expect(formatChapterHash(ch(parsed!.chapterId).num, parsed!.section), hash).toBe(canonical);
    }
    expect(planRequest(ch('s3'), 'friction')).toEqual({ kind: 'top' });
  });
});
