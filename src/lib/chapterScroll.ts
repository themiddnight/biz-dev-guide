/**
 * Where a chapter change lands. Below the `lg` breakpoint the reader card sits under the
 * app header, guide intro card and chapter nav, so the page top would hide the chapter
 * title and hero figure; start at the reader card instead. Desktop keeps the page top.
 */
export const CHAPTER_START_ID = 'chapter-start';
const MOBILE_CHAPTER_QUERY = '(max-width: 1023.98px)';

/** Scroll offset that puts the card just below the sticky header. */
export function chapterStartTop(cardDocTop: number, stickyHeaderHeight: number, gap = 8): number {
  return Math.max(0, Math.round(cardDocTop - stickyHeaderHeight - gap));
}

export function scrollToChapterStart(behavior: ScrollBehavior = 'auto'): void {
  if (!window.matchMedia(MOBILE_CHAPTER_QUERY).matches) {
    window.scrollTo({ top: 0, behavior });
    return;
  }
  // Wait for the new chapter's commit + layout so the card position is final.
  window.requestAnimationFrame(() => window.requestAnimationFrame(() => {
    const card = document.getElementById(CHAPTER_START_ID);
    if (!card) return window.scrollTo({ top: 0, behavior });
    const header = document.querySelector('header')?.getBoundingClientRect().height ?? 0;
    window.scrollTo({ top: chapterStartTop(card.getBoundingClientRect().top + window.scrollY, header), behavior });
  }));
}
