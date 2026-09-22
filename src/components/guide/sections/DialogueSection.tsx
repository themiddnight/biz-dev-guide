import React from 'react';
import { ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionProps } from './registry';

export const DialogueSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  if (!chapter.dialogueExample) return null;
  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        onClick={onToggle}
        className="w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] text-left cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            💬
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
              บทสนทนาจริงในที่ทำงาน (วิธีพูดที่พัง vs วิธีพูดที่ปัง)
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              เปรียบเทียบประโยคพูดคุยในห้องประชุม พร้อมบทเรียนการสื่อสาร
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 space-y-3.5 border-t border-neutral-100 dark:border-[#262626] bg-white dark:bg-[#141414]">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] text-xs text-neutral-600 dark:text-[#a3a3a3] font-normal">
            <span className="font-bold text-neutral-900 dark:text-[#fafafa]">บริบทสถานการณ์: </span>
            {chapter.dialogueExample.context}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Wrong Way */}
            <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-300 text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>❌ วิธีพูดที่สร้างปัญหา (Wrong Way)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/90 dark:bg-[#181818] border border-rose-100 dark:border-rose-950/80 text-rose-950 dark:text-rose-200 italic font-medium text-xs">
                {chapter.dialogueExample.wrongWay.speaker}
              </div>
              <p className="text-neutral-700 dark:text-[#a3a3a3] text-xs leading-relaxed font-normal">
                {chapter.dialogueExample.wrongWay.text}
              </p>
              <div className="text-[11px] text-rose-800 dark:text-rose-300 font-semibold pt-0.5">
                ⚠️ ผลเสีย: {chapter.dialogueExample.wrongWay.issue}
              </div>
            </div>

            {/* Right Way */}
            <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>✅ วิธีพูดที่ถูกต้องและได้ผล (Right Way)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/90 dark:bg-[#181818] border border-emerald-100 dark:border-emerald-950/80 text-emerald-950 dark:text-emerald-200 italic font-medium text-xs">
                {chapter.dialogueExample.rightWay.speaker}
              </div>
              <p className="text-neutral-700 dark:text-[#a3a3a3] text-xs leading-relaxed font-normal">
                {chapter.dialogueExample.rightWay.text}
              </p>
              <div className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold pt-0.5">
                💡 ผลลัพธ์: {chapter.dialogueExample.rightWay.benefit}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
