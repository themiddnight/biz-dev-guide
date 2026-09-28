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
 * The chapter primer as plain intro prose under the hero: always visible, both levels,
 * no heading and no toggle (spec A1). Each glossary term is marked once (primerTerms).
 */
export const ChapterIntro: React.FC<ChapterIntroProps> = ({ chapter, onNavigateChapter, onSearchGlossary }) => {
  const marked = useMemo(() => primerTerms(chapter), [chapter]);
  if (!marked) return null;
  const prose = (text: string) => (
    <RichText text={text} onNavigateChapter={onNavigateChapter} onSearchGlossary={onSearchGlossary} />
  );
  return (
    <p id="chapter-intro" data-chapter-intro className="text-sm text-base-content-secondary leading-relaxed">
      {prose(marked.whatIsIt)}{' '}{prose(marked.whyItMatters)}{' '}{prose(marked.realWorldScenario)}
    </p>
  );
};
