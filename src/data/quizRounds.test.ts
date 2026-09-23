import { describe, it, expect } from 'vitest';
import { QUIZ_QUESTIONS } from './quizQuestions';
import { getQuizRound, defaultQuizRound, initialQuizRound, parseQuizRound, QUIZ_ROUND_META } from './quizRounds';

describe('quiz rounds', () => {
  it('basics is the original 8 questions in order', () => {
    expect(getQuizRound(QUIZ_QUESTIONS, 'basics').map((q) => q.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it.each(['eng', 'biz'] as const)('%s round has 6 questions, all for that role', (round) => {
    const qs = getQuizRound(QUIZ_QUESTIONS, round);
    expect(qs).toHaveLength(6);
    expect(qs.every((q) => q.forRole === round)).toBe(true);
  });

  it('all round has 20 questions with no duplicates, role-specific first', () => {
    const qs = getQuizRound(QUIZ_QUESTIONS, 'all');
    expect(qs).toHaveLength(20);
    expect(new Set(qs.map((q) => q.id)).size).toBe(20);
    const firstBasics = qs.findIndex((q) => q.forRole === 'both');
    expect(firstBasics).toBe(12);
    expect(qs.slice(firstBasics).every((q) => q.forRole === 'both')).toBe(true);
  });

  it('defaultQuizRound follows the role, else basics', () => {
    expect(defaultQuizRound(null)).toBe('basics');
    expect(defaultQuizRound('eng')).toBe('eng');
    expect(defaultQuizRound('biz')).toBe('biz');
  });

  it('has Thai labels for each round', () => {
    expect(QUIZ_ROUND_META.basics.label).toBe('พื้นฐาน (ทุกสาย)');
    expect(QUIZ_ROUND_META.eng.label).toBe('สาย Engineering');
    expect(QUIZ_ROUND_META.biz.label).toBe('สาย Business');
    expect(QUIZ_ROUND_META.all.label).toBe('ทั้งหมด');
  });
});

describe('parseQuizRound', () => {
  it('the four stored values round-trip', () => {
    for (const r of ['basics', 'eng', 'biz', 'all'] as const) expect(parseQuizRound(r)).toBe(r);
  });
  it('anything else is ignored, not repaired', () => {
    for (const raw of [null, '', 'pm', 'BASICS', 'eng ']) expect(parseQuizRound(raw)).toBeNull();
  });
});

describe('initialQuizRound', () => {
  it('an explicit past choice wins over the role default', () => {
    expect(initialQuizRound('basics', 'biz')).toBe('basics');
    expect(initialQuizRound('all', 'eng')).toBe('all');
  });
  it('with nothing stored the reader gets their own round', () => {
    expect(initialQuizRound(null, 'biz')).toBe('biz');
    expect(initialQuizRound(null, 'eng')).toBe('eng');
  });
  it('no role and nothing stored opens basics', () => {
    expect(initialQuizRound(null, null)).toBe('basics');
  });
  it('a garbage value falls back to the role default', () => {
    expect(initialQuizRound('garbage', 'eng')).toBe('eng');
    expect(initialQuizRound('garbage', null)).toBe('basics');
  });
});

describe('round sizes are unchanged', () => {
  it('8 / 6 / 6 / 20', () => {
    const sizes = (['basics', 'eng', 'biz', 'all'] as const).map((r) => getQuizRound(QUIZ_QUESTIONS, r).length);
    expect(sizes).toEqual([8, 6, 6, 20]);
  });
});
