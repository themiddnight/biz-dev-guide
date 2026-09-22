import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { getQuizRound } from '../data/quizRounds';
import { QuizTab } from './QuizTab';

const noop = () => {};
const render = (role: 'eng' | 'biz' | null) =>
  renderToStaticMarkup(
    <QuizTab questions={QUIZ_QUESTIONS} role={role} onAnswer={() => 0} onCompleteQuiz={noop} onAskAIWithPrompt={noop} onOpenChapter={noop} />,
  );

describe('QuizTab rounds', () => {
  it('role eng opens on its own round, marked as the reader\'s, with the first eng scenario', () => {
    const html = render('eng');
    expect(html).toContain('aria-label="เลือกชุดคำถาม"');
    expect(html).toContain('สาย Engineering (สายคุณ) · 6 ข้อ');
    expect(html).toContain('พื้นฐาน · 8 ข้อ');
    expect(html).toContain('ทั้งหมด · 20 ข้อ');
    const first = getQuizRound(QUIZ_QUESTIONS, 'eng')[0];
    expect(html).toContain(first.scenario);
    expect(html).toMatch(/aria-pressed="true"[^>]*>สาย Engineering \(สายคุณ\)/);
  });

  it('no role opens on basics with no own-role suffix', () => {
    const html = render(null);
    expect(html).not.toContain('(สายคุณ)');
    expect(html).toContain(QUIZ_QUESTIONS[0].scenario.replace(/"/g, '&quot;'));
  });
});
