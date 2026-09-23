import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { PhoneFrame } from './shared/PhoneFrame';
import { WarnBang } from './shared/glyphs';

/*
 * One "ขอคืนเงิน" mobile screen drawn at 4 fidelity levels (spec 2026-09-22 §2).
 * Every panel shares the same layout inside viewBox 0 0 150 240:
 *   header 0–28 · order card 36–82 · reason 90–112 · upload 120–148 ·
 *   (error 154–172) · button 178–200 · (empty-state inset 208–236)
 * Labels, cost lines, the scale and the tabs are HTML (Thai shaping, wrapping, SR).
 * The selected tab is view-only UI state; content stays static.
 */

/** Slightly wobbly closed box for the hand-drawn look (deterministic). */
const wobbleRect = (x: number, y: number, w: number, h: number) =>
  `M${x + 1},${y + 0.5} Q${x + w / 2},${y - 1} ${x + w - 0.5},${y + 1} ` +
  `Q${x + w + 1},${y + h / 2} ${x + w - 1},${y + h - 0.5} ` +
  `Q${x + w / 2},${y + h + 1} ${x + 0.5},${y + h - 1} ` +
  `Q${x - 1},${y + h / 2} ${x + 1},${y + 0.5}`;

/** Wavy scribble standing in for unwritten text. */
const scribble = (x: number, y: number, w: number) => {
  const steps = Math.max(1, Math.round(w / 8));
  return `M${x},${y} q2,-2.5 4,0` + ' t4,0'.repeat(steps * 2 - 1);
};

const SKETCH_STROKE = {
  fill: 'none',
  stroke: 'var(--fig-text-2)',
  strokeWidth: 1.3,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const SketchScreen: React.FC = () => (
  <g>
    <path d={wobbleRect(1, 1, 148, 238)} {...SKETCH_STROKE} />
    <path d="M2,28 Q40,26.5 75,28.5 T148,27.5" {...SKETCH_STROKE} />
    <text x="75" y="19" textAnchor="middle" fontSize="11" fill="var(--fig-text-2)">ขอคืนเงิน</text>

    <path d={wobbleRect(8, 36, 134, 46)} {...SKETCH_STROKE} />
    <path d={wobbleRect(14, 42, 22, 22)} {...SKETCH_STROKE} />
    <path d="M15,43 L35,63 M35,43 L15,63" {...SKETCH_STROKE} />
    <path d={scribble(104, 55, 32)} {...SKETCH_STROKE} />
    <path d={scribble(14, 74, 80)} {...SKETCH_STROKE} />

    <path d={wobbleRect(8, 90, 134, 22)} {...SKETCH_STROKE} />
    <path d={scribble(14, 102, 56)} {...SKETCH_STROKE} />
    <path d="M126,99 L130,104 L134,99" {...SKETCH_STROKE} />

    <path d={wobbleRect(8, 120, 134, 28)} {...SKETCH_STROKE} strokeDasharray="4 3" />
    <path d={scribble(55, 135, 40)} {...SKETCH_STROKE} />

    <path d={wobbleRect(8, 178, 134, 22)} {...SKETCH_STROKE} />
    <text x="75" y="193" textAnchor="middle" fontSize="11" fill="var(--fig-text-2)">ส่ง</text>
  </g>
);

const LofiScreen: React.FC = () => (
  <g>
    <PhoneFrame tone="neutral" />

    <rect x="8" y="36" width="134" height="46" rx="4" fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <rect x="14" y="42" width="22" height="22" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <path d="M14,42 L36,64 M36,42 L14,64" stroke="var(--fig-border)" />
    <rect x="106" y="50" width="30" height="7" rx="2" fill="var(--fig-border)" />
    <text x="14" y="76" fontSize="10" fill="var(--fig-text-muted)">[รายการสั่งซื้อ]</text>

    <rect x="8" y="90" width="134" height="22" rx="4" fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <text x="14" y="105" fontSize="10" fill="var(--fig-text-muted)">[เหตุผล ▾]</text>

    <rect x="8" y="120" width="134" height="28" rx="4" fill="var(--fig-bg)" stroke="var(--fig-border)" strokeDasharray="4 3" />
    <text x="75" y="138" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">[แนบรูป]</text>

    <rect x="8" y="178" width="134" height="22" rx="4" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <text x="75" y="193" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">[ปุ่มส่ง]</text>
  </g>
);

/** Shared hi-fi chrome: frame, accent header with title, order card shell, thumbnail. */
const HifiChrome: React.FC = () => (
  <>
    <PhoneFrame tone="accent" title="ขอคืนเงิน" />

    <rect x="8" y="36" width="134" height="46" rx="6" fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <rect x="14" y="42" width="22" height="22" rx="4" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
    {/* headphones glyph */}
    <path d="M19,56 V52 A6,6 0 0 1 31,52 V56" fill="none" stroke="var(--fig-accent)" strokeWidth="1.4" />
    <rect x="18" y="54" width="3.5" height="5" rx="1" fill="var(--fig-accent)" />
    <rect x="28.5" y="54" width="3.5" height="5" rx="1" fill="var(--fig-accent)" />
  </>
);

const HifiScreen: React.FC = () => (
  <g>
    <HifiChrome />
    <text x="136" y="57" textAnchor="end" fontSize="10" fontWeight="600" fill="var(--fig-text)">฿1,290</text>
    <text x="14" y="76" fontSize="10" fill="var(--fig-text)">#A1024 หูฟังไร้สาย</text>

    <rect x="8" y="90" width="134" height="22" rx="5" fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <text x="14" y="105" fontSize="10" fill="var(--fig-text)">ไม่ได้รับสินค้า ▾</text>

    <rect x="8" y="120" width="134" height="28" rx="5" fill="var(--fig-bg)" stroke="var(--fig-accent-border)" strokeDasharray="4 3" />
    <text x="75" y="138" textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">แนบรูป (ไม่บังคับ)</text>

    <rect x="8" y="178" width="134" height="22" rx="6" fill="var(--fig-accent)" />
    <text x="75" y="193" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--fig-bg)">ส่งคำขอ</text>
  </g>
);

