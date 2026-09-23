import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import { getChapterLayout } from '../../../data/sectionLayers';
import { ChapterHero } from '../ChapterHero';
import { SECTION_COMPONENTS, type GuideSectionContext } from './registry';

/**
 * The honesty check on real data (term-definitions spec D16): where the automatic markers land in
 * three registers — s1 plain, s10 formal, s15 academic. Each list is `section: id (label)` in
 * document order for a beginner with every Core section open. A glossary or guardrail change that
 * starts marking the wrong thing shows up here as a reviewable diff, not a silent behaviour change.
 */
const noop = () => {};
const ctx: GuideSectionContext = {
  chapters: CHAPTERS,
  onNavigateChapter: noop, onDiagramJump: noop, onScrollToPlaybook: noop,
  onSearchGlossary: noop, onSelectGlossaryCategory: noop,
  glossaryCategory: 'all', setGlossaryCategory: noop,
  glossaryQuery: '', setGlossaryQuery: noop,
  c4Level: 1, setC4Level: noop,
  checkedChecklist: {}, onToggleChecklistItem: noop,
  role: null, chapterLevel: 'beginner', otherSideView: 'both', setOtherSideView: noop,
};

const markersOf = (html: string) =>
  [...html.matchAll(/data-inline-term="([a-z0-9-]+)"[^>]*>([^<]+)<\/button>/g)].map(m => `${m[1]} (${m[2]})`);

function beginnerCoreMarkers(chapterId: string): string[] {
  const chapter = CHAPTERS.find(c => c.id === chapterId)!;
  const hero = renderToStaticMarkup(<ChapterHero chapter={chapter} experienceLevel="beginner" isRead={false} />);
  const core = getChapterLayout('beginner', chapter).find(g => g.layer === 'core')!.sections;
  return [
    ...markersOf(hero).map(m => `hero: ${m}`),
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
      'primer: pm-vs-pjm (PM)',
      'primer: sa (SA)',
      'primer: api (API)',
      'jargon: sprint (Sprint)',
      'jargon: wireframe (Wireframe)',
    ]);
  });

  // The chapter opening (Phase 4) expands SRE, SLA and SLO in full, so the hero spends no marker on them.
  it('s10, formal register: three abbreviations in the opening', () => {
    expect(beginnerCoreMarkers('s10')).toEqual([
      'hero: logging-monitoring-alerting (Monitoring)',
      'hero: incident (Incident)',
      'primer: slo (SLO)',
      'primer: incident (Incident)',
      'primer: logging-monitoring-alerting (Monitoring)',
      'jargon: rollback (Rollback)',
      'jargon: sprint (Sprint)',
      'otherSide: sla (SLA)',
      'otherSide: logging-monitoring-alerting (Monitoring)',
      'otherSide: slo (SLO)',
    ]);
  });

  it('s15, academic register: the six-abbreviation primer sentence', () => {
    expect(beginnerCoreMarkers('s15')).toEqual([
      'primer: api (API)',
      'primer: ci-cd (CI/CD)',
      'primer: sla (SLA)',
      'primer: mvp (MVP)',
      'primer: non-functional-requirement (NFR)',
      'primer: sdk (SDK)',
      'primer: refactoring (Refactor)',
      'primer: technical-debt (Tech Debt)',
      'otherSide: mvp (MVP)',
      'otherSide: sla (SLA)',
      'otherSide: refactoring (Refactor)',
      'otherSide: edge-case (Edge Case)',
    ]);
  });
});
