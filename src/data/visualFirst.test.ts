import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { FIGURES } from '../components/figures';

const chapter = (id: string) => CHAPTERS.find((c) => c.id === id)!;
const HERO_FIGURES: Record<string, string> = {
  s1: 'refund-handoff-drift',
  s2: 'refund-backlog-cut',
  s3: 'refund-fidelity',
  s4: 'refund-nfr-spec',
  s5: 'refund-c4-impact',
  s6: 'refund-story-gates',
  s7: 'refund-test-report',
  s8: 'refund-deploy-log',
  s9: 'refund-debt-diff',
  s10: 'refund-slo-dashboard',
  s11: 'refund-kpi-split',
  s12: 'refund-dual-track-board',
  s13: 'refund-ai-review',
  s14: 'refund-spec-stack',
  s15: 'refund-glossary-fix',
};
const MONEY = /\$\s?\d/;

describe('visual-first heroes', () => {
  it.each(Object.entries(HERO_FIGURES))('gives %s the %s hero figure', (id, key) => {
    expect(chapter(id).heroFigure?.figureKey).toBe(key);
  });

  it('points every hero figure at a registered figure', () => {
    for (const c of CHAPTERS) if (c.heroFigure) expect(FIGURES).toHaveProperty(c.heroFigure.figureKey);
  });

  it('limits hero figures to the rolled-out chapters (update at each wave)', () => {
    expect(CHAPTERS.filter((c) => c.heroFigure).map((c) => c.id)).toEqual(Object.keys(HERO_FIGURES));
  });

  it.each(Object.keys(HERO_FIGURES))('keeps $ amounts out of %s', (id) => {
    expect(JSON.stringify(chapter(id))).not.toMatch(MONEY);
  });
});
