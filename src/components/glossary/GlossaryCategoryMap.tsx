import React, { useMemo } from 'react';
import { GLOSSARY_CATEGORIES, GlossaryCategory, GlossaryTerm } from '../../data/glossary';
import type { GlossaryFilter } from './GlossaryPanel';

interface GlossaryCategoryMapProps {
  terms: GlossaryTerm[];
  activeCategory: GlossaryFilter;
  onSelectCategory: (category: GlossaryCategory) => void;
}

/** Tile grid of the glossary categories; shown in chapter 15's diagram section. */
export const GlossaryCategoryMap: React.FC<GlossaryCategoryMapProps> = ({ terms, activeCategory, onSelectCategory }) => {
  const counts = useMemo(() => {
    const map = {} as Record<GlossaryCategory, number>;
    for (const cat of GLOSSARY_CATEGORIES) map[cat.key] = 0;
    for (const term of terms) map[term.category] += 1;
    return map;
  }, [terms]);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] space-y-3">
      <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
        {GLOSSARY_CATEGORIES.length} หมวด รวม {terms.length} คำ — กดหมวดเพื่อกรองคลังคำศัพท์
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {GLOSSARY_CATEGORIES.map(cat => {
          const active = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onSelectCategory(cat.key)}
              aria-pressed={active}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer min-w-0 ${
                active
                  ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-[#0a0a0a]'
                  : 'bg-neutral-50 dark:bg-[#181818] border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-[#404040]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={`text-xs font-bold leading-snug ${active ? '' : 'text-neutral-900 dark:text-[#fafafa]'}`}>
                  {cat.label}
                </span>
                <span
                  className={`shrink-0 font-mono text-[11px] font-bold ${
                    active ? 'opacity-80' : 'text-neutral-500 dark:text-[#8e8e8e]'
                  }`}
                >
                  {counts[cat.key]}
                </span>
              </div>
              <div
                className={`mt-1 text-[10px] sm:text-[11px] leading-snug break-words ${
                  active ? 'opacity-80' : 'text-neutral-500 dark:text-[#8e8e8e]'
                }`}
              >
                {cat.labelTh}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
