import React, { useMemo, useState } from 'react';
import { getInlineSectionsAt } from '../../../data/sectionLayers';
import { InlineSections } from '../InlineSections';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';
import { RichText } from '../../content/RichText';
import { coreConceptTerms } from '../../../lib/sectionTerms';

export const CoreConceptsSection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
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
    <SectionShell {...props} sectionKey="coreConcepts" note={`${chapter.coreConcepts.length} หัวข้อ`}>
      <div className="space-y-6">
        {chapter.coreConcepts.map((concept, cIdx) => {
          const inline = getInlineSectionsAt(chapter, 'coreConcepts', cIdx);
          const bulletCount = concept.bulletPoints?.length ?? 0;
          const hasMore = bulletCount > 0 || inline.length > 0;
          const showMore = !compact || !!moreOpen[cIdx];
          return (
            <div key={cIdx}>
              <h3 className="font-semibold text-base-content">{concept.heading}</h3>
              <p data-concept-detail={cIdx} className="mt-1">{prose(marked[cIdx].detail)}</p>
              {compact && hasMore && (
                <button
                  type="button"
                  data-concept-more={cIdx}
                  aria-expanded={!!moreOpen[cIdx]}
                  onClick={() => setMore({ chapterId: chapter.id, open: { ...moreOpen, [cIdx]: !moreOpen[cIdx] } })}
                  className="-my-3.5 py-3.5 sm:my-0 sm:py-0 mt-1 cursor-pointer text-sm text-base-content-muted underline decoration-base-border underline-offset-4 hover:text-base-content"
                >
                  {moreOpen[cIdx] ? 'พับเก็บ' : bulletCount > 0 ? `ดูรายละเอียด ${bulletCount} ข้อ` : 'ดูรายละเอียด'}
                </button>
              )}
              {showMore && bulletCount > 0 && (
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {marked[cIdx].bulletPoints.map((point, bpIdx) => <li key={bpIdx}>{prose(point)}</li>)}
                </ul>
              )}
              {showMore && (
                <InlineSections className="mt-4" sections={inline} onNavigateChapter={ctx.onNavigateChapter} />
              )}
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
};
