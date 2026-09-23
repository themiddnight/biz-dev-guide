import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';

export const WorkflowSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  /* SECTION 6: ขั้นตอนการทำงานจริง (Real-World Workflow) */
  if (!chapter.realWorldWorkflow || chapter.realWorldWorkflow.length === 0) return null;
  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            🔄
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
              ขั้นตอนทำงานจริง (Real-World Workflow)
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              งานส่งต่อกันระหว่างฝ่ายทีละขั้น ({chapter.realWorldWorkflow.length} ขั้น)
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-neutral-100 dark:border-[#262626] bg-white dark:bg-[#141414]">
          {chapter.realWorldWorkflow.map((wf, wIdx) => (
            <div
              key={wIdx}
              className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-neutral-900 dark:text-[#fafafa] text-xs sm:text-sm">{wf.step}</span>
                <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-[#262626] text-neutral-800 dark:text-[#d4d4d4] font-semibold text-[10px] sm:text-[11px]">
                  {wf.role}
                </span>
              </div>
              <p className="text-neutral-600 dark:text-[#a3a3a3] leading-relaxed font-normal">
                {wf.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
