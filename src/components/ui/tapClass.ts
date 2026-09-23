import { TAP, TAP_GAP, TAP_POSITIONED, TAP_Y } from './tapTarget';
import type { Tap } from './types';

const TAP_CLASS: Record<Tap, string> = {
  full: TAP,
  y: TAP_Y,
  positioned: TAP_POSITIONED,
  'gap-4': TAP_GAP[4],
  'gap-6': TAP_GAP[6],
  'gap-8': TAP_GAP[8],
  'gap-16': TAP_GAP[16],
};

/** The tap-ring classes for a `tap` prop. */
export function tapClass(tap: Tap): string {
  return TAP_CLASS[tap];
}
