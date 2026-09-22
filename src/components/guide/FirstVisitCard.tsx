import React from 'react';
import type { Chapter, ExperienceLevel } from '../../types';
import { TRACK_CHAPTER_NUMS, getTrackMinutes, resolveTrack } from '../../data/readingTracks';

const OPTIONS: { level: ExperienceLevel; label: string; line: string }[] = [
  { level: 'beginner', label: '🌱 ใหม่กับเรื่องนี้', line: 'ยังไม่คุ้นศัพท์และขั้นตอนระหว่าง Business กับ Engineering เริ่มจากปฐมบท ศัพท์ และแผนภาพ' },
  { level: 'experienced', label: '⚡ ทำงานข้ามทีมมาแล้ว', line: 'เคยคุยงานกับอีกฝั่งมาแล้ว อยากได้แนวคิดหลัก กับดัก และวิธีรับมือความขัดแย้ง' },
];

export const FirstVisitCard: React.FC<{
  chapters: Chapter[];
  onChoose: (level: ExperienceLevel) => void;
  onSkip: () => void;
}> = ({ chapters, onChoose, onSkip }) => (
  <div data-first-visit className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
    <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-[#fafafa]">เริ่มจากตรงไหนดี?</h2>
    <div className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map(option => (
        <button
          key={option.level}
          type="button"
          data-first-visit-option={option.level}
          onClick={() => onChoose(option.level)}
          className="text-left p-4 rounded-xl border border-neutral-200 dark:border-[#333333] hover:border-neutral-400 dark:hover:border-[#525252] cursor-pointer space-y-1.5"
        >
          <div className="font-bold text-sm text-neutral-900 dark:text-[#fafafa]">{option.label}</div>
          <div className="text-xs text-neutral-600 dark:text-[#a3a3a3] leading-relaxed">{option.line}</div>
          <div className="text-[11px] text-neutral-500 dark:text-[#8e8e8e]">
            เส้นทาง: บท {TRACK_CHAPTER_NUMS[option.level].join(' → ')} · ≈ {getTrackMinutes(resolveTrack(option.level, chapters), chapters)} นาที
          </div>
        </button>
      ))}
    </div>
    <button type="button" data-first-visit-skip onClick={onSkip} className="text-xs font-semibold text-neutral-500 dark:text-[#8e8e8e] hover:underline cursor-pointer">
      ข้ามไปก่อน (ใช้โหมดมือใหม่)
    </button>
  </div>
);
