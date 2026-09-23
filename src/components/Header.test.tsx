import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Role } from '../data/rolePerspective';
import type { UserStats } from '../types';
import { Header } from './Header';

const noop = () => {};
const stats: UserStats = {
  xp: 120, level: 2, levelTitle: 'Bridge Apprentice', quizzesCompleted: 0, correctAnswers: 0,
  aiQuestionsAsked: 0, readChapters: [], bookmarks: [], xpClaims: [],
};
const render = (role: Role | null) => renderToStaticMarkup(
  <Header activeTab="quiz" setActiveTab={noop} experienceLevel="beginner" setExperienceLevel={noop}
    role={role} onChooseRole={noop} levelMode="auto" onLevelModeChange={noop}
    userStats={stats} chapterCount={19} theme="dark" setTheme={noop} />,
);

describe('Header hierarchy (spec §10.2)', () => {
  it('selections are soft: the only primary fill is the XP progress bar', () => {
    const html = render('eng');
    expect(html.match(/(?<![\w:/-])bg-primary(?![\w/-])/g)).toHaveLength(1);
    expect(html).not.toMatch(/(?<![\w:/-])border-primary(?![\w/-])/);
  });

  it('each control group presses exactly one item (nav 1, role and level twice for md/mobile, theme 1)', () => {
    const html = render('eng');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(6);
    expect(html).toMatch(/aria-pressed="true"[^>]*data-value="eng"/);
    expect(html).toMatch(/aria-pressed="true"[^>]*data-value="quiz"/);
    expect(html).toMatch(/aria-pressed="true"[^>]*data-value="dark"/);
    expect(html).toContain('aria-label="สายงานของคุณ"');
    expect(html).toContain('aria-label="Theme mode switcher"');
  });

  it('no role selects the "none" segment and shows the two-level switch', () => {
    const html = render(null);
    expect(html).toMatch(/aria-pressed="true"[^>]*data-value="none"/);
    expect(html).toMatch(/aria-pressed="true"[^>]*data-value="beginner"/);
    expect(html).not.toContain('data-value="auto"');
  });
});
