import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { CATEGORY_SIDE, GLOSSARY, GLOSSARY_CATEGORIES, sortTermsForRole, termSide, type GlossaryTerm } from './glossary';
import { beginnerVisibleTexts, glossaryKeys, namesTerm } from './termInventory';

/** The abbreviations the term-definitions spec added in Phase 2 (P2.1). */
const PHASE2_TERM_IDS = [
  'slo', 'sre', 'qa', 'ba', 'kr', 'sprint', 'agile', 'waterfall', 'quality-gate', 'test-pyramid',
  'refactoring', 'microservices', 'monolith', 'ux-ui', 'furps-plus', 'kiss', 'erd', 'json', 'faq',
  'otp', 'sms', 'qr-code', 'availability-zone', 'sketch', 'api', 'sa',
];

/**
 * Attributions the cited chapter teaches without ever writing the term (D19's untestable half):
 * s10 covers customer retention in Thai only (s4's "Retention" is data retention, a different
 * thing), s18/s9 argue about return on investment without writing `ROI`, and s7 is the QA chapter
 * `UAT` belongs to although only s12's role table writes the abbreviation. Every other entry must
 * cite a chapter that names it.
 */
const TOPICAL_ATTRIBUTIONS = ['retention -> s10', 'roi -> s18', 'roi -> s9', 'uat -> s7'];

/**
 * Attributions whose chapter does name the term, but only outside beginner-visible content —
 * an Apply/Deep block, a process-flow row, a pitfall. The chip is still correct (the chapter is
 * where the term lives) yet a beginner lands on a screen the term is not on, so the set is pinned
 * here: it may shrink when the copy pulls a term into the primer or a jargon card, and a new pair
 * has to be added deliberately. See `review-round3-fixes.md` issue 3.
 */
const BEGINNER_INVISIBLE_ATTRIBUTIONS = [
  'elicitation -> s14', 'sow-scope-agreement -> s14', 'stakeholder -> s11', 'change-request -> s14',
  'module-function-mapping -> s5', 'use-case-diagram -> s5', 'sequence-diagram -> s5',
  'roadmap -> s2', 'backlog -> s2', 'over-engineering -> s14', 'babok -> s14', 'pmbok-pmp -> s14',
  'togaf -> s14', 'adr -> s6', 'rfc -> s6', 'trunk-based-development -> s6', 'pull-request -> s6',
  'test-plan -> s7', 'test-coverage -> s7', 'environment -> s8', 'design-handoff -> s3',
  'webhook -> s15', 'idempotency -> s15', 'ba -> s14', 'sa -> s5',
];

/** What a beginner sees in a chapter (`termInventory.ts` field list) — the scope D19 names. */
const BEGINNER_CONTENT = new Map(CHAPTERS.map(c => [c.id, beginnerVisibleTexts(c).map(o => o.text).join('\n')]));
/** Everything in the chapter object, beginner-visible or not. */
const WHOLE_CONTENT = new Map(CHAPTERS.map(c => [c.id, JSON.stringify(c)]));

/** Whole-word, so a 2-3 letter key cannot be "named" by `backlog`, `based` or `usability`. */
const namesEntry = (text: string, term: GlossaryTerm) => glossaryKeys(term).some(k => namesTerm(text, k));

const BUSINESS_TERM_IDS = [
  'revenue',
  'gross-margin',
  'cac',
  'ltv',
  'burn-rate',
  'runway',
  'p-and-l',
  'roi',
  'opportunity-cost',
  'fiscal-year-budget-cycle',
  'sales-pipeline',
  'quota',
  'service-credit',
  'go-to-market',
];

const EXPLICIT_BIZ_IDS = ['brd', 'sow-scope-agreement', 'sla', 'stakeholder', 'okr-kpi', 'retention', 'churn', 'adoption-rate'];

