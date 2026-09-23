import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';

export const WorkflowSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  /* SECTION 6: ขั้นตอนการทำงานจริง (Real-World Workflow) */
  if (!chapter.realWorldWorkflow || chapter.realWorldWorkflow.length === 0) return null;
  return (
    <div className="border border-base-border rounded-2xl overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-base-300 hover:bg-base-300 text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            🔄
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              ขั้นตอนทำงานจริง (Real-World Workflow)
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              งานส่งต่อกันระหว่างฝ่ายทีละขั้น ({chapter.realWorldWorkflow.length} ขั้น)
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-base-border bg-base-100">
          {chapter.realWorldWorkflow.map((wf, wIdx) => (
            <div
              key={wIdx}
              className="p-3.5 rounded-xl bg-base-300 border border-base-border space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-base-content text-xs sm:text-sm">{wf.step}</span>
                <span className="px-2 py-0.5 rounded-md bg-base-border text-base-content-body font-semibold text-[10px] sm:text-[11px]">
                  {wf.role}
                </span>
              </div>
              <p className="text-base-content-secondary leading-relaxed font-normal">
                {wf.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
