import React from 'react';
import type { Chapter } from '../../types';
import { TRACK_CHAPTER_NUMS, getTrackMinutes, resolveTrack } from '../../data/readingTracks';
import { ROLE_META, ROLES, type Role } from '../../data/rolePerspective';
import { TAP, TAP_GAP } from '../ui/tapTarget';

const ROLE_LINE: Record<Role, string> = {
  biz: 'เริ่มจากบท PM ที่คุณคุ้น แล้วไปดูว่าทีม Engineering รับงานต่อยังไง',
  eng: 'บทฝั่ง Business จะเริ่มจากพื้นฐาน และขึ้นมาอยู่ต้นเส้นทาง',
};

/** The level a first-visit choice sets: every chapter beginner, or the role default (own side experienced). */
export type FirstVisitMode = 'beginner' | 'auto';

export const FIRST_VISIT_LEVELS: readonly { mode: FirstVisitMode; label: string }[] = [
  { mode: 'beginner', label: '🌱 มือใหม่' },
  { mode: 'auto', label: '⚡ คุ้นงานสายตัวเอง' },
];

export const FirstVisitCard: React.FC<{
  chapters: Chapter[];
  onChoose: (role: Role, mode: FirstVisitMode) => void;
  onSkip: () => void;
}> = ({ chapters, onChoose, onSkip }) => (
  <div data-first-visit className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
    <div className="space-y-1">
      <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-[#fafafa]">เริ่มจากตรงไหนดี?</h2>
      <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3]">เลือกสายงานและระดับของคุณ กดครั้งเดียวก็เริ่มอ่าน</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {ROLES.map(role => (
        <div key={role} data-first-visit-role={role} className="p-4 rounded-xl border border-neutral-200 dark:border-[#333333] space-y-1.5">
          <div className="font-bold text-sm text-neutral-900 dark:text-[#fafafa]">{ROLE_META[role].icon} {ROLE_META[role].origin}</div>
          <div className="text-xs text-neutral-600 dark:text-[#a3a3a3] leading-relaxed">{ROLE_LINE[role]}</div>
          <div className="text-[11px] text-neutral-500 dark:text-[#8e8e8e]">
            เส้นทาง: บท {TRACK_CHAPTER_NUMS[role].join(' → ')} · ≈ {getTrackMinutes(resolveTrack(role, chapters), chapters)} นาที
          </div>
          <div className="flex flex-wrap gap-2 pt-1.5">
            {FIRST_VISIT_LEVELS.map(level => (
              <button
                key={level.mode}
                type="button"
                data-first-visit-choice={`${role}-${level.mode}`}
                onClick={() => onChoose(role, level.mode)}
                className={`${TAP_GAP[8]} px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-[#404040] hover:border-neutral-500 dark:hover:border-[#737373] text-xs font-semibold text-neutral-800 dark:text-[#e5e5e5] cursor-pointer`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
    <p className="text-[11px] text-neutral-500 dark:text-[#8e8e8e] leading-relaxed">
      มือใหม่: ทุกบทเปิดแบบละเอียด · คุ้นงานสายตัวเอง: บทฝั่งคุณเปิดแบบกระชับ บทอีกฝั่งเปิดแบบละเอียด
    </p>
    <button type="button" data-first-visit-skip onClick={onSkip} className={`${TAP} text-xs font-semibold text-neutral-500 dark:text-[#8e8e8e] hover:underline cursor-pointer`}>
      ยังไม่เลือกสาย อ่านแบบมือใหม่ไปก่อน
    </button>
  </div>
);
