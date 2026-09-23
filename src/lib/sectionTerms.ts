import type { Chapter, SaysVsHears } from '../types';
import { otherRole, type Role } from '../data/rolePerspective';
import { collectTermIds, markTerms } from './autoTerms';

/**
 * Where each section's automatic term markers go (term-definitions spec P3.5, guardrail 3: first
 * occurrence per section). Every function here is a pure function of the chapter: it creates its
 * own `seen` set, walks the section's prose strings in a fixed order and returns the marked
 * strings. The section components memoise the result and render it; they never hold a `seen` set
 * across renders or pass one to a child. A set mutated during render breaks under React StrictMode,
 * whose second render finds every id already seen and marks nothing (Phase 3 acceptance, s18).
 *
 * The same functions feed the D11 track guard (`src/data/termCoverage.test.ts`), so the guard reads
 * the markers the reader gets instead of a hand-kept mirror of the components.
 */

/** A fresh `seen` set for one section walk; `seed` ids count as already defined in that section. */
const sectionMarker = (seed: Iterable<string> = []) => {
  const seen = new Set(seed);
  return (text: string) => markTerms(text, 'prose', seen);
};

export interface HeroTerms { chapterOpening: string; plainAnalogy: string; keyTakeaway: string }

/**
 * `ChapterHero`, in document order: the opening line (spec P4.3) sits under the subtitle, above
 * everything else; the analogy renders above the takeaway only when the chapter has a hero figure.
 */
export function heroTerms(chapter: Chapter): HeroTerms {
  const mark = sectionMarker();
  const chapterOpening = mark(chapter.chapterOpening);
  if (chapter.heroFigure) {
    const plainAnalogy = mark(chapter.plainAnalogy);
    return { chapterOpening, plainAnalogy, keyTakeaway: mark(chapter.keyTakeaway) };
  }
  const keyTakeaway = mark(chapter.keyTakeaway);
  return { chapterOpening, keyTakeaway, plainAnalogy: mark(chapter.plainAnalogy) };
}

export interface PrimerTerms { whatIsIt: string; whyItMatters: string; realWorldScenario: string }

export function primerTerms(chapter: Chapter): PrimerTerms | null {
  const primer = chapter.beginnerPrimer;
  if (!primer) return null;
  const mark = sectionMarker();
  const whatIsIt = mark(primer.whatIsIt);
  const whyItMatters = mark(primer.whyItMatters);
  return { whatIsIt, whyItMatters, realWorldScenario: mark(primer.realWorldScenario) };
}

export interface JargonCardTerms { humanTranslation: string; meetingExample?: string }

/** `JargonSection`, card by card. Seeded with the cards' own subjects: a card never re-marks what the block defines. */
export function jargonTerms(chapter: Chapter): JargonCardTerms[] {
  const cards = chapter.jargonList ?? [];
  const mark = sectionMarker(cards.flatMap(card => collectTermIds(card.term)));
  return cards.map(card => {
    const humanTranslation = mark(card.humanTranslation);
    return { humanTranslation, meetingExample: card.meetingExample === undefined ? undefined : mark(card.meetingExample) };
  });
}

export interface SideViewTerms {
  side: Role;
  measuredBy: string;
  fears: string[];
  saysVsHears: SaysVsHears[];
  askThem: string[];
  /** The reader's own note: `engineerNote` on the biz card (read by eng), `businessNote` on the eng card. */
  note: string;
}

/** `OtherSideSection`: the shown cards in order, one `seen` set shared by both cards in `both` mode. */
export function otherSideTerms(chapter: Chapter, sides: readonly Role[]): SideViewTerms[] {
  const perspectives = chapter.perspectives;
  if (!perspectives) return [];
  const mark = sectionMarker();
  return sides.map(side => {
    const view = perspectives[side];
    const measuredBy = mark(view.measuredBy);
    const fears = view.fears.map(mark);
    const saysVsHears = view.saysVsHears.map(row => {
      const youSay = mark(row.youSay);
      const theyHear = mark(row.theyHear);
      return { youSay, theyHear, sayInstead: mark(row.sayInstead) };
    });
    const askThem = view.askThem.map(mark);
    const note = mark(otherRole(side) === 'eng' ? chapter.engineerNote : chapter.businessNote);
    return { side, measuredBy, fears, saysVsHears, askThem, note };
  });
}

export interface ConceptTerms { detail: string; bulletPoints: string[] }

/**
 * `CoreConceptsSection`: every concept's `detail` first, then every concept's bullets. Beginners
 * see bullets folded, so a first marker is never spent on folded text while a later detail shows
 * the term bare; and because the order ignores fold state, unfolding one concept never moves a
 * marker in another (review S1).
 */
export function coreConceptTerms(chapter: Chapter): ConceptTerms[] {
  const concepts = chapter.coreConcepts ?? [];
  const mark = sectionMarker();
  const details = concepts.map(concept => mark(concept.detail));
  return concepts.map((concept, i) => ({ detail: details[i], bulletPoints: (concept.bulletPoints ?? []).map(mark) }));
}
