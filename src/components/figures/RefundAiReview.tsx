import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { Chip, WarnBang } from './shared/glyphs';
import { estimateTextWidth } from './shared/DocCard';

/*
 * s13 hero: where the effort goes on one refund feature once AI writes the code
 * (chapter figure briefs 2026-09-22, s13). Each panel is viewBox 0 0 300 220.
 * Panel 1: two Gantt-style effort strips (before AI / with AI), relative widths only,
 * no numbers. Panel 2: the AI-written PR whose one plausible line leaks card numbers
 * into logs, with the human review comment. Status is glyph + text, never colour alone.
 * Panel labels and notes are HTML.
 */

const W = 300;
const H = 220;
const STRIP_X = 10;
const STRIP_H = 28;

type SegTone = 'neutral' | 'accent';

const SEG_TONES: Record<SegTone, { fill: string; stroke: string; text: string }> = {
  neutral: { fill: 'var(--fig-surface-2)', stroke: 'var(--fig-border)', text: 'var(--fig-text)' },
  accent: { fill: 'var(--fig-accent-bg)', stroke: 'var(--fig-accent-border)', text: 'var(--fig-accent)' },
};

interface Segment {
  label: string;
  /** Width in user units; segments of one strip sum to 280 (W - 20). */
  w: number;
  tone: SegTone;
  /** Thin sliver: no in-box label (labelled outside by the caller). */
  sliver?: boolean;
}

/** In-box labels need the segment to be at least label width + 8 (spec §2.4 fit budget). */
const fits = (s: Segment) => s.w >= estimateTextWidth(s.label) + 8;

interface StripProps {
  y: number;
  row: string;
  segments: Segment[];
}

