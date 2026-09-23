import type { Chapter } from '../types';

/** The glossary fields the matcher reads: the term, its aliases, and the chapters it belongs to. */
export interface SuggestTerm {
  term: string;
  aliases?: string[];
  relatedChapterIds: string[];
}

interface Phrase {
  chapterId: string;
  pattern: string;
  weight: number;
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Case-insensitive phrase test. An ASCII phrase must stand as whole words, so "AC" does not
 * match "react" or "cache"; a Thai phrase has no word breaks to test, so any substring counts.
 */
export function mentions(text: string, phrase: string): boolean {
  const p = phrase.trim().toLowerCase();
  if (p === '') return false;
  const t = text.toLowerCase();
  if (!/^[\x00-\x7f]+$/.test(p)) return t.includes(p);
  return new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(p)}(?:$|[^a-z0-9])`).test(t);
}

// "MVP (Minimum Viable Product)" -> both halves; "Sprint และด่าน DoR/DoD" -> each named thing.
function splitPhrases(text: string): string[] {
  const inner = [...text.matchAll(/\(([^)]+)\)/g)].map(m => m[1]);
  const outer = text.replace(/\([^)]*\)/g, ' ');
  return [...outer.split(/\s+และ\s*|\s+กับ\s*|[/,&]/), ...inner]
    .map(s => s.trim())
    .filter(s => s.length >= 2);
}

function buildPhrases(chapters: readonly Chapter[], terms: readonly SuggestTerm[]): Phrase[] {
  const known = new Set(chapters.map(c => c.id));
  const phrases: Phrase[] = [];
  for (const ch of chapters) {
    for (const p of splitPhrases(`${ch.title}, ${ch.enTerm ?? ''}`)) phrases.push({ chapterId: ch.id, pattern: p, weight: 3 });
    for (const j of ch.jargonList ?? []) {
      for (const p of splitPhrases(j.term)) phrases.push({ chapterId: ch.id, pattern: p, weight: 2 });
    }
  }
  for (const t of terms) {
    const names = [t.term, ...(t.aliases ?? [])].flatMap(splitPhrases);
    t.relatedChapterIds.filter(id => known.has(id)).forEach((id, i) => {
      for (const p of names) phrases.push({ chapterId: id, pattern: p, weight: i === 0 ? 2 : 1 });
    });
  }
  return phrases;
}

/**
 * Guide chapters that talk about what the question names, best first. Each chapter scores its
 * own title and English term, its jargon, and glossary terms that point at it; a phrase counts
 * once per chapter.
 */
export function suggestChapters(
  question: string, chapters: readonly Chapter[], terms: readonly SuggestTerm[], limit = 3,
): Chapter[] {
  const scores = new Map<string, number>();
  const counted = new Set<string>();
  for (const { chapterId, pattern, weight } of buildPhrases(chapters, terms)) {
    const key = `${chapterId}\u0000${pattern.toLowerCase()}`;
    if (counted.has(key) || !mentions(question, pattern)) continue;
    counted.add(key);
    scores.set(chapterId, (scores.get(chapterId) ?? 0) + weight);
  }
  return chapters
    .filter(c => scores.has(c.id))
    .sort((a, b) => scores.get(b.id)! - scores.get(a.id)! || a.num - b.num)
    .slice(0, limit);
}
