import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlossaryPanel } from '../../glossary/GlossaryPanel';
import { GLOSSARY } from '../../../data/glossary';
import type { SectionProps } from './registry';

export const GlossarySection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  if (chapter.id !== 's15') return null;
  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        onClick={onToggle}
        aria-expanded={!!isOpen}
        className="w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] text-left cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            📖
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
              รวมคำศัพท์ (Glossary)
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              ค้นหาและกรองศัพท์ทั้งหมด {GLOSSARY.length} คำ ตามหมวด
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 border-t border-neutral-100 dark:border-[#262626] bg-white dark:bg-[#141414]">
          <GlossaryPanel
            terms={GLOSSARY}
            chapters={ctx.chapters}
            onNavigateChapter={ctx.onNavigateChapter}
            category={ctx.glossaryCategory}
            onCategoryChange={ctx.setGlossaryCategory}
            query={ctx.glossaryQuery}
            onQueryChange={ctx.setGlossaryQuery}
          />
        </div>
      )}
    </div>
  );
};
