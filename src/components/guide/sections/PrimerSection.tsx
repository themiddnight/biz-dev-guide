import React, { useMemo } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionProps } from './registry';
import { RichText } from '../../content/RichText';
import { primerTerms } from '../../../lib/sectionTerms';
import { TAP } from '../../ui/tapTarget';
import { IconBadge } from '../../ui/IconBadge';

export const PrimerSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  // Each glossary term is marked once in this section (spec P3.5), computed purely from the chapter.
  const marked = useMemo(() => primerTerms(chapter), [chapter]);
  if (!marked) return null;
  const prose = (text: string) => (
    <RichText text={text} onNavigateChapter={ctx.onNavigateChapter} onSearchGlossary={ctx.onSearchGlossary} />
  );
  return (
    <div className="border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-box flex items-center justify-between bg-base-300 hover:bg-base-border text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <IconBadge size="md">🌟</IconBadge>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              จุดเริ่มต้นสำหรับมือใหม่ (เริ่มจากศูนย์)
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              อธิบายเรื่องนี้แบบไม่ใช้ศัพท์ยาก เข้าใจได้แม้ไม่เคยเขียนโค้ด
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-box space-y-3.5 border-t border-base-border bg-base-100 text-xs sm:text-sm">
          <div className="space-y-1">
            <div className="font-bold text-base-content flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-base-content inline-block"></span>
              <span>สิ่งนี้คืออะไร? (What is it?)</span>
            </div>
            <p className="text-base-content-secondary leading-relaxed pl-3 font-normal text-xs sm:text-sm">
              {prose(marked.whatIsIt)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-base-content flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-base-content inline-block"></span>
              <span>ทำไมถึงสำคัญมาก? ถ้าไม่มีจะเกิดอะไรขึ้น? (Why it matters?)</span>
            </div>
            <p className="text-base-content-secondary leading-relaxed pl-3 font-normal text-xs sm:text-sm">
              {prose(marked.whyItMatters)}
            </p>
          </div>

          <div className="p-box-dense rounded-xl bg-base-300 border border-base-border space-y-1">
            <div className="font-bold text-base-content flex items-center gap-1.5 text-xs">
              <Lightbulb className="w-4 h-4 text-warning" />
              <span>เทียบกับเรื่องในชีวิตประจำวัน (Real-World Analogy)</span>
            </div>
            <p className="text-base-content-secondary leading-relaxed font-normal text-xs">
              {prose(marked.realWorldScenario)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
