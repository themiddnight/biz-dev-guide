import React from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';

export const ExamplesSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  if (!chapter.realWorldExamples || chapter.realWorldExamples.length === 0) return null;
  return (
    <div className="border border-base-border rounded-2xl overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-base-300 hover:bg-base-300 text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            🏢
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              เคสจริงจากบริษัทต่างๆ (Case Studies)
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              บทเรียนจริงจากบริษัทเทคและสตาร์ทอัพ ({chapter.realWorldExamples.length} เรื่อง)
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 space-y-3.5 border-t border-base-border bg-base-100">
          {chapter.realWorldExamples.map((ex, eIdx) => (
            <div
              key={eIdx}
              className="p-3.5 sm:p-5 rounded-2xl bg-base-300 border border-base-border space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-bold text-xs sm:text-sm text-base-content flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-base-border text-base-content-body text-[10px] font-bold">
                    {ex.companyOrIndustry}
                  </span>
                  <span>{ex.title}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-base-100 border border-base-border space-y-1">
                  <span className="font-bold text-base-content text-xs flex items-center gap-1.5">
                    📌 โจทย์ตั้งต้น:
                  </span>
                  <p className="text-base-content-secondary leading-relaxed text-xs">
                    {ex.situation}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-error/10 border border-error/40 space-y-1">
                  <span className="font-bold text-error text-xs flex items-center gap-1.5">
                    ⚠️ สิ่งที่เกิดขึ้น / จุดสะดุด:
                  </span>
                  <p className="text-error leading-relaxed text-xs">
                    {ex.whatHappened}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-success/10 border border-success/40 space-y-1 text-xs sm:text-sm">
                <span className="font-bold text-success text-xs flex items-center gap-1.5">
                  ✅ แก้ยังไง:
                </span>
                <p className="text-base-content-body leading-relaxed text-xs font-normal">
                  {ex.resolution}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-base-300 border border-base-border text-xs text-base-content-body flex items-center gap-2 font-medium">
                <Lightbulb className="w-4 h-4 text-warning shrink-0" />
                <span><b>บทเรียนสำคัญ:</b> {ex.keyLesson}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
