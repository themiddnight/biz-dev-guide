import React from 'react';
import type { ChapterHeroFigure } from '../../types';
import { FIGURES } from '../figures';
import { ROLES, ROLE_META, type Role } from '../../data/rolePerspective';
import { TAP } from '../ui/tapTarget';

interface HeroFigureProps {
  figure: ChapterHeroFigure;
  /** The seat lines with their term markers; a seat without one shows the figure's plain line. */
  seatLines?: Partial<Record<Role, React.ReactNode>>;
  analogy?: React.ReactNode; // chapter.plainAnalogy as one line (a string, or ChapterHero's marked RichText)
  role: Role | null;
  seat: Role; // whose seat is narrated when a role is set
  onFlipSeat: () => void;
}

const SeatLine: React.FC<{ side: Role; line: React.ReactNode }> = ({ side, line }) => (
  <p className="break-words">
    <span className="font-semibold text-base-content" data-seat-label>เก้าอี้{ROLE_META[side].side}</span>{' '}
    <span data-seat-line={side}>{line}</span>
  </p>
);

/** The chapter's first visual, right under the opening line (visual-first pilot, spec §3). */
export const HeroFigure: React.FC<HeroFigureProps> = ({ figure, seatLines = {}, analogy, role, seat, onFlipSeat }) => {
  const Figure = FIGURES[figure.figureKey];
  if (!Figure) return null;
  const lineOf = (side: Role) => seatLines[side] ?? figure.seats[side];
  return (
    <figure data-hero-figure className="space-y-3">
      <Figure />
      <figcaption className="font-semibold text-base-content">{figure.caption}</figcaption>
      {role ? (
        <div data-seat={seat} aria-live="polite" className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <SeatLine side={seat} line={lineOf(seat)} />
          <button
            type="button"
            data-seat-flip
            onClick={onFlipSeat}
            className={`${TAP} cursor-pointer text-sm text-base-content-muted underline decoration-base-border underline-offset-4 hover:text-base-content`}
          >
            {seat === role ? 'นั่งเก้าอี้อีกฝั่ง' : 'กลับเก้าอี้ตัวเอง'}
          </button>
        </div>
      ) : (
        <div data-seat="both" className="min-w-0 space-y-1">
          {ROLES.map(side => (
            <SeatLine key={side} side={side} line={lineOf(side)} />
          ))}
        </div>
      )}
      {analogy && <p data-analogy className="text-base-content-secondary">{analogy}</p>}
    </figure>
  );
};
