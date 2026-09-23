import React from 'react';
import { ShieldAlert, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';

export const DialogueSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  if (!chapter.dialogueExample) return null;
  return (
    <div className="border border-base-border rounded-2xl overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-base-300 hover:bg-base-300 text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            💬
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              บทสนทนาจริงในที่ทำงาน (วิธีพูดที่พัง vs วิธีพูดที่ปัง)
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              เทียบประโยคที่พูดกันในห้องประชุม แบบไหนได้ผล
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 space-y-3.5 border-t border-base-border bg-base-100">
          <div className="p-3 rounded-xl bg-base-300 border border-base-border text-xs text-base-content-secondary font-normal">
            <span className="font-bold text-base-content">สถานการณ์: </span>
            {chapter.dialogueExample.context}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Wrong Way */}
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/40 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-error text-xs">
                <ShieldAlert className="w-4 h-4 text-error" />
                <span>❌ วิธีพูดที่สร้างปัญหา (Wrong Way)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-base-100/90 border border-error/25 text-error italic font-medium text-xs">
                {chapter.dialogueExample.wrongWay.speaker}
              </div>
              <p className="text-base-content-secondary text-xs leading-relaxed font-normal">
                {chapter.dialogueExample.wrongWay.text}
              </p>
              <div className="text-[11px] text-error font-semibold pt-0.5">
                ⚠️ ผลเสีย: {chapter.dialogueExample.wrongWay.issue}
              </div>
            </div>

            {/* Right Way */}
            <div className="p-3.5 rounded-xl bg-success/10 border border-success/40 space-y-2 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-success text-xs">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>✅ วิธีพูดที่ได้ผล (Right Way)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-base-100/90 border border-success/25 text-success italic font-medium text-xs">
                {chapter.dialogueExample.rightWay.speaker}
              </div>
              <p className="text-base-content-secondary text-xs leading-relaxed font-normal">
                {chapter.dialogueExample.rightWay.text}
              </p>
              <div className="text-[11px] text-success font-semibold pt-0.5">
                💡 ผลลัพธ์: {chapter.dialogueExample.rightWay.benefit}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
