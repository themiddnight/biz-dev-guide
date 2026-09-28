import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { Chapter } from '../../../types';

/** The wrong-way / right-way workplace dialogue, body only; hosted by ExamplesSection (spec A3). */
export const DialogueCompare: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  if (!chapter.dialogueExample) return null;
  return (
    <div className="space-y-3.5">
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
  );
};
