import type { TabType } from '../types';

export type TabEntryScroll = 'none' | 'top' | 'chapter-start';

/**
 * Where the window lands when the reader switches tab (spec F-03). The tabs share the window's
 * scroll, so without this a new tab opens at the old tab's offset.
 * - Guide with a requested section: GuideTab's own effect scrolls to that section, so do nothing.
 * - Guide otherwise: the chapter start. GuideTab remounts and re-derives its open sections, so an
 *   old offset would not point at the same content.
 * - Any other tab: its top.
 */
export function tabEntryScroll(prev: TabType, next: TabType, hasRequestedSection: boolean): TabEntryScroll {
  if (prev === next) return 'none';
  if (next === 'guide') return hasRequestedSection ? 'none' : 'chapter-start';
  return 'top';
}
