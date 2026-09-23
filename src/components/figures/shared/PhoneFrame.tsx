import React from 'react';

/*
 * Mobile screen shell in viewBox 0 0 150 240 (spec 2026-09-22 §5.1):
 * rounded frame + 28-unit header bar whose top corners follow the frame radius.
 * Content below the header starts at y ≈ 36 by convention (see RefundFidelity).
 */

const HEADER_PATH = 'M0.5,28 V10.5 A10,10 0 0 1 10.5,0.5 H139.5 A10,10 0 0 1 149.5,10.5 V28 Z';

export type PhoneFrameTone = 'accent' | 'neutral';

interface PhoneFrameProps {
  /**
   * accent: hi-fi header (accent fill, back chevron, bold accent title).
   * neutral: lo-fi header (grey fill, no chevron).
   */
  tone?: PhoneFrameTone;
  /** Header title; omit to draw a placeholder bar instead (lo-fi). */
  title?: string;
  children?: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({ tone = 'accent', title, children }) => {
  const accent = tone === 'accent';
  return (
    <>
      <rect x="0.5" y="0.5" width="149" height="239" rx="10" fill="var(--fig-bg)" stroke="var(--fig-border)" />
      <path
        d={HEADER_PATH}
        fill={accent ? 'var(--fig-accent-bg)' : 'var(--fig-surface-2)'}
        stroke={accent ? 'var(--fig-accent-border)' : 'var(--fig-border)'}
      />
      {accent && (
        <path d="M12,10 L7,14.5 L12,19" fill="none" stroke="var(--fig-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {title === undefined ? (
        <rect x="50" y="11" width="50" height="7" rx="2" fill="var(--fig-border)" />
      ) : (
        <text
          x="75"
          y="19"
          textAnchor="middle"
          fontSize="11"
          fontWeight={accent ? '600' : undefined}
          fill={accent ? 'var(--fig-accent)' : 'var(--fig-text-2)'}
        >
          {title}
        </text>
      )}
      {children}
    </>
  );
};
