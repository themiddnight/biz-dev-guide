import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { estimateTextWidth } from './shared/DocCard';
import { OkTick, WarnBang } from './shared/glyphs';

/*
 * s16 hero: the P&L of order #A1024 in two panels, a normal sale vs a refund the bug lets through
 * without the goods coming back. Each panel is viewBox 0 0 300 204 (2-up at container ≥ 640px
 * renders ≈ 314px wide, stacked at a 375px viewport ≈ 317px, so fontSize 10 never renders under 10px).
 * The numbers are the "ขายปกติ" and "คืนเงิน ไม่ได้ของคืน" columns of the s16 table `s16-refund-pnl`
 * (chapterContentBlocks.ts), illustrative like the table: 1,290 − 780 − 50 − 39 = 421, and
 * −780 − 50 − 39 − 30 = −899. Both panels share one money scale around a zero axis, so the bug panel
 * shows the revenue bar removed (dashed ghost) and the costs left standing.
 * Status is glyph + text, never colour alone. Panel labels and notes are HTML.
 */

const W = 300;
const H = 204;
const HEADER_H = 24;

const LABEL_X = 10;
const VALUE_X = W - 8; // right-aligned money
const ZERO_X = 162;
const SCALE = 0.058; // user units per baht: 1,290 → 75 right of zero
const ROWS_Y = 32;
const ROW_H = 26;
const BAR_H = 14;
const MIN_BAR = 2;

const RESULT_Y = 172;
const RESULT_H = 24;

interface Row {
  label: string;
  /** Signed baht, or null for a line that does not apply to this case. */
  amount: number | null;
}

const fmt = (amount: number) => `${amount < 0 ? '−' : '+'}฿${Math.abs(amount).toLocaleString('en-US')}`;

const SALE: Row[] = [
  { label: 'รายได้', amount: 1290 },
  { label: 'ทุนสินค้า', amount: -780 },
  { label: 'ค่าส่ง', amount: -50 },
  { label: 'ค่าธรรมเนียม 3%', amount: -39 },
  { label: 'เวลาแอดมิน', amount: null },
];

/* Refunded, goods never come back: revenue is returned to the customer, every cost stays. */
const BUG: Row[] = [
  { label: 'รายได้', amount: 0 },
  { label: 'ทุนสินค้า', amount: -780 },
  { label: 'ค่าส่ง', amount: -50 },
  { label: 'ค่าธรรมเนียม 3%', amount: -39 },
  { label: 'เวลาแอดมิน', amount: -30 },
];

/** Page frame, header with the order and the "illustrative" label, and the zero axis. */
const Page: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <rect x={1} y={1} width={W - 2} height={H - 2} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <path d={`M1,${HEADER_H} H${W - 1}`} stroke="var(--fig-border)" />
    <text x={LABEL_X} y={16} fontSize="10" fontWeight="700" fill="var(--fig-text)">
      #A1024 หูฟังไร้สาย ฿1,290
    </text>
    <text x={W - LABEL_X} y={16} textAnchor="end" fontSize="10" fill="var(--fig-text-2)">
      ตัวเลขสมมติ
    </text>
    <path
      d={`M${ZERO_X},${ROWS_Y - 2} V${ROWS_Y + 5 * ROW_H - 4}`}
      stroke="var(--fig-text-muted)"
      strokeWidth={1}
    />
    {children}
  </>
);

/** One P&L line: label, bar around the zero axis, signed amount. */
const Line: React.FC<{ row: Row; index: number; ghost?: boolean }> = ({ row, index, ghost = false }) => {
  const y = ROWS_Y + index * ROW_H;
  const mid = y + ROW_H / 2;
  const { amount } = row;
  const width = amount === null ? 0 : Math.max(MIN_BAR, Math.abs(amount) * SCALE);
  return (
    <g>
      <text x={LABEL_X} y={mid + 3.5} fontSize="10" fill="var(--fig-text-2)">
        {row.label}
      </text>
      {ghost && (
        <>
          <rect
            x={ZERO_X}
            y={mid - BAR_H / 2}
            width={1290 * SCALE}
            height={BAR_H}
            rx={3}
            fill="none"
            stroke="var(--fig-text-muted)"
            strokeDasharray="4 3"
          />
          <text x={ZERO_X + 5} y={mid + 3.5} fontSize="10" fill="var(--fig-text-2)">
            คืนลูกค้าแล้ว
          </text>
        </>
      )}
      {amount !== null && amount > 0 && (
        <rect
          x={ZERO_X}
          y={mid - BAR_H / 2}
          width={width}
          height={BAR_H}
          rx={3}
          fill="var(--fig-ok-bg)"
          stroke="var(--fig-ok-border)"
        />
      )}
      {amount !== null && amount < 0 && (
        <rect
          x={ZERO_X - width}
          y={mid - BAR_H / 2}
          width={width}
          height={BAR_H}
          rx={3}
          fill="var(--fig-surface-2)"
          stroke="var(--fig-text-muted)"
        />
      )}
      <text x={VALUE_X} y={mid + 3.5} textAnchor="end" fontSize="10" fill="var(--fig-text)">
        {amount === null ? '—' : amount === 0 ? '฿0' : fmt(amount)}
      </text>
    </g>
  );
};

