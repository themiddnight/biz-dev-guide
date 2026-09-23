import type { Chromatic, Color } from './types';

/**
 * Literal class strings per colour (Tailwind finds classes by scanning source text, so no
 * `bg-${c}` templates). Shared by Button, Badge, IconBadge and Alert.
 */

/** Solid fill with its content colour and a same-colour border. */
export const SOLID: Record<Color, string> = {
  primary: 'bg-primary text-primary-content border-primary',
  secondary: 'bg-secondary text-secondary-content border-secondary',
  accent: 'bg-accent text-accent-content border-accent',
  neutral: 'bg-neutral text-neutral-content border-neutral',
  info: 'bg-info text-info-content border-info',
  success: 'bg-success text-success-content border-success',
  warning: 'bg-warning text-warning-content border-warning',
  error: 'bg-error text-error-content border-error',
  business: 'bg-business text-business-content border-business',
  engineer: 'bg-engineer text-engineer-content border-engineer',
};

/** Hover for a solid fill. */
export const SOLID_HOVER: Record<Color, string> = {
  primary: 'hover:bg-primary/90',
  secondary: 'hover:bg-secondary/90',
  accent: 'hover:bg-accent/90',
  neutral: 'hover:bg-neutral/90',
  info: 'hover:bg-info/90',
  success: 'hover:bg-success/90',
  warning: 'hover:bg-warning/90',
  error: 'hover:bg-error/90',
  business: 'hover:bg-business/90',
  engineer: 'hover:bg-engineer/90',
};

/** Per-hue tints for the soft/outline/ghost/link variants and plain coloured text. */
export const TINT: Record<Chromatic, { soft: string; softHover: string; outline: string; tintHover: string; text: string; link: string }> = {
  info: { soft: 'bg-info/10 text-info border-info/25', softHover: 'hover:bg-info/15', outline: 'border-info/40 text-info', tintHover: 'hover:bg-info/10', text: 'text-info', link: 'decoration-info/40' },
  success: { soft: 'bg-success/10 text-success border-success/25', softHover: 'hover:bg-success/15', outline: 'border-success/40 text-success', tintHover: 'hover:bg-success/10', text: 'text-success', link: 'decoration-success/40' },
  warning: { soft: 'bg-warning/10 text-warning border-warning/25', softHover: 'hover:bg-warning/15', outline: 'border-warning/40 text-warning', tintHover: 'hover:bg-warning/10', text: 'text-warning', link: 'decoration-warning/40' },
  error: { soft: 'bg-error/10 text-error border-error/25', softHover: 'hover:bg-error/15', outline: 'border-error/40 text-error', tintHover: 'hover:bg-error/10', text: 'text-error', link: 'decoration-error/40' },
  business: { soft: 'bg-business/10 text-business border-business/25', softHover: 'hover:bg-business/15', outline: 'border-business/40 text-business', tintHover: 'hover:bg-business/10', text: 'text-business', link: 'decoration-business/40' },
  engineer: { soft: 'bg-engineer/10 text-engineer border-engineer/25', softHover: 'hover:bg-engineer/15', outline: 'border-engineer/40 text-engineer', tintHover: 'hover:bg-engineer/10', text: 'text-engineer', link: 'decoration-engineer/40' },
};

/** Monochrome soft surface (selected chip, soft button, icon badge). */
export const MONO_SOFT = 'bg-base-300 text-base-content border-transparent';
