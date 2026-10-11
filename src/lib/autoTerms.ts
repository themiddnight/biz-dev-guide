import { GLOSSARY, type GlossaryTerm } from '../data/glossary';
import { termPattern } from '../data/termInventory';

/**
 * Automatic inline-term markers (term-definitions spec P3.5, D16). `markTerms` inserts
 * `[[g:<glossary-id>|label]]` around glossary terms in a prose string, immediately before
 * `RichText` parses it. Markers carry an id and the label as written — never definition text.
 * The per-section walk (which strings, in which order, sharing one `seen` set) lives in
 * `src/lib/sectionTerms.ts`, a pure function of the chapter the section components memoise.
 *
 * Field scope (guardrail 1). The call sites pass the kind; nothing is marked unless it is `prose`.
 * - `prose` (marked): `chapterOpening`, `heroFigure.seats.*`, `plainAnalogy`, `keyTakeaway`,
 *   `beginnerPrimer.whatIsIt` / `whyItMatters` / `realWorldScenario`, `coreConcepts[].detail`,
 *   `coreConcepts[].bulletPoints[]`, `jargonList[].humanTranslation` / `formalDefinition` /
 *   `meetingExample`, `businessNote`, `engineerNote`, `perspectives.*.measuredBy`,
 *   `perspectives.*.fears[]`, `perspectives.*.askThem[]`, the `perspectives.*.saysVsHears[]` lines,
 *   every `dialogueExample` line, `realWorldExamples[]` (`situation`, `whatHappened`, `resolution`,
 *   `keyLesson`), `realWorldWorkflow[].description`, `checklist[]`, `commonPitfalls[]` (`symptom`,
 *   `solution`) and the `frictionPlaybook` lines. Dialogue and quoted speech are prose (D21): on the
 *   eng track every early `Sprint` is inside a spoken line.
 * - `heading` (returned unchanged): `title`, `subtitle`, `enTerm`, `diagramTitle`,
 *   `heroFigure.caption`, `coreConcepts[].heading`, `jargonList[].term`,
 *   `realWorldExamples[].title`, `realWorldWorkflow[].step`, `commonPitfalls[].pitfall`,
 *   `frictionPlaybook.battlegroundTitle`, `goldenScripts[].situation`, every section header string
 *   in the components, and every glossary `term` label.
 * - Not wired: `ContentBlock` body and table-cell text (`ContentBlocks.tsx`), `diagramDescription`,
 *   and a friction dilemma option's own text, which renders inside its `<button>` where a term
 *   button cannot nest.
 *
 * A glossary key that means something else in one string (`Pipeline` in "Leaky Pipeline") is opted
 * out in that string with `[[!g:id]]` (guardrail 7), not excluded here.
 *
 * Deliberately not read: `role` and `chapterLevel` (D17). Every reader gets the same markers.
 */
export type FieldKind = 'prose' | 'heading';

interface Candidate {
  key: string;
  id: string;
  pattern: RegExp;
  /** Lower-cased forms that, found in parentheses right after a match, mean the text expands it. */
  expansions: string[];
}

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
  return [...new Set([...parts, label, compact, ...(entry.aliases ?? [])])];
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
 * bold runs (the `RichText` bold token cannot hold a nested marker), and backtick code. Quoted
 * speech (D21) and arrow chains such as `ผู้บริหาร → PM → Designer` (D20) are prose and are scanned.
 */
const PROTECTED_RES: readonly RegExp[] = [
  /\[\[(?:g:[a-z0-9-]+|s\d+)\|[^\]]+?\]\]/g,
  /\*\*[^*]+?\*\*/g,
  /`[^`\n]*`/g,
];

type Span = [start: number, end: number];

const overlaps = (spans: readonly Span[], [s, e]: Span) => spans.some(([a, b]) => s < b && a < e);

/** The term is the whole content of a pair of parentheses: `รายได้ (Revenue)`, `Key Results (KR)`. */
const isAloneInParens = (text: string, [start, end]: Span): boolean =>
  /\(\s*$/.test(text.slice(0, start)) && /^\s*\)/.test(text.slice(end));

/**
 * Guardrail 6: the text expands the term right after it — `QA (Quality Assurance)`, `KR (ผลลัพธ์หลัก)`.
 * A term alone in parentheses is not expanded text: `เงินที่ได้จากลูกค้าหนึ่งคน (LTV)` glosses the
 * term in passing, and the reader still needs its definition, so it is marked.
 */
const isExpandedAt = (text: string, [, end]: Span, candidate: Candidate): boolean => {
  if (/^\s*\(/.test(text.slice(end))) return true;
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
 * Insert `[[g:id|label]]` markers for glossary terms found in `text`. String -> string; it adds the
 * ids it marks to `seen`, so each term is marked once per `seen` set (guardrail 3). Never pass a set
 * that outlives one call of a pure section walk (`sectionTerms.ts`): a set shared across renders is
 * already full on React's StrictMode second render, which then marks nothing.
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
  hits.sort((a, b) => a.span[0] - b.span[0]);
  for (const [index, { span, candidate, label }] of hits.entries()) {
    named?.push(candidate.id);
    if (optedOut.has(candidate.id) || seen.has(candidate.id)) continue;
    const expanded = isExpandedAt(source, span, candidate);
    // `Key Results (KR)`: a shorter form of the same term follows in parentheses and carries the
    // marker. `QA (Quality Assurance)` stays unmarked: there the parentheses spell the term out.
    const next = hits[index + 1];
    const shortFormFollows = next?.candidate.id === candidate.id && next.label.length < label.length && isAloneInParens(source, next.span);
    if (expanded && shortFormFollows) continue;
    seen.add(candidate.id); // an expanded first use also counts: the text defined it right there
    if (expanded) continue;
    out += source.slice(cursor, span[0]) + `[[g:${candidate.id}|${label}]]`;
    cursor = span[1];
  }
  return out + source.slice(cursor);
}
