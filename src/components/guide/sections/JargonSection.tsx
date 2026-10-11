import React, { useMemo } from 'react';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';
import { RichText } from '../../content/RichText';
import { jargonTerms } from '../../../lib/sectionTerms';

export const JargonSection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
  // Each term marked once in this block (spec P3.5), never a card's own subject; computed purely
  // from the chapter. `meetingExample` is spoken dialogue and is marked like prose (D21).
  const marked = useMemo(() => jargonTerms(chapter), [chapter]);
  if (!chapter.jargonList || chapter.jargonList.length === 0) return null;
  const rich = (text: string) => (
    <RichText text={text} onNavigateChapter={ctx.onNavigateChapter} onSearchGlossary={ctx.onSearchGlossary} />
  );
  return (
    <SectionShell {...props} sectionKey="jargon" note={`${chapter.jargonList.length} คำ`}>
        <div className="grid grid-cols-1 gap-3">
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
    </SectionShell>
  );
};
