import React from 'react';
import type { FigureProps } from './index';

/** Static s5 family card 2 (พฤติกรรม) signature icon. */
export const FamilyBehaviorSig: React.FC<FigureProps> = ({ className }) => {
  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 150 62"
        role="img"
        aria-label="ลายเซ็นของไดอะแกรมหมวดพฤติกรรม: เส้นตั้งหลายเส้นกับลูกศรแนวนอนไล่ลงมา"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 150, display: 'block', margin: '0 auto' }}
      >
        <line x1="24" y1="8" x2="24" y2="56" stroke="var(--fig-border)" strokeWidth="1" />
        <line x1="75" y1="8" x2="75" y2="56" stroke="var(--fig-border)" strokeWidth="1" />
        <line x1="126" y1="8" x2="126" y2="56" stroke="var(--fig-border)" strokeWidth="1" />
        <circle cx="24" cy="8" r="3" fill="var(--fig-text-muted)" />
        <circle cx="75" cy="8" r="3" fill="var(--fig-text-muted)" />
        <circle cx="126" cy="8" r="3" fill="var(--fig-text-muted)" />
        <line x1="24" y1="22" x2="72" y2="22" stroke="var(--fig-accent)" strokeWidth="1.3" />
        <line x1="75" y1="35" x2="123" y2="35" stroke="var(--fig-accent)" strokeWidth="1.3" />
        <line x1="126" y1="48" x2="27" y2="48" stroke="var(--fig-text-muted)" strokeWidth="1.3" strokeDasharray="3 2" />
      </svg>
    </div>
  );
};
