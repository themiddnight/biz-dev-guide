import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../data/chaptersData';
import { ChapterIntro } from './ChapterIntro';

const s1 = CHAPTERS.find(c => c.id === 's1')!;

describe('ChapterIntro (spec A1)', () => {
  const html = renderToStaticMarkup(<ChapterIntro chapter={s1} />);

  it('renders the three primer strings, in order, in one paragraph', () => {
    expect(html).toContain('id="chapter-intro"');
    expect(html).toContain('data-chapter-intro');
    const what = html.indexOf('Leaky Pipeline คืออาการที่โจทย์ธุรกิจ');
    const why = html.indexOf('ความผิดพลาดที่แพงที่สุดไม่ใช่บั๊ก');
    const scenario = html.indexOf('ลูกค้าอยากส่งของให้เพื่อนเร็วขึ้น');
    expect(what).toBeGreaterThan(0);
    expect(why).toBeGreaterThan(what);
    expect(scenario).toBeGreaterThan(why);
    expect(html.match(/<p[ >]/g)).toHaveLength(1);
  });

  it('has no heading and no toggle: the only buttons are inline term markers', () => {
    expect(html).not.toMatch(/<h[1-6][ >]/);
    const buttons = html.match(/<button[^>]*>/g) ?? [];
    expect(buttons.every(b => b.includes('data-inline-term'))).toBe(true);
  });

  it('renders nothing for a chapter without a primer', () => {
    expect(renderToStaticMarkup(<ChapterIntro chapter={{ ...s1, beginnerPrimer: undefined }} />)).toBe('');
  });
});
