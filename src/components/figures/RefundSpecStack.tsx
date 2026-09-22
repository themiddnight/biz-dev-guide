import React from 'react';
import type { FigureProps } from './index';
import { DocCard } from './shared/DocCard';
import { FigurePanels, type FigurePanel } from './shared/FigurePanels';

/*
 * s14 hero: the refund feature written down in 4 spec layers (chapter figure briefs 2026-09-22, s14).
 * Each panel is one real document excerpt in viewBox 0 0 150 240 with a reader tag and a
 * back-link chip to the layer above, so traceability is visible without prose.
 * Labels, notes, tabs and the footer strip are HTML.
 */

const BrdDoc: React.FC = () => (
  <DocCard
    id="BRD-3"
    heading="เป้าหมาย"
    rows={['ลดเรื่องร้องเรียน', '"ของไม่ถึง" 30%', 'ภายในไตรมาสนี้']}
    tag="ผู้อ่าน: ผู้บริหาร"
  />
);

const PrdDoc: React.FC = () => (
  <DocCard
    id="PRD-12"
    rows={['ลูกค้าขอคืนเงินเอง', 'เมื่อของไม่ถึง 7 วัน', 'ไม่ต้องรอ support']}
    backLink="↑ เพื่อ BRD-3"
    tag="ผู้อ่าน: PM · UX"
  />
);

const StoryCard: React.FC = () => (
  <DocCard
    id="REF-118"
    kind="ticket"
    rows={[
      'ในฐานะ ลูกค้า',
      'ฉันอยากขอคืนเงินเอง',
      'เพื่อ ไม่ต้องรอ',
      { divider: true },
      'Given ของไม่ถึง 7 วัน',
      'When กดขอคืนเงิน',
      'Then ได้เลขคำขอ',
    ]}
    backLink="↑ จาก PRD-12"
  />
);

const AdrDoc: React.FC = () => (
  <DocCard
    id="ADR-007"
    heading="ใช้คิวสั่งคืนเงิน"
    rows={['บริบท: ธนาคารตอบช้า', 'ตัดสินใจ: ส่งผ่านคิว', 'ผลที่ยอม:', 'รอผลไม่กี่นาที']}
    backLink="↑ รองรับ REF-118"
    tag="ผู้อ่าน: Dev"
  />
);

const LAYERS: FigurePanel[] = [
  {
    label: 'BRD (ผู้บริหาร)',
    tab: 'BRD',
    note: 'ทำไมต้องทำ',
    title: 'เอกสารชั้นที่ 1 BRD (ผู้บริหาร)',
    desc: 'เอกสาร BRD-3 หัวข้อเป้าหมาย ลดเรื่องร้องเรียนของไม่ถึง 30% ภายในไตรมาสนี้ ผู้อ่านคือผู้บริหาร',
    viewBox: '0 0 150 240',
    Screen: BrdDoc,
  },
  {
    label: 'PRD (ทีมผลิตภัณฑ์)',
    tab: 'PRD',
    note: 'ทำอะไร ให้ใคร',
    title: 'เอกสารชั้นที่ 2 PRD (ทีมผลิตภัณฑ์)',
    desc: 'เอกสาร PRD-12 ลูกค้าขอคืนเงินเองเมื่อของไม่ถึง 7 วัน ไม่ต้องรอ support มีลิงก์ชี้กลับไปหา BRD-3 ผู้อ่านคือ PM และ UX',
    viewBox: '0 0 150 240',
    Screen: PrdDoc,
  },
  {
    label: 'User Story (ทีม Sprint)',
    tab: 'Story',
    note: 'ตรวจรับอย่างไร',
    title: 'เอกสารชั้นที่ 3 User Story (ทีม Sprint)',
    desc: 'การ์ด REF-118 ในฐานะลูกค้า ฉันอยากขอคืนเงินเองเพื่อไม่ต้องรอ พร้อมเกณฑ์ตรวจรับ Given ของไม่ถึง 7 วัน When กดขอคืนเงิน Then ได้เลขคำขอ และลิงก์ชี้กลับไปหา PRD-12',
    viewBox: '0 0 150 240',
    Screen: StoryCard,
  },
  {
    label: 'ADR (Dev)',
    tab: 'ADR',
    note: 'ทำไมสร้างแบบนี้',
    title: 'เอกสารชั้นที่ 4 ADR (Dev)',
    desc: 'เอกสาร ADR-007 ใช้คิวสั่งคืนเงิน บริบทคือธนาคารตอบช้า ตัดสินใจส่งผ่านคิว ผลที่ยอมคือรอผลไม่กี่นาที มีลิงก์ชี้กลับไปหา REF-118 ผู้อ่านคือ Dev',
    viewBox: '0 0 150 240',
    Screen: AdrDoc,
  },
];

/** s14 hero: BRD → PRD → Story → ADR for the refund feature, each tracing back to the layer above. */
export const RefundSpecStack: React.FC<FigureProps> = ({ className }) => (
  <FigurePanels
    panels={LAYERS}
    columns={4}
    narrow="tabs"
    tablistLabel="เลือกชั้นเอกสาร"
    className={className}
    footer={<span>ทุกชั้นชี้กลับไปหาชั้นก่อนหน้าได้ (↑)</span>}
  />
);
