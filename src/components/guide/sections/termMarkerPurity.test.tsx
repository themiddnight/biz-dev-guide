import { describe, it, expect, vi } from 'vitest';

/**
 * StrictMode, without a DOM. In development React renders every function component twice with the
 * same props and keeps the second result (`src/main.tsx` wraps the app in `<StrictMode>`).
 * `renderToStaticMarkup` renders once, which is how Phase 3 shipped a section that handed a `seen`
 * set to its cards: the cards filled it on the first render and marked nothing on the second, so
 * every other-side card had zero markers in the browser while every test passed. This harness
 * wraps each function component the JSX runtime creates so its body runs twice per render, as
 * StrictMode's does, and the tests below assert the markers survive it.
 */
const { renderTwice } = vi.hoisted(() => {
  const wrapped = new WeakMap<object, unknown>();
  /** `type`, or for a function component a stand-in that runs its body twice and keeps the second result. */
  const renderTwice = (type: unknown) => {
    if (typeof type !== 'function' || (type.prototype as { isReactComponent?: unknown } | undefined)?.isReactComponent) return type;
    if (!wrapped.has(type)) {
      const body = type as (props: unknown) => unknown;
      wrapped.set(type, (props: unknown) => {
        body(props);
        return body(props);
      });
    }
    return wrapped.get(type);
  };
  return { renderTwice };
});
type Factory = (type: unknown, ...rest: unknown[]) => unknown;
vi.mock('react/jsx-dev-runtime', async importOriginal => {
  const runtime = await importOriginal<typeof import('react/jsx-dev-runtime')>();
  const jsxDEV = runtime.jsxDEV as Factory;
  return { ...runtime, jsxDEV: (type: unknown, ...rest: unknown[]) => jsxDEV(renderTwice(type), ...rest) };
});
vi.mock('react/jsx-runtime', async importOriginal => {
  const runtime = await importOriginal<typeof import('react/jsx-runtime')>();
  const wrap = (fn: Factory) => (type: unknown, ...rest: unknown[]) => fn(renderTwice(type), ...rest);
  return { ...runtime, jsx: wrap(runtime.jsx as Factory), jsxs: wrap(runtime.jsxs as Factory) };
});

import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import { ROLES } from '../../../data/rolePerspective';
import { coreConceptTerms, heroTerms, jargonTerms, otherSideTerms, primerTerms } from '../../../lib/sectionTerms';
import { ChapterHero } from '../ChapterHero';
import { CoreConceptsSection } from './CoreConceptsSection';
import { JargonSection } from './JargonSection';
import { OtherSideSection } from './OtherSideSection';
import { PrimerSection } from './PrimerSection';
import type { GuideSectionContext, OtherSideView } from './registry';

const noop = () => {};
const ctxFor = (over: Partial<GuideSectionContext>): GuideSectionContext => ({
  chapters: CHAPTERS,
  onNavigateChapter: noop, onDiagramJump: noop, onScrollToPlaybook: noop,
  onSearchGlossary: noop, onSelectGlossaryCategory: noop,
  glossaryCategory: 'all', setGlossaryCategory: noop,
  glossaryQuery: '', setGlossaryQuery: noop,
  c4Level: 1, setC4Level: noop,
  checkedChecklist: {}, onToggleChecklistItem: noop,
  role: null, chapterLevel: 'beginner', otherSideView: 'both', setOtherSideView: noop,
  ...over,
});

