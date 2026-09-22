import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionProps } from './registry';

export const JargonSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  if (!chapter.jargonList || chapter.jargonList.length === 0) return null;
  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        onClick={onToggle}
        className="w-full p-3.5 sm:p-4.5 flex items-center justify-between text-left cursor-pointer select-none transition-colors bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f]"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            📖
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
                พจนานุกรมคำศัพท์จำเป็น (Jargon Buster)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-[#262626] text-neutral-800 dark:text-[#d4d4d4] text-[10px] sm:text-[11px] font-semibold font-mono">
                {chapter.jargonList.length} คำ
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] mt-0.5">
              ศัพท์เทคนิคประจำบท แปลเป็นภาษาคนแบบเห็นภาพชัดเจน
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />
        )}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 grid grid-cols-1 gap-3 border-t border-neutral-100 dark:border-[#262626] bg-white dark:bg-[#141414]">
          {chapter.jargonList.map((item, jIdx) => (
            <div
              key={jIdx}
              className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-2 text-xs sm:text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm font-mono">
                  {item.term}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-neutral-200/80 dark:bg-[#262626] border border-neutral-300/60 dark:border-[#333333] text-neutral-700 dark:text-[#d4d4d4] text-[10px] font-semibold font-mono">
                  Technical Term
                </span>
              </div>
              <div className="text-neutral-500 dark:text-[#8e8e8e] text-xs font-normal leading-relaxed">
                <span className="font-bold text-neutral-700 dark:text-[#c4c4c4]">นิยามทางการ: </span>
                <span>{item.formalDefinition}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#333333] text-neutral-800 dark:text-[#e5e5e5] text-xs leading-relaxed">
                <span className="font-bold text-neutral-900 dark:text-white">🗣️ แปลภาษาคน: </span>
                <span>{item.humanTranslation}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
