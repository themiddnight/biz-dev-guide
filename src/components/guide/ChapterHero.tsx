import React, { useMemo } from 'react';
import type { Chapter } from '../../types';
import { HeroFigure } from './HeroFigure';
import type { ChapterHome, Role } from '../../data/rolePerspective';
import { RichText } from '../content/RichText';
import { heroTerms } from '../../lib/sectionTerms';

interface ChapterHeroProps {
  chapter: Chapter;
  isRead: boolean;
  role?: Role | null;
  seat?: Role;
  onFlipSeat?: () => void;
  onNavigateChapter?: (chapterId: string) => void;
  onSearchGlossary?: (query: string) => void;
}

const HOME_LABEL: Record<ChapterHome, string> = {
  biz: 'งานฝั่ง Business',
  eng: 'งานฝั่ง Engineering',
  shared: 'งานที่สองฝั่งทำร่วมกัน',
};

export const ChapterHero: React.FC<ChapterHeroProps> = ({
  chapter, isRead, role = null, seat = 'biz', onFlipSeat = () => {}, onNavigateChapter, onSearchGlossary,
}) => {
  // The hero is one section for automatic term marking (spec P3.5), computed purely from the
  // chapter. `title`, `enTerm` and `subtitle` are headings and are never marked.
  const marked = useMemo(() => heroTerms(chapter), [chapter]);
  const prose = (text: string) => (
    <RichText text={text} onNavigateChapter={onNavigateChapter} onSearchGlossary={onSearchGlossary} />
  );
  const analogy = prose(marked.plainAnalogy);

  return (
    <>
      <header className="space-y-4">
        <p className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-base-content-muted" data-chapter-meta>
          <span>บทที่ {chapter.num}</span>
          <span>{HOME_LABEL[chapter.home]}</span>
          <span>อ่าน {chapter.readTime}</span>
          {isRead && <span className="font-semibold text-success" data-read-mark>อ่านแล้ว</span>}
        </p>
        <div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-base-content sm:text-4xl">
            {chapter.title}
          </h1>
          {chapter.enTerm && <p className="mt-1 text-sm text-base-content-muted">{chapter.enTerm}</p>}
        </div>
        <p className="text-lg leading-8 text-base-content">{chapter.subtitle}</p>
        <p data-chapter-opening>{prose(marked.chapterOpening)}</p>
      </header>

      {chapter.heroFigure ? (
        <HeroFigure figure={chapter.heroFigure} analogy={analogy} role={role} seat={seat} onFlipSeat={onFlipSeat} />
      ) : (
        <p data-analogy className="text-base-content-secondary">{analogy}</p>
      )}

      <p data-key-takeaway className="border-l-2 border-base-content pl-4 text-base font-medium text-base-content">
        {prose(marked.keyTakeaway)}
      </p>
    </>
  );
};
