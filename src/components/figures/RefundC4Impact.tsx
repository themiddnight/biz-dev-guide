import React, { useId } from 'react';
import type { FigureProps } from './index';
import { OkTick, WarnBang } from './shared/glyphs';

/*
 * s5 hero: a C4 Level 2 container diagram of the online shop with the refund
 * container down (spec 2026-09-22 chapter figure briefs, s5 option B).
 * viewBox 0 0 310 290 — the reader column is ≈ 317px at a 375px viewport, so
 * fontSize 10 never renders under 10px. Layout (user units):
 *   people 2–39 · person badges 46–62 · containers 74–110 ·
 *   order / refund 170–206 (refund status tag 150–166) · database / bank 246–282
 * Arrows are routed around every label; labels sit beside, never on, a line.
 * The title strip and legend are HTML (wrapping, Thai shaping, SR).
 */

const W = 310;
const H = 290;

const BOX_H = 36;

interface BoxProps {
  x: number;
  y: number;
  w: number;
  name: string;
  tech: string;
  tone?: 'normal' | 'down' | 'external';
}

/** C4 container: rounded rect, name on line 1, [technology] muted on line 2. */
const Box: React.FC<BoxProps> = ({ x, y, w, name, tech, tone = 'normal' }) => {
  const style =
    tone === 'down'
      ? { fill: 'var(--fig-warn-bg)', stroke: 'var(--fig-warn-border)', strokeWidth: 1.5 }
      : tone === 'external'
        ? { fill: 'var(--fig-surface-2)', stroke: 'var(--fig-text-muted)', strokeDasharray: '4 3' }
        : { fill: 'var(--fig-bg)', stroke: 'var(--fig-border)' };
  const cx = x + w / 2;
  return (
    <g>
      <rect x={x} y={y} width={w} height={BOX_H} rx={6} {...style} />
      <text
        x={cx}
        y={y + 16}
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill={tone === 'down' ? 'var(--fig-warn)' : tone === 'external' ? 'var(--fig-text-2)' : 'var(--fig-text)'}
      >
        {name}
      </text>
      <text x={cx} y={y + 29} textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">
        {tech}
      </text>
    </g>
  );
};

/** C4 database container: cylinder with name + tech. */
const Database: React.FC<Omit<BoxProps, 'tone'>> = ({ x, y, w, name, tech }) => {
  const r = 4;
  const cx = x + w / 2;
  return (
    <g>
      <path
        d={`M${x},${y + r} A${w / 2},${r} 0 0 1 ${x + w},${y + r} V${y + BOX_H - r} A${w / 2},${r} 0 0 1 ${x},${y + BOX_H - r} Z`}
        fill="var(--fig-bg)"
        stroke="var(--fig-border)"
      />
      <path d={`M${x},${y + r} A${w / 2},${r} 0 0 0 ${x + w},${y + r}`} fill="none" stroke="var(--fig-border)" />
      <text x={cx} y={y + 19} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--fig-text)">
        {name}
      </text>
      <text x={cx} y={y + 31} textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">
        {tech}
      </text>
    </g>
  );
};

/** C4 person: head circle above a rounded body holding the name. */
const Person: React.FC<{ x: number; w: number; name: string }> = ({ x, w, name }) => {
  const cx = x + w / 2;
  return (
    <g>
      <circle cx={cx} cy={9} r={7} fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
      <rect x={x} y={17} width={w} height={22} rx={9} fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
      <text x={cx} y={32} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--fig-text)">
        {name}
      </text>
    </g>
  );
};

/** Status tag: warn disc with "!" or an ok tick, then short text. Width is explicit. */
const Tag: React.FC<{ x: number; y: number; w: number; tone: 'warn' | 'ok'; children: string }> = ({
  x,
  y,
  w,
  tone,
  children,
}) => (
  <g>
    <rect
      x={x}
      y={y}
      width={w}
      height={16}
      rx={8}
      fill={tone === 'warn' ? 'var(--fig-warn-bg)' : 'var(--fig-ok-bg)'}
      stroke={tone === 'warn' ? 'var(--fig-warn-border)' : 'var(--fig-ok-border)'}
    />
    {tone === 'warn' ? <WarnBang cx={x + 10} cy={y + 8} /> : <OkTick x={x + 5} y={y + 3} size={10} />}
    <text x={x + 19} y={y + 11.5} fontSize="10" fill={tone === 'warn' ? 'var(--fig-warn)' : 'var(--fig-ok)'}>
      {children}
    </text>
  </g>
);

const NEUTRAL = { fill: 'none', stroke: 'var(--fig-text-muted)', strokeWidth: 1.2 };
const BROKEN = { fill: 'none', stroke: 'var(--fig-warn)', strokeWidth: 1.4, strokeDasharray: '4 3' };

