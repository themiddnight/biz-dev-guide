import React from 'react';
import type { ChapterContentSection } from '../../types';
import { ContentBlocks } from '../content/ContentBlocks';

interface InlineSectionsProps {
  sections: ChapterContentSection[];
  onNavigateChapter?: (chapterId: string) => void;
  className?: string;
}

/** Content sections with `placement: 'inline'`, rendered next to their anchor paragraph. */
export const InlineSections: React.FC<InlineSectionsProps> = ({ sections, onNavigateChapter, className }) => {
  if (sections.length === 0) return null;
  return (
    <div className={className} data-inline-figure="">
      <ContentBlocks sections={sections} placement="inline" onNavigateChapter={onNavigateChapter} />
    </div>
  );
};
