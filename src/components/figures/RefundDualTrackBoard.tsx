import React, { useId } from 'react';
import type { FigureProps } from './index';
import { OkTick, WarnBang } from './shared/glyphs';

/*
 * s12 hero: a two-lane dual-track team board for the refund feature
 * (spec 2026-09-22 chapter figure briefs, s12). Lanes are stacked, Discovery first.
 * viewBox 0 0 310 330 — the reader column is ≈ 317px at a 375px viewport, so
 * fontSize 10 never renders under 10px. Layout (user units):
 *   Discovery lane 2–182 (cards x 34–204, card 3 to 300, bin 232–304) · gap 182–204 ·
 *   Delivery lane 204–326 (cards x 34–204)
 * The "ส่งต่อ" arrow runs down the left gutter (x 18) and its label sits in the
 * gap between lanes; the discard arrow runs card 2 → bin. Labels never sit on a line.
 */

const W = 310;
const H = 330;

const CARD_X = 34;
const CARD_W = 170;
const TEXT_X = CARD_X + 8;
const STATUS_X = TEXT_X + 14;

const Card: React.FC<{ y: number; h: number; w?: number; stroke?: string; children: React.ReactNode }> = ({
  y,
  h,
  w = CARD_W,
  stroke = 'var(--fig-border)',
  children,
}) => (
  <g>
    <rect x={CARD_X} y={y} width={w} height={h} rx={5} fill="var(--fig-bg)" stroke={stroke} />
    {children}
  </g>
);

const Title: React.FC<{ y: number; children: string }> = ({ y, children }) => (
  <text x={TEXT_X} y={y} fontSize="10" fontWeight="600" fill="var(--fig-text)">
    {children}
  </text>
);

const Status: React.FC<{ y: number; fill: string; children: string }> = ({ y, fill, children }) => (
  <text x={STATUS_X} y={y} fontSize="10" fill={fill}>
    {children}
  </text>
);

/** Pending: a muted clock face (glyph + text, never colour alone). */
const Clock: React.FC<{ cx: number; cy: number }> = ({ cx, cy }) => (
  <g fill="none" stroke="var(--fig-text-muted)" strokeWidth={1.2} strokeLinecap="round">
    <circle cx={cx} cy={cy} r={4.5} />
    <path d={`M${cx},${cy - 2.5} V${cy} H${cx + 2}`} />
  </g>
);

const Lane: React.FC<{ y: number; h: number; title: string; color: string }> = ({ y, h, title, color }) => (
  <g>
    <rect x={2} y={y} width={W - 4} height={h} rx={8} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <text x={CARD_X} y={y + 17} fontSize="10" fontWeight="700" fill={color}>
      {title}
    </text>
  </g>
);

export const RefundDualTrackBoard: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const arrowOk = `${uid}-ao`;
  const arrowN = `${uid}-an`;

  return (
    <div className={`fig-scope @container ${className ?? ''}`}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          fontFamily="inherit"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <title id={titleId}>บอร์ดทีมสองแถว Discovery และ Delivery ของฟีเจอร์คืนเงิน</title>
          <desc id={descId}>
            บอร์ดทีมมีแถว Discovery ที่สำรวจใน Sprint นี้มีการทดลองสามใบ คือสัมภาษณ์ลูกค้า 5 คนซึ่งผ่านเพราะของไม่ถึงคือปัญหาอันดับ 1
            และถูกส่งต่อไปเป็นงานขอคืนเงินเมื่อของไม่ถึงที่ติดป้ายผ่านการสำรวจแล้วในแถว Delivery ของ Sprint หน้า
            ต้นแบบคืนเป็นเครดิตที่คนเลือกแค่ส่วนน้อยจึงถูกทิ้งก่อนเขียนโค้ด และหน้าเว็บจำลองประกันของหายที่ยังรอผล
            ส่วนแถว Delivery ยังมีงานแนบรูปหลักฐานอีกหนึ่งใบ
          </desc>
          <defs>
            <marker id={arrowOk} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="var(--fig-ok)" />
            </marker>
            <marker id={arrowN} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="var(--fig-text-muted)" />
            </marker>
          </defs>

          {/* Lane 1: Discovery (this sprint) */}
          <Lane y={2} h={180} title="Discovery · สำรวจ (Sprint นี้)" color="var(--fig-accent)" />

          <Card y={30} h={52} stroke="var(--fig-ok-border)">
            <Title y={45}>สัมภาษณ์ลูกค้า 5 คน</Title>
            <OkTick x={TEXT_X} y={52} size={10} />
            <Status y={61} fill="var(--fig-ok)">ผ่าน:</Status>
            <Status y={75} fill="var(--fig-ok)">ของไม่ถึงคือปัญหาอันดับ 1</Status>
          </Card>

          <Card y={90} h={38} stroke="var(--fig-warn-border)">
            <Title y={105}>{'ต้นแบบ "คืนเป็นเครดิต"'}</Title>
            <WarnBang cx={TEXT_X + 5} cy={117} />
            <Status y={121} fill="var(--fig-warn)">คนเลือกแค่ส่วนน้อย</Status>
          </Card>

          <Card y={136} h={38} w={266}>
            <Title y={151}>{'หน้าเว็บจำลอง "ประกันของหาย"'}</Title>
            <Clock cx={TEXT_X + 5} cy={163} />
            <Status y={167} fill="var(--fig-text-muted)">รอผล</Status>
          </Card>

          {/* Discard: card 2 -> bin, before any code */}
          <path d="M204,109 H230" fill="none" stroke="var(--fig-text-muted)" strokeWidth={1.2} markerEnd={`url(#${arrowN})`} />
          <rect
            x={232}
            y={90}
            width={72}
            height={38}
            rx={5}
            fill="var(--fig-bg)"
            stroke="var(--fig-text-muted)"
            strokeDasharray="4 3"
          />
          <text x={268} y={105} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--fig-text-2)">
            ทิ้ง
          </text>
          <text x={268} y={120} textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">
            ก่อนเขียนโค้ด
          </text>

          {/* Lane 2: Delivery (next sprint): only validated work lands here */}
          <Lane y={204} h={122} title="Delivery · สร้างจริง (Sprint หน้า)" color="var(--fig-text)" />

          <Card y={230} h={52}>
            <Title y={245}>ขอคืนเงินเมื่อของไม่ถึง</Title>
            <rect x={TEXT_X} y={254} width={114} height={16} rx={8} fill="var(--fig-ok-bg)" stroke="var(--fig-ok-border)" />
            <OkTick x={TEXT_X + 5} y={257} size={10} />
            <text x={TEXT_X + 19} y={265.5} fontSize="10" fill="var(--fig-ok)">
              ผ่านการสำรวจแล้ว
            </text>
          </Card>

          <Card y={290} h={28}>
            <Title y={308}>แนบรูปหลักฐาน</Title>
          </Card>

          {/* Hand-off: validated card 1 crosses into Delivery; label sits in the gap between lanes */}
          <path
            d={`M${CARD_X},56 H18 V262 H${CARD_X - 2}`}
            fill="none"
            stroke="var(--fig-ok)"
            strokeWidth={1.5}
            markerEnd={`url(#${arrowOk})`}
          />
          <text x={24} y={197} fontSize="10" fontWeight="600" fill="var(--fig-ok)">
            ส่งต่อ
          </text>
        </svg>
      </div>
    </div>
  );
};
