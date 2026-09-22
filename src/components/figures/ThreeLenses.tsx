import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Panel tops in the stacked 280-wide layout (each panel 94 units tall). */
const TOPS = [4, 102, 200] as const;
const TEXT_X = 120;

interface LensText { title: string; subtitle: string; question: string; reader: string }

const LENSES: readonly LensText[] = [
  { title: 'ขอบเขต', subtitle: 'high-level solution', question: '"ใครแตะระบบนี้บ้าง"', reader: 'ผู้บริหาร · ลูกค้า' },
  { title: 'โครงสร้าง', subtitle: 'module + function map', question: '"ข้างในมีอะไร เชื่อมกันยังไง"', reader: 'architect · tech lead' },
  { title: 'พฤติกรรม', subtitle: 'use case + sequence', question: '"เกิดอะไรก่อนหลัง"', reader: 'developer · QA' },
];

const muted = 'var(--fig-text-muted)';

/**
 * Static fig 4 (s5.2): the same system seen through three lenses.
 * Stacked rows in a 280-wide viewBox so every label renders >= 10px in the
 * ~287px column inside the core-concepts card at a 375px viewport.
 */
export const ThreeLenses: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();
  const [t1, t2, t3] = TOPS;
  const cy = t1 + 47;

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 280 300"
        role="img"
        aria-labelledby={`${uid}-f3t ${uid}-f3d`}
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 360, display: 'block', margin: '0 auto' }}
      >
        <title id={`${uid}-f3t`}>แผนภาพเปรียบเทียบมุมมองสามแบบของระบบเดียวกัน</title>
        <desc id={`${uid}-f3d`}>มุมมองที่หนึ่งคือขอบเขต แสดงระบบเป็นกล่องเดียวล้อมด้วยผู้เกี่ยวข้อง มุมมองที่สองคือโครงสร้าง แสดงก้อนย่อยภายในระบบและการเชื่อมกัน มุมมองที่สามคือพฤติกรรม แสดงลำดับเหตุการณ์ตามเวลา</desc>
        <defs>
          <marker id={`${uid}-v3-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={muted} />
          </marker>
        </defs>

        {LENSES.map((lens, i) => {
          const top = TOPS[i];
          return (
            <g key={lens.title}>
              <rect x="4" y={top} width="272" height="94" rx="10" fill="none" stroke="var(--fig-border)" />
              <text x={TEXT_X} y={top + 22} fontSize="12" fontWeight="600" fill="var(--fig-text)">{lens.title}</text>
              <text x={TEXT_X} y={top + 38} fontSize="10" fill={muted}>{lens.subtitle}</text>
              <text x={TEXT_X} y={top + 60} fontSize="10" fill="var(--fig-text-2)">{lens.question}</text>
              <text x={TEXT_X} y={top + 78} fontSize="10" fill={muted}>{lens.reader}</text>
            </g>
          );
        })}

        {/* Lens 1 — scope: one system box surrounded by actors */}
        <rect x="36" y={cy - 15} width="48" height="30" rx="6" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <text x="60" y={cy + 4} textAnchor="middle" fontSize="10" fill="var(--fig-text)">ระบบ</text>
        {[[18, -28], [102, -28], [18, 28], [102, 28]].map(([x, dy]) => (
          <circle key={`${x}${dy}`} cx={x} cy={cy + dy} r="8" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        ))}
        <line x1="24" y1={cy - 23} x2="36" y2={cy - 15} stroke={muted} strokeWidth="1.2" />
        <line x1="96" y1={cy - 23} x2="84" y2={cy - 15} stroke={muted} strokeWidth="1.2" />
        <line x1="24" y1={cy + 23} x2="36" y2={cy + 15} stroke={muted} strokeWidth="1.2" />
        <line x1="96" y1={cy + 23} x2="84" y2={cy + 15} stroke={muted} strokeWidth="1.2" />

        {/* Lens 2 — structure: modules inside the system boundary */}
        <rect x="12" y={t2 + 10} width="96" height="74" rx="8" fill="none" stroke="var(--fig-accent-border)" strokeDasharray="4 3" />
        {[[20, 18], [64, 18], [20, 52], [64, 52]].map(([x, dy]) => (
          <rect key={`${x}${dy}`} x={x} y={t2 + dy} width="36" height="24" rx="5" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        ))}
        <line x1="56" y1={t2 + 30} x2="64" y2={t2 + 30} stroke={muted} strokeWidth="1.2" />
        <line x1="38" y1={t2 + 42} x2="38" y2={t2 + 52} stroke={muted} strokeWidth="1.2" />
        <line x1="56" y1={t2 + 64} x2="64" y2={t2 + 64} stroke={muted} strokeWidth="1.2" />
        <line x1="82" y1={t2 + 42} x2="82" y2={t2 + 52} stroke={muted} strokeWidth="1.2" />

        {/* Lens 3 — behaviour: lifelines with ordered calls */}
        {[24, 60, 96].map(x => (
          <g key={x}>
            <line x1={x} y1={t3 + 18} x2={x} y2={t3 + 84} stroke="var(--fig-border)" strokeWidth="1.2" />
            <circle cx={x} cy={t3 + 14} r="4" fill={muted} />
          </g>
        ))}
        <line x1="24" y1={t3 + 34} x2="56" y2={t3 + 34} stroke={muted} strokeWidth="1.3" markerEnd={`url(#${uid}-v3-a)`} />
        <line x1="60" y1={t3 + 52} x2="92" y2={t3 + 52} stroke={muted} strokeWidth="1.3" markerEnd={`url(#${uid}-v3-a)`} />
        <line x1="96" y1={t3 + 70} x2="28" y2={t3 + 70} stroke={muted} strokeWidth="1.3" markerEnd={`url(#${uid}-v3-a)`} />
      </svg>
    </div>
  );
};
