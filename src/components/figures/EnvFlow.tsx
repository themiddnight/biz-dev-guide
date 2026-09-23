import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static fig 6 (s8): code flowing through dev, staging, UAT and production. */
export const EnvFlow: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 620 200"
        role="img"
        aria-labelledby={`${uid}-f7t ${uid}-f7d`}
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 620, display: 'block', margin: '0 auto' }}
      >
        <title id={`${uid}-f7t`}>แผนภาพการไหลของโค้ดจาก dev ไป staging ไป UAT ไป production</title>
        <desc id={`${uid}-f7d`}>กล่องสี่กล่องเรียงต่อกันคือ dev, staging, UAT, production มีลูกศรชี้จากซ้ายไปขวาแสดงลำดับการเลื่อนขึ้นแต่ละ environment โดย production เน้นสีต่างจากกล่องอื่นเพราะเป็นระบบที่ user จริงใช้งาน</desc>
        <defs>
          <marker id={`${uid}-env-a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--fig-text-muted)" />
          </marker>
        </defs>

        <rect x="24" y="70" width="120" height="60" rx="8" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="84" y="96" textAnchor="middle" fontSize="12" fill="var(--fig-text)">Dev</text>
        <text x="84" y="112" textAnchor="middle" fontSize="9.5" fill="var(--fig-text-muted)">ข้อมูลปลอม</text>

        <rect x="176" y="70" width="120" height="60" rx="8" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="236" y="96" textAnchor="middle" fontSize="12" fill="var(--fig-text)">Staging</text>
        <text x="236" y="112" textAnchor="middle" fontSize="9.5" fill="var(--fig-text-muted)">ทดสอบรวมระบบ (QA)</text>

        <rect x="328" y="70" width="120" height="60" rx="8" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="388" y="96" textAnchor="middle" fontSize="12" fill="var(--fig-text)">UAT</text>
        <text x="388" y="112" textAnchor="middle" fontSize="9.5" fill="var(--fig-text-muted)">stakeholder sign-off</text>

        <rect x="480" y="70" width="120" height="60" rx="8" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <text x="540" y="96" textAnchor="middle" fontSize="12" fill="var(--fig-text)">Production</text>
        <text x="540" y="112" textAnchor="middle" fontSize="9.5" fill="var(--fig-text-muted)">user จริงใช้งาน</text>

        <line x1="144" y1="100" x2="172" y2="100" stroke="var(--fig-text-muted)" strokeWidth="1.6" markerEnd={`url(#${uid}-env-a)`}/>
        <line x1="296" y1="100" x2="324" y2="100" stroke="var(--fig-text-muted)" strokeWidth="1.6" markerEnd={`url(#${uid}-env-a)`}/>
        <line x1="448" y1="100" x2="476" y2="100" stroke="var(--fig-text-muted)" strokeWidth="1.6" markerEnd={`url(#${uid}-env-a)`}/>

        <text x="312" y="30" textAnchor="middle" fontSize="10.5" fill="var(--fig-warn)">ยิ่งใกล้ production ยิ่งต้องระวังมาก — ความเสียหายถ้าพลาดสูงขึ้นตามไปด้วย</text>
        <text x="312" y="164" textAnchor="middle" fontSize="9.5" fill="var(--fig-text-muted)">CI/CD คือสิ่งที่ทำให้การเลื่อนโค้ดจากซ้ายไปขวานี้เป็นขั้นตอนอัตโนมัติที่ทำซ้ำได้เหมือนเดิมทุกครั้ง</text>
      </svg>
    </div>
  );
};
