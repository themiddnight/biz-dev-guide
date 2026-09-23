import React from 'react';
import { ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';

export const PitfallsSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  /* SECTION 7: กับดักที่เจอบ่อยและทางออก (Common Pitfalls & Solutions) */
  if (!chapter.commonPitfalls || chapter.commonPitfalls.length === 0) return null;
  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            ⚠️
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
              กับดักที่เจอบ่อยและทางแก้ (Pitfalls &amp; Solutions)
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              เรื่องที่มักทำให้โปรเจกต์ช้าหรือพัง พร้อมวิธีกัน
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 space-y-3 border-t border-neutral-100 dark:border-[#262626] bg-white dark:bg-[#141414]">
          {chapter.commonPitfalls.map((cp, cpIdx) => (
            <div
              key={cpIdx}
              className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-1.5 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-300 text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span>กับดัก: {cp.pitfall}</span>
              </div>
              <div className="pl-5 text-neutral-700 dark:text-[#c4c4c4] leading-relaxed text-xs">
                <span className="font-bold text-emerald-800 dark:text-emerald-400">💡 ทางแก้: </span>
                <span>{cp.solution}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
