import React from 'react';
import type { Chapter, ExperienceLevel } from '../../../types';
import type { DiagramJumpTarget } from '../../../data/diagramFamilies';
import type { GlossaryCategory } from '../../../data/glossary';
import type { GlossaryFilter } from '../../glossary/GlossaryPanel';
import { RoleMindsetCard } from '../../RoleMindsetCard';
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

export interface SectionProps { chapter: Chapter; isOpen: boolean; onToggle: () => void; ctx: GuideSectionContext }

const MindsetSection: React.FC<SectionProps> = ({ isOpen, onToggle }) => (
  <RoleMindsetCard isOpen={isOpen} onToggle={onToggle} />
);

const FrictionSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  // Present only with a playbook (spec A4); the guard narrows the type without a non-null assertion.
  if (!chapter.frictionPlaybook) return null;
  return <FrictionPlaybookCard playbook={chapter.frictionPlaybook} isOpen={isOpen} onToggle={onToggle} />;
};

export const SECTION_COMPONENTS: Record<SectionKey, React.FC<SectionProps>> = {
  mindset: MindsetSection,
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
