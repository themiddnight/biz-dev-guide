import React, { useLayoutEffect, useRef, useState } from 'react';
import type { FigureProps } from './index';
import { DocCard, estimateTextWidth } from './shared/DocCard';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { Chip, OkTick, WarnBang } from './shared/glyphs';
import { PhoneFrame } from './shared/PhoneFrame';

/*
 * s1 hero: one customer request as it appears in 4 real documents in sequence
 * (chapter figure briefs 2026-09-22, s1). Chat → meeting note → ticket → shipped screen,
 * each in viewBox 0 0 150 240. The condition "ของยังไม่ถึง" is underlined at hop 1, is flagged
 * missing at hop 2, becomes "ทุกออเดอร์" at hop 3, and ships as a refund button on a delivered order.
 * Labels, notes, tabs and the fix row are HTML; the fix row is a sibling of <FigurePanels>
 * because its footer is wide-only and the remedy must show in both modes.
 */

const BUBBLE_X = 8;
const BUBBLE_W = 120;
const LINE_X = BUBBLE_X + 8;
const CHAT_LINES = ['สั่งหูฟังไป 10 วัน', 'ของยังไม่ถึงเลย', 'ขอเงินคืนได้ไหม'];

const ChatScreen: React.FC = () => {
  /* Underline length: estimate for the first paint (overshoots Thai), then the rendered width. */
  const keyRef = useRef<SVGTextElement>(null);
  const [keyW, setKeyW] = useState(() => Math.min(estimateTextWidth(CHAT_LINES[1]) * 0.77, BUBBLE_W - 16));
  useLayoutEffect(() => {
    const el = keyRef.current;
    if (el && typeof el.getComputedTextLength === 'function') {
      const w = el.getComputedTextLength();
      if (w > 0) setKeyW(Math.min(w, BUBBLE_W - 16));
    }
  }, []);
  return (
    <PhoneFrame title="แชทกับร้าน">
      <rect x={BUBBLE_X} y={42} width={BUBBLE_W} height={58} rx={8} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
      {CHAT_LINES.map((line, i) => (
        <text
          key={line}
          ref={i === 1 ? keyRef : undefined}
          x={LINE_X}
          y={59 + i * 16}
          fontSize="10"
          fill="var(--fig-text)"
        >
          {line}
        </text>
      ))}
      <line x1={LINE_X} y1={79} x2={LINE_X + keyW} y2={79} stroke="var(--fig-accent)" strokeWidth="1.5" strokeLinecap="round" />
      <text x={BUBBLE_X + 2} y={114} fontSize="10" fill="var(--fig-text-muted)">
        09:12
      </text>
      {/* message input bar */}
      <rect x={8} y={206} width={134} height={22} rx={11} fill="var(--fig-bg)" stroke="var(--fig-border)" />
      <text x={18} y={220.5} fontSize="10" fill="var(--fig-text-muted)">
        พิมพ์ข้อความ
      </text>
    </PhoneFrame>
  );
};

const MeetingNote: React.FC = () => (
  <>
    <DocCard
      id="บันทึก"
      heading="สรุปประชุม 12 ก.ย."
      rows={['• ลูกค้าบ่นเรื่องคืนเงิน', '• ทำปุ่มขอคืนเงิน', '• ส่งทีม Dev']}
    />
    <rect x={6} y={192} width={138} height={22} rx={6} fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
    <WarnBang cx={14} cy={203} r={5} />
    <text x={22} y={206.5} fontSize="10" fontWeight="700" fill="var(--fig-warn)">
      ไม่มีเงื่อนไข "ของไม่ถึง"
    </text>
  </>
);

/* Ticket baselines inside DocCard (y = 1, header 24, line 15): heading 43, rows 58 and 73. */
const TICKET_LEFT = 12;

const Ticket: React.FC = () => (
  <>
    <DocCard id="REF-112" kind="ticket" heading="เพิ่มปุ่มคืนเงิน" rows={['ที่: หน้าออเดอร์', '']} />
    <text x={TICKET_LEFT} y={73} fontSize="10" fill="var(--fig-text)">
      ใคร:{' '}
      <tspan fontWeight="700" fill="var(--fig-warn)">
        ทุกออเดอร์
      </tspan>
    </text>
    <WarnBang cx={136} cy={69.5} r={5} />
    <Chip x={TICKET_LEFT} y={86} width={56} height={16}>
      พร้อมทำ
    </Chip>
  </>
);

interface OrderRowProps {
  y: number;
  order: string;
  delivered: boolean;
  status: string;
}

