/**
 * Where a chapter change lands. The reader card sits under the app header, guide intro card
 * and role mindset card (and, below `lg`, the chapter nav), so the page top would leave the
 * chapter title at the bottom edge and its text below the fold; start at the reader card (F-03).
 */
export const CHAPTER_START_ID = 'chapter-start';

/** Scroll offset that puts the card just below the sticky header. */
export function chapterStartTop(cardDocTop: number, stickyHeaderHeight: number, gap = 8): number {
  return Math.max(0, Math.round(cardDocTop - stickyHeaderHeight - gap));
}

export function scrollToChapterStart(behavior: ScrollBehavior = 'auto'): void {
  // Wait for the new chapter's commit + layout so the card position is final.
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    const card = document.getElementById(CHAPTER_START_ID);
    if (!card) return window.scrollTo({ top: 0, behavior });
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    window.scrollTo({ top: chapterStartTop(card.getBoundingClientRect().top + window.scrollY, header), behavior });
  }));
}
