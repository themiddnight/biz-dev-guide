import { termSide, type GlossaryCategory, type GlossaryTerm } from '../data/glossary';
import { termLabelKeys } from '../data/termInventory';
import type { Role } from '../data/rolePerspective';

/**
 * Search text for a RichText string: chapter-link and term markup reduced to its label, term
 * opt-outs and bold markers removed — so a marker inside a definition never breaks search.
 */
export const plainSearchText = (text: string) =>
  text
    .replace(/\[\[(?:s\d+|g:[a-z0-9-]+)\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[!g:(?:[a-z0-9-]+|\*)\]\]/g, '')
    .replace(/\*\*/g, '');

/** Everything the filter reads for one entry, lower-cased. */
const haystack = (term: GlossaryTerm) =>
  [term.term, ...(term.aliases ?? []), plainSearchText(term.definition), term.plain ? plainSearchText(term.plain) : '']
    .join('\n')
    .toLowerCase();

/**
 * Relevance rank of one entry for an already-normalised needle — lower is better
 * (term-definitions spec acceptance 1 and 7). A name match beats an alias match, and both beat a
 * hit found only inside the definition, so typing `BA` cannot land on `Backlog` first. Deliberately
 * a fixed ladder of five rungs, not a score: the order is then obvious from reading the entry.
 */
export function searchRank(term: GlossaryTerm, needle: string): number {
  const labels = termLabelKeys(term);
  const aliases = (term.aliases ?? []).map(a => a.trim().toLowerCase());
  if (labels.includes(needle)) return 0; // typed the visible name
  if (aliases.includes(needle)) return 1; // typed a form the chapters use
  if (labels.some(l => l.startsWith(needle))) return 2;
  if (aliases.some(a => a.startsWith(needle))) return 3;
  if (labels.some(l => l.includes(needle)) || aliases.some(a => a.includes(needle))) return 4;
  return 5; // found only in the definition or the plain line
}

export interface GlossarySearchFilters {
  /** Raw query as typed; trimmed and lower-cased here. */
  query?: string;
  /** Home-side chip. */
  side?: Role | 'all';
  /** Category chip. */
  category?: GlossaryCategory | 'all';
}

/**
 * The panel's result list: the category/side chips filter, the query filters, and a matching
 * query ranks. `terms` arrives in display order (`sortTermsForRole`) and the sort is stable, so
 * that order still decides ties — the count is unchanged by ranking, only the order is.
 */
export function searchGlossaryTerms(
  terms: readonly GlossaryTerm[],
  { query = '', side = 'all', category = 'all' }: GlossarySearchFilters = {},
): GlossaryTerm[] {
  const needle = query.trim().toLowerCase();
  const filtered = terms.filter(term => {
    if (side !== 'all' && termSide(term) !== side) return false;
    if (category !== 'all' && term.category !== category) return false;
    return !needle || haystack(term).includes(needle);
  });
  if (!needle) return filtered;
  return filtered
    .map((term, index) => ({ term, index, rank: searchRank(term, needle) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(entry => entry.term);
}
