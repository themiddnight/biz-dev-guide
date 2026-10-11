import React, { useMemo } from 'react';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';
import { RichText } from '../../content/RichText';
import { jargonTerms } from '../../../lib/sectionTerms';

export const JargonSection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
  // Each term marked once in this block (spec P3.5), never a row's own subject; computed purely
  // from the chapter. `meetingExample` is spoken dialogue and is marked like prose (D21).
  const marked = useMemo(() => jargonTerms(chapter), [chapter]);
  if (!chapter.jargonList || chapter.jargonList.length === 0) return null;
  const rich = (text: string) => (
    <RichText text={text} onNavigateChapter={ctx.onNavigateChapter} onSearchGlossary={ctx.onSearchGlossary} />
  );
  return (
    <SectionShell {...props} sectionKey="jargon" note={`${chapter.jargonList.length} คำ`}>
      <dl className="divide-y divide-base-border">
        {chapter.jargonList.map((item, jIdx) => (
          <div key={jIdx} className="grid gap-x-6 gap-y-1 py-4 first:pt-0 last:pb-0 sm:grid-cols-[11rem_1fr]">
            <dt className="font-semibold text-base-content">{item.term}</dt>
            <dd className="min-w-0 space-y-2">
              <p>{rich(marked[jIdx].humanTranslation)}</p>
              {item.formalDefinition && (
                <p className="text-sm text-base-content-muted">{rich(marked[jIdx].formalDefinition ?? item.formalDefinition)}</p>
              )}
              {item.meetingExample && (
                <p className="text-base-content-secondary">{rich(marked[jIdx].meetingExample ?? item.meetingExample)}</p>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </SectionShell>
  );
};
