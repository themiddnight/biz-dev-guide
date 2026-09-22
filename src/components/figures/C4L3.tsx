import React, { useId } from 'react';
import type { FigureProps } from './index';

/** Static s5 C4 detail, Level 3 — Component. */
export const C4L3: React.FC<FigureProps> = ({ className }) => {
  const uid = useId();

  return (
    <div className={`fig-scope ${className ?? ''}`}>
      <svg
        viewBox="0 0 520 150"
        role="img"
        aria-label="แผนภาพ C4 Level 3 — Component: ก้อนย่อยที่ประกอบกันข้างในหนึ่ง container"
        fontFamily="inherit"
        style={{ width: '100%', height: 'auto', maxWidth: 520, display: 'block', margin: '0 auto' }}
      >
        <defs><marker id={`${uid}-c4b3`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--fig-text-muted)" /></marker></defs>
        <rect x="4" y="4" width="512" height="142" rx="8" fill="none" stroke="var(--fig-border)" strokeDasharray="4 3" />
        <text x="16" y="22" fontSize="10" fill="var(--fig-text-muted)">ข้างใน container "API"</text>
        <rect x="20" y="45" width="130" height="50" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="85" y="75" textAnchor="middle" fontSize="12" fill="var(--fig-text)">Order component</text>
        <rect x="195" y="45" width="130" height="50" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="260" y="75" textAnchor="middle" fontSize="12" fill="var(--fig-text)">Payment component</text>
        <rect x="370" y="45" width="130" height="50" rx="6" fill="var(--fig-surface-2)" stroke="var(--fig-border)" />
        <text x="435" y="75" textAnchor="middle" fontSize="11" fill="var(--fig-text)">Rider matching</text>
        <line x1="150" y1="70" x2="193" y2="70" stroke="var(--fig-text-muted)" strokeWidth="1.5" markerEnd={`url(#${uid}-c4b3)`} />
        <text x="152" y="63" fontSize="9.5" fill="var(--fig-text-muted)">charges</text>
        <line x1="325" y1="70" x2="368" y2="70" stroke="var(--fig-text-muted)" strokeWidth="1.5" markerEnd={`url(#${uid}-c4b3)`} />
        <text x="330" y="63" fontSize="9.5" fill="var(--fig-text-muted)">assigns</text>
      </svg>
    </div>
  );
};
