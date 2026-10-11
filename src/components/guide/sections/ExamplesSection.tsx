import React from 'react';
import { Lightbulb } from 'lucide-react';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';
import { DialogueCompare } from './DialogueCompare';

/** Real examples: the workplace dialogue first, then the company cases (spec A3). */
export const ExamplesSection: React.FC<SectionProps> = props => {
  const { chapter } = props;
  const cases = chapter.realWorldExamples ?? [];
  if (cases.length === 0 && !chapter.dialogueExample) return null;
  // A part is dropped when the chapter lacks it, like the practice counts.
  const note = [chapter.dialogueExample ? 'บทสนทนา' : null, cases.length > 0 ? `${cases.length} เคส` : null].filter(Boolean).join(' · ');
  return (
    <SectionShell {...props} sectionKey="examples" note={note}>
        <div className="space-y-5">
          {chapter.dialogueExample && (
            <div className="space-y-2.5" data-examples-dialogue>
              <h4 className="text-xs sm:text-sm font-bold text-base-content">บทสนทนาในที่ทำงาน</h4>
              <DialogueCompare chapter={chapter} />
            </div>
          )}
          {cases.length > 0 && (
            <div className="space-y-2.5" data-examples-cases>
              <h4 className="text-xs sm:text-sm font-bold text-base-content">เคสจริงจากบริษัท</h4>
              <div className="space-y-3.5">
                {cases.map((ex, eIdx) => (
                  <div
                    key={eIdx}
                    className="p-box-dense rounded-box bg-base-300 border border-base-border space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-bold text-xs sm:text-sm text-base-content flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-base-border text-base-content-body text-[10px] font-bold">
                          {ex.companyOrIndustry}
                        </span>
                        <span>{ex.title}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="p-3 rounded-xl bg-base-100 border border-base-border space-y-1">
                        <span className="font-bold text-base-content text-xs flex items-center gap-1.5">
                          📌 โจทย์ตั้งต้น:
                        </span>
                        <p className="text-base-content-secondary leading-relaxed text-xs">
                          {ex.situation}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-error/10 border border-error/40 space-y-1">
                        <span className="font-bold text-error text-xs flex items-center gap-1.5">
                          ⚠️ สิ่งที่เกิดขึ้น / จุดสะดุด:
                        </span>
                        <p className="text-error leading-relaxed text-xs">
                          {ex.whatHappened}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-success/10 border border-success/40 space-y-1 text-xs sm:text-sm">
                      <span className="font-bold text-success text-xs flex items-center gap-1.5">
                        ✅ แก้ยังไง:
                      </span>
                      <p className="text-base-content-body leading-relaxed text-xs font-normal">
                        {ex.resolution}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-base-300 border border-base-border text-xs text-base-content-body flex items-center gap-2 font-medium">
                      <Lightbulb className="w-4 h-4 text-warning shrink-0" />
                      <span><b>บทเรียนสำคัญ:</b> {ex.keyLesson}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
    </SectionShell>
  );
};
