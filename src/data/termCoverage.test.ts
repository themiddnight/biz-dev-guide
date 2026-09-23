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
      const t = escapeRe(term);
      const expanded = new RegExp(`(?<![A-Za-z0-9])${t}\\s*\\(|\\(\\s*${t}\\s*\\)`).test(text);
      const isCard = field === 'jargonList.term' && namesTerm(text, term);
      const isMarked = resolveTerm(term).some(id => markerIds.has(id));
      return { term, at: `${chapterId}/${field}`, defined: expanded || isCard || isMarked };
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
 *   marker is placed — a title, subtitle, enTerm or heading (Phase 4's chapter openings are the
 *   planned fix), or a field not wired yet (`formalDefinition`, `diagramDescription`, diagram
 *   content blocks). Fixing one of these means wiring a field or rewriting an opening, not content.
 * - `missingFromGlossary`: no glossary entry resolves the term, so nothing could ever mark it. A
 *   cheap content fix: add the entry. Empty since D20/D21 — every earlier "never defined" line
 *   (SA, SMS, OTP, QR, Refactor, ...) resolves, and is now marked in a dialogue line or arrow chain.
 */
const KNOWN_GAPS_V2: Record<TrackKey, { guardrailLimited: readonly string[]; missingFromGlossary: readonly string[] }> = {
  beginner: {
    guardrailLimited: [
      'track beginner: "QA" first seen at s1/jargonList.formalDefinition, defined only later at s1/coreConcepts.detail',
      'track beginner: "UX" first seen at s1/diagramDescription, defined only later at s3/beginnerPrimer.whatIsIt',
      'track beginner: "BA" first seen at s1/diagramDescription, defined only later at s4/beginnerPrimer.whatIsIt',
      'track beginner: "UX/UI" first seen at s3/title, never defined',
      'track beginner: "Sketch" first seen at s3/subtitle, defined only later at s3/keyTakeaway',
      'track beginner: "NFR" first seen at s4/title, defined only later at s4/beginnerPrimer.realWorldScenario',
      'track beginner: "FURPS+" first seen at s4/coreConcepts.heading, never defined',
      'track beginner: "DoR" first seen at s6/title, defined only later at s6/plainAnalogy',
      'track beginner: "DoD" first seen at s6/title, defined only later at s6/plainAnalogy',
      'track beginner: "Agile" first seen at s6/enTerm, defined only later at s6/beginnerPrimer.whatIsIt',
      'track beginner: "Gate" first seen at s6/diagramDescription, never defined',
      'track beginner: "Test Pyramid" first seen at s7/title, defined only later at s7/coreConcepts.heading',
      'track beginner: "Pyramid" first seen at s7/title, defined only later at s7/beginnerPrimer.whatIsIt',
      'track beginner: "FAQ" first seen at s11/coreConcepts.heading, never defined',
      'track beginner: "BRD" first seen at s14/subtitle, defined only later at s14/plainAnalogy',
      'track beginner: "ADR" first seen at s14/subtitle, defined only later at s14/plainAnalogy',
    ],
    missingFromGlossary: [],
  },
  experienced: {
    guardrailLimited: [
      'track experienced: "FAQ" first seen at s11/coreConcepts.heading, never defined',
      'track experienced: "QA" first seen at s1/jargonList.formalDefinition, defined only later at s1/coreConcepts.detail',
      'track experienced: "UX" first seen at s1/diagramDescription, defined only in s3 (not in this track)',
      'track experienced: "BA" first seen at s1/diagramDescription, defined only in s4 (not in this track)',
      'track experienced: "DoR" first seen at s6/title, defined only later at s6/plainAnalogy',
      'track experienced: "DoD" first seen at s6/title, defined only later at s6/plainAnalogy',
      'track experienced: "Agile" first seen at s6/enTerm, defined only later at s6/beginnerPrimer.whatIsIt',
      'track experienced: "Gate" first seen at s6/diagramDescription, never defined',
      'track experienced: "Tech Debt" first seen at s9/title, defined only in s15 (not in this track)',
      'track experienced: "Refactor" first seen at s9/title, defined only later at s9/perspectives.saysVsHears',
      'track experienced: "SDLC" first seen at s13/enTerm, defined only later at s13/beginnerPrimer.whatIsIt',
      'track experienced: "BRD" first seen at s14/subtitle, defined only later at s14/plainAnalogy',
      'track experienced: "ADR" first seen at s14/subtitle, defined only later at s14/plainAnalogy',
    ],
    missingFromGlossary: [],
  },
  biz: {
    guardrailLimited: [
      'track biz: "PM" first seen at s2/title, defined only later at s2/plainAnalogy',
      'track biz: "QA" first seen at s1/jargonList.formalDefinition, defined only later at s1/coreConcepts.detail',
      'track biz: "UX" first seen at s1/diagramDescription, defined only in s3 (not in this track)',
      'track biz: "BA" first seen at s1/diagramDescription, defined only later at s4/beginnerPrimer.whatIsIt',
      'track biz: "BRD" first seen at s14/subtitle, defined only later at s14/plainAnalogy',
      'track biz: "ADR" first seen at s14/subtitle, defined only later at s14/plainAnalogy',
      'track biz: "NFR" first seen at s4/title, defined only later at s4/beginnerPrimer.realWorldScenario',
      'track biz: "FURPS+" first seen at s4/coreConcepts.heading, never defined',
      'track biz: "DoR" first seen at s6/title, defined only later at s6/plainAnalogy',
      'track biz: "Agile" first seen at s6/enTerm, defined only later at s6/beginnerPrimer.whatIsIt',
      'track biz: "Gate" first seen at s6/diagramDescription, never defined',
      'track biz: "Tech Debt" first seen at s9/title, defined only in s15 (not in this track)',
      'track biz: "Refactor" first seen at s9/title, defined only later at s9/perspectives.saysVsHears',
      'track biz: "SRE" first seen at s10/title, defined only later at s10/beginnerPrimer.whatIsIt',
      'track biz: "SLO" first seen at s10/subtitle, defined only later at s10/keyTakeaway',
      'track biz: "L1" first seen at s10/diagramTitle, defined only in s5 (not in this track)',
      'track biz: "L2" first seen at s10/diagramTitle, defined only in s5 (not in this track)',
      'track biz: "L3" first seen at s10/diagramTitle, never defined',
      'track biz: "FAQ" first seen at s11/coreConcepts.heading, never defined',
    ],
    missingFromGlossary: [],
  },
  eng: {
    guardrailLimited: [
      'track eng: "QA" first seen at s1/jargonList.formalDefinition, defined only later at s1/coreConcepts.detail',
      'track eng: "UX" first seen at s1/diagramDescription, defined only in s3 (not in this track)',
      'track eng: "BA" first seen at s1/diagramDescription, defined only later at s4/beginnerPrimer.whatIsIt',
      'track eng: "OKR" first seen at s18/title, defined only later at s18/beginnerPrimer.whatIsIt',
      'track eng: "KPI" first seen at s18/title, defined only later at s18/beginnerPrimer.whatIsIt',
      'track eng: "KR" first seen at s18/jargonList.meetingExample, defined only later at s18/perspectives.measuredBy',
      'track eng: "NFR" first seen at s4/title, defined only later at s4/beginnerPrimer.realWorldScenario',
      'track eng: "FURPS+" first seen at s4/coreConcepts.heading, never defined',
      'track eng: "FAQ" first seen at s11/coreConcepts.heading, never defined',
      'track eng: "SLO" first seen at s19/coreConcepts.heading, defined only later at s19/coreConcepts.detail',
      'track eng: "Tech Debt" first seen at s9/title, defined only in s15 (not in this track)',
      'track eng: "Refactor" first seen at s9/title, defined only later at s9/perspectives.saysVsHears',
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
    expect(at('s11', 'KPI', 'keyTakeaway')?.defined).toBe(true);
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
      .toEqual({ beginner: 4, experienced: 5, biz: 8, eng: 4 });
  });
});
