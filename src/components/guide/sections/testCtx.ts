import { CHAPTERS } from '../../../data/chaptersData';
import type { GuideSectionContext } from './registry';

const noop = () => {};

/** A full `GuideSectionContext` stub for section tests; pass overrides for the fields under test. */
export const ctxFor = (over: Partial<GuideSectionContext> = {}): GuideSectionContext => ({
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
