import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';
import { IconBadge } from '../../ui/IconBadge';
import { WorkflowSteps } from './WorkflowSteps';
import { ChecklistItems } from './ChecklistItems';

/** Hands-on practice: the workflow steps, then the pre-handoff checklist (spec A2). */
export const PracticeSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  const steps = chapter.realWorldWorkflow?.length ?? 0;
  const items = chapter.checklist?.length ?? 0;
  if (steps === 0 && items === 0) return null;
  // A count part is dropped when its list is empty.
  const counts = [steps > 0 ? `${steps} ขั้น` : null, items > 0 ? `${items} ข้อ` : null].filter(Boolean).join(' · ');
  return (
    <div className="border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-box flex items-center justify-between bg-base-300 hover:bg-base-border text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <IconBadge size="md">🛠️</IconBadge>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              ลงมือทำ: ขั้นตอนงานและเช็กลิสต์
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              {`ส่งต่องานทีละขั้น แล้วเช็กให้ครบก่อนส่ง (${counts})`}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-box space-y-5 border-t border-base-border bg-base-100">
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
      )}
    </div>
  );
};
