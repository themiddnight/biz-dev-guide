import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../data/chaptersData';
import { FirstVisitCard, FIRST_VISIT_LEVELS } from './FirstVisitCard';
import { TrackPanel } from './TrackPanel';
import { chapterLevelResetLabel, chapterLevelScopeLabel } from './rolePerspectiveUi';

const noop = () => {};

describe('FirstVisitCard', () => {
  const html = renderToStaticMarkup(<FirstVisitCard chapters={CHAPTERS} onChoose={noop} onSkip={noop} />);
  it('shows two role panels with their tracks', () => {
    expect(html).toContain('data-first-visit-role="biz"');
    expect(html).toContain('data-first-visit-role="eng"');
    expect(html).toContain('💼 ฉันมาจากสาย Business');
    expect(html).toContain('💻 ฉันมาจากสาย Engineering');
    expect(html).toContain('เส้นทาง: บท 2 → 1 → 14 → 4 → 6 → 9 → 10 → 11 · ≈ 94 นาที');
    expect(html).toContain('เส้นทาง: บท 16 → 1 → 2 → 17 → 18 → 4 → 11 → 19 → 9 · ≈ 100 นาที');
    expect(html).toContain('เริ่มจากบท PM ที่คุณคุ้น');
    expect(html).toContain('เลือกสายงานและระดับของคุณ กดครั้งเดียวก็เริ่มอ่าน');
  });
  it('offers each role with both levels, one tap each', () => {
    expect(FIRST_VISIT_LEVELS.map(l => l.mode)).toEqual(['beginner', 'auto']);
    const choices = [...html.matchAll(/data-first-visit-choice="([^"]+)"/g)].map(m => m[1]);
    expect(choices).toEqual(['biz-beginner', 'biz-auto', 'eng-beginner', 'eng-auto']);
    expect(html).toContain('🌱 มือใหม่');
    expect(html).toContain('⚡ คุ้นงานสายตัวเอง');
    expect(html).toContain('มือใหม่: ทุกบทเปิดแบบละเอียด · คุ้นงานสายตัวเอง: บทฝั่งคุณเปิดแบบกระชับ บทอีกฝั่งเปิดแบบละเอียด');
  });
  it('drops the no-role level row and keeps one skip link', () => {
    expect(html).not.toContain('ไม่ระบุสาย');
    expect(html).not.toContain('data-first-visit-option');
    expect(html).toContain('ยังไม่เลือกสาย อ่านแบบมือใหม่ไปก่อน');
    expect(html.match(/data-first-visit-skip/g)).toHaveLength(1);
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

// The lens row itself lives inline in GuideTab, which needs hooks and a DOM; its copy is
// asserted here and the row renders these literals (round3 spec P4.1, P4.2).
describe('chapterLevelResetLabel', () => {
  it('auto mode falls back to the role default', () => {
    expect(chapterLevelResetLabel('auto')).toBe('กลับไปใช้ค่าตามสายงาน');
  });
  it('a header level mode falls back to the header, and says so', () => {
    expect(chapterLevelResetLabel('beginner')).toBe('กลับไปใช้ระดับจากแถบบน');
    expect(chapterLevelResetLabel('experienced')).toBe('กลับไปใช้ระดับจากแถบบน');
  });
});

describe('chapterLevelScopeLabel', () => {
  it('names this chapter and the track it belongs to', () => {
    expect(chapterLevelScopeLabel('eng')).toContain('เฉพาะบทนี้');
    expect(chapterLevelScopeLabel('eng')).toContain('Engineering');
    expect(chapterLevelScopeLabel('biz')).toContain('เฉพาะบทนี้');
    expect(chapterLevelScopeLabel('biz')).toContain('Business');
  });
  it('the two roles get different chips', () => {
    expect(chapterLevelScopeLabel('eng')).not.toBe(chapterLevelScopeLabel('biz'));
  });
});