/** Row label above a horizontal effort strip made of adjacent segments. */
const Strip: React.FC<StripProps> = ({ y, row, segments }) => {
  let x = STRIP_X;
  return (
    <g>
      <text x={STRIP_X} y={y - 7} fontSize="10" fontWeight="700" fill="var(--fig-text)">
        {row}
      </text>
      {segments.map((s) => {
        const sx = x;
        x += s.w;
        const t = SEG_TONES[s.tone];
        return (
          <g key={s.label}>
            <rect x={sx} y={y} width={s.w} height={STRIP_H} rx={3} fill={t.fill} stroke={t.stroke} />
            {!s.sliver && fits(s) && (
              <text
                x={sx + s.w / 2}
                y={y + STRIP_H / 2 + 3.5}
                textAnchor="middle"
                fontSize="10"
                fontWeight={s.tone === 'accent' ? 700 : 400}
                fill={t.text}
              >
                {s.label}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
};

const BEFORE: Segment[] = [
  { label: 'ตั้งโจทย์', w: 50, tone: 'neutral' },
  { label: 'เขียนโค้ด', w: 118, tone: 'neutral' },
  { label: 'รีวิว', w: 50, tone: 'neutral' },
  { label: 'ตรวจว่าถูก', w: 62, tone: 'neutral' },
];

const SLIVER_W = 8;
const AI_PLAN_W = 82;

const WITH_AI: Segment[] = [
  { label: 'ตั้งโจทย์', w: AI_PLAN_W, tone: 'accent' },
  { label: 'เขียนโค้ด', w: SLIVER_W, tone: 'neutral', sliver: true },
  { label: 'รีวิว', w: 96, tone: 'accent' },
  { label: 'ตรวจว่าถูก', w: 94, tone: 'accent' },
];

const BEFORE_Y = 50;
const AI_Y = 118;

const EffortTimeline: React.FC = () => {
  const sliverMid = STRIP_X + AI_PLAN_W + SLIVER_W / 2;
  const leaderTop = AI_Y + STRIP_H;
  return (
    <>
      <rect x={1} y={1} width={W - 2} height={H - 2} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
      <path d={`M1,24 H${W - 1}`} stroke="var(--fig-border)" />
      <text x={10} y={16} fontSize="10" fontWeight="700" fill="var(--fig-text)">
        แผนงาน · ฟีเจอร์ขอคืนเงิน
      </text>
      <Strip y={BEFORE_Y} row="ก่อนมี AI" segments={BEFORE} />
      <Strip y={AI_Y} row="มี AI" segments={WITH_AI} />
      {/* "AI เขียน" sits outside the sliver, joined by a leader line. */}
      <path d={`M${sliverMid},${leaderTop + 2} V${leaderTop + 16}`} stroke="var(--fig-text-2)" />
      <circle cx={sliverMid} cy={leaderTop + 2} r={1.5} fill="var(--fig-text-2)" />
      <text x={sliverMid} y={leaderTop + 28} textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">
        AI เขียน
      </text>
      {/* Time axis: direction only, no scale. */}
      <path d={`M${STRIP_X},${H - 22} H${W - 16}`} stroke="var(--fig-text-muted)" />
      <path
        d={`M${W - 20},${H - 26} L${W - 12},${H - 22} L${W - 20},${H - 18} Z`}
        fill="var(--fig-text-muted)"
      />
      <text x={STRIP_X} y={H - 8} fontSize="10" fill="var(--fig-text-muted)">
        เวลา
      </text>
    </>
  );
};

const DIFF_Y = 52;
const LINE_H = 16;
const WARN_LINE = 3; // 0-based index of the readable warn line among 5 diff lines
const BAR_WIDTHS = [168, 132, 196, 0, 150];

/** One added diff line: "+" gutter in ok, grey bar standing in for code, or the readable warn line. */
const DiffLine: React.FC<{ i: number; barW: number }> = ({ i, barW }) => {
  const y = DIFF_Y + i * LINE_H;
  if (i === WARN_LINE) {
    return (
      <g>
        <rect x={6} y={y} width={W - 12} height={LINE_H - 1} rx={2} fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
        <text x={14} y={y + 11} fontSize="10" fontWeight="700" fill="var(--fig-warn)">
          +
        </text>
        <text x={28} y={y + 11} fontSize="10" fontWeight="700" fill="var(--fig-text)">
          log(card_number)
        </text>
        <WarnBang cx={W - 18} cy={y + 7.5} r={5} />
      </g>
    );
  }
  return (
    <g>
      <text x={14} y={y + 11} fontSize="10" fontWeight="700" fill="var(--fig-ok)">
        +
      </text>
      <rect x={28} y={y + 4} width={barW} height={7} rx={3.5} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    </g>
  );
};

const BUBBLE_Y = 142;
const BUBBLE_H = 34;
const FOOTER_Y = 186;

const AiPr: React.FC = () => {
  const warnLineBottom = DIFF_Y + WARN_LINE * LINE_H + LINE_H - 1;
  return (
    <>
      <rect x={1} y={1} width={W - 2} height={H - 2} rx={6} fill="var(--fig-bg)" stroke="var(--fig-border)" />
      {/* PR header */}
      <rect x={1} y={1} width={W - 2} height={44} rx={6} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
      <text x={10} y={17} fontSize="11" fontWeight="700" fill="var(--fig-text)">
        PR #301 เพิ่ม API คืนเงิน
      </text>
      {/* Fixed width: the 6.5-unit estimate overshoots this Thai + Latin string (≈ 80 units rendered). */}
      <Chip x={10} y={24} width={100} tone="neutral">
        เขียนโดย AI · 1 นาที
      </Chip>
      {/* Diff: 4 added lines as grey bars, one readable line in warn */}
      {BAR_WIDTHS.map((w, i) => (
        <DiffLine key={i} i={i} barW={w} />
      ))}
      {/* Review comment bubble pointing at the warn line */}
      <path
        d={`M${W - 30},${BUBBLE_Y + 0.5} L${W - 22},${warnLineBottom + 3} L${W - 14},${BUBBLE_Y + 0.5}`}
        fill="var(--fig-warn-bg)"
        stroke="var(--fig-warn-border)"
      />
      <rect
        x={6}
        y={BUBBLE_Y}
        width={W - 12}
        height={BUBBLE_H}
        rx={6}
        fill="var(--fig-warn-bg)"
        stroke="var(--fig-warn-border)"
      />
      <path d={`M${W - 29},${BUBBLE_Y + 0.75} H${W - 15}`} stroke="var(--fig-warn-bg)" strokeWidth={1.5} />
      <WarnBang cx={22} cy={BUBBLE_Y + BUBBLE_H / 2} r={6} />
      <text x={36} y={BUBBLE_Y + BUBBLE_H / 2 + 4} fontSize="11" fontWeight="700" fill="var(--fig-warn)">
        ส่งเลขบัตรลง log ห้ามผ่าน
      </text>
      {/* Footer */}
      <path d={`M1,${FOOTER_Y} H${W - 1}`} stroke="var(--fig-border)" />
      <text x={10} y={FOOTER_Y + 20} fontSize="10" fontWeight="700" fill="var(--fig-text)">
        รีวิวโดยคน · 3 วัน
      </text>
    </>
  );
};

const PANELS: FigurePanel[] = [
  {
    label: 'เวลาทำฟีเจอร์คืนเงิน 1 ชิ้น',
    note: 'งานเขียนหด งานคิดและตรวจโต',
    title: 'แถบเวลาทำงานก่อนและหลังมี AI',
    desc: 'แถบเวลาสองแถว แถวก่อนมี AI แบ่งเป็นตั้งโจทย์ เขียนโค้ด รีวิว และตรวจว่าถูก โดยเขียนโค้ดยาวที่สุด ส่วนแถวมี AI ช่วงเขียนโค้ดเหลือเพียงเส้นบางที่ติดป้ายว่า AI เขียน ขณะที่ตั้งโจทย์ รีวิว และตรวจว่าถูกกว้างขึ้นจนเป็นเนื้องานส่วนใหญ่',
    viewBox: '0 0 300 220',
    Screen: EffortTimeline,
  },
  {
    label: 'PR ที่ AI เขียน',
    note: 'คนตรวจเป็นด่านสุดท้าย',
    title: 'PR ที่ AI เขียนพร้อมคอมเมนต์รีวิว',
    desc: 'PR #301 เพิ่ม API คืนเงิน ติดป้ายเขียนโดย AI ใช้ 1 นาที มีบรรทัดที่เพิ่มห้าบรรทัด หนึ่งในนั้นถูกไฮไลต์เตือนคือ log(card_number) และมีคอมเมนต์รีวิวพร้อมเครื่องหมายเตือนว่าส่งเลขบัตรลง log ห้ามผ่าน ท้าย PR ระบุว่ารีวิวโดยคนใช้ 3 วัน',
    viewBox: '0 0 300 220',
    Screen: AiPr,
  },
];

/** s13 hero: effort shifts from writing code to framing and verifying; the AI PR shows why review is the bottleneck. */
export const RefundAiReview: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels panels={PANELS} columns={2} narrow="stack" className={className} />
);
