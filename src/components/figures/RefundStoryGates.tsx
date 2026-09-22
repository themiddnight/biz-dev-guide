import React from 'react';
import type { FigureProps } from './index';
import { DocCard } from './shared/DocCard';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { Checkbox, Chip, OkTick, WarnBang } from './shared/glyphs';

/*
 * s6 hero: one refund ticket through the DoR and DoD gates, skipped vs passed
 * (chapter figure briefs 2026-09-22, s6). Each panel is viewBox 0 0 300 300 and flows
 * top to bottom: ticket → DoR gate → "กำลังทำ" → DoD gate → "หลังปล่อย".
 * Checklists are 2×2 drawn checkboxes; status is glyph + text, never colour alone.
 * Panel labels and notes are HTML.
 */

type Outcome = 'skip' | 'pass';

const W = 300;
const MID = W / 2;
const GATE_H = 56;
const DOR_Y = 57;
const DOING_Y = 131;
const DOD_Y = 163;
const RESULT_Y = 237;

interface GateProps {
  y: number;
  title: string;
  items: [string, boolean][];
}

/** Gate box: bold title + 2×2 checklist (row-major). */
const Gate: React.FC<GateProps> = ({ y, title, items }) => (
  <g>
    <rect x={1} y={y} width={W - 2} height={GATE_H} rx={6} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <text x={9} y={y + 15} fontSize="10" fontWeight="700" fill="var(--fig-text)">
      {title}
    </text>
    {items.map(([text, checked], i) => {
      const bx = i % 2 === 0 ? 9 : 153;
      const by = y + 23 + Math.floor(i / 2) * 16;
      return (
        <g key={text}>
          <Checkbox x={bx} y={by} checked={checked} />
          <text x={bx + 14} y={by + 9} fontSize="10" fill={checked ? 'var(--fig-text)' : 'var(--fig-text-2)'}>
            {text}
          </text>
        </g>
      );
    })}
  </g>
);

interface ArrowProps {
  from: number;
  to: number;
  outcome?: Outcome;
}

/** Down arrow on the centre line; skip = warn + "ข้ามไปก่อน" chip, pass = ok + drawn tick. */
const Arrow: React.FC<ArrowProps> = ({ from, to, outcome }) => {
  const color = outcome === 'skip' ? 'var(--fig-warn)' : outcome === 'pass' ? 'var(--fig-ok)' : 'var(--fig-text-muted)';
  const mid = (from + to) / 2;
  return (
    <g>
      <line x1={MID} y1={from} x2={MID} y2={to - 5} stroke={color} strokeWidth={1.5} strokeDasharray={outcome === 'skip' ? '3 2' : undefined} />
      <path d={`M${MID - 4},${to - 6} L${MID},${to} L${MID + 4},${to - 6} Z`} fill={color} />
      {outcome === 'skip' && (
        <Chip x={MID + 8} y={mid - 8} width={66} tone="warn">
          ข้ามไปก่อน
        </Chip>
      )}
      {outcome === 'pass' && <OkTick x={MID + 8} y={mid - 5} />}
    </g>
  );
};

const DOR_ITEMS = ['เงื่อนไขรับคืนชัด', 'มีดีไซน์จอ error', 'มี Acceptance Criteria', 'ทีมประเมินขนาดแล้ว'];
const DOD_ITEMS = ['โค้ดเสร็จ', 'ผ่านเทสต์อัตโนมัติ', 'มีคนรีวิวโค้ด', 'PO ตรวจรับ'];

const zip = (texts: string[], states: boolean[]) => texts.map((t, i) => [t, states[i]] as [string, boolean]);

