import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { CHAPTER_ILLUSTRATIONS, EXTRA_CHAPTER_ILLUSTRATIONS } from './chapterIllustrations';
import { FIGURES } from '../components/figures';

const s3 = CHAPTERS.find((c) => c.id === 's3')!;
const MONEY = /\$\s?\d/;

describe('visual-first pilot', () => {
  it('gives s3 the refund-fidelity hero figure', () => {
    expect(s3.heroFigure?.figureKey).toBe('refund-fidelity');
  });

  it('points every hero figure at a registered figure', () => {
    for (const c of CHAPTERS) if (c.heroFigure) expect(FIGURES).toHaveProperty(c.heroFigure.figureKey);
  });

  it('limits hero figures to the pilot chapter (update at rollout)', () => {
    expect(CHAPTERS.filter((c) => c.heroFigure).map((c) => c.id)).toEqual(['s3']);
  });

  it('drops the s3 text illustration card', () => {
    expect(s3.illustrations).toEqual([]);
  });

  it('keeps $ amounts out of s3 and the illustration cards', () => {
    expect(JSON.stringify(s3)).not.toMatch(MONEY);
    expect(JSON.stringify(CHAPTER_ILLUSTRATIONS)).not.toMatch(MONEY);
    expect(JSON.stringify(EXTRA_CHAPTER_ILLUSTRATIONS)).not.toMatch(MONEY);
  });

  it('carries no svgType or svgDescription author notes', () => {
    const all = [...Object.values(CHAPTER_ILLUSTRATIONS), ...Object.values(EXTRA_CHAPTER_ILLUSTRATIONS).flat()];
    for (const ill of all) {
      expect(ill).not.toHaveProperty('svgType');
      expect(ill).not.toHaveProperty('svgDescription');
    }
  });
});
