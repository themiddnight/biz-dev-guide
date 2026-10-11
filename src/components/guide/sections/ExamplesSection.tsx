import React from 'react';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';
import { DialogueCompare } from './DialogueCompare';

const LABEL = 'font-semibold text-base-content';

/** Real examples: the workplace dialogue first, then the company cases (spec A3). */
export const ExamplesSection: React.FC<SectionProps> = props => {
  const { chapter } = props;
  const cases = chapter.realWorldExamples ?? [];
  if (cases.length === 0 && !chapter.dialogueExample) return null;
  // A part is dropped when the chapter lacks it, like the practice counts.
  const note = [chapter.dialogueExample ? 'บทสนทนา' : null, cases.length > 0 ? `${cases.length} เคส` : null].filter(Boolean).join(' และ ');
  return (
    <SectionShell {...props} sectionKey="examples" note={note}>
      {chapter.dialogueExample && (
        <div data-examples-dialogue>
          <DialogueCompare chapter={chapter} />
        </div>
      )}
      {cases.length > 0 && (
        <div data-examples-cases className={chapter.dialogueExample ? 'mt-7 border-t border-base-border pt-5' : ''}>
          <div className="divide-y divide-base-border">
            {cases.map((ex, eIdx) => (
              <div key={eIdx} className="space-y-2 py-5 first:pt-0 last:pb-0">
                <h3 className="font-semibold text-base-content">{ex.title}</h3>
                <p className="text-sm text-base-content-muted">{ex.companyOrIndustry}</p>
                <p><span className={LABEL}>โจทย์</span> {ex.situation}</p>
                <p><span className={LABEL}>สิ่งที่เกิดขึ้น</span> {ex.whatHappened}</p>
                <p><span className={LABEL}>แก้ยังไง</span> {ex.resolution}</p>
                <p><span className={LABEL}>บทเรียน</span> {ex.keyLesson}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </SectionShell>
  );
};
