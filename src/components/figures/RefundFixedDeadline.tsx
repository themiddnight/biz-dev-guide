import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { estimateTextWidth } from './shared/DocCard';
import { OkTick, WarnBang } from './shared/glyphs';

/*
 * s17 hero: the 11.11 campaign calendar in two panels, the full automatic-refund system vs the
 * scope cut to fit the date (chapter text: 3 weeks left, about 5 weeks of work, so the manual
 * path ships on the date and the automatic approval follows 2 weeks later).
 * Each panel is viewBox 0 0 300 200 (2-up at container ≥ 640px ≈ 314px wide, stacked at a 375px
 * viewport ≈ 317px, so fontSize 10 never renders under 10px). Both panels share one week axis:
 * a calendar strip of 6 week cells, the locked date line after week 3, and one work bar on
 * weeks 1–5. Status is glyph + text, never colour alone. Panel labels and notes are HTML.
 */

const W = 300;
const H = 200;
const HEADER_H = 24;

const X0 = 10;
const WEEK_W = (W - 2 * X0) / 6;
const weekX = (week: number) => X0 + week * WEEK_W;
const DATE_X = weekX(3); // 11.11 falls at the end of week 3
const WORK_END_X = weekX(5);

const STRIP_Y = 38;
const STRIP_H = 22;
const FLAG_Y = 68;
const FLAG_H = 18;
const BAR_Y = 98;
const BAR_H = 24;
const RESULT_Y = 166;
const RESULT_H = 24;

/** Padlock drawn as a body + shackle (no font glyph). */
const Lock: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g stroke="var(--fig-warn)" fill="none">
    <path d={`M${x + 2},${y + 5} V${y + 3} a3,3 0 0 1 6,0 V${y + 5}`} strokeWidth={1.4} />
    <rect x={x} y={y + 5} width={10} height={7} rx={1.5} fill="var(--fig-warn-bg)" strokeWidth={1.4} />
  </g>
);

const FLAG_TEXT = '11.11 เลื่อนไม่ได้';

/** Frame, header, the week strip, and the locked date flag with its line down to the work bar. */
const Calendar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const flagW = Math.ceil(estimateTextWidth(FLAG_TEXT)) + 38;
  return (
    <>
      <rect x={1} y={1} width={W - 2} height={H - 2} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
      <path d={`M1,${HEADER_H} H${W - 1}`} stroke="var(--fig-border)" />
      <text x={X0} y={16} fontSize="10" fontWeight="700" fill="var(--fig-text)">
        ปฏิทินแคมเปญ · นับจากวันนี้
      </text>
      <text x={W - X0} y={16} textAnchor="end" fontSize="10" fill="var(--fig-text-muted)">
        สัปดาห์
      </text>

      {Array.from({ length: 6 }, (_, i) => (
        <g key={i}>
          <rect
            x={weekX(i) + 1}
            y={STRIP_Y}
            width={WEEK_W - 2}
            height={STRIP_H}
            rx={4}
            fill="var(--fig-surface-2)"
            stroke="var(--fig-border)"
          />
          <text x={weekX(i) + WEEK_W / 2} y={STRIP_Y + 15} textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">
            {i + 1}
          </text>
        </g>
      ))}

      <path d={`M${DATE_X},${STRIP_Y - 4} V${BAR_Y + BAR_H + 6}`} stroke="var(--fig-warn)" strokeWidth={1.5} />
      <rect
        x={DATE_X - flagW / 2}
        y={FLAG_Y}
        width={flagW}
        height={FLAG_H}
        rx={FLAG_H / 2}
        fill="var(--fig-warn-bg)"
        stroke="var(--fig-warn-border)"
      />
      <Lock x={DATE_X - flagW / 2 + 8} y={FLAG_Y + 3} />
      <text x={DATE_X - flagW / 2 + 24} y={FLAG_Y + 12.5} fontSize="10" fontWeight="700" fill="var(--fig-warn)">
        {FLAG_TEXT}
      </text>
      {children}
    </>
  );
};

