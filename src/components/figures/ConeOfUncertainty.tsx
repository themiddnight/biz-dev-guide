import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static fig 9 (s11 q10): cone of uncertainty, estimate accuracy over time. */
export const ConeOfUncertainty: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();
  const titleId = `${uid}-cot`;
  const descId = `${uid}-cod`;

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 560 260"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 560, display: 'block', margin: '0 auto' }}
      >
        <title id={titleId}>แผนภาพกรวยแห่งความไม่แน่นอนของการประเมินเวลา</title>
        <desc id={descId}>ช่วงความคลาดเคลื่อนของการประเมินกว้างมากในช่วงต้นโปรเจกต์ และค่อยๆ แคบลงจนใกล้ค่าจริงเมื่อทีมได้ลงมือทำและเรียนรู้ระบบมากขึ้น</desc>
        <path d="M60 40 C 200 60, 330 96, 520 122 L 520 138 C 330 164, 200 200, 60 220 Z" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" strokeWidth="1.2" />
        <line x1="60" y1="130" x2="530" y2="130" stroke="var(--fig-text-muted)" strokeWidth="1.4" strokeDasharray="5 4" />
        <text x="536" y="134" fontSize="10" fill="var(--fig-text-muted)">ค่าจริง</text>

        <line x1="60" y1="26" x2="60" y2="240" stroke="var(--fig-border)" strokeWidth="1.2" />
        <line x1="60" y1="240" x2="530" y2="240" stroke="var(--fig-border)" strokeWidth="1.2" />

        <text x="14" y="46" fontSize="10" fill="var(--fig-text-muted)">ประเมิน</text>
        <text x="14" y="59" fontSize="10" fill="var(--fig-text-muted)">สูงไป</text>
        <text x="14" y="218" fontSize="10" fill="var(--fig-text-muted)">ประเมิน</text>
        <text x="14" y="231" fontSize="10" fill="var(--fig-text-muted)">ต่ำไป</text>

        <circle cx="60" cy="130" r="4" fill="var(--fig-warn)" />
        <text x="60" y="256" textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">วันแรก</text>
        <circle cx="230" cy="130" r="4" fill="var(--fig-warn)" />
        <text x="230" y="256" textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">ออกแบบเสร็จ</text>
        <circle cx="380" cy="130" r="4" fill="var(--fig-warn)" />
        <text x="380" y="256" textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">สร้างไปครึ่งทาง</text>
        <circle cx="520" cy="130" r="4" fill="var(--fig-warn)" />
        <text x="516" y="256" textAnchor="middle" fontSize="10" fill="var(--fig-text-2)">ใกล้เสร็จ</text>

        <text x="105" y="18" fontSize="10.5" fill="var(--fig-text-muted)">ตรงนี้คือจุดที่มักถูกขอตัวเลขเป๊ะๆ</text>
        <line x1="88" y1="24" x2="66" y2="36" stroke="var(--fig-text-muted)" strokeWidth="1" />
      </svg>
    </div>
  );
};
