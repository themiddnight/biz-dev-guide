import React from 'react';
import { Check } from 'lucide-react';
import type { Chapter, ExperienceLevel } from '../../types';
import { TRACK_META, getTrackMinutes, getTrackProgress, resolveTrack } from '../../data/readingTracks';

interface TrackPanelProps {
  chapters: Chapter[];
  experienceLevel: ExperienceLevel;
  readChapters: string[];
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onStartQuiz: () => void;
}

export const TrackPanel: React.FC<TrackPanelProps> = ({ chapters, experienceLevel, readChapters, activeChapterId, onSelectChapter, onStartQuiz }) => {
  const trackIds = resolveTrack(experienceLevel, chapters);
  const { read, total, firstUnreadId } = getTrackProgress(trackIds, readChapters);
  const minutes = getTrackMinutes(trackIds, chapters);
  const pct = total === 0 ? 0 : Math.round((read / total) * 100);

  return (
    <div data-track-panel={experienceLevel} className="p-3 rounded-xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#181818] space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-[#fafafa]">{TRACK_META[experienceLevel].title}</h3>
        <span className="text-[11px] text-neutral-500 dark:text-[#8e8e8e] font-mono">≈ {minutes} นาที</span>
      </div>
      <div className="space-y-1">
        <div className="text-[11px] text-neutral-600 dark:text-[#a3a3a3] font-mono" data-track-progress>อ่านแล้ว {read}/{total}</div>
        <div className="h-1 rounded-full bg-neutral-200 dark:bg-[#262626] overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ol className="space-y-1">
        {trackIds.map((id, index) => {
          const chapter = chapters.find(c => c.id === id);
          if (!chapter) return null;
          const isActive = id === activeChapterId;
          const isRead = readChapters.includes(id);
          return (
            <li key={id}>
              <button
                type="button"
                data-track-item={id}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelectChapter(id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs cursor-pointer ${
                  isActive ? 'bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a]' : 'text-neutral-800 dark:text-[#d4d4d4] hover:bg-neutral-100 dark:hover:bg-[#1f1f1f]'
                }`}
              >
                <span className="w-5 shrink-0 font-mono text-[10px] opacity-70">{index + 1}</span>
                <span className="flex-1 truncate">บทที่ {chapter.num}: {chapter.title}</span>
                {isRead && <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" aria-label="อ่านแล้ว" />}
              </button>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        data-track-primary
        onClick={() => (firstUnreadId === null ? onStartQuiz() : onSelectChapter(firstUnreadId))}
        className="w-full px-3 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] text-xs font-bold cursor-pointer"
      >
        {firstUnreadId === null ? 'จบเส้นทางแล้ว — ทำแบบทดสอบ' : read === 0 ? 'เริ่มอ่าน' : 'อ่านต่อ'}
      </button>
    </div>
  );
};
