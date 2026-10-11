import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { Chip, WarnBang } from './shared/glyphs';

/*
 * s18 hero: one Sprint board before and after a "small" request is taken in (chapter text: the
 * share-order button, about 1 week, against the automatic refund system that is this quarter's KR).
 * Each panel is viewBox 0 0 300 200 (2-up at container ≥ 640px ≈ 314px wide, stacked at a 375px
 * viewport ≈ 317px, so fontSize 10 never renders under 10px). The Sprint frame has the same size and
 * slots in both panels: the request swaps places with the automatic refund system, which leaves the
 * Sprint for the lane under it. Layout (user units): frame 1–112 · arrow 112–132 · lane 138–198.
 * Status is glyph + text, never colour alone. Panel labels and notes are HTML.
 */

const W = 300;
const H = 200;

const CARD_X = 10;
const CARD_W = W - 2 * CARD_X;
const CARD_H = 32;
const SLOT_1_Y = 34;
const SLOT_2_Y = 74;
const FRAME_H = 112;
const LANE_Y = 138;
const LANE_CARD_Y = 160;

type Tone = 'plain' | 'accent' | 'warn' | 'ghost';

const CARD_STYLE: Record<Tone, { fill: string; stroke: string; dash?: string }> = {
  plain: { fill: 'var(--fig-bg)', stroke: 'var(--fig-border)' },
  accent: { fill: 'var(--fig-accent-bg)', stroke: 'var(--fig-accent-border)' },
  warn: { fill: 'var(--fig-warn-bg)', stroke: 'var(--fig-warn-border)' },
  ghost: { fill: 'var(--fig-bg)', stroke: 'var(--fig-text-muted)', dash: '4 3' },
};

interface CardProps {
  y: number;
  tone: Tone;
  title: string;
  chip: { text: string; width: number; tone: 'ok' | 'warn' | 'accent' | 'neutral' };
  /** Left inset of the title (room for a glyph). */
  inset?: number;
  children?: React.ReactNode;
}

/** One board card: title on the left, a status chip on the right. */
const Card: React.FC<CardProps> = ({ y, tone, title, chip, inset = 10, children }) => {
  const style = CARD_STYLE[tone];
  return (
    <g>
      <rect
        x={CARD_X + 0.5}
        y={y + 0.5}
        width={CARD_W - 1}
        height={CARD_H - 1}
        rx={5}
        fill={style.fill}
        stroke={style.stroke}
        strokeDasharray={style.dash}
      />
      {children}
      <text
        x={CARD_X + inset}
        y={y + 20}
        fontSize="10"
        fontWeight="600"
        fill={tone === 'ghost' ? 'var(--fig-text-2)' : 'var(--fig-text)'}
      >
        {title}
      </text>
      <Chip x={CARD_X + CARD_W - chip.width - 8} y={y + 8} width={chip.width} tone={chip.tone}>
        {chip.text}
      </Chip>
    </g>
  );
};

/** Frame of the Sprint with its header; the lane under it has its own label. */
const Board: React.FC<{ laneLabel: string; children: React.ReactNode }> = ({ laneLabel, children }) => (
  <>
    <rect x={1} y={1} width={W - 2} height={FRAME_H} rx={6} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <text x={CARD_X} y={16} fontSize="10" fontWeight="700" fill="var(--fig-text)">
      Sprint นี้
    </text>
    <text x={W - CARD_X} y={16} textAnchor="end" fontSize="10" fill="var(--fig-text-2)">
      เวลาเท่าเดิม
    </text>
    <text x={CARD_X} y={LANE_Y + 11} fontSize="10" fontWeight="600" fill="var(--fig-text-2)">
      {laneLabel}
    </text>
    {children}
  </>
);