const rendered = (html: string) => [...html.matchAll(/data-inline-term="([a-z0-9-]+)"/g)].map(m => m[1]);
const expected = (texts: readonly (string | undefined)[]) =>
  texts.flatMap(text => [...(text ?? '').matchAll(/\[\[g:([a-z0-9-]+)\|/g)].map(m => m[1]));

describe('term markers survive a StrictMode double render', () => {
  it('the harness really renders each component body twice', () => {
    let bodies = 0;
    const Probe = () => <b>{++bodies}</b>;
    expect(renderToStaticMarkup(<Probe />)).toBe('<b>2</b>');
  });

  it('s18, eng reader: the "Business ถูกวัดผลด้วย" card marks KR and KPI (acceptance 2)', () => {
    const chapter = CHAPTERS.find(c => c.id === 's18')!;
    const html = renderToStaticMarkup(
      <OtherSideSection chapter={chapter} isOpen onToggle={noop} ctx={ctxFor({ role: 'eng', otherSideView: 'biz' })} />,
    );
    const measuredBy = /ถูกวัดผลด้วย<\/div><p[^>]*>(.*?)<\/p>/.exec(html)?.[1] ?? '';
    expect(rendered(measuredBy)).toEqual(['kr', 'okr-kpi']);
  });

  it.each(['biz', 'eng', 'both'] as OtherSideView[])('other side (%s): every chapter renders exactly the markers its walk computes', view => {
    let total = 0;
    for (const chapter of CHAPTERS) {
      const html = renderToStaticMarkup(<OtherSideSection chapter={chapter} isOpen onToggle={noop} ctx={ctxFor({ otherSideView: view })} />);
      const cards = otherSideTerms(chapter, view === 'both' ? ROLES : [view]);
      const want = expected(cards.flatMap(c => [c.measuredBy, ...c.fears, ...c.saysVsHears.flatMap(r => [r.youSay, r.theyHear, r.sayInstead]), ...c.askThem, c.note]));
      expect(rendered(html), chapter.id).toEqual(want);
      total += want.length;
    }
    expect(total).toBeGreaterThan(0);
  });

  it('hero, primer, jargon and core concepts: every chapter renders exactly the markers its walk computes', () => {
    const ctx = ctxFor({ chapterLevel: 'experienced' }); // bullets unfolded, so every concept string renders
    const totals = { hero: 0, primer: 0, jargon: 0, coreConcepts: 0 };
    for (const chapter of CHAPTERS) {
      const hero = heroTerms(chapter);
      const primer = primerTerms(chapter);
      const concepts = coreConceptTerms(chapter);
      const cases = {
        hero: [renderToStaticMarkup(<ChapterHero chapter={chapter} experienceLevel="beginner" isRead={false} />),
          chapter.heroFigure ? [hero.plainAnalogy, hero.keyTakeaway] : [hero.keyTakeaway, hero.plainAnalogy]],
        primer: [renderToStaticMarkup(<PrimerSection chapter={chapter} isOpen onToggle={noop} ctx={ctx} />),
          primer ? [primer.whatIsIt, primer.whyItMatters, primer.realWorldScenario] : []],
        jargon: [renderToStaticMarkup(<JargonSection chapter={chapter} isOpen onToggle={noop} ctx={ctx} />),
          jargonTerms(chapter).flatMap(card => [card.humanTranslation, card.meetingExample])],
        coreConcepts: [renderToStaticMarkup(<CoreConceptsSection chapter={chapter} isOpen onToggle={noop} ctx={ctx} />),
          concepts.flatMap(c => [c.detail, ...c.bulletPoints])],
      } as const;
      for (const [section, [html, texts]] of Object.entries(cases)) {
        expect(rendered(html), `${chapter.id} ${section}`).toEqual(expected(texts));
        totals[section as keyof typeof totals] += expected(texts).length;
      }
    }
    for (const [section, total] of Object.entries(totals)) expect(total, section).toBeGreaterThan(0);
  });
});

describe('unfolding a concept never moves a marker (review S1)', () => {
  const detailMarkers = (html: string) =>
    [...html.matchAll(/<p data-concept-detail="(\d+)"[^>]*>(.*?)<\/p>/g)].map(m => `${m[1]}: ${rendered(m[2]).join(', ')}`);

  it('every concept detail carries the same markers with bullets folded (beginner) and unfolded (experienced)', () => {
    let markers = 0;
    for (const chapter of CHAPTERS) {
      const render = (chapterLevel: 'beginner' | 'experienced') =>
        renderToStaticMarkup(<CoreConceptsSection chapter={chapter} isOpen onToggle={noop} ctx={ctxFor({ chapterLevel })} />);
      const folded = render('beginner');
      const unfolded = render('experienced');
      expect(folded).not.toContain('<ul'); // the beginner view really is folded
      expect(detailMarkers(folded), chapter.id).toEqual(detailMarkers(unfolded));
      markers += rendered(folded).length;
    }
    expect(markers).toBeGreaterThan(0);
  });
});
