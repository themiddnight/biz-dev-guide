import { GLOSSARY, type GlossaryTerm } from '../data/glossary';
import { termPattern } from '../data/termInventory';

/**
 * Automatic inline-term markers (term-definitions spec P3.5, D16). `markTerms` inserts
 * `[[g:<glossary-id>|label]]` around glossary terms in a prose string, immediately before
 * `RichText` parses it. Markers carry an id and the label as written — never definition text.
 *
 * Field scope (guardrail 1). The call sites pass the kind; nothing is marked unless it is `prose`.
 * - `prose` (marked): `beginnerPrimer.whatIsIt` / `whyItMatters` / `realWorldScenario`,
 *   `coreConcepts[].detail`, `coreConcepts[].bulletPoints[]`, `jargonList[].humanTranslation`,
 *   `keyTakeaway`, `plainAnalogy`, `businessNote`, `engineerNote`, `perspectives.*.measuredBy`,
 *   `perspectives.*.fears[]`, `perspectives.*.askThem[]`.
 * - `heading` (returned unchanged): `title`, `subtitle`, `enTerm`, `diagramTitle`,
 *   `coreConcepts[].heading`, `jargonList[].term`, `checklist[]`, `realWorldWorkflow[].step`,
 *   `commonPitfalls[].pitfall`, every section header string in the components, and every glossary
 *   `term` label. Also `diagramDescription`: it renders inside the diagram section's toggle
 *   `<button>`, and a term button cannot nest inside another button.
 * - `quote` (returned unchanged): `dialogueExample` lines, `jargonList[].meetingExample`,
 *   `frictionPlaybook` script lines, and `perspectives.*.saysVsHears[]` — the lines a person says
 *   (`youSay` / `theyHear` / `sayInstead`), which is the spec's own example of speech
 *   (`chapterPerspectives.ts:435`, `'บั๊กนี้ Severity ต่ำ ไว้ Sprint หน้าได้'`).
 * - Not wired yet: `ContentBlock` body and table-cell text (`ContentBlocks.tsx`) and
 *   `jargonList[].formalDefinition` render without `markTerms`.
 *
 * Deliberately not read: `role` and `chapterLevel` (D17). Every reader gets the same markers.
 */
export type FieldKind = 'prose' | 'heading' | 'quote';

interface Candidate {
  key: string;
  id: string;
  pattern: RegExp;
  /** Lower-cased forms that, found in parentheses right after a match, mean the text expands it. */
  expansions: string[];
}

/**
 * Keys the glossary answers to that mean something else in this guide's prose, so an automatic
 * match would open the wrong definition. Search still finds them; only auto-marking skips them.
 * - `Pipeline` is an alias of `sales-pipeline`, but the chapters use it for the Leaky Pipeline (s1)
 *   and the CI/CD pipeline.
 * - `L1` / `L2` / `L3` are support tiers in `support-ticket-support-tier`, but s5 uses them for the
 *   C4 zoom levels (`chapters1_5.ts:587, 600`).
 */
export const AUTO_MATCH_EXCLUDED_KEYS: ReadonlySet<string> = new Set(['Pipeline', 'L1', 'L2', 'L3']);

/**
 * Guardrail 5: an abbreviation — all caps (`PM`, `C4`, `P&L`, `CI/CD`) or an all-caps compound
 * with lower-case joints (`DoR`, `PjM`, `SaaS`) — matches with exact case. Everything else is a
 * word and matches case-insensitively.
 */
export function isAbbreviationKey(key: string): boolean {
  if (/\s/.test(key) || !/[A-Z]/.test(key)) return false;
  return /^[A-Z0-9&+/-]+$/.test(key) || (key.match(/[A-Z]/g) ?? []).length >= 2;
}

const expansionsOf = (entry: GlossaryTerm): string[] => {
  const inParens = [...entry.term.matchAll(/\(([^)]*)\)/g)].flatMap(m => [m[1], ...m[1].split('/')]);
  const spelledOut = (entry.aliases ?? []).filter(a => /\s/.test(a));
  return [...new Set([...inParens, ...spelledOut].map(s => s.trim().toLowerCase()).filter(s => s.length > 2))];
};

/** The forms one entry answers to, as written: its label split on `/` without parentheticals, the whole label, and every alias. */
const keysOf = (entry: GlossaryTerm): string[] => {
  const label = entry.term.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const parts = label.split('/').map(s => s.trim()).filter(Boolean);
  const compact = label.replace(/\s*\/\s*/g, '/');
  return [...new Set([...parts, label, compact, ...(entry.aliases ?? [])])].filter(k => !AUTO_MATCH_EXCLUDED_KEYS.has(k));
};

