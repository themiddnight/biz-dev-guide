import React from 'react';
import { Check } from 'lucide-react';
import type { Chapter } from '../../types';
import { TRACK_META, getTrackMinutes, getTrackProgress, resolveTrack, trackPrimaryLabel, type TrackKey } from '../../data/readingTracks';
import { TAP, TAP_GAP } from '../ui/tapTarget';

interface TrackPanelProps {
  chapters: Chapter[];
  trackKey: TrackKey;
  readChapters: string[];
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onStartQuiz: () => void;
}

export const TrackPanel: React.FC<TrackPanelProps> = ({ chapters, trackKey, readChapters, activeChapterId, onSelectChapter, onStartQuiz }) => {
  const trackIds = resolveTrack(trackKey, chapters);
  const { read, total, firstUnreadId } = getTrackProgress(trackIds, readChapters);
  const minutes = getTrackMinutes(trackIds, chapters);
  const pct = total === 0 ? 0 : Math.round((read / total) * 100);

  return (
    <div data-track-panel={trackKey} className="p-3 rounded-xl border border-base-border bg-base-300 space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-extrabold text-base-content">{TRACK_META[trackKey].title}</h3>
        <span className="text-[11px] text-base-content-muted">≈ {minutes} นาที</span>
      </div>
      <div className="space-y-1">
        <div className="text-[11px] text-base-content-secondary" data-track-progress>อ่านแล้ว {read}/{total}</div>
        <div className="h-1 rounded-full bg-base-border overflow-hidden">
          <div className="h-full bg-success" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ol className="space-y-1">
        {trackIds.map((id) => {
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
                className={`${TAP_GAP[4]} w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs cursor-pointer ${
                  isActive ? 'bg-primary text-primary-content' : 'text-base-content-body hover:bg-base-300'
                }`}
              >
                <span className="w-5 shrink-0 text-[10px] opacity-70" aria-label={`บทที่ ${chapter.num}`}>{chapter.num}</span>
                <span className="flex-1 truncate" title={chapter.title}>{chapter.title}</span>
                {isRead && <Check className="w-3.5 h-3.5 shrink-0 text-success" aria-label="อ่านแล้ว" />}
              </button>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        data-track-primary
        onClick={() => (firstUnreadId === null ? onStartQuiz() : onSelectChapter(firstUnreadId))}
        className={`${TAP} w-full px-3 py-2 rounded-lg bg-primary text-primary-content text-xs font-bold cursor-pointer`}
      >
        {trackPrimaryLabel(read, firstUnreadId)}
      </button>
    </div>
  );
};
