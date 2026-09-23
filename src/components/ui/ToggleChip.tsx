import React from 'react';
import { cn } from './cn';
import { tapClass } from './tapClass';
import type { Tap } from './types';

/**
 * A toggle button for tabs, chips, filters, segments and list rows. Selected is soft (spec §9):
 * base-300 + bold + strong border, never a primary fill. `selectedStyle="solid"` exists only for a
 * chosen quiz answer. Sets aria-pressed={selected} unless the caller passes aria-current.
 */
export interface ToggleChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  selected: boolean;
  shape?: 'chip' | 'pill' | 'segment' | 'tab' | 'card';
  size?: 'xs' | 'sm';
  selectedStyle?: 'soft' | 'solid';
  tap?: Tap;
}

type ChipStyle = Pick<ToggleChipProps, 'selected' | 'shape' | 'size' | 'selectedStyle' | 'tap'>;

const SHAPE: Record<NonNullable<ToggleChipProps['shape']>, string> = {
  chip: 'rounded-selector whitespace-nowrap',
  pill: 'rounded-full whitespace-nowrap',
  segment: 'rounded-selector whitespace-nowrap min-h-8',
  tab: 'rounded-none border-x-0 border-t-0 border-b-2 -mb-px whitespace-nowrap',
  card: 'rounded-field w-full text-left',
};

const SIZE: Record<NonNullable<ToggleChipProps['size']>, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-xs',
};

function tone(selected: boolean, shape: NonNullable<ToggleChipProps['shape']>, selectedStyle: NonNullable<ToggleChipProps['selectedStyle']>): string {
  if (shape === 'tab') {
    return selected
      ? 'border-base-content text-base-content font-bold'
      : 'border-transparent text-base-content-secondary hover:text-base-content';
  }
  if (!selected) {
    return shape === 'card'
      ? 'border border-base-border text-base-content-secondary hover:bg-base-300 hover:text-base-content'
      : 'border border-transparent text-base-content-secondary hover:bg-base-300 hover:text-base-content';
  }
  return selectedStyle === 'solid'
    ? 'border border-primary bg-primary text-primary-content font-bold'
    : 'border border-base-border-strong bg-base-300 text-base-content font-bold';
}

/** ToggleChip classes, for a caller that renders its own element. */
export function chipClass({ selected, shape = 'chip', size = 'sm', selectedStyle = 'soft', tap = 'full' }: ChipStyle): string {
  return cn(
    tapClass(tap),
    'inline-flex items-center gap-1.5 font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed',
    SHAPE[shape],
    shape !== 'card' && SIZE[size],
    tone(selected, shape, selectedStyle),
  );
}

export const ToggleChip: React.FC<ToggleChipProps> = ({ selected, shape, size, selectedStyle, tap, className, type = 'button', ...rest }) => (
  <button
    type={type}
    aria-pressed={rest['aria-current'] === undefined ? selected : undefined}
    className={cn(chipClass({ selected, shape, size, selectedStyle, tap }), className)}
    {...rest}
  />
);
