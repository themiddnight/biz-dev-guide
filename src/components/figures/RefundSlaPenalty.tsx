import React, { useId } from 'react';
import type { FigureProps } from './index';
import { DocCard } from './shared/DocCard';
import { WarnBang } from './shared/glyphs';

/*
 * s19 hero: the refund clause of a customer contract, the time the system really takes, and the
 * penalty (chapter text: the chain asked for refunds through the API in 1 day, the system takes 5,
 * and a missed SLA costs a Service Credit of 10% of the month's fee, about 15,000 baht, from the
 * first month). One svg, viewBox 0 0 300 258 (the reader column is ≈ 317px at a 375px viewport, so
 * fontSize 10 never renders under 10px). Layout (user units):
 *   contract card 1–109 · day strip 118–166 (labels under it to 188) · penalty box 196–256.
 * Status is glyph + text, never colour alone.
 */

const W = 300;
const H = 258;

const CARD_H = 108;
const STRIP_X = 50;
const STRIP_Y = 128;
const CELL_W = (W - 10 - STRIP_X) / 5;
const CELL_H = 22;
const PENALTY_Y = 198;

const cellX = (i: number) => STRIP_X + i * CELL_W;

export const RefundSlaPenalty: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();
  const titleId = `${uid}-title`;
  const descId = `${uid}-desc`;
  const brace = STRIP_Y + CELL_H + 6;

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
          <title id={titleId}>ข้อ SLA คืนเงินใน 1 วันของสัญญา เทียบกับเวลาจริง 5 วัน และค่าปรับ</title>
          <desc id={descId}>
            สัญญากับเชนร้านค้ามีข้อ SLA คืนเงินผ่าน API ต้องเสร็จภายใน 1 วัน ถ้าพลาดต้องจ่าย Service Credit 10% ของค่าบริการ
            แถบ 5 วันแสดงเวลาจริงของระบบวันนี้ วันที่ 1 อยู่ในสัญญา วันที่ 2 ถึง 5 เป็นสีเหลืองพร้อมเครื่องหมายตกใจ
            คือเกินสัญญา 4 วัน กล่องค่าปรับสรุปว่า 10% ของค่าบริการ ฿150,000 คือ ฿15,000 ตั้งแต่เดือนแรกที่พลาด ตัวเลขสมมติ
          </desc>

          <DocCard
            id="สัญญา · เชนร้านค้า"
            heading="ข้อ SLA: คืนเงินผ่าน API"
            rows={['ต้องเสร็จภายใน 1 วัน', 'ถ้าพลาด: Service Credit 10% ของค่าบริการ']}
            tag="ตัวเลขสมมติ"
            x={1}
            y={1}
            width={W - 2}
            height={CARD_H}
          />

          {/* Actual time: 5 day cells; day 1 is inside the clause, days 2–5 are over it. */}
          <text x={10} y={STRIP_Y + 15} fontSize="10" fill="var(--fig-text-2)">
            ระบบจริง
          </text>
          {Array.from({ length: 5 }, (_, i) => {
            const inside = i === 0;
            return (
              <g key={i}>
                <rect
                  x={cellX(i) + 1}
                  y={STRIP_Y}
                  width={CELL_W - 2}
                  height={CELL_H}
                  rx={4}
                  fill={inside ? 'var(--fig-ok-bg)' : 'var(--fig-warn-bg)'}
                  stroke={inside ? 'var(--fig-ok-border)' : 'var(--fig-warn-border)'}
                />
                <text
                  x={cellX(i) + CELL_W / 2}
                  y={STRIP_Y + 15}
                  textAnchor="middle"
                  fontSize="10"
                  fill={inside ? 'var(--fig-ok)' : 'var(--fig-warn)'}
                >
                  วัน {i + 1}
                </text>
              </g>
            );
          })}

          {/* Brackets under the strip: the clause covers day 1; the rest is over it. */}
          <path
            d={`M${cellX(0) + 2},${brace} V${brace + 4} H${cellX(1) - 2} V${brace}`}
            fill="none"
            stroke="var(--fig-ok)"
            strokeWidth={1.2}
          />
          <text x={cellX(0) + CELL_W / 2} y={brace + 17} textAnchor="middle" fontSize="10" fill="var(--fig-ok)">
            ตามสัญญา
          </text>
          <path
            d={`M${cellX(1) + 2},${brace} V${brace + 4} H${cellX(5) - 2} V${brace}`}
            fill="none"
            stroke="var(--fig-warn)"
            strokeWidth={1.2}
          />
          <WarnBang cx={cellX(2) + 4} cy={brace + 13} r={5} />
          <text x={cellX(2) + 14} y={brace + 17} fontSize="10" fontWeight="700" fill="var(--fig-warn)">
            เกินสัญญา 4 วัน
          </text>

          {/* Penalty. */}
          <rect
            x={1}
            y={PENALTY_Y}
            width={W - 2}
            height={H - 1 - PENALTY_Y}
            rx={6}
            fill="var(--fig-warn-bg)"
            stroke="var(--fig-warn-border)"
          />
          <WarnBang cx={16} cy={PENALTY_Y + 16} r={6} />
          <text x={28} y={PENALTY_Y + 20} fontSize="11" fontWeight="700" fill="var(--fig-warn)">
            ค่าปรับ Service Credit ฿15,000
          </text>
          <text x={28} y={PENALTY_Y + 36} fontSize="10" fill="var(--fig-text)">
            10% ของค่าบริการเดือนละ ฿150,000
          </text>
          <text x={28} y={PENALTY_Y + 51} fontSize="10" fill="var(--fig-text-2)">
            เริ่มนับตั้งแต่เดือนแรกที่พลาด
          </text>
        </svg>
      </div>
    </div>
  );
};
