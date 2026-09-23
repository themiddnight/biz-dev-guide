import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { GLOSSARY } from './glossary';
import {
  beginnerVisibleTexts, extractAbbreviations, extractTrackedTerms, glossaryKeys, namesTerm, resolveTerm,
} from './termInventory';
import { searchGlossaryTerms } from '../lib/glossarySearch';
import { coreConceptTerms, heroTerms, jargonTerms, otherSideTerms, primerTerms } from '../lib/sectionTerms';
import { ROLES } from './rolePerspective';
import type { Chapter } from '../types';
import { TRACK_CHAPTER_NUMS, type TrackKey } from './readingTracks';

/**
 * The owner's guard (term-definitions spec D11), v1: the weaker "a definition exists at all"
 * form. Every abbreviation a beginner meets must resolve to exactly one glossary entry, or be
 * defined where it is used — the jargon card of the chapter that uses it, or an expansion in
 * parentheses in the same string. The v2 block at the end of this file is the full form (Phase 3):
 * it walks each reading track in order and requires a definition at or before first use.
 */

/** term -> `{ chapterId, field }` of its first beginner-visible appearance, in chapter order. */
const firstSeen = (() => {
  const seen = new Map<string, { chapterId: string; field: string }>();
  for (const chapter of CHAPTERS) {
    for (const occurrence of beginnerVisibleTexts(chapter)) {
      const terms = [...extractAbbreviations(occurrence.text), ...extractTrackedTerms(occurrence.text)];
      for (const term of terms) {
        if (!seen.has(term)) seen.set(term, { chapterId: occurrence.chapterId, field: occurrence.field });
      }
    }
  }
  return seen;
})();

const escapeRe = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Defined where it is used, scoped to the chapter that uses it (review issue 5: the comment above
 * claimed per chapter, the code checked the whole guide — the check is now the narrower one the
 * comment describes): the subject of a jargon card in *that* chapter, or expanded in parentheses in
 * one of *that* chapter's beginner-visible strings. A term expanded once in ch.19 no longer excuses
 * its bare first use in ch.2.
 */
const definedInPlace = (term: string, chapterId: string) => {
  const chapter = CHAPTERS.find(c => c.id === chapterId);
  if (!chapter) return false;
  const t = escapeRe(term);
  if ((chapter.jargonList ?? []).some(card => namesTerm(card.term, term))) return true;
  const expanded = new RegExp(`(?<![A-Za-z0-9])${t}\\s*\\(|\\(\\s*${t}\\s*\\)`);
  return beginnerVisibleTexts(chapter).some(o => expanded.test(o.text));
};

/**
 * The audit's own findings, pinned as literal regressions: §2.1's unfindable abbreviations,
 * §2.4's long tail, and the five from §3. Each must resolve to exactly one glossary entry.
 */
const AUDIT_TERMS = [
  'SLO', 'SRE', 'QA', 'BA', 'KR', 'Sprint', 'Agile', 'Waterfall', 'FURPS', 'KISS', 'ERD',
  'JSON', 'FAQ', 'OTP', 'SMS', 'QR', 'AZ', 'Sketch', 'UX/UI', 'Refactor', 'Monolith',
  'Microservices', 'Test Pyramid', 'Quality Gate', 'API', 'SA', 'NFR', 'SLA', 'MVP', 'SDK',
  'CI/CD', 'KPI', 'PM', 'PjM', 'Tech Debt', 'C4', 'DoR', 'DoD', 'BRD', 'PRD', 'ADR', 'SDLC',
  'RICE', 'BPMN', 'DORA', 'UML', 'MTTR', 'UAT', 'E2E',
];

/** The Thai labels the chapters and the round-3 personas typed (acceptance 3). */
const THAI_LABELS: [string, string][] = [
  ['ประกันคุณภาพ', 'qa'],
  ['ด่านตรวจ', 'quality-gate'],
  ['สปรินต์', 'sprint'],
  ['เป้าภายใน', 'slo'],
  ['ค่าเสียโอกาส', 'opportunity-cost'],
];

