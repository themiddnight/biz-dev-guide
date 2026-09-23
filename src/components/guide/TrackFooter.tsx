import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Chapter } from '../../types';
import { TRACK_META, type TrackKey, type TrackNext } from '../../data/readingTracks';
import { TAP } from '../ui/tapTarget';
import { Button } from '../ui/Button';

const cardClass = 'p-box rounded-box border border-base-border text-right bg-base-300';

export const TrackNextCard: React.FC<{
  next: Extract<TrackNext, { kind: 'next' }>;
  chapters: Chapter[];
  onSelectChapter: (id: string) => void;
}> = ({ next, chapters, onSelectChapter }) => {
  const chapter = chapters.find(c => c.id === next.chapterId);
  if (!chapter) return null;
  return (
    <button type="button" data-track-next={chapter.id} onClick={() => onSelectChapter(chapter.id)} className={`${TAP} ${cardClass} hover:border-base-border-strong transition-all cursor-pointer group`}>
      <div className="flex items-center justify-end gap-1 text-[11px] text-base-content font-semibold">
        <span>บทถัดไปใน track</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
      <div className="font-bold text-xs sm:text-sm text-base-content mt-1 truncate">
        บทที่ {chapter.num}: {chapter.title}
      </div>
    </button>
  );
};

export const TrackEndCard: React.FC<{
  trackKey: TrackKey;
  onStartQuiz: () => void;
  onOpenIndex: (e: React.MouseEvent<HTMLElement>) => void;
}> = ({ trackKey, onStartQuiz, onOpenIndex }) => (
  <div data-track-end className={`${cardClass} space-y-2`}>
    <div className="font-bold text-xs sm:text-sm text-base-content">จบ{TRACK_META[trackKey].title}แล้ว</div>
    <div className="flex flex-wrap justify-end gap-2">
      <Button color="primary" variant="solid" size="sm" onClick={onStartQuiz}>ทำแบบทดสอบ</Button>
      <Button color="neutral" variant="outline" size="sm" onClick={onOpenIndex}>ดูสารบัญทั้งหมด</Button>
    </div>
  </div>
);
