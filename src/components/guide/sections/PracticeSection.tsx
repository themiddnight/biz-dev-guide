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
  // A count is dropped when its list is empty.
  const counts = [steps > 0 ? `${steps} ขั้นตอน` : null, items > 0 ? `เช็กลิสต์ ${items} ข้อ` : null].filter(Boolean).join(' และ');
  return (
    <SectionShell {...props} sectionKey="practice" note={counts}>
      {steps > 0 && (
        <div data-practice-steps>
          <WorkflowSteps chapter={chapter} />
        </div>
      )}
      {items > 0 && (
        <div data-practice-checklist className={steps > 0 ? 'mt-7 border-t border-base-border pt-5' : ''}>
          <h3 className="font-semibold text-base-content">เช็กลิสต์ก่อนส่งต่องาน</h3>
          <div className="mt-1">
            <ChecklistItems chapter={chapter} ctx={ctx} />
          </div>
        </div>
      )}
    </SectionShell>
  );
};
