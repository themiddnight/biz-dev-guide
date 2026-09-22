import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';

// Length budgets and bans from docs/specs/2026-09-22-concise-copy.md §3–§5 and R5.
const len = (s: string) => [...s].length;
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
    }
    expect(v).toEqual([]);
  });
});
