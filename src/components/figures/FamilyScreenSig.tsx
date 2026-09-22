import React from 'react';
import type { FigureProps } from './index';

/** Static s5 family card 4 (หน้าจอ) signature icon. */
export const FamilyScreenSig: React.FC<FigureProps> = ({ className }) => {
  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 150 62"
        role="img"
        aria-label="ไอคอนของไดอะแกรมหมวดหน้าจอ: กรอบหน้าจอที่มีแถบหัวและบล็อกเนื้อหา"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 150, display: 'block', margin: '0 auto' }}
      >
        <rect x="26" y="6" width="98" height="50" rx="4" fill="none" stroke="var(--fig-border)" />
        <rect x="26" y="6" width="98" height="10" rx="4" fill="var(--fig-surface-2)" />
        <rect x="33" y="22" width="38" height="26" rx="2" fill="var(--fig-surface-2)" />
        <line x1="78" y1="24" x2="117" y2="24" stroke="var(--fig-border)" strokeWidth="2" />
        <line x1="78" y1="31" x2="117" y2="31" stroke="var(--fig-border)" strokeWidth="2" />
        <line x1="78" y1="38" x2="100" y2="38" stroke="var(--fig-border)" strokeWidth="2" />
        <rect x="78" y="43" width="26" height="7" rx="2" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
      </svg>
    </div>
  );
};
