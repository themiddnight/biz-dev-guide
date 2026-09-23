import React from 'react';
import type { Chapter, ExperienceLevel } from '../../types';
import { TRACK_CHAPTER_NUMS, getTrackMinutes, resolveTrack } from '../../data/readingTracks';
import { ROLE_META, type Role } from '../../data/rolePerspective';
import { TAP, TAP_GAP } from '../ui/tapTarget';

const ROLE_OPTIONS: { role: Role; line: string }[] = [
  { role: 'biz', line: 'เริ่มจากบท PM ที่คุณคุ้น แล้วไปดูว่าทีม Engineering รับงานต่อยังไง' },
  { role: 'eng', line: 'บทฝั่ง Business จะเริ่มจากพื้นฐาน และขึ้นมาอยู่ต้นเส้นทาง' },
];

const LEVEL_OPTIONS: { level: ExperienceLevel; label: string }[] = [
  { level: 'beginner', label: '🌱 ใหม่กับเรื่องนี้' },
  { level: 'experienced', label: '⚡ ทำงานข้ามทีมมาแล้ว' },
];

export const FirstVisitCard: React.FC<{
  chapters: Chapter[];
  onChooseRole: (role: Role) => void;
  onChoose: (level: ExperienceLevel) => void;
  onSkip: () => void;
}> = ({ chapters, onChooseRole, onChoose, onSkip }) => (
  <div data-first-visit className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
    <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-[#fafafa]">เริ่มจากตรงไหนดี?</h2>
    <div className="grid gap-3 sm:grid-cols-2">
      {ROLE_OPTIONS.map(option => (
        <button
          key={option.role}
          type="button"
          data-first-visit-role={option.role}
          onClick={() => onChooseRole(option.role)}
          className={`${TAP} text-left p-4 rounded-xl border border-neutral-200 dark:border-[#333333] hover:border-neutral-400 dark:hover:border-[#525252] cursor-pointer space-y-1.5`}
        >
          <div className="font-bold text-sm text-neutral-900 dark:text-[#fafafa]">{ROLE_META[option.role].icon} {ROLE_META[option.role].origin}</div>
          <div className="text-xs text-neutral-600 dark:text-[#a3a3a3] leading-relaxed">{option.line}</div>
          <div className="text-[11px] text-neutral-500 dark:text-[#8e8e8e]">
            เส้นทาง: บท {TRACK_CHAPTER_NUMS[option.role].join(' → ')} · ≈ {getTrackMinutes(resolveTrack(option.role, chapters), chapters)} นาที
          </div>
        </button>
      ))}
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-neutral-500 dark:text-[#8e8e8e]">ไม่ระบุสาย:</span>
      {LEVEL_OPTIONS.map(option => (
        <button
          key={option.level}
          type="button"
          data-first-visit-option={option.level}
          onClick={() => onChoose(option.level)}
          className={`${TAP_GAP[8]} px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-[#333333] hover:border-neutral-400 dark:hover:border-[#525252] text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] cursor-pointer`}
        >
          {option.label}
        </button>
      ))}
    </div>
    <button type="button" data-first-visit-skip onClick={onSkip} className={`${TAP} text-xs font-semibold text-neutral-500 dark:text-[#8e8e8e] hover:underline cursor-pointer`}>
      ข้ามไปก่อน (ใช้โหมดมือใหม่)
    </button>
  </div>
);
