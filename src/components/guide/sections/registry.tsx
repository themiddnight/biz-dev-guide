import type React from 'react';
import type { AudienceMode, Chapter } from '../../../types';
import type { DiagramJumpTarget } from '../../../data/diagramFamilies';
import type { GlossaryCategory } from '../../../data/glossary';
import type { GlossaryFilter } from '../../glossary/GlossaryPanel';

export interface GuideSectionContext {
  chapters: Chapter[];                                      // GlossaryPanel needs the chapter list (not in spec §1.7; required by the glossary block)
  audienceMode: AudienceMode;
  onAudienceChange?: (m: AudienceMode) => void;
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
