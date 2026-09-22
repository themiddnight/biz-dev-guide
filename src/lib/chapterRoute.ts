import type { Chapter } from '../types';
import { isSectionKey, type SectionKey } from '../data/sectionLayers';

export interface ChapterRoute { chapterId: string; section?: SectionKey }
export interface RequestedSection { key: SectionKey; nonce: number }

type ChapterRef = Pick<Chapter, 'id' | 'num'>;

const ROUTE_RE = /^#\/ch\/(\d{1,2})(?:\/([A-Za-z]+))?\/?$/;
const LEGACY_RE = /^#s(\d{1,2})$/;

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
    const section = route[2];
    return section && isSectionKey(section) ? { chapterId: chapter.id, section } : { chapterId: chapter.id };
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
