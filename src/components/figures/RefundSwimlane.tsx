import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static s5 refund worked example: swimlane (BPMN). */
export const RefundSwimlane: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 300 356"
        role="img"
        aria-label="สวิมเลนไดอะแกรมของกระบวนการขอคืนเงิน แบ่งเป็นสามเลนคือลูกค้า ทีมซัพพอร์ต และระบบคืนเงิน"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <defs><marker id={`${uid}-pw-a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fig-text-muted)" /></marker></defs>
        <line x1="100" y1="30" x2="100" y2="350" stroke="var(--fig-border)" />
        <line x1="200" y1="30" x2="200" y2="350" stroke="var(--fig-border)" />
        <line x1="0" y1="30" x2="300" y2="30" stroke="var(--fig-border)" />
        <text x="50" y="20" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--fig-text-2)">ลูกค้า</text>
        <text x="150" y="20" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--fig-text-2)">ทีม support</text>
        <text x="250" y="20" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--fig-text-2)">ระบบคืนเงิน</text>

        <rect x="10" y="46" width="80" height="34" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="50" y="67" textAnchor="middle" fontSize="9.5" fill="var(--fig-text)">แจ้งของไม่ถึง</text>

        <rect x="110" y="104" width="80" height="34" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="150" y="125" textAnchor="middle" fontSize="9.5" fill="var(--fig-text)">ตรวจสอบ</text>

        <polygon points="150,158 186,188 150,218 114,188" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <text x="150" y="191" textAnchor="middle" fontSize="9" fill="var(--fig-text)">อนุมัติ?</text>

        <rect x="210" y="238" width="80" height="34" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="250" y="259" textAnchor="middle" fontSize="9.5" fill="var(--fig-text)">คืนเงิน</text>

        <rect x="10" y="304" width="80" height="34" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="50" y="325" textAnchor="middle" fontSize="9.5" fill="var(--fig-text)">รับแจ้งผล</text>

        <line x1="90" y1="63" x2="108" y2="104" stroke="var(--fig-text-muted)" strokeWidth="1.4" markerEnd={`url(#${uid}-pw-a)`} />
        <line x1="150" y1="138" x2="150" y2="156" stroke="var(--fig-text-muted)" strokeWidth="1.4" markerEnd={`url(#${uid}-pw-a)`} />
        <line x1="186" y1="188" x2="240" y2="235" stroke="var(--fig-text-muted)" strokeWidth="1.4" markerEnd={`url(#${uid}-pw-a)`} />
        <text x="198" y="212" fontSize="8.5" fill="var(--fig-text-muted)">ใช่</text>
        <line x1="250" y1="272" x2="250" y2="321" stroke="var(--fig-text-muted)" strokeWidth="1.4" />
        <line x1="250" y1="321" x2="93" y2="321" stroke="var(--fig-text-muted)" strokeWidth="1.4" markerEnd={`url(#${uid}-pw-a)`} />
      </svg>
    </div>
  );
};
