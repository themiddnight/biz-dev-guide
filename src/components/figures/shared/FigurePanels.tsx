import React, { useId, useRef, useState } from 'react';
import { nextTabIndex } from '../../../lib/tabKeys';

/*
 * Multi-panel shell for hero figures (spec 2026-09-22 §2.6, §5.1), extracted from RefundFidelity.
 * Layout switches with CSS only at container width 640px:
 *   ≥ 640px  → all panels side by side (columns 2 or 4), optional footer strip.
 *   < 640px  → narrow 'tabs': tablist + one panel (roving tabindex, APG tabs pattern);
 *              narrow 'stack': every panel visible, stacked, no tab roles.
 * The selected tab is view-only UI state; content stays static.
 * Ids come from one useId(): -tab{n} / -p{n} / -l{n} / -t{n} / -d{n}.
 */

export interface FigurePanel {
  /** HTML label above the drawing (also labels the panel). */
  label: string;
  /** Short tab text for narrow 'tabs' mode; falls back to label. */
  tab?: string;
  /** HTML line under the drawing (e.g. cost to change). */
  note?: React.ReactNode;
  /** svg <title> (Thai). */
  title: string;
  /** svg <desc>: one sentence listing what is visible. */
  desc: string;
  /** e.g. "0 0 150 240"; width ≤ smallest rendered CSS px width (spec §2.4). */
  viewBox: string;
  /** The artefact drawing, rendered inside the svg. */
  Screen: React.FC;
}

export interface FigurePanelsProps {
  panels: FigurePanel[];
  columns: 2 | 4;
  narrow: 'tabs' | 'stack';
  /** aria-label of the tablist (narrow 'tabs' mode). */
  tablistLabel?: string;
  /** Wide-only strip under the panels (e.g. the s3 scale arrow); its children sit in a flex row. */
  footer?: React.ReactNode;
  /** Narrow-only "ขั้น n จาก N" line under each panel. */
  stepCounter?: boolean;
  className?: string;
}

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

/* Literal class strings so Tailwind can see them. */
const WIDE_GRID: Record<FigurePanelsProps['columns'], string> = {
  2: '@min-[640px]:grid @min-[640px]:grid-cols-2 @min-[640px]:gap-3',
  4: '@min-[640px]:grid @min-[640px]:grid-cols-4 @min-[640px]:gap-3',
};
const TAB_GRID: Record<FigurePanelsProps['columns'], string> = {
  2: 'grid grid-cols-2',
  4: 'grid grid-cols-4',
};

/**
 * Narrow-mode cap on the drawing: 150-wide panels stop at 260px, 300-wide panels at 360px,
 * so text never renders below 10px and never balloons in a wide stacked column.
 */
const SCREEN_CLASS: Record<FigurePanelsProps['columns'], string> = {
  4: 'max-w-[260px] mx-auto @min-[640px]:max-w-none',
  2: 'max-w-[360px] mx-auto @min-[640px]:max-w-none',
};

export const FigurePanels: React.FC<FigurePanelsProps> = ({
  panels,
  columns,
  narrow,
  tablistLabel,
  footer,
  stepCounter = false,
  className,
}) => {
  const uid = useId();
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabs = narrow === 'tabs';

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const next = nextTabIndex(selected, e.key, panels.length);
    if (next === null) return;
    e.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={`fig-scope @container ${className ?? ''}`}>
      {tabs && (
        <div
          role="tablist"
          aria-label={tablistLabel}
          className={`${TAB_GRID[columns]} gap-1 p-1 mb-3 rounded-lg @min-[640px]:hidden`}
          style={{ background: 'var(--fig-surface-2)' }}
        >
          {panels.map((panel, i) => {
            const isSelected = i === selected;
            return (
              <button
                key={panel.label}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`${uid}-tab${i + 1}`}
                aria-selected={isSelected}
                aria-controls={`${uid}-p${i + 1}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setSelected(i)}
                onKeyDown={onKeyDown}
                className={`min-h-[44px] px-1 rounded-md text-sm cursor-pointer ${isSelected ? 'font-semibold shadow-sm' : ''} ${FOCUS_RING}`}
                style={{
                  background: isSelected ? 'var(--fig-bg)' : 'transparent',
                  color: isSelected ? 'var(--fig-text)' : 'var(--fig-text-2)',
                }}
              >
                {panel.tab ?? panel.label}
              </button>
            );
          })}
        </div>
      )}

      <div className={tabs ? WIDE_GRID[columns] : `flex flex-col gap-4 ${WIDE_GRID[columns]}`}>
        {panels.map((panel, i) => {
          const n = i + 1;
          const { Screen } = panel;
          return (
            <div
              key={panel.label}
              role={tabs ? 'tabpanel' : 'group'}
              id={`${uid}-p${n}`}
              aria-labelledby={`${uid}-l${n}`}
              className={tabs ? `${i === selected ? '' : 'hidden'} @min-[640px]:block` : undefined}
            >
              <p
                id={`${uid}-l${n}`}
                className="mb-1.5 text-xs font-semibold text-center"
                style={{ color: 'var(--fig-text)' }}
              >
                {panel.label}
              </p>
              <div className={SCREEN_CLASS[columns]}>
                <svg
                  viewBox={panel.viewBox}
                  role="img"
                  aria-labelledby={`${uid}-t${n} ${uid}-d${n}`}
                  fontFamily="inherit"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                >
                  <title id={`${uid}-t${n}`}>{panel.title}</title>
                  <desc id={`${uid}-d${n}`}>{panel.desc}</desc>
                  <Screen />
                </svg>
              </div>
              {panel.note != null && (
                <p className="mt-1.5 text-xs text-center" style={{ color: 'var(--fig-text-2)' }}>
                  {panel.note}
                </p>
              )}
              {stepCounter && (
                <p className="mt-0.5 text-xs text-center @min-[640px]:hidden" style={{ color: 'var(--fig-text-muted)' }}>
                  ขั้น {n} จาก {panels.length}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {footer != null && (
        <div
          className="hidden @min-[640px]:flex items-center gap-2 mt-3 text-xs"
          style={{ color: 'var(--fig-text-2)' }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
