import React from 'react';
import { X } from 'lucide-react';
import type { Chapter } from '../../types';

export const ResumeBanner: React.FC<{ chapter: Chapter; onResume: () => void; onDismiss: () => void }> = ({ chapter, onResume, onDismiss }) => (
  <div data-resume-banner className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#181818]">
    <p className="text-xs sm:text-sm text-neutral-800 dark:text-[#d4d4d4] min-w-0">
      อ่านต่อจากครั้งก่อน? บทที่ {chapter.num}: {chapter.title}
    </p>
    <div className="flex items-center gap-2 shrink-0">
      <button type="button" onClick={onResume} className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] text-xs font-bold cursor-pointer">
        อ่านต่อบทที่ {chapter.num}
      </button>
      <button type="button" onClick={onDismiss} aria-label="ปิดแถบอ่านต่อ" title="ปิด" className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-[#262626] cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);
