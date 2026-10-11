import React, { useMemo } from 'react';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';
import { DialogueCompare } from './DialogueCompare';
import { Prose } from './Prose';
import { examplesTerms } from '../../../lib/sectionTerms';

const LABEL = 'font-semibold text-base-content';

/** Real examples: the workplace dialogue first, then the company cases (spec A3). */
export const ExamplesSection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
  // One first-occurrence walk for the whole section, computed purely from the chapter.
  const marked = useMemo(() => examplesTerms(chapter), [chapter]);
  const cases = chapter.realWorldExamples ?? [];
  if (cases.length === 0 && !marked.dialogue) return null;
  // A part is dropped when the chapter lacks it, like the practice counts.
  const note = [marked.dialogue ? 'บทสนทนา' : null, cases.length > 0 ? `${cases.length} เคส` : null].filter(Boolean).join(' และ ');
  return (
    <SectionShell {...props} sectionKey="examples" note={note}>
      {marked.dialogue && (
        <div data-examples-dialogue>
          <DialogueCompare dialogue={marked.dialogue} ctx={ctx} />
        </div>
      )}
      {cases.length > 0 && (
        <div data-examples-cases className={marked.dialogue ? 'mt-7 border-t border-base-border pt-5' : ''}>
          <div className="divide-y divide-base-border">
            {cases.map((ex, eIdx) => (
              <div key={eIdx} className="space-y-2 py-5 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-base-content">{ex.title}</h3>
                <p className="text-sm text-base-content-muted">{ex.companyOrIndustry}</p>
                <p><span className={LABEL}>โจทย์</span> <Prose text={marked.cases[eIdx].situation} ctx={ctx} /></p>
                <p><span className={LABEL}>สิ่งที่เกิดขึ้น</span> <Prose text={marked.cases[eIdx].whatHappened} ctx={ctx} /></p>
                <p><span className={LABEL}>แก้ยังไง</span> <Prose text={marked.cases[eIdx].resolution} ctx={ctx} /></p>
                <p><span className={LABEL}>บทเรียน</span> <Prose text={marked.cases[eIdx].keyLesson} ctx={ctx} /></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionShell>
  );
};