/** Guardrail 4: candidates sorted longest key first, so `CI/CD` beats `CI` and `Test Pyramid` beats `Pyramid`. */
const CANDIDATES: readonly Candidate[] = GLOSSARY.flatMap(entry =>
  keysOf(entry).map(key => ({
    key,
    id: entry.id,
    pattern: termPattern(key, isAbbreviationKey(key) ? 'g' : 'gi'),
    expansions: expansionsOf(entry),
  })),
).sort((a, b) => b.key.length - a.key.length);

const OPT_OUT_RE = /\[\[!g:([a-z0-9-]+|\*)\]\]/g;
const AUTHORED_RE = /\[\[g:([a-z0-9-]+)\|[^\]]+?\]\]/g;

/**
 * Runs the matcher never looks inside (guardrails 2 and 8): existing markers and chapter links,
 * bold runs (the `RichText` bold token cannot hold a nested marker), quoted runs, backtick code,
 * and arrow chains — short tokens joined by `->`, `→` or `➔` (`PO ➔ UX ➔ BA`).
 */
const PROTECTED_RES: readonly RegExp[] = [
  /\[\[(?:g:[a-z0-9-]+|s\d+)\|[^\]]+?\]\]/g,
  /\*\*[^*]+?\*\*/g,
  /"[^"\n]*"/g,
  /“[^”\n]*”/g,
  /'[^'\n]*'/g,
  /‘[^’\n]*’/g,
  /「[^」\n]*」/g,
  /`[^`\n]*`/g,
  /\S+(?:\s*(?:->|→|➔)\s*\S+)+/g,
];

type Span = [start: number, end: number];

const overlaps = (spans: readonly Span[], [s, e]: Span) => spans.some(([a, b]) => s < b && a < e);

/** Guardrail 6: the text expands the term itself — `QA (Quality Assurance)`, `KR (ผลลัพธ์หลัก)`, `Key Results (KR)`. */
const isExpandedAt = (text: string, [start, end]: Span, candidate: Candidate): boolean => {
  if (/^\s*\(/.test(text.slice(end))) return true;
  if (/\(\s*$/.test(text.slice(0, start)) && /^\s*\)/.test(text.slice(end))) return true;
  const window = text.slice(end, end + 40).toLowerCase();
  const open = window.indexOf('(');
  if (open === -1) return false;
  const inside = window.slice(open + 1).split(')')[0];
  return candidate.expansions.some(exp => inside.includes(exp));
};

/** Every term id `text` names, by the same matcher, ignoring `seen` and the field kind. */
export function collectTermIds(text: string): string[] {
  const ids: string[] = [];
  scan(text, new Set(), ids);
  return [...new Set(ids)];
}

/**
 * Insert `[[g:id|label]]` markers for glossary terms found in `text`. Pure string -> string;
 * `seen` (term ids) is owned by the section component and fresh on every section render, so each
 * term is marked once per section (guardrail 3).
 */
export function markTerms(text: string, kind: FieldKind, seen: Set<string>): string {
  return kind === 'prose' ? scan(text, seen) : text;
}

function scan(text: string, seen: Set<string>, named?: string[]): string {
  // Guardrail 7: author opt-outs, stripped from the output and never rendered.
  const optedOut = new Set([...text.matchAll(OPT_OUT_RE)].map(m => m[1]));
  const source = text.replace(OPT_OUT_RE, '');
  if (optedOut.has('*')) return source;

  // A hand-authored marker wins, and suppresses automatic marking of its id in this string.
  for (const m of source.matchAll(AUTHORED_RE)) {
    optedOut.add(m[1]);
    seen.add(m[1]);
  }

  const claimed: Span[] = PROTECTED_RES.flatMap(re => [...source.matchAll(re)].map((m): Span => [m.index, m.index + m[0].length]));
  const hits: { span: Span; candidate: Candidate; label: string }[] = [];
  for (const candidate of CANDIDATES) {
    for (const m of source.matchAll(candidate.pattern)) {
      const span: Span = [m.index, m.index + m[0].length];
      if (overlaps(claimed, span)) continue;
      claimed.push(span); // a longer key claims its text even when it is not marked (`CI/CD` blocks `CI`)
      hits.push({ span, candidate, label: m[0] });
    }
  }

  let out = '';
  let cursor = 0;
  for (const { span, candidate, label } of hits.sort((a, b) => a.span[0] - b.span[0])) {
    named?.push(candidate.id);
    if (optedOut.has(candidate.id) || seen.has(candidate.id)) continue;
    seen.add(candidate.id); // an expanded first use also counts: the text defined it right there
    if (isExpandedAt(source, span, candidate)) continue;
    out += source.slice(cursor, span[0]) + `[[g:${candidate.id}|${label}]]`;
    cursor = span[1];
  }
  return out + source.slice(cursor);
}
