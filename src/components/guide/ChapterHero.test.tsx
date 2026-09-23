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

  it('renders the chapter opening under the subtitle, above the figure and the takeaway, at both levels (P4.3)', () => {
    const s4 = CHAPTERS.find(c => c.id === 's4')!;
    for (const level of ['beginner', 'experienced'] as const) {
      const html = renderToStaticMarkup(<ChapterHero chapter={s4} experienceLevel={level} isRead={false} />);
      const opening = html.indexOf('data-chapter-opening');
      expect(opening, level).toBeGreaterThan(html.indexOf(s4.subtitle));
      expect(opening, level).toBeLessThan(html.indexOf('data-hero-figure'));
      expect(opening, level).toBeLessThan(html.indexOf('data-key-takeaway'));
      // Acceptance 2: both title abbreviations are expanded on screen before the takeaway's `Non-Functional Requirements`.
      const line = html.slice(opening, html.indexOf('data-hero-figure'));
      expect(line).toContain('BA (Business Analyst)');
      expect(line).toContain('NFR (Non-Functional Requirements)');
    }
  });

  it('every chapter renders its opening exactly once', () => {
    for (const ch of CHAPTERS) {
      const html = renderToStaticMarkup(<ChapterHero chapter={ch} experienceLevel="beginner" isRead={false} />);
      expect(html.split('data-chapter-opening').length - 1, ch.id).toBe(1);
    }
  });

  it('the chapter number is a soft badge that still names the chapter to screen readers (§10.3)', () => {
    const s4 = CHAPTERS.find(c => c.id === 's4')!;
    const html = renderToStaticMarkup(<ChapterHero chapter={s4} experienceLevel="beginner" isRead={false} />);
    expect(html).toContain(`aria-label="บทที่ ${s4.num}"`);
    expect(html).not.toMatch(/(?<![\w:/-])bg-primary(?![\w/-])/);
  });
});
