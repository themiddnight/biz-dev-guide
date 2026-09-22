import React from 'react';
import { DIAGRAM_FAMILIES, DiagramFamily, DiagramJumpTarget } from '../../data/diagramFamilies';
import { FIGURES } from '../figures';

interface DiagramFamilyGridProps {
  onJump: (target: DiagramJumpTarget) => void;
}

const cardBase =
  'h-full w-full p-3.5 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] flex flex-col gap-1.5 text-left';
const jumpClass =
  'cursor-pointer transition-colors hover:border-neutral-400 dark:hover:border-[#525252] hover:bg-neutral-50 dark:hover:bg-[#181818] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white';

const FamilyCardBody: React.FC<{ family: DiagramFamily }> = ({ family }) => {
  const Figure = FIGURES[family.figureKey];
  return (
    <>
      <div className="mb-1 py-1" aria-hidden="true">
        <Figure className="w-full" />
      </div>
      <span className="text-sm font-bold text-neutral-900 dark:text-[#fafafa]">{family.name}</span>
      <span className="text-xs sm:text-[13px] text-neutral-700 dark:text-[#d4d4d4] leading-relaxed">{family.question}</span>
      <span className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] leading-relaxed">
        {family.examples}
      </span>
      {family.note && (
        <span className="text-[11px] sm:text-xs text-neutral-600 dark:text-[#a3a3a3] leading-relaxed">{family.note}</span>
      )}
      {family.jumpLabel && (
        <span className="mt-auto pt-1 text-[11px] sm:text-xs font-semibold text-neutral-900 dark:text-[#fafafa]">
          {family.jumpLabel}
        </span>
      )}
    </>
  );
};

/** Static s5 "6 diagram families" grid; jump cards open and scroll to their target block. */
export const DiagramFamilyGrid: React.FC<DiagramFamilyGridProps> = ({ onJump }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {DIAGRAM_FAMILIES.map(family => {
      const target = family.jumpTo;
      return target ? (
        <button
          key={family.id}
          type="button"
          onClick={() => onJump(target)}
          className={`${cardBase} ${jumpClass}`}
        >
          <FamilyCardBody family={family} />
        </button>
      ) : (
        <div key={family.id} className={cardBase}>
          <FamilyCardBody family={family} />
        </div>
      );
    })}
  </div>
);
