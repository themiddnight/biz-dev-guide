import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static fig 1 (s1): one business sentence passing through translation layers to code. */
export const TranslationLayers: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 620 430"
        role="img"
        aria-labelledby={`${uid}-p1t ${uid}-p1d`}
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 620, display: 'block', margin: '0 auto' }}
      >
        <title id={`${uid}-p1t`}>แผนภาพเส้นทางการแปลความต้องการทางธุรกิจไปสู่โค้ด</title>
        <desc id={`${uid}-p1d`}>ความต้องการทางธุรกิจไหลลงผ่านสี่บทบาท ได้แก่ Product Manager, Business Analyst, Solution Architect และ Engineer โดยแต่ละบทบาทผลิตเอกสารของตัวเอง และมีจุดที่ความกำกวมรั่วไหลอยู่ระหว่างแต่ละชั้น ส่วน Project Manager ทำงานคู่ขนานตลอดเส้นโดยไม่ตัดสินใจเนื้อหา</desc>
        <defs>
          <marker id={`${uid}-pipe-a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--fig-text-muted)" />
          </marker>
        </defs>

        <rect x="20" y="8" width="330" height="42" rx="8" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
        <text x="36" y="27" fontSize="12" fill="var(--fig-text)">ธุรกิจต้องการ</text>
        <text x="36" y="43" fontSize="12.5" fontWeight="600" fill="var(--fig-text)">"ลูกค้าสั่งอาหารได้ง่ายขึ้น"</text>

        <rect x="20" y="80" width="330" height="56" rx="8" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="36" y="102" fontSize="13" fontWeight="600" fill="var(--fig-text)">Product Manager</text>
        <text x="36" y="121" fontSize="11.5" fill="var(--fig-text-2)">ตัดสินใจ "ควรทำอะไร ทำไม"</text>
        <text x="370" y="102" fontSize="10.5" fill="var(--fig-text-muted)">ผลลัพธ์</text>
        <text x="370" y="119" fontSize="11.5" fill="var(--fig-text-2)">roadmap · PRD</text>

        <rect x="20" y="166" width="330" height="56" rx="8" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="36" y="188" fontSize="13" fontWeight="600" fill="var(--fig-text)">Business Analyst</text>
        <text x="36" y="207" fontSize="11.5" fill="var(--fig-text-2)">แปลเป็น requirement ที่ชัดพอ</text>
        <text x="370" y="188" fontSize="10.5" fill="var(--fig-text-muted)">ผลลัพธ์</text>
        <text x="370" y="205" fontSize="11.5" fill="var(--fig-text-2)">BRD · user story</text>

        <rect x="20" y="252" width="330" height="56" rx="8" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="36" y="274" fontSize="13" fontWeight="600" fill="var(--fig-text)">Solution Architect</text>
        <text x="36" y="293" fontSize="11.5" fill="var(--fig-text-2)">แปลเป็นโครงสร้างระบบ</text>
        <text x="370" y="274" fontSize="10.5" fill="var(--fig-text-muted)">ผลลัพธ์</text>
        <text x="370" y="291" fontSize="11.5" fill="var(--fig-text-2)">solution design</text>

        <rect x="20" y="338" width="330" height="52" rx="8" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <text x="36" y="360" fontSize="13" fontWeight="600" fill="var(--fig-text)">Engineer</text>
        <text x="36" y="378" fontSize="11.5" fill="var(--fig-text-2)">แปลเป็น code จริง</text>

        <line x1="60" y1="50" x2="60" y2="76" stroke="var(--fig-text-muted)" strokeWidth="1.6" markerEnd={`url(#${uid}-pipe-a)`}/>
        <line x1="60" y1="136" x2="60" y2="162" stroke="var(--fig-text-muted)" strokeWidth="1.6" markerEnd={`url(#${uid}-pipe-a)`}/>
        <line x1="60" y1="222" x2="60" y2="248" stroke="var(--fig-text-muted)" strokeWidth="1.6" markerEnd={`url(#${uid}-pipe-a)`}/>
        <line x1="60" y1="308" x2="60" y2="334" stroke="var(--fig-text-muted)" strokeWidth="1.6" markerEnd={`url(#${uid}-pipe-a)`}/>

        <circle cx="112" cy="63" r="7" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
        <text x="112" y="67" textAnchor="middle" fontSize="9.5" fill="var(--fig-warn)">!</text>
        <circle cx="112" cy="149" r="7" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
        <text x="112" y="153" textAnchor="middle" fontSize="9.5" fill="var(--fig-warn)">!</text>
        <circle cx="112" cy="235" r="7" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
        <text x="112" y="239" textAnchor="middle" fontSize="9.5" fill="var(--fig-warn)">!</text>
        <circle cx="112" cy="321" r="7" fill="var(--fig-warn-bg)" stroke="var(--fig-warn-border)" />
        <text x="112" y="325" textAnchor="middle" fontSize="9.5" fill="var(--fig-warn)">!</text>
        <text x="128" y="67" fontSize="10.5" fill="var(--fig-warn)">จุดที่ความหมายรั่วได้มากที่สุด</text>

        <rect x="500" y="80" width="104" height="310" rx="8" fill="none" stroke="var(--fig-border)" strokeDasharray="5 4" />
        <text x="552" y="212" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--fig-text-2)">Project</text>
        <text x="552" y="228" textAnchor="middle" fontSize="11.5" fontWeight="600" fill="var(--fig-text-2)">Manager</text>
        <text x="552" y="250" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">คุมเวลา/คน</text>
        <text x="552" y="264" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">คู่ขนานทั้งเส้น</text>
        <text x="552" y="284" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">ไม่ตัดสินใจ</text>
        <text x="552" y="298" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">เนื้อหา</text>
      </svg>
    </div>
  );
};
