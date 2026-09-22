import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Chapter, ExperienceLevel } from '../../types';
import { TRACK_META, type TrackNext } from '../../data/readingTracks';

const cardClass = 'p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] text-right bg-neutral-50/70 dark:bg-[#181818]';

export const TrackNextCard: React.FC<{
  next: Extract<TrackNext, { kind: 'next' }>;
  chapters: Chapter[];
  onSelectChapter: (id: string) => void;
}> = ({ next, chapters, onSelectChapter }) => {
  const chapter = chapters.find(c => c.id === next.chapterId);
  if (!chapter) return null;
  return (
    <button type="button" data-track-next={chapter.id} onClick={() => onSelectChapter(chapter.id)} className={`${cardClass} hover:border-neutral-400 dark:hover:border-[#404040] transition-all cursor-pointer group`}>
      <div className="flex items-center justify-end gap-1 text-[11px] text-neutral-900 dark:text-white font-semibold">
        <span>บทถัดไปใน track</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
      <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa] mt-1 truncate">
        บทที่ {chapter.num}: {chapter.title}
      </div>
    </button>
  );
};

export const TrackEndCard: React.FC<{
  experienceLevel: ExperienceLevel;
  onStartQuiz: () => void;
  onOpenIndex: (e: React.MouseEvent<HTMLElement>) => void;
}> = ({ experienceLevel, onStartQuiz, onOpenIndex }) => (
  <div data-track-end className={`${cardClass} space-y-2`}>
    <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa]">จบเส้นทาง{TRACK_META[experienceLevel].title}แล้ว</div>
    <div className="flex flex-wrap justify-end gap-2">
      <button type="button" onClick={onStartQuiz} className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] text-xs font-bold cursor-pointer">ทำแบบทดสอบ</button>
      <button type="button" onClick={onOpenIndex} className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-[#333333] text-xs font-semibold cursor-pointer">ดูสารบัญทั้งหมด</button>
    </div>
  </div>
);
