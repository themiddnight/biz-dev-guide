import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static fig 4 (s5.2): the same system seen through three lenses. */
export const ThreeLenses: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 620 250"
        role="img"
        aria-labelledby={`${uid}-f3t ${uid}-f3d`}
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 620, display: 'block', margin: '0 auto' }}
      >
        <title id={`${uid}-f3t`}>แผนภาพเปรียบเทียบมุมมองสามแบบของระบบเดียวกัน</title>
        <desc id={`${uid}-f3d`}>มุมมองที่หนึ่งคือขอบเขต แสดงระบบเป็นกล่องเดียวล้อมด้วยผู้เกี่ยวข้อง มุมมองที่สองคือโครงสร้าง แสดงก้อนย่อยภายในระบบและการเชื่อมกัน มุมมองที่สามคือพฤติกรรม แสดงลำดับเหตุการณ์ตามเวลา</desc>
        <defs>
          <marker id={`${uid}-v3-a`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--fig-text-muted)" />
          </marker>
        </defs>

        <rect x="8" y="8" width="192" height="234" rx="10" fill="none" stroke="var(--fig-border)" />
        <rect x="214" y="8" width="192" height="234" rx="10" fill="none" stroke="var(--fig-border)" />
        <rect x="420" y="8" width="192" height="234" rx="10" fill="none" stroke="var(--fig-border)" />

        <text x="104" y="30" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--fig-text)">ขอบเขต</text>
        <text x="104" y="46" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-muted)">high-level solution</text>
        <text x="310" y="30" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--fig-text)">โครงสร้าง</text>
        <text x="310" y="46" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-muted)">module + function map</text>
        <text x="516" y="30" textAnchor="middle" fontSize="12.5" fontWeight="600" fill="var(--fig-text)">พฤติกรรม</text>
        <text x="516" y="46" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-muted)">use case + sequence</text>

        <rect x="66" y="105" width="76" height="46" rx="7" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <text x="104" y="133" textAnchor="middle" fontSize="10.5" fill="var(--fig-text)">ระบบ</text>
        <circle cx="30" cy="90" r="11" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <circle cx="178" cy="90" r="11" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <circle cx="30" cy="168" r="11" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <circle cx="178" cy="168" r="11" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <line x1="41" y1="97" x2="63" y2="110" stroke="var(--fig-text-muted)" strokeWidth="1.2" />
        <line x1="167" y1="97" x2="145" y2="110" stroke="var(--fig-text-muted)" strokeWidth="1.2" />
        <line x1="41" y1="161" x2="63" y2="147" stroke="var(--fig-text-muted)" strokeWidth="1.2" />
        <line x1="167" y1="161" x2="145" y2="147" stroke="var(--fig-text-muted)" strokeWidth="1.2" />
        <text x="104" y="200" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-2)">"ใครแตะระบบนี้บ้าง"</text>
        <text x="104" y="220" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">ผู้บริหาร · ลูกค้า</text>

        <rect x="242" y="76" width="136" height="104" rx="8" fill="none" stroke="var(--fig-accent-border)" strokeDasharray="4 3" />
        <rect x="254" y="88" width="54" height="30" rx="5" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="318" y="88" width="48" height="30" rx="5" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="254" y="138" width="54" height="30" rx="5" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="318" y="138" width="48" height="30" rx="5" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <line x1="308" y1="103" x2="316" y2="103" stroke="var(--fig-text-muted)" strokeWidth="1.2" />
        <line x1="281" y1="118" x2="281" y2="136" stroke="var(--fig-text-muted)" strokeWidth="1.2" />
        <line x1="308" y1="153" x2="316" y2="153" stroke="var(--fig-text-muted)" strokeWidth="1.2" />
        <line x1="342" y1="118" x2="342" y2="136" stroke="var(--fig-text-muted)" strokeWidth="1.2" />
        <text x="310" y="200" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-2)">"ข้างในมีอะไร เชื่อมกันยังไง"</text>
        <text x="310" y="220" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">architect · tech lead</text>

        <line x1="452" y1="74" x2="452" y2="182" stroke="var(--fig-border)" strokeWidth="1.2" />
        <line x1="516" y1="74" x2="516" y2="182" stroke="var(--fig-border)" strokeWidth="1.2" />
        <line x1="580" y1="74" x2="580" y2="182" stroke="var(--fig-border)" strokeWidth="1.2" />
        <circle cx="452" cy="70" r="4" fill="var(--fig-text-muted)" />
        <circle cx="516" cy="70" r="4" fill="var(--fig-text-muted)" />
        <circle cx="580" cy="70" r="4" fill="var(--fig-text-muted)" />
        <line x1="452" y1="96" x2="512" y2="96" stroke="var(--fig-text-muted)" strokeWidth="1.3" markerEnd={`url(#${uid}-v3-a)`} />
        <line x1="516" y1="124" x2="576" y2="124" stroke="var(--fig-text-muted)" strokeWidth="1.3" markerEnd={`url(#${uid}-v3-a)`} />
        <line x1="580" y1="152" x2="456" y2="152" stroke="var(--fig-text-muted)" strokeWidth="1.3" markerEnd={`url(#${uid}-v3-a)`} />
        <text x="516" y="200" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-2)">"เกิดอะไรก่อนหลัง"</text>
        <text x="516" y="220" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">developer · QA</text>
      </svg>
    </div>
  );
};
