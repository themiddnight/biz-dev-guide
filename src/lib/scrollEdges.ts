export interface ScrollEdgeState {
  /** Content is hidden off the start (left) edge. */
  start: boolean;
  /** Content is hidden off the end (right) edge. */
  end: boolean;
}

/** Which edges of a horizontal scroller hide content. `tolerance` absorbs sub-pixel layout widths. */
export function scrollEdges(scrollLeft: number, clientWidth: number, scrollWidth: number, tolerance = 1): ScrollEdgeState {
  return {
    start: scrollLeft > tolerance,
    end: scrollLeft + clientWidth < scrollWidth - tolerance,
  };
}
