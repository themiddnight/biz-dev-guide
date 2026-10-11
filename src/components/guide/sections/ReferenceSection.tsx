import React from 'react';
import { ContentBlocks } from '../../content/ContentBlocks';
import { getReferenceSections } from '../../../data/sectionLayers';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';

export const ReferenceSection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
  const referenceSections = getReferenceSections(chapter);
  if (referenceSections.length === 0) return null;
  const blockCount = referenceSections.reduce((sum, section) => sum + section.blocks.length, 0);
  return (
    <SectionShell {...props} sectionKey="reference" note={`${blockCount} รายการ`}>
      <ContentBlocks sections={referenceSections} placement="reference" onNavigateChapter={ctx.onNavigateChapter} />
    </SectionShell>
  );
};
