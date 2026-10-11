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
    <div className="space-y-3">
      <p className="text-sm text-base-content-muted">
        มี {GLOSSARY_CATEGORIES.length} หมวด รวม {terms.length} คำ กดที่หมวดเพื่อกรองคำศัพท์
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
              {/* One block child: the chip is an inline-flex row, and the two lines must stack and wrap inside the tile. */}
              <span className="block w-full min-w-0">
                <span className="flex items-start justify-between gap-2">
                  <span className="min-w-0 break-words text-sm font-semibold leading-snug text-base-content">{cat.label}</span>
                  <span className={`shrink-0 text-sm ${active ? 'opacity-80' : 'text-base-content-muted'}`}>{counts[cat.key]}</span>
                </span>
                <span className={`mt-1 block break-words text-sm font-normal leading-snug ${active ? 'opacity-80' : 'text-base-content-muted'}`}>
                  {cat.labelTh}
                </span>
              </span>
            </ToggleChip>
          );
        })}
      </div>
    </div>
  );
};
