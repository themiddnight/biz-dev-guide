import React, { useState } from 'react';
import type { Chapter, ExperienceLevel } from '../../../types';
import type { DiagramJumpTarget } from '../../../data/diagramFamilies';
import type { GlossaryCategory } from '../../../data/glossary';
import type { GlossaryFilter } from '../../glossary/GlossaryPanel';
import { FrictionPlaybookCard } from '../../FrictionPlaybookCard';
import type { SectionKey } from '../../../data/sectionLayers';
import type { Role } from '../../../data/rolePerspective';
import { JargonSection } from './JargonSection';
import { DiagramSection } from './DiagramSection';
import { FaqSection } from './FaqSection';
import { ExamplesSection } from './ExamplesSection';
import { CoreConceptsSection } from './CoreConceptsSection';
import { ReferenceSection } from './ReferenceSection';
import { GlossarySection } from './GlossarySection';
import { PracticeSection } from './PracticeSection';
import { PitfallsSection } from './PitfallsSection';
import { OtherSideSection } from './OtherSideSection';
import { SectionShell } from './SectionShell';

/** Which side the other-side box shows (spec P2.2). Session state in GuideTab, not persisted. */
export type OtherSideView = Role | 'both';

export interface GuideSectionContext {
  chapters: Chapter[];                                      // GlossaryPanel needs the chapter list (not in spec §1.7; required by the glossary block)
  onNavigateChapter: (chapterId: string) => void;
  onDiagramJump: (t: DiagramJumpTarget) => void;
  onScrollToPlaybook: (chapterId: string) => void;
  onSearchGlossary: (q: string) => void;
  onSelectGlossaryCategory: (c: GlossaryCategory) => void;
  glossaryCategory: GlossaryFilter; setGlossaryCategory: (c: GlossaryFilter) => void;
  glossaryQuery: string; setGlossaryQuery: (q: string) => void;
  c4Level: number; setC4Level: (n: number) => void;
  checkedChecklist: Record<string, boolean>; onToggleChecklistItem: (key: string) => void;
  role: Role | null;
  chapterLevel: ExperienceLevel;                            // resolved level of the open chapter; beginners see core concepts compact
  otherSideView: OtherSideView; setOtherSideView: (v: OtherSideView) => void;
}

/**
 * How a section sits in the reader's layout: a Core section is always open and has no control,
 * any other section folds and its heading is the control.
 */
export type SectionFold =
  | { foldable: false }
  | { foldable: true; isOpen: boolean; onToggle: () => void };

export interface SectionProps { chapter: Chapter; fold: SectionFold; ctx: GuideSectionContext }

const FrictionSection: React.FC<SectionProps> = props => {
  // Present only with a playbook (spec A4); the guard narrows the type without a non-null assertion.
  const playbook = props.chapter.frictionPlaybook;
  // The answer lives here, not in the card: the card unmounts when the section folds. It carries
  // its chapter so one chapter's answer never shows on the next.
  const [answer, setAnswer] = useState<{ chapterId: string; optionId: string } | null>(null);
  if (!playbook) return null;
  const chapterId = props.chapter.id;
  return (
    <SectionShell {...props} sectionKey="friction" note="เมื่อสองฝั่งเถียงกันเรื่องนี้">
      <FrictionPlaybookCard
        playbook={playbook}
        ctx={props.ctx}
        selectedOptionId={answer?.chapterId === chapterId ? answer.optionId : null}
        onSelectOption={optionId => setAnswer({ chapterId, optionId })}
      />
    </SectionShell>
  );
};

export const SECTION_COMPONENTS: Record<SectionKey, React.FC<SectionProps>> = {
  otherSide: OtherSideSection,
  friction: FrictionSection,
  jargon: JargonSection,
  diagram: DiagramSection,
  faq: FaqSection,
  examples: ExamplesSection,
  coreConcepts: CoreConceptsSection,
  reference: ReferenceSection,
  glossary: GlossarySection,
  practice: PracticeSection,
  pitfalls: PitfallsSection,
};
