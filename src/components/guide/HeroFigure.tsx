import React from 'react';
import type { ChapterHeroFigure } from '../../types';
import { FIGURES } from '../figures';

interface HeroFigureProps {
  figure: ChapterHeroFigure;
  analogy?: string; // chapter.plainAnalogy, rendered as one plain line
}

/** The chapter's first visual, right under the subtitle (visual-first pilot, spec §3). */
export const HeroFigure: React.FC<HeroFigureProps> = ({ figure, analogy }) => {
  const Figure = FIGURES[figure.figureKey];
  if (!Figure) return null;
  return (
    <figure data-hero-figure className="space-y-2">
      <Figure />
      <figcaption className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-[#e5e5e5]">
        {figure.caption}
      </figcaption>
      {analogy && (
        <p data-analogy className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3]">
          💡 {analogy}
        </p>
      )}
    </figure>
  );
};
