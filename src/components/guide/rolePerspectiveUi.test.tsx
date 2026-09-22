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
    expect(html).toContain('เส้นทาง: บท 1 → 4 → 5 → 6 → 9 → 10 → 11 → 13 · ≈ 98 นาที');
    expect(html).toContain('เส้นทาง: บท 1 → 2 → 3 → 4 → 12 → 11 → 14 → 9 · ≈ 92 นาที');
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
