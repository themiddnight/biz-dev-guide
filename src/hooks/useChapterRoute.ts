import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import type { Chapter } from '../types';
import type { SectionKey } from '../data/sectionLayers';
import {
  formatChapterHash,
  initRouteSession,
  isBareHash,
  parseChapterHash,
  popstateCanonicalHash,
  reduceRouteSession,
  resolveInitialChapter,
  resolvePopstatePendingRoute,
  type RequestedSection,
} from '../lib/chapterRoute';
import { readStorage, writeStorage } from '../lib/storage';
import { scrollToChapterStart } from '../lib/chapterScroll';

export interface ChapterRouteApi {
  activeChapterId: string;
  requestedSection: RequestedSection | null;
  loadedFromHash: boolean;
  /** Where the chapter shown on load came from: a hash, the stored chapter, or the default. */
  initialSource: 'hash' | 'stored' | 'default';
  /** True once the reader has navigated in this session (so the resume marker can retire). */
  hasNavigated: boolean;
  /** True once the URL carries a chapter hash: present at load, or written by a navigation. */
  hashInUrl: boolean;
  navigate: (chapterId: string, section?: SectionKey) => void;
  replaceSection: (section: SectionKey | null) => void;
  /** Called once a requested section has been applied, so a GuideTab remount never replays it. */
  clearRequestedSection: () => void;
}

const DEFAULT_CHAPTER = 's1';
const LAST_CHAPTER_KEY = 'be_guide_last_chapter';

export function useChapterRoute(chapters: Chapter[], opts: { onChapterRoute: () => void }): ChapterRouteApi {
  const [init] = useState(() => {
    const route = parseChapterHash(window.location.hash, chapters);
    const resolved = resolveInitialChapter(route, readStorage(LAST_CHAPTER_KEY), chapters, DEFAULT_CHAPTER);
    return { route, chapterId: resolved.chapterId, source: resolved.source };
  });
  const [activeChapterId, setActiveChapterId] = useState(init.chapterId);
  const [requestedSection, setRequestedSection] = useState<RequestedSection | null>(() => {
    const key = init.route?.section ?? init.route?.focus;
    return key ? { key, nonce: 1 } : null;
  });
  const [session, dispatch] = useReducer(reduceRouteSession, window.location.hash, initRouteSession);
  const [hasNavigated, setHasNavigated] = useState(false);
  const navigatedRef = useRef(false);
  const nonceRef = useRef(1);
  const activeRef = useRef(activeChapterId);
  activeRef.current = activeChapterId;
  const onRouteRef = useRef(opts.onChapterRoute);
  onRouteRef.current = opts.onChapterRoute;

  // Persist only after a real navigation (or a hash load) so the untouched default 's1'
  // never overwrites the chapter resolveInitialChapter would restore next time (spec §5.3).
  useEffect(() => {
    if (navigatedRef.current || init.route !== null) writeStorage(LAST_CHAPTER_KEY, activeChapterId);
  }, [activeChapterId, init]);

  const numOf = useCallback((id: string) => chapters.find(c => c.id === id)?.num, [chapters]);

  // Initial canonicalisation: fix an invalid or non-canonical hash; never write one on a bare load.
  // A layout effect so it runs before GuideTab's passive request effect, which may then clear
  // an absent section (e.g. #/ch/3/reference) without this write restoring it.
  useLayoutEffect(() => {
    const { hash } = window.location;
    if (isBareHash(hash)) return;
    const num = numOf(init.chapterId);
    if (num === undefined) return;
    const canonical = formatChapterHash(num, init.route?.section);
    if (hash !== canonical) window.history.replaceState(null, '', canonical);
  }, [init, numOf]);

  // Back/forward and manual hash edits. Never pushes.
  useEffect(() => {
    const onPopState = () => {
      const { hash } = window.location;
      // A bare entry is either the untouched initial page (shows the chapter resolved on load),
      // or one a tab switch just stripped the hash from — that entry's own `history.state` then
      // carries the chapter + section that was on screen before the switch (spec §5.2 in App.tsx),
      // so each bare entry restores only its own hash and a later tab-switch/navigate cycle can
      // never leak a different entry's hash onto it (spec F-03).
      const storedChapterHash = (window.history.state as { chapterHash?: string } | null)?.chapterHash ?? null;
      const route = resolvePopstatePendingRoute(hash, storedChapterHash, chapters, init.chapterId);
      if (!route) {
        const num = numOf(activeRef.current);
        if (num !== undefined) window.history.replaceState(null, '', formatChapterHash(num));
        return;
      }
      navigatedRef.current = true;
      setHasNavigated(true);
      dispatch({ type: 'pop', hash });
      // Legacy or malformed hashes (#/ch/3/bogus, later #/ch/3/dialogue) are rewritten in place, as on load (spec A.5).
      const num = numOf(route.chapterId);
      const canonical = num === undefined ? null : popstateCanonicalHash(hash, route, num);
      if (canonical) window.history.replaceState(null, '', canonical);
      const target = route.section ?? route.focus;
      // A chapter change with no section target starts at the chapter title, like handleSelectChapter.
      // Deferred a frame: the browser restores the entry's saved scroll after popstate fires.
      if (!target && route.chapterId !== activeRef.current) {
        window.requestAnimationFrame(() => scrollToChapterStart());
      }
      setActiveChapterId(route.chapterId);
      setRequestedSection(target ? { key: target, nonce: ++nonceRef.current } : null);
      onRouteRef.current();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [chapters, init, numOf]);

  const navigate = useCallback((chapterId: string, section?: SectionKey) => {
    navigatedRef.current = true;
    setHasNavigated(true);
    const num = numOf(chapterId);
    if (num === undefined) return;
    dispatch({ type: 'navigate' });
    setActiveChapterId(chapterId);
    setRequestedSection(section ? { key: section, nonce: ++nonceRef.current } : null);
    const hash = formatChapterHash(num, section);
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
  }, [numOf]);

  const replaceSection = useCallback((section: SectionKey | null) => {
    const num = numOf(activeRef.current);
    if (num === undefined) return;
    window.history.replaceState(null, '', formatChapterHash(num, section ?? undefined));
  }, [numOf]);

  const clearRequestedSection = useCallback(() => setRequestedSection(null), []);

  return {
    activeChapterId,
    requestedSection,
    loadedFromHash: init.route !== null,
    initialSource: init.source,
    hasNavigated,
    hashInUrl: session.hashInUrl,
    navigate,
    replaceSection,
    clearRequestedSection,
  };
}
