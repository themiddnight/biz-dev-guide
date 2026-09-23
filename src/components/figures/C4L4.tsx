import React from 'react';
import type { FigureProps } from './index';

/** Static s5 C4 detail, Level 4 — Code. */
export const C4L4: React.FC<FigureProps> = ({ className }) => {
  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 220 130"
        role="img"
        aria-label="แผนภาพ C4 Level 4 — Code: class diagram ข้างใน component หนึ่งตัว"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 220, display: 'block', margin: '0 auto' }}
      >
        <rect x="5" y="5" width="210" height="120" rx="4" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <line x1="5" y1="35" x2="215" y2="35" stroke="var(--fig-border)" />
        <line x1="5" y1="75" x2="215" y2="75" stroke="var(--fig-border)" />
        <text x="110" y="24" textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--fig-text)">OrderService</text>
        <text x="14" y="52" fontSize="10.5" fill="var(--fig-text-2)">- items: Item[]</text>
        <text x="14" y="67" fontSize="10.5" fill="var(--fig-text-2)">- status: string</text>
        <text x="14" y="92" fontSize="10.5" fill="var(--fig-text-2)">+ create()</text>
        <text x="14" y="107" fontSize="10.5" fill="var(--fig-text-2)">+ cancel()</text>
      </svg>
    </div>
  );
};
