import React, { useId, useRef, useState } from 'react';
import type { FigureProps } from './index';
import { nextTabIndex } from '../../lib/tabKeys';

/*
 * One "ขอคืนเงิน" mobile screen drawn at 4 fidelity levels (spec 2026-09-22 §2).
 * Every panel shares the same layout inside viewBox 0 0 150 240:
 *   header 0–28 · order card 36–82 · reason 90–112 · upload 120–148 ·
 *   (error 154–172) · button 178–200 · (empty-state inset 208–236)
 * Labels, cost lines, the scale and the tabs are HTML (Thai shaping, wrapping, SR).
 * The selected tab is view-only UI state; content stays static.
 */

const HEADER_PATH = 'M0.5,28 V10.5 A10,10 0 0 1 10.5,0.5 H139.5 A10,10 0 0 1 149.5,10.5 V28 Z';

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
    <rect x="0.5" y="0.5" width="149" height="239" rx="10" fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <path d={HEADER_PATH} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <rect x="50" y="11" width="50" height="7" rx="2" fill="var(--fig-border)" />

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
    <rect x="0.5" y="0.5" width="149" height="239" rx="10" fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <path d={HEADER_PATH} fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
    <path d="M12,10 L7,14.5 L12,19" fill="none" stroke="var(--fig-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <text x="75" y="19" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--fig-accent)">ขอคืนเงิน</text>

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

/*
 * Production keeps 6 text strings: title, price, truncated name, error, button and the
 * empty-state note (one <text>, two lines). The reason value and upload label become
 * glyphs so the real-data states can fit the per-panel budget.
 */
