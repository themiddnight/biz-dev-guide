import React from 'react';
import type { Chapter } from '../../../types';
import type { GuideSectionContext } from './registry';

type ChecklistCtx = Pick<GuideSectionContext, 'checkedChecklist' | 'onToggleChecklistItem'>;

/** Checklist items, body only; hosted by PracticeSection. Item keys stay `${chapter.id}_cl_${idx}` (spec A2). */
export const ChecklistItems: React.FC<{ chapter: Chapter; ctx: ChecklistCtx }> = ({ chapter, ctx }) => {
  if (!chapter.checklist || chapter.checklist.length === 0) return null;
  return (
    <ul>
      {chapter.checklist.map((item, idx) => {
        const itemKey = `${chapter.id}_cl_${idx}`;
        const isChecked = !!ctx.checkedChecklist[itemKey];
        return (
          <li key={idx}>
            {/* py-2 around a 28px line makes each row a 44px tap target. */}
            <label className="flex cursor-pointer items-start gap-3 py-2">
              <input
                type="checkbox"
                className="mt-1.5 size-4 shrink-0 accent-current"
                checked={isChecked}
                onChange={() => ctx.onToggleChecklistItem(itemKey)}
              />
              <span className={isChecked ? 'text-base-content-muted line-through' : ''}>{item}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
};
