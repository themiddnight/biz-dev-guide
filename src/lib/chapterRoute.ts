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
