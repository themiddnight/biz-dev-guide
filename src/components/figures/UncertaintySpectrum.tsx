import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static fig 10 (s12): uncertainty spectrum from PM to DevOps. */
export const UncertaintySpectrum: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 620 220"
        role="img"
        aria-labelledby={`${uid}-f8t ${uid}-f8d`}
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 620, display: 'block', margin: '0 auto' }}
      >
        <title id={`${uid}-f8t`}>สเปกตรัมของความไม่แน่นอนตั้งแต่ Product Manager ถึง DevOps</title>
        <desc id={`${uid}-f8d`}>เส้นแนวนอนมีจุดเจ็ดจุดเรียงจากซ้ายไปขวาแทนบทบาท PM, UX/UI, BA, SA, Engineer, QA, DevOps ฝั่งซ้ายกำกับว่าความไม่แน่นอนสูงสุดและเดิมพันด้วยข้อมูลไม่ครบ ฝั่งขวากำกับว่าทำซ้ำได้แม่นยำและวัดผลได้ชัดเจนที่สุด</desc>

        <line x1="30" y1="120" x2="590" y2="120" stroke="var(--fig-border)" strokeWidth="2" />

        <circle cx="30" cy="120" r="6" fill="var(--fig-c-pm)" />
        <text x="30" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fig-c-pm)">PM</text>
        <text x="30" y="140" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ตัดสินใจด้วย</text>
        <text x="30" y="151" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ข้อมูลไม่ครบ</text>

        <circle cx="123" cy="120" r="6" fill="var(--fig-c-ux)" />
        <text x="123" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fig-c-ux)">UX/UI</text>
        <text x="123" y="140" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ทดสอบไอเดีย</text>
        <text x="123" y="151" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ก่อนเขียน spec</text>

        <circle cx="217" cy="120" r="6" fill="var(--fig-c-ba)" />
        <text x="217" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fig-c-ba)">BA</text>
        <text x="217" y="140" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">แปลความต้องการ</text>
        <text x="217" y="151" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ให้ชัดพอสร้างได้</text>

        <circle cx="310" cy="120" r="6" fill="var(--fig-c-sa)" />
        <text x="310" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fig-c-sa)">SA</text>
        <text x="310" y="140" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ออกแบบโครงสร้าง</text>
        <text x="310" y="151" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ให้รองรับอนาคต</text>

        <circle cx="403" cy="120" r="6" fill="var(--fig-c-eng)" />
        <text x="403" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fig-c-eng)">Engineer</text>
        <text x="403" y="140" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">สร้างของจริง</text>
        <text x="403" y="151" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ตาม spec ที่ตกลง</text>

        <circle cx="497" cy="120" r="6" fill="var(--fig-c-qa)" />
        <text x="497" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fig-c-qa)">QA</text>
        <text x="497" y="140" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">หาช่องที่พัง</text>
        <text x="497" y="151" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ก่อน user จะเจอ</text>

        <circle cx="590" cy="120" r="6" fill="var(--fig-c-devops)" />
        <text x="590" y="98" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fig-c-devops)">DevOps</text>
        <text x="590" y="140" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ทำซ้ำได้แม่นยำ</text>
        <text x="590" y="151" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ไม่พึ่งความจำคน</text>

        <text x="30" y="185" textAnchor="start" fontSize="10.5" fill="var(--fig-text-muted)">← ความไม่แน่นอนสูง เดิมพันด้วยข้อมูลไม่ครบ</text>
        <text x="590" y="185" textAnchor="end" fontSize="10.5" fill="var(--fig-text-muted)">วัดผลได้ชัดเจน ทำซ้ำได้แม่นยำ →</text>
      </svg>
    </div>
  );
};
