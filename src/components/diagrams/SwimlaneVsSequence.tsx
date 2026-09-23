import React from 'react';
import { ChevronDown } from 'lucide-react';
import { TAP_Y } from '../ui/tapTarget';
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
    className="group scroll-mt-4 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] overflow-hidden"
  >
    <summary className={`${TAP_Y} flex items-center justify-between gap-2 p-3.5 sm:p-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] transition-colors`}>
      <span className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
        {SWIMLANE_VS_SEQUENCE.summary}
      </span>
      <ChevronDown className="w-4 h-4 shrink-0 text-neutral-400 dark:text-[#737373] transition-transform group-open:rotate-180" />
    </summary>
    <div className="p-3.5 sm:p-5 space-y-4 border-t border-neutral-100 dark:border-[#262626]">
      <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3] leading-relaxed">
        <RichText text={SWIMLANE_VS_SEQUENCE.intro} />
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SWIMLANE_VS_SEQUENCE.columns.map(col => {
          const Figure = FIGURES[col.figureKey];
          return (
            <div
              key={col.figureKey}
              className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-2"
            >
              <div>
                <h5 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">{col.title}</h5>
                <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">{col.sub}</p>
              </div>
              <Figure className="w-full" />
              <p className="text-[11px] text-neutral-500 dark:text-[#8e8e8e] leading-relaxed">
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
