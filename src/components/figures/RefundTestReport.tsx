import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { OkTick, WarnBang } from './shared/glyphs';

/*
 * s7 hero: two CI test-run reports for the same refund feature (chapter figure briefs
 * 2026-09-22, s7). Each panel is viewBox 0 0 300 230: header, three layer rows
 * (E2E / Integration / Unit, top to bottom) with a centred bar whose width ∝ test count,
 * then a footer with the run result. The bars' outline forms the shape: inverted cone vs pyramid.
 * Status is glyph + text, never colour alone. Panel labels and notes are HTML.
 */

const W = 300;
const MID = W / 2;
const BAR_MAX = 280;
const ROW_H = 52;
const ROWS_Y = 32;
const FOOTER_Y = 194;

type BarTone = 'warn' | 'ok' | 'neutral';

const BAR_TONES: Record<BarTone, { fill: string; stroke: string }> = {
  warn: { fill: 'var(--fig-warn-bg)', stroke: 'var(--fig-warn-border)' },
  ok: { fill: 'var(--fig-ok-bg)', stroke: 'var(--fig-ok-border)' },
  neutral: { fill: 'var(--fig-surface-2)', stroke: 'var(--fig-border)' },
};

interface ReportRowProps {
  y: number;
  layer: string;
  count: number;
  /** Largest count in the report; that row's bar spans BAR_MAX. */
  maxCount: number;
  time: string;
  tone: BarTone;
  /** Optional sample test name under the bar (--fig-text-muted). */
  sample?: string;
}

/** One report row: "layer  n ข้อ" + run time on top, centred bar (width ∝ count), optional sample test. */
const ReportRow: React.FC<ReportRowProps> = ({ y, layer, count, maxCount, time, tone, sample }) => {
  const width = Math.max(8, (count / maxCount) * BAR_MAX);
  const t = BAR_TONES[tone];
  return (
    <g>
      <text x={10} y={y + 11} fontSize="10" fill="var(--fig-text)">
        <tspan fontWeight="700">{layer}</tspan>
        <tspan dx={6} fill="var(--fig-text-2)">
          {count} ข้อ
        </tspan>
      </text>
      <text x={W - 10} y={y + 11} textAnchor="end" fontSize="10" fill="var(--fig-text-2)">
        {time}
      </text>
      <rect x={MID - width / 2} y={y + 17} width={width} height={14} rx={3} fill={t.fill} stroke={t.stroke} />
      {sample && (
        <text x={MID} y={y + 44} textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">
          {sample}
        </text>
      )}
    </g>
  );
};

interface RowData {
  layer: string;
  count: number;
  time: string;
  tone: BarTone;
  sample?: string;
}

interface ReportProps {
  rows: RowData[];
  outcome: 'warn' | 'ok';
  result: string;
  total: string;
}

const Report: React.FC<ReportProps> = ({ rows, outcome, result, total }) => {
  const maxCount = Math.max(...rows.map((r) => r.count));
  const warn = outcome === 'warn';
  return (
    <>
      <rect x={1} y={1} width={W - 2} height={228} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
      <path d={`M1,24 H${W - 1}`} stroke="var(--fig-border)" />
      <text x={10} y={16} fontSize="10" fontWeight="700" fill="var(--fig-text)">
        ผลรันเทสต์ · ขอคืนเงิน
      </text>
      {rows.map((r, i) => (
        <ReportRow key={r.layer} y={ROWS_Y + i * ROW_H} maxCount={maxCount} {...r} />
      ))}
      <rect
        x={6}
        y={FOOTER_Y}
        width={W - 12}
        height={29}
        rx={5}
        fill={warn ? 'var(--fig-warn-bg)' : 'var(--fig-ok-bg)'}
        stroke={warn ? 'var(--fig-warn-border)' : 'var(--fig-ok-border)'}
      />
      {warn ? <WarnBang cx={20} cy={FOOTER_Y + 14.5} r={6} /> : <OkTick x={13} y={FOOTER_Y + 7.5} size={14} />}
      <text x={32} y={FOOTER_Y + 18} fontSize="10" fontWeight="700" fill={warn ? 'var(--fig-warn)' : 'var(--fig-ok)'}>
        {result}
      </text>
      <text x={W - 14} y={FOOTER_Y + 18} textAnchor="end" fontSize="10" fontWeight="700" fill="var(--fig-text)">
        {total}
      </text>
    </>
  );
};

const ConeReport: React.FC = () => (
  <Report
    rows={[
      { layer: 'E2E', count: 60, time: '18 นาที', tone: 'warn' },
      { layer: 'Integration', count: 15, time: '4 นาที', tone: 'neutral' },
      { layer: 'Unit', count: 5, time: '5 วินาที', tone: 'neutral' },
    ]}
    outcome="warn"
    result="ล้ม 3 ข้อแบบสุ่ม (Flaky)"
    total="รวม 22 นาที"
  />
);

const PyramidReport: React.FC = () => (
  <Report
    rows={[
      { layer: 'E2E', count: 20, time: '3 นาที', tone: 'neutral', sample: 'ลูกค้ากดขอคืนเงินจนจบ' },
      { layer: 'Integration', count: 40, time: '1 นาที', tone: 'neutral', sample: 'API คืนเงินบันทึกลงฐานข้อมูล' },
      { layer: 'Unit', count: 140, time: '20 วินาที', tone: 'ok', sample: 'คำนวณยอดคืนเงิน' },
    ]}
    outcome="ok"
    result="ผ่านทั้งหมด"
    total="รวม 4 นาที"
  />
);

const PANELS: FigurePanel[] = [
  {
    label: 'ทีม A: เทสต์กองบนยอด',
    note: 'รันช้า ล้มมั่ว ไม่มีใครกล้าปล่อย',
    title: 'รายงานผลเทสต์แบบกรวยกลับหัว',
    desc: 'รายงานผลรันเทสต์ขอคืนเงิน แถบ E2E 60 ข้อกว้างที่สุดใช้ 18 นาที Integration 15 ข้อใช้ 4 นาที Unit 5 ข้อแคบที่สุดใช้ 5 วินาที ท้ายรายงานเตือนว่าล้ม 3 ข้อแบบสุ่ม (Flaky) รวม 22 นาที',
    viewBox: '0 0 300 230',
    Screen: ConeReport,
  },
  {
    label: 'ทีม B: พีระมิด',
    note: 'ส่วนใหญ่เป็น Unit (70/20/10)',
    title: 'รายงานผลเทสต์แบบพีระมิด',
    desc: 'รายงานผลรันเทสต์ขอคืนเงิน แถบ E2E 20 ข้อแคบที่สุดใช้ 3 นาที เช่น ลูกค้ากดขอคืนเงินจนจบ Integration 40 ข้อใช้ 1 นาที เช่น API คืนเงินบันทึกลงฐานข้อมูล Unit 140 ข้อกว้างที่สุดใช้ 20 วินาที เช่น คำนวณยอดคืนเงิน ท้ายรายงานผ่านทั้งหมด รวม 4 นาที',
    viewBox: '0 0 300 230',
    Screen: PyramidReport,
  },
];

/** s7 hero: the same refund feature's test run as an inverted cone vs a pyramid. */
export const RefundTestReport: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels panels={PANELS} columns={2} narrow="stack" className={className} />
);