describe('glossary data', () => {
  it('every relatedChapterIds id exists', () => {
    const ids = new Set(CHAPTERS.map(c => c.id));
    for (const term of GLOSSARY) {
      for (const chId of term.relatedChapterIds) expect(ids.has(chId), `${term.id} -> ${chId}`).toBe(true);
    }
  });

  it('term ids are unique', () => {
    const ids = GLOSSARY.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has a business category with exactly the 14 business terms', () => {
    expect(GLOSSARY_CATEGORIES.some(c => c.key === 'business')).toBe(true);
    const business = GLOSSARY.filter(t => t.category === 'business').map(t => t.id);
    expect(business.sort()).toEqual([...BUSINESS_TERM_IDS].sort());
  });

  it('the 14 business terms are biz-side, app-origin, and have a plain line', () => {
    for (const id of BUSINESS_TERM_IDS) {
      const term = GLOSSARY.find(t => t.id === id);
      expect(term, id).toBeDefined();
      expect(termSide(term!)).toBe('biz');
      expect(term!.origin).toBe('app');
      expect(term!.plain?.trim().length ?? 0, id).toBeGreaterThan(0);
      expect(term!.relatedChapterIds.length, id).toBeGreaterThan(0);
    }
  });

  it('business terms point at the business chapters s16-s19', () => {
    for (const id of BUSINESS_TERM_IDS) {
      const term = GLOSSARY.find(t => t.id === id)!;
      expect(['s16', 's17', 's18', 's19']).toContain(term.relatedChapterIds[0]);
    }
  });

  it('no entry cites a chapter whose beginner-visible content does not name it (D19, round-3 I-10)', () => {
    const wrong: string[] = [];
    for (const term of GLOSSARY) {
      // A term no chapter writes anywhere can only be attributed topically: nothing to check.
      if (!CHAPTERS.some(c => namesEntry(WHOLE_CONTENT.get(c.id)!, term))) continue;
      for (const chapterId of term.relatedChapterIds) {
        const pair = `${term.id} -> ${chapterId}`;
        if (namesEntry(BEGINNER_CONTENT.get(chapterId) ?? '', term)) continue;
        if (TOPICAL_ATTRIBUTIONS.includes(pair) || BEGINNER_INVISIBLE_ATTRIBUTIONS.includes(pair)) continue;
        const named = CHAPTERS.filter(c => namesEntry(BEGINNER_CONTENT.get(c.id)!, term)).map(c => c.id);
        wrong.push(`${pair} (beginner-visible in: ${named.join(' ') || 'no chapter'})`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('every topical attribution is still one the chapter really does not name', () => {
    for (const pair of TOPICAL_ATTRIBUTIONS) {
      const [id, chapterId] = pair.split(' -> ');
      const term = GLOSSARY.find(t => t.id === id);
      expect(term, id).toBeDefined();
      expect(term!.relatedChapterIds, pair).toContain(chapterId);
      expect(namesEntry(WHOLE_CONTENT.get(chapterId) ?? '', term!), pair).toBe(false);
    }
  });

  it('every beginner-invisible attribution is still exactly that: named, but not where a beginner looks', () => {
    for (const pair of BEGINNER_INVISIBLE_ATTRIBUTIONS) {
      const [id, chapterId] = pair.split(' -> ');
      const term = GLOSSARY.find(t => t.id === id);
      expect(term, id).toBeDefined();
      expect(term!.relatedChapterIds, pair).toContain(chapterId);
      expect(namesEntry(WHOLE_CONTENT.get(chapterId) ?? '', term!), `${pair} named in chapter`).toBe(true);
      expect(namesEntry(BEGINNER_CONTENT.get(chapterId) ?? '', term!), `${pair} beginner-visible`).toBe(false);
      expect(TOPICAL_ATTRIBUTIONS, pair).not.toContain(pair);
    }
  });

  it('User story points at the chapters that teach it, not chapter 4 (P2.5)', () => {
    const term = GLOSSARY.find(t => t.id === 'user-story')!;
    expect(term.relatedChapterIds).toEqual(['s14', 's2']);
  });

  it('the Phase 2 abbreviations are app-origin with a plain line and at least one alias', () => {
    for (const id of PHASE2_TERM_IDS) {
      const term = GLOSSARY.find(t => t.id === id);
      expect(term, id).toBeDefined();
      expect(term!.origin, id).toBe('app');
      expect(term!.plain?.trim().length ?? 0, id).toBeGreaterThan(0);
      expect(term!.aliases?.length ?? 0, id).toBeGreaterThan(0);
      expect(term!.relatedChapterIds.length, id).toBeGreaterThan(0);
    }
  });

  it('no alias repeats its own entry\'s term, and no two entries share an alias', () => {
    const owners = new Map<string, string[]>();
    for (const term of GLOSSARY) {
      for (const alias of term.aliases ?? []) {
        expect(alias.toLowerCase(), term.id).not.toBe(term.term.toLowerCase());
        const key = alias.toLowerCase();
        owners.set(key, [...(owners.get(key) ?? []), term.id]);
      }
    }
    const shared = [...owners].filter(([, ids]) => ids.length > 1).map(([a, ids]) => `${a}: ${ids.join(', ')}`);
    expect(shared).toEqual([]);
  });

  it('money amounts use baht, never dollars', () => {
    for (const term of GLOSSARY.filter(t => t.category === 'business')) {
      expect([term.definition, term.plain ?? '', term.example ?? ''].join(' ')).not.toContain('$');
    }
  });
});

describe('termSide', () => {
  it('maps product and business categories to biz, the rest to eng', () => {
    expect(CATEGORY_SIDE.product).toBe('biz');
    expect(CATEGORY_SIDE.business).toBe('biz');
    for (const cat of GLOSSARY_CATEGORIES) {
      if (cat.key !== 'product' && cat.key !== 'business') expect(CATEGORY_SIDE[cat.key]).toBe('eng');
    }
  });

  it('explicit side wins over the category side', () => {
    for (const id of EXPLICIT_BIZ_IDS) {
      const term = GLOSSARY.find(t => t.id === id);
      expect(term, id).toBeDefined();
      expect(term!.side).toBe('biz');
      expect(termSide(term!)).toBe('biz');
    }
  });

  it('an engineering term stays eng', () => {
    expect(termSide(GLOSSARY.find(t => t.id === 'idempotency')!)).toBe('eng');
  });
});

describe('sortTermsForRole', () => {
  it('role eng puts every biz term first', () => {
    const sorted = sortTermsForRole(GLOSSARY, 'eng');
    const lastBiz = sorted.map(termSide).lastIndexOf('biz');
    const firstEng = sorted.map(termSide).indexOf('eng');
    expect(lastBiz).toBeLessThan(firstEng);
  });

  it('role biz puts every eng term first', () => {
    const sorted = sortTermsForRole(GLOSSARY, 'biz');
    expect(sorted.map(termSide).lastIndexOf('eng')).toBeLessThan(sorted.map(termSide).indexOf('biz'));
  });

  it('is stable within a side and keeps every term', () => {
    const sorted = sortTermsForRole(GLOSSARY, 'eng');
    expect(sorted).toHaveLength(GLOSSARY.length);
    const bizOriginal = GLOSSARY.filter(t => termSide(t) === 'biz');
    expect(sorted.slice(0, bizOriginal.length)).toEqual(bizOriginal);
  });

  it('role null keeps the current order', () => {
    expect(sortTermsForRole(GLOSSARY, null)).toEqual(GLOSSARY);
  });
});
