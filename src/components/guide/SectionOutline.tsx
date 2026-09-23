import React, { useEffect, useRef } from 'react';
import type { Chapter } from '../../types';
import { LAYER_META, SECTION_META, sectionHasTool, type LayerGroup, type OpenState, type SectionKey } from '../../data/sectionLayers';
import { SCROLL_ROOM, TAP } from '../ui/tapTarget';
import { ToggleChip } from '../ui/ToggleChip';

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
      className="sticky z-30 -mx-box-spacious px-box-spacious py-2 bg-base-100 border-b border-base-border"
      style={{ top: 'var(--header-h)' }}
    >
      <div className={`flex flex-nowrap sm:flex-wrap items-center gap-1.5 overflow-x-auto ${SCROLL_ROOM}`}>
        {layout.filter(g => g.sections.length > 0).map(group => (
          <React.Fragment key={group.layer}>
            <span data-outline-layer={group.layer} className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-base-content-muted">
              {LAYER_META[group.layer].short}
            </span>
            {group.sections.map(key => {
              const open = !!openState.sections[key] && openState.layers[group.layer];
              return (
                <ToggleChip
                  key={key}
                  selected={open}
                  shape="pill"
                  size="xs"
                  data-outline-chip={key}
                  aria-controls={`sec-${key}`}
                  onClick={() => onSelectSection(key)}
                  className="shrink-0"
                >
                  {SECTION_META[key].chip}
                  {sectionHasTool(chapter, key) && (
                    <span data-tool-tag className="ml-1.5 px-1.5 py-px rounded-full bg-success/10 text-success text-[10px]">
                      ลองเล่น
                    </span>
                  )}
                </ToggleChip>
              );
            })}
          </React.Fragment>
        ))}
        <span className="shrink-0 ml-auto flex items-center gap-2 pl-2 text-xs">
          <button type="button" onClick={onExpandAll} className={`${TAP} text-base-content-body hover:underline font-semibold cursor-pointer`}>ขยายทั้งหมด</button>
          <span className="text-base-content-subtle">|</span>
          <button type="button" onClick={onCollapseAll} className={`${TAP} text-base-content-muted hover:underline font-semibold cursor-pointer`}>ย่อทั้งหมด</button>
        </span>
      </div>
    </div>
  );
};
