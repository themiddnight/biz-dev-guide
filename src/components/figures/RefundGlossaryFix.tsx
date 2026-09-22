import React, { useLayoutEffect, useRef, useState } from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { OkTick, WarnBang } from './shared/glyphs';
import { estimateTextWidth } from './shared/DocCard';

/*
 * s15 hero: one team chat about the refund feature, before and after agreeing on one term
 * (chapter figure briefs 2026-09-22, s15). Each panel is viewBox 0 0 300 240.
 * Panel 1: three people use three names (Refund / ยกเลิกออเดอร์ / Chargeback), each term in a
 * different muted box, and a "!" result card for the wrong build. Panel 2: the agreed glossary
 * entry, the same three messages all using คืนเงิน in one accent box, and a ✓ line.
 * Role initials use role tokens; Support has no role token, so it uses the neutral --fig-text-2.
 * Chip/bubble widths start from estimateTextWidth and are replaced by getComputedTextLength after mount;
 * the estimate overshoots Thai, so the first paint never overlaps.
 */

const W = 300;
const BADGE_X = 8;
const BADGE_W = 32;
const BUBBLE_X = 46;
const BUBBLE_MAX_W = W - BUBBLE_X - 8;
const BUBBLE_H = 22;
const PAD = 8;
const GAP = 4;
const CHIP_PAD = 5;

type Speaker = 'pm' | 'support' | 'dev';

const SPEAKERS: Record<Speaker, { initials: string; color: string }> = {
  pm: { initials: 'PM', color: 'var(--fig-c-pm)' },
  /* No role token for Support (§2.5): neutral text colour instead. */
  support: { initials: 'Sup', color: 'var(--fig-text-2)' },
  dev: { initials: 'Dev', color: 'var(--fig-c-eng)' },
};

type TermTone = 'pm' | 'support' | 'dev' | 'agreed';

const TERM_TONES: Record<TermTone, { fill: string; stroke: string; text: string }> = {
  pm: { fill: 'var(--fig-bg)', stroke: 'var(--fig-c-pm)', text: 'var(--fig-text)' },
  support: { fill: 'var(--fig-bg)', stroke: 'var(--fig-text-muted)', text: 'var(--fig-text)' },
  dev: { fill: 'var(--fig-bg)', stroke: 'var(--fig-c-eng)', text: 'var(--fig-text)' },
  agreed: { fill: 'var(--fig-accent-bg)', stroke: 'var(--fig-accent-border)', text: 'var(--fig-accent)' },
};

interface ChatBubbleProps {
  y: number;
  speaker: Speaker;
  pre: string;
  term: string;
  post: string;
  tone: TermTone;
}

/** One chat line: role-initial badge, then a bubble "pre [term] post" with the term boxed. */
const ChatBubble: React.FC<ChatBubbleProps> = ({ y, speaker, pre, term, post, tone }) => {
  const s = SPEAKERS[speaker];
  const t = TERM_TONES[tone];
  /* Estimates for the first paint, then the real rendered widths (Thai glyphs run narrower). */
  const preRef = useRef<SVGTextElement>(null);
  const termRef = useRef<SVGTextElement>(null);
  const postRef = useRef<SVGTextElement>(null);
  const [widths, setWidths] = useState(() => [pre, term, post].map(estimateTextWidth));
  useLayoutEffect(() => {
    const measured = [preRef, termRef, postRef].map((r, i) =>
      r.current && typeof r.current.getComputedTextLength === 'function' ? r.current.getComputedTextLength() : widths[i],
    );
    if (measured.some((w, i) => w > 0 && w !== widths[i])) setWidths(measured);
    // Measure once per string set; `widths` is deliberately not a dependency.
  }, [pre, term, post]);
  const [preW, termW, postW] = widths;
  const preX = BUBBLE_X + PAD;
  const chipX = preX + (pre ? preW + GAP : 0);
  const chipW = termW + CHIP_PAD * 2;
  const postX = chipX + chipW + GAP;
  const width = Math.min(BUBBLE_MAX_W, postX + (post ? postW : 0) + PAD - BUBBLE_X);
  const baseline = y + BUBBLE_H / 2 + 3.5;
  return (
    <g>
      <rect x={BADGE_X} y={y + 2} width={BADGE_W} height={BUBBLE_H - 4} rx={9} fill="var(--fig-bg)" stroke={s.color} />
      <text x={BADGE_X + BADGE_W / 2} y={baseline} textAnchor="middle" fontSize="10" fontWeight="700" fill={s.color}>
        {s.initials}
      </text>
      <rect x={BUBBLE_X} y={y} width={width} height={BUBBLE_H} rx={8} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
      {pre && (
        <text ref={preRef} x={preX} y={baseline} fontSize="10" fill="var(--fig-text)">
          {pre}
        </text>
      )}
      <rect x={chipX} y={y + 3} width={chipW} height={BUBBLE_H - 6} rx={3} fill={t.fill} stroke={t.stroke} />
      <text ref={termRef} x={chipX + chipW / 2} y={baseline} textAnchor="middle" fontSize="10" fontWeight="700" fill={t.text}>
        {term}
      </text>
      {post && (
        <text ref={postRef} x={postX} y={baseline} fontSize="10" fill="var(--fig-text)">
          {post}
        </text>
      )}
    </g>
  );
};

