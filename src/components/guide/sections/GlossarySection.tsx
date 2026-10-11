import React from 'react';
import { GlossaryPanel } from '../../glossary/GlossaryPanel';
import { GLOSSARY } from '../../../data/glossary';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';

export const GlossarySection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
  if (chapter.id !== 's15') return null;
  return (
    <SectionShell {...props} sectionKey="glossary" note={`${GLOSSARY.length} คำ`}>
      <GlossaryPanel
        terms={GLOSSARY}
        chapters={ctx.chapters}
        onNavigateChapter={ctx.onNavigateChapter}
        category={ctx.glossaryCategory}
        onCategoryChange={ctx.setGlossaryCategory}
        query={ctx.glossaryQuery}
        onQueryChange={ctx.setGlossaryQuery}
        role={ctx.role}
      />
    </SectionShell>
  );
};
