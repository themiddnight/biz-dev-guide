import { describe, it, expect } from 'vitest';
import { chapterStartTop } from './chapterScroll';

describe('chapterStartTop', () => {
  it('puts the card just below the sticky header', () => {
    expect(chapterStartTop(700, 200)).toBe(492);
    expect(chapterStartTop(700, 200, 0)).toBe(500);
  });
  it('never scrolls above the page top', () => {
    expect(chapterStartTop(100, 200)).toBe(0);
  });
  it('rounds fractional layout values', () => {
    expect(chapterStartTop(700.6, 199.2, 8)).toBe(493);
  });
});
