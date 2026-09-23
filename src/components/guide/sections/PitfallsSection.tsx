import React from 'react';
import { ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';
import { IconBadge } from '../../ui/IconBadge';

export const PitfallsSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  /* SECTION 7: กับดักที่เจอบ่อยและทางออก (Common Pitfalls & Solutions) */
  if (!chapter.commonPitfalls || chapter.commonPitfalls.length === 0) return null;
  return (
    <div className="border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-box flex items-center justify-between bg-base-300 hover:bg-base-border text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <IconBadge size="md">⚠️</IconBadge>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              กับดักที่เจอบ่อยและทางแก้ (Pitfalls &amp; Solutions)
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              เรื่องที่มักทำให้โปรเจกต์ช้าหรือพัง พร้อมวิธีกัน
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-box space-y-3 border-t border-base-border bg-base-100">
          {chapter.commonPitfalls.map((cp, cpIdx) => (
            <div
              key={cpIdx}
              className="p-3.5 rounded-xl bg-error/10 border border-error/40 space-y-1.5 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-1.5 font-bold text-error text-xs">
                <ShieldAlert className="w-4 h-4 text-error shrink-0" />
                <span>กับดัก: {cp.pitfall}</span>
              </div>
              <div className="pl-5 text-base-content-body leading-relaxed text-xs">
                <span className="font-bold text-success">💡 ทางแก้: </span>
                <span>{cp.solution}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
