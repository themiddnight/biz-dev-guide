import React from 'react';
import type { ChapterHeroFigure } from '../../types';
import { FIGURES } from '../figures';
import { ROLES, ROLE_META, type Role } from '../../data/rolePerspective';

interface HeroFigureProps {
  figure: ChapterHeroFigure;
  analogy?: string; // chapter.plainAnalogy, rendered as one plain line
  role: Role | null;
  seat: Role; // whose seat is narrated when a role is set
  onFlipSeat: () => void;
}

const SeatLine: React.FC<{ side: Role; line: string }> = ({ side, line }) => (
  <p className="text-xs sm:text-sm text-neutral-700 dark:text-[#c4c4c4] leading-relaxed break-words">
    <span className="font-semibold text-neutral-900 dark:text-[#fafafa]" data-seat-label>
      {ROLE_META[side].icon} เก้าอี้{ROLE_META[side].side}
    </span>{' '}
    <span data-seat-line={side}>{line}</span>
  </p>
);

/** The chapter's first visual, right under the subtitle (visual-first pilot, spec §3). */
export const HeroFigure: React.FC<HeroFigureProps> = ({ figure, analogy, role, seat, onFlipSeat }) => {
  const Figure = FIGURES[figure.figureKey];
  if (!Figure) return null;
  return (
    <figure data-hero-figure className="space-y-2">
      <Figure />
      <figcaption className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-[#e5e5e5]">
        {figure.caption}
      </figcaption>
      {role ? (
        <div data-seat={seat} aria-live="polite" className="flex flex-wrap items-baseline gap-x-2 gap-y-1 min-w-0">
          <SeatLine side={seat} line={figure.seats[seat]} />
          <button
            type="button"
            data-seat-flip
            onClick={onFlipSeat}
            className="cursor-pointer text-xs font-semibold text-neutral-600 dark:text-[#a3a3a3] underline underline-offset-2 hover:text-neutral-900 dark:hover:text-[#fafafa]"
          >
            {seat === role ? 'นั่งเก้าอี้อีกฝั่ง' : 'กลับเก้าอี้ตัวเอง'}
          </button>
        </div>
      ) : (
        <div data-seat="both" className="space-y-1 min-w-0">
          {ROLES.map((side) => (
            <SeatLine key={side} side={side} line={figure.seats[side]} />
          ))}
        </div>
      )}
      {analogy && (
        <p data-analogy className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3]">
          💡 {analogy}
        </p>
      )}
    </figure>
  );
};