const ProductionScreen: React.FC = () => (
  <g>
    <HifiChrome />
    <text x="136" y="57" textAnchor="end" fontSize="10" fontWeight="600" fill="var(--fig-text)">฿1,290</text>
    <text x="14" y="76" fontSize="10" fill="var(--fig-text)">หูฟังไร้สาย รุ่น Pro Max…</text>

    <rect x="8" y="90" width="134" height="22" rx="5" fill="var(--fig-bg)" stroke="var(--fig-border)" />
    <rect x="14" y="98" width="62" height="6" rx="2" fill="var(--fig-text-2)" />
    <path d="M126,99 L130,103 L134,99" fill="none" stroke="var(--fig-text-2)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />

    <rect x="8" y="120" width="134" height="28" rx="5" fill="var(--fig-bg)" stroke="var(--fig-warn-border)" strokeDasharray="4 3" />
    {/* image glyph */}
    <rect x="66" y="126" width="18" height="15" rx="2" fill="none" stroke="var(--fig-text-2)" strokeWidth="1.2" />
    <path d="M68,139 L73,133 L77,137 L79,135 L82,139" fill="none" stroke="var(--fig-text-2)" strokeWidth="1.2" strokeLinejoin="round" />

    <rect x="8" y="154" width="134" height="18" rx="4" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
    <circle cx="17" cy="163" r="5" fill="var(--fig-warn)" />
    {/* "!" glyph as shapes so it does not count against the text budget */}
    <rect x="16.3" y="159.5" width="1.4" height="4.2" rx="0.7" fill="var(--fig-warn-bg)" />
    <circle cx="17" cy="165.6" r="0.8" fill="var(--fig-warn-bg)" />
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

interface Level {
  label: string;
  tab: string;
  cost: string;
  title: string;
  desc: string;
  Screen: React.FC;
}

const LEVELS: Level[] = [
  {
    label: 'ร่างมือ (Sketch)',
    tab: 'Sketch',
    cost: 'แก้: ลบแล้ววาดใหม่',
    title: 'ขั้นที่ 1 ร่างมือ (Sketch)',
    desc: 'หน้าจอขอคืนเงินแบบวาดมือ เส้นยึกยือ มีแค่ชื่อหน้าจอกับปุ่มส่ง ข้อความอื่นเป็นเส้นขยุกขยิก และรูปสินค้าเป็นกล่องกากบาท',
    Screen: SketchScreen,
  },
  {
    label: 'โครงร่าง (Lo-fi Wireframe)',
    tab: 'Lo-fi',
    cost: 'แก้: ย้ายกล่อง',
    title: 'ขั้นที่ 2 โครงร่าง (Lo-fi Wireframe)',
    desc: 'หน้าจอขอคืนเงินเป็นกล่องสีเทาเส้นตรง ใช้ข้อความในวงเล็บแทนของจริง ได้แก่ รายการสั่งซื้อ เหตุผล แนบรูป และปุ่มส่ง',
    Screen: LofiScreen,
  },
  {
    label: 'ภาพเสมือนจริง (Hi-fi Mockup)',
    tab: 'Hi-fi',
    cost: 'แก้: ทำแบบใหม่บางส่วน',
    title: 'ขั้นที่ 3 ภาพเสมือนจริง (Hi-fi Mockup)',
    desc: 'หน้าจอขอคืนเงินที่มีสีและข้อความจริง คำสั่งซื้อ #A1024 หูฟังไร้สาย ราคา 1,290 บาท เหตุผลไม่ได้รับสินค้า ช่องแนบรูปแบบไม่บังคับ และปุ่มส่งคำขอสีเด่น',
    Screen: HifiScreen,
  },
  {
    label: 'ของจริง (Production)',
    tab: 'ของจริง',
    cost: 'แก้: แบบ + โค้ด + ทดสอบใหม่',
    title: 'ขั้นที่ 4 ของจริง (Production)',
    desc: 'หน้าจอขอคืนเงินที่ใช้ข้อมูลจริง ชื่อสินค้ายาวถูกตัด มีข้อความแจ้งอัปโหลดรูปไม่สำเร็จ ปุ่มส่งกดไม่ได้ และมีตัวอย่างจอว่างเมื่อไม่มีคำสั่งซื้อ',
    Screen: ProductionScreen,
  },
];

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white';

/** s3 hero: the same refund screen at 4 fidelity levels, with relative cost to change. */
export const RefundFidelity: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();
  const [selected, setSelected] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const next = nextTabIndex(selected, e.key, LEVELS.length);
    if (next === null) return;
    e.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className={`fig-scope @container ${className ?? ''}`}>
      <div
        role="tablist"
        aria-label="เลือกขั้นความละเอียดของงานดีไซน์"
        className="grid grid-cols-4 gap-1 p-1 mb-3 rounded-lg @min-[640px]:hidden"
        style={{ background: 'var(--fig-surface-2)' }}
      >
        {LEVELS.map((level, i) => {
          const isSelected = i === selected;
          return (
            <button
              key={level.tab}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-tab${i + 1}`}
              aria-selected={isSelected}
              aria-controls={`${uid}-p${i + 1}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setSelected(i)}
              onKeyDown={onKeyDown}
              className={`min-h-[44px] px-1 rounded-md text-sm cursor-pointer ${isSelected ? 'font-semibold shadow-sm' : ''} ${FOCUS_RING}`}
              style={{
                background: isSelected ? 'var(--fig-bg)' : 'transparent',
                color: isSelected ? 'var(--fig-text)' : 'var(--fig-text-2)',
              }}
            >
              {level.tab}
            </button>
          );
        })}
      </div>

      <div className="@min-[640px]:grid @min-[640px]:grid-cols-4 @min-[640px]:gap-3">
        {LEVELS.map((level, i) => {
          const n = i + 1;
          const { Screen } = level;
          return (
            <div
              key={level.tab}
              role="tabpanel"
              id={`${uid}-p${n}`}
              aria-labelledby={`${uid}-l${n}`}
              className={`${i === selected ? '' : 'hidden'} @min-[640px]:block`}
            >
              <p
                id={`${uid}-l${n}`}
                className="mb-1.5 text-xs font-semibold text-center"
                style={{ color: 'var(--fig-text)' }}
              >
                {level.label}
              </p>
              <div className="max-w-[260px] mx-auto @min-[640px]:max-w-none">
                <svg
                  viewBox="0 0 150 240"
                  role="img"
                  aria-labelledby={`${uid}-t${n} ${uid}-d${n}`}
                  fontFamily="inherit"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                >
                  <title id={`${uid}-t${n}`}>{level.title}</title>
                  <desc id={`${uid}-d${n}`}>{level.desc}</desc>
                  <Screen />
                </svg>
              </div>
              <p className="mt-1.5 text-xs text-center" style={{ color: 'var(--fig-text-2)' }}>
                {level.cost}
              </p>
              <p className="mt-0.5 text-xs text-center @min-[640px]:hidden" style={{ color: 'var(--fig-text-muted)' }}>
                ขั้น {n} จาก 4
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="hidden @min-[640px]:flex items-center gap-2 mt-3 text-xs"
        style={{ color: 'var(--fig-text-2)' }}
      >
        <span>แก้ง่าย</span>
        <span aria-hidden="true" className="flex-1 flex items-center">
          <span className="flex-1 h-px" style={{ background: 'var(--fig-text-muted)' }} />
          <svg viewBox="0 0 8 8" width="8" height="8" style={{ display: 'block' }}>
            <path d="M0,0 L8,4 L0,8 z" fill="var(--fig-text-muted)" />
          </svg>
        </span>
        <span>แก้ยาก</span>
      </div>
    </div>
  );
};
