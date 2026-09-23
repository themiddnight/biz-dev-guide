import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static fig 5 (s5.3): C4 level 1 of the food-ordering app. */
export const C4L1Hero: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 620 210"
        role="img"
        aria-labelledby={`${uid}-f4t ${uid}-f4d`}
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 620, display: 'block', margin: '0 auto' }}
      >
        <title id={`${uid}-f4t`}>แผนภาพ C4 ระดับที่หนึ่ง ของแอปสั่งอาหาร</title>
        <desc id={`${uid}-f4d`}>ผู้ใช้สามกลุ่มคือลูกค้า ร้านค้า และไรเดอร์ เชื่อมเข้าหาแอปสั่งอาหารซึ่งเป็นกล่องเดียวตรงกลาง และแอปเชื่อมออกไปยังระบบภายนอกสองระบบคือระบบชำระเงินและระบบแผนที่</desc>
        <defs>
          <marker id={`${uid}-c4p1`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--fig-text-muted)" />
          </marker>
        </defs>
        <text x="70" y="20" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-muted)">คน (actor)</text>
        <text x="310" y="20" textAnchor="middle" fontSize="10.5" fill="var(--fig-accent)">ระบบที่เรากำลังสร้าง</text>
        <text x="540" y="20" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-muted)">ระบบภายนอก</text>

        <rect x="16" y="36" width="108" height="40" rx="7" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="70" y="61" textAnchor="middle" fontSize="11.5" fill="var(--fig-text)">ลูกค้า</text>
        <rect x="16" y="88" width="108" height="40" rx="7" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="70" y="113" textAnchor="middle" fontSize="11.5" fill="var(--fig-text)">ร้านค้า</text>
        <rect x="16" y="140" width="108" height="40" rx="7" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="70" y="165" textAnchor="middle" fontSize="11.5" fill="var(--fig-text)">ไรเดอร์</text>

        <rect x="215" y="60" width="190" height="96" rx="10" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" strokeWidth="1.5" />
        <text x="310" y="102" textAnchor="middle" fontSize="13.5" fontWeight="600" fill="var(--fig-text)">แอปสั่งอาหาร</text>
        <text x="310" y="124" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-muted)">ยังไม่บอกว่าข้างในมีอะไร</text>

        <rect x="470" y="52" width="134" height="42" rx="7" fill="var(--fig-surface-2)" stroke="var(--fig-border)" strokeDasharray="4 3" />
        <text x="537" y="72" textAnchor="middle" fontSize="11.5" fill="var(--fig-text)">ระบบชำระเงิน</text>
        <text x="537" y="87" textAnchor="middle" fontSize="9.5" fill="var(--fig-text-muted)">ของบริษัทอื่น</text>
        <rect x="470" y="122" width="134" height="42" rx="7" fill="var(--fig-surface-2)" stroke="var(--fig-border)" strokeDasharray="4 3" />
        <text x="537" y="142" textAnchor="middle" fontSize="11.5" fill="var(--fig-text)">ระบบแผนที่</text>
        <text x="537" y="157" textAnchor="middle" fontSize="9.5" fill="var(--fig-text-muted)">ของบริษัทอื่น</text>

        <line x1="124" y1="56" x2="211" y2="86" stroke="var(--fig-text-muted)" strokeWidth="1.4" markerEnd={`url(#${uid}-c4p1)`} />
        <line x1="124" y1="108" x2="211" y2="108" stroke="var(--fig-text-muted)" strokeWidth="1.4" markerEnd={`url(#${uid}-c4p1)`} />
        <line x1="124" y1="160" x2="211" y2="130" stroke="var(--fig-text-muted)" strokeWidth="1.4" markerEnd={`url(#${uid}-c4p1)`} />
        <line x1="405" y1="88" x2="466" y2="74" stroke="var(--fig-text-muted)" strokeWidth="1.4" markerEnd={`url(#${uid}-c4p1)`} />
        <line x1="405" y1="128" x2="466" y2="142" stroke="var(--fig-text-muted)" strokeWidth="1.4" markerEnd={`url(#${uid}-c4p1)`} />
        <text x="310" y="196" textAnchor="middle" fontSize="11" fill="var(--fig-text-muted)">ไม่มีคำศัพท์เทคนิคสักคำ แต่ตอบได้แล้วว่าโปรเจกต์นี้ไปแตะใครบ้าง</text>
      </svg>
    </div>
  );
};