/** Vertical arrow, drawn as a shaft + filled head. */
const Arrow: React.FC<{ x: number; from: number; to: number }> = ({ x, from, to }) => {
  const dir = to > from ? 1 : -1;
  return (
    <>
      <path d={`M${x},${from} V${to - dir * 5}`} stroke="var(--fig-text-2)" strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M${x - 4},${to - dir * 6} L${x},${to} L${x + 4},${to - dir * 6} Z`} fill="var(--fig-text-2)" />
    </>
  );
};

const EVIDENCE = { text: 'ทำใน Sprint นี้', width: 88, tone: 'neutral' as const };

/* ---------- Panel 1: the request is waiting outside ---------- */

const BeforeBoard: React.FC = () => (
  <Board laneLabel="คำขอที่รออยู่">
    <Card y={SLOT_1_Y} tone="accent" title="ระบบคืนเงินอัตโนมัติ" chip={{ text: 'เป้าไตรมาส', width: 74, tone: 'accent' }} />
    <Card y={SLOT_2_Y} tone="plain" title="แนบรูปหลักฐาน" chip={EVIDENCE} />
    <Arrow x={W - 24} from={LANE_CARD_Y - 4} to={FRAME_H + 4} />
    <Card
      y={LANE_CARD_Y}
      tone="ghost"
      title="ปุ่มแชร์ออเดอร์"
      chip={{ text: '"งานเล็ก" 1 สัปดาห์', width: 120, tone: 'neutral' }}
    />
  </Board>
);

/* ---------- Panel 2: the request is in, the automatic system is out ---------- */

const AfterBoard: React.FC = () => (
  <Board laneLabel="ถูกเลื่อนออกจาก Sprint นี้">
    <Card y={SLOT_1_Y} tone="accent" title="ปุ่มแชร์ออเดอร์" chip={{ text: 'แทรกเข้ามา', width: 72, tone: 'accent' }} />
    <Card y={SLOT_2_Y} tone="plain" title="แนบรูปหลักฐาน" chip={EVIDENCE} />
    <Arrow x={W - 24} from={FRAME_H + 4} to={LANE_CARD_Y - 4} />
    <Card
      y={LANE_CARD_Y}
      tone="warn"
      title="ระบบคืนเงินอัตโนมัติ"
      inset={28}
      chip={{ text: 'ช้าลง 1 สัปดาห์', width: 100, tone: 'warn' }}
    >
      <WarnBang cx={CARD_X + 14} cy={LANE_CARD_Y + CARD_H / 2} r={5.5} />
    </Card>
  </Board>
);

const PANELS: FigurePanel[] = [
  {
    label: 'ก่อนรับงานเล็ก',
    note: 'ระบบคืนเงินอัตโนมัติคือเป้าของไตรมาสนี้ ปุ่มแชร์ยังรออยู่นอก Sprint',
    title: 'บอร์ด Sprint ก่อนรับคำขอ "งานเล็ก"',
    desc: 'บอร์ด Sprint นี้เวลาเท่าเดิม มีสองใบ คือระบบคืนเงินอัตโนมัติติดป้ายเป้าไตรมาส และแนบรูปหลักฐาน ด้านล่างนอกบอร์ดมีคำขอที่รออยู่ คือปุ่มแชร์ออเดอร์ งานเล็ก 1 สัปดาห์ มีลูกศรชี้ขึ้นหาบอร์ด',
    viewBox: `0 0 ${W} ${H}`,
    Screen: BeforeBoard,
  },
  {
    label: 'หลังรับงานเล็ก',
    note: 'งานเล็กไม่ฟรี ราคาจริงคือเป้าที่ช้าลง 1 สัปดาห์',
    title: 'บอร์ด Sprint หลังรับคำขอ "งานเล็ก"',
    desc: 'บอร์ด Sprint นี้ขนาดเท่าเดิม ปุ่มแชร์ออเดอร์เข้ามาแทนที่ในใบแรกด้วยป้ายแทรกเข้ามา ส่วนระบบคืนเงินอัตโนมัติถูกเลื่อนออกไปอยู่ด้านล่างนอกบอร์ด ติดเครื่องหมายตกใจและป้ายช้าลง 1 สัปดาห์ มีลูกศรชี้ลงจากบอร์ด ใบแนบรูปหลักฐานยังอยู่เหมือนเดิม',
    viewBox: `0 0 ${W} ${H}`,
    Screen: AfterBoard,
  },
];

/** s18 hero: one Sprint board; the "small" request takes a slot and the automatic refund system leaves it. */
export const RefundOpportunityCost: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels panels={PANELS} columns={2} narrow="stack" className={className} />
);
