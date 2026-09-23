import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { OkTick, WarnBang } from './shared/glyphs';

/*
 * s8 hero: two deployment-history pages for the refund feature (chapter figure briefs
 * 2026-09-22, s8). Each panel is viewBox 0 0 300 240 with the header "ประวัติการปล่อย".
 * Big batch: one quarterly release of 48 changes fails and is rolled back whole.
 * Small batches: one change per day, each row with pipeline chips (Build ✓ Test ✓ 5%);
 * the bad change rolls back automatically and is re-released fixed.
 * Status is glyph + text, never colour alone; the ✓ in chips is a drawn OkTick.
 * Panel labels and notes are HTML.
 */

const W = 300;
const H = 240;

/** Page frame + header bar shared by both panels. */
const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <rect x={1} y={1} width={W - 2} height={H - 2} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <path d={`M1,24 H${W - 1}`} stroke="var(--fig-border)" />
    <text x={10} y={16} fontSize="10" fontWeight="700" fill="var(--fig-text)">
      ประวัติการปล่อย
    </text>
    {children}
  </>
);

/* ---------- Panel 1: one big quarterly release ---------- */

const BIG_Y = 32;
const BIG_H = 84;
const CHANGE_COUNT = 48;
const CELL = 8;
const CELL_GAP = 3;
const CELLS_PER_ROW = 24;

const BigBatchLog: React.FC = () => (
  <Page>
    <rect
      x={6}
      y={BIG_Y}
      width={W - 12}
      height={BIG_H}
      rx={5}
      fill="var(--fig-warn-bg)"
      stroke="var(--fig-warn-border)"
    />
    <text x={14} y={BIG_Y + 17} fontSize="10" fontWeight="700" fill="var(--fig-text)">
      v3.0 · 1 ต.ค.
    </text>
    <text x={14} y={BIG_Y + 33} fontSize="10" fill="var(--fig-text-2)">
      48 การเปลี่ยนแปลง
    </text>
    <WarnBang cx={W - 46} cy={BIG_Y + 13.5} r={6} />
    <text x={W - 36} y={BIG_Y + 17} fontSize="10" fontWeight="700" fill="var(--fig-warn)">
      ล้ม
    </text>
    {/* 48 change cells bundled into the one release (2 rows of 24). */}
    {Array.from({ length: CHANGE_COUNT }, (_, i) => {
      const col = i % CELLS_PER_ROW;
      const row = Math.floor(i / CELLS_PER_ROW);
      return (
        <rect
          key={i}
          x={18 + col * (CELL + CELL_GAP)}
          y={BIG_Y + 46 + row * (CELL + CELL_GAP)}
          width={CELL}
          height={CELL}
          rx={1.5}
          fill="var(--fig-surface-2)"
          stroke="var(--fig-border)"
        />
      );
    })}
    <text x={14} y={146} fontSize="10" fill="var(--fig-text-2)">
      ตัวไหนพัง? ยังหาไม่เจอ
    </text>
    <text x={14} y={170} fontSize="10" fill="var(--fig-text-2)">
      ย้อนทั้งก้อน
    </text>
    <text x={14} y={194} fontSize="10" fill="var(--fig-text-2)">
      ของที่ไม่เกี่ยวอีกหลายสิบอย่างถูกถอยตาม
    </text>
  </Page>
);

/* ---------- Panel 2: one small change per day ---------- */

const ROWS_Y = 30;
const ROW_PITCH = 51;
const ROW_H = 45;
const CHIP_H = 15;
const CHANGE_X = 36;
const STATUS_X = 204;

interface PipeChipProps {
  x: number;
  y: number;
  width: number;
  label: string;
  /** 'ok' draws a tick after the label, 'warn' a "!" disc; 'plain' is label only. */
  mark: 'ok' | 'warn' | 'plain';
}

/** Pipeline stage chip; width is fixed for the real (Latin) label, not the Thai estimate. */
const PipeChip: React.FC<PipeChipProps> = ({ x, y, width, label, mark }) => {
  const warn = mark === 'warn';
  return (
    <>
      <rect
        x={x}
        y={y}
        width={width}
        height={CHIP_H}
        rx={CHIP_H / 2}
        fill={warn ? 'var(--fig-warn-bg)' : 'var(--fig-surface-2)'}
        stroke={warn ? 'var(--fig-warn-border)' : 'var(--fig-border)'}
      />
      <text x={x + 7} y={y + 11} fontSize="10" fill={warn ? 'var(--fig-warn)' : 'var(--fig-text-2)'}>
        {label}
      </text>
      {mark === 'ok' && <OkTick x={x + width - 16} y={y + 2.5} size={10} />}
      {warn && <WarnBang cx={x + width - 10} cy={y + CHIP_H / 2} r={4.5} />}
    </>
  );
};

