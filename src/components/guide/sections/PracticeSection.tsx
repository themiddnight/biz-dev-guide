import React from 'react';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';
import { WorkflowSteps } from './WorkflowSteps';
import { ChecklistItems } from './ChecklistItems';

/** Hands-on practice: the workflow steps, then the pre-handoff checklist (spec A2). */
export const PracticeSection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
  const steps = chapter.realWorldWorkflow?.length ?? 0;
  const items = chapter.checklist?.length ?? 0;
  if (steps === 0 && items === 0) return null;
  // A count part is dropped when its list is empty.
  const counts = [steps > 0 ? `${steps} ขั้น` : null, items > 0 ? `${items} ข้อ` : null].filter(Boolean).join(' · ');
  return (
    <SectionShell {...props} sectionKey="practice" note={counts}>
        <div className="space-y-5">
          {steps > 0 && (
            <div className="space-y-2.5" data-practice-steps>
              <h4 className="text-xs sm:text-sm font-bold text-base-content">ขั้นตอนงาน</h4>
              <WorkflowSteps chapter={chapter} />
            </div>
          )}
          {items > 0 && (
            <div className="space-y-2.5" data-practice-checklist>
              <h4 className="text-xs sm:text-sm font-bold text-base-content">เช็กลิสต์ก่อนส่งต่องาน</h4>
              <ChecklistItems chapter={chapter} ctx={ctx} />
            </div>
          )}
        </div>
    </SectionShell>
  );
};
