import React from 'react';
import { cn } from './cn';
import { SOLID, TINT } from './colors';
import { isChromatic, type Color } from './types';

export interface BadgeProps {
  color?: Color;
  variant?: 'solid' | 'soft' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

const SIZE: Record<NonNullable<BadgeProps['size']>, string> = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export function badgeClass({ color = 'neutral', variant = 'soft', size = 'sm' }: Pick<BadgeProps, 'color' | 'variant' | 'size'>): string {
  const tone = variant === 'solid' ? SOLID[color]
    : isChromatic(color) ? (variant === 'soft' ? TINT[color].soft : cn('bg-transparent', TINT[color].outline))
    : variant === 'soft' ? 'bg-base-300 text-base-content border-base-border'
    : 'bg-transparent text-base-content-secondary border-base-border-strong';
  return cn('inline-flex items-center gap-1 rounded-selector border font-semibold whitespace-nowrap', tone, SIZE[size]);
}

/** A label, not a control: never clickable. */
export const Badge: React.FC<BadgeProps> = ({ color, variant, size, className, children }) => (
  <span className={cn(badgeClass({ color, variant, size }), className)}>{children}</span>
);
