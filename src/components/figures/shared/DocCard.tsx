import React from 'react';
import { Chip } from './glyphs';

/*
 * SVG document / ticket card shared by the hero figures (spec 2026-09-22 §5.1).
 * Draws: header band with the doc id (folded corner for 'doc', accent side bar for 'ticket'),
 * optional heading, text rows (plain, muted, or a divider), and two fixed slots at the
 * bottom: back-link chip (accent, "↑ …") above the reader tag chip. The slots sit at fixed
 * offsets from the card bottom so cards drawn side by side line up.
 * Every string is a short fixed line at fontSize ≥ 10; callers split long lines themselves
 * (budget ≈ 6.5 units per non-combining character, spec §2.4).
 */

export type DocRow = string | { text: string; muted?: boolean } | { divider: true };

export interface DocCardProps {
  /** Doc or ticket id shown in the header band, e.g. "PRD-12", "REF-118". */
  id: string;
  /** Bold line under the header. */
  heading?: string;
  rows?: DocRow[];
  /** Accent chip near the bottom, e.g. "↑ เพื่อ BRD-3". */
  backLink?: string;
  /** Neutral chip at the bottom, e.g. "ผู้อ่าน: Dev". */
  tag?: string;
  /** 'doc' = folded corner; 'ticket' = accent side bar. */
  kind?: 'doc' | 'ticket';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

const PAD = 8;
const HEADER_H = 24;
const LINE_H = 15;
const CHIP_H = 16;
const FOLD = 12;

/** Thai above/below-base marks take no advance width. */
const COMBINING = /[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/u;

/** Rough rendered width at fontSize 10 (spec §2.4 fit budget). */
export const estimateTextWidth = (text: string) =>
  Array.from(text).filter((ch) => !COMBINING.test(ch)).length * 6.5;

const chipWidth = (text: string, max: number) => Math.min(max, Math.ceil(estimateTextWidth(text)) + 14);

export const DocCard: React.FC<DocCardProps> = ({
  id,
  heading,
  rows = [],
  backLink,
  tag,
  kind = 'doc',
  x = 1,
  y = 1,
  width = 148,
  height = 238,
}) => {
  const left = x + PAD + (kind === 'ticket' ? 3 : 0);
  const inner = x + width - PAD - left;
  const bottom = y + height;
  const tagY = bottom - PAD - CHIP_H;
  const backY = tagY - CHIP_H - 6;
  // Baselines: each text line advances LINE_H, a divider advances 9 and sits 6 below the last line.
  let cursor = y + HEADER_H + 2;
  const headingY = heading ? (cursor += LINE_H + 1) : 0;
  const placed = rows.map((row) => {
    if (typeof row === 'object' && 'divider' in row) {
      const at = cursor + 6;
      cursor += 9;
      return { divider: at };
    }
    cursor += LINE_H;
    return typeof row === 'string' ? { text: row, muted: false, at: cursor } : { ...row, at: cursor };
  });

  const outline =
    kind === 'doc'
      ? `M${x},${y} H${x + width - FOLD} L${x + width},${y + FOLD} V${bottom} H${x} Z`
      : undefined;

  return (
    <g>
      {outline ? (
        <path d={outline} fill="var(--fig-bg)" stroke="var(--fig-border)" strokeLinejoin="round" />
      ) : (
        <rect x={x} y={y} width={width} height={height} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
      )}
      {/* header band */}
      <path
        d={
          outline
            ? `M${x + 0.5},${y + 0.5} H${x + width - FOLD} L${x + width - 0.5},${y + FOLD} V${y + HEADER_H} H${x + 0.5} Z`
            : `M${x + 0.5},${y + HEADER_H} V${y + 6} Q${x + 0.5},${y + 0.5} ${x + 6},${y + 0.5} H${x + width - 6} Q${x + width - 0.5},${y + 0.5} ${x + width - 0.5},${y + 6} V${y + HEADER_H} Z`
        }
        fill="var(--fig-surface-2)"
      />
      <line x1={x} y1={y + HEADER_H} x2={x + width} y2={y + HEADER_H} stroke="var(--fig-border)" />
      {outline && (
        <path
          d={`M${x + width - FOLD},${y} V${y + FOLD} H${x + width}`}
          fill="var(--fig-bg)"
          stroke="var(--fig-border)"
          strokeLinejoin="round"
        />
      )}
      {kind === 'ticket' && (
        <rect x={x + 3} y={y + HEADER_H + 4} width={3} height={height - HEADER_H - 8} rx={1.5} fill="var(--fig-accent-border)" />
      )}
      <text x={left} y={y + 16} fontSize="10" fontWeight="700" fill="var(--fig-text-2)">
        {id}
      </text>

      {heading && (
        <text x={left} y={headingY} fontSize="11" fontWeight="700" fill="var(--fig-text)">
          {heading}
        </text>
      )}
      {placed.map((row, i) =>
        'divider' in row ? (
          <line key={i} x1={left} y1={row.divider} x2={left + inner} y2={row.divider} stroke="var(--fig-border)" strokeDasharray="3 2" />
        ) : (
          <text key={i} x={left} y={row.at} fontSize="10" fill={row.muted ? 'var(--fig-text-2)' : 'var(--fig-text)'}>
            {row.text}
          </text>
        ),
      )}

      {backLink && (
        <Chip x={left} y={backY} width={chipWidth(backLink, inner)} height={CHIP_H} tone="accent">
          {backLink}
        </Chip>
      )}
      {tag && (
        <Chip x={left} y={tagY} width={chipWidth(tag, inner)} height={CHIP_H}>
          {tag}
        </Chip>
      )}
    </g>
  );
};
