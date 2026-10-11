import React from 'react';
import type { Chapter } from '../../../types';
import type { GuideSectionContext } from './registry';
import { Prose } from './Prose';

type ChecklistCtx = Pick<GuideSectionContext, 'checkedChecklist' | 'onToggleChecklistItem' | 'onNavigateChapter' | 'onSearchGlossary'>;

/**
 * Checklist items, body only; hosted by PracticeSection. Item keys stay `${chapter.id}_cl_${idx}`
 * (spec A2). `items` are the checklist lines as `practiceTerms` marked them, in order.
 */
export const ChecklistItems: React.FC<{ chapter: Chapter; items: readonly string[]; ctx: ChecklistCtx }> = ({ chapter, items, ctx }) => {
  if (items.length === 0) return null;
  return (
    <ul>
      {items.map((item, idx) => {
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
              <span className={isChecked ? 'text-base-content-muted line-through' : ''}><Prose text={item} ctx={ctx} /></span>
            </label>
          </li>
        );
      })}
    </ul>
  );
};
