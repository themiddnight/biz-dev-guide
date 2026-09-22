import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { estimateTextWidth } from './shared/DocCard';
import { OkTick, WarnBang } from './shared/glyphs';

/*
 * s11 hero: one change request read by two KPI dashboards (chapter figure briefs 2026-09-22, s11).
 * HTML request row → two panels (viewBox 0 0 300 200, 2-up ≥ 640px, stacked below) → HTML reply
 * row with an ok left border. The rows are HTML siblings of <FigurePanels> because its footer is
 * wide-only. Status is glyph + text, never colour alone; arrows are drawn as paths.
 */

const W = 300;
const H = 200;
const HEADER_H = 24;

type Tone = 'ok' | 'warn';

const TONES: Record<Tone, { fill: string; stroke: string; text: string }> = {
  ok: { fill: 'var(--fig-ok-bg)', stroke: 'var(--fig-ok-border)', text: 'var(--fig-ok)' },
  warn: { fill: 'var(--fig-warn-bg)', stroke: 'var(--fig-warn-border)', text: 'var(--fig-warn)' },
};

/** Dashboard frame with a header strip ("KPI: ..."). */
const Frame: React.FC<{ header: string }> = ({ header }) => (
  <>
    <rect x={1} y={1} width={W - 2} height={H - 2} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <path d={`M1,${HEADER_H} H${W - 1}`} stroke="var(--fig-border)" />
    <text x={10} y={16} fontSize="10" fontWeight="700" fill="var(--fig-text)">
      {header}
    </text>
  </>
);

interface StatusPillProps {
  x: number;
  y: number;
  width: number;
  tone: Tone;
  text: string;
}

/** Status row: glyph (✓ or "!") + text, centred as one group inside a tinted pill. */
const StatusPill: React.FC<StatusPillProps> = ({ x, y, width, tone, text }) => {
  const t = TONES[tone];
  const h = 24;
  const glyph = 12;
  const gap = 4;
  const group = glyph + gap + estimateTextWidth(text);
  const gx = x + (width - group) / 2;
  const cy = y + h / 2;
  return (
    <>
      <rect x={x} y={y} width={width} height={h} rx={5} fill={t.fill} stroke={t.stroke} />
      {tone === 'ok' ? (
        <OkTick x={gx} y={cy - glyph / 2} size={glyph} />
      ) : (
        <WarnBang cx={gx + glyph / 2} cy={cy} r={glyph / 2} />
      )}
      <text x={gx + glyph + gap} y={cy + 3.5} fontSize="10" fontWeight="700" fill={t.text}>
        {text}
      </text>
    </>
  );
};

/** Vertical arrow drawn as a shaft + filled head; `up` points to the top. */
const Arrow: React.FC<{ cx: number; top: number; bottom: number; up: boolean; color: string; head?: number }> = ({
  cx,
  top,
  bottom,
  up,
  color,
  head = 12,
}) => {
  const tip = up ? top : bottom;
  const base = up ? top + head * 1.4 : bottom - head * 1.4;
  const tail = up ? bottom : top;
  return (
    <>
      <path d={`M${cx},${tail} L${cx},${base}`} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <path d={`M${cx - head},${base} L${cx},${tip} L${cx + head},${base} Z`} fill={color} />
    </>
  );
};

/* ---------- Panel 1: Business dashboard ---------- */

const B_TILE_W = 90;
const B_TILE_Y = 34;
const B_TILE_H = 156;
const B_TILES_X = [10, 105, 200];

const BizTile: React.FC<{ x: number; title: string; status: string; children: React.ReactNode }> = ({
  x,
  title,
  status,
  children,
}) => (
  <g>
    <rect x={x} y={B_TILE_Y} width={B_TILE_W} height={B_TILE_H} rx={5} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <text x={x + B_TILE_W / 2} y={B_TILE_Y + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--fig-text)">
      {title}
    </text>
    {children}
    <StatusPill x={x + 4} y={B_TILE_Y + 118} width={B_TILE_W - 8} tone="ok" text={status} />
  </g>
);

const BusinessDashboard: React.FC = () => {
  const [a, b, c] = B_TILES_X;
  const mid = (x: number) => x + B_TILE_W / 2;
  return (
    <>
      <Frame header="KPI: เร็ว · รายได้" />
      <BizTile x={a} title="ยอดขาย" status="คาดว่าเพิ่ม">
        <Arrow cx={mid(a)} top={B_TILE_Y + 38} bottom={B_TILE_Y + 100} up color="var(--fig-ok)" />
      </BizTile>
      <BizTile x={b} title="เรื่องร้องเรียน" status="คาดว่าลด">
        <Arrow cx={mid(b)} top={B_TILE_Y + 38} bottom={B_TILE_Y + 100} up={false} color="var(--fig-ok)" />
      </BizTile>
      <BizTile x={c} title="ออกทันแคมเปญ" status="ทันศุกร์">
        <circle cx={mid(c)} cy={B_TILE_Y + 69} r={24} fill="var(--fig-ok-bg)" stroke="var(--fig-ok-border)" />
        <OkTick x={mid(c) - 14} y={B_TILE_Y + 55} size={28} />
      </BizTile>
    </>
  );
};

/* ---------- Panel 2: Dev dashboard ---------- */

const DEPS = ['ระบบบัญชี', 'ระบบสต็อก', 'ระบบตัดบัตร'];
const DEP_X = 206;
const DEP_W = 84;
const DEP_H = 20;
const DEP_Y0 = 34;
const DEP_STEP = 26;
const BTN = { x: 10, y: 55, w: 90, h: 30 };
const D_TILE_Y = 118;
const D_TILE_H = 72;
const D_TILE_W = 135;

