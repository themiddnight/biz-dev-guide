import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../data/chaptersData';
import { FirstVisitCard } from './FirstVisitCard';
import { TrackPanel } from './TrackPanel';

const noop = () => {};

describe('FirstVisitCard', () => {
  const html = renderToStaticMarkup(<FirstVisitCard chapters={CHAPTERS} onChooseRole={noop} onChoose={noop} onSkip={noop} />);
  it('shows two role cards with their tracks, the no-role level row and skip', () => {
    expect(html).toContain('data-first-visit-role="biz"');
    expect(html).toContain('data-first-visit-role="eng"');
    expect(html).toContain('💼 ฉันมาจากสาย Business');
    expect(html).toContain('💻 ฉันมาจากสาย Engineering');
    expect(html).toContain('เส้นทาง: บท 2 → 1 → 14 → 4 → 6 → 9 → 10 → 11 · ≈ 94 นาที');
    expect(html).toContain('เส้นทาง: บท 16 → 1 → 2 → 17 → 18 → 4 → 11 → 19 → 9 · ≈ 100 นาที');
    expect(html).toContain('≈ 94 นาที');
    expect(html).toContain('≈ 100 นาที');
    expect(html).toContain('เริ่มจากบท PM ที่คุณคุ้น');
    expect(html).not.toContain('บทฝั่งคุณเริ่มจากแนวคิดหลัก');
    expect(html).toContain('ไม่ระบุสาย:');
    expect(html).toContain('data-first-visit-option="beginner"');
    expect(html).toContain('data-first-visit-option="experienced"');
    expect(html).toContain('ข้ามไปก่อน (ใช้โหมดมือใหม่)');
  });
});

describe('TrackPanel', () => {
  it('carries the track key and title', () => {
    const html = renderToStaticMarkup(
      <TrackPanel chapters={CHAPTERS} trackKey="eng" readChapters={[]} activeChapterId="s1" onSelectChapter={noop} onStartQuiz={noop} />,
    );
    expect(html).toContain('data-track-panel="eng"');
    expect(html).toContain('เส้นทางคนสาย Engineering');
  });
});
