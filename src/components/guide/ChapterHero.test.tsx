import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../data/chaptersData';
import { ChapterHero } from './ChapterHero';

describe('ChapterHero', () => {
  it('no longer renders the business/engineer notes grid (moved to OtherSideSection, D7)', () => {
    for (const ch of CHAPTERS) {
      const html = renderToStaticMarkup(<ChapterHero chapter={ch} experienceLevel="beginner" isRead={false} />);
      expect(html).not.toContain('มุมมองฝั่ง Business');
      expect(html).not.toContain('มุมมองฝั่ง Engineer');
    }
  });
});
