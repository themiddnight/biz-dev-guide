import React from 'react';
import type { Chapter } from '../../../types';
import type { DiagramJumpTarget } from '../../../data/diagramFamilies';
import type { GlossaryCategory } from '../../../data/glossary';
import type { GlossaryFilter } from '../../glossary/GlossaryPanel';
import { RoleMindsetCard } from '../../RoleMindsetCard';
import { FrictionPlaybookCard } from '../../FrictionPlaybookCard';
import type { SectionKey } from '../../../data/sectionLayers';
import { PrimerSection } from './PrimerSection';
import { JargonSection } from './JargonSection';
import { DialogueSection } from './DialogueSection';
import { DiagramSection } from './DiagramSection';
import { FaqSection } from './FaqSection';
import { ExamplesSection } from './ExamplesSection';
import { CoreConceptsSection } from './CoreConceptsSection';
import { ReferenceSection } from './ReferenceSection';
import { GlossarySection } from './GlossarySection';
import { WorkflowSection } from './WorkflowSection';
import { PitfallsSection } from './PitfallsSection';
import { ChecklistSection } from './ChecklistSection';

export interface GuideSectionContext {
  chapters: Chapter[];                                      // GlossaryPanel needs the chapter list (not in spec §1.7; required by the glossary block)
  onEarnXp?: (amount: number, reason: string) => void;
  onNavigateChapter: (chapterId: string) => void;
  onDiagramJump: (t: DiagramJumpTarget) => void;
  onScrollToPlaybook: (chapterId: string) => void;
  onSearchGlossary: (q: string) => void;
  onSelectGlossaryCategory: (c: GlossaryCategory) => void;
  glossaryCategory: GlossaryFilter; setGlossaryCategory: (c: GlossaryFilter) => void;
  glossaryQuery: string; setGlossaryQuery: (q: string) => void;
  c4Level: number; setC4Level: (n: number) => void;
  checkedChecklist: Record<string, boolean>; onToggleChecklistItem: (key: string) => void;
}

export interface SectionProps { chapter: Chapter; isOpen: boolean; onToggle: () => void; ctx: GuideSectionContext }

export const MindsetSection: React.FC<SectionProps> = ({ isOpen, onToggle }) => (
  <RoleMindsetCard isOpen={isOpen} onToggle={onToggle} />
);

export const FrictionSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => (
  <FrictionPlaybookCard
    playbook={chapter.frictionPlaybook}
    chapterTitle={chapter.title}
    isOpen={isOpen}
    onToggle={onToggle}
    onEarnXp={ctx.onEarnXp}
  />
);

export const SECTION_COMPONENTS: Record<SectionKey, React.FC<SectionProps>> = {
  mindset: MindsetSection,
  friction: FrictionSection,
  primer: PrimerSection,
  jargon: JargonSection,
  dialogue: DialogueSection,
  diagram: DiagramSection,
  faq: FaqSection,
  examples: ExamplesSection,
  coreConcepts: CoreConceptsSection,
  reference: ReferenceSection,
  glossary: GlossarySection,
  workflow: WorkflowSection,
  pitfalls: PitfallsSection,
  checklist: ChecklistSection,
};
