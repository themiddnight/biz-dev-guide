import type { QuizQuestion } from '../types';

/** One answered question, recorded in run order (round3 spec P2.2). */
export interface QuizAnswer { questionId: number; correct: boolean; chosenText: string }

export interface MissedItem {
  question: QuizQuestion;
  chosenText: string;
  correctText: string;
  explanation: string;
}

export type ScoreBand = 'strong' | 'partial' | 'weak';

/** ≥ 80% strong, ≥ 50% partial, below that weak. */
export function scoreBand(score: number, total: number): ScoreBand {
  const pct = total === 0 ? 0 : score / total;
  if (pct >= 0.8) return 'strong';
  if (pct >= 0.5) return 'partial';
  return 'weak';
}

const COPY: Record<ScoreBand, { heading: string; subtitle: string }> = {
  strong: {
    heading: 'ทำได้ดีมาก',
    subtitle: 'เข้าใจภาพรวมงานระหว่าง Business กับ Engineering แล้ว',
  },
  partial: {
    heading: 'ผ่านแล้ว แต่ยังมีจุดที่ควรทบทวน',
    subtitle: 'ดูข้อที่ตอบผิดด้านล่าง แล้วกลับไปอ่านบทที่เกี่ยวข้อง',
  },
  weak: {
    heading: 'ยังไม่แม่น ลองทบทวนก่อนทำอีกครั้ง',
    subtitle: 'ดูข้อที่ตอบผิดด้านล่าง แล้วกลับไปอ่านบทที่เกี่ยวข้อง',
  },
};

export function resultCopy(band: ScoreBand): { heading: string; subtitle: string } {
  return COPY[band];
}

/**
 * The questions answered wrongly, in run order, paired with what was chosen.
 * `explanation` is the correct option's — the sentence that teaches, not the one that rebuts.
 */
export function missedItems(questions: QuizQuestion[], answers: QuizAnswer[]): MissedItem[] {
  return answers.flatMap((a) => {
    if (a.correct) return [];
    const question = questions.find((q) => q.id === a.questionId);
    if (!question) return [];
    const correct = question.options.find((o) => o.isCorrect);
    if (!correct) return [];
    return [{ question, chosenText: a.chosenText, correctText: correct.text, explanation: correct.explanation }];
  });
}
