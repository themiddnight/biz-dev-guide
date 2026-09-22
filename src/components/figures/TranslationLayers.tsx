import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Layer tops in the stacked 280-wide layout (each layer 42 units tall, 18-unit seams). */
const LAYER_H = 42;
const SEAM_H = 18;
const BIZ_TOP = 4;
const BIZ_H = 38;
const FIRST_TOP = BIZ_TOP + BIZ_H + SEAM_H;
const BOX_W = 256;
const RAIL_X = 270;

interface Layer { role: string; job: string; output?: string; accent?: boolean }

const LAYERS: readonly Layer[] = [
  { role: 'Product Manager', job: 'ตัดสินใจ "ควรทำอะไร ทำไม"', output: 'roadmap · PRD' },
  { role: 'Business Analyst', job: 'แปลเป็น requirement ที่ชัดพอ', output: 'BRD · user story' },
  { role: 'Solution Architect', job: 'แปลเป็นโครงสร้างระบบ', output: 'solution design' },
  { role: 'Engineer', job: 'แปลเป็น code จริง', accent: true },
];

const top = (i: number) => FIRST_TOP + i * (LAYER_H + SEAM_H);
const PM_TOP = top(LAYERS.length - 1) + LAYER_H + 10;
const PM_H = 40;
const muted = 'var(--fig-text-muted)';

/**
 * Static fig 1 (s1): one business sentence passing through translation layers to code.
 * Stacked rows in a 280-wide viewBox so every label renders >= 10px in the
 * ~287px column inside the core-concepts card at a 375px viewport.
 */
export const TranslationLayers: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();
  const seamTops = [BIZ_TOP + BIZ_H, ...LAYERS.slice(0, -1).map((_, i) => top(i) + LAYER_H)];

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox={`0 0 280 ${PM_TOP + PM_H + 4}`}
        role="img"
        aria-labelledby={`${uid}-p1t ${uid}-p1d`}
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 360, display: 'block', margin: '0 auto' }}
      >
        <title id={`${uid}-p1t`}>ความต้องการของธุรกิจกลายเป็นโค้ดยังไง</title>
        <desc id={`${uid}-p1d`}>ความต้องการทางธุรกิจไหลลงผ่านสี่บทบาท ได้แก่ Product Manager, Business Analyst, Solution Architect และ Engineer โดยแต่ละบทบาทผลิตเอกสารของตัวเอง และมีจุดที่ความหมายเพี้ยนได้ระหว่างแต่ละชั้น ส่วน Project Manager ทำงานคู่ขนานตลอดเส้นโดยไม่ตัดสินใจเนื้อหา</desc>
        <defs>
          <marker id={`${uid}-pipe-a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill={muted} />
          </marker>
        </defs>

        {/* Business need */}
        <rect x="4" y={BIZ_TOP} width={BOX_W} height={BIZ_H} rx="8" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
        <text x="14" y={BIZ_TOP + 15} fontSize="10" fill="var(--fig-text-2)">ธุรกิจต้องการ</text>
        <text x="14" y={BIZ_TOP + 31} fontSize="11" fontWeight="600" fill="var(--fig-text)">"ลูกค้าสั่งอาหารได้ง่ายขึ้น"</text>

        {/* Role layers */}
        {LAYERS.map((layer, i) => {
          const y = top(i);
          return (
            <g key={layer.role}>
              <rect
                x="4" y={y} width={BOX_W} height={LAYER_H} rx="8"
                fill={layer.accent ? 'var(--fig-accent-bg)' : 'var(--fig-surface-2)'}
                stroke={layer.accent ? 'var(--fig-accent-border)' : 'var(--fig-border)'}
              />
              <text x="14" y={y + 17} fontSize="12" fontWeight="600" fill="var(--fig-text)">{layer.role}</text>
              {layer.output && (
                <text x={BOX_W - 4} y={y + 17} textAnchor="end" fontSize="10" fill={muted}>{layer.output}</text>
              )}
              <text x="14" y={y + 33} fontSize="10" fill="var(--fig-text-2)">{layer.job}</text>
            </g>
          );
        })}

        {/* Seams: hand-off arrow + leak marker ("!" drawn as shapes) */}
        {seamTops.map((sy, i) => {
          const cy = sy + SEAM_H / 2;
          return (
            <g key={sy}>
              <line x1="30" y1={sy} x2="30" y2={sy + SEAM_H - 3} stroke={muted} strokeWidth="1.5" markerEnd={`url(#${uid}-pipe-a)`} />
              <circle cx="56" cy={cy} r="6.5" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
              <line x1="56" y1={cy - 3.5} x2="56" y2={cy + 1} stroke="var(--fig-warn)" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="56" cy={cy + 3.3} r="0.95" fill="var(--fig-warn)" />
              {i === 0 && (
                <text x="68" y={cy + 3.5} fontSize="10" fill="var(--fig-warn)">จุดที่ความหมายรั่วได้มากที่สุด</text>
              )}
            </g>
          );
        })}

        {/* Project Manager runs in parallel along the whole line */}
        <line x1={RAIL_X} y1={FIRST_TOP} x2={RAIL_X} y2={PM_TOP} stroke="var(--fig-border)" strokeWidth="1.5" strokeDasharray="4 3" />
        <line x1={RAIL_X - 4} y1={FIRST_TOP} x2={RAIL_X + 4} y2={FIRST_TOP} stroke="var(--fig-border)" strokeWidth="1.5" />
        <rect x="4" y={PM_TOP} width="272" height={PM_H} rx="8" fill="none" stroke="var(--fig-border)" strokeDasharray="5 4" />
        <text x="14" y={PM_TOP + 17} fontSize="11" fontWeight="600" fill="var(--fig-text-2)">Project Manager</text>
        <text x="266" y={PM_TOP + 17} textAnchor="end" fontSize="10" fill={muted}>คู่ขนานทั้งเส้น</text>
        <text x="14" y={PM_TOP + 32} fontSize="10" fill={muted}>คุมเวลา/คน · ไม่ตัดสินใจเนื้อหา</text>
      </svg>
    </div>
  );
};
