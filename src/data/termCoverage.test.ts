import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { GLOSSARY } from './glossary';
import {
  beginnerVisibleTexts, extractAbbreviations, extractTrackedTerms, glossaryKeys, resolveTerm,
} from './termInventory';

/**
 * The owner's guard (term-definitions spec D11), v1: the weaker "a definition exists at all"
 * form. Every abbreviation a beginner meets must resolve to exactly one glossary entry, or be
 * defined where it is used — the jargon card of the chapter that uses it, or an expansion in
 * parentheses in the same string. Phase 3 upgrades this to the at-or-before-first-use form
 * that walks each reading track in order.
 */

/** term -> `chapter/field` of its first beginner-visible appearance, in chapter order. */
const firstSeen = (() => {
  const seen = new Map<string, string>();
  for (const chapter of CHAPTERS) {
    for (const occurrence of beginnerVisibleTexts(chapter)) {
      const terms = [...extractAbbreviations(occurrence.text), ...extractTrackedTerms(occurrence.text)];
      for (const term of terms) {
        if (!seen.has(term)) seen.set(term, `${occurrence.chapterId}/${occurrence.field}`);
      }
    }
  }
  return seen;
})();

const JARGON_CARD_TERMS = CHAPTERS.flatMap(c => (c.jargonList ?? []).map(j => j.term));
const BEGINNER_TEXTS = CHAPTERS.flatMap(c => beginnerVisibleTexts(c).map(o => o.text));

const wordBoundary = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Defined where it is used: the subject of a jargon card, or expanded in parentheses. */
const definedInPlace = (term: string) => {
  const t = wordBoundary(term);
  if (JARGON_CARD_TERMS.some(card => new RegExp(`(?<![A-Za-z0-9])${t}(?![A-Za-z0-9])`).test(card))) return true;
  const expanded = new RegExp(`(?<![A-Za-z0-9])${t}\\s*\\(|\\(\\s*${t}\\s*\\)`);
  return BEGINNER_TEXTS.some(text => expanded.test(text));
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

describe('beginner-visible abbreviation coverage', () => {
  it('every abbreviation a beginner meets has a definition it can reach', () => {
    const undefinedTerms = [...firstSeen]
      .filter(([term]) => new Set(resolveTerm(term)).size !== 1 && !definedInPlace(term))
      .map(([term, where]) => `${term} -> ${where}`);
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
