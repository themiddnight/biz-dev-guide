import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { CHAPTER_HERO_FIGURES } from './chapterHeroFigures';
import {
  getChapterLayout, getInlineSections, getInlineSectionsAt, getReferenceSections,
  isSectionKey, isSectionPresent,
} from './sectionLayers';
import type { ChapterContentSection, ContentBlock, ExperienceLevel, FigureKey } from '../types';

const LEVELS: ExperienceLevel[] = ['beginner', 'experienced'];

const ch = (id: string) => {
  const c = CHAPTERS.find(x => x.id === id);
  if (!c) throw new Error(`missing ${id}`);
  return c;
};

const figureKeys = (blocks: ContentBlock[]): FigureKey[] =>
  blocks.flatMap(b => (b.kind === 'figure' ? [b.figureKey] : b.kind === 'details' ? figureKeys(b.body) : []));

const sectionFigures = (sections: ChapterContentSection[]) => sections.flatMap(s => figureKeys(s.blocks));

const inlineEntries = CHAPTERS.flatMap(c => getInlineSections(c).map(s => [c.id, s] as const));

describe('inline content placement', () => {
  it('has at least one inline consumer (s5)', () => {
    expect(inlineEntries.length).toBeGreaterThan(0);
  });

  it.each(inlineEntries)('%s: inline anchor exists and is present for the chapter', (id, section) => {
    const chapter = ch(id);
    expect(isSectionKey(section.after)).toBe(true);
    expect(isSectionPresent(chapter, section.after)).toBe(true);
    for (const level of LEVELS) {
      expect(getChapterLayout(level, chapter).some(g => g.sections.includes(section.after))).toBe(true);
    }
  });

  it.each(inlineEntries)('%s: conceptIndex only anchors to an existing core concept', (id, section) => {
    if (section.conceptIndex === undefined) return;
    expect(section.after).toBe('coreConcepts');
    expect(Number.isInteger(section.conceptIndex)).toBe(true);
    expect(section.conceptIndex).toBeGreaterThanOrEqual(0);
    expect(section.conceptIndex).toBeLessThan(ch(id).coreConcepts?.length ?? 0);
  });

  it.each(CHAPTERS.map(c => c.id))('%s: no figureKey renders both as hero and inline', id => {
    const hero = CHAPTER_HERO_FIGURES[id]?.figureKey;
    if (!hero) return;
    expect(sectionFigures(getInlineSections(ch(id)))).not.toContain(hero);
  });

  it('inline sections never reach Reference', () => {
    for (const chapter of CHAPTERS) {
      expect(getReferenceSections(chapter).some(s => s.placement === 'inline')).toBe(false);
    }
  });

  it('s5: three-lenses sits after core concept 1 and left Reference; c4-l1-hero is gone', () => {
    const s5 = ch('s5');
    expect(s5.coreConcepts?.[0].heading).toContain('C4 Model ทั้ง 4 ระดับ');
    expect(sectionFigures(getInlineSectionsAt(s5, 'coreConcepts', 0))).toEqual(['three-lenses']);
    expect(getInlineSectionsAt(s5, 'coreConcepts')).toEqual([]);
    const reference = sectionFigures(getReferenceSections(s5));
    expect(reference).not.toContain('three-lenses');
    expect(sectionFigures(s5.contentSections ?? [])).not.toContain('c4-l1-hero');
    const referenceIds = getReferenceSections(s5).flatMap(s => s.blocks.map(b => b.id));
    expect(referenceIds).toEqual(expect.arrayContaining(['s5-standards', 's5-standards-note']));
  });
});