describe('glossary resolution', () => {
  it('no key resolves to two entries', () => {
    const ambiguous = [...new Set(GLOSSARY.flatMap(glossaryKeys))]
      .map(key => [key, resolveTerm(key)] as const)
      .filter(([, ids]) => new Set(ids).size > 1)
      .map(([key, ids]) => `${key} -> ${ids.join(', ')}`);
    expect(ambiguous).toEqual([]);
  });

  it('every term the audit named resolves to exactly one entry', () => {
    const unresolved = AUDIT_TERMS.filter(term => new Set(resolveTerm(term)).size !== 1)
      .map(term => `${term} -> ${resolveTerm(term).join(', ') || 'ไม่พบคำที่ค้นหา'}`);
    expect(unresolved).toEqual([]);
  });

  it('typing the Thai label finds the same entry as the abbreviation', () => {
    for (const [label, id] of THAI_LABELS) expect(resolveTerm(label), label).toContain(id);
  });

  it('SLO resolves as its own entry, not as an example inside another one (round-3 I-11)', () => {
    expect(resolveTerm('SLO')).toEqual(['slo']);
    expect(resolveTerm('Sprint')).toEqual(['sprint']);
  });
});

/**
 * Acceptance 1 and 7 are about the *panel's* order, not the exact-key index: these run the
 * function `GlossaryPanel` itself calls, so a filter that finds the entry but buries it fails here.
 */
describe('glossary panel search order', () => {
  const firstHit = (query: string) => searchGlossaryTerms(GLOSSARY, { query })[0]?.id;
  const hits = (query: string) => searchGlossaryTerms(GLOSSARY, { query }).map(t => t.id);

  it('every term the acceptance list names is the first hit, not just a hit (acceptance 1, 7)', () => {
    const misranked = AUDIT_TERMS
      .map(term => [term, resolveTerm(term)[0], firstHit(term)] as const)
      .filter(([, expected, actual]) => expected !== actual)
      .map(([term, expected, actual]) => `${term}: first hit ${actual ?? 'none'}, expected ${expected}`);
    expect(misranked).toEqual([]);
  });

  it('the abbreviations the readers typed beat the entries that merely mention them', () => {
    expect(firstHit('SLO')).toBe('slo');
    expect(firstHit('Sprint')).toBe('sprint'); // was `velocity`
    expect(firstHit('KR')).toBe('kr'); // was `okr-kpi`
    expect(firstHit('BA')).toBe('ba'); // was `backlog`, first of 9
    expect(firstHit('SA')).toBe('sa'); // was `usability-testing`
  });

  it('the Thai labels the readers typed find their entry first (acceptance 3)', () => {
    for (const [label, id] of THAI_LABELS) expect(firstHit(label), label).toBe(id);
    expect(firstHit('โปรโตคอล')).toBe('protocol'); // §0.1's dead end in ch.5
    expect(firstHit('RTO')).toBe('rto-rpo'); // P2.2's unreachable abbreviation
  });

  it('a name match beats an alias match, and an alias match beats a definition match', () => {
    const order = hits('sprint');
    expect(order.indexOf('sprint')).toBeLessThan(order.indexOf('velocity'));
    expect(order.length).toBeGreaterThan(1); // ranking must not drop results
  });

  it('ranking keeps the category and side filters, and the result count', () => {
    const all = searchGlossaryTerms(GLOSSARY, { query: 'sprint' });
    const qaOnly = searchGlossaryTerms(GLOSSARY, { query: 'sprint', category: 'qa' });
    expect(qaOnly.every(t => t.category === 'qa')).toBe(true);
    expect(qaOnly.length).toBeLessThanOrEqual(all.length);
    const biz = searchGlossaryTerms(GLOSSARY, { side: 'biz' });
    expect(biz).toEqual(GLOSSARY.filter(t => biz.includes(t)));
    expect(searchGlossaryTerms(GLOSSARY, {})).toHaveLength(GLOSSARY.length);
  });
});

