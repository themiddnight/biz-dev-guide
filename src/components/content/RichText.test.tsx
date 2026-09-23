import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../data/chaptersData';
import { RichText } from './RichText';

const html = (text: string) => renderToStaticMarkup(<RichText text={text} onNavigateChapter={() => {}} />);
const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

describe('RichText term markers (term-definitions spec P3.1)', () => {
  it('a marker-free string renders exactly as before: the plain text, nothing added', () => {
    // Every primer string P3.4 routes through RichText is plain today, so this is the behaviour-preservation check.
    const plain = CHAPTERS.flatMap(c => (c.beginnerPrimer ? Object.values(c.beginnerPrimer) : []));
    expect(plain.length).toBeGreaterThan(40);
    for (const text of plain) expect(html(text)).toBe(esc(text));
    expect(html('บรรทัดแรก\nบรรทัดสอง')).toBe('บรรทัดแรก<br/>บรรทัดสอง');
  });

  it('`[[g:sprint|Sprint]]` renders a closed button with the term id', () => {
    const out = html('ใน [[g:sprint|Sprint]] นี้');
    expect(out).toMatch(/<button[^>]*type="button"[^>]*data-inline-term="sprint"[^>]*aria-expanded="false"[^>]*>Sprint<\/button>/);
    expect(out).not.toContain('role="region"');
    expect(out).not.toContain('[[');
  });

  it('an unknown id renders the bare label, with no button and no raw markup', () => {
    expect(html('ใน [[g:no-such-id|Sprint]] นี้')).toBe('ใน Sprint นี้');
  });

  it('an author opt-out never renders', () => {
    expect(html('Sprint นี้[[!g:sprint]] และ[[!g:*]]')).toBe('Sprint นี้ และ');
  });

  it('bold, a chapter link and a term marker in one string all render', () => {
    const out = html('**สำคัญ** อ่าน [[s6|บทที่ 6]] เรื่อง [[g:sprint|Sprint]]');
    expect(out).toContain('<strong');
    expect(out).toContain('>สำคัญ</strong>');
    expect(out).toContain('href="#/ch/6"');
    expect(out).toContain('data-inline-term="sprint"');
  });
});
