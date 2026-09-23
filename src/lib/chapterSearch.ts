import type { Chapter } from '../types';

/** Every string the index search reads for one chapter (lower-cased by the matcher). */
function chapterSearchFields(ch: Chapter): string[] {
  return [
    ch.title,
    ch.subtitle,
    ch.enTerm ?? '',
    ch.keyTakeaway,
    ch.plainAnalogy,
    ...(ch.jargonList ?? []).map(j => j.term),
    ...(ch.coreConcepts ?? []).flatMap(c => [c.heading, c.detail, ...(c.bulletPoints ?? [])]),
    ...(ch.commonPitfalls ?? []).map(p => p.pitfall),
  ].filter(Boolean);
}

/** Trimmed, case-insensitive substring match. Empty query matches everything. */
export function matchesChapterQuery(ch: Chapter, query: string, glossaryTerms: readonly string[]): boolean {
  const q = query.trim().toLowerCase();
  if (q === '') return true;
  if (chapterSearchFields(ch).some(f => f.toLowerCase().includes(q))) return true;
  return ch.id === 's15' && glossaryTerms.some(t => t.toLowerCase().includes(q));
}

/** The index filter: query match AND role chip (`'all'`, exact roleTag, or roleTag 'all'). */
export function filterIndexChapters(
  chapters: Chapter[], query: string, roleFilter: string, glossaryTerms: readonly string[],
): Chapter[] {
  return chapters.filter(ch =>
    matchesChapterQuery(ch, query, glossaryTerms) &&
    (roleFilter === 'all' || ch.roleTag === roleFilter || ch.roleTag === 'all'),
  );
}
