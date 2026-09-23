import React from 'react';
import { cn } from './cn';
import { TINT } from './colors';
import { isChromatic, type Color } from './types';

/**
 * A decorative square around an icon, emoji or number (spec §10.3). Soft on purpose: decoration
 * must not look like a button. Hidden from screen readers unless `label` is given — pass `label`
 * whenever the square holds text the reader needs (a chapter number, a level).
 * `size="none"` sets no box size, for a caller whose layout needs its own (the caller passes w-/h-).
 */
export interface IconBadgeProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'none';
  color?: Color;
  variant?: 'soft' | 'outline';
  label?: string;
  className?: string;
}

const SIZE: Record<NonNullable<IconBadgeProps['size']>, string> = {
  sm: 'w-6 h-6 text-xs font-bold',
  md: 'w-7 h-7 text-xs font-bold',
  lg: 'w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl font-extrabold',
  none: '',
};

export function iconBadgeClass({ size = 'md', color = 'neutral', variant = 'soft' }: Pick<IconBadgeProps, 'size' | 'color' | 'variant'>): string {
  const tone = isChromatic(color)
    ? (variant === 'soft' ? TINT[color].soft : cn('bg-transparent', TINT[color].outline))
    : variant === 'soft' ? 'bg-base-300 text-base-content border-base-border'
    : 'bg-transparent text-base-content border-base-border-strong';
  return cn('inline-flex items-center justify-center shrink-0 rounded-field border', tone, SIZE[size]);
}

export const IconBadge: React.FC<IconBadgeProps> = ({ children, size, color, variant, label, className }) => (
  <span
    className={cn(iconBadgeClass({ size, color, variant }), className)}
    {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
  >
    {children}
  </span>
);
