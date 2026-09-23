import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import type { Role } from '../../../data/rolePerspective';
import { OtherSideSection } from './OtherSideSection';
import type { GuideSectionContext, OtherSideView } from './registry';

const noop = () => {};
/** renderToStaticMarkup escapes quotes; compare against the escaped form. */
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
/** Visible text only: prose may now carry inline-term buttons (term-definitions spec P3.4). */
const textOf = (html: string) => html.replace(/<[^>]+>/g, '');
const s9 = CHAPTERS.find(c => c.id === 's9')!;

function ctx(role: Role | null, otherSideView: OtherSideView): GuideSectionContext {
  return {
    chapters: CHAPTERS,
    onNavigateChapter: noop, onDiagramJump: noop, onScrollToPlaybook: noop,
    onSearchGlossary: noop, onSelectGlossaryCategory: noop,
    glossaryCategory: 'all', setGlossaryCategory: noop,
    glossaryQuery: '', setGlossaryQuery: noop,
    c4Level: 1, setC4Level: noop,
    checkedChecklist: {}, onToggleChecklistItem: noop,
    role, chapterLevel: 'beginner', otherSideView, setOtherSideView: noop,
  };
}

const render = (role: Role | null, view: OtherSideView) =>
  renderToStaticMarkup(<OtherSideSection chapter={s9} isOpen onToggle={noop} ctx={ctx(role, view)} />);

describe('OtherSideSection', () => {
  const p = s9.perspectives!;

  it('role eng shows the business view and the Dev advice', () => {
    const html = render('eng', 'biz');
    expect(html).toContain('ฝั่ง Business มองเรื่องนี้ยังไง');
    expect(textOf(html)).toContain(esc(p.biz.measuredBy));
    expect(textOf(html)).not.toContain(esc(p.eng.measuredBy));
    expect(html).toContain('Business ถูกวัดผลด้วย');
    expect(html).toContain('Dev พูด:');
    expect(html).toContain('Business ได้ยินว่า:');
    expect(html).toContain('ถาม Business แบบนี้');
    expect(html).toContain('Dev ควรทำ:');
    expect(html).toContain(esc(s9.engineerNote));
    expect(html).not.toContain(esc(s9.businessNote));
  });

  it('role biz shows the engineering view and the Business advice', () => {
    const html = render('biz', 'eng');
    expect(html).toContain('ฝั่ง Engineering มองเรื่องนี้ยังไง');
    expect(textOf(html)).toContain(esc(p.eng.measuredBy));
    expect(textOf(html)).not.toContain(esc(p.biz.measuredBy));
    expect(html).toContain('Business ควรทำ:');
    expect(html).toContain(esc(s9.businessNote));
  });

  it('role null shows both views and both notes', () => {
    const html = render(null, 'both');
    expect(html).toContain('สองฝั่งมองเรื่องนี้ยังไง');
    expect(textOf(html)).toContain(esc(p.biz.measuredBy));
    expect(textOf(html)).toContain(esc(p.eng.measuredBy));
    expect(html).toContain(esc(s9.engineerNote));
    expect(html).toContain(esc(s9.businessNote));
  });

  it('has a labelled three-way switch exposing aria-pressed', () => {
    const html = render('eng', 'biz');
    expect(html).toContain('aria-label="เลือกฝั่งที่จะดู"');
    expect(html).toContain('ทั้งสองฝั่ง');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(2);
  });

  it('keeps the heading visible when collapsed', () => {
    const html = renderToStaticMarkup(<OtherSideSection chapter={s9} isOpen={false} onToggle={noop} ctx={ctx('eng', 'biz')} />);
    expect(html).toContain('ฝั่ง Business มองเรื่องนี้ยังไง');
    expect(textOf(html)).not.toContain(esc(p.biz.measuredBy));
  });
});
