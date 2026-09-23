import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FrictionFaqSection } from '../../FrictionFaqSection';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';
import { IconBadge } from '../../ui/IconBadge';

export const FaqSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  if (chapter.id !== 's11') return null;
  return (
    <div className="border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        aria-expanded={!!isOpen}
        className={`${TAP} w-full p-box flex items-center justify-between bg-base-300 hover:bg-base-border text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <IconBadge size="md">❓</IconBadge>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              คำถามที่แต่ละฝั่งบ่นกันจริงๆ (12 ข้อ)
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              คำอธิบายว่าอีกฝั่งกำลังเจออะไรอยู่ และทางออกที่ใช้ได้จริง
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-box border-t border-base-border bg-base-100">
          <FrictionFaqSection
            onNavigateChapter={ctx.onNavigateChapter}
            onScrollToPlaybook={ctx.onScrollToPlaybook}
            onSearchGlossary={ctx.onSearchGlossary}
          />
        </div>
      )}
    </div>
  );
};
