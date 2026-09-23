import React from 'react';
import { cn } from './cn';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li' | 'details';
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
  /** 'none' for cards with their own padded header/body (details/summary). */
  padding?: 'box' | 'dense' | 'spacious' | 'none';
  /** For `as="details"`. */
  open?: boolean;
}

const VARIANT: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-base-100 border border-base-border',
  elevated: 'bg-base-100 border border-base-border-strong shadow-xs',
  subtle: 'bg-base-300 border border-base-border',
  interactive: 'bg-base-100 border border-base-border hover:border-base-border-strong transition-colors',
};

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  box: 'p-box',
  dense: 'p-box-dense',
  spacious: 'p-box-spacious',
  none: '',
};

export function cardClass({ variant = 'default', padding = 'box' }: Pick<CardProps, 'variant' | 'padding'>): string {
  return cn('rounded-box', VARIANT[variant], PADDING[padding]);
}

export const Card: React.FC<CardProps> = ({ as = 'div', variant, padding, className, ...rest }) =>
  React.createElement(as, { className: cn(cardClass({ variant, padding }), className), ...rest });
