import React from 'react';
import type { FigureProps } from './index';
import { DocCard } from './shared/DocCard';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { OkTick, WarnBang } from './shared/glyphs';
import { PhoneFrame } from './shared/PhoneFrame';

/*
 * s4 hero: the refund spec and the screen it produced on campaign day, without vs with
 * NFR lines (chapter figure briefs 2026-09-22, s4). Each panel is one SVG, viewBox
 * 0 0 314 240: spec sheet (0–150) + drawn arrow + phone (164–314). One SVG instead of two
 * SVGs joined by an HTML arrow because the FigurePanels shell renders one svg per panel;
 * 314 = smallest 2-up panel width (container 640px), so 10 units never render under 10px.
 * Status is glyph + text, never colour alone. Panel labels and notes are HTML.
 */

type Variant = 'none' | 'nfr';

const W = 314;
const H = 240;
const PHONE_X = 164;

const FR_ROWS = ['เลือกออเดอร์', 'เลือกเหตุผล', 'แนบรูป', 'ส่งคำขอ'];
const NFR_ROWS = ['รับ 50,000 คนพร้อมกัน', 'ตอบภายใน 2 วินาที', 'รูปหลักฐานเก็บตาม PDPA', 'บันทึกทุกการคืนเงิน'];

const FR_TITLE_Y = 42;
const FR_ROW_Y = 58;
const ROW_H = 16;
const NFR_TITLE_Y = 136;
const NFR_BOX_Y = 144;

const Spec: React.FC<{ variant: Variant }> = ({ variant }) => (
  <g>
    <DocCard id="สเปก: ขอคืนเงิน" x={1} y={1} width={148} height={238} />
    <text x={9} y={FR_TITLE_Y} fontSize="10" fontWeight="700" fill="var(--fig-text-2)">
      ต้องทำได้ (FR)
    </text>
    {FR_ROWS.map((row, i) => {
      const y = FR_ROW_Y + i * ROW_H;
      return (
        <g key={row}>
          <OkTick x={9} y={y - 9} />
          <text x={23} y={y} fontSize="10" fill="var(--fig-text)">
            {row}
          </text>
        </g>
      );
    })}
    <line x1={9} y1={NFR_TITLE_Y - 18} x2={141} y2={NFR_TITLE_Y - 18} stroke="var(--fig-border)" />
    <text x={9} y={NFR_TITLE_Y} fontSize="10" fontWeight="700" fill="var(--fig-text-2)">
      ต้องรับได้ (NFR)
    </text>
    {variant === 'none' ? (
      <g>
        <rect
          x={9}
          y={NFR_BOX_Y}
          width={132}
          height={44}
          rx={4}
          fill="none"
          stroke="var(--fig-border)"
          strokeDasharray="4 3"
        />
        <text x={75} y={NFR_BOX_Y + 26} textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">
          (ไม่มี)
        </text>
      </g>
    ) : (
      <g>
        <rect
          x={5}
          y={NFR_BOX_Y}
          width={140}
          height={4 * ROW_H + 8}
          rx={4}
          fill="var(--fig-accent-bg)"
          stroke="var(--fig-accent-border)"
        />
        {NFR_ROWS.map((row, i) => {
          const y = NFR_BOX_Y + 16 + i * ROW_H;
          return (
            <g key={row}>
              <circle cx={11} cy={y - 3.5} r={2.5} fill="var(--fig-accent)" />
              <text x={17} y={y} fontSize="10" fill="var(--fig-text)">
                {row}
              </text>
            </g>
          );
        })}
      </g>
    )}
  </g>
);

const CARD_Y = 80;
const CARD_H = 88;
const BUTTON_Y = 196;

