import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { Chip, OkTick, WarnBang } from './shared/glyphs';

/*
 * s2 hero: the same sprint backlog of 6 requests against one fixed team-capacity line,
 * before and after the PM ranks it (chapter figure briefs 2026-09-22, s2).
 * Each panel is viewBox 0 0 300 280: 2-up at container ≥ 640px renders ≈ 314px wide and the
 * stacked panel at a 375px viewport ≈ 317px (capped at 360px on wider stacked widths), so fontSize 10 never renders under 10px.
 * The capacity line sits at the same y in both panels (same items, same line).
 * Layout (user units): rows above the line 8–74 · capacity label + line 80–96 ·
 * below-the-line rows 106–256. Labels and notes are HTML.
 */

const W = 300;
const H = 280;
const PAD = 4;
const ROW_W = W - 2 * PAD;
const LINE_Y = 96;

/** Dashed team-capacity line with its label, identical in both panels. */
const CapacityLine: React.FC = () => (
  <g>
    <text x={PAD + 2} y={LINE_Y - 6} fontSize="10" fill="var(--fig-text-2)">
      กำลังทีม Sprint นี้
    </text>
    <line
      x1={PAD}
      x2={W - PAD}
      y1={LINE_Y}
      y2={LINE_Y}
      stroke="var(--fig-text-2)"
      strokeWidth={1.5}
      strokeDasharray="5 4"
    />
  </g>
);

interface RowProps {
  y: number;
  h?: number;
  tone: 'plain' | 'warn' | 'ok' | 'muted';
  children: React.ReactNode;
}

const ROW_STYLE: Record<RowProps['tone'], { fill: string; stroke: string }> = {
  plain: { fill: 'var(--fig-bg)', stroke: 'var(--fig-border)' },
  warn: { fill: 'var(--fig-warn-bg)', stroke: 'var(--fig-warn-border)' },
  ok: { fill: 'var(--fig-ok-bg)', stroke: 'var(--fig-ok-border)' },
  muted: { fill: 'var(--fig-surface-2)', stroke: 'var(--fig-border)' },
};

/** One backlog row: rounded card, contents positioned by the caller. */
const Row: React.FC<RowProps> = ({ y, h = 30, tone, children }) => (
  <g>
    <rect x={PAD + 0.5} y={y + 0.5} width={ROW_W - 1} height={h - 1} rx={5} {...ROW_STYLE[tone]} />
    {children}
  </g>
);

/* ---------- Panel 1: everything urgent ---------- */

const BEFORE: { request: string; by: string }[] = [
  { request: 'รายงาน Excel', by: 'ฝ่ายขาย' },
  { request: 'ปุ่มแชท', by: 'ฝ่ายบริการ' },
  { request: 'แดชบอร์ด AI', by: 'ผู้บริหาร' },
  { request: 'ขอคืนเงินเมื่อของไม่ถึง', by: 'ลูกค้า' },
  { request: 'แนบรูปหลักฐาน', by: 'support' },
  { request: 'Dark mode', by: 'ทีมดีไซน์' },
];
const BEFORE_Y = [8, 44, 106, 142, 178, 214];

const BeforeBacklog: React.FC = () => (
  <>
    {BEFORE.map(({ request, by }, i) => {
      const y = BEFORE_Y[i];
      const spill = i >= 2;
      return (
        <Row key={request} y={y} tone={spill ? 'warn' : 'plain'}>
          {spill && <WarnBang cx={17} cy={y + 15} />}
          <text x={spill ? 28 : 14} y={y + 19} fontSize="10" fill="var(--fig-text)">
            {request}
            <tspan fill="var(--fig-text-2)"> · {by}</tspan>
          </text>
          {spill && (
            <text x={240} y={y + 19} fontSize="10" fontWeight={600} textAnchor="end" fill="var(--fig-warn)">
              ล้น
            </text>
          )}
          <Chip x={248} y={y + 7} width={40} tone="warn">
            ด่วน
          </Chip>
        </Row>
      );
    })}
    <CapacityLine />
  </>
);

/* ---------- Panel 2: chosen ---------- */

const CHOSEN = ['ขอคืนเงินเมื่อของไม่ถึง', 'แนบรูปหลักฐาน'];
const NOT_NOW = [
  'รายงาน Excel → ใช้ export เดิมไปก่อน',
  'ปุ่มแชท → รอบหน้า',
  'แดชบอร์ด AI → รอข้อมูลก่อน',
  'Dark mode → ไม่ทำ',
];

const AfterBacklog: React.FC = () => (
  <>
    {CHOSEN.map((request, i) => {
      const y = BEFORE_Y[i];
      return (
        <Row key={request} y={y} tone="ok">
          <OkTick x={12} y={y + 10} />
          <text x={28} y={y + 19} fontSize="10" fill="var(--fig-text)">
            {request}
          </text>
          <Chip x={232} y={y + 7} width={56} tone="ok">
            ทำรอบนี้
          </Chip>
        </Row>
      );
    })}
    <CapacityLine />
    <text x={PAD + 2} y={118} fontSize="10" fontWeight={600} fill="var(--fig-text-2)">
      ไม่ทำรอบนี้ (บอกเหตุผลแล้ว)
    </text>
    {NOT_NOW.map((line, i) => {
      const y = 128 + i * 32;
      return (
        <Row key={line} y={y} h={28} tone="muted">
          <text x={14} y={y + 18} fontSize="10" fill="var(--fig-text-muted)">
            {line}
          </text>
        </Row>
      );
    })}
  </>
);

const PANELS: FigurePanel[] = [
  {
    label: 'ก่อน: ทุกอย่างด่วน',
    note: 'งานล้น ไม่มีอะไรเสร็จจริง',
    title: 'แบ็กล็อกก่อนจัดลำดับ',
    desc: 'แบ็กล็อก 6 งาน ทุกงานติดป้ายด่วน มีเส้นประกำลังทีม Sprint นี้อยู่ใต้งานที่ 2 และงาน 4 งานใต้เส้นเป็นสีเหลืองพร้อมเครื่องหมายตกใจและคำว่าล้น',
    viewBox: `0 0 ${W} ${H}`,
    Screen: BeforeBacklog,
  },
  {
    label: 'หลัง: เลือกแล้ว',
    note: '2 อย่างเสร็จ อีก 4 อย่างมีคำตอบ',
    title: 'แบ็กล็อกหลังจัดลำดับ',
    desc: 'งาน 6 อย่างเดิมเรียงใหม่ เหนือเส้นกำลังทีมมีขอคืนเงินเมื่อของไม่ถึงและแนบรูปหลักฐาน ติดเครื่องหมายถูกและป้ายทำรอบนี้ ใต้เส้นเป็นกลุ่มไม่ทำรอบนี้ 4 งานพร้อมเหตุผลของแต่ละงาน',
    viewBox: `0 0 ${W} ${H}`,
    Screen: AfterBacklog,
  },
];

/** s2 hero: one backlog, one capacity line; before everything is urgent, after 2 are chosen and 4 get a reason. */
export const RefundBacklogCut: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels
    panels={PANELS}
    columns={2}
    narrow="stack"
    className={className}
  />
);