/* Production = Hi-fi plus real-data states: truncated name, upload error, disabled button, empty state. */
const ProductionScreen: React.FC = () => (
  <g>
    <HifiChrome />
    <text x="136" y="57" textAnchor="end" fontSize="10" fontWeight="600" fill="var(--fig-text)">฿1,290</text>
    <text x="14" y="76" fontSize="10" fill="var(--fig-text)">หูฟังไร้สาย รุ่น Pro Max…</text>

    <rect x="8" y="90" width="134" height="22" rx="5" fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <text x="14" y="105" fontSize="10" fill="var(--fig-text)">ไม่ได้รับสินค้า ▾</text>

    <rect x="8" y="120" width="134" height="28" rx="5" fill="var(--fig-bg)" stroke="var(--fig-warn-border)" strokeDasharray="4 3" />
    {/* image glyph beside the label (label ≈ 90 units wide at fontSize 10) */}
    <rect x="20" y="128" width="14" height="12" rx="2" fill="none" stroke="var(--fig-text-2)" strokeWidth="1.2" />
    <path d="M21.5,138.5 L25.5,133.5 L28.5,136.5 L30,135 L32.5,138.5" fill="none" stroke="var(--fig-text-2)" strokeWidth="1.1" strokeLinejoin="round" />
    <text x="40" y="138" fontSize="10" fill="var(--fig-text-2)">แนบรูป (ไม่บังคับ)</text>

    <rect x="8" y="154" width="134" height="18" rx="4" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
    <WarnBang cx={17} cy={163} />
    <text x="26" y="167" fontSize="10" fill="var(--fig-warn)">อัปโหลดไม่สำเร็จ ลองใหม่</text>

    <rect x="8" y="178" width="134" height="22" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <text x="75" y="193" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--fig-text-muted)">ส่งคำขอ</text>

    <rect x="12" y="207" width="126" height="29" rx="5" fill="var(--fig-surface-2)" stroke="var(--fig-border)" strokeDasharray="2 2" />
    <text x="75" y="219" textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">
      <tspan x="75">จอว่าง:</tspan>
      <tspan x="75" dy="12">ยังไม่มีคำสั่งซื้อที่ขอคืนได้</tspan>
    </text>
  </g>
);

