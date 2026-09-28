import React from 'react';
import type { Chapter } from '../../../types';

/** Workflow steps, body only; hosted by PracticeSection (spec A2). */
export const WorkflowSteps: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  if (!chapter.realWorldWorkflow || chapter.realWorldWorkflow.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
  );
};