describe('beginner-visible abbreviation coverage', () => {
  it('every abbreviation a beginner meets has a definition it can reach', () => {
    const undefinedTerms = [...firstSeen]
      .filter(([term, where]) => new Set(resolveTerm(term)).size !== 1 && !definedInPlace(term, where.chapterId))
      .map(([term, where]) => `${term} -> ${where.chapterId}/${where.field}`);
    expect(undefinedTerms).toEqual([]);
  });

  it('the extractor still sees the guide\'s densest abbreviation lines', () => {
    for (const term of ['API', 'CI/CD', 'SLA', 'MVP', 'NFR', 'SDK']) {
      expect(firstSeen.has(term), term).toBe(true);
    }
    expect([...firstSeen.keys()].length).toBeGreaterThan(60);
  });

  it('s15 defines the six abbreviations of its own primer sentence (P2.3)', () => {
    const s15 = CHAPTERS.find(c => c.id === 's15')!;
    expect(s15.jargonList).toHaveLength(5);
    const cards = (s15.jargonList ?? []).map(j => j.term).join(' ');
    for (const term of ['API', 'CI/CD', 'SLA', 'MVP', 'NFR', 'SDK']) expect(cards, term).toContain(term);
  });
});

/**
 * v2 (term-definitions spec D11, Phase 3): the at-or-before form. The markers come from the same
 * pure section walks the components render (`src/lib/sectionTerms.ts`), not from a hand-kept
 * mirror, so a rewired component cannot drift from this guard. The model is a beginner's default
 * view with every Core section open: the other-side box in `both` mode, and core-concept bullets
 * folded — a beginner does not see them until they tap `ดูรายละเอียด`, so they are neither a first
 * use nor a definition here. A field with no entry below is never marked (headings, unwired fields).
 */
function markedByField(chapter: Chapter): Map<string, string[]> {
  const hero = heroTerms(chapter);
  const primer = primerTerms(chapter);
  const jargon = jargonTerms(chapter);
  const cards = otherSideTerms(chapter, ROLES);
  const concepts = coreConceptTerms(chapter);
  return new Map([
    ['chapterOpening', [hero.chapterOpening]],
    ['keyTakeaway', [hero.keyTakeaway]],
    ['plainAnalogy', [hero.plainAnalogy]],
    ['beginnerPrimer.whatIsIt', primer ? [primer.whatIsIt] : []],
    ['beginnerPrimer.whyItMatters', primer ? [primer.whyItMatters] : []],
    ['beginnerPrimer.realWorldScenario', primer ? [primer.realWorldScenario] : []],
    ['jargonList.humanTranslation', jargon.map(card => card.humanTranslation)],
    ['jargonList.meetingExample', jargon.flatMap(card => (card.meetingExample === undefined ? [] : [card.meetingExample]))],
    // Each card carries its reader's note: the biz card is read by eng (`engineerNote`), and back.
    ['businessNote', cards.filter(card => card.side === 'eng').map(card => card.note)],
    ['engineerNote', cards.filter(card => card.side === 'biz').map(card => card.note)],
    ['perspectives.measuredBy', cards.map(card => card.measuredBy)],
    ['perspectives.fears', cards.flatMap(card => card.fears)],
    ['perspectives.saysVsHears', cards.flatMap(card => card.saysVsHears.flatMap(row => [row.youSay, row.theyHear, row.sayInstead]))],
    ['perspectives.askThem', cards.flatMap(card => card.askThem)],
    ['coreConcepts.detail', concepts.map(concept => concept.detail)],
  ]);
}

/** Fields a beginner's default view keeps folded: not walked at all. */
const FOLDED_FOR_BEGINNERS: ReadonlySet<string> = new Set(['coreConcepts.bulletPoints']);

const MARKER_ID_RE = /\[\[g:([a-z0-9-]+)\|[^\]]+\]\]/g;
/** What the reader sees of a string: markers become their labels, opt-outs vanish. */
const visibleText = (text: string) => text.replace(/\[\[!g:(?:[a-z0-9-]+|\*)\]\]/g, '').replace(/\[\[g:[a-z0-9-]+\|([^\]]+)\]\]/g, '$1');