const DevTile: React.FC<{ x: number; title: string; status: string; children?: React.ReactNode }> = ({
  x,
  title,
  status,
  children,
}) => (
  <g>
    <rect x={x} y={D_TILE_Y} width={D_TILE_W} height={D_TILE_H} rx={5} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <text x={x + 10} y={D_TILE_Y + 20} fontSize="10" fontWeight="700" fill="var(--fig-text)">
      {title}
    </text>
    {children}
    <StatusPill x={x + 6} y={D_TILE_Y + 34} width={D_TILE_W - 12} tone="warn" text={status} />
  </g>
);

const DevDashboard: React.FC = () => {
  const btnRight = BTN.x + BTN.w;
  const btnCy = BTN.y + BTN.h / 2;
  const tile2 = 10 + D_TILE_W + 10;
  return (
    <>
      <Frame header="KPI: เสถียร · ปลอดภัย" />
      {/* Dependency strip: the requested button touches three systems. */}
      {DEPS.map((dep, i) => {
        const y = DEP_Y0 + i * DEP_STEP;
        const cy = y + DEP_H / 2;
        return (
          <g key={dep}>
            <path
              d={`M${btnRight},${btnCy} C${btnRight + 50},${btnCy} ${DEP_X - 50},${cy} ${DEP_X},${cy}`}
              fill="none"
              stroke="var(--fig-text-muted)"
              strokeWidth={1.2}
            />
            <circle cx={DEP_X} cy={cy} r={2.5} fill="var(--fig-text-muted)" />
            <rect x={DEP_X} y={y} width={DEP_W} height={DEP_H} rx={4} fill="var(--fig-bg)" stroke="var(--fig-border)" />
            <text x={DEP_X + DEP_W / 2} y={cy + 3.5} textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">
              {dep}
            </text>
          </g>
        );
      })}
      <rect x={BTN.x} y={BTN.y} width={BTN.w} height={BTN.h} rx={6} fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
      <text x={BTN.x + BTN.w / 2} y={btnCy + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--fig-accent)">
        ปุ่มคืนเงินทันที
      </text>

      <DevTile x={10} title="Error rate" status="เสี่ยงเพิ่ม">
        <Arrow cx={10 + D_TILE_W - 16} top={D_TILE_Y + 8} bottom={D_TILE_Y + 26} up color="var(--fig-warn)" head={5} />
      </DevTile>
      <DevTile x={tile2} title="เวลาทดสอบ" status="ไม่พอภายในศุกร์">
        {/* Clock glyph: face + hands. */}
        <circle cx={tile2 + D_TILE_W - 16} cy={D_TILE_Y + 17} r={8} fill="none" stroke="var(--fig-warn)" strokeWidth={1.5} />
        <path
          d={`M${tile2 + D_TILE_W - 16},${D_TILE_Y + 12} V${D_TILE_Y + 17} H${tile2 + D_TILE_W - 12}`}
          fill="none"
          stroke="var(--fig-warn)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </DevTile>
    </>
  );
};

const PANELS: FigurePanel[] = [
  {
    label: 'แดชบอร์ดฝั่ง Business',
    note: 'เห็นโอกาส',
    title: 'แดชบอร์ด KPI ฝั่ง Business ต่อคำขอเดียวกัน',
    desc: 'แดชบอร์ด KPI เร็วและรายได้ มีสามช่อง ยอดขายลูกศรขึ้นคาดว่าเพิ่ม เรื่องร้องเรียนลูกศรลงคาดว่าลด และออกทันแคมเปญมีเครื่องหมายถูกว่าทันศุกร์',
    viewBox: `0 0 ${W} ${H}`,
    Screen: BusinessDashboard,
  },
  {
    label: 'แดชบอร์ดฝั่ง Dev',
    note: 'เห็นความเสี่ยง',
    title: 'แดชบอร์ด KPI ฝั่ง Dev ต่อคำขอเดียวกัน',
    desc: 'แดชบอร์ด KPI เสถียรและปลอดภัย แสดงปุ่มคืนเงินทันทีที่โยงไปถึงระบบบัญชี ระบบสต็อก และระบบตัดบัตร พร้อมสองช่องเตือนว่า Error rate เสี่ยงเพิ่ม และเวลาทดสอบไม่พอภายในศุกร์',
    viewBox: `0 0 ${W} ${H}`,
    Screen: DevDashboard,
  },
];

/** s11 hero: one change request, two KPI dashboards, and a "ได้ ถ้า..." reply. */
export const RefundKpiSplit: React.FC<FigureProps> = ({ className }) => (
  <div className={`fig-scope ${className ?? ''}`}>
    <p
      className="mb-3 px-3 py-2 rounded-lg text-sm"
      style={{ background: 'var(--fig-surface-2)', border: '1px solid var(--fig-border)', color: 'var(--fig-text)' }}
    >
      <span className="font-semibold">คำขอ:</span> "เพิ่มปุ่ม 'คืนเงินทันที' ให้เสร็จภายในศุกร์นี้"
    </p>
    <FigurePanels panels={PANELS} columns={2} narrow="stack" />
    <p
      className="mt-3 px-3 py-2 rounded-r-lg text-sm flex items-start gap-2"
      style={{ background: 'var(--fig-ok-bg)', borderLeft: '4px solid var(--fig-ok)', color: 'var(--fig-text)' }}
    >
      <svg viewBox="0 0 10 10" width="14" height="14" aria-hidden="true" className="shrink-0 mt-[3px]">
        <OkTick x={0} y={0} size={10} />
      </svg>
      <span>
        <span className="font-semibold">ตอบว่า "ได้ ถ้า...":</span> ได้ภายในศุกร์ ถ้ารอบแรกคืนเป็นเครดิตร้านก่อน
      </span>
    </p>
  </div>
);
