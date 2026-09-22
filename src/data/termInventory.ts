import type { Chapter, ContentBlock } from '../types';
import { GLOSSARY, type GlossaryTerm } from './glossary';
import { placementOf } from './sectionLayers';

/**
 * What a beginner actually sees, as data, so the term-coverage guard and (later) the inline-term
 * marker can walk the same fields. The field list is the beginner Core render order that
 * `sectionLayers.ts` establishes: hero -> primer -> jargon -> otherSide -> coreConcepts -> diagram.
 * Sections a beginner only reaches in Apply or Deep (dialogue, examples, friction, reference,
 * mindset) are deliberately out of scope.
 */
export interface TermField {
  /** Dotted path, used verbatim in failure messages: `perspectives.biz.measuredBy`. */
  field: string;
  get: (chapter: Chapter) => string[];
}

const texts = (...values: (string | undefined)[]): string[] => values.filter((v): v is string => !!v);

/** Every reader-visible string of one content block, including nested `details` bodies. */
export function blockTexts(block: ContentBlock): string[] {
  switch (block.kind) {
    case 'table':
      return [
        ...texts(block.title, block.intro, block.footnote),
        ...block.columns.map(c => c.label),
        ...block.rows.flatMap(r => Object.values(r.cells)),
      ];
    case 'note':
      return texts(block.title, block.body);
    case 'figure':
      return texts(block.title, block.caption);
    case 'cards':
      return [...texts(block.title, block.intro), ...block.cards.flatMap(c => [c.term, c.def])];
    case 'details':
      return [block.summary, ...block.body.flatMap(blockTexts)];
    case 'sources':
      return [...texts(block.title, block.caveat), ...block.items.map(i => i.label)];
  }
}

export const TERM_FIELDS: readonly TermField[] = [
  { field: 'title', get: c => [c.title] },
  { field: 'enTerm', get: c => texts(c.enTerm) },
  { field: 'subtitle', get: c => [c.subtitle] },
  { field: 'keyTakeaway', get: c => [c.keyTakeaway] },
  { field: 'plainAnalogy', get: c => [c.plainAnalogy] },
  { field: 'beginnerPrimer.whatIsIt', get: c => texts(c.beginnerPrimer?.whatIsIt) },
  { field: 'beginnerPrimer.whyItMatters', get: c => texts(c.beginnerPrimer?.whyItMatters) },
  { field: 'beginnerPrimer.realWorldScenario', get: c => texts(c.beginnerPrimer?.realWorldScenario) },
  { field: 'jargonList.term', get: c => (c.jargonList ?? []).map(j => j.term) },
  { field: 'jargonList.formalDefinition', get: c => (c.jargonList ?? []).flatMap(j => texts(j.formalDefinition)) },
  { field: 'jargonList.humanTranslation', get: c => (c.jargonList ?? []).map(j => j.humanTranslation) },
  { field: 'jargonList.meetingExample', get: c => (c.jargonList ?? []).flatMap(j => texts(j.meetingExample)) },
  { field: 'businessNote', get: c => [c.businessNote] },
  { field: 'engineerNote', get: c => [c.engineerNote] },
  {
    field: 'perspectives',
    get: c =>
      Object.values(c.perspectives ?? {}).flatMap(view => [
        view.measuredBy,
        ...view.fears,
        ...view.saysVsHears.flatMap(s => [s.youSay, s.theyHear, s.sayInstead]),
        ...view.askThem,
      ]),
  },
  { field: 'coreConcepts.heading', get: c => (c.coreConcepts ?? []).map(k => k.heading) },
  { field: 'coreConcepts.detail', get: c => (c.coreConcepts ?? []).map(k => k.detail) },
  { field: 'coreConcepts.bulletPoints', get: c => (c.coreConcepts ?? []).flatMap(k => k.bulletPoints ?? []) },
  { field: 'diagramTitle', get: c => texts(c.diagramTitle) },
  { field: 'diagramDescription', get: c => texts(c.diagramDescription) },
  {
    field: 'contentSections.diagram',
    get: c =>
      (c.contentSections ?? [])
        .filter(s => placementOf(s) === 'diagram')
        .flatMap(s => [...texts(s.heading), ...s.blocks.flatMap(blockTexts)]),
  },
];

export interface TermOccurrence {
  chapterId: string;
  field: string;
  text: string;
}

/** Every beginner-visible string of a chapter, in beginner Core render order. */
export function beginnerVisibleTexts(chapter: Chapter): TermOccurrence[] {
  return TERM_FIELDS.flatMap(({ field, get }) =>
    get(chapter).map(text => ({ chapterId: chapter.id, field, text })),
  );
}

/**
 * Multi-token or mixed-case terms the ALL-CAPS scan cannot see. Matched before it, so the
 * longer form always wins (`CI/CD` over `CI`, `UX/UI` over `UX`).
 */
export const COMPOUND_TERMS: readonly string[] = [
  'CI/CD', 'UX/UI', 'FURPS+', 'QR Code', 'Tech Debt', 'Test Pyramid', 'Testing Pyramid',
  'Quality Gate', 'User Story', 'Availability Zone', 'DoR', 'DoD', 'PjM', 'SaaS', 'IaC',
];

