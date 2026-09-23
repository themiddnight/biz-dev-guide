import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';

// Business-side chapters for engineers (role-perspective spec P4.1, P4.5).
const BUSINESS = [
  { id: 's16', num: 16, enTerm: 'Unit Economics' },
  { id: 's17', num: 17, enTerm: 'Fixed Deadlines' },
  { id: 's18', num: 18, enTerm: 'Opportunity Cost' },
  { id: 's19', num: 19, enTerm: 'Sales Cycle & SLA' },
];

const chapter = (id: string) => {
  const c = CHAPTERS.find((x) => x.id === id);
  if (!c) throw new Error(`missing ${id}`);
  return c;
};

describe('business chapters s16-s19', () => {
  it('are appended after s15 with nums 16-19', () => {
    expect(CHAPTERS.slice(-4).map((c) => c.id)).toEqual(BUSINESS.map((b) => b.id));
    for (const b of BUSINESS) {
      expect(chapter(b.id).num).toBe(b.num);
      expect(chapter(b.id).enTerm).toBe(b.enTerm);
    }
  });

  it.each(BUSINESS.map((b) => b.id))('%s is a business-home chapter', (id) => {
    const c = chapter(id);
    expect(c.home).toBe('biz');
    expect(c.roleTag).toBe('biz');
    expect(c.readTime).toBe('10 นาที');
  });

  it.each(BUSINESS.map((b) => b.id))('%s has the full section set and both side views', (id) => {
    const c = chapter(id);
    expect(c.beginnerPrimer?.whatIsIt.trim()).toBeTruthy();
    expect(c.beginnerPrimer?.whyItMatters.trim()).toBeTruthy();
    expect(c.beginnerPrimer?.realWorldScenario.trim()).toBeTruthy();
    expect(c.jargonList).toHaveLength(5);
    expect(c.realWorldExamples).toHaveLength(2);
    expect(c.dialogueExample?.wrongWay.text.trim()).toBeTruthy();
    expect(c.dialogueExample?.rightWay.text.trim()).toBeTruthy();
    expect(c.coreConcepts).toHaveLength(3);
    expect(c.realWorldWorkflow).toHaveLength(4);
    expect(c.checklist).toHaveLength(5);
    expect(c.commonPitfalls).toHaveLength(4);
    expect(c.perspectives?.biz).toBeDefined();
    expect(c.perspectives?.eng).toBeDefined();
  });

  it.each(BUSINESS.map((b) => b.id))('%s has no hero figure (P4.1)', (id) => {
    expect(chapter(id).heroFigure).toBeUndefined();
  });

  it.each(BUSINESS.map((b) => b.id))('%s uses ฿, never $', (id) => {
    expect(JSON.stringify(chapter(id))).not.toContain('$');
  });

  it('s16 carries the #A1024 refund P&L table inline after the primer', () => {
    const inline = (chapter('s16').contentSections ?? []).filter(
      (s) => s.placement === 'inline' && s.after === 'primer',
    );
    const tables = inline.flatMap((s) => s.blocks).filter((b) => b.kind === 'table');
    expect(tables).toHaveLength(1);
    const json = JSON.stringify(tables[0]);
    expect(json).toContain('#A1024');
    expect(json).toContain('ตัวเลขสมมติ');
    expect(json).toContain('฿');
  });
});
