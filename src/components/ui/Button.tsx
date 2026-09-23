import React from 'react';
import { cn } from './cn';
import { MONO_SOFT, SOLID, SOLID_HOVER, TINT } from './colors';
import { tapClass } from './tapClass';
import { isChromatic, type Color, type Tap } from './types';

/**
 * Button hierarchy (spec §9):
 * 1. The main next step, at most one per view: `color="primary" variant="solid"`.
 * 2. Secondary or alternative actions: `outline` or `soft`.
 * 3. Toolbar, icon buttons, close, back, menus: `ghost`.
 * 4. Inline text actions: `link`.
 * Selected tabs/chips/filters are ToggleChips (soft), never a primary fill.
 * Write the primary as `color="primary" variant="solid"` in that order: hierarchy.test.ts counts that string.
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  color?: Color;
  variant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'default' | 'square' | 'circle';
  tap?: Tap;
  block?: boolean;
}

type ButtonStyle = Pick<ButtonProps, 'color' | 'variant' | 'size' | 'shape' | 'tap' | 'block'>;

const BASE = 'inline-flex items-center justify-center gap-1.5 font-semibold rounded-field transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:opacity-40 disabled:cursor-not-allowed';

const SIZE: Record<NonNullable<ButtonProps['size']>, { text: string; icon: string }> = {
  xs: { text: 'px-2.5 py-1 text-xs', icon: 'p-1' },
  sm: { text: 'px-3 py-1.5 text-xs', icon: 'p-1.5' },
  md: { text: 'px-4 py-2 text-xs sm:text-sm', icon: 'p-2' },
  lg: { text: 'px-6 py-3 text-sm', icon: 'p-3' },
};

function variantClass(color: Color, variant: NonNullable<ButtonProps['variant']>): string {
  if (variant === 'solid') return cn('border', SOLID[color], SOLID_HOVER[color]);
  if (!isChromatic(color)) {
    if (variant === 'outline') return 'border border-base-border-strong text-base-content hover:bg-base-300';
    if (variant === 'soft') return cn('border', MONO_SOFT, 'hover:bg-base-border');
    if (variant === 'ghost') return 'text-base-content-secondary hover:text-base-content hover:bg-base-300';
    return 'text-base-content underline underline-offset-2 decoration-base-border-strong hover:decoration-current';
  }
  const t = TINT[color];
  if (variant === 'outline') return cn('border', t.outline, t.tintHover);
  if (variant === 'soft') return cn('border', t.soft, t.softHover);
  if (variant === 'ghost') return cn(t.text, t.tintHover);
  return cn(t.text, 'underline underline-offset-2', t.link, 'hover:decoration-current');
}

/** Button classes for an element that cannot be a button element: a link or a details summary. */
export function buttonClass({ color = 'neutral', variant = 'outline', size = 'md', shape = 'default', tap = 'full', block }: ButtonStyle): string {
  return cn(
    tapClass(tap),
    BASE,
    variantClass(color, variant),
    shape === 'default' ? SIZE[size].text : SIZE[size].icon,
    shape === 'circle' && 'rounded-full',
    block && 'w-full',
  );
}

export const Button: React.FC<ButtonProps> = ({ color, variant, size, shape, tap, block, className, type = 'button', ...rest }) => (
  <button type={type} className={cn(buttonClass({ color, variant, size, shape, tap, block }), className)} {...rest} />
);
