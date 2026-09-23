import { afterEach, describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { getQuizRound } from '../data/quizRounds';
import { QuizTab } from './QuizTab';

const noop = () => {};
const render = (role: 'eng' | 'biz' | null) =>
  renderToStaticMarkup(
    <QuizTab questions={QUIZ_QUESTIONS} role={role} onAnswer={() => 0} onCompleteQuiz={noop} onAskAIWithPrompt={noop} onOpenChapter={noop} />,
  );

// The tab reads the stored round through the same guarded helper the app uses.
const STORE_KEY = 'be_guide_quiz_round';
const setStoredRound = (value: string | null) => {
  const store = new Map<string, string>();
  if (value !== null) store.set(STORE_KEY, value);
  // The node env has no window; the tab only reaches for these three methods.
  (globalThis as { window?: unknown }).window = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
    },
  };
};

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

describe('QuizTab rounds', () => {
  it('role eng opens on its own round, marked as the reader\'s, with the first eng scenario', () => {
    const html = render('eng');
    expect(html).toContain('aria-label="เลือกชุดคำถาม"');
    expect(html).toContain('สาย Engineering (สายคุณ) · 6 ข้อ');
    expect(html).toContain('พื้นฐาน (ทุกสาย) · 8 ข้อ');
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

describe('QuizTab remembers the chosen round (P5.1)', () => {
  it('a stored basics choice beats the eng role default', () => {
    setStoredRound('basics');
    const html = render('eng');
    expect(html).toMatch(/aria-pressed="true"[^>]*>พื้นฐาน \(ทุกสาย\)/);
    expect(html).toContain(getQuizRound(QUIZ_QUESTIONS, 'basics')[0].scenario.replace(/"/g, '&quot;'));
  });

  it('a garbage stored value leaves the role default in place', () => {
    setStoredRound('garbage');
    expect(render('eng')).toMatch(/aria-pressed="true"[^>]*>สาย Engineering \(สายคุณ\)/);
  });
});
