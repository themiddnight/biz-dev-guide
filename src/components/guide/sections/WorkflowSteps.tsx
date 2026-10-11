import React from 'react';
import type { Chapter } from '../../../types';

/** Workflow steps, body only; hosted by PracticeSection (spec A2). */
export const WorkflowSteps: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  if (!chapter.realWorldWorkflow || chapter.realWorldWorkflow.length === 0) return null;
  return (
    <ol className="space-y-4">
      {chapter.realWorldWorkflow.map((wf, wIdx) => (
        <li key={wIdx}>
          <p className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-semibold text-base-content">{wf.step}</span>
            <span className="text-sm text-base-content-muted">{wf.role}</span>
          </p>
          <p>{wf.description}</p>
        </li>
      ))}
    </ol>
  );
};
