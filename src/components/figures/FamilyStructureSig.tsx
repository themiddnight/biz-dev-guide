import React from 'react';
import type { FigureProps } from './index';

/** Static s5 family card 1 (โครงสร้าง) signature icon. */
export const FamilyStructureSig: React.FC<FigureProps> = ({ className }) => {
  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 150 62"
        role="img"
        aria-label="ลายเซ็นของไดอะแกรมหมวดโครงสร้าง: กล่องซ้อนกล่องเชื่อมด้วยเส้น"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 150, display: 'block', margin: '0 auto' }}
      >
        <rect x="4" y="6" width="142" height="50" rx="6" fill="none" stroke="var(--fig-border)" strokeDasharray="3 3" />
        <rect x="14" y="16" width="40" height="14" rx="3" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="70" y="16" width="40" height="14" rx="3" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="14" y="38" width="40" height="14" rx="3" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="70" y="38" width="40" height="14" rx="3" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <line x1="54" y1="23" x2="70" y2="23" stroke="var(--fig-text-muted)" strokeWidth="1" />
        <line x1="34" y1="30" x2="34" y2="38" stroke="var(--fig-text-muted)" strokeWidth="1" />
        <line x1="54" y1="45" x2="70" y2="45" stroke="var(--fig-text-muted)" strokeWidth="1" />
      </svg>
    </div>
  );
};
