import React, { useMemo } from 'react';
import { Clock, Check, Sparkles } from 'lucide-react';
import type { Chapter, ExperienceLevel } from '../../types';
import { HeroFigure } from './HeroFigure';
import type { Role } from '../../data/rolePerspective';
import { RichText } from '../content/RichText';
import { heroTerms } from '../../lib/sectionTerms';

interface ChapterHeroProps {
  chapter: Chapter;
  experienceLevel: ExperienceLevel;
  isRead: boolean;
  role?: Role | null;
  seat?: Role;
  onFlipSeat?: () => void;
  onNavigateChapter?: (chapterId: string) => void;
  onSearchGlossary?: (query: string) => void;
}

export const ChapterHero: React.FC<ChapterHeroProps> = ({
  chapter, experienceLevel, isRead, role = null, seat = 'biz', onFlipSeat = () => {}, onNavigateChapter, onSearchGlossary,
}) => {
  // The hero is one section for automatic term marking (spec P3.5), computed purely from the
  // chapter. `title`, `enTerm` and `subtitle` are headings and are never marked.
  const marked = useMemo(() => heroTerms(chapter), [chapter]);
  const prose = (text: string) => (
    <RichText text={text} onNavigateChapter={onNavigateChapter} onSearchGlossary={onSearchGlossary} />
  );
  const analogyFirst = !!chapter.heroFigure; // the figure's analogy line renders above the takeaway
  const analogy = analogyFirst ? prose(marked.plainAnalogy) : null;
  const takeaway = prose(marked.keyTakeaway);
  const analogyHeading = (
    <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-[#fafafa]">
      <Sparkles className="w-4 h-4 text-amber-500" />
      <span>เปรียบแบบบ้านๆ (Real-World Analogy)</span>
    </div>
  );
  const analogyBody = analogyFirst ? null : (
    <p className="text-xs sm:text-sm text-neutral-700 dark:text-[#c4c4c4] leading-relaxed font-normal">
      {prose(marked.plainAnalogy)}
    </p>
  );
  const analogyClassName = 'p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-1.5';

  return (
    <>
      {/* Chapter Header */}
      <div className="space-y-3 pb-4 sm:pb-5 border-b border-neutral-100 dark:border-[#262626]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
            {chapter.num}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#333333] text-neutral-800 dark:text-[#d4d4d4] text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
            {chapter.roleTag}
          </span>
          <span className="flex items-center gap-1 text-[11px] sm:text-xs text-neutral-500 dark:text-[#737373] font-medium">
            <Clock className="w-3.5 h-3.5" />
            {chapter.readTime}
          </span>
          {isRead && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/50 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-semibold">
              <Check className="w-3 h-3" />
              ผ่านแล้ว
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-neutral-900 dark:text-[#fafafa] tracking-tight leading-tight">
          {chapter.title}
        </h1>
        {chapter.enTerm && (
          <span className="inline-block px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#333333] text-neutral-600 dark:text-[#a3a3a3] text-[11px] font-semibold">
            {chapter.enTerm}
          </span>
        )}
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#8e8e8e] leading-relaxed font-normal">
          {chapter.subtitle}
        </p>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#8e8e8e] leading-relaxed font-normal" data-chapter-opening>
          {prose(marked.chapterOpening)}
        </p>
        {chapter.heroFigure && (
          <HeroFigure figure={chapter.heroFigure} analogy={analogy} role={role} seat={seat} onFlipSeat={onFlipSeat} />
        )}
        <p className="text-sm text-neutral-800 dark:text-[#d4d4d4] leading-relaxed" data-key-takeaway>
          <span className="font-semibold">สรุปบทนี้:</span> {takeaway}
        </p>
      </div>

      {/* Quick Metaphor. Hero chapters show it as one line under the figure.
          The business/engineer notes moved to OtherSideSection (spec D7). */}
      {chapter.heroFigure ? null : experienceLevel === 'beginner' ? (
        <div className={analogyClassName} data-analogy>
          {analogyHeading}
          {analogyBody}
        </div>
      ) : (
        <details className={analogyClassName} data-analogy>
          <summary className="cursor-pointer">{analogyHeading}</summary>
          {analogyBody}
        </details>
      )}
    </>
  );
};
