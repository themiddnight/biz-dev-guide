import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';

// Length budgets and bans from docs/specs/2026-09-22-concise-copy.md §3–§5 and R5.
// An author opt-out (`[[!g:id]]`, term-definitions guardrail 7) never renders, so it costs no budget.
const len = (s: string) => [...s.replace(/\[\[!g:(?:[a-z0-9-]+|\*)\]\]/g, '')].length;
const BANNED_OPENERS = ['ทำความเข้าใจ', 'หัวใจของ', 'กฎเหล็ก', 'ศิลปะการ', 'ทำการ'];

type Violation = string;

function over(violations: Violation[], where: string, value: string | undefined, max: number) {
  if (value !== undefined && len(value) > max) violations.push(`${where}: ${len(value)} > ${max}`);
}

function bannedOpener(violations: Violation[], where: string, value: string) {
  const hit = BANNED_OPENERS.find((w) => value.trimStart().startsWith(w));
  if (hit) violations.push(`${where}: starts with "${hit}"`);
}

describe('copy budgets', () => {
  it('keeps titles, hero, primer and jargon within budget', () => {
    const v: Violation[] = [];
    for (const ch of CHAPTERS) {
      const at = (field: string) => `${ch.id}.${field}`;
      over(v, at('title'), ch.title, 25);
      if (/[()]/.test(ch.title)) v.push(`${at('title')}: contains parentheses`);
      over(v, at('enTerm'), ch.enTerm, 24);
      over(v, at('subtitle'), ch.subtitle, 70);
      bannedOpener(v, at('subtitle'), ch.subtitle);
      over(v, at('plainAnalogy'), ch.plainAnalogy, 120);
      if (ch.heroFigure) {
        // Hero chapters show the caption and the analogy as single lines under the figure.
        over(v, at('heroFigure.caption'), ch.heroFigure.caption, 60);
        if (ch.heroFigure.caption.includes('\n')) v.push(`${at('heroFigure.caption')}: contains a newline`);
        bannedOpener(v, at('heroFigure.caption'), ch.heroFigure.caption);
        over(v, at('plainAnalogy (hero)'), ch.plainAnalogy, 80);
        // Seat lines (role-perspective spec P3.2): one line each, distinct, not a caption repeat.
        const { seats, caption } = ch.heroFigure;
        for (const side of ['biz', 'eng'] as const) {
          const where = at(`heroFigure.seats.${side}`);
          const line = seats?.[side];
          if (!line) {
            v.push(`${where}: missing`);
            continue;
          }
          over(v, where, line, 100);
          if (line.includes('\n')) v.push(`${where}: contains a newline`);
          bannedOpener(v, where, line);
          if (line === caption) v.push(`${where}: repeats the caption`);
        }
        if (seats && seats.biz === seats.eng) v.push(`${at('heroFigure.seats')}: biz equals eng`);
      }
      over(v, at('keyTakeaway'), ch.keyTakeaway, 100);
      over(v, at('businessNote'), ch.businessNote, 100);
      over(v, at('engineerNote'), ch.engineerNote, 100);
      bannedOpener(v, at('businessNote'), ch.businessNote);
      bannedOpener(v, at('engineerNote'), ch.engineerNote);
      over(v, at('beginnerPrimer.whatIsIt'), ch.beginnerPrimer?.whatIsIt, 160);
      over(v, at('beginnerPrimer.whyItMatters'), ch.beginnerPrimer?.whyItMatters, 160);
      over(v, at('beginnerPrimer.realWorldScenario'), ch.beginnerPrimer?.realWorldScenario, 220);
      ch.realWorldExamples?.forEach((ex, i) => over(v, at(`realWorldExamples[${i}].title`), ex.title, 32));
      ch.jargonList?.forEach((j) => {
        over(v, at(`jargon[${j.term}].humanTranslation`), j.humanTranslation, 120);
        over(v, at(`jargon[${j.term}].formalDefinition`), j.formalDefinition, 140);
        over(v, at(`jargon[${j.term}].meetingExample`), j.meetingExample, 160);
      });
      // Other-side views (role-perspective spec P2.3).
      for (const side of ['biz', 'eng'] as const) {
        const view = ch.perspectives?.[side];
        if (!view) continue;
        const pv = (f: string) => at(`perspectives.${side}.${f}`);
        over(v, pv('measuredBy'), view.measuredBy, 90);
        view.fears.forEach((f, i) => over(v, pv(`fears[${i}]`), f, 70));
        view.saysVsHears.forEach((row, i) => {
          over(v, pv(`saysVsHears[${i}].youSay`), row.youSay, 60);
          over(v, pv(`saysVsHears[${i}].theyHear`), row.theyHear, 70);
          over(v, pv(`saysVsHears[${i}].sayInstead`), row.sayInstead, 80);
        });
        view.askThem.forEach((q, i) => over(v, pv(`askThem[${i}]`), q, 70));
      }
    }
    expect(v).toEqual([]);
  });
});
