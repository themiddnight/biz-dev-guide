import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static s5 refund worked example: sequence (UML). */
export const RefundSequence: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 300 356"
        role="img"
        aria-label="ซีเควนซ์ไดอะแกรมของกระบวนการขอคืนเงิน มีสามผู้เกี่ยวข้องและข้อความห้าข้อเรียงตามเวลา"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
      >
        <defs>
          <marker id={`${uid}-pq-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fig-accent)" /></marker>
          <marker id={`${uid}-pq-r`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fig-text-muted)" /></marker>
        </defs>
        <rect x="8" y="6" width="80" height="26" rx="5" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="48" y="23" textAnchor="middle" fontSize="10" fill="var(--fig-text)">ลูกค้า</text>
        <rect x="108" y="6" width="84" height="26" rx="5" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="150" y="23" textAnchor="middle" fontSize="10" fill="var(--fig-text)">ทีม support</text>
        <rect x="210" y="6" width="84" height="26" rx="5" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="252" y="23" textAnchor="middle" fontSize="10" fill="var(--fig-text)">ระบบคืนเงิน</text>

        <line x1="48" y1="32" x2="48" y2="344" stroke="var(--fig-border)" strokeDasharray="4 4" />
        <line x1="150" y1="32" x2="150" y2="344" stroke="var(--fig-border)" strokeDasharray="4 4" />
        <line x1="252" y1="32" x2="252" y2="344" stroke="var(--fig-border)" strokeDasharray="4 4" />

        <rect x="144" y="66" width="12" height="200" rx="2" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <rect x="246" y="176" width="12" height="66" rx="2" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />

        <line x1="48" y1="66" x2="141" y2="66" stroke="var(--fig-accent)" strokeWidth="1.4" markerEnd={`url(#${uid}-pq-a)`} />
        <text x="52" y="61" fontSize="9" fill="var(--fig-text-2)">1. แจ้งของไม่ถึง</text>

        <path d="M156 100 H182 V126 H159" fill="none" stroke="var(--fig-accent)" strokeWidth="1.4" markerEnd={`url(#${uid}-pq-a)`} />
        <text x="188" y="114" fontSize="9" fill="var(--fig-text-2)">2. ตรวจสอบ</text>
        <text x="188" y="126" fontSize="8.5" fill="var(--fig-text-muted)">(เรียกตัวเอง)</text>

        <line x1="156" y1="176" x2="245" y2="176" stroke="var(--fig-accent)" strokeWidth="1.4" markerEnd={`url(#${uid}-pq-a)`} />
        <text x="158" y="171" fontSize="9" fill="var(--fig-text-2)">3. สั่งคืนเงิน</text>

        <line x1="246" y1="242" x2="157" y2="242" stroke="var(--fig-text-muted)" strokeWidth="1.3" strokeDasharray="4 3" markerEnd={`url(#${uid}-pq-r)`} />
        <text x="158" y="237" fontSize="9" fill="var(--fig-text-muted)">4. ยืนยันสำเร็จ</text>

        <line x1="144" y1="290" x2="51" y2="290" stroke="var(--fig-accent)" strokeWidth="1.4" markerEnd={`url(#${uid}-pq-a)`} />
        <text x="54" y="285" fontSize="9" fill="var(--fig-text-2)">5. แจ้งผล</text>

        <rect x="8" y="312" width="150" height="30" rx="4" fill="none" stroke="var(--fig-warn-border)" strokeDasharray="3 3" />
        <text x="14" y="325" fontSize="8.5" fill="var(--fig-warn)">แท่งทึบ = ช่วงที่ฝ่ายนั้น</text>
        <text x="14" y="337" fontSize="8.5" fill="var(--fig-warn)">กำลังทำงาน/ถูกรอ</text>
      </svg>
    </div>
  );
};
