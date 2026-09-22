import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../data/chaptersData';
import { formatChapterHash, initRouteSession, parseChapterHash, reduceRouteSession, resolveInitialChapter } from './chapterRoute';

const parse = (hash: string) => parseChapterHash(hash, CHAPTERS);

describe('formatChapterHash', () => {
  it('formats and round-trips', () => {
    expect(formatChapterHash(5)).toBe('#/ch/5');
    expect(formatChapterHash(5, 'diagram')).toBe('#/ch/5/diagram');
    for (const num of [1, 15, 19]) {
      const id = `s${num}`;
      expect(parse(formatChapterHash(num))).toEqual({ chapterId: id });
      expect(parse(formatChapterHash(num, 'checklist'))).toEqual({ chapterId: id, section: 'checklist' });
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
