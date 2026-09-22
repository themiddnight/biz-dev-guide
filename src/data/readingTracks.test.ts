import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { resolveTrack, parseReadMinutes, getTrackMinutes, getTrackNext, getTrackProgress } from './readingTracks';

const BEGINNER = ['s1', 's2', 's3', 's4', 's6', 's7', 's11', 's14'];
const EXPERIENCED = ['s11', 's1', 's6', 's9', 's12', 's13', 's14'];
const BIZ = ['s1', 's4', 's5', 's6', 's9', 's10', 's11', 's13'];
const ENG = ['s1', 's2', 's3', 's4', 's12', 's11', 's14', 's9'];

describe('resolveTrack', () => {
  it('maps nums to ids in config order', () => {
    expect(resolveTrack('beginner', CHAPTERS)).toEqual(BEGINNER);
    expect(resolveTrack('experienced', CHAPTERS)).toEqual(EXPERIENCED);
  });
  it('role tracks', () => {
    expect(resolveTrack('biz', CHAPTERS)).toEqual(BIZ);
    expect(resolveTrack('eng', CHAPTERS)).toEqual(ENG);
  });
  it('eng track puts every biz-home chapter before every eng-home chapter', () => {
    const homeOf = (id: string) => CHAPTERS.find(c => c.id === id)?.home;
    const bizIdx = ENG.flatMap((id, i) => (homeOf(id) === 'biz' ? [i] : []));
    const engIdx = ENG.flatMap((id, i) => (homeOf(id) === 'eng' ? [i] : []));
    expect(bizIdx.length).toBeGreaterThan(0);
    expect(engIdx.length).toBeGreaterThan(0);
    expect(Math.max(...bizIdx)).toBeLessThan(Math.min(...engIdx));
  });
  it('skips unknown nums', () => {
    expect(resolveTrack('beginner', CHAPTERS.filter(c => c.num !== 3))).toEqual(BEGINNER.filter(id => id !== 's3'));
  });
});

describe('minutes', () => {
  it('parseReadMinutes', () => {
    expect(parseReadMinutes('10 นาที')).toBe(10);
    expect(parseReadMinutes('')).toBe(0);
    expect(parseReadMinutes('นาที')).toBe(0);
  });
  it('track minutes 92 / 83', () => {
    expect(getTrackMinutes(BEGINNER, CHAPTERS)).toBe(92);
    expect(getTrackMinutes(EXPERIENCED, CHAPTERS)).toBe(83);
  });
  it('role track minutes 98 / 92', () => {
    expect(getTrackMinutes(BIZ, CHAPTERS)).toBe(98);
    expect(getTrackMinutes(ENG, CHAPTERS)).toBe(92);
  });
});

describe('getTrackNext', () => {
  it('beginner', () => {
    expect(getTrackNext(BEGINNER, 's4')).toEqual({ kind: 'next', chapterId: 's6' });
    expect(getTrackNext(BEGINNER, 's14')).toEqual({ kind: 'end' });
    expect(getTrackNext(BEGINNER, 's5')).toEqual({ kind: 'not-in-track' });
  });
  it('experienced', () => {
    expect(getTrackNext(EXPERIENCED, 's11')).toEqual({ kind: 'next', chapterId: 's1' });
    expect(getTrackNext(EXPERIENCED, 's1')).toEqual({ kind: 'next', chapterId: 's6' });
  });
});

describe('getTrackProgress', () => {
  it('counts only track ids', () => {
    expect(getTrackProgress(BEGINNER, ['s1', 's5'])).toEqual({ read: 1, total: 8, firstUnreadId: 's2' });
  });
  it('firstUnreadId skips read ids', () => {
    expect(getTrackProgress(EXPERIENCED, ['s11', 's1']).firstUnreadId).toBe('s6');
  });
  it('all read -> null', () => {
    expect(getTrackProgress(BEGINNER, BEGINNER)).toEqual({ read: 8, total: 8, firstUnreadId: null });
  });
});
