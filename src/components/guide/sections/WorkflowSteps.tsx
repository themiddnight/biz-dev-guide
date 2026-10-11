import React from 'react';
import type { Chapter } from '../../../types';
import { Prose, type ProseCtx } from './Prose';

/**
 * Workflow steps, body only; hosted by PracticeSection (spec A2). `descriptions` are the steps'
 * descriptions as `practiceTerms` marked them, in step order.
 */
export const WorkflowSteps: React.FC<{ chapter: Chapter; descriptions: readonly string[]; ctx: ProseCtx }> = ({ chapter, descriptions, ctx }) => {
  if (!chapter.realWorldWorkflow || chapter.realWorldWorkflow.length === 0) return null;
  return (
    <ol className="space-y-4">
      {chapter.realWorldWorkflow.map((wf, wIdx) => (
        <li key={wIdx}>
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-semibold text-base-content">{wf.step}</span>
            <span className="text-sm text-base-content-muted">{wf.role}</span>
          </p>
          <p><Prose text={descriptions[wIdx]} ctx={ctx} /></p>
        </li>
      ))}
    </ol>
  );
};
