import { type RefObject, useCallback, useEffect, useState } from 'react';
import { scrollEdges, type ScrollEdgeState } from '../lib/scrollEdges';

const NO_EDGES: ScrollEdgeState = { start: false, end: false };

/** Tracks which edges of a horizontal scroller hide content (spec F-06). */
export function useScrollEdges(ref: RefObject<HTMLElement | null>): ScrollEdgeState {
  const [edges, setEdges] = useState<ScrollEdgeState>(NO_EDGES);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = scrollEdges(el.scrollLeft, el.clientWidth, el.scrollWidth);
    // Same values: keep the old object so React bails out and no render loop starts.
    setEdges(prev => (prev.start === next.start && prev.end === next.end ? prev : next));
  }, [ref]);

  // After every render: new chips (another chapter, other glossary counts) change scrollWidth
  // without resizing the row, which a ResizeObserver would miss.
  useEffect(() => {
    measure();
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, [ref, measure]);

  return edges;
}
