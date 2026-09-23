import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { GLOSSARY } from './glossary';
import {
  beginnerVisibleTexts, extractAbbreviations, extractTrackedTerms, glossaryKeys, namesTerm, resolveTerm,
} from './termInventory';
import { searchGlossaryTerms } from '../lib/glossarySearch';

/**
 * The owner's guard (term-definitions spec D11), v1: the weaker "a definition exists at all"
 * form. Every abbreviation a beginner meets must resolve to exactly one glossary entry, or be
 * defined where it is used — the jargon card of the chapter that uses it, or an expansion in
 * parentheses in the same string. Phase 3 upgrades this to the at-or-before-first-use form
 * that walks each reading track in order.
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
