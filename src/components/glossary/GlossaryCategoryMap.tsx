import React, { useMemo } from 'react';
import { GLOSSARY_CATEGORIES, GlossaryCategory, GlossaryTerm } from '../../data/glossary';
import type { GlossaryFilter } from './GlossaryPanel';
import { ToggleChip } from '../ui/ToggleChip';

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
    <div className="p-box rounded-box bg-base-100 border border-base-border space-y-3">
      <p className="text-[11px] sm:text-xs text-base-content-muted">
        {GLOSSARY_CATEGORIES.length} หมวด รวม {terms.length} คำ — กดหมวดเพื่อกรองคำศัพท์
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {GLOSSARY_CATEGORIES.map(cat => {
          const active = activeCategory === cat.key;
          return (
            <ToggleChip
              selected={active}
              shape="card"
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className="p-3 min-w-0"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold leading-snug text-base-content">
                  {cat.label}
                </span>
                <span
                  className={`shrink-0 text-[11px] font-bold ${
                    active ? 'opacity-80' : 'text-base-content-muted'
                  }`}
                >
                  {counts[cat.key]}
                </span>
              </div>
              <div
                className={`mt-1 text-[10px] sm:text-[11px] leading-snug break-words ${
                  active ? 'opacity-80' : 'text-base-content-muted'
                }`}
              >
                {cat.labelTh}
              </div>
            </ToggleChip>
          );
        })}
      </div>
    </div>
  );
};
