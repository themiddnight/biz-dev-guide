/**
 * Roving-tabindex key handling for a horizontal tablist (pure).
 * ArrowLeft/ArrowRight move and wrap, Home/End jump to the ends.
 * Returns the next index, or null when the key is not handled.
 */
export function nextTabIndex(current: number, key: string, count: number): number | null {
  switch (key) {
    case 'ArrowRight':
      return (current + 1) % count;
    case 'ArrowLeft':
      return (current - 1 + count) % count;
    case 'Home':
      return 0;
    case 'End':
      return count - 1;
    default:
      return null;
  }
}
