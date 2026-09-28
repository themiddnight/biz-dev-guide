import { describe, it, expect } from 'vitest';
import type { TabType } from '../types';
import { tabEntryScroll } from './tabScroll';

const TABS: TabType[] = ['guide', 'ai', 'quiz'];

describe('tabEntryScroll (F-03)', () => {
  it.each(TABS)('staying on %s never scrolls', (tab) => {
    expect(tabEntryScroll(tab, tab, false)).toBe('none');
    expect(tabEntryScroll(tab, tab, true)).toBe('none');
  });

  it.each([
    ['guide', 'ai'],
    ['guide', 'quiz'],
    ['ai', 'quiz'],
    ['quiz', 'ai'],
  ] as const)('%s -> %s starts at the page top', (prev, next) => {
    expect(tabEntryScroll(prev, next, false)).toBe('top');
    // A section request belongs to the guide; it never holds another tab in place.
    expect(tabEntryScroll(prev, next, true)).toBe('top');
  });

  it.each(['ai', 'quiz'] as const)('%s -> guide lands at the chapter start', (prev) => {
    expect(tabEntryScroll(prev, 'guide', false)).toBe('chapter-start');
  });

  it.each(['ai', 'quiz'] as const)('%s -> guide with a requested section leaves the scroll to GuideTab', (prev) => {
    expect(tabEntryScroll(prev, 'guide', true)).toBe('none');
  });

  it('treats the unrendered simulator value like any other non-guide tab', () => {
    expect(tabEntryScroll('guide', 'simulator', false)).toBe('top');
  });
});
