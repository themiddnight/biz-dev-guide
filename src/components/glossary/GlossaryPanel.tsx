import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Chapter } from '../../types';
import { GLOSSARY_CATEGORIES, GlossaryCategory, GlossaryTerm } from '../../data/glossary';
import { tokens } from '../../styles/tokens';
import { RichText } from '../content/RichText';

export type GlossaryFilter = GlossaryCategory | 'all';

interface GlossaryPanelProps {
  terms: GlossaryTerm[];
  chapters: Chapter[];
  onNavigateChapter: (chapterId: string) => void;
  /** Uncontrolled starting category (ignored when `category` is supplied). */
  initialCategory?: GlossaryFilter;
  /** Controlled category, lifted so GlossaryCategoryMap can set it. */
  category?: GlossaryFilter;
  onCategoryChange?: (category: GlossaryFilter) => void;
}

const chipClass = (active: boolean) =>
  `shrink-0 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
    active
      ? 'bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] shadow-xs'
      : 'bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-600 dark:text-[#a3a3a3] hover:bg-neutral-200 dark:hover:bg-[#262626]'
  }`;

/** Search text for a RichText string: chapter-link markup reduced to its label, bold markers removed. */
const plainText = (text: string) => text.replace(/\[\[s\d+\|([^\]]+)\]\]/g, '$1').replace(/\*\*/g, '');

export const GlossaryPanel: React.FC<GlossaryPanelProps> = ({
  terms,
  chapters,
  onNavigateChapter,
  initialCategory = 'all',
  category,
  onCategoryChange,
}) => {
  const [query, setQuery] = useState('');
  const [localCategory, setLocalCategory] = useState<GlossaryFilter>(initialCategory);
  const activeCategory = category ?? localCategory;

  const setCategory = (next: GlossaryFilter) => {
    if (category === undefined) setLocalCategory(next);
    onCategoryChange?.(next);
  };

  const categoryCounts = useMemo(() => {
    const counts = {} as Record<GlossaryCategory, number>;
    for (const cat of GLOSSARY_CATEGORIES) counts[cat.key] = 0;
    for (const term of terms) counts[term.category] += 1;
    return counts;
  }, [terms]);

  const chapterNum = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ch of chapters) map[ch.id] = ch.num;
    return map;
  }, [chapters]);

  const needle = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      terms.filter(term => {
        if (activeCategory !== 'all' && term.category !== activeCategory) return false;
        if (!needle) return true;
        const haystack = [term.term, ...(term.aliases ?? []), plainText(term.definition), term.plain ? plainText(term.plain) : '']
          .join('\n')
          .toLowerCase();
        return haystack.includes(needle);
      }),
    [terms, activeCategory, needle]
  );

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
  };

  return (
    <div id="glossary-panel" className="space-y-4 scroll-mt-24">
      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-[#737373] pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ค้นหาคำศัพท์ เช่น NFR, PjM, canary, ย้อนหลัง..."
          aria-label="ค้นหาคำศัพท์ในคลังคำศัพท์"
          className={`${tokens.colors.input} w-full rounded-xl pl-9 pr-9 py-2.5 text-xs sm:text-sm`}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="ล้างคำค้นหา"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:text-[#737373] dark:hover:text-[#d4d4d4] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category chips: scroll horizontally on mobile, wrap from sm */}
      <div className="flex flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 -mx-1 px-1">
        <button type="button" onClick={() => setCategory('all')} aria-pressed={activeCategory === 'all'} className={chipClass(activeCategory === 'all')}>
          ทั้งหมด ({terms.length})
        </button>
        {GLOSSARY_CATEGORIES.map(cat => (
          <button
            key={cat.key}
            type="button"
            title={cat.labelTh}
            aria-pressed={activeCategory === cat.key}
            onClick={() => setCategory(activeCategory === cat.key ? 'all' : cat.key)}
            className={chipClass(activeCategory === cat.key)}
          >
            {cat.label} ({categoryCounts[cat.key]})
          </button>
        ))}
      </div>

      <p className="text-[11px] sm:text-xs font-mono text-neutral-500 dark:text-[#8e8e8e]" aria-live="polite">
        แสดง {results.length} จาก {terms.length} คำ
      </p>

      {results.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-neutral-300 dark:border-[#333333] text-center space-y-3">
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3]">ไม่พบคำที่ค้นหา</p>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] text-xs font-bold cursor-pointer"
          >
            ล้างตัวกรอง
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map(term => (
            <div
              key={term.id}
              className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] space-y-2 min-w-0"
            >
              <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa] leading-snug break-words">
                {term.term}
              </div>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3] leading-relaxed break-words">
                <RichText text={term.definition} onNavigateChapter={onNavigateChapter} />
              </p>

              {term.plain && (
                <div className={`p-2.5 rounded-lg border ${tokens.colors.accent.business.bg} ${tokens.colors.accent.business.border}`}>
                  <div className={`text-[10px] font-bold mb-0.5 ${tokens.colors.accent.business.text}`}>พูดแบบบ้านๆ</div>
                  <p className="text-xs text-neutral-700 dark:text-[#d4d4d4] leading-relaxed">
                    <RichText text={term.plain} onNavigateChapter={onNavigateChapter} />
                  </p>
                </div>
              )}

              {term.example && (
                <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] leading-relaxed italic border-l-2 border-neutral-300 dark:border-[#333333] pl-2.5">
                  {term.example}
                </p>
              )}

              {term.relatedChapterIds.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {term.relatedChapterIds.map(chId => (
                    <button
                      key={chId}
                      type="button"
                      onClick={() => onNavigateChapter(chId)}
                      className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#262626] text-[10px] sm:text-[11px] font-mono font-semibold text-neutral-700 dark:text-[#d4d4d4] hover:bg-neutral-200 dark:hover:bg-[#262626] cursor-pointer transition-colors"
                    >
                      บทที่ {chapterNum[chId] ?? chId.replace('s', '')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