interface TrackEvent { term: string; at: string; defined: boolean }

/** `ChapterHero` renders `plainAnalogy` above `keyTakeaway` when the chapter has a hero figure (`heroTerms` marks it first too). */
function heroInRenderOrder<T extends { field: string }>(chapter: Chapter, occurrences: T[]): T[] {
  if (!chapter.heroFigure) return occurrences;
  const out = [...occurrences];
  const takeaway = out.findIndex(o => o.field === 'keyTakeaway');
  const analogy = out.findIndex(o => o.field === 'plainAnalogy');
  [out[takeaway], out[analogy]] = [out[analogy], out[takeaway]];
  return out;
}

/**
 * The chapter's headings. They are never marked (P3.5); the opening line directly under them is
 * their definition (spec P4.2), so a heading's term counts as defined when the opening expands it
 * (`openingExpands`, the Phase 4 check: the glossary expansion in parentheses, Thai name first, or a marker).
 */
const HEADING_FIELDS: ReadonlySet<string> = new Set(['title', 'enTerm', 'subtitle']);

/** Whether `text` defines `term` in place: expanded in parentheses on either side, or marked. */
const definedIn_ = (term: string, text: string, markerIds: ReadonlySet<string>) => {
  const t = escapeRe(term);
  const expanded = new RegExp(`(?<![A-Za-z0-9])${t}\\s*\\(|\\(\\s*${t}\\s*\\)`).test(text);
  return expanded || resolveTerm(term).some(id => markerIds.has(id));
};

const markerIdsOf = (markedText: string) => new Set([...markedText.matchAll(MARKER_ID_RE)].map(m => m[1]));

/** What counts as an expansion of an entry: its parentheticals (and their `/` parts), its label when that is not the key, and its spelled-out aliases. */
const expansionsOf = (id: string, key: string) => {
  const entry = GLOSSARY.find(g => g.id === id)!;
  const inParens = [...entry.term.matchAll(/\(([^)]*)\)/g)].flatMap(m => [m[1], ...m[1].split('/')]);
  const label = entry.term.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const spelledOut = (entry.aliases ?? []).filter(a => /\s/.test(a));
  return [...inParens, label, ...spelledOut]
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 2 && s !== key.toLowerCase());
};

/**
 * `term` is expanded in `chapter`'s opening: `TERM (its glossary expansion)`, or the guide's
 * Thai-name-first pattern `ชื่อไทย (TERM)` (audit §4.1: `หนี้ทางเทคนิค (Technical Debt)`), or a
 * resolvable term marker on it.
 */
const openingExpands = (chapter: Chapter, term: string) => {
  const ids = resolveTerm(term);
  const t = escapeRe(term);
  const after = chapter.chapterOpening.match(new RegExp(`(?<![A-Za-z0-9])${t}\\s*\\(([^)]*)\\)`));
  if (after && ids.some(id => expansionsOf(id, term).some(exp => after[1].toLowerCase().includes(exp)))) return true;
  if (new RegExp(`[^\\s(]\\s*\\(\\s*${t}\\s*\\)`).test(chapter.chapterOpening)) return true;
  const marked = markerIdsOf(heroTerms(chapter).chapterOpening);
  return ids.some(id => marked.has(id));
};

