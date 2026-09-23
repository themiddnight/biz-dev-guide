import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ChapterHeroFigure } from '../../types';
import { HeroFigure } from './HeroFigure';

const noop = () => {};
const figure: ChapterHeroFigure = {
  figureKey: 'refund-debt-diff',
  caption: 'CAPTION_LINE',
  seats: { biz: 'BIZ_SEAT_LINE', eng: 'ENG_SEAT_LINE' },
};

describe('HeroFigure seats', () => {
  it('role eng, seat eng: shows the eng line and the flip button', () => {
    const html = renderToStaticMarkup(
      <HeroFigure figure={figure} role="eng" seat="eng" onFlipSeat={noop} />,
    );
    expect(html).toContain('data-seat="eng"');
    expect(html).toContain('💻 เก้าอี้ฝั่ง Engineering');
    expect(html).toContain('ENG_SEAT_LINE');
    expect(html).toContain('นั่งเก้าอี้อีกฝั่ง');
    expect(html).not.toContain('BIZ_SEAT_LINE');
    expect(html).not.toContain('กลับเก้าอี้ตัวเอง');
  });

  it('role eng, seat biz: shows the biz line and the go-back button', () => {
    const html = renderToStaticMarkup(
      <HeroFigure figure={figure} role="eng" seat="biz" onFlipSeat={noop} />,
    );
    expect(html).toContain('💼 เก้าอี้ฝั่ง Business');
    expect(html).toContain('BIZ_SEAT_LINE');
    expect(html).toContain('กลับเก้าอี้ตัวเอง');
    expect(html).not.toContain('ENG_SEAT_LINE');
    expect(html).not.toContain('นั่งเก้าอี้อีกฝั่ง');
  });

  it('role null: stacks both lines with labels and no button', () => {
    const html = renderToStaticMarkup(
      <HeroFigure figure={figure} role={null} seat="biz" onFlipSeat={noop} />,
    );
    expect(html).toContain('BIZ_SEAT_LINE');
    expect(html).toContain('ENG_SEAT_LINE');
    expect(html).toContain('💼 เก้าอี้ฝั่ง Business');
    expect(html).toContain('💻 เก้าอี้ฝั่ง Engineering');
    expect(html).not.toContain('<button');
  });

  it('keeps the seat block between the caption and the analogy', () => {
    const html = renderToStaticMarkup(
      <HeroFigure figure={figure} analogy="ANALOGY_LINE" role="biz" seat="biz" onFlipSeat={noop} />,
    );
    const caption = html.indexOf('CAPTION_LINE');
    const seat = html.indexOf('BIZ_SEAT_LINE');
    const analogy = html.indexOf('ANALOGY_LINE');
    expect(caption).toBeLessThan(seat);
    expect(seat).toBeLessThan(analogy);
  });
});
