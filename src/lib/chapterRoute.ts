import type { Chapter } from '../types';
import { isSectionKey, isSectionPresent, type SectionKey } from '../data/sectionLayers.js';

/** A route target that is not a section: `top` is the chapter start (spec A7). */
export type RouteFocus = 'top';
export type RequestTarget = SectionKey | RouteFocus;

export interface ChapterRoute { chapterId: string; section?: SectionKey; focus?: RouteFocus }
export interface RequestedSection { key: RequestTarget; nonce: number }

type ChapterRef = Pick<Chapter, 'id' | 'num'>;

const ROUTE_RE = /^#\/ch\/(\d{1,2})(?:\/([A-Za-z]+))?\/?$/;
const LEGACY_RE = /^#s(\d{1,2})$/;

/**
 * Retired section keys that old links, bookmarks and history entries still carry (spec A7).
 * Each key is added in the change that retires it.
 */
const SECTION_ALIASES: Readonly<Record<string, RequestTarget>> = {
  primer: 'top',
  workflow: 'practice',
  checklist: 'practice',
};

/** A hash section word: a current key, a retired key's new target, or nothing. */
export function resolveSectionParam(raw: string): { section?: SectionKey; focus?: RouteFocus } {
  if (isSectionKey(raw)) return { section: raw };
  // Own keys only: `constructor` or `toString` in a hash must not resolve through Object.prototype.
  if (!Object.hasOwn(SECTION_ALIASES, raw)) return {};
  const target = SECTION_ALIASES[raw];
  return isSectionKey(target) ? { section: target } : { focus: target };
}

export function formatChapterHash(num: number, section?: SectionKey): string {
  return section ? `#/ch/${num}/${section}` : `#/ch/${num}`;
}

export function parseChapterHash(hash: string, chapters: ChapterRef[]): ChapterRoute | null {
  if (hash === '' || hash === '#') return null;
  const byNum = (raw: string) => chapters.find(c => c.num === Number(raw));

  const route = ROUTE_RE.exec(hash);
  if (route) {
    const chapter = byNum(route[1]);
    if (!chapter) return null;
    const raw = route[2];
    return raw ? { chapterId: chapter.id, ...resolveSectionParam(raw) } : { chapterId: chapter.id };
  }

  const legacy = LEGACY_RE.exec(hash);
  if (legacy) {
    const chapter = byNum(legacy[1]);
    return chapter ? { chapterId: chapter.id } : null;
  }
  return null;
}

export const isBareHash = (hash: string): boolean => hash === '' || hash === '#';

/**
 * The hash a popstate should write back in place, or null when the URL is already canonical.
 * A bare entry (the untouched first page) never gets a hash written onto it.
 */
export function popstateCanonicalHash(hash: string, route: ChapterRoute, num: number): string | null {
  if (isBareHash(hash)) return null;
  const canonical = formatChapterHash(num, route.section);
  return canonical === hash ? null : canonical;
}

/** What a section request does once its chapter is shown (spec A.4 GuideTab, A.5). */
export type RequestAction = { kind: 'section'; key: SectionKey } | { kind: 'top' };

export function planRequest(chapter: Chapter, key: RequestTarget): RequestAction {
  if (key === 'top' || !isSectionPresent(chapter, key)) return { kind: 'top' };
  return { kind: 'section', key };
}

/**
 * Per-page-session routing facts that must outlive GuideTab (it unmounts on other tabs):
 * whether the URL carries a chapter hash the guide tab should restore (spec §5.2).
 */
export interface RouteSession { hashInUrl: boolean }
export type RouteSessionEvent =
  | { type: 'navigate' }
  | { type: 'pop'; hash: string };

export function initRouteSession(hash: string): RouteSession {
  return { hashInUrl: !isBareHash(hash) };
}

export function reduceRouteSession(state: RouteSession, event: RouteSessionEvent): RouteSession {
  switch (event.type) {
    case 'navigate':
      return state.hashInUrl ? state : { hashInUrl: true };
    case 'pop':
      return { hashInUrl: !isBareHash(event.hash) };
  }
}

/** Hash wins (a shared link), then the stored chapter (resume), then the default (round3 spec D2). */
export function resolveInitialChapter(
  route: ChapterRoute | null,
  storedLast: string | null,
  chapters: ChapterRef[],
  fallback: string,
): { chapterId: string; source: 'hash' | 'stored' | 'default' } {
  if (route) return { chapterId: route.chapterId, source: 'hash' };
  if (storedLast !== null && chapters.some(c => c.id === storedLast)) {
    return { chapterId: storedLast, source: 'stored' };
  }
  return { chapterId: fallback, source: 'default' };
}
