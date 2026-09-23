import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { getQuizRound } from '../../data/quizRounds';
import { missedItems, type QuizAnswer } from '../../lib/quizResult';
import { QuizResultScreen } from './QuizResultScreen';

const BASICS = getQuizRound(QUIZ_QUESTIONS, 'basics');
const q1 = BASICS[0];
const wrong1 = q1.options.find((o) => !o.isCorrect)!;
const correct1 = q1.options.find((o) => o.isCorrect)!;

const noop = () => {};
const answers: QuizAnswer[] = [{ questionId: q1.id, correct: false, chosenText: wrong1.text }];

const render = (score: number, missed = missedItems(BASICS, answers)) =>
  renderToStaticMarkup(
    <QuizResultScreen
      score={score}
      total={8}
      awardedXp={25}
      missed={missed}
      onRestart={noop}
      onAskAI={noop}
      onOpenChapter={noop}
    />,
  );

describe('QuizResultScreen', () => {
  it('a weak score is not congratulated and gets a review list', () => {
    const html = render(1);
    expect(html).toContain('data-quiz-result="weak"');
    expect(html).toContain('ยังไม่แม่น');
    expect(html).toContain('ข้อที่ตอบผิด (1 ข้อ)');
    expect(html).toContain('data-quiz-review-chapter=');
    expect(html).not.toContain('ยินดีด้วย');
    expect(html).not.toContain('animate-bounce');
  });

  it('a missed card shows the pick, the right answer and the teaching explanation', () => {
    const html = render(1);
    expect(html).toContain('คุณตอบ:');
    expect(html).toContain('คำตอบที่ถูก:');
    expect(html).toContain(correct1.explanation.slice(0, 20));
  });

  it('a perfect score keeps the bouncing trophy and has nothing to review', () => {
    const html = render(8, []);
    expect(html).toContain('data-quiz-result="strong"');
    expect(html).toContain('ทำได้ดีมาก');
    expect(html).toContain('ตอบถูกทุกข้อ');
    expect(html).toContain('animate-bounce');
    expect(html).not.toContain('data-quiz-review');
  });

  it('the saved-result pill and both action buttons survive every band', () => {
    for (const [score, missed] of [[1, missedItems(BASICS, answers)], [4, []], [8, []]] as const) {
      const html = render(score, missed as never);
      expect(html).toContain('ทำครบแล้ว! บันทึกผลแล้ว');
      expect(html).toContain('ทำแบบทดสอบอีกครั้ง');
      expect(html).toContain('ถาม AI ทบทวนข้อที่ยังไม่แม่น');
    }
  });

  it('a middling score is told it passed but should review', () => {
    expect(render(4, [])).toContain('ผ่านแล้ว แต่ยังมีจุดที่ควรทบทวน');
  });

  it('retake is the one primary solid; asking AI is a soft button (§10.1)', () => {
    const html = render(3);
    expect(html.match(/bg-primary text-primary-content border-primary/g)).toHaveLength(1);
    expect(html).toMatch(/bg-primary text-primary-content[^>]*>(?:(?!<\/button>).)*ทำแบบทดสอบอีกครั้ง/s);
    expect(html).toMatch(/bg-base-300 text-base-content border-transparent[^>]*>(?:(?!<\/button>).)*ถาม AI ทบทวนข้อที่ยังไม่แม่น/s);
  });
});
