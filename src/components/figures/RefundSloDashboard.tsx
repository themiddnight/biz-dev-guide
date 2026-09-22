import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { OkTick, WarnBang } from './shared/glyphs';
import { estimateTextWidth } from './shared/DocCard';

/*
 * s10 hero: two monitoring-dashboard panels of the refund API's success rate, 09:00–11:00
 * (chapter figure briefs 2026-09-22, s10). Each panel is viewBox 0 0 300 220: header,
 * a line chart (y 99%–100%, x 09:00–11:00) drawn from a small data array, and in panel 1 a
 * note box. Panel 1 has only the SLA line and breaches it; panel 2 adds an SLO line above it,
 * alerts at the SLO crossing, recovers, and never reaches the SLA.
 * Line labels sit beside (below) their line on the left, where the curve is flat at the top.
 * Status is glyph + text, never colour alone. Panel labels and notes are HTML.
 */

const W = 300;
const PLOT_X0 = 44; // 09:00
const PLOT_X1 = 274; // 11:00
const PLOT_MINUTES = 120;
const Y_TOP = 36; // 100%
const Y_BOTTOM = 156; // 99%
const V_TOP = 100;
const V_BOTTOM = 99;

const SLA = 99.5;
const SLO = 99.9;

/** Minutes after 09:00 → x. */
const xAt = (min: number) => PLOT_X0 + (min / PLOT_MINUTES) * (PLOT_X1 - PLOT_X0);
/** Success rate (%) → y. */
const yAt = (v: number) => Y_TOP + ((V_TOP - v) / (V_TOP - V_BOTTOM)) * (Y_BOTTOM - Y_TOP);

/** [minutes after 09:00, success rate %] */
type Series = [number, number][];

