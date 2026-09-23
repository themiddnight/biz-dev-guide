import React from 'react';
import { Check } from 'lucide-react';
import type { Chapter } from '../../types';
import { TRACK_META, getTrackMinutes, getTrackProgress, resolveTrack, trackPrimaryLabel, type TrackKey } from '../../data/readingTracks';
import { Button } from '../ui/Button';
import { ToggleChip } from '../ui/ToggleChip';

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
    <div data-track-panel={trackKey} className="p-3 rounded-xl border border-base-border bg-base-100 space-y-2.5">
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
              <ToggleChip
                selected={isActive}
                shape="card"
                tap="gap-4"
                data-track-item={id}
                aria-current={isActive ? 'true' : false}
                onClick={() => onSelectChapter(id)}
                className="flex items-center gap-2 px-2 py-1.5 text-xs"
              >
                <span className="w-5 shrink-0 text-[10px] opacity-70" aria-label={`บทที่ ${chapter.num}`}>{chapter.num}</span>
                <span className="flex-1 truncate" title={chapter.title}>{chapter.title}</span>
                {isRead && <Check className="w-3.5 h-3.5 shrink-0 text-success" aria-label="อ่านแล้ว" />}
              </ToggleChip>
            </li>
          );
        })}
      </ol>
      <Button
        color="primary"
        variant="soft"
        size="sm"
        block
        data-track-primary
        onClick={() => (firstUnreadId === null ? onStartQuiz() : onSelectChapter(firstUnreadId))}
      >
        {trackPrimaryLabel(read, firstUnreadId)}
      </Button>
    </div>
  );
};
