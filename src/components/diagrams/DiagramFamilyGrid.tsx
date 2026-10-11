import React from 'react';
import { DIAGRAM_FAMILIES, DiagramFamily, DiagramJumpTarget } from '../../data/diagramFamilies';
import { FIGURES } from '../figures';
import { TAP } from '../ui/tapTarget';

interface DiagramFamilyGridProps {
  onJump: (target: DiagramJumpTarget) => void;
}

const cardBase =
  'h-full w-full p-3.5 rounded-field border border-base-border flex flex-col gap-1.5 text-left';
const jumpClass =
  'cursor-pointer transition-colors hover:border-base-border-strong hover:bg-base-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

const FamilyCardBody: React.FC<{ family: DiagramFamily }> = ({ family }) => {
  const Figure = FIGURES[family.figureKey];
  return (
    <>
      <div className="mb-1 py-1" aria-hidden="true">
        <Figure className="w-full" />
      </div>
      <span className="font-semibold text-base-content">{family.name}</span>
      <span className="text-sm text-base-content-body">{family.question}</span>
      <span className="text-sm text-base-content-muted">
        {family.examples}
      </span>
      {family.note && (
        <span className="text-sm text-base-content-secondary">{family.note}</span>
      )}
      {family.jumpLabel && (
        <span className="mt-auto pt-1 text-sm font-semibold text-base-content">
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