/** Bottom line: glyph + text, centred as one group inside a tinted pill. */
const Result: React.FC<{ tone: 'ok' | 'warn'; text: string }> = ({ tone, text }) => {
  const ok = tone === 'ok';
  const x = 8;
  const width = W - 16;
  const glyph = 12;
  const gap = 5;
  const group = glyph + gap + estimateTextWidth(text);
  const gx = x + (width - group) / 2;
  const cy = RESULT_Y + RESULT_H / 2;
  return (
    <>
      <rect
        x={x}
        y={RESULT_Y}
        width={width}
        height={RESULT_H}
        rx={5}
        fill={ok ? 'var(--fig-ok-bg)' : 'var(--fig-warn-bg)'}
        stroke={ok ? 'var(--fig-ok-border)' : 'var(--fig-warn-border)'}
      />
      {ok ? <OkTick x={gx} y={cy - glyph / 2} size={glyph} /> : <WarnBang cx={gx + glyph / 2} cy={cy} r={glyph / 2} />}
      <text
        x={gx + glyph + gap}
        y={cy + 3.5}
        fontSize="10"
        fontWeight="700"
        fill={ok ? 'var(--fig-ok)' : 'var(--fig-warn)'}
      >
        {text}
      </text>
    </>
  );
};

const NormalSale: React.FC = () => (
  <Page>
    {SALE.map((row, i) => (
      <Line key={row.label} row={row} index={i} />
    ))}
    <Result tone="ok" text="เหลือต่อออเดอร์ +฿421" />
  </Page>
);

const RefundBug: React.FC = () => (
  <Page>
    {BUG.map((row, i) => (
      <Line key={row.label} row={row} index={i} ghost={i === 0} />
    ))}
    <Result tone="warn" text="เสียต่อออเดอร์ −฿899" />
  </Page>
);

const PANELS: FigurePanel[] = [
  {
    label: 'ขายปกติ',
    note: 'หักทุนสินค้า ค่าส่ง และค่าธรรมเนียมแล้ว ร้านเหลือ ฿421',
    title: 'งบกำไรขาดทุนของออเดอร์ #A1024 ที่ขายปกติ',
    desc: 'งบกำไรขาดทุนตัวเลขสมมติของออเดอร์ #A1024 หูฟังไร้สาย ฿1,290 รายได้บวก ฿1,290 หักทุนสินค้า ฿780 ค่าส่ง ฿50 และค่าธรรมเนียมรับชำระ 3% ฿39 ไม่มีค่าเวลาแอดมิน เหลือต่อออเดอร์บวก ฿421 พร้อมเครื่องหมายถูก',
    viewBox: `0 0 ${W} ${H}`,
    Screen: NormalSale,
  },
  {
    label: 'บั๊ก: คืนเงินแล้วไม่ได้ของคืน',
    note: 'ร้านเสียทั้งเงินและของ ต้องขายปกติ 3 ออเดอร์ถึงจะได้คืน',
    title: 'งบกำไรขาดทุนของออเดอร์ #A1024 ที่บั๊กคืนเงินโดยไม่ได้ของคืน',
    desc: 'งบกำไรขาดทุนตัวเลขสมมติของออเดอร์ #A1024 เดิมเมื่อบั๊กเปิดให้คืนเงินทั้งที่ของส่งถึงแล้ว แถบรายได้ ฿1,290 เป็นเส้นประเพราะคืนลูกค้าแล้ว รายได้เป็น ฿0 แต่ทุนสินค้า ฿780 ค่าส่ง ฿50 ค่าธรรมเนียม ฿39 และเวลาแอดมิน ฿30 ยังอยู่ ผลคือเสียต่อออเดอร์ ฿899 พร้อมเครื่องหมายตกใจ',
    viewBox: `0 0 ${W} ${H}`,
    Screen: RefundBug,
  },
];

/** s16 hero: order #A1024 from sale price to profit, and what the refund bug removes from it. */
export const RefundUnitEconomics: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels panels={PANELS} columns={2} narrow="stack" className={className} />
);
