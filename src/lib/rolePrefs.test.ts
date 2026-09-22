import { describe, it, expect } from 'vitest';
import { parseRole, parseLevelMode, parseChapterLevels } from './rolePrefs';

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
