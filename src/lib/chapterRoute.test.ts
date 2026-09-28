import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../data/chaptersData';
import {
  formatChapterHash, initRouteSession, parseChapterHash, planRequest, popstateCanonicalHash,
  reduceRouteSession, resolveInitialChapter, resolveSectionParam,
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

describe('planRequest', () => {
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
});
