import { describe, it, expect } from 'vitest';
import { QUIZ_QUESTIONS } from './quizQuestions';
import { CHAPTERS } from './chaptersData';
import { getQuizRound } from './quizRounds';
import type { QuizQuestion } from '../types';

const chapterIds = new Set(CHAPTERS.map((c) => c.id));
const chaptersFor = (role: 'eng' | 'biz') =>
  new Set(QUIZ_QUESTIONS.filter((q) => q.forRole === role).map((q) => q.chapterId));

describe('quiz questions', () => {
  it('has unique ids 1-20', () => {
    const ids = QUIZ_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it('every question has 4 options and exactly one correct', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.options, `q${q.id}`).toHaveLength(4);
      expect(q.options.filter((o) => o.isCorrect), `q${q.id}`).toHaveLength(1);
    }
  });

  // P2.1: every question must offer a route back to the chapter that teaches its answer.
  it('every question has a chapterId that exists in CHAPTERS', () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.chapterId, `q${q.id} has no chapterId`).toBeDefined();
      expect(chapterIds.has(q.chapterId!), `q${q.id} -> ${q.chapterId}`).toBe(true);
    }
  });

  it('the basics round points at the chapters that teach it (P2.1)', () => {
    const map: Record<number, string> = {
      1: 's2', 2: 's4', 3: 's11', 4: 's5', 5: 's7', 6: 's10', 7: 's9', 8: 's11',
    };
    for (const q of QUIZ_QUESTIONS.filter((q) => q.id <= 8)) {
      expect(q.chapterId, `q${q.id}`).toBe(map[q.id]);
    }
  });

  it('the 8 original questions are for both roles', () => {
    expect(QUIZ_QUESTIONS.filter((q) => q.id <= 8).every((q) => q.forRole === 'both')).toBe(true);
  });

  it('scenario questions 9-20: 6 eng as Dev, 6 biz, each mapped to a chapter, 25 XP', () => {
    const scenario = QUIZ_QUESTIONS.filter((q) => q.id >= 9);
    expect(scenario).toHaveLength(12);
    const eng = scenario.filter((q) => q.forRole === 'eng');
    const biz = scenario.filter((q) => q.forRole === 'biz');
    expect(eng).toHaveLength(6);
    expect(biz).toHaveLength(6);
    expect(eng.every((q) => q.role === 'Dev')).toBe(true);
    expect(biz.every((q) => ['PM', 'BA', 'Bridge'].includes(q.role))).toBe(true);
    expect(scenario.every((q) => q.chapterId && q.xp === 25)).toBe(true);
  });

  it('eng set covers s16, s17, s18, s19, s2 and s11', () => {
    const got = chaptersFor('eng');
    for (const id of ['s16', 's17', 's18', 's19', 's2', 's11']) expect(got.has(id), id).toBe(true);
  });

  it('biz set covers s6, s8, s9, s10, s13 and s4', () => {
    const got = chaptersFor('biz');
    for (const id of ['s6', 's8', 's9', 's10', 's13', 's4']) expect(got.has(id), id).toBe(true);
  });

  // P5.1 sets the budget for the new scenario questions; the original 8 predate it.
  it('scenario explanations are at most 160 characters', () => {
    const long = QUIZ_QUESTIONS.filter((q) => q.forRole !== 'both').flatMap((q) =>
      q.options.filter((o) => [...o.explanation].length > 160).map((o) => `q${q.id}: ${[...o.explanation].length}`),
    );
    expect(long).toEqual([]);
  });
});

describe('option length does not reveal the answer (I-05)', () => {
  const len = (s: string) => [...s].length;
  const correctOf = (q: QuizQuestion) => q.options.find(o => o.isCorrect)!;
  const correctIsLongest = (q: QuizQuestion) => {
    const c = correctOf(q);
    return q.options.every(o => o === c || len(c.text) > len(o.text));
  };

  it.each(['basics', 'biz', 'eng', 'all'] as const)('%s round: the correct option is not always the longest', round => {
    const qs = getQuizRound(QUIZ_QUESTIONS, round);
    expect(qs.filter(correctIsLongest).length).toBeLessThan(qs.length);
  });

  it.each(['biz', 'eng'] as const)('%s round: the correct option is the longest in at most 2 questions', round => {
    expect(getQuizRound(QUIZ_QUESTIONS, round).filter(correctIsLongest).length).toBeLessThanOrEqual(2);
  });

  // 8 questions with 4 options each: chance expectation is 2, so 3 is chance plus one slack (D9).
  it('basics round: the correct option is the longest in at most 3 questions', () => {
    expect(getQuizRound(QUIZ_QUESTIONS, 'basics').filter(correctIsLongest).length).toBeLessThanOrEqual(3);
  });

  it('every question: the correct option is at most 1.15\u00d7 the longest distractor', () => {
    const over = QUIZ_QUESTIONS.flatMap(q => {
      const c = correctOf(q);
      const longest = Math.max(...q.options.filter(o => o !== c).map(o => len(o.text)));
      const ratio = len(c.text) / longest;
      return ratio > 1.15 ? [`q${q.id}: ${ratio.toFixed(2)}`] : [];
    });
    expect(over, over.join(', ')).toEqual([]);
  });

  // A floor and a ceiling, so padding a distractor with filler to satisfy the ratio fails too.
  // The ceiling is 115, not 110: id 7 is exempt from the rewrite (D10) and its longest
  // distractor is 114 code points.
  it('every option is 40-115 characters', () => {
    const out = QUIZ_QUESTIONS.flatMap(q =>
      q.options.filter(o => len(o.text) < 40 || len(o.text) > 115).map(o => `q${q.id}: ${len(o.text)}`),
    );
    expect(out, out.join(', ')).toEqual([]);
  });
});
