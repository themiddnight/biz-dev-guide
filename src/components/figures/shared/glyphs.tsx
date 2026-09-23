import React from 'react';

/*
 * Small SVG status primitives shared by the hero figures (spec 2026-09-22 §2.5, §5.1).
 * Status is always glyph + text, never colour alone: ✓ is a stroked path in --fig-ok,
 * "!" is drawn as shapes on a --fig-warn disc (no font glyphs, so no shaping surprises).
 * All geometry is in the caller's SVG user units.
 */

interface OkTickProps {
  /** Top-left corner of the tick's square box. */
  x: number;
  y: number;
  /** Box edge length; the stroke scales with it. */
  size?: number;
}

/** ✓ drawn as a path inside a size×size box. */
export const OkTick: React.FC<OkTickProps> = ({ x, y, size = 10 }) => {
  const u = size / 10;
  return (
    <path
      d={`M${x + 1.5 * u},${y + 5.5 * u} L${x + 4 * u},${y + 8 * u} L${x + 8.5 * u},${y + 2.5 * u}`}
      fill="none"
      stroke="var(--fig-ok)"
      strokeWidth={1.6 * u}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
};

interface WarnBangProps {
  /** Disc centre. */
  cx: number;
  cy: number;
  /** Disc radius; the "!" scales with it (geometry tuned at r = 5). */
  r?: number;
}

/** "!" drawn as a bar + dot cut out of a --fig-warn disc. */
export const WarnBang: React.FC<WarnBangProps> = ({ cx, cy, r = 5 }) => {
  const u = r / 5;
  return (
    <>
      <circle cx={cx} cy={cy} r={r} fill="var(--fig-warn)" />
      <rect x={cx - 0.7 * u} y={cy - 3.5 * u} width={1.4 * u} height={4.2 * u} rx={0.7 * u} fill="var(--fig-warn-bg)" />
      <circle cx={cx} cy={cy + 2.6 * u} r={0.8 * u} fill="var(--fig-warn-bg)" />
    </>
  );
};

interface CheckboxProps {
  /** Top-left corner of the box. */
  x: number;
  y: number;
  size?: number;
  checked: boolean;
}

/** Checklist box: empty outline, or --fig-ok filled box with a drawn tick. */
export const Checkbox: React.FC<CheckboxProps> = ({ x, y, size = 10, checked }) => (
  <>
    <rect
      x={x + 0.5}
      y={y + 0.5}
      width={size - 1}
      height={size - 1}
      rx={size / 5}
      fill={checked ? 'var(--fig-ok-bg)' : 'var(--fig-bg)'}
      stroke={checked ? 'var(--fig-ok-border)' : 'var(--fig-border)'}
    />
    {checked && <OkTick x={x} y={y} size={size} />}
  </>
);

export type ChipTone = 'ok' | 'warn' | 'accent' | 'neutral';

const CHIP_TONES: Record<ChipTone, { fill: string; stroke: string; text: string }> = {
  ok: { fill: 'var(--fig-ok-bg)', stroke: 'var(--fig-ok-border)', text: 'var(--fig-ok)' },
  warn: { fill: 'var(--fig-warn-bg)', stroke: 'var(--fig-warn-border)', text: 'var(--fig-warn)' },
  accent: { fill: 'var(--fig-accent-bg)', stroke: 'var(--fig-accent-border)', text: 'var(--fig-accent)' },
  neutral: { fill: 'var(--fig-surface-2)', stroke: 'var(--fig-border)', text: 'var(--fig-text-2)' },
};

interface ChipProps {
  /** Top-left corner; width is explicit because SVG cannot measure text at render time. */
  x: number;
  y: number;
  width: number;
  height?: number;
  tone?: ChipTone;
  /** Short fixed string (fontSize 10); budget ≈ 6.5 units per character plus padding. */
  children: React.ReactNode;
}

/** Rounded tag with centred text. */
export const Chip: React.FC<ChipProps> = ({ x, y, width, height = 16, tone = 'neutral', children }) => {
  const t = CHIP_TONES[tone];
  return (
    <>
      <rect x={x} y={y} width={width} height={height} rx={height / 2} fill={t.fill} stroke={t.stroke} />
      <text x={x + width / 2} y={y + height / 2 + 3.5} textAnchor="middle" fontSize="10" fill={t.text}>
        {children}
      </text>
    </>
  );
};