/** One order card: id + product, status (glyph + text), refund button. */
const OrderRow: React.FC<OrderRowProps> = ({ y, order, delivered, status }) => (
  <g>
    <rect x={6} y={y} width={138} height={80} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <text x={12} y={y + 16} fontSize="10" fontWeight="700" fill="var(--fig-text)">
      {order}
    </text>
    {delivered ? (
      <OkTick x={12} y={y + 24} size={10} />
    ) : (
      /* clock: in transit */
      <>
        <circle cx={17} cy={y + 29} r={4} fill="none" stroke="var(--fig-text-muted)" />
        <path d={`M17,${y + 26.5} V${y + 29} H19`} fill="none" stroke="var(--fig-text-muted)" strokeLinecap="round" />
      </>
    )}
    <text x={25} y={y + 32.5} fontSize="10" fill="var(--fig-text-2)">
      {status}
    </text>
    <rect
      x={12}
      y={y + 46}
      width={126}
      height={24}
      rx={5}
      fill={delivered ? 'var(--fig-warn-bg)' : 'var(--fig-accent-bg)'}
      stroke={delivered ? 'var(--fig-warn-border)' : 'var(--fig-accent-border)'}
      strokeWidth={delivered ? 1.5 : 1}
    />
    {delivered && <WarnBang cx={24} cy={y + 58} r={5} />}
    <text
      x={75}
      y={y + 61.5}
      textAnchor="middle"
      fontSize="10"
      fontWeight="700"
      fill={delivered ? 'var(--fig-warn)' : 'var(--fig-accent)'}
    >
      คืนเงิน
    </text>
  </g>
);

const ShippedScreen: React.FC = () => (
  <PhoneFrame title="ออเดอร์ของฉัน">
    <OrderRow y={38} order="#A1024 หูฟังไร้สาย" delivered status="ส่งถึงแล้ว" />
    <OrderRow y={128} order="#A1031 สายชาร์จ" delivered={false} status="กำลังส่ง" />
  </PhoneFrame>
);

const HOPS: FigurePanel[] = [
  {
    label: 'ข้อความลูกค้า (Chat)',
    tab: 'ลูกค้า',
    note: 'ความหมายครบ',
    title: 'ทอดที่ 1 ข้อความลูกค้า (Chat)',
    desc: 'หน้าแชทกับร้าน ลูกค้าส่งข้อความเวลา 09:12 ว่าสั่งหูฟังไป 10 วัน ของยังไม่ถึงเลย ขอเงินคืนได้ไหม โดยขีดเส้นใต้คำว่าของยังไม่ถึงเลย',
    viewBox: '0 0 150 240',
    Screen: ChatScreen,
  },
  {
    label: 'สรุปประชุม (Meeting note)',
    tab: 'ประชุม',
    note: 'เงื่อนไขสำคัญหาย',
    title: 'ทอดที่ 2 สรุปประชุม (Meeting note)',
    desc: 'บันทึกสรุปประชุม 12 ก.ย. มีหัวข้อลูกค้าบ่นเรื่องคืนเงิน ทำปุ่มขอคืนเงิน และส่งทีม Dev พร้อมป้ายเตือนว่าไม่มีเงื่อนไขของไม่ถึง',
    viewBox: '0 0 150 240',
    Screen: MeetingNote,
  },
  {
    label: 'ใบงาน (Ticket)',
    tab: 'ใบงาน',
    note: 'กลายเป็น "ทุกออเดอร์"',
    title: 'ทอดที่ 3 ใบงาน (Ticket)',
    desc: 'ใบงาน REF-112 เพิ่มปุ่มคืนเงินที่หน้าออเดอร์ ให้ใช้กับทุกออเดอร์ซึ่งมีเครื่องหมายเตือน และสถานะพร้อมทำ',
    viewBox: '0 0 150 240',
    Screen: Ticket,
  },
  {
    label: 'ของที่ส่ง (Production)',
    tab: 'ของจริง',
    note: 'กดคืนได้แม้ของถึงแล้ว',
    title: 'ทอดที่ 4 ของที่ส่ง (Production)',
    desc: 'หน้าออเดอร์ของฉันมีออเดอร์ #A1024 หูฟังไร้สายที่ส่งถึงแล้วแต่ยังมีปุ่มคืนเงินพร้อมเครื่องหมายเตือน และออเดอร์ #A1031 สายชาร์จที่กำลังส่งพร้อมปุ่มคืนเงิน',
    viewBox: '0 0 150 240',
    Screen: ShippedScreen,
  },
];

/** s1 hero: the same refund request drifting across chat → meeting note → ticket → production, plus the fix. */
export const RefundHandoffDrift: React.FC<FigureProps> = ({ className }) => (
  <div className={`fig-scope ${className ?? ''}`}>
    <FigurePanels panels={HOPS} columns={4} narrow="tabs" tablistLabel="เลือกเอกสารแต่ละทอด" />
    <p
      className="mt-3 px-3 py-2 rounded-r-lg text-sm flex items-start gap-2"
      style={{ background: 'var(--fig-ok-bg)', borderLeft: '4px solid var(--fig-ok)', color: 'var(--fig-text)' }}
    >
      <svg viewBox="0 0 10 10" width="14" height="14" aria-hidden="true" className="shrink-0 mt-[3px]">
        <OkTick x={0} y={0} size={10} />
      </svg>
      <span>
        <span className="font-semibold">ทางแก้:</span> ให้ Business, Dev และ QA อ่านข้อความแรกพร้อมกัน (Three Amigos) ไม่ใช่เขียนเอกสารเพิ่ม
      </span>
    </p>
  </div>
);
