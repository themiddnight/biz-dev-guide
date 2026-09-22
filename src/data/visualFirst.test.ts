import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { CHAPTER_ILLUSTRATIONS } from './chapterIllustrations';
import { FIGURES } from '../components/figures';

const chapter = (id: string) => CHAPTERS.find((c) => c.id === id)!;
const HERO_FIGURES: Record<string, string> = {
  s2: 'refund-backlog-cut',
  s3: 'refund-fidelity',
  s5: 'refund-c4-impact',
  s6: 'refund-story-gates',
  s14: 'refund-spec-stack',
};
const MONEY = /\$\s?\d/;

describe('visual-first heroes', () => {
  it.each(Object.entries(HERO_FIGURES))('gives %s the %s hero figure', (id, key) => {
    expect(chapter(id).heroFigure?.figureKey).toBe(key);
  });

  it('points every hero figure at a registered figure', () => {
    for (const c of CHAPTERS) if (c.heroFigure) expect(FIGURES).toHaveProperty(c.heroFigure.figureKey);
  });

  it('limits hero figures to the rolled-out chapters (update at each wave)', () => {
    expect(CHAPTERS.filter((c) => c.heroFigure).map((c) => c.id)).toEqual(Object.keys(HERO_FIGURES));
  });

  it.each(Object.keys(HERO_FIGURES))('drops the %s text illustration cards', (id) => {
    expect(chapter(id).illustrations).toEqual([]);
  });

  it.each(Object.keys(HERO_FIGURES))('keeps $ amounts out of %s', (id) => {
    expect(JSON.stringify(chapter(id))).not.toMatch(MONEY);
  });

  it('keeps $ amounts out of the illustration cards', () => {
    expect(JSON.stringify(CHAPTER_ILLUSTRATIONS)).not.toMatch(MONEY);
  });

  it('carries no svgType or svgDescription author notes', () => {
    for (const ill of Object.values(CHAPTER_ILLUSTRATIONS)) {
      expect(ill).not.toHaveProperty('svgType');
      expect(ill).not.toHaveProperty('svgDescription');
    }
  });
});
