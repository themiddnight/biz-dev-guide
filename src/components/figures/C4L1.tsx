import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static s5 C4 detail, Level 1 — System context. */
export const C4L1: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 480 140"
        role="img"
        aria-label="แผนภาพ C4 Level 1 — System context: ระบบเป็นกล่องเดียว ล้อมด้วย actor และระบบภายนอก"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 480, display: 'block', margin: '0 auto' }}
      >
        <defs><marker id={`${uid}-c4b1`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fig-text-muted)" /></marker></defs>
        <rect x="10" y="45" width="110" height="50" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="65" y="75" textAnchor="middle" fontSize="12" fill="var(--fig-text)">ลูกค้า</text>
        <rect x="185" y="30" width="140" height="80" rx="6" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <text x="255" y="65" textAnchor="middle" fontSize="12" fill="var(--fig-text)">แอปสั่งอาหาร</text>
        <text x="255" y="82" textAnchor="middle" fontSize="10.5" fill="var(--fig-text-muted)">(กล่องเดียว)</text>
        <rect x="365" y="45" width="105" height="50" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" strokeDasharray="4 3" />
        <text x="417" y="68" textAnchor="middle" fontSize="11" fill="var(--fig-text)">ระบบภายนอก</text>
        <text x="417" y="82" textAnchor="middle" fontSize="10" fill="var(--fig-text-muted)">เช่น payment gateway</text>
        <line x1="120" y1="70" x2="183" y2="70" stroke="var(--fig-text-muted)" strokeWidth="1.5" markerEnd={`url(#${uid}-c4b1)`} />
        <line x1="325" y1="70" x2="363" y2="70" stroke="var(--fig-text-muted)" strokeWidth="1.5" markerEnd={`url(#${uid}-c4b1)`} />
      </svg>
    </div>
  );
};
