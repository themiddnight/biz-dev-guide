import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import type { Chapter } from '../../../types';
import type { GuideSectionContext } from './registry';

type ChecklistCtx = Pick<GuideSectionContext, 'checkedChecklist' | 'onToggleChecklistItem'>;

/** Checklist items, body only; hosted by PracticeSection. Item keys stay `${chapter.id}_cl_${idx}` (spec A2). */
export const ChecklistItems: React.FC<{ chapter: Chapter; ctx: ChecklistCtx }> = ({ chapter, ctx }) => {
  if (!chapter.checklist || chapter.checklist.length === 0) return null;
  return (
    <div className="space-y-1.5 text-xs">
      {chapter.checklist.map((item, idx) => {
        const itemKey = `${chapter.id}_cl_${idx}`;
        const isChecked = !!ctx.checkedChecklist[itemKey];
        return (
          <div
            key={idx}
            onClick={() => ctx.onToggleChecklistItem(itemKey)}
            className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
              isChecked
                ? 'bg-base-300 text-base-content-muted line-through opacity-80'
                : 'hover:bg-base-300 text-base-content-body'
            }`}
          >
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-success shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4 h-4 text-base-content-muted shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed font-normal">{item}</span>
          </div>
        );
      })}
    </div>
  );
};
