import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Chapter } from '../types';
import type { SectionKey } from '../data/sectionLayers';
import { formatChapterHash, parseChapterHash, type RequestedSection } from '../lib/chapterRoute';

export interface ChapterRouteApi {
  activeChapterId: string;
  requestedSection: RequestedSection | null;
  loadedFromHash: boolean;
  navigate: (chapterId: string, section?: SectionKey) => void;
  replaceSection: (section: SectionKey | null) => void;
}

const DEFAULT_CHAPTER = 's1';

export function useChapterRoute(chapters: Chapter[], opts: { onChapterRoute: () => void }): ChapterRouteApi {
  const [init] = useState(() => {
    const route = parseChapterHash(window.location.hash, chapters);
    return { route, chapterId: route?.chapterId ?? DEFAULT_CHAPTER };
  });
  const [activeChapterId, setActiveChapterId] = useState(init.chapterId);
  const [requestedSection, setRequestedSection] = useState<RequestedSection | null>(
    init.route?.section ? { key: init.route.section, nonce: 1 } : null,
  );
  const nonceRef = useRef(1);
  const activeRef = useRef(activeChapterId);
  activeRef.current = activeChapterId;
  const onRouteRef = useRef(opts.onChapterRoute);
  onRouteRef.current = opts.onChapterRoute;

  const numOf = useCallback((id: string) => chapters.find(c => c.id === id)?.num, [chapters]);

  // Initial canonicalisation: fix an invalid or non-canonical hash; never write one on a bare load.
  // A layout effect so it runs before GuideTab's passive request effect, which may then clear
  // an absent section (e.g. #/ch/3/reference) without this write restoring it.
  useLayoutEffect(() => {
    const { hash } = window.location;
    if (!hash) return;
    const num = numOf(init.chapterId);
    if (num === undefined) return;
    const canonical = formatChapterHash(num, init.route?.section);
    if (hash !== canonical) window.history.replaceState(null, '', canonical);
  }, [init, numOf]);

  // Back/forward and manual hash edits. Never pushes.
  useEffect(() => {
    const onPopState = () => {
      const { hash } = window.location;
      if (hash === '' || hash === '#') {
        // The bare entry is the untouched initial page, which shows the default chapter.
        setActiveChapterId(DEFAULT_CHAPTER);
        setRequestedSection(null);
        onRouteRef.current();
        return;
      }
      const route = parseChapterHash(hash, chapters);
      if (!route) {
        const num = numOf(activeRef.current);
        if (num !== undefined) window.history.replaceState(null, '', formatChapterHash(num));
        return;
      }
      setActiveChapterId(route.chapterId);
      setRequestedSection(route.section ? { key: route.section, nonce: ++nonceRef.current } : null);
      onRouteRef.current();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [chapters, numOf]);

  const navigate = useCallback((chapterId: string, section?: SectionKey) => {
    const num = numOf(chapterId);
    if (num === undefined) return;
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

  return { activeChapterId, requestedSection, loadedFromHash: init.route !== null, navigate, replaceSection };
}