const Phone: React.FC<{ variant: Variant }> = ({ variant }) => {
  const ok = variant === 'nfr';
  return (
    <g transform={`translate(${PHONE_X},0)`}>
      <PhoneFrame title="ขอคืนเงิน">
        {/* campaign-day traffic chip, split into two lines */}
        <rect x={10} y={36} width={130} height={32} rx={6} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x={75} y={49} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--fig-text)">
          11.11
        </text>
        <text x={75} y={62} textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">
          คนเข้า 50,000 คน
        </text>

        {/* result card */}
        <rect
          x={10}
          y={CARD_Y}
          width={130}
          height={CARD_H}
          rx={8}
          fill={ok ? 'var(--fig-ok-bg)' : 'var(--fig-warn-bg)'}
          stroke={ok ? 'var(--fig-ok-border)' : 'var(--fig-warn-border)'}
        />
        {ok ? <OkTick x={65} y={CARD_Y + 12} size={20} /> : <WarnBang cx={75} cy={CARD_Y + 22} r={9} />}
        <text
          x={75}
          y={CARD_Y + 54}
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fill={ok ? 'var(--fig-ok)' : 'var(--fig-warn)'}
        >
          {ok ? 'ส่งคำขอแล้ว' : 'ระบบไม่ว่าง'}
        </text>
        <text x={75} y={CARD_Y + 72} textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">
          {ok ? 'เลขที่ RF-2291' : 'กรุณาลองใหม่'}
        </text>

        {/* action button: disabled vs enabled */}
        <rect
          x={10}
          y={BUTTON_Y}
          width={130}
          height={28}
          rx={6}
          fill={ok ? 'var(--fig-accent)' : 'var(--fig-surface-2)'}
          stroke={ok ? 'var(--fig-accent)' : 'var(--fig-border)'}
          strokeDasharray={ok ? undefined : '3 2'}
        />
        <text
          x={75}
          y={BUTTON_Y + 18}
          textAnchor="middle"
          fontSize="11"
          fontWeight={ok ? '600' : undefined}
          fill={ok ? 'var(--fig-bg)' : 'var(--fig-text-muted)'}
        >
          {ok ? 'ดูสถานะ' : 'ส่งคำขอ'}
        </text>
      </PhoneFrame>
    </g>
  );
};

/** Spec → screen arrow in the gap between the two artefacts. */
const Arrow: React.FC = () => (
  <g>
    <line x1={151} y1={H / 2} x2={159} y2={H / 2} stroke="var(--fig-text-muted)" strokeWidth={1.5} />
    <path d={`M157,${H / 2 - 4} L163,${H / 2} L157,${H / 2 + 4} Z`} fill="var(--fig-text-muted)" />
  </g>
);

const Pair: React.FC<{ variant: Variant }> = ({ variant }) => (
  <>
    <Spec variant={variant} />
    <Arrow />
    <Phone variant={variant} />
  </>
);

const WithoutNfr: React.FC = () => <Pair variant="none" />;
const WithNfr: React.FC = () => <Pair variant="nfr" />;

const PANELS: FigurePanel[] = [
  {
    label: 'สเปกที่ไม่มี NFR',
    tab: 'ไม่คุย NFR',
    note: 'ทุกข้อ ✓ แต่ล่มวันแคมเปญ',
    title: 'สเปกและหน้าจอวันแคมเปญ เมื่อไม่มี NFR',
    desc: 'สเปกขอคืนเงินมีส่วนต้องทำได้ (FR) ติ๊กถูกครบ 4 ข้อ คือเลือกออเดอร์ เลือกเหตุผล แนบรูป ส่งคำขอ ส่วนต้องรับได้ (NFR) เป็นกรอบว่างเขียนว่าไม่มี ลูกศรชี้ไปหน้าจอขอคืนเงินวัน 11.11 คนเข้า 50,000 คน ที่ขึ้นเครื่องหมายเตือนว่าระบบไม่ว่าง กรุณาลองใหม่ และปุ่มส่งคำขอกดไม่ได้',
    viewBox: `0 0 ${W} ${H}`,
    Screen: WithoutNfr,
  },
  {
    label: 'สเปกที่มี NFR',
    tab: 'คุย NFR ก่อน',
    note: 'เพิ่ม 4 บรรทัด ระบบรอดวันแคมเปญ',
    title: 'สเปกและหน้าจอวันแคมเปญ เมื่อมี NFR',
    desc: 'สเปกขอคืนเงินมีส่วนต้องทำได้ (FR) ติ๊กถูกครบ 4 ข้อ และส่วนต้องรับได้ (NFR) 4 บรรทัด คือรับ 50,000 คนพร้อมกัน ตอบภายใน 2 วินาที รูปหลักฐานเก็บตาม PDPA บันทึกทุกการคืนเงิน ลูกศรชี้ไปหน้าจอขอคืนเงินวัน 11.11 คนเข้า 50,000 คน ที่ขึ้นเครื่องหมายถูกว่าส่งคำขอแล้ว เลขที่ RF-2291 และปุ่มดูสถานะ',
    viewBox: `0 0 ${W} ${H}`,
    Screen: WithNfr,
  },
];

/** s4 hero: the same refund spec without vs with 4 NFR lines, and the campaign-day screen each produced. */
export const RefundNfrSpec: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels
    panels={PANELS}
    columns={2}
    narrow="tabs"
    tablistLabel="เลือกสเปกที่จะเทียบ"
    className={className}
  />
);