/** Every abbreviation occurrence of one chapter, in beginner Core render order, and whether that occurrence is defined. */
const chapterEvents = (chapterId: string): TrackEvent[] => {
  const chapter = CHAPTERS.find(c => c.id === chapterId)!;
  const marked = markedByField(chapter);
  const nth = new Map<string, number>();
  return heroInRenderOrder(chapter, beginnerVisibleTexts(chapter)).flatMap(({ field, text }) => {
    if (FOLDED_FOR_BEGINNERS.has(field)) return [];
    const markerIds = new Set<string>();
    const fieldTexts = marked.get(field);
    if (fieldTexts) {
      const i = nth.get(field) ?? 0;
      nth.set(field, i + 1);
      const markedText = fieldTexts[i] ?? '';
      // The walk and `TERM_FIELDS` must name the same string, or the guard would credit the wrong marker.
      if (visibleText(markedText) !== visibleText(text)) throw new Error(`${chapterId}/${field}[${i}]: marked walk out of step with TERM_FIELDS`);
      for (const m of markedText.matchAll(MARKER_ID_RE)) markerIds.add(m[1]);
    }
    const terms = [...extractAbbreviations(text), ...extractTrackedTerms(text)];
    return terms.map(term => {
      const isCard = field === 'jargonList.term' && namesTerm(text, term);
      // The strict Phase 4 check: the opening must expand this term, not just follow it with any parenthetical.
      const byOpening = HEADING_FIELDS.has(field) && openingExpands(chapter, term);
      return { term, at: `${chapterId}/${field}`, defined: definedIn_(term, text, markerIds) || isCard || byOpening };
    });
  });
};

const EVENTS = new Map(CHAPTERS.map(c => [c.id, chapterEvents(c.id)]));

/** Chapters (guide order) where `term` is defined at all, for the failure message. */
const definedIn = (term: string) =>
  CHAPTERS.filter(c => EVENTS.get(c.id)!.some(e => e.term === term && e.defined)).map(c => c.id);

/** One line per abbreviation whose first appearance in `track` has no definition at or before it. */
function trackGaps(track: TrackKey): { term: string; line: string }[] {
  const ids = TRACK_CHAPTER_NUMS[track].map(num => CHAPTERS.find(c => c.num === num)!.id);
  const first = new Map<string, TrackEvent>();
  const laterDefinition = new Map<string, string>();
  for (const event of ids.flatMap(id => EVENTS.get(id)!)) {
    const firstEvent = first.get(event.term);
    if (!firstEvent) first.set(event.term, event);
    else if (!firstEvent.defined && event.defined && !laterDefinition.has(event.term)) laterDefinition.set(event.term, event.at);
  }
  return [...first.values()]
    .filter(e => !e.defined)
    .map(({ term, at }) => {
      const later = laterDefinition.get(term);
      if (later) return { term, line: `track ${track}: "${term}" first seen at ${at}, defined only later at ${later}` };
      const elsewhere = definedIn(term).filter(id => !ids.includes(id));
      return {
        term,
        line: elsewhere.length > 0
          ? `track ${track}: "${term}" first seen at ${at}, defined only in ${elsewhere.join(', ')} (not in this track)`
          : `track ${track}: "${term}" first seen at ${at}, never defined`,
      };
    });
}

/**
 * What the v2 walk still finds, pinned literally per track and split by cause. This is a ratchet,
 * not an allowance: the assertion is equality, so a new gap fails (a regression) and a closed gap
 * fails too (update the list on purpose).
 * - `guardrailLimited`: the term has a glossary entry, but its first use in the track sits where no
 *   marker is placed — a core-concept heading, or a field not wired yet (`diagramTitle`,
 *   `diagramDescription`, diagram content blocks). Title, subtitle and enTerm terms are defined by
 *   the chapter opening under them (Phase 4, `HEADING_FIELDS`), which closed 16 / 13 / 19 / 12 down
 *   to 2 / 1 / 5 / 2 — the s1 opening also names BA, UX and QA, s11's FAQ, s18's KR.
 * - `missingFromGlossary`: no glossary entry resolves the term, so nothing could ever mark it. A
 *   cheap content fix: add the entry. Empty since D20/D21 — every earlier "never defined" line
 *   (SA, SMS, OTP, QR, Refactor, ...) resolves, and is now marked in a dialogue line or arrow chain.
 */
