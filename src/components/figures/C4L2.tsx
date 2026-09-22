import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static s5 C4 detail, Level 2 — Container. */
export const C4L2: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 520 190"
        role="img"
        aria-label="แผนภาพ C4 Level 2 — Container: หน่วยที่ deploy/run แยกกันได้ภายในระบบ"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 520, display: 'block', margin: '0 auto' }}
      >
        <defs><marker id={`${uid}-c4b2`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fig-text-muted)" /></marker></defs>
        <rect x="10" y="15" width="140" height="50" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="80" y="45" textAnchor="middle" fontSize="12" fill="var(--fig-text)">แอปลูกค้า</text>
        <rect x="10" y="120" width="140" height="50" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="80" y="150" textAnchor="middle" fontSize="12" fill="var(--fig-text)">แอปร้านค้า</text>
        <rect x="205" y="70" width="130" height="50" rx="6" fill="var(--fig-accent-bg)" stroke="var(--fig-accent-border)" />
        <text x="270" y="100" textAnchor="middle" fontSize="12" fill="var(--fig-text)">API</text>
        <rect x="390" y="70" width="120" height="50" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="450" y="100" textAnchor="middle" fontSize="12" fill="var(--fig-text)">Database</text>
        <line x1="150" y1="40" x2="240" y2="75" stroke="var(--fig-text-muted)" strokeWidth="1.5" markerEnd={`url(#${uid}-c4b2)`} />
        <text x="185" y="50" fontSize="9.5" fill="var(--fig-text-muted)">HTTPS/JSON</text>
        <line x1="150" y1="145" x2="240" y2="115" stroke="var(--fig-text-muted)" strokeWidth="1.5" markerEnd={`url(#${uid}-c4b2)`} />
        <text x="185" y="150" fontSize="9.5" fill="var(--fig-text-muted)">HTTPS/JSON</text>
        <line x1="335" y1="95" x2="388" y2="95" stroke="var(--fig-text-muted)" strokeWidth="1.5" markerEnd={`url(#${uid}-c4b2)`} />
        <text x="345" y="88" fontSize="9.5" fill="var(--fig-text-muted)">SQL</text>
      </svg>
    </div>
  );
};