const LEVELS: FigurePanel[] = [
  {
    label: 'ร่างมือ (Sketch)',
    tab: 'Sketch',
    note: 'แก้: ลบแล้ววาดใหม่',
    title: 'ขั้นที่ 1 ร่างมือ (Sketch)',
    desc: 'หน้าจอขอคืนเงินแบบวาดมือ เส้นยึกยือ มีแค่ชื่อหน้าจอกับปุ่มส่ง ข้อความอื่นเป็นเส้นขยุกขยิก และรูปสินค้าเป็นกล่องกากบาท',
    viewBox: '0 0 150 240',
    Screen: SketchScreen,
  },
  {
    label: 'โครงร่าง (Lo-fi Wireframe)',
    tab: 'Lo-fi',
    note: 'แก้: ย้ายกล่อง',
    title: 'ขั้นที่ 2 โครงร่าง (Lo-fi Wireframe)',
    desc: 'หน้าจอขอคืนเงินเป็นกล่องสีเทาเส้นตรง ใช้ข้อความในวงเล็บแทนของจริง ได้แก่ รายการสั่งซื้อ เหตุผล แนบรูป และปุ่มส่ง',
    viewBox: '0 0 150 240',
    Screen: LofiScreen,
  },
  {
    label: 'ภาพเสมือนจริง (Hi-fi Mockup)',
    tab: 'Hi-fi',
    note: 'แก้: ทำแบบใหม่บางส่วน',
    title: 'ขั้นที่ 3 ภาพเสมือนจริง (Hi-fi Mockup)',
    desc: 'หน้าจอขอคืนเงินที่มีสีและข้อความจริง คำสั่งซื้อ #A1024 หูฟังไร้สาย ราคา 1,290 บาท เหตุผลไม่ได้รับสินค้า ช่องแนบรูปแบบไม่บังคับ และปุ่มส่งคำขอสีเด่น',
    viewBox: '0 0 150 240',
    Screen: HifiScreen,
  },
  {
    label: 'ของจริง (Production)',
    tab: 'ของจริง',
    note: 'แก้: แบบ + โค้ด + ทดสอบใหม่',
    title: 'ขั้นที่ 4 ของจริง (Production)',
    desc: 'หน้าจอขอคืนเงินที่ใช้ข้อมูลจริง ชื่อสินค้ายาวถูกตัด มีข้อความแจ้งอัปโหลดรูปไม่สำเร็จ ปุ่มส่งกดไม่ได้ และมีตัวอย่างจอว่างเมื่อไม่มีคำสั่งซื้อ',
    viewBox: '0 0 150 240',
    Screen: ProductionScreen,
  },
];

/** s3 hero: the same refund screen at 4 fidelity levels, with relative cost to change. */
export const RefundFidelity: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels
    panels={LEVELS}
    columns={4}
    narrow="tabs"
    tablistLabel="เลือกขั้นความละเอียดของงานดีไซน์"
    stepCounter
    className={className}
    footer={
      <>
        <span>แก้ง่าย</span>
        <span aria-hidden="true" className="flex-1 flex items-center">
          <span className="flex-1 h-px" style={{ background: 'var(--fig-text-muted)' }} />
          <svg viewBox="0 0 8 8" width="8" height="8" style={{ display: 'block' }}>
            <path d="M0,0 L8,4 L0,8 z" fill="var(--fig-text-muted)" />
          </svg>
        </span>
        <span>แก้ยาก</span>
      </>
    }
  />
);
