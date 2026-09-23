import React, { useMemo } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionProps } from './registry';
import { RichText } from '../../content/RichText';
import { primerTerms } from '../../../lib/sectionTerms';

export const PrimerSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  // Each glossary term is marked once in this section (spec P3.5), computed purely from the chapter.
  const marked = useMemo(() => primerTerms(chapter), [chapter]);
  if (!marked) return null;
  const prose = (text: string) => (
    <RichText text={text} onNavigateChapter={ctx.onNavigateChapter} onSearchGlossary={ctx.onSearchGlossary} />
  );
  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        onClick={onToggle}
        className="w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] text-left cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            🌟
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
              จุดเริ่มต้นสำหรับมือใหม่ (เริ่มจากศูนย์)
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              อธิบายเรื่องนี้แบบไม่ใช้ศัพท์ยาก เข้าใจได้แม้ไม่เคยเขียนโค้ด
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />}
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-3.5 border-t border-neutral-100 dark:border-[#262626] bg-white dark:bg-[#141414] text-xs sm:text-sm">
          <div className="space-y-1">
            <div className="font-bold text-neutral-900 dark:text-[#e5e5e5] flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white inline-block"></span>
              <span>สิ่งนี้คืออะไร? (What is it?)</span>
            </div>
            <p className="text-neutral-600 dark:text-[#a3a3a3] leading-relaxed pl-3 font-normal text-xs sm:text-sm">
              {prose(marked.whatIsIt)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-neutral-900 dark:text-[#e5e5e5] flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white inline-block"></span>
              <span>ทำไมถึงสำคัญมาก? ถ้าไม่มีจะเกิดอะไรขึ้น? (Why it matters?)</span>
            </div>
            <p className="text-neutral-600 dark:text-[#a3a3a3] leading-relaxed pl-3 font-normal text-xs sm:text-sm">
              {prose(marked.whyItMatters)}
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-1">
            <div className="font-bold text-neutral-900 dark:text-[#fafafa] flex items-center gap-1.5 text-xs">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>เทียบกับเรื่องในชีวิตประจำวัน (Real-World Analogy)</span>
            </div>
            <p className="text-neutral-600 dark:text-[#a3a3a3] leading-relaxed font-normal text-xs">
              {prose(marked.realWorldScenario)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