const Frame: React.FC = () => (
  <rect x={1} y={1} width={W - 2} height={238} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
);

const ManyNamesChat: React.FC = () => (
  <>
    <Frame />
    <path d={`M1,24 H${W - 1}`} stroke="var(--fig-border)" />
    <text x={10} y={16} fontSize="10" fontWeight="700" fill="var(--fig-text)">
      #ทีมคืนเงิน
    </text>
    <ChatBubble y={36} speaker="pm" pre="ทำ" term="Refund" post="ให้ทันศุกร์" tone="pm" />
    <ChatBubble y={70} speaker="support" pre="ลูกค้ารอ" term="ยกเลิกออเดอร์" post="อยู่" tone="support" />
    <ChatBubble y={104} speaker="dev" pre="โอเค ทำ" term="Chargeback" post="นะ" tone="dev" />
    <rect x={8} y={150} width={W - 16} height={56} rx={5} fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
    <WarnBang cx={22} cy={169} r={6} />
    <text x={34} y={173} fontSize="10" fontWeight="700" fill="var(--fig-warn)">
      Dev ทำหน้ารับเรื่องโต้แย้งจากธนาคาร
    </text>
    <text x={34} y={193} fontSize="10" fill="var(--fig-text)">
      ไม่ใช่ร้านโอนคืน
    </text>
  </>
);

const OneTermChat: React.FC = () => (
  <>
    <Frame />
    <rect x={8} y={8} width={W - 16} height={76} rx={5} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <text x={16} y={24} fontSize="10" fill="var(--fig-text-muted)">
      ศัพท์กลางของทีม
    </text>
    <text x={16} y={42} fontSize="10" fontWeight="700" fill="var(--fig-accent)">
      คืนเงิน (Refund)
    </text>
    <text x={16} y={58} fontSize="10" fill="var(--fig-text)">
      ร้านโอนเงินคืนลูกค้าเอง
    </text>
    <text x={16} y={74} fontSize="10" fill="var(--fig-text-2)">
      ไม่ใช่: Chargeback (ธนาคารดึงคืน)
    </text>
    <ChatBubble y={96} speaker="pm" pre="ทำ" term="คืนเงิน" post="ให้ทันศุกร์" tone="agreed" />
    <ChatBubble y={126} speaker="support" pre="ลูกค้ารอ" term="คืนเงิน" post="อยู่" tone="agreed" />
    <ChatBubble y={156} speaker="dev" pre="โอเค ทำ" term="คืนเงิน" post="นะ" tone="agreed" />
    <rect x={8} y={196} width={W - 16} height={30} rx={5} fill="var(--fig-ok-bg)" stroke="var(--fig-ok-border)" />
    <OkTick x={15} y={204} size={14} />
    <text x={34} y={215} fontSize="10" fontWeight="700" fill="var(--fig-ok)">
      ทุกคนหมายถึงสิ่งเดียวกัน
    </text>
  </>
);

const PANELS: FigurePanel[] = [
  {
    label: 'ต่างคนต่างเรียก',
    note: '3 คำ 3 ความหมาย',
    title: 'แชททีมที่เรียกเรื่องเดียวกันต่างกัน',
    desc: 'แชท #ทีมคืนเงิน ที่ PM เรียกว่า Refund ทีม support เรียกว่ายกเลิกออเดอร์ และ Dev เรียกว่า Chargeback แต่ละคำอยู่ในกรอบต่างกัน ท้ายแชทเตือนว่า Dev ทำหน้ารับเรื่องโต้แย้งจากธนาคาร ไม่ใช่ร้านโอนคืน',
    viewBox: '0 0 300 240',
    Screen: ManyNamesChat,
  },
  {
    label: 'ตกลงคำเดียว',
    note: 'คำเดียว ความหมายเดียว',
    title: 'ศัพท์กลางและแชทที่ใช้คำเดียวกัน',
    desc: 'การ์ดศัพท์กลางของทีมนิยามคืนเงิน (Refund) ว่าร้านโอนเงินคืนลูกค้าเอง ไม่ใช่ Chargeback ที่ธนาคารดึงคืน ตามด้วยแชทเดิมสามข้อความที่ทุกคนใช้คำว่าคืนเงินในกรอบเดียวกัน และเครื่องหมายถูกว่าทุกคนหมายถึงสิ่งเดียวกัน',
    viewBox: '0 0 300 240',
    Screen: OneTermChat,
  },
];

/** s15 hero: the refund team chat with three names for one thing vs one agreed glossary term. */
export const RefundGlossaryFix: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels panels={PANELS} columns={2} narrow="stack" className={className} />
);
