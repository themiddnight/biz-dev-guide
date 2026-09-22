import { describe, it, expect } from 'vitest';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { getQuizRound } from '../data/quizRounds';
import { missedItems, resultCopy, scoreBand, type QuizAnswer } from './quizResult';

const BASICS = getQuizRound(QUIZ_QUESTIONS, 'basics');
const correctOf = (id: number) => BASICS.find((q) => q.id === id)!.options.find((o) => o.isCorrect)!;
const wrongOf = (id: number) => BASICS.find((q) => q.id === id)!.options.find((o) => !o.isCorrect)!;

describe('scoreBand', () => {
  it('80% and up is strong', () => {
    expect(scoreBand(8, 8)).toBe('strong');
    expect(scoreBand(7, 8)).toBe('strong');
    expect(scoreBand(6, 6)).toBe('strong');
  });
  it('exactly 80% is strong', () => {
    expect(scoreBand(8, 10)).toBe('strong');
  });
  it('50% up to 80% is partial', () => {
    expect(scoreBand(4, 8)).toBe('partial');
    expect(scoreBand(5, 8)).toBe('partial');
  });
  it('exactly 50% is partial', () => {
    expect(scoreBand(3, 6)).toBe('partial');
  });
  it('below 50% is weak', () => {
    expect(scoreBand(3, 8)).toBe('weak');
    expect(scoreBand(0, 8)).toBe('weak');
  });
});

describe('resultCopy', () => {
  it('the top band is the only one that praises', () => {
    expect(resultCopy('strong').heading).toBe('ทำได้ดีมาก');
    expect(resultCopy('partial').heading).toBe('ผ่านแล้ว แต่ยังมีจุดที่ควรทบทวน');
    expect(resultCopy('weak').heading).toBe('ยังไม่แม่น ลองทบทวนก่อนทำอีกครั้ง');
  });
  it('no band says ยินดีด้วย', () => {
    for (const band of ['strong', 'partial', 'weak'] as const) {
      const { heading, subtitle } = resultCopy(band);
      expect(heading).not.toContain('ยินดีด้วย');
      expect(subtitle).not.toContain('ยินดีด้วย');
    }
  });
  it('the two lower bands point at the review block', () => {
    for (const band of ['partial', 'weak'] as const) {
      expect(resultCopy(band).subtitle).toBe('ดูข้อที่ตอบผิดด้านล่าง แล้วกลับไปอ่านบทที่เกี่ยวข้อง');
    }
  });
});

describe('missedItems', () => {
  const answers: QuizAnswer[] = [
    { questionId: 1, correct: true, chosenText: correctOf(1).text },
    { questionId: 2, correct: false, chosenText: wrongOf(2).text },
    { questionId: 3, correct: false, chosenText: wrongOf(3).text },
  ];

  it('lists the wrong answers only, in run order', () => {
    expect(missedItems(BASICS, answers).map((m) => m.question.id)).toEqual([2, 3]);
  });

  it('carries what was chosen and the option that is correct', () => {
    const [first] = missedItems(BASICS, answers);
    expect(first.chosenText).toBe(wrongOf(2).text);
    expect(first.correctText).toBe(correctOf(2).text);
  });

  it('the explanation comes from the correct option, not from the chosen one', () => {
    const [first] = missedItems(BASICS, answers);
    expect(first.explanation).toBe(correctOf(2).explanation);
    expect(first.explanation).not.toBe(wrongOf(2).explanation);
  });

  it('an all-correct run has nothing to review', () => {
    const allRight = BASICS.map((q) => ({ questionId: q.id, correct: true, chosenText: correctOf(q.id).text }));
    expect(missedItems(BASICS, allRight)).toEqual([]);
  });

  it('ignores an answer whose question is not in the round', () => {
    expect(missedItems(BASICS, [{ questionId: 9, correct: false, chosenText: 'x' }])).toEqual([]);
  });
});
