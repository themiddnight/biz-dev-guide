import React from 'react';
import { DIAGRAM_FAMILIES, DiagramFamily, DiagramJumpTarget } from '../../data/diagramFamilies';
import { FIGURES } from '../figures';
import { TAP } from '../ui/tapTarget';

interface DiagramFamilyGridProps {
  onJump: (target: DiagramJumpTarget) => void;
}

// Each family is a row on a hairline, not a card. The side inset keeps the hover fill off the text.
const cardBase =
  'h-full w-full -mx-2 px-2 py-4 rounded-field border-t border-base-border flex flex-col gap-1.5 text-left';
const jumpClass =
  'cursor-pointer transition-colors hover:bg-base-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

const FamilyCardBody: React.FC<{ family: DiagramFamily }> = ({ family }) => {
  const Figure = FIGURES[family.figureKey];
  return (
    <>
      <div className="mb-1" aria-hidden="true">
        <Figure className="w-full" />
      </div>
      <span className="font-semibold text-base-content">{family.name}</span>
      <span className="text-base-content-body">{family.question}</span>
      <span className="text-sm text-base-content-muted">{family.examples}</span>
      {family.note && (
        <span className="text-sm text-base-content-secondary">{family.note}</span>
      )}
      {family.jumpLabel && (
        <span className="mt-auto pt-1 text-sm font-semibold text-base-content underline underline-offset-2 decoration-base-border-strong">
          {family.jumpLabel}
        </span>
      )}
    </>
  );
};

/** Static s5 "6 diagram families" grid; jump cards open and scroll to their target block. */
export const DiagramFamilyGrid: React.FC<DiagramFamilyGridProps> = ({ onJump }) => (
  <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
    {DIAGRAM_FAMILIES.map(family => {
      const target = family.jumpTo;
      return target ? (
        <button
          key={family.id}
          type="button"
          onClick={() => onJump(target)}
          className={`${TAP} ${cardBase} ${jumpClass}`}
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
