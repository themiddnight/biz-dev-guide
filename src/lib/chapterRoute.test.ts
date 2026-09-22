import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../data/chaptersData';
import { formatChapterHash, initRouteSession, parseChapterHash, reduceRouteSession } from './chapterRoute';

const parse = (hash: string) => parseChapterHash(hash, CHAPTERS);

describe('formatChapterHash', () => {
  it('formats and round-trips', () => {
    expect(formatChapterHash(5)).toBe('#/ch/5');
    expect(formatChapterHash(5, 'diagram')).toBe('#/ch/5/diagram');
    for (const num of [1, 15]) {
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
    for (const h of ['#/ch/16', '#/ch/0', '#/ch/abc', '#/foo', '', '#']) expect(parse(h)).toBeNull();
  });
  it('legacy #sN', () => {
    expect(parse('#s11')).toEqual({ chapterId: 's11' });
  });
});

describe('route session', () => {
  it('starts with no hash and an undismissed banner on a bare load', () => {
    expect(initRouteSession('')).toEqual({ hashInUrl: false, resumeDismissed: false });
    expect(initRouteSession('#')).toEqual({ hashInUrl: false, resumeDismissed: false });
  });

  it('records a hash that existed at load', () => {
    expect(initRouteSession('#/ch/3')).toEqual({ hashInUrl: true, resumeDismissed: false });
    expect(initRouteSession('#/ch/99')).toEqual({ hashInUrl: true, resumeDismissed: false });
  });

  it('navigate puts a hash in the URL and dismisses the resume banner', () => {
    expect(reduceRouteSession(initRouteSession(''), { type: 'navigate' })).toEqual({ hashInUrl: true, resumeDismissed: true });
  });

  it('pop dismisses the banner and follows the popped hash', () => {
    const routed = { hashInUrl: true, resumeDismissed: false };
    expect(reduceRouteSession(routed, { type: 'pop', hash: '' })).toEqual({ hashInUrl: false, resumeDismissed: true });
    expect(reduceRouteSession(routed, { type: 'pop', hash: '#' })).toEqual({ hashInUrl: false, resumeDismissed: true });
    expect(reduceRouteSession(initRouteSession(''), { type: 'pop', hash: '#/ch/2' })).toEqual({ hashInUrl: true, resumeDismissed: true });
  });

  it('dismissing the banner leaves the URL state alone', () => {
    expect(reduceRouteSession(initRouteSession(''), { type: 'dismissResume' })).toEqual({ hashInUrl: false, resumeDismissed: true });
    expect(reduceRouteSession(initRouteSession('#/ch/4'), { type: 'dismissResume' })).toEqual({ hashInUrl: true, resumeDismissed: true });
  });
});
