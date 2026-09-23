import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../data/chaptersData';
import { GLOSSARY } from '../data/glossary';
import { filterIndexChapters, matchesChapterQuery } from './chapterSearch';

const terms = GLOSSARY.map(g => g.term);
const ids = (query: string, role = 'all') => filterIndexChapters(CHAPTERS, query, role, terms).map(c => c.id);

describe('chapter index search', () => {
  it('user story finds s14 (core concept) and s2', () => {
    expect(ids('user story')).toEqual(expect.arrayContaining(['s2', 's14']));
  });
  it('is case-insensitive and trims the query', () => {
    expect(ids('User Story')).toEqual(ids('user story'));
    expect(ids('  user story  ')).toEqual(ids('user story'));
  });
  it('reads core-concept text', () => {
    expect(ids('15–20')).toContain('s9');
    expect(ids('ด่วน')).toContain('s10');
  });
  it('a glossary-only term finds only s15', () => {
    const term = terms.find(t => CHAPTERS.every(c => !matchesChapterQuery(c, t, [])));
    expect(term).toBeDefined();
    expect(ids(term!)).toEqual(['s15']);
  });
  it('empty and whitespace-only queries match every chapter', () => {
    expect(ids('')).toHaveLength(CHAPTERS.length);
    expect(ids('   ')).toHaveLength(CHAPTERS.length);
  });
  it('the role chip keeps roleTag "all" chapters', () => {
    expect(ids('user story', 'pm')).toEqual(expect.arrayContaining(['s2', 's14']));
  });
  it('no match gives an empty list', () => {
    expect(ids('zzzz-no-match')).toEqual([]);
  });
});
