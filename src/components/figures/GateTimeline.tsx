import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static fig 7 (s9): delivery gates and the rising cost of changing your mind. */
export const GateTimeline: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 620 300"
        role="img"
        aria-labelledby={`${uid}-f5t ${uid}-f5d`}
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 620, display: 'block', margin: '0 auto' }}
      >
        <title id={`${uid}-f5t`}>เส้นเวลาส่งงานกับจุด gate และต้นทุนถ้าเปลี่ยนใจ</title>
        <desc id={`${uid}-f5d`}>เส้นเวลาห้าช่วงคือ elicit ตกลงขอบเขต ออกแบบ สร้าง และขึ้นระบบจริง โดยมีจุด gate คั่นระหว่างช่วง และมีเส้นโค้งแสดงต้นทุนของการเปลี่ยนแปลงที่สูงขึ้นเรื่อยๆ ตามช่วงเวลาที่ผ่านไป</desc>
        <defs>
          <marker id={`${uid}-gate-a`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--fig-text-muted)" />
          </marker>
        </defs>

        <text x="14" y="20" fontSize="11" fill="var(--fig-warn)">ต้นทุนของการเปลี่ยนใจ</text>
        <path d="M40 88 C 160 84, 300 74, 400 58 S 540 26, 596 18" fill="none" stroke="var(--fig-warn-border)" strokeWidth="2.5" />
        <circle cx="40" cy="88" r="3.5" fill="var(--fig-warn-border)" />
        <circle cx="596" cy="18" r="3.5" fill="var(--fig-warn-border)" />
        <text x="44" y="104" fontSize="10" fill="var(--fig-text-muted)">ถูก</text>
        <text x="596" y="36" textAnchor="end" fontSize="10" fill="var(--fig-text-muted)">แพง</text>

        <line x1="40" y1="150" x2="596" y2="150" stroke="var(--fig-border)" strokeWidth="1.5" />

        <rect x="24" y="128" width="86" height="44" rx="7" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="67" y="147" textAnchor="middle" fontSize="10.5" fill="var(--fig-text)">Elicit</text>
        <text x="67" y="162" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">คุย stakeholder</text>

        <rect x="146" y="128" width="94" height="44" rx="7" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="193" y="147" textAnchor="middle" fontSize="10.5" fill="var(--fig-text)">ตกลงขอบเขต</text>
        <text x="193" y="162" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">requirement doc</text>

        <rect x="276" y="128" width="94" height="44" rx="7" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="323" y="147" textAnchor="middle" fontSize="10.5" fill="var(--fig-text)">ออกแบบ</text>
        <text x="323" y="162" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">solution design</text>

        <rect x="406" y="128" width="86" height="44" rx="7" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="449" y="147" textAnchor="middle" fontSize="10.5" fill="var(--fig-text)">สร้าง</text>
        <text x="449" y="162" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">build</text>

        <rect x="516" y="128" width="86" height="44" rx="7" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <text x="559" y="147" textAnchor="middle" fontSize="10.5" fill="var(--fig-text)">ขึ้นระบบจริง</text>
        <text x="559" y="162" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">go-live</text>

        <line x1="110" y1="150" x2="143" y2="150" stroke="var(--fig-text-muted)" strokeWidth="1.3" markerEnd={`url(#${uid}-gate-a)`}/>
        <line x1="240" y1="150" x2="273" y2="150" stroke="var(--fig-text-muted)" strokeWidth="1.3" markerEnd={`url(#${uid}-gate-a)`}/>
        <line x1="370" y1="150" x2="403" y2="150" stroke="var(--fig-text-muted)" strokeWidth="1.3" markerEnd={`url(#${uid}-gate-a)`}/>
        <line x1="492" y1="150" x2="513" y2="150" stroke="var(--fig-text-muted)" strokeWidth="1.3" markerEnd={`url(#${uid}-gate-a)`}/>

        <line x1="128" y1="182" x2="128" y2="204" stroke="var(--fig-warn-border)" strokeWidth="1.8" />
        <line x1="258" y1="182" x2="258" y2="204" stroke="var(--fig-warn-border)" strokeWidth="1.8" />
        <line x1="388" y1="182" x2="388" y2="204" stroke="var(--fig-warn-border)" strokeWidth="1.8" />
        <line x1="504" y1="182" x2="504" y2="204" stroke="var(--fig-warn-border)" strokeWidth="1.8" />

        <text x="128" y="220" textAnchor="middle" fontSize="9.5" fill="var(--fig-warn)">gate</text>
        <text x="128" y="233" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ตกลงร่วม</text>
        <text x="258" y="220" textAnchor="middle" fontSize="9.5" fill="var(--fig-warn)">gate</text>
        <text x="258" y="233" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">ขอบเขตนิ่ง</text>
        <text x="388" y="220" textAnchor="middle" fontSize="9.5" fill="var(--fig-warn)">gate</text>
        <text x="388" y="233" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">design sign-off</text>
        <text x="504" y="220" textAnchor="middle" fontSize="9.5" fill="var(--fig-warn)">gate</text>
        <text x="504" y="233" textAnchor="middle" fontSize="9" fill="var(--fig-text-muted)">UAT sign-off</text>

        <rect x="24" y="256" width="578" height="34" rx="7" fill="none" stroke="var(--fig-border)" strokeDasharray="5 4" />
        <text x="313" y="277" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-muted)">Project Manager คุมเวลาและคนตลอดเส้น — ปรับแผนใหม่ระหว่างทางเป็นงานปกติ ไม่ใช่สัญญาณว่าโปรเจกต์พัง</text>
      </svg>
    </div>
  );
};
