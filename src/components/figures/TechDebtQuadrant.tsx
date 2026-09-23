import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static fig 8 (s11 q8): Martin Fowler's technical debt quadrant. */
export const TechDebtQuadrant: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();
  const titleId = `${uid}-tdt`;
  const descId = `${uid}-tdd`;

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 560 330"
        role="img"
        aria-labelledby={`${titleId} ${descId}`}
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 560, display: 'block', margin: '0 auto' }}
      >
        <title id={titleId}>ตารางสี่ช่องของหนี้ทางเทคนิคตามกรอบของ Martin Fowler</title>
        <desc id={descId}>แกนนอนคือประมาทกับรอบคอบ แกนตั้งคือตั้งใจกับไม่ตั้งใจ เกิดเป็นสี่ช่อง ได้แก่ ตั้งใจและประมาท ตั้งใจและรอบคอบ ไม่ตั้งใจและประมาท และไม่ตั้งใจและรอบคอบ</desc>
        <text x="285" y="18" textAnchor="middle" fontSize="11" fill="var(--fig-text-muted)">ตั้งใจสร้างหนี้</text>
        <text x="285" y="322" textAnchor="middle" fontSize="11" fill="var(--fig-text-muted)">ไม่ตั้งใจ (เพิ่งมารู้ทีหลัง)</text>
        <text x="14" y="170" fontSize="11" fill="var(--fig-text-muted)">ประมาท</text>
        <text x="546" y="170" textAnchor="end" fontSize="11" fill="var(--fig-text-muted)">รอบคอบ</text>

        <rect x="70" y="32" width="210" height="118" rx="10" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" strokeWidth="1.5" />
        <text x="175" y="58" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--fig-text)">ตั้งใจ + ประมาท</text>
        <text x="175" y="82" textAnchor="middle" fontSize="11" fill="var(--fig-text-2)">"ไม่มีเวลาออกแบบหรอก"</text>
        <text x="175" y="106" textAnchor="middle" fontSize="10.5" fill="var(--fig-warn)">อันตรายที่สุด</text>
        <text x="175" y="126" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">รู้ว่าควรทำดีกว่านี้ แต่ลัด</text>
        <text x="175" y="141" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">โดยไม่มีแผนกลับมาแก้</text>

        <rect x="292" y="32" width="210" height="118" rx="10" fill="var(--fig-ok-bg)" stroke="var(--fig-ok-border)" strokeWidth="1.5" />
        <text x="397" y="58" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--fig-text)">ตั้งใจ + รอบคอบ</text>
        <text x="397" y="82" textAnchor="middle" fontSize="11" fill="var(--fig-text-2)">"ต้องส่งตอนนี้ แล้วค่อยกลับมาแก้"</text>
        <text x="397" y="106" textAnchor="middle" fontSize="10.5" fill="var(--fig-ok)">ยอมรับได้ ถ้าบันทึกไว้</text>
        <text x="397" y="126" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">เหมือนกู้เงินอย่างมีแผน</text>
        <text x="397" y="141" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">รู้ว่าจะจ่ายคืนเมื่อไหร่</text>

        <rect x="70" y="162" width="210" height="118" rx="10" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="175" y="188" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--fig-text)">ไม่ตั้งใจ + ประมาท</text>
        <text x="175" y="212" textAnchor="middle" fontSize="11" fill="var(--fig-text-2)">"layering คืออะไรเหรอ"</text>
        <text x="175" y="236" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-muted)">แก้ด้วยการเพิ่มคนรีวิว</text>
        <text x="175" y="256" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">ทีมยังไม่มีประสบการณ์พอ</text>
        <text x="175" y="271" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">จะมองไม่เห็นเอง</text>

        <rect x="292" y="162" width="210" height="118" rx="10" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="397" y="188" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--fig-text)">ไม่ตั้งใจ + รอบคอบ</text>
        <text x="397" y="212" textAnchor="middle" fontSize="11" fill="var(--fig-text-2)">"ตอนนี้เพิ่งรู้ว่าควรทำแบบไหน"</text>
        <text x="397" y="236" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-muted)">เลี่ยงไม่ได้ ไม่ใช่ความผิด</text>
        <text x="397" y="256" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">ตัดสินใจดีที่สุดแล้ว</text>
        <text x="397" y="271" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">ด้วยความรู้ที่มีตอนนั้น</text>
      </svg>
    </div>
  );
};
