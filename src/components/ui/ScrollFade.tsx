import React, { useRef } from 'react';
import { cn } from './cn';
import { useScrollEdges } from '../../hooks/useScrollEdges';

/** Gradient start colour: the surface the row sits on. Literal classes, so Tailwind generates them. */
export type FadeFrom = 'from-base-100' | 'from-base-300';

const FADE = 'pointer-events-none absolute inset-y-0 w-6 to-transparent sm:hidden';

/**
 * A horizontal scroller with a 24px fade on each edge that hides content (spec F-06). Below sm
 * only: from sm the rows this wraps either wrap or have room. The fades follow measured
 * overflow, not chip count, so a row that fits shows none.
 * Every prop except `fadeFrom` and `wrapperClassName` goes to the inner scroller, which keeps
 * its role and aria-label. `wrapperClassName` is for a caller whose parent uses `space-y-*`:
 * wrapping moves that margin from the row onto this wrapper, so a row that relied on its own
 * negative margin to cancel it needs that class repeated here.
 */
export function ScrollFade({
  fadeFrom = 'from-base-100',
  wrapperClassName,
  children,
  ...scrollerProps
}: React.HTMLAttributes<HTMLDivElement> & { fadeFrom?: FadeFrom; wrapperClassName?: string }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(scrollerRef);
  return (
    <div data-scroll-fade className={cn('relative', wrapperClassName)}>
      <div ref={scrollerRef} {...scrollerProps}>
        {children}
      </div>
      <span aria-hidden="true" data-fade="start" className={cn(FADE, 'left-0 bg-linear-to-r', fadeFrom, !edges.start && 'hidden')} />
      <span aria-hidden="true" data-fade="end" className={cn(FADE, 'right-0 bg-linear-to-l', fadeFrom, !edges.end && 'hidden')} />
    </div>
  );
}
