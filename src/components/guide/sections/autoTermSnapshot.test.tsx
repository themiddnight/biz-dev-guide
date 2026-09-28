import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import { getChapterLayout } from '../../../data/sectionLayers';
import { ChapterHero } from '../ChapterHero';
import { ChapterIntro } from '../ChapterIntro';
import { SECTION_COMPONENTS } from './registry';
import { ctxFor } from './testCtx';

/**
 * The honesty check on real data (term-definitions spec D16): where the automatic markers land in
 * three registers — s1 plain, s10 formal, s15 academic. Each list is `section: id (label)` in
 * document order for a beginner with every Core section open. A glossary or guardrail change that
 * starts marking the wrong thing shows up here as a reviewable diff, not a silent behaviour change.
 */
const noop = () => {};
const ctx = ctxFor();

const markersOf = (html: string) =>
  [...html.matchAll(/data-inline-term="([a-z0-9-]+)"[^>]*>([^<]+)<\/button>/g)].map(m => `${m[1]} (${m[2]})`);

function beginnerCoreMarkers(chapterId: string): string[] {
  const chapter = CHAPTERS.find(c => c.id === chapterId)!;
  const hero = renderToStaticMarkup(<ChapterHero chapter={chapter} experienceLevel="beginner" isRead={false} />);
  const intro = renderToStaticMarkup(<ChapterIntro chapter={chapter} />);
  const core = getChapterLayout('beginner', chapter).find(g => g.layer === 'core')!.sections;
  return [
    ...markersOf(hero).map(m => `hero: ${m}`),
    ...markersOf(intro).map(m => `intro: ${m}`),
    ...core.flatMap(key => {
      const Section = SECTION_COMPONENTS[key];
      const html = renderToStaticMarkup(<Section chapter={chapter} isOpen onToggle={noop} ctx={ctx} />);
      return markersOf(html).map(m => `${key}: ${m}`);
    }),
  ];
}

describe('automatic term markers on real chapters (beginner Core)', () => {
  it('s1, plain register: PM and SA in the PM → Designer → SA → Dev arrow chain are marked (D20, acceptance 1)', () => {
    expect(beginnerCoreMarkers('s1')).toEqual([
      'intro: pm-vs-pjm (PM)',
      'intro: sa (SA)',
      'intro: api (API)',
      'jargon: sprint (Sprint)',
      'jargon: wireframe (Wireframe)',
    ]);
  });

  // The chapter opening (Phase 4) expands SRE, SLA and SLO in full, so the hero spends no marker on them.
  it('s10, formal register: three abbreviations in the opening', () => {
    expect(beginnerCoreMarkers('s10')).toEqual([
      'hero: logging-monitoring-alerting (Monitoring)',
      'hero: incident (Incident)',
      'intro: slo (SLO)',
      'intro: incident (Incident)',
      'intro: logging-monitoring-alerting (Monitoring)',
      'jargon: rollback (Rollback)',
      'jargon: sprint (Sprint)',
      'otherSide: sla (SLA)',
      'otherSide: logging-monitoring-alerting (Monitoring)',
      'otherSide: slo (SLO)',
    ]);
  });

  it('s15, academic register: the six-abbreviation primer sentence', () => {
    expect(beginnerCoreMarkers('s15')).toEqual([
      'intro: api (API)',
      'intro: ci-cd (CI/CD)',
      'intro: sla (SLA)',
      'intro: mvp (MVP)',
      'intro: non-functional-requirement (NFR)',
      'intro: sdk (SDK)',
      'intro: refactoring (Refactor)',
      'intro: technical-debt (Tech Debt)',
      'otherSide: mvp (MVP)',
      'otherSide: sla (SLA)',
      'otherSide: refactoring (Refactor)',
      'otherSide: edge-case (Edge Case)',
    ]);
  });
});
