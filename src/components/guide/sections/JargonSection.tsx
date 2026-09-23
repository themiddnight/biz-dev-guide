import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionProps } from './registry';
import { RichText } from '../../content/RichText';
import { jargonTerms } from '../../../lib/sectionTerms';
import { TAP } from '../../ui/tapTarget';
import { IconBadge } from '../../ui/IconBadge';

/** Term chips shown in the closed header; the rest collapse into "+n". */
const MAX_CHIPS = 5;

export const JargonSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  // Each term marked once in this block (spec P3.5), never a card's own subject; computed purely
  // from the chapter. `meetingExample` is spoken dialogue and is marked like prose (D21).
  const marked = useMemo(() => jargonTerms(chapter), [chapter]);
  if (!chapter.jargonList || chapter.jargonList.length === 0) return null;
  const rich = (text: string) => (
    <RichText text={text} onNavigateChapter={ctx.onNavigateChapter} onSearchGlossary={ctx.onSearchGlossary} />
  );
  return (
    <div className="border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-box flex items-center justify-between text-left cursor-pointer select-none transition-colors bg-base-300 hover:bg-base-border`}
      >
        <div className="flex items-center gap-3">
          <IconBadge size="md">📖</IconBadge>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-base-content">
                รวมคำศัพท์ที่จำเป็น (Jargon Buster)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-base-border text-base-content-body text-[10px] sm:text-[11px] font-semibold">
                {chapter.jargonList.length} คำ
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-base-content-muted mt-0.5">
              ศัพท์เทคนิคประจำบท แปลเป็นภาษาคนแบบเห็นภาพชัดเจน
            </p>
            {!isOpen && (
              <div data-jargon-chips className="flex flex-wrap gap-1.5 mt-2">
                {chapter.jargonList.slice(0, MAX_CHIPS).map((item) => (
                  <span
                    key={item.term}
                    className="px-2 py-0.5 rounded-md bg-base-100 border border-base-border text-base-content-body text-[10px] sm:text-[11px] font-medium"
                  >
                    {item.term}
                  </span>
                ))}
                {chapter.jargonList.length > MAX_CHIPS && (
                  <span className="px-2 py-0.5 text-base-content-muted text-[10px] sm:text-[11px] font-medium">
                    +{chapter.jargonList.length - MAX_CHIPS}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-base-content-secondary" />
        ) : (
          <ChevronDown className="w-4 h-4 text-base-content-muted" />
        )}
      </button>

      {isOpen && (
        <div className="p-box grid grid-cols-1 gap-3 border-t border-base-border bg-base-100">
          {chapter.jargonList.map((item, jIdx) => (
            <div
              key={jIdx}
              className="p-3.5 rounded-xl bg-base-300 border border-base-border space-y-2 text-xs sm:text-sm"
            >
              <div className="font-bold text-base-content text-xs sm:text-sm">{item.term}</div>
              <p className="text-base-content leading-relaxed">{rich(marked[jIdx].humanTranslation)}</p>
              {item.formalDefinition && (
                <p className="text-base-content-muted text-xs leading-relaxed">{item.formalDefinition}</p>
              )}
              {item.meetingExample && (
                <blockquote className="pl-3 border-l-2 border-base-border-strong text-base-content-secondary text-xs italic leading-relaxed">
                  {rich(marked[jIdx].meetingExample ?? item.meetingExample)}
                </blockquote>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