const Result: React.FC<{ tone: 'ok' | 'warn'; text: string }> = ({ tone, text }) => {
  const ok = tone === 'ok';
  const x = 8;
  const width = W - 16;
  const glyph = 12;
  const gap = 5;
  const group = glyph + gap + estimateTextWidth(text) * 1.08; // bold runs wider than the regular estimate
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

/* ---------- Panel 1: everything, past the date ---------- */

const FullScope: React.FC = () => (
  <Calendar>
    <rect
      x={X0}
      y={BAR_Y}
      width={DATE_X - X0}
      height={BAR_H}
      rx={4}
      fill="var(--fig-accent-bg)"
      stroke="var(--fig-accent-border)"
    />
    <text x={X0 + 8} y={BAR_Y + 16} fontSize="10" fill="var(--fig-accent)">
      ระบบอัตโนมัติครบชุด
    </text>
    <rect
      x={DATE_X}
      y={BAR_Y}
      width={WORK_END_X - DATE_X}
      height={BAR_H}
      rx={4}
      fill="var(--fig-warn-bg)"
      stroke="var(--fig-warn-border)"
    />
    <WarnBang cx={DATE_X + 14} cy={BAR_Y + BAR_H / 2} r={5.5} />
    <text x={DATE_X + 25} y={BAR_Y + 16} fontSize="10" fontWeight="700" fill="var(--fig-warn)">
      เกินวัน
    </text>
    <text x={DATE_X + 4} y={BAR_Y + BAR_H + 18} fontSize="10" fill="var(--fig-text-2)">
      ต้องการอีก 2 สัปดาห์
    </text>
    <Result tone="warn" text="ไม่ทันวันเปิดขาย" />
  </Calendar>
);

/* ---------- Panel 2: scope cut to the date ---------- */

const CutScope: React.FC = () => (
  <Calendar>
    <rect
      x={X0}
      y={BAR_Y}
      width={DATE_X - X0}
      height={BAR_H}
      rx={4}
      fill="var(--fig-ok-bg)"
      stroke="var(--fig-ok-border)"
    />
    <OkTick x={X0 + 6} y={BAR_Y + 7} size={10} />
    <text x={X0 + 22} y={BAR_Y + 16} fontSize="10" fill="var(--fig-text)">
      แอดมินอนุมัติเอง
    </text>
    <rect
      x={DATE_X}
      y={BAR_Y}
      width={WORK_END_X - DATE_X}
      height={BAR_H}
      rx={4}
      fill="var(--fig-bg)"
      stroke="var(--fig-text-muted)"
      strokeDasharray="4 3"
    />
    <text x={DATE_X + 8} y={BAR_Y + 16} fontSize="10" fill="var(--fig-text-muted)">
      ตามมาทีหลัง
    </text>
    <text x={DATE_X + 4} y={BAR_Y + BAR_H + 18} fontSize="10" fill="var(--fig-text-2)">
      อนุมัติอัตโนมัติ +2 สัปดาห์
    </text>
    <Result tone="ok" text="ตัดขอบเขต ไม่ตัดการทดสอบ" />
  </Calendar>
);

const PANELS: FigurePanel[] = [
  {
    label: 'ก่อน: ทำครบชุด',
    note: 'ทั้งชุดใช้ราว 5 สัปดาห์ แต่เหลือ 3 และวันเปิดขายขยับไม่ได้',
    title: 'ปฏิทินแคมเปญ 11.11 ที่ทำระบบคืนเงินอัตโนมัติครบชุด',
    desc: 'ปฏิทินแคมเปญนับเป็นสัปดาห์ 6 ช่อง เส้นล็อกวัน 11.11 เลื่อนไม่ได้อยู่หลังสัปดาห์ที่ 3 แถบงานระบบอัตโนมัติครบชุดยาวถึงสัปดาห์ที่ 5 ส่วนที่เกินเส้นวันเป็นสีเหลืองพร้อมเครื่องหมายตกใจและคำว่าเกินวัน ต้องการอีก 2 สัปดาห์ สรุปว่าไม่ทันวันเปิดขาย',
    viewBox: `0 0 ${W} ${H}`,
    Screen: FullScope,
  },
  {
    label: 'หลัง: ตัดขอบเขต',
    note: 'วันไม่ขยับ ขอบเขตขยับ ของจำเป็นทันวัน ที่เหลือตามมา',
    title: 'ปฏิทินแคมเปญ 11.11 ที่ตัดขอบเขตให้ทันวัน',
    desc: 'ปฏิทินแคมเปญแกนสัปดาห์เดียวกัน เส้นล็อกวัน 11.11 อยู่หลังสัปดาห์ที่ 3 แถบแอดมินอนุมัติเองจบก่อนเส้นวันพร้อมเครื่องหมายถูก ส่วนอนุมัติอัตโนมัติเป็นกรอบเส้นประหลังวัน ตามมาทีหลังอีก 2 สัปดาห์ สรุปว่าตัดขอบเขต ไม่ตัดการทดสอบ',
    viewBox: `0 0 ${W} ${H}`,
    Screen: CutScope,
  },
];

/** s17 hero: the 11.11 date is locked; the same work either overruns it or is cut to fit before it. */
export const RefundFixedDeadline: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels panels={PANELS} columns={2} narrow="stack" className={className} />
);
