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
  <div data-first-visit className="bg-base-100 border border-base-border rounded-box p-box-spacious shadow-2xs space-y-4">
    <div className="space-y-1">
      <h2 className="text-lg sm:text-xl font-extrabold text-base-content">เริ่มจากตรงไหนดี?</h2>
      <p className="text-xs sm:text-sm text-base-content-secondary">เลือกสายงานและระดับของคุณ กดครั้งเดียวก็เริ่มอ่าน</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {ROLES.map(role => (
        <div key={role} data-first-visit-role={role} role="group" aria-label={ROLE_META[role].origin} className="p-4 rounded-xl border border-base-border space-y-1.5">
          <div className="font-bold text-sm text-base-content">{ROLE_META[role].icon} {ROLE_META[role].origin}</div>
          <div className="text-xs text-base-content-secondary leading-relaxed">{ROLE_LINE[role]}</div>
          <div className="text-[11px] text-base-content-muted">
            เส้นทาง: บท {TRACK_CHAPTER_NUMS[role].join(' → ')} · ≈ {getTrackMinutes(resolveTrack(role, chapters), chapters)} นาที
          </div>
          <div className="flex flex-wrap gap-2 pt-1.5">
            {FIRST_VISIT_LEVELS.map(level => (
              <button
                key={level.mode}
                type="button"
                data-first-visit-choice={`${role}-${level.mode}`}
                onClick={() => onChoose(role, level.mode)}
                className={`${TAP_GAP[8]} px-3 py-1.5 rounded-lg border border-base-border-strong hover:border-base-border-strong text-xs font-semibold text-base-content cursor-pointer`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
    <p className="text-[11px] text-base-content-muted leading-relaxed">
      มือใหม่: ทุกบทเปิดแบบละเอียด · คุ้นงานสายตัวเอง: บทฝั่งคุณเปิดแบบกระชับ บทอีกฝั่งเปิดแบบละเอียด
    </p>
    <button type="button" data-first-visit-skip onClick={onSkip} className={`${TAP} text-xs font-semibold text-base-content-muted hover:underline cursor-pointer`}>
      ยังไม่เลือกสาย อ่านแบบมือใหม่ไปก่อน
    </button>
  </div>
);
