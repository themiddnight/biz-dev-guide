import React from 'react';
import type { FigureProps } from './index';

/** Static s5 family card 3 (กระบวนการ) signature icon. */
export const FamilyProcessSig: React.FC<FigureProps> = ({ className }) => {
  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 150 62"
        role="img"
        aria-label="ไอคอนของไดอะแกรมหมวดกระบวนการ: เลนแนวนอนสามเลนกับกล่องข้ามเลน"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 150, display: 'block', margin: '0 auto' }}
      >
        <line x1="4" y1="24" x2="146" y2="24" stroke="var(--fig-border)" strokeWidth="1" />
        <line x1="4" y1="42" x2="146" y2="42" stroke="var(--fig-border)" strokeWidth="1" />
        <rect x="12" y="8" width="34" height="12" rx="3" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="58" y="28" width="34" height="12" rx="3" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="104" y="46" width="34" height="12" rx="3" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <line x1="46" y1="14" x2="58" y2="30" stroke="var(--fig-text-muted)" strokeWidth="1" />
        <line x1="92" y1="34" x2="104" y2="50" stroke="var(--fig-text-muted)" strokeWidth="1" />
      </svg>
    </div>
  );
};