const toPath = (series: Series) =>
  series.map(([m, v], i) => `${i === 0 ? 'M' : 'L'}${xAt(m).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');

/* Same shape up to 10:00; panel 1 keeps falling through the SLA at 10:30, panel 2 is fixed at 10:20. */
const SERIES_SLA_ONLY: Series = [
  [0, 99.95],
  [30, 99.96],
  [60, 99.94],
  [75, 99.8],
  [90, SLA], // 10:30 crossing
  [100, 99.3],
  [110, 99.25],
  [120, 99.3],
];

const SERIES_WITH_SLO: Series = [
  [0, 99.95],
  [30, 99.96],
  [60, 99.95],
  [65, SLO], // 10:05 alert
  [70, 99.8],
  [75, 99.76],
  [80, SLO], // 10:20 fixed
  [90, 99.95],
  [120, 99.96],
];

const Y_TICKS = [
  { v: 100, label: '100%' },
  { v: 99.5, label: '99.5%' },
  { v: 99, label: '99%' },
];
const X_TICKS = [
  { m: 0, label: '09:00' },
  { m: 60, label: '10:00' },
  { m: 120, label: '11:00' },
];

/** Frame, header, grid, axes, the SLA line with its label, and the success-rate curve. */
const Chart: React.FC<{ series: Series; children?: React.ReactNode }> = ({ series, children }) => {
  const slaY = yAt(SLA);
  return (
    <>
      <rect x={1} y={1} width={W - 2} height={218} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
      <path d={`M1,24 H${W - 1}`} stroke="var(--fig-border)" />
      <text x={10} y={16} fontSize="10" fontWeight="700" fill="var(--fig-text)">
        API คืนเงิน · อัตราสำเร็จ
      </text>

      {Y_TICKS.map((t) => (
        <g key={t.label}>
          <path d={`M${PLOT_X0},${yAt(t.v)} H${PLOT_X1}`} stroke="var(--fig-border)" strokeWidth={0.75} />
          <text x={PLOT_X0 - 4} y={yAt(t.v) + 3.5} textAnchor="end" fontSize="10" fill="var(--fig-text-muted)">
            {t.label}
          </text>
        </g>
      ))}
      {X_TICKS.map((t) => (
        <g key={t.label}>
          <path d={`M${xAt(t.m)},${Y_BOTTOM} V${Y_BOTTOM + 4}`} stroke="var(--fig-border)" />
          <text x={xAt(t.m)} y={Y_BOTTOM + 15} textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">
            {t.label}
          </text>
        </g>
      ))}

      {/* SLA: dashed warn line, label below it on the left (curve is at the top there). */}
      <path
        d={`M${PLOT_X0},${slaY} H${PLOT_X1}`}
        stroke="var(--fig-warn)"
        strokeWidth={1.5}
        strokeDasharray="5 3"
      />
      <text x={PLOT_X0 + 4} y={slaY + 13} fontSize="10" fontWeight="700" fill="var(--fig-warn)">
        SLA 99.5%
      </text>
      <text x={PLOT_X0 + 4} y={slaY + 26} fontSize="10" fill="var(--fig-warn)">
        (สัญญากับลูกค้า)
      </text>

      {children}

      <path
        d={toPath(series)}
        fill="none"
        stroke="var(--fig-text-2)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </>
  );
};

const NOTE_TEXT = 'ลูกค้าแจ้งเข้ามาก่อนทีมรู้';
const OK_NOTE_TEXT = 'ทีมรู้ก่อนลูกค้าเจอปัญหา';

const SlaOnlyScreen: React.FC = () => {
  const cx = xAt(90);
  const cy = yAt(SLA);
  const noteW = Math.ceil(estimateTextWidth(NOTE_TEXT)) + 24;
  return (
    <Chart series={SERIES_SLA_ONLY}>
      {/* Breach marker at the crossing; label centred under the dip. */}
      <path d={`M${cx},${cy + 7} V${cy + 40}`} stroke="var(--fig-warn)" strokeDasharray="2 2" />
      <text x={cx} y={cy + 52} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--fig-warn)">
        ผิดสัญญา 10:30
      </text>
      <circle cx={cx} cy={cy} r={7} fill="var(--fig-bg)" />
      <WarnBang cx={cx} cy={cy} r={6} />

      <rect
        x={(W - noteW) / 2}
        y={182}
        width={noteW}
        height={26}
        rx={5}
        fill="var(--fig-surface-2)"
        stroke="var(--fig-border)"
      />
      <text x={W / 2} y={199} textAnchor="middle" fontSize="10" fill="var(--fig-text)">
        {NOTE_TEXT}
      </text>
    </Chart>
  );
};

const WithSloScreen: React.FC = () => {
  const sloY = yAt(SLO);
  const alertX = xAt(65);
  const fixX = xAt(80);
  const okNoteW = Math.ceil(estimateTextWidth(OK_NOTE_TEXT)) + 32;
  return (
    <Chart series={SERIES_WITH_SLO}>
      {/* SLO: solid accent line, label below it on the left. */}
      <path d={`M${PLOT_X0},${sloY} H${PLOT_X1}`} stroke="var(--fig-accent)" strokeWidth={1.5} />
      <text x={PLOT_X0 + 4} y={sloY + 13} fontSize="10" fontWeight="700" fill="var(--fig-accent)">
        SLO 99.9%
      </text>
      <text x={PLOT_X0 + 4} y={sloY + 26} fontSize="10" fill="var(--fig-accent)">
        (เป้าของทีม)
      </text>

      {/* Marker labels sit in the band between SLO and SLA, beside the dip, never on the curve. */}
      <path d={`M${alertX},${sloY + 6} V${sloY + 38}`} stroke="var(--fig-warn)" strokeDasharray="2 2" />
      <text x={alertX - 5} y={sloY + 42} textAnchor="end" fontSize="10" fontWeight="700" fill="var(--fig-warn)">
        แจ้งเตือน 10:05
      </text>
      <text x={fixX + 11} y={sloY + 16} fontSize="10" fontWeight="700" fill="var(--fig-ok)">
        แก้แล้ว 10:20
      </text>

      <rect
        x={(W - okNoteW) / 2}
        y={182}
        width={okNoteW}
        height={26}
        rx={5}
        fill="var(--fig-ok-bg)"
        stroke="var(--fig-ok-border)"
      />
      <OkTick x={(W - okNoteW) / 2 + 8} y={190} size={10} />
      <text x={(W - okNoteW) / 2 + 24} y={199} fontSize="10" fill="var(--fig-text)">
        {OK_NOTE_TEXT}
      </text>

      <circle cx={alertX} cy={sloY} r={6} fill="var(--fig-bg)" />
      <WarnBang cx={alertX} cy={sloY} r={5} />
      <circle cx={fixX} cy={sloY} r={7} fill="var(--fig-ok-bg)" stroke="var(--fig-ok-border)" />
      <OkTick x={fixX - 5} y={sloY - 5} size={10} />
    </Chart>
  );
};

const PANELS: FigurePanel[] = [
  {
    label: 'มีแค่ SLA',
    note: 'รู้ตัวตอนผิดสัญญาแล้ว',
    title: 'กราฟอัตราสำเร็จที่มีแค่เส้น SLA',
    desc: 'กราฟอัตราสำเร็จของ API คืนเงินช่วง 09:00 ถึง 11:00 เส้นกราฟอยู่ราว 99.95% แล้วดิ่งลงตัดเส้นประ SLA 99.5% (สัญญากับลูกค้า) พร้อมเครื่องหมายเตือนผิดสัญญา 10:30 และกล่องบันทึกว่าลูกค้าแจ้งเข้ามาก่อนทีมรู้',
    viewBox: '0 0 300 220',
    Screen: SlaOnlyScreen,
  },
  {
    label: 'มี SLO เหนือ SLA',
    note: 'เตือนก่อน แก้ทันก่อนผิดสัญญา',
    title: 'กราฟอัตราสำเร็จที่มีเส้น SLO เหนือ SLA',
    desc: 'กราฟอัตราสำเร็จของ API คืนเงินแกนเดียวกัน มีเส้น SLO 99.9% (เป้าของทีม) อยู่เหนือเส้นประ SLA 99.5% เส้นกราฟดิ่งลงตัดเส้น SLO พร้อมเครื่องหมายแจ้งเตือน 10:05 แล้วกลับขึ้นพร้อมเครื่องหมายถูกแก้แล้ว 10:20 โดยจุดต่ำสุดยังอยู่เหนือเส้น SLA และกล่องบันทึกว่าทีมรู้ก่อนลูกค้าเจอปัญหา',
    viewBox: '0 0 300 220',
    Screen: WithSloScreen,
  },
];

/** s10 hero: the same refund-API dip with only an SLA line vs with an SLO line above it. */
export const RefundSloDashboard: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels panels={PANELS} columns={2} narrow="stack" className={className} />
);
