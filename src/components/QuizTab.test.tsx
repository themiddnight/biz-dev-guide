import { afterEach, describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { CHAPTERS } from '../data/chaptersData';
import { resolveTrack } from '../data/readingTracks';
import { getQuizRound, orderQuizRound } from '../data/quizRounds';
import { QuizTab } from './QuizTab';

const noop = () => {};
const render = (role: 'eng' | 'biz' | null, read: string[] = [], current: string | null = null) =>
  renderToStaticMarkup(
    <QuizTab
      questions={QUIZ_QUESTIONS}
      chapters={CHAPTERS}
      role={role}
      readChapters={read}
      currentChapterId={current}
      onAskAIWithPrompt={noop}
      onOpenChapter={noop}
    />,
  );
const scenario = (id: number) => QUIZ_QUESTIONS.find((x) => x.id === id)!.scenario.replace(/"/g, '&quot;');

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
    // With nothing read, the eng round follows the eng reading track (F-07).
    const first = orderQuizRound(getQuizRound(QUIZ_QUESTIONS, 'eng'), { trackIds: resolveTrack('eng', CHAPTERS), anchors: [] })[0];
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

describe('QuizTab opens on what was just read (F-07)', () => {
  it('a Business reader who read s9 starts on the s9 question', () => {
    const s9 = getQuizRound(QUIZ_QUESTIONS, 'biz').find((x) => x.chapterId === 's9')!;
    const html = render('biz', ['s9']);
    expect(html).toContain(scenario(s9.id));
  });

  it('the chapter open in the guide outranks older reads', () => {
    const s6 = getQuizRound(QUIZ_QUESTIONS, 'biz').find((x) => x.chapterId === 's6')!;
    expect(render('biz', ['s9'], 's6')).toContain(scenario(s6.id));
  });

  it('a Business reader who read only s2 is pointed to the basics round', () => {
    const html = render('biz', ['s2']);
    expect(html).toContain('ชุดพื้นฐานมีคำถามจากบทที่ 2 ที่คุณเพิ่งอ่าน');
    expect(html).toMatch(/<button[^>]*data-quiz-basics-hint[^>]*>ไปชุดพื้นฐาน<\/button>/);
  });

  it('no hint when the round already covers what was read, or nothing was read', () => {
    expect(render('biz', ['s4'])).not.toContain('ไปชุดพื้นฐาน');
    expect(render('biz')).not.toContain('ไปชุดพื้นฐาน');
  });
});
