import { describe, it, expect } from 'vitest';
import type { QuizQuestion } from '../types';
import { QUIZ_QUESTIONS } from './quizQuestions';
import { CHAPTERS } from './chaptersData';
import { resolveTrack } from './readingTracks';
import {
  getQuizRound, defaultQuizRound, initialQuizRound, parseQuizRound, QUIZ_ROUND_META,
  orderQuizRound, quizAnchors, quizTrackKey, basicsHintChapter,
} from './quizRounds';

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

// Only id and chapterId matter to the ordering.
const q = (id: number, chapterId?: string) => ({ id, chapterId }) as QuizQuestion;
const ids = (qs: QuizQuestion[]) => qs.map((x) => x.id);

describe('orderQuizRound (F-07)', () => {
  const bank = [q(1, 's4'), q(2, 's6'), q(3, 's8'), q(4, 's9'), q(5), q(6, 's2')];
  const trackIds = ['s2', 's1', 's9', 's4', 's6'];

  it('puts questions on anchor chapters first, in anchor order, then the rest by track', () => {
    expect(ids(orderQuizRound(bank, { trackIds, anchors: ['s6', 's4'] }))).toEqual([2, 1, 6, 4, 3, 5]);
  });

  it('with no anchors follows the track, then off-track questions in bank order', () => {
    expect(ids(orderQuizRound(bank, { trackIds, anchors: [] }))).toEqual([6, 4, 1, 2, 3, 5]);
  });

  it('keeps bank order between questions on the same chapter', () => {
    const same = [q(7, 's11'), q(8, 's2'), q(9, 's11')];
    expect(ids(orderQuizRound(same, { trackIds: [], anchors: ['s11'] }))).toEqual([7, 9, 8]);
  });

  it('does not change the round it orders', () => {
    const before = ids(bank);
    orderQuizRound(bank, { trackIds, anchors: ['s9'] });
    expect(ids(bank)).toEqual(before);
  });

  it('a Business reader who read s4 opens on the s4 question', () => {
    const biz = getQuizRound(QUIZ_QUESTIONS, 'biz');
    const ordered = orderQuizRound(biz, { trackIds: resolveTrack('biz', CHAPTERS), anchors: ['s4'] });
    expect(ordered[0].chapterId).toBe('s4');
    expect(ordered).toHaveLength(biz.length);
  });
});

describe('quizAnchors', () => {
  it('current chapter first, then read chapters newest first, without repeats', () => {
    expect(quizAnchors('s3', ['s1', 's2', 's3'])).toEqual(['s3', 's2', 's1']);
  });
  it('no current chapter: read chapters newest first', () => {
    expect(quizAnchors(null, ['s1', 's2'])).toEqual(['s2', 's1']);
    expect(quizAnchors(null, [])).toEqual([]);
  });
});

describe('quizTrackKey', () => {
  it('role rounds use their own track', () => {
    expect(quizTrackKey('biz', 'eng')).toBe('biz');
    expect(quizTrackKey('eng', null)).toBe('eng');
  });
  it('basics and all use the reader\'s role track, else beginner', () => {
    expect(quizTrackKey('basics', 'biz')).toBe('biz');
    expect(quizTrackKey('all', 'eng')).toBe('eng');
    expect(quizTrackKey('basics', null)).toBe('beginner');
  });
});

describe('basicsHintChapter', () => {
  it('biz reader who read only s2: the biz round has no s2 question, basics does', () => {
    expect(basicsHintChapter('biz', QUIZ_QUESTIONS, ['s2'])).toBe('s2');
  });
  it('no hint once the round has a question on any anchor', () => {
    expect(basicsHintChapter('biz', QUIZ_QUESTIONS, ['s2', 's4'])).toBeNull();
  });
  it('no hint with no anchors, on basics itself, or when basics has nothing either', () => {
    expect(basicsHintChapter('biz', QUIZ_QUESTIONS, [])).toBeNull();
    expect(basicsHintChapter('basics', QUIZ_QUESTIONS, ['s2'])).toBeNull();
    expect(basicsHintChapter('biz', QUIZ_QUESTIONS, ['s1'])).toBeNull();
  });
  it('names the first anchor basics covers', () => {
    expect(basicsHintChapter('eng', QUIZ_QUESTIONS, ['s1', 's5'])).toBe('s5');
  });
  it('the all round contains basics, so it never needs the hint', () => {
    expect(basicsHintChapter('all', QUIZ_QUESTIONS, ['s2'])).toBeNull();
  });
});
