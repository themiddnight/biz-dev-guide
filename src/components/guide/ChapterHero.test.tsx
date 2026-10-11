import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../data/chaptersData';
import { ChapterHero } from './ChapterHero';

const HOME: Record<string, string> = { biz: 'งานฝั่ง Business', eng: 'งานฝั่ง Engineering', shared: 'งานที่สองฝั่งทำร่วมกัน' };

describe('ChapterHero', () => {
  it('no longer renders the business/engineer notes grid (moved to OtherSideSection, D7)', () => {
    for (const ch of CHAPTERS) {
      const html = renderToStaticMarkup(<ChapterHero chapter={ch} isRead={false} />);
      expect(html).not.toContain('มุมมองฝั่ง Business');
      expect(html).not.toContain('มุมมองฝั่ง Engineer');
    }
  });

  it('renders the chapter opening under the subtitle, above the figure and the takeaway (P4.3)', () => {
    const s4 = CHAPTERS.find(c => c.id === 's4')!;
    {
      const html = renderToStaticMarkup(<ChapterHero chapter={s4} isRead={false} />);
      const opening = html.indexOf('data-chapter-opening');
      expect(opening).toBeGreaterThan(html.indexOf(s4.subtitle));
      expect(opening).toBeLessThan(html.indexOf('data-hero-figure'));
      expect(opening).toBeLessThan(html.indexOf('data-key-takeaway'));
      // Acceptance 2: both title abbreviations are expanded on screen before the takeaway's `Non-Functional Requirements`.
      const line = html.slice(opening, html.indexOf('data-hero-figure'));
      expect(line).toContain('BA (Business Analyst)');
      expect(line).toContain('NFR (Non-Functional Requirements)');
    }
  });

  it('every chapter renders its opening exactly once', () => {
    for (const ch of CHAPTERS) {
      const html = renderToStaticMarkup(<ChapterHero chapter={ch} isRead={false} />);
      expect(html.split('data-chapter-opening').length - 1, ch.id).toBe(1);
    }
  });

  it('one meta line: chapter number, the side that owns the work, reading time, and the read mark once read', () => {
    const s4 = CHAPTERS.find(c => c.id === 's4')!;
    const meta = (isRead: boolean) => {
      const html = renderToStaticMarkup(<ChapterHero chapter={s4} isRead={isRead} />);
      const line = /<p[^>]*data-chapter-meta[^>]*>(.*?)<\/p>/.exec(html)![1];
      return [...line.matchAll(/<span[^>]*>(.*?)<\/span>/g)].map(m => m[1].replace(/<!-- -->/g, ''));
    };
    expect(meta(false)).toEqual(['บทที่ 4', HOME[s4.home], `อ่าน ${s4.readTime}`]);
    expect(meta(true)).toEqual(['บทที่ 4', HOME[s4.home], `อ่าน ${s4.readTime}`, 'อ่านแล้ว']);
  });

  it('names the owning side for each kind of chapter', () => {
    const line = (id: string) => renderToStaticMarkup(<ChapterHero chapter={CHAPTERS.find(c => c.id === id)!} isRead={false} />);
    const byHome = (home: string) => CHAPTERS.find(c => c.home === home)!.id;
    expect(line(byHome('biz'))).toContain('<span>งานฝั่ง Business</span>');
    expect(line(byHome('eng'))).toContain('<span>งานฝั่ง Engineering</span>');
    expect(line(byHome('shared'))).toContain('<span>งานที่สองฝั่งทำร่วมกัน</span>');
  });

  it('a chapter without a hero figure shows the analogy as a plain paragraph above the takeaway', () => {
    const s4 = CHAPTERS.find(c => c.id === 's4')!;
    const html = renderToStaticMarkup(<ChapterHero chapter={{ ...s4, heroFigure: undefined, plainAnalogy: 'ANALOGY_LINE' }} isRead={false} />);
    expect(html).not.toContain('data-hero-figure');
    expect(html).toMatch(/<p data-analogy[^>]*>ANALOGY_LINE<\/p>/);
    expect(html.indexOf('ANALOGY_LINE')).toBeLessThan(html.indexOf('data-key-takeaway'));
  });
});
