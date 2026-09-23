import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { CHAPTER_PERSPECTIVES } from './chapterPerspectives';
import { ROLE_MINDSETS } from './roleMindsets';
import { ROLES } from './rolePerspective';
import type { SideView } from '../types';

// Budgets from docs/specs/2026-09-22-role-perspective.md P2.3 (characters, [...s].length).
// An author opt-out (`[[!g:id]]`, term-definitions guardrail 7) never renders, so it costs no budget.
const len = (s: string) => [...s.replace(/\[\[!g:(?:[a-z0-9-]+|\*)\]\]/g, '')].length;

/** Every string in one side view, labelled by field, in a stable order. */
function fields(view: SideView): [string, string, number][] {
  return [
    ['measuredBy', view.measuredBy, 90],
    ...view.fears.map((f, i): [string, string, number] => [`fears[${i}]`, f, 70]),
    ...view.saysVsHears.flatMap((row, i): [string, string, number][] => [
      [`saysVsHears[${i}].youSay`, row.youSay, 60],
      [`saysVsHears[${i}].theyHear`, row.theyHear, 70],
      [`saysVsHears[${i}].sayInstead`, row.sayInstead, 80],
    ]),
    ...view.askThem.map((q, i): [string, string, number] => [`askThem[${i}]`, q, 70]),
  ];
}

const mindsetStrings = new Set(
  Object.values(ROLE_MINDSETS).flatMap(m => [
    m.title, m.howTheyMeasureSuccess, m.unspokenThoughts, m.bridgeAdvice,
    ...m.whatTheyCareAboutMost, ...m.whatKeepsThemUpAtNight,
  ]),
);

describe('chapter perspectives', () => {
  it('every chapter carries both sides, merged into CHAPTERS', () => {
    for (const ch of CHAPTERS) {
      expect(ch.perspectives, ch.id).toBeDefined();
      expect(ch.perspectives).toBe(CHAPTER_PERSPECTIVES[ch.id]);
      for (const r of ROLES) expect(ch.perspectives?.[r], `${ch.id}.${r}`).toBeDefined();
    }
  });

  it('every field is non-empty and within budget; askThem has 2-3 items', () => {
    const v: string[] = [];
    for (const ch of CHAPTERS) for (const r of ROLES) {
      const view = ch.perspectives![r];
      if (view.fears.length !== 2) v.push(`${ch.id}.${r}.fears: ${view.fears.length} items`);
      if (view.saysVsHears.length !== 2) v.push(`${ch.id}.${r}.saysVsHears: ${view.saysVsHears.length} rows`);
      if (view.askThem.length < 2 || view.askThem.length > 3) v.push(`${ch.id}.${r}.askThem: ${view.askThem.length} items`);
      for (const [name, value, max] of fields(view)) {
        const where = `${ch.id}.${r}.${name}`;
        if (value.trim() === '') v.push(`${where}: empty`);
        if (len(value) > max) v.push(`${where}: ${len(value)} > ${max}`);
        if (value.includes('$')) v.push(`${where}: contains a $ amount`);
      }
    }
    expect(v).toEqual([]);
  });

  it('no field copies a generic ROLE_MINDSETS line', () => {
    for (const ch of CHAPTERS) for (const r of ROLES) {
      for (const [name, value] of fields(ch.perspectives![r])) {
        expect(mindsetStrings.has(value), `${ch.id}.${r}.${name}`).toBe(false);
      }
    }
  });

  it('the biz and eng views of one chapter share no identical string', () => {
    for (const ch of CHAPTERS) {
      const biz = new Set(fields(ch.perspectives!.biz).map(f => f[1]));
      const shared = fields(ch.perspectives!.eng).map(f => f[1]).filter(s => biz.has(s));
      expect(shared, ch.id).toEqual([]);
    }
  });
});
