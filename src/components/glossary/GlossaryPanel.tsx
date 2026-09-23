import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Chapter } from '../../types';
import { GLOSSARY_CATEGORIES, GlossaryCategory, GlossaryTerm, sortTermsForRole, termSide } from '../../data/glossary';
import { ROLES, type Role } from '../../data/rolePerspective';
import { RichText } from '../content/RichText';
import { searchGlossaryTerms } from '../../lib/glossarySearch';
import { TAP_GAP, TAP_POSITIONED } from '../ui/tapTarget';
import { Button } from '../ui/Button';
import { ToggleChip } from '../ui/ToggleChip';
import { cn } from '../ui/cn';
import { fieldClass } from '../ui/Input';

export type GlossaryFilter = GlossaryCategory | 'all';

/** Side chip labels (spec P4.4). */
const SIDE_LABEL: Record<Role, string> = { biz: 'ศัพท์ฝั่ง Business', eng: 'ศัพท์ฝั่ง Engineering' };

interface GlossaryPanelProps {
  terms: GlossaryTerm[];
  chapters: Chapter[];
  onNavigateChapter: (chapterId: string) => void;
  /** Uncontrolled starting category (ignored when `category` is supplied). */
  initialCategory?: GlossaryFilter;
  /** Controlled category, lifted so GlossaryCategoryMap can set it. */
  category?: GlossaryFilter;
  onCategoryChange?: (category: GlossaryFilter) => void;
  /** Controlled search query, lifted so other chapters can prefill it (s11 FAQ concept chips). */
  query?: string;
  onQueryChange?: (query: string) => void;
  /** Reader's role: the other side's terms are listed first. Null keeps the source order. */
  role?: Role | null;
}

export const GlossaryPanel: React.FC<GlossaryPanelProps> = ({
  terms,
  chapters,
  onNavigateChapter,
  initialCategory = 'all',
  category,
  onCategoryChange,
  query: controlledQuery,
  onQueryChange,
  role = null,
}) => {
  const [localQuery, setLocalQuery] = useState('');
  const query = controlledQuery ?? localQuery;

  const setQuery = (next: string) => {
    if (controlledQuery === undefined) setLocalQuery(next);
    onQueryChange?.(next);
  };
  const [localCategory, setLocalCategory] = useState<GlossaryFilter>(initialCategory);
  const activeCategory = category ?? localCategory;

  const setCategory = (next: GlossaryFilter) => {
    if (category === undefined) setLocalCategory(next);
    onCategoryChange?.(next);
  };

  const [side, setSide] = useState<Role | 'all'>('all');

  const sideCounts = useMemo(() => {
    const counts: Record<Role, number> = { biz: 0, eng: 0 };
    for (const term of terms) counts[termSide(term)] += 1;
    return counts;
  }, [terms]);

  const orderedTerms = useMemo(() => sortTermsForRole(terms, role), [terms, role]);

  // Category counts follow the active side filter, so a chip never promises terms it won't show.
  const categoryCounts = useMemo(() => {
    const counts = {} as Record<GlossaryCategory, number>;
    for (const cat of GLOSSARY_CATEGORIES) counts[cat.key] = 0;
    for (const term of terms) {
      if (side !== 'all' && termSide(term) !== side) continue;
      counts[term.category] += 1;
    }
    return counts;
  }, [terms, side]);

  const chapterNum = useMemo(() => {
    const map: Record<string, number> = {};
    for (const ch of chapters) map[ch.id] = ch.num;
    return map;
  }, [chapters]);

  const needle = query.trim().toLowerCase();
  // Filter and ranking live in `lib/glossarySearch` so the acceptance test asserts the panel's own order.
  const results = useMemo(
    () => searchGlossaryTerms(orderedTerms, { query: needle, side, category: activeCategory }),
    [orderedTerms, side, activeCategory, needle]
  );

  const clearFilters = () => {
    setQuery('');
    setCategory('all');
    setSide('all');
  };

  return (
    <div id="glossary-panel" className="space-y-4 scroll-mt-24">
      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content-muted pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="ค้นหาคำศัพท์ เช่น NFR, PjM, canary, ย้อนหลัง..."
          aria-label="ค้นหาคำศัพท์"
          className={cn(fieldClass(), 'pl-9 pr-9 py-2.5 text-xs sm:text-sm')}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="ล้างคำค้นหา"
            className={`${TAP_POSITIONED} absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-base-content-muted hover:text-base-content-body cursor-pointer`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Side chips: filter by the term's home side */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="กรองตามฝั่ง">
        {ROLES.map(r => (
          <ToggleChip
            key={r}
            data-glossary-side={r}
            selected={side === r}
            shape="chip"
            tap="gap-6"
            onClick={() => setSide(side === r ? 'all' : r)}
          >
            {SIDE_LABEL[r]} ({sideCounts[r]})
          </ToggleChip>
        ))}
      </div>

      {/* Category chips: scroll horizontally on mobile, wrap from sm */}
      <div className="flex flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 max-sm:-mt-2.5 max-sm:pt-2.5 max-sm:-mb-2.5 max-sm:pb-3.5 -mx-1 px-1">
        <ToggleChip selected={activeCategory === 'all'} shape="chip" tap="gap-6" onClick={() => setCategory('all')}>
          ทั้งหมด ({side === 'all' ? terms.length : sideCounts[side]})
        </ToggleChip>
        {GLOSSARY_CATEGORIES.map(cat => (
          <ToggleChip
            key={cat.key}
            title={cat.labelTh}
            selected={activeCategory === cat.key}
            shape="chip"
            tap="gap-6"
            onClick={() => setCategory(activeCategory === cat.key ? 'all' : cat.key)}
          >
            {cat.label} ({categoryCounts[cat.key]})
          </ToggleChip>
        ))}
      </div>

      <p className="text-[11px] sm:text-xs text-base-content-muted" aria-live="polite">
        แสดง {results.length} จาก {terms.length} คำ
      </p>

      {results.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-base-border-strong text-center space-y-3">
          <p className="text-xs sm:text-sm text-base-content-secondary">ไม่พบคำที่ค้นหา</p>
          <Button color="neutral" variant="soft" size="sm" onClick={clearFilters}>
            ล้างตัวกรอง
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {results.map(term => (
            <div
              key={term.id}
              className="p-box rounded-xl bg-base-100 border border-base-border space-y-2 min-w-0"
            >
              <div className="text-xs sm:text-sm font-bold text-base-content leading-snug break-words">
                {term.term}
              </div>
              <p className="text-xs sm:text-sm text-base-content-secondary leading-relaxed break-words">
                <RichText text={term.definition} onNavigateChapter={onNavigateChapter} />
              </p>

              {term.plain && (
                <div className="p-2.5 rounded-lg border bg-business/10 border-business/25">
                  <div className="text-[10px] font-bold mb-0.5 text-business">พูดแบบบ้านๆ</div>
                  <p className="text-xs text-base-content-body leading-relaxed">
                    <RichText text={term.plain} onNavigateChapter={onNavigateChapter} />
                  </p>
                </div>
              )}

              {term.example && (
                <p className="text-[11px] sm:text-xs text-base-content-muted leading-relaxed italic border-l-2 border-base-border-strong pl-2.5">
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
                      className={`${TAP_GAP[6]} px-2 py-0.5 rounded-md bg-base-300 border border-base-border text-[10px] sm:text-[11px] font-semibold text-base-content-body hover:bg-base-border cursor-pointer transition-colors`}
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
