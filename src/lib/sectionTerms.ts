import type { Chapter, FrictionPlaybook, SaysVsHears } from '../types';
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

export interface HeroTerms {
  chapterOpening: string;
  /** The seat lines under the hero figure that were asked for; absent without a figure. */
  seats: Partial<Record<Role, string>>;
  plainAnalogy: string;
  keyTakeaway: string;
}

/**
 * `ChapterHero`, in document order: the opening line (spec P4.3), the seat lines the reader sees
 * under the figure (`seats`: both with no role, otherwise the one seat shown), the analogy, then
 * the takeaway. Like the other-side switch, flipping the seat is an input, never render state.
 */
export function heroTerms(chapter: Chapter, seats: readonly Role[]): HeroTerms {
  const seen = new Set<string>();
  const mark = (text: string) => markTerms(text, 'prose', seen);
  const chapterOpening = mark(chapter.chapterOpening);
  // Each seat line starts from what the opening defined and adds nothing to the shared set, so
  // flipping the seat never moves a marker in the analogy or the takeaway.
  const seatLines: Partial<Record<Role, string>> = {};
  const figure = chapter.heroFigure;
  if (figure) for (const side of seats) seatLines[side] = sectionMarker(seen)(figure.seats[side]);
  const plainAnalogy = mark(chapter.plainAnalogy);
  return { chapterOpening, seats: seatLines, plainAnalogy, keyTakeaway: mark(chapter.keyTakeaway) };
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

export interface JargonCardTerms { humanTranslation: string; formalDefinition?: string; meetingExample?: string }

/**
 * `JargonSection`, row by row in render order: translation, formal definition, meeting example.
 * Seeded with the rows' own subjects: a row never re-marks what the block defines.
 */
export function jargonTerms(chapter: Chapter): JargonCardTerms[] {
  const cards = chapter.jargonList ?? [];
  const mark = sectionMarker(cards.flatMap(card => collectTermIds(card.term)));
  const optional = (text: string | undefined) => (text === undefined ? undefined : mark(text));
  return cards.map(card => {
    const humanTranslation = mark(card.humanTranslation);
    const formalDefinition = optional(card.formalDefinition);
    return { humanTranslation, formalDefinition, meetingExample: optional(card.meetingExample) };
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

export interface DialogueSideTerms { speaker: string; text: string; outcome: string }
export interface ExampleCaseTerms { situation: string; whatHappened: string; resolution: string; keyLesson: string }
export interface ExamplesTerms {
  dialogue?: { context: string; wrongWay: DialogueSideTerms; rightWay: DialogueSideTerms };
  cases: ExampleCaseTerms[];
}

/** `ExamplesSection`: the dialogue (context, wrong way, right way), then each case. Case titles are headings. */
export function examplesTerms(chapter: Chapter): ExamplesTerms {
  const mark = sectionMarker();
  const side = (speaker: string, text: string, outcome: string): DialogueSideTerms => {
    const markedSpeaker = mark(speaker);
    const markedText = mark(text);
    return { speaker: markedSpeaker, text: markedText, outcome: mark(outcome) };
  };
  const source = chapter.dialogueExample;
  let dialogue: ExamplesTerms['dialogue'];
  if (source) {
    const context = mark(source.context);
    const wrongWay = side(source.wrongWay.speaker, source.wrongWay.text, source.wrongWay.issue);
    dialogue = { context, wrongWay, rightWay: side(source.rightWay.speaker, source.rightWay.text, source.rightWay.benefit) };
  }
  const cases = (chapter.realWorldExamples ?? []).map(example => {
    const situation = mark(example.situation);
    const whatHappened = mark(example.whatHappened);
    const resolution = mark(example.resolution);
    return { situation, whatHappened, resolution, keyLesson: mark(example.keyLesson) };
  });
  return { dialogue, cases };
}

export interface PracticeTerms { steps: string[]; checklist: string[] }

/** `PracticeSection`: each workflow step's description, then each checklist item. Step names are headings. */
export function practiceTerms(chapter: Chapter): PracticeTerms {
  const mark = sectionMarker();
  const steps = (chapter.realWorldWorkflow ?? []).map(step => mark(step.description));
  return { steps, checklist: (chapter.checklist ?? []).map(mark) };
}

export interface PitfallTerms { symptom?: string; solution: string }

/** `PitfallsSection`: each pitfall's warning sign, then its fix. The pitfall line is a heading. */
export function pitfallTerms(chapter: Chapter): PitfallTerms[] {
  const mark = sectionMarker();
  return (chapter.commonPitfalls ?? []).map(pitfall => {
    const symptom = pitfall.symptom === undefined ? undefined : mark(pitfall.symptom);
    return { symptom, solution: mark(pitfall.solution) };
  });
}

export interface FrictionTerms {
  businessFrustration: string;
  engineerFrustration: string;
  underlyingRootCause: string;
  tradeOffs: { ifYouNeed: string; youMustSacrifice: string; howToNegotiate: string }[];
  scripts: { businessScript?: string; engineerScript?: string }[];
  dilemma?: { scenario: string; counterpartQuote: string; options: { result: string; tip: string }[] };
}

/**
 * `FrictionPlaybookCard`, top to bottom. The battleground title and each script's situation are
 * headings. A dilemma option's text sits inside its button, where a term button cannot nest, so it
 * is not marked. Each option's result and tip show only after that option is picked, so each is
 * walked from a copy of what the playbook has marked so far: picking one option never spends a
 * marker another option's explanation needs.
 */
export function frictionTerms(playbook: FrictionPlaybook): FrictionTerms {
  const seen = new Set<string>();
  const mark = (text: string) => markTerms(text, 'prose', seen);
  const optional = (text: string | undefined) => (text === undefined ? undefined : mark(text));
  const businessFrustration = mark(playbook.businessFrustration);
  const engineerFrustration = mark(playbook.engineerFrustration);
  const underlyingRootCause = mark(playbook.underlyingRootCause);
  const tradeOffs = playbook.tradeOffMatrix.map(row => {
    const ifYouNeed = mark(row.ifYouNeed);
    const youMustSacrifice = mark(row.youMustSacrifice);
    return { ifYouNeed, youMustSacrifice, howToNegotiate: mark(row.howToNegotiate) };
  });
  const scripts = playbook.goldenScripts.map(script => {
    const businessScript = optional(script.businessScript);
    return { businessScript, engineerScript: optional(script.engineerScript) };
  });
  let dilemma: FrictionTerms['dilemma'];
  if (playbook.dilemma) {
    const scenario = mark(playbook.dilemma.scenario);
    const counterpartQuote = mark(playbook.dilemma.counterpartQuote);
    const options = playbook.dilemma.options.map(option => {
      const markOption = sectionMarker(seen);
      const result = markOption(option.result);
      return { result, tip: markOption(option.tip) };
    });
    dilemma = { scenario, counterpartQuote, options };
  }
  return { businessFrustration, engineerFrustration, underlyingRootCause, tradeOffs, scripts, dilemma };
}
