import React, { useEffect, useRef } from 'react';
import type { Chapter } from '../../types';
import { LAYER_META, SECTION_META, sectionHasTool, type LayerGroup, type OpenState, type SectionKey } from '../../data/sectionLayers';

interface SectionOutlineProps {
  chapter: Chapter;
  layout: LayerGroup[];
  openState: OpenState;
  onSelectSection: (key: SectionKey) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const SectionOutline: React.FC<SectionOutlineProps> = ({ chapter, layout, openState, onSelectSection, onExpandAll, onCollapseAll }) => {
  const barRef = useRef<HTMLDivElement>(null);

  // Publish the bar height as --outline-h so anchor targets clear it (spec §2.2).
  useEffect(() => {
    const bar = barRef.current;
    const root = document.documentElement;
    if (!bar) return;
    const update = () => root.style.setProperty('--outline-h', `${Math.ceil(bar.getBoundingClientRect().height)}px`);
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(bar);
    return () => {
      observer?.disconnect();
      root.style.setProperty('--outline-h', '0px');
    };
  }, []);

  return (
    <div
      ref={barRef}
      data-section-outline
      className="sticky z-30 -mx-4 sm:-mx-6 lg:-mx-7 px-4 sm:px-6 lg:px-7 py-2 bg-white dark:bg-[#141414] border-b border-neutral-200 dark:border-[#262626]"
      style={{ top: 'var(--header-h)' }}
    >
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-1.5 overflow-x-auto">
        {layout.filter(g => g.sections.length > 0).map(group => (
          <React.Fragment key={group.layer}>
            <span data-outline-layer={group.layer} className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-[#737373] font-mono">
              {LAYER_META[group.layer].short}
            </span>
            {group.sections.map(key => {
              const open = !!openState.sections[key] && openState.layers[group.layer];
              return (
                <button
                  key={key}
                  type="button"
                  data-outline-chip={key}
                  aria-controls={`sec-${key}`}
                  aria-pressed={open}
                  onClick={() => onSelectSection(key)}
                  className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                    open
                      ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-[#0a0a0a] dark:border-white'
                      : 'bg-transparent text-neutral-700 border-neutral-200 dark:text-[#d4d4d4] dark:border-[#333333]'
                  }`}
                >
                  {SECTION_META[key].chip}
                  {sectionHasTool(chapter, key) && (
                    <span data-tool-tag className="ml-1.5 px-1.5 py-px rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px]">
                      ลองเล่น
                    </span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
        <span className="shrink-0 ml-auto flex items-center gap-2 pl-2 text-xs">
          <button type="button" onClick={onExpandAll} className="text-neutral-800 dark:text-[#d4d4d4] hover:underline font-semibold cursor-pointer">ขยายทั้งหมด</button>
          <span className="text-neutral-300 dark:text-[#333333]">|</span>
          <button type="button" onClick={onCollapseAll} className="text-neutral-500 dark:text-[#737373] hover:underline font-semibold cursor-pointer">ย่อทั้งหมด</button>
        </span>
      </div>
    </div>
  );
};