interface DayRow {
  day: string;
  change: string;
  /** Optional second muted line (after the chips). */
  sub?: string;
  outcome: 'ok' | 'warn';
}

const DAY_ROWS: DayRow[] = [
  { day: 'จ.', change: 'ปุ่มขอคืนเงิน', outcome: 'ok' },
  { day: 'อ.', change: 'แนบรูปหลักฐาน', outcome: 'ok' },
  { day: 'พ.', change: 'ตัวเลือกเหตุผล', outcome: 'warn' },
  { day: 'พฤ.', change: 'ตัวเลือกเหตุผล', sub: '(แก้แล้ว)', outcome: 'ok' },
];

const DeployRow: React.FC<DayRow & { y: number }> = ({ y, day, change, sub, outcome }) => {
  const warn = outcome === 'warn';
  const chipY = y + 22;
  return (
    <g>
      <rect
        x={6}
        y={y}
        width={W - 12}
        height={ROW_H}
        rx={5}
        fill={warn ? 'var(--fig-warn-bg)' : 'var(--fig-surface-2)'}
        stroke={warn ? 'var(--fig-warn-border)' : 'var(--fig-border)'}
      />
      <text x={12} y={y + 15} fontSize="10" fontWeight="700" fill="var(--fig-text)">
        {day}
      </text>
      <text x={CHANGE_X} y={y + 15} fontSize="10" fill="var(--fig-text)">
        {change}
      </text>
      {warn ? (
        <WarnBang cx={STATUS_X + 5} cy={y + 11.5} r={5} />
      ) : (
        <OkTick x={STATUS_X} y={y + 6} size={11} />
      )}
      <text
        x={STATUS_X + 14}
        y={y + 15}
        fontSize="10"
        fontWeight="700"
        fill={warn ? 'var(--fig-warn)' : 'var(--fig-ok)'}
      >
        {warn ? 'ย้อนอัตโนมัติ' : 'ปล่อยแล้ว'}
      </text>
      <PipeChip x={CHANGE_X} y={chipY} width={50} label="Build" mark="ok" />
      <PipeChip x={CHANGE_X + 54} y={chipY} width={44} label="Test" mark="ok" />
      <PipeChip x={CHANGE_X + 102} y={chipY} width={warn ? 40 : 28} label="5%" mark={warn ? 'warn' : 'plain'} />
      {sub && (
        <text x={CHANGE_X + 150} y={chipY + 11} fontSize="10" fill="var(--fig-text-muted)">
          {sub}
        </text>
      )}
    </g>
  );
};

const SmallBatchLog: React.FC = () => (
  <Page>
    {DAY_ROWS.map((r, i) => (
      <DeployRow key={r.day} y={ROWS_Y + i * ROW_PITCH} {...r} />
    ))}
  </Page>
);

const PANELS: FigurePanel[] = [
  {
    label: 'ปล่อยก้อนใหญ่ (ไตรมาสละครั้ง)',
    note: 'พังแล้วหาต้นเหตุไม่เจอ',
    title: 'ประวัติการปล่อยแบบก้อนใหญ่',
    desc: 'หน้าประวัติการปล่อยมีรายการเดียวคือ v3.0 วันที่ 1 ต.ค. ที่รวม 48 การเปลี่ยนแปลงและขึ้นเตือนว่าล้ม ด้านใต้บันทึกว่ายังหาไม่เจอว่าตัวไหนพัง ต้องย้อนทั้งก้อน และของที่ไม่เกี่ยวอีกหลายสิบอย่างถูกถอยตาม',
    viewBox: '0 0 300 240',
    Screen: BigBatchLog,
  },
  {
    label: 'ปล่อยชิ้นเล็ก (ทุกวัน)',
    note: 'พังชิ้นเดียว ย้อนชิ้นเดียว',
    title: 'ประวัติการปล่อยแบบชิ้นเล็กทุกวัน',
    desc: 'หน้าประวัติการปล่อยมีสี่รายการ แต่ละรายการผ่าน Build และ Test แล้วเปิดให้ผู้ใช้ 5% ก่อน วันจันทร์ปุ่มขอคืนเงินและวันอังคารแนบรูปหลักฐานปล่อยแล้ว วันพุธตัวเลือกเหตุผลถูกย้อนอัตโนมัติ และวันพฤหัสตัวเลือกเหตุผลที่แก้แล้วปล่อยแล้ว',
    viewBox: '0 0 300 240',
    Screen: SmallBatchLog,
  },
];

/** s8 hero: the refund feature's deployment history as one big release vs small daily ones. */
export const RefundDeployLog: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels panels={PANELS} columns={2} narrow="stack" className={className} />
);