const Label: React.FC<{ x: number; y: number; anchor?: 'start' | 'end'; tone?: 'neutral' | 'warn'; children: string }> = ({
  x,
  y,
  anchor = 'start',
  tone = 'neutral',
  children,
}) => (
  <text x={x} y={y} textAnchor={anchor} fontSize="10" fill={tone === 'warn' ? 'var(--fig-warn)' : 'var(--fig-text-2)'}>
    {children}
  </text>
);

export const RefundC4Impact: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const arrowN = `${uid}-an`;
  const arrowW = `${uid}-aw`;
  const endN = `url(#${arrowN})`;
  const endW = `url(#${arrowW})`;

  return (
    <div className={`fig-scope @container ${className ?? ''}`}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <p className="mb-1.5 text-xs font-semibold text-center" style={{ color: 'var(--fig-text)' }}>
          ถ้ากล่องนี้ล่ม ใครโดนบ้าง
        </p>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          fontFamily="inherit"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <title id={titleId}>แผนผัง C4 ระดับ 2 ของร้านออนไลน์ เมื่อระบบคืนเงินล่ม</title>
          <desc id={descId}>
            ลูกค้าใช้แอปลูกค้า ทีม support ใช้หลังบ้าน support ระบบคืนเงินถูกทำเครื่องหมายว่าล่ม
            เส้นขอคืนเงิน อนุมัติ และโอนคืนไปธนาคารเป็นเส้นประใช้งานไม่ได้ ลูกค้าจึงขอคืนไม่ได้
            ทีม support อนุมัติไม่ได้ แต่เส้นสั่งซื้อไประบบคำสั่งซื้อและฐานข้อมูลยังสั่งซื้อได้ปกติ
          </desc>
          <defs>
            <marker id={arrowN} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="var(--fig-text-muted)" />
            </marker>
            <marker id={arrowW} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill="var(--fig-warn)" />
            </marker>
          </defs>

          {/* People and what they can no longer do */}
          <Person x={8} w={80} name="ลูกค้า" />
          <Person x={212} w={92} name="ทีม support" />
          <Tag x={30} y={46} w={74} tone="warn">ขอคืนไม่ได้</Tag>
          <Tag x={206} y={46} w={82} tone="warn">อนุมัติไม่ได้</Tag>

          {/* person -> UI container ("uses") */}
          <path d="M20,39 V72" {...NEUTRAL} markerEnd={endN} />
          <path d="M296,39 V72" {...NEUTRAL} markerEnd={endN} />

          {/* Containers */}
          <Box x={8} y={74} w={92} name="แอปลูกค้า" tech="[มือถือ]" />
          <Box x={196} y={74} w={108} name="หลังบ้าน support" tech="[เว็บ]" />
          <Box x={8} y={170} w={92} name="ระบบคำสั่งซื้อ" tech="[API]" />
          <Box x={196} y={170} w={108} name="ระบบคืนเงิน" tech="[API]" tone="down" />
          <Database x={109} y={246} w={92} name="ฐานข้อมูล" tech="[SQL]" />
          <Box x={212} y={246} w={92} name="ธนาคาร" tech="[ภายนอก]" tone="external" />

          {/* Refund container status tag */}
          <Tag x={262} y={150} w={40} tone="warn">ล่ม</Tag>

          {/* Still working: app -> orders -> database */}
          <path d="M54,110 V168" {...NEUTRAL} markerEnd={endN} />
          <Label x={60} y={126}>สั่งซื้อ</Label>
          <Tag x={14} y={134} w={82} tone="ok">สั่งซื้อได้ปกติ</Tag>
          <path d="M54,206 V264 H107" {...NEUTRAL} markerEnd={endN} />

          {/* Broken: everything into and out of the refund container */}
          <path d="M100,98 H140 V188 H194" {...BROKEN} markerEnd={endW} />
          <Label x={146} y={172} tone="warn">ขอคืนเงิน</Label>
          <path d="M230,110 V168" {...BROKEN} markerEnd={endW} />
          <Label x={224} y={140} anchor="end" tone="warn">อนุมัติ</Label>
          <path d="M280,206 V244" {...BROKEN} markerEnd={endW} />
          <Label x={274} y={230} anchor="end" tone="warn">โอนคืน</Label>
          <path d="M206,206 V222 H155 V244" {...BROKEN} markerEnd={endW} />
        </svg>
        <p className="mt-1.5 text-xs text-center" style={{ color: 'var(--fig-text-2)' }}>
          <span className="whitespace-nowrap">กล่องสีเหลือง = ล่ม</span> ·{' '}
          <span className="whitespace-nowrap">เส้นประสีเหลือง = ใช้งานไม่ได้</span> ·{' '}
          <span className="whitespace-nowrap">✓ = ยังใช้ได้</span>
        </p>
      </div>
    </div>
  );
};
