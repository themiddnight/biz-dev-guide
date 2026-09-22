import React from 'react';
import type { FigureProps } from './index';

/** Static s5 family card 5 (จัดระเบียบความคิด) signature icon. */
export const FamilyThinkingSig: React.FC<FigureProps> = ({ className }) => {
  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 150 62"
        role="img"
        aria-label="ลายเซ็นของไดอะแกรมหมวดจัดระเบียบความคิด: จุดกลางแตกกิ่งออกไปรอบด้าน"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 150, display: 'block', margin: '0 auto' }}
      >
        <line x1="75" y1="31" x2="34" y2="14" stroke="var(--fig-text-muted)" strokeWidth="1" />
        <line x1="75" y1="31" x2="34" y2="48" stroke="var(--fig-text-muted)" strokeWidth="1" />
        <line x1="75" y1="31" x2="118" y2="12" stroke="var(--fig-text-muted)" strokeWidth="1" />
        <line x1="75" y1="31" x2="118" y2="31" stroke="var(--fig-text-muted)" strokeWidth="1" />
        <line x1="75" y1="31" x2="118" y2="50" stroke="var(--fig-text-muted)" strokeWidth="1" />
        <rect x="60" y="24" width="30" height="14" rx="4" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <rect x="10" y="8" width="26" height="11" rx="3" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="10" y="42" width="26" height="11" rx="3" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="116" y="6" width="26" height="11" rx="3" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="116" y="25" width="26" height="11" rx="3" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <rect x="116" y="44" width="26" height="11" rx="3" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
      </svg>
    </div>
  );
};
