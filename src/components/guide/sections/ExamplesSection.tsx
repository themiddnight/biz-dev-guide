import React from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import type { SectionProps } from './registry';

export const ExamplesSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  if (!chapter.realWorldExamples || chapter.realWorldExamples.length === 0) return null;
  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        onClick={onToggle}
        className="w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] text-left cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            🏢
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
              กรณีศึกษาจริงในอุตสาหกรรม (Real-World Case Studies)
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              บทเรียนจริงจากบริษัทเทคและสตาร์ทอัพ ({chapter.realWorldExamples.length} เรื่องราว)
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 space-y-3.5 border-t border-neutral-100 dark:border-[#262626] bg-white dark:bg-[#141414]">
          {chapter.realWorldExamples.map((ex, eIdx) => (
            <div
              key={eIdx}
              className="p-3.5 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa] flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-[#262626] text-neutral-800 dark:text-[#d4d4d4] text-[10px] font-bold">
                    {ex.companyOrIndustry}
                  </span>
                  <span>{ex.title}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] space-y-1">
                  <span className="font-bold text-neutral-800 dark:text-[#e5e5e5] text-xs flex items-center gap-1.5">
                    📌 บริบทและโจทย์เริ่มต้น:
                  </span>
                  <p className="text-neutral-600 dark:text-[#a3a3a3] leading-relaxed text-xs">
                    {ex.situation}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-1">
                  <span className="font-bold text-rose-900 dark:text-rose-300 text-xs flex items-center gap-1.5">
                    ⚠️ สิ่งที่เกิดขึ้น / จุดสะดุด:
                  </span>
                  <p className="text-rose-950 dark:text-rose-200 leading-relaxed text-xs">
                    {ex.whatHappened}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-1 text-xs sm:text-sm">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                  ✅ วิธีแก้ปัญหาและการประสานงาน:
                </span>
                <p className="text-neutral-800 dark:text-[#d4d4d4] leading-relaxed text-xs font-normal">
                  {ex.resolution}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#333333] text-xs text-neutral-800 dark:text-[#d4d4d4] flex items-center gap-2 font-medium">
                <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                <span><b>บทเรียนสำคัญ:</b> {ex.keyLesson}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
