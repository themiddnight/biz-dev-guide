import React from 'react';
import type { FigureProps } from './index';

/** Static s5 family card 6 (แผนและเวลา) signature icon. */
export const FamilyPlanSig: React.FC<FigureProps> = ({ className }) => {
  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 150 62"
        role="img"
        aria-label="ลายเซ็นของไดอะแกรมหมวดแผนและเวลา: แท่งแนวนอนเหลื่อมกันแบบแกนต์ชาร์ต"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 150, display: 'block', margin: '0 auto' }}
      >
        <line x1="30" y1="6" x2="30" y2="56" stroke="var(--fig-border)" strokeWidth="1" />
        <rect x="32" y="10" width="56" height="9" rx="2" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <rect x="58" y="24" width="52" height="9" rx="2" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="80" y="38" width="44" height="9" rx="2" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <line x1="14" y1="14" x2="28" y2="14" stroke="var(--fig-border)" strokeWidth="2" />
        <line x1="14" y1="28" x2="28" y2="28" stroke="var(--fig-border)" strokeWidth="2" />
        <line x1="14" y1="42" x2="28" y2="42" stroke="var(--fig-border)" strokeWidth="2" />
      </svg>
    </div>
  );
};
