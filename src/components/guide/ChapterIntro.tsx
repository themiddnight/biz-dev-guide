import React, { useMemo } from 'react';
import type { Chapter } from '../../types';
import { RichText } from '../content/RichText';
import { primerTerms } from '../../lib/sectionTerms';

interface ChapterIntroProps {
  chapter: Chapter;
  onNavigateChapter?: (chapterId: string) => void;
  onSearchGlossary?: (query: string) => void;
}

/**
 * The chapter primer as one paragraph under the key takeaway: always visible, both levels,
 * no heading and no toggle (spec A1). Each glossary term is marked once (primerTerms).
 */
export const ChapterIntro: React.FC<ChapterIntroProps> = ({ chapter, onNavigateChapter, onSearchGlossary }) => {
  const marked = useMemo(() => primerTerms(chapter), [chapter]);
  if (!marked) return null;
  const prose = (text: string) => (
    <RichText text={text} onNavigateChapter={onNavigateChapter} onSearchGlossary={onSearchGlossary} />
  );
  return (
    <p id="chapter-intro" data-chapter-intro>
      {prose(marked.whatIsIt)}{' '}{prose(marked.whyItMatters)}{' '}{prose(marked.realWorldScenario)}
    </p>
  );
};
