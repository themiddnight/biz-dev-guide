import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { CATEGORY_SIDE, GLOSSARY, GLOSSARY_CATEGORIES, sortTermsForRole, termSide } from './glossary';

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
