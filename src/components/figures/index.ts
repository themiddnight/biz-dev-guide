import type React from 'react';
import type { FigureKey } from '../../types';

/**
 * Registry of static figures ported from the original HTML guide (SVG -> JSX).
 *
 * Porting rules (spec §1.2):
 * - One file per figure in this folder; keep `viewBox`, `role="img"`, `<title>`/`<desc>`.
 * - Convert attributes to JSX (`text-anchor` -> `textAnchor`, `stroke-width` -> `strokeWidth`, ...).
 * - Replace every `var(--X)` with `var(--fig-X)` (tokens live in `.fig-scope`, `src/index.css`).
 * - Make every `id` (markers, `url(#…)`, `aria-labelledby`) unique per instance with `useId()`.
 * - Wrap the root in `<div className="fig-scope">`; scale with `width: 100%; height: auto`,
 *   capped by the static per-figure `max-width`.
 */
export interface FigureProps {
  className?: string;
}

export const FIGURES: Record<FigureKey, React.FC<FigureProps>> = {};
