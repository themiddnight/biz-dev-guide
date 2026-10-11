import React, { useEffect, useRef } from 'react';
import type { ExperienceLevel } from '../../types';
import { LAYER_LABEL, SECTION_LABEL, type LayerGroup, type OpenState, type SectionKey } from '../../data/sectionLayers';
import { formatChapterHash } from '../../lib/chapterRoute';
import type { LevelMode, Role } from '../../data/rolePerspective';
import { chapterLevelResetLabel, chapterLevelScopeLabel } from './rolePerspectiveUi';
import { SCROLL_ROOM, TAP_Y } from '../ui/tapTarget';
import { ScrollFade } from '../ui/ScrollFade';

const LEVELS: readonly { value: ExperienceLevel; label: string }[] = [
  { value: 'beginner', label: 'มือใหม่' },
  { value: 'experienced', label: 'คุ้นงานแล้ว' },
];

const LINK = 'cursor-pointer underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

/** The two-way level switch. Stateless, so a test can press its buttons without a DOM. */
export const LevelSwitch: React.FC<{ level: ExperienceLevel; onChange: (level: ExperienceLevel) => void }> = ({ level, onChange }) => (
  <span className="flex shrink-0 items-center gap-x-3 whitespace-nowrap" role="group" aria-label="ระดับการอ่าน">
    <span className="hidden text-base-content-muted sm:inline">อ่านแบบ</span>
    {LEVELS.map(option => (
      <button
        key={option.value}
        type="button"
        data-level={option.value}
        aria-pressed={level === option.value}
        onClick={() => onChange(option.value)}
        className={`${TAP_Y} py-0.5 ${
          level === option.value
            ? 'cursor-pointer font-semibold text-base-content'
            : `${LINK} text-base-content-muted decoration-base-border hover:text-base-content`
        }`}
      >
        {option.label}
      </button>
    ))}
  </span>
);

export interface ChapterLevelOverride { role: Role; levelMode: LevelMode; onReset: () => void }

interface ChapterControlRowProps {
  chapterNum: number;
  layout: LayerGroup[];
  openState: OpenState;
  level: ExperienceLevel;
  onLevelChange: (level: ExperienceLevel) => void;
  /** Set only while this chapter carries its own level, which is when the reset control shows. */
  levelOverride: ChapterLevelOverride | null;
  onSelectSection: (key: SectionKey) => void;
  onSetAllOpen: (open: boolean) => void;
}

/**
 * The one sticky row under the app header: a link to each section grouped by layer, the level
 * switch, and from `sm` up one control that opens or folds every section. Below `sm` the links
 * scroll sideways on one line; from `sm` they wrap, because nine links do not fit the 44rem column.
 */
export const ChapterControlRow: React.FC<ChapterControlRowProps> = ({
  chapterNum, layout, openState, level, onLevelChange, levelOverride, onSelectSection, onSetAllOpen,
}) => {
  const rowRef = useRef<HTMLElement>(null);

  // Anchor targets stop below the row: `.anchor-target` reads --outline-h (index.css).
  useEffect(() => {
    const row = rowRef.current;
    const root = document.documentElement;
    if (!row) return;
    const update = () => root.style.setProperty('--outline-h', `${Math.ceil(row.getBoundingClientRect().height)}px`);
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(row);
    return () => {
      observer?.disconnect();
      root.style.setProperty('--outline-h', '0px');
    };
  }, []);

  const groups = layout.filter(group => group.sections.length > 0);
  const foldable = groups.filter(group => group.layer !== 'core').flatMap(group => group.sections);
  const allOpen = foldable.every(key => openState.sections[key]);

  return (
    <nav
      ref={rowRef}
      data-control-row
      aria-label="หัวข้อในบทและระดับการอ่าน"
      className="sticky z-30 space-y-1 border-y border-base-border bg-base-100 py-3 text-sm leading-5 max-sm:-mx-box-spacious max-sm:px-box-spacious"
      style={{ top: 'var(--header-h)' }}
    >
      <div className="flex items-start gap-x-4">
        <ScrollFade
          wrapperClassName="min-w-0 flex-1"
          className={`flex items-center gap-x-5 gap-y-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] sm:flex-wrap sm:overflow-visible ${SCROLL_ROOM}`}
        >
          {groups.map(group => (
            <span key={group.layer} data-control-layer={group.layer} className="flex items-center gap-x-4 sm:contents">
              <span className="text-base-content-muted">{LAYER_LABEL[group.layer]}</span>
              {group.sections.map(key => (
                <a
                  key={key}
                  href={formatChapterHash(chapterNum, key)}
                  data-section-link={key}
                  onClick={event => {
                    // A modified click keeps the browser's own behaviour (open the route in a new tab).
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                    event.preventDefault();
                    onSelectSection(key);
                  }}
                  className={`${TAP_Y} ${LINK} py-0.5 font-medium text-base-content decoration-base-border hover:decoration-base-content`}
                >
                  {SECTION_LABEL[key]}
                </a>
              ))}
            </span>
          ))}
        </ScrollFade>
        <LevelSwitch level={level} onChange={onLevelChange} />
        {foldable.length > 0 && (
          <button
            type="button"
            data-toggle-all
            onClick={() => onSetAllOpen(!allOpen)}
            className={`${TAP_Y} ${LINK} hidden shrink-0 py-0.5 text-base-content-muted decoration-base-border hover:text-base-content sm:inline`}
          >
            {allOpen ? 'พับทั้งหมด' : 'เปิดทั้งหมด'}
          </button>
        )}
      </div>
      {levelOverride && (
        <p className="flex flex-wrap items-center justify-end gap-x-3 text-base-content-muted">
          <span data-chapter-level-scope>{chapterLevelScopeLabel(levelOverride.role)}</span>
          <button
            type="button"
            data-chapter-level-reset
            onClick={levelOverride.onReset}
            className={`${TAP_Y} ${LINK} py-0.5 decoration-base-border hover:text-base-content`}
          >
            {chapterLevelResetLabel(levelOverride.levelMode)}
          </button>
        </p>
      )}
    </nav>
  );
};