const KNOWN_GAPS_V2: Record<TrackKey, { guardrailLimited: readonly string[]; missingFromGlossary: readonly string[] }> = {
  beginner: {
    guardrailLimited: [
      'track beginner: "FURPS+" first seen at s4/coreConcepts.heading, never defined',
      'track beginner: "Gate" first seen at s6/diagramDescription, never defined',
    ],
    missingFromGlossary: [],
  },
  experienced: {
    guardrailLimited: [
      'track experienced: "Gate" first seen at s6/diagramDescription, never defined',
    ],
    missingFromGlossary: [],
  },
  biz: {
    guardrailLimited: [
      'track biz: "FURPS+" first seen at s4/coreConcepts.heading, never defined',
      'track biz: "Gate" first seen at s6/diagramDescription, never defined',
      'track biz: "L1" first seen at s10/diagramTitle, defined only in s5 (not in this track)',
      'track biz: "L2" first seen at s10/diagramTitle, defined only in s5 (not in this track)',
      'track biz: "L3" first seen at s10/diagramTitle, never defined',
    ],
    missingFromGlossary: [],
  },
  eng: {
    guardrailLimited: [
      'track eng: "FURPS+" first seen at s4/coreConcepts.heading, never defined',
      'track eng: "SLO" first seen at s19/coreConcepts.heading, defined only later at s19/coreConcepts.detail',
    ],
    missingFromGlossary: [],
  },
};

/** A track's gap lines, split the way `KNOWN_GAPS_V2` is. */
const gapsByCause = (track: TrackKey) => ({
  guardrailLimited: trackGaps(track).filter(g => resolveTerm(g.term).length > 0).map(g => g.line),
  missingFromGlossary: trackGaps(track).filter(g => resolveTerm(g.term).length === 0).map(g => g.line),
});

describe('term coverage v2: a definition at or before first use, per reading track', () => {
  it.each(Object.keys(TRACK_CHAPTER_NUMS) as TrackKey[])('track %s: exactly the pinned gaps, no new one', track => {
    expect(gapsByCause(track)).toEqual(KNOWN_GAPS_V2[track]);
  });

  it('an inline marker counts as a definition at the point of use (acceptance 1, 2, 3)', () => {
    const at = (chapterId: string, term: string, field: string) =>
      EVENTS.get(chapterId)!.find(e => e.term === term && e.at === `${chapterId}/${field}`);
    expect(at('s1', 'PM', 'beginnerPrimer.whatIsIt')?.defined).toBe(true); // D20: the arrow chain
    expect(at('s18', 'KR', 'perspectives.measuredBy')?.defined).toBe(true);
    expect(at('s11', 'KPI', 'chapterOpening')?.defined).toBe(true); // expanded in the opening, above the takeaway
    expect(trackGaps('experienced').some(g => g.term === 'KPI')).toBe(false);
  });

  it('eng track: Sprint and PM resolve at first contact (verification 4, D20, D21)', () => {
    const engGaps = trackGaps('eng').map(g => g.term);
    expect(engGaps).not.toContain('Sprint'); // first met in s16's dialogue line, now marked there
    expect(engGaps).not.toContain('PM'); // first met in s1's arrow chain
  });

  // A headline number, not the audit's metric: per track, the gap lines whose term gets no marker,
  // expansion or jargon card anywhere in the track ("never defined" and "not in this track"), in the
  // beginner view modelled above. Audit §2.3's 11 / 9 / 10 / 10 counted other fields and states, so
  // the two are not comparable.
  it('terms a track never defines anywhere, per track', () => {
    const never = (track: TrackKey) => trackGaps(track).filter(g => !g.line.includes('defined only later')).length;
    expect({ beginner: never('beginner'), experienced: never('experienced'), biz: never('biz'), eng: never('eng') })
      .toEqual({ beginner: 2, experienced: 1, biz: 5, eng: 1 });
  });
});

/**
 * Phase 4 (term-definitions spec P4.2, tests): the chapter opening is the definition of the
 * chapter's own headline. The mechanical half only — whether the line is true, plain and worth
 * reading is the owner's review (D18).
 */
