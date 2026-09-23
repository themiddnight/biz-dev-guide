import React from 'react';
import { DISCLOSURE_SUMMARY, DisclosureChevron } from '../ui/Disclosure';
import { S5_JUMP_TARGET_IDS, SWIMLANE_VS_SEQUENCE } from '../../data/diagramFamilies';
import { S5_SWIMLANE_SEQUENCE_BLOCKS } from '../../data/chapterContentBlocks';
import { ContentBlocks } from '../content/ContentBlocks';
import { RichText } from '../content/RichText';
import { FIGURES } from '../figures';

/**
 * Static s5 worked example (index.html 1002–1104): the same refund story drawn as a
 * swimlane and as a sequence diagram, followed by comparison table T4 and the tip.
 * Rendered as a disclosure with a stable id so family-grid jump cards can open it.
 */
export const SwimlaneVsSequence: React.FC = () => (
  <details
    id={S5_JUMP_TARGET_IDS.behavior}
    className="group scroll-mt-4 rounded-box bg-base-100 border border-base-border overflow-hidden"
  >
    <summary className={DISCLOSURE_SUMMARY}>
      <span className="text-xs sm:text-sm font-bold text-base-content">
        {SWIMLANE_VS_SEQUENCE.summary}
      </span>
      <DisclosureChevron />
    </summary>
    <div className="p-box-dense space-y-4 border-t border-base-border">
      <p className="text-xs sm:text-sm text-base-content-secondary leading-relaxed">
        <RichText text={SWIMLANE_VS_SEQUENCE.intro} />
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SWIMLANE_VS_SEQUENCE.columns.map(col => {
          const Figure = FIGURES[col.figureKey];
          return (
            <div
              key={col.figureKey}
              className="p-3.5 rounded-xl bg-base-300 border border-base-border space-y-2"
            >
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-base-content">{col.title}</h5>
                <p className="text-[11px] sm:text-xs text-base-content-muted">{col.sub}</p>
              </div>
              <Figure className="w-full" />
              <p className="text-[11px] text-base-content-muted leading-relaxed">
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
