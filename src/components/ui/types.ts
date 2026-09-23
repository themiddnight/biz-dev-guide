/** Design-token colour names (spec §4). Monochrome: primary, secondary, accent, neutral. */
export type Color = 'primary' | 'secondary' | 'accent' | 'neutral'
  | 'info' | 'success' | 'warning' | 'error' | 'business' | 'engineer';

/** Colours with a hue: they tint soft/outline/ghost/link variants with their own colour. */
export type Chromatic = Exclude<Color, 'primary' | 'secondary' | 'accent' | 'neutral'>;

export const isChromatic = (c: Color): c is Chromatic =>
  c !== 'primary' && c !== 'secondary' && c !== 'accent' && c !== 'neutral';

/** Mobile tap ring (see tapTarget.ts): full → TAP, y → TAP_Y, positioned → TAP_POSITIONED, gap-n → TAP_GAP[n]. */
export type Tap = 'full' | 'y' | 'positioned' | 'gap-4' | 'gap-6' | 'gap-8' | 'gap-16';