const Flow: React.FC<{ outcome: Outcome }> = ({ outcome }) => {
  const skip = outcome === 'skip';
  const all = [true, true, true, true];
  return (
    <>
      <DocCard id="REF-118" kind="ticket" rows={['ขอคืนเงินเมื่อของไม่ถึง']} x={1} y={1} width={W - 2} height={44} />
      <Arrow from={45} to={DOR_Y} />
      <Gate y={DOR_Y} title="ด่าน DoR (พร้อมทำ?)" items={zip(DOR_ITEMS, skip ? [false, false, true, false] : all)} />
      <Arrow from={DOR_Y + GATE_H} to={DOING_Y} outcome={outcome} />
      <rect x={MID - 50} y={DOING_Y} width={100} height={20} rx={10} fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
      <text x={MID} y={DOING_Y + 14} textAnchor="middle" fontSize="10" fill="var(--fig-accent)">
        กำลังทำ
      </text>
      <Arrow from={DOING_Y + 20} to={DOD_Y} />
      <Gate y={DOD_Y} title="ด่าน DoD (เสร็จจริง?)" items={zip(DOD_ITEMS, skip ? [true, false, false, false] : all)} />
      <Arrow from={DOD_Y + GATE_H} to={RESULT_Y} outcome={outcome} />
      <rect
        x={1}
        y={RESULT_Y}
        width={W - 2}
        height={W - 1 - RESULT_Y}
        rx={6}
        fill={skip ? 'var(--fig-warn-bg)' : 'var(--fig-ok-bg)'}
        stroke={skip ? 'var(--fig-warn-border)' : 'var(--fig-ok-border)'}
      />
      <text x={9} y={RESULT_Y + 15} fontSize="10" fill="var(--fig-text-2)">
        หลังปล่อย
      </text>
      {skip ? <WarnBang cx={15} cy={RESULT_Y + 30} r={6} /> : <OkTick x={8} y={RESULT_Y + 23} size={14} />}
      <text x={27} y={RESULT_Y + 34} fontSize="11" fontWeight="700" fill={skip ? 'var(--fig-warn)' : 'var(--fig-ok)'}>
        {skip ? 'BUG-131 คืนเงินซ้ำ 2 ครั้ง' : 'ปล่อยแล้ว'}
      </text>
      <text x={27} y={RESULT_Y + 51} fontSize="10" fill="var(--fig-text-2)">
        {skip ? 'ย้ายไป Sprint หน้า' : 'ไม่มีงานย้อนกลับ'}
      </text>
    </>
  );
};

const SkippedFlow: React.FC = () => <Flow outcome="skip" />;
const PassedFlow: React.FC = () => <Flow outcome="pass" />;

const PANELS: FigurePanel[] = [
  {
    label: 'ข้ามด่าน',
    note: 'เร็วขึ้นแค่ในวันนี้',
    title: 'ใบงานที่ข้ามด่าน DoR และ DoD',
    desc: 'ใบงาน REF-118 ขอคืนเงินเมื่อของไม่ถึง ผ่านด่าน DoR ที่ติ๊กแค่มี Acceptance Criteria และด่าน DoD ที่ติ๊กแค่โค้ดเสร็จ ลูกศรข้ามไปก่อนทั้งสองด่าน หลังปล่อยเกิด BUG-131 คืนเงินซ้ำ 2 ครั้ง ย้ายไป Sprint หน้า',
    viewBox: '0 0 300 300',
    Screen: SkippedFlow,
  },
  {
    label: 'ผ่านด่าน',
    note: 'ไม่มีงานไหลย้อน',
    title: 'ใบงานที่ผ่านด่าน DoR และ DoD',
    desc: 'ใบงาน REF-118 ขอคืนเงินเมื่อของไม่ถึง ผ่านด่าน DoR และด่าน DoD โดยติ๊กครบทุกข้อ หลังปล่อยแสดงว่าปล่อยแล้ว ไม่มีงานย้อนกลับ',
    viewBox: '0 0 300 300',
    Screen: PassedFlow,
  },
];

/** s6 hero: the same refund ticket skipping vs passing DoR/DoD; skipping only moves the bug to next sprint. */
export const RefundStoryGates: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels
    panels={PANELS}
    columns={2}
    narrow="stack"
    className={className}
  />
);
