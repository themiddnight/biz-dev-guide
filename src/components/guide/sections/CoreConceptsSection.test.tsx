import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import type { ExperienceLevel } from '../../../types';
import { CoreConceptsSection } from './CoreConceptsSection';
import type { GuideSectionContext } from './registry';

const ch = (id: string) => {
  const c = CHAPTERS.find(x => x.id === id);
  if (!c) throw new Error(`missing ${id}`);
  return c;
};
const render = (id: string, chapterLevel: ExperienceLevel) => {
  const ctx = { chapterLevel, onNavigateChapter: () => {} } as unknown as GuideSectionContext;
  return renderToStaticMarkup(<CoreConceptsSection chapter={ch(id)} isOpen onToggle={() => {}} ctx={ctx} />);
};

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

describe('CoreConceptsSection', () => {
  const s9cc1 = ch('s9').coreConcepts![0];
  const firstBullet = esc(s9cc1.bulletPoints![0]);

  it('beginner: heading and detail shown, bullets behind ดูรายละเอียด', () => {
    const html = render('s9', 'beginner');
    expect(html).toContain('15–20%');
    expect(s9cc1.bulletPoints).toHaveLength(4);
    expect(html).toContain('ดูรายละเอียด (4 ข้อ)');
    expect(html).toContain('data-concept-more="0"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain(firstBullet);
  });

  it('experienced: bullets always shown, no toggle', () => {
    const html = render('s9', 'experienced');
    expect(html).toContain(firstBullet);
    expect(html).not.toContain('ดูรายละเอียด');
  });

  it('beginner s5: inline figure hidden behind the concept toggle', () => {
    const html = render('s5', 'beginner');
    expect(html).toContain('ดูรายละเอียด (4 ข้อ)');
    expect(html).not.toContain('data-inline-figure');
    expect(render('s5', 'experienced')).toContain('data-inline-figure');
  });
});
