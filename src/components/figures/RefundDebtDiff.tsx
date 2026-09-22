import React from 'react';
import type { FigureProps } from './index';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';
import { OkTick, WarnBang } from './shared/glyphs';

/*
 * s9 hero: the same tiny request ("add refund reason สินค้าชำรุด") as a pull request's
 * files-changed list, with debt (6 copy-pasted files, one missed) vs after refactoring
 * (one file) (chapter figure briefs 2026-09-22, s9). Each panel is viewBox 0 0 300 240:
 * PR header → file rows → outcome footer at the same y in both panels.
 * Status is glyph + text, never colour alone. Panel labels and notes are HTML.
 */

const W = 300;
const HEADER_H = 42;
const ROW_Y = 50;
const ROW_H = 20;
const FOOTER_Y = 202;
const FOOTER_H = 37; // bottom edge at y = 239

interface PrHeaderProps {
  pr: string;
  files: string;
}

const PrHeader: React.FC<PrHeaderProps> = ({ pr, files }) => (
  <g>
    <rect x={1} y={1} width={W - 2} height={HEADER_H} rx={6} fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
    <text x={10} y={18} fontSize="11" fontWeight="700" fill="var(--fig-text)">
      {pr} เพิ่มเหตุผล "สินค้าชำรุด"
    </text>
    <text x={10} y={34} fontSize="10" fill="var(--fig-text-2)">
      {files}
    </text>
  </g>
);

interface FileRowProps {
  i: number;
  path: string;
  missed?: boolean;
}

/** One files-changed row: path left, "+1" (ok) or "!" + "ลืมแก้" (warn) right. */
const FileRow: React.FC<FileRowProps> = ({ i, path, missed }) => {
  const y = ROW_Y + i * ROW_H;
  return (
    <g>
      <rect
        x={1}
        y={y}
        width={W - 2}
        height={ROW_H - 2}
        rx={3}
        fill={missed ? 'var(--fig-warn-bg)' : 'var(--fig-bg)'}
        stroke={missed ? 'var(--fig-warn-border)' : 'var(--fig-border)'}
      />
      <text x={10} y={y + 13} fontSize="10" fill="var(--fig-text)">
        {path}
      </text>
      {missed ? (
        <>
          <WarnBang cx={W - 45} cy={y + 9} />
          <text x={W - 10} y={y + 13} textAnchor="end" fontSize="10" fontWeight="700" fill="var(--fig-warn)">
            ลืมแก้
          </text>
        </>
      ) : (
        <text x={W - 10} y={y + 13} textAnchor="end" fontSize="10" fontWeight="700" fill="var(--fig-ok)">
          +1
        </text>
      )}
    </g>
  );
};

interface FooterProps {
  ok: boolean;
  children: string;
}

const Footer: React.FC<FooterProps> = ({ ok, children }) => (
  <g>
    <rect
      x={1}
      y={FOOTER_Y}
      width={W - 2}
      height={FOOTER_H}
      rx={6}
      fill={ok ? 'var(--fig-ok-bg)' : 'var(--fig-warn-bg)'}
      stroke={ok ? 'var(--fig-ok-border)' : 'var(--fig-warn-border)'}
    />
    {ok ? <OkTick x={9} y={FOOTER_Y + 11} size={14} /> : <WarnBang cx={16} cy={FOOTER_Y + 18} r={6} />}
    <text x={29} y={FOOTER_Y + 22} fontSize="11" fontWeight="700" fill={ok ? 'var(--fig-ok)' : 'var(--fig-warn)'}>
      {children}
    </text>
  </g>
);

const DEBT_FILES = ['app/refund-form.ts', 'backoffice/refund.ts', 'email/refund.html', 'report/export.ts', 'api/v1/refund.ts'];

const DebtDiff: React.FC = () => (
  <>
    <PrHeader pr="PR #212" files="แก้ 6 ไฟล์" />
    {DEBT_FILES.map((path, i) => (
      <FileRow key={path} i={i} path={path} />
    ))}
    <FileRow i={DEBT_FILES.length} path="api/v2/refund.ts" missed />
    <Footer ok={false}>อีเมลแจ้งลูกค้าแสดงเหตุผลว่าง</Footer>
  </>
);

const RefactoredDiff: React.FC = () => (
  <>
    <PrHeader pr="PR #245" files="แก้ 1 ไฟล์" />
    <FileRow i={0} path="refund/reasons.ts" />
    <text x={10} y={ROW_Y + ROW_H + 16} fontSize="10" fill="var(--fig-text-muted)">
      ทุกหน้าจออ่านรายการจากไฟล์นี้
    </text>
    <Footer ok>ครบทุกหน้าจอ</Footer>
  </>
);

const PANELS: FigurePanel[] = [
  {
    label: 'โค้ดที่มีหนี้',
    note: 'งานเล็ก แต่ต้องตามแก้ทุกที่',
    title: 'รายการไฟล์ที่ต้องแก้ในโค้ดที่มีหนี้',
    desc: 'PR #212 เพิ่มเหตุผล สินค้าชำรุด แก้ 6 ไฟล์ ห้าไฟล์เพิ่มหนึ่งบรรทัด ไฟล์ api/v2/refund.ts ลืมแก้ ผลคืออีเมลแจ้งลูกค้าแสดงเหตุผลว่าง',
    viewBox: '0 0 300 240',
    Screen: DebtDiff,
  },
  {
    label: 'หลัง Refactor',
    note: 'งานเล็ก ก็แก้ที่เดียว',
    title: 'รายการไฟล์ที่ต้องแก้หลังปรับโครงสร้างโค้ด',
    desc: 'PR #245 เพิ่มเหตุผล สินค้าชำรุด แก้ 1 ไฟล์ คือ refund/reasons.ts ซึ่งทุกหน้าจออ่านรายการจากไฟล์นี้ ผลคือครบทุกหน้าจอ',
    viewBox: '0 0 300 240',
    Screen: RefactoredDiff,
  },
];

/** s9 hero: the same small request as a PR diff, 6 copy-pasted files with debt vs 1 file after refactoring. */
export const RefundDebtDiff: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels panels={PANELS} columns={2} narrow="stack" className={className} />
);
