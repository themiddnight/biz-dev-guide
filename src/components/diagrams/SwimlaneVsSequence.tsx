import React from 'react';
import { DisclosureChevron } from '../ui/Disclosure';
import { TAP_Y } from '../ui/tapTarget';
import { S5_JUMP_TARGET_IDS, SWIMLANE_VS_SEQUENCE } from '../../data/diagramFamilies';
import { S5_SWIMLANE_SEQUENCE_BLOCKS } from '../../data/chapterContentBlocks';
import { ContentBlocks } from '../content/ContentBlocks';
import { RichText } from '../content/RichText';
import { FIGURES } from '../figures';

/**
 * Static s5 worked example (index.html 1002–1104): the same refund story drawn as a
 * swimlane and as a sequence diagram, followed by comparison table T4 and the tip.
 * Rendered as a disclosure on hairlines (its table is the framed piece) with a stable id so
 * family-grid jump cards can open it.
 */
export const SwimlaneVsSequence: React.FC = () => (
  <details
    id={S5_JUMP_TARGET_IDS.behavior}
    className="group scroll-mt-4 border-y border-base-border"
  >
    <summary
      className={`${TAP_Y} flex cursor-pointer select-none list-none items-center justify-between gap-2 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary [&::-webkit-details-marker]:hidden`}
    >
      <span className="font-semibold text-base-content">
        {SWIMLANE_VS_SEQUENCE.summary}
      </span>
      <DisclosureChevron />
    </summary>
    <div className="space-y-6 pb-4 pt-1">
      <p>
        <RichText text={SWIMLANE_VS_SEQUENCE.intro} />
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {SWIMLANE_VS_SEQUENCE.columns.map(col => {
          const Figure = FIGURES[col.figureKey];
          return (
            <div
              key={col.figureKey}
              className="space-y-2"
            >
              <div>
                <h3 className="font-semibold text-base-content">{col.title}</h3>
                <p className="text-sm text-base-content-muted">{col.sub}</p>
              </div>
              <Figure className="w-full" />
              <p className="text-sm text-base-content-muted">
                <RichText text={col.caption} />
              </p>
            </div>
          );
        })}
      </div>

      <ContentBlocks sections={S5_SWIMLANE_SEQUENCE_BLOCKS} placement="diagram" />
    </div>
  </details>
);