/**
 * ALL-CAPS tokens that the glossary does not own: English words the copy writes in caps,
 * role and team names, vendor and product names, and notation the copy spells out where it
 * uses it (`P0-P3`, `L4`, the `#A1024` order number). An explicit reviewed list, not a
 * heuristic — an entry here is a claim that no reader has to look this up in the glossary.
 */
export const KNOWN_NON_TERMS: ReadonlySet<string> = new Set([
  // Roles, teams and sides the guide names constantly
  'BUSINESS', 'ENGINEERING', 'DEV', 'DEVS', 'DESIGNER', 'SALES', 'ADMIN', 'SUPPORT', 'MARKETING',
  'FINANCE', 'LEGAL', 'OPS', 'TEAM', 'LEAD', 'STAFF', 'USER', 'USERS', 'CUSTOMER', 'CLIENT',
  // Vendors, products and brands
  'GOOGLE', 'AWS', 'GCP', 'AZURE', 'FIGMA', 'JIRA', 'SLACK', 'GITHUB', 'GITLAB', 'LINE', 'IOS',
  'ANDROID', 'EXCEL', 'NOTION', 'CONFLUENCE', 'ZOOM', 'TRELLO', 'ASANA', 'MIRO',
  // Proper nouns, notation and role titles the copy explains in place or never needs to define
  'A1024', 'CPU', 'PDPA', 'AI', 'CTO', 'PO', 'P0', 'P1', 'P2', 'P3', 'L4',
  // Ordinary English words or fragments that appear in caps inside copy
  'AND', 'OR', 'NOT', 'YES', 'NO', 'THE', 'FOR', 'ALL', 'NEW', 'OLD', 'WHY', 'HOW', 'WHAT',
  'WHO', 'WHEN', 'IF', 'IS', 'IT', 'TO', 'DO', 'BE', 'ON', 'IN', 'AT', 'BY', 'OK', 'VS',
  'PLUS', 'MINUS', 'TODO', 'FIX', 'BUG', 'DEMO', 'BETA', 'LIVE', 'PROD', 'STAGE', 'TEST',
  'DONE', 'START', 'STOP', 'GO', 'ASAP', 'FYI', 'ETC', 'EG', 'IE',
]);

/** The mixed-case long tail: words with a glossary entry that the ALL-CAPS scan cannot see. */
export const TRACKED_TERMS: readonly string[] = [
  'Sprint', 'Agile', 'Waterfall', 'Refactor', 'Refactoring', 'Monolith', 'Microservices',
  'Sketch', 'Gate', 'Pyramid',
];

const CAPS_RE = /\b[A-Z][A-Z0-9]{1,5}\b/g;

const escapeRe = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const byLengthDesc = (a: string, b: string) => b.length - a.length;

/**
 * Abbreviations a reader meets in `text`: the curated compounds first (longest match wins),
 * then ALL-CAPS tokens of 2-6 characters, minus `KNOWN_NON_TERMS`. Each form is returned once,
 * in the casing the content uses.
 */
export function extractAbbreviations(text: string): string[] {
  const found: string[] = [];
  let rest = text;
  for (const compound of [...COMPOUND_TERMS].sort(byLengthDesc)) {
    const re = new RegExp(`(?<![A-Za-z0-9])${escapeRe(compound)}(?![A-Za-z0-9])`, 'gi');
    if (re.test(rest)) {
      found.push(compound);
      rest = rest.replace(re, ' ');
    }
  }
  for (const match of rest.match(CAPS_RE) ?? []) {
    if (!KNOWN_NON_TERMS.has(match) && !/^\d/.test(match)) found.push(match);
  }
  return [...new Set(found)];
}

/** Mixed-case tracked words present in `text`, matched as whole words, case-insensitively. */
export function extractTrackedTerms(text: string): string[] {
  return TRACKED_TERMS.filter(term =>
    new RegExp(`(?<![A-Za-z])${escapeRe(term)}(?![A-Za-z])`, 'i').test(text),
  );
}

/**
 * The strings a reader could type to mean this entry: the visible label with its parenthetical
 * expansions removed (split on `/`, so `SLA / SLO` yields both), plus every alias. Lower-cased.
 */
export function glossaryKeys(entry: GlossaryTerm): string[] {
  const label = entry.term.replace(/\([^)]*\)/g, ' ');
  const parts = [...label.split('/').map(s => s.trim()).filter(Boolean), label.trim(), ...(entry.aliases ?? [])];
  return [...new Set(parts.map(s => s.toLowerCase()))];
}

/** Lower-cased key -> ids of the entries that answer to it. A key with 2+ ids is ambiguous. */
export const GLOSSARY_KEY_INDEX: ReadonlyMap<string, readonly string[]> = (() => {
  const index = new Map<string, string[]>();
  for (const entry of GLOSSARY) {
    for (const key of glossaryKeys(entry)) index.set(key, [...(index.get(key) ?? []), entry.id]);
  }
  return index;
})();

/** Ids of the entries a typed term resolves to; empty when the glossary cannot answer. */
export function resolveTerm(key: string): readonly string[] {
  return GLOSSARY_KEY_INDEX.get(key.trim().toLowerCase()) ?? [];
}
