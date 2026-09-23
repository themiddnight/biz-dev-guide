import React from 'react';
import { ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';

export const ChecklistSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  /* SECTION 8: Pre-flight Checklist */
  if (!chapter.checklist || chapter.checklist.length === 0) return null;
  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            ✅
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
              Pre-flight Checklist ก่อนเข้าประชุมหรือส่งต่องาน
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              เช็กให้ครบก่อนส่งต่องาน จะได้ไม่มีอะไรตกหล่น ({chapter.checklist.length} ข้อ)
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 border-t border-neutral-100 dark:border-[#262626] bg-white dark:bg-[#141414] space-y-1.5 text-xs">
          {chapter.checklist.map((item, idx) => {
            const itemKey = `${chapter.id}_cl_${idx}`;
            const isChecked = !!ctx.checkedChecklist[itemKey];
            return (
              <div
                key={idx}
                onClick={() => ctx.onToggleChecklistItem(itemKey)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-400 dark:text-[#666666] line-through opacity-80'
                    : 'hover:bg-neutral-50 dark:hover:bg-[#181818] text-neutral-700 dark:text-[#d4d4d4]'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-neutral-400 dark:text-[#737373] shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed font-normal">{item}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
