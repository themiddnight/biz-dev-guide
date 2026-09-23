import React from 'react';
import { cn } from './cn';
import { SCROLL_ROOM } from './tapTarget';
import { ToggleChip, type ToggleChipProps } from './ToggleChip';
import type { Tap } from './types';

/**
 * A labelled group of ToggleChips. The variant picks the gap and the tap ring together, so they
 * cannot disagree (tapTarget.ts: packed rows use TAP_Y, gapped rows TAP_GAP[gap]).
 */
export interface TabsProps<T extends string> {
  items: readonly { value: T; label: React.ReactNode; icon?: React.ReactNode; title?: string }[];
  value: T;
  onChange: (value: T) => void;
  variant: 'segmented' | 'pills' | 'underline';
  size?: 'xs' | 'sm';
  'aria-label': string;
  scroll?: boolean;
  className?: string;
}

/** Group classes, chip shape and tap ring per variant. `gapPx` is the real gap between chips. */
export const TABS_LAYOUT: Record<TabsProps<string>['variant'], { group: string; gapPx: number; shape: NonNullable<ToggleChipProps['shape']>; tap: Tap }> = {
  segmented: { group: 'inline-flex items-center p-0.5 rounded-field bg-base-100 border border-base-border', gapPx: 0, shape: 'segment', tap: 'y' },
  pills: { group: 'flex items-center gap-1.5', gapPx: 6, shape: 'pill', tap: 'gap-6' },
  underline: { group: 'flex items-center border-b border-base-border', gapPx: 0, shape: 'tab', tap: 'y' },
};

export function Tabs<T extends string>({ items, value, onChange, variant, size = 'sm', scroll, className, ...aria }: TabsProps<T>) {
  const layout = TABS_LAYOUT[variant];
  return (
    <div
      role="group"
      aria-label={aria['aria-label']}
      className={cn(layout.group, scroll && `overflow-x-auto scrollbar-none ${SCROLL_ROOM}`, className)}
    >
      {items.map(item => (
        <ToggleChip
          key={item.value}
          data-value={item.value}
          selected={item.value === value}
          shape={layout.shape}
          size={size}
          tap={layout.tap}
          title={item.title}
          onClick={() => onChange(item.value)}
          className={scroll ? 'shrink-0' : undefined}
        >
          {item.icon}
          {item.label}
        </ToggleChip>
      ))}
    </div>
  );
}