describe('chapter openings (Phase 4)', () => {
  const HEADLINE_FIELDS = ['title', 'subtitle', 'enTerm', 'keyTakeaway'] as const;

  const headlineAbbreviations = (chapter: Chapter) =>
    [...new Set(HEADLINE_FIELDS.flatMap(f => (chapter[f] ? extractAbbreviations(chapter[f]!) : [])))];

  it('every abbreviation in a chapter\'s title, subtitle, enTerm or keyTakeaway is expanded in its opening', () => {
    const missing = CHAPTERS.flatMap(chapter =>
      headlineAbbreviations(chapter).filter(term => !openingExpands(chapter, term)).map(term => `${chapter.id}: ${term}`));
    expect(missing).toEqual([]);
  });

  it('every headline abbreviation has a glossary entry, so its expansion is checkable', () => {
    const unresolved = CHAPTERS.flatMap(chapter =>
      headlineAbbreviations(chapter).filter(term => resolveTerm(term).length === 0).map(term => `${chapter.id}: ${term}`));
    expect(unresolved).toEqual([]);
  });

  it('the checker is not vacuous: the 12 chapters with a headline abbreviation are all checked', () => {
    const checked = CHAPTERS.filter(c => headlineAbbreviations(c).length > 0).map(c => c.id);
    for (const id of ['s2', 's3', 's4', 's5', 's6', 's7', 's8', 's10', 's13', 's14', 's18', 's19']) expect(checked, id).toContain(id);
    const s4 = CHAPTERS.find(c => c.id === 's4')!;
    expect(openingExpands({ ...s4, chapterOpening: 'BA กับ NFR' }, 'NFR')).toBe(true); // bare -> auto-marked, still a definition
    expect(openingExpands({ ...s4, chapterOpening: '[[!g:*]]BA กับ NFR' }, 'NFR')).toBe(false); // opted out and bare
    expect(openingExpands({ ...s4, chapterOpening: '[[!g:*]]NFR (ระบบเร็วไหม)' }, 'NFR')).toBe(false); // a gloss that is not the expansion
    // The heading rule (`HEADING_FIELDS`) uses this same check, so a loose gloss on a tracked term does not close a heading gap either.
    expect(definedIn_('Agile', 'Agile (ทำเร็ว)', new Set())).toBe(true);
    expect(openingExpands({ ...s4, chapterOpening: '[[!g:*]]Agile (ทำเร็ว)' }, 'Agile')).toBe(false);
  });

  it('s10 expands SRE, SLA and SLO in full (acceptance 3)', () => {
    const s10 = CHAPTERS.find(c => c.id === 's10')!.chapterOpening;
    expect(s10).toContain('SRE (Site Reliability Engineering)');
    expect(s10).toContain('SLA (Service Level Agreement)');
    expect(s10).toContain('SLO (Service Level Objective)');
  });

  it('s13\'s opening is plain Thai, not the enTerm (acceptance 4)', () => {
    const s13 = CHAPTERS.find(c => c.id === 's13')!.chapterOpening;
    expect(s13).not.toContain('Augmented');
    expect(s13).toContain('SDLC (Software Development Life Cycle)');
  });

  /**
   * Weak by construction (spec P4 tests): it catches an empty or boilerplate line, not a bad one.
   * Parentheticals are removed first, so `Site Reliability Engineering` cannot pass for the promise.
   */
  it('every opening names the guide\'s promise or links a chapter', () => {
    const PROMISE_PHRASES = ['สองโลก', 'Business', 'Engineering'];
    const unconnected = CHAPTERS.filter(c => {
      const text = c.chapterOpening.replace(/\([^)]*\)/g, ' ');
      return !/\[\[s\d+\|/.test(text) && !PROMISE_PHRASES.some(p => text.includes(p));
    }).map(c => c.id);
    expect(unconnected).toEqual([]);
  });

  it('no opening points at "the previous chapter": reading order is per track (D14)', () => {
    const trackBound = CHAPTERS.filter(c => /บทก่อน|บทที่แล้ว|บทที่ผ่านมา/.test(c.chapterOpening)).map(c => c.id);
    expect(trackBound).toEqual([]);
  });
});
