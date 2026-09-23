/**
 * Mobile tap targets (below `sm`): every interactive control is at least 44×44px to the finger
 * without changing what it looks like or where it sits.
 *
 * An invisible `::before` is centred on the control and sized `max(own size, 44px)` on each axis.
 * Taps on a pseudo-element hit its originating element, so the extra ring belongs to the button.
 * It is absolutely positioned, so it takes no space in flex/grid/inline layout; everything is
 * scoped to `max-sm:`, so from `sm` up the markup renders exactly as before.
 *
 * Why not padding + a matching negative margin (the `-my-3.5 py-3.5` pattern in
 * `CoreConceptsSection` / `InlineTerm`)? That pattern also grows the painted background and
 * border, so it only suits text-only controls; those two keep it. Everything with a fill, border
 * or chip shape uses these constants.
 *
 * Caveats a caller must handle:
 * - A scroll container (`overflow-x-auto`) clips the ring and would turn it into vertical scroll:
 *   give the container `SCROLL_ROOM`.
 * - Controls packed edge to edge (segmented icon rows) must use `TAP_Y`, or the rings overlap.
 * - Controls in a row that wraps, or a stack, with a gap too small for two rings use
 *   `TAP_GAP[gap]`: each ring grows by half the gap, so neighbours meet and never overlap. Those
 *   controls stay below 44px; overlapping hit areas are worse than small ones.
 *
 * `tapTargets.test.ts` fails when a `<button>` or `<a>` under `src/components/` uses none of
 * these (or the padding pattern).
 */

const RING =
  'max-sm:before:absolute max-sm:before:left-1/2 max-sm:before:top-1/2 max-sm:before:-translate-x-1/2 max-sm:before:-translate-y-1/2 max-sm:before:w-full max-sm:before:h-full max-sm:before:min-h-11';

/** 44px tall and 44px wide. The default for any control. */
export const TAP = `max-sm:relative ${RING} max-sm:before:min-w-11`;

/** 44px tall, own width: for controls packed side by side with no gap to spare. */
export const TAP_Y = `max-sm:relative ${RING}`;

/** `TAP` for a control that is already `absolute`/`fixed` (adding `relative` would move it). */
export const TAP_POSITIONED = `${RING} max-sm:before:min-w-11`;

/**
 * Rings that grow by half the gap (in px) on every side, for controls whose neighbours sit closer
 * than a 44px ring allows. Keys are the Tailwind gap in px: gap-1 = 4, gap-1.5 = 6, gap-2 = 8.
 */
export const TAP_GAP = {
  4: 'max-sm:relative max-sm:before:absolute max-sm:before:left-1/2 max-sm:before:top-1/2 max-sm:before:-translate-x-1/2 max-sm:before:-translate-y-1/2 max-sm:before:w-[calc(100%+4px)] max-sm:before:h-[calc(100%+4px)]',
  6: 'max-sm:relative max-sm:before:absolute max-sm:before:left-1/2 max-sm:before:top-1/2 max-sm:before:-translate-x-1/2 max-sm:before:-translate-y-1/2 max-sm:before:w-[calc(100%+6px)] max-sm:before:h-[calc(100%+6px)]',
  8: 'max-sm:relative max-sm:before:absolute max-sm:before:left-1/2 max-sm:before:top-1/2 max-sm:before:-translate-x-1/2 max-sm:before:-translate-y-1/2 max-sm:before:w-[calc(100%+8px)] max-sm:before:h-[calc(100%+8px)]',
  16: 'max-sm:relative max-sm:before:absolute max-sm:before:left-1/2 max-sm:before:top-1/2 max-sm:before:-translate-x-1/2 max-sm:before:-translate-y-1/2 max-sm:before:w-[calc(100%+16px)] max-sm:before:h-[calc(100%+16px)]',
} as const;

/**
 * Room for rings inside a horizontal scroller (`overflow-x-auto` also clips vertically and would
 * scroll the overflow): 10px of padding cancelled by a matching negative margin, so the strip
 * does not move. Covers a control 24px tall or taller.
 */
export const SCROLL_ROOM = 'max-sm:-my-2.5 max-sm:py-2.5';
