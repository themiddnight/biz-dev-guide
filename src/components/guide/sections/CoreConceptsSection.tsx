import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getInlineSectionsAt } from '../../../data/sectionLayers';
import { InlineSections } from '../InlineSections';
import type { SectionProps } from './registry';
import { RichText } from '../../content/RichText';
import { coreConceptTerms } from '../../../lib/sectionTerms';
import { TAP } from '../../ui/tapTarget';

export const CoreConceptsSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  // Beginners see each concept compact (heading + detail); bullets and inline sections sit behind a toggle.
  // Toggles are keyed by concept index, so they belong to one chapter and reset when it changes.
  const [more, setMore] = useState<{ chapterId: string; open: Record<number, boolean> }>({ chapterId: chapter.id, open: {} });
  const moreOpen = more.chapterId === chapter.id ? more.open : {};
  // Markers are a pure function of the chapter, never of which concepts are unfolded: every detail
  // first, then every bullet (`coreConceptTerms`). Unfolding one concept cannot move a marker in another.
  const marked = useMemo(() => coreConceptTerms(chapter), [chapter]);
  if (!chapter.coreConcepts || chapter.coreConcepts.length === 0) return null;
  const compact = ctx.chapterLevel === 'beginner';
  const prose = (text: string) => (
    <RichText text={text} onNavigateChapter={ctx.onNavigateChapter} onSearchGlossary={ctx.onSearchGlossary} />
  );
  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            💡
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
              แนวคิดหลัก (Core Concepts)
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              แนวคิดที่ใช้จริงในงาน ({chapter.coreConcepts.length} หัวข้อ)
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 space-y-3.5 border-t border-neutral-100 dark:border-[#262626] bg-white dark:bg-[#141414]">
          {chapter.coreConcepts.map((concept, cIdx) => {
            const inline = getInlineSectionsAt(chapter, 'coreConcepts', cIdx);
            const bulletCount = concept.bulletPoints?.length ?? 0;
            const hasMore = bulletCount > 0 || inline.length > 0;
            const showMore = !compact || !!moreOpen[cIdx];
            return (
            <React.Fragment key={cIdx}>
              <div
                className="p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-2"
              >
                <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white inline-block"></span>
                  <span>{concept.heading}</span>
                </div>
                <p data-concept-detail={cIdx} className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3] leading-relaxed pl-3 font-normal">
                  {prose(marked[cIdx].detail)}
                </p>
                {compact && hasMore && (
                  <button
                    type="button"
                    data-concept-more={cIdx}
                    aria-expanded={!!moreOpen[cIdx]}
                    onClick={() => setMore({ chapterId: chapter.id, open: { ...moreOpen, [cIdx]: !moreOpen[cIdx] } })}
                    className="ml-3 -my-3.5 py-3.5 sm:my-0 sm:py-0 inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-neutral-700 dark:text-[#d4d4d4] underline underline-offset-2 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                  >
                    {moreOpen[cIdx] ? 'ซ่อนรายละเอียด' : bulletCount > 0 ? `ดูรายละเอียด (${bulletCount} ข้อ)` : 'ดูรายละเอียด'}
                  </button>
                )}
                {showMore && concept.bulletPoints && concept.bulletPoints.length > 0 && (
                  <ul className="pt-1 pl-7 space-y-1.5 list-disc text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3] font-normal">
                    {concept.bulletPoints.map((_, bpIdx) => (
                      <li key={bpIdx} className="leading-relaxed">{prose(marked[cIdx].bulletPoints[bpIdx])}</li>
                    ))}
                  </ul>
                )}
              </div>
              {showMore && (
                <InlineSections
                  sections={inline}
                  onNavigateChapter={ctx.onNavigateChapter}
                />
              )}
            </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
