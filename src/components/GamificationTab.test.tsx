import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { INITIAL_BADGES } from '../data/badgesData';
import type { UserStats } from '../types';
import { GamificationTab } from './GamificationTab';

const noop = () => {};
const stats: UserStats = {
  xp: 120, level: 2, levelTitle: 'Bridge Apprentice', quizzesCompleted: 0, correctAnswers: 0,
  aiQuestionsAsked: 0, readChapters: [], bookmarks: [], xpClaims: [],
};

describe('GamificationTab hierarchy (spec §10.1, §10.2, §10.5)', () => {
  const html = renderToStaticMarkup(
    <GamificationTab badges={INITIAL_BADGES} userStats={stats} chapterCount={19} onStartQuiz={noop} onGoToGuide={noop} />,
  );

  it('the level square is a soft badge that still announces the level', () => {
    expect(html).toContain('aria-label="Lv.2"');
  });

  it('go to quiz is the one primary solid; progress is the only other primary fill', () => {
    expect(html.match(/bg-primary text-primary-content border-primary/g)).toHaveLength(1);
    expect(html.match(/(?<![\w:/-])bg-primary(?![\w/-])/g)).toHaveLength(2);
  });
});
