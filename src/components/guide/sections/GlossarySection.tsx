import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GlossaryPanel } from '../../glossary/GlossaryPanel';
import { GLOSSARY } from '../../../data/glossary';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';

export const GlossarySection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  if (chapter.id !== 's15') return null;
  return (
    <div className="border border-base-border rounded-2xl overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        aria-expanded={!!isOpen}
        className={`${TAP} w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-base-300 hover:bg-base-border text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            📖
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              รวมคำศัพท์ (Glossary)
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              ค้นหาและกรองศัพท์ทั้งหมด {GLOSSARY.length} คำ ตามหมวด
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 border-t border-base-border bg-base-100">
          <GlossaryPanel
            terms={GLOSSARY}
            chapters={ctx.chapters}
            onNavigateChapter={ctx.onNavigateChapter}
            category={ctx.glossaryCategory}
            onCategoryChange={ctx.setGlossaryCategory}
            query={ctx.glossaryQuery}
            onQueryChange={ctx.setGlossaryQuery}
            role={ctx.role}
          />
        </div>
      )}
    </div>
  );
};
