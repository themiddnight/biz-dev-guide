import React from 'react';
import type { Chapter } from '../../../types';

const LABEL = 'font-semibold text-base-content';

/**
 * The wrong-way / right-way workplace dialogue, body only; hosted by ExamplesSection (spec A3).
 * The one place the reader uses red and green as a pair.
 */
export const DialogueCompare: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  const dialogue = chapter.dialogueExample;
  if (!dialogue) return null;
  return (
    <div className="space-y-4">
      <p><span className={LABEL}>สถานการณ์</span> {dialogue.context}</p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div data-dialogue="wrong" className="space-y-2 border-t-2 border-error pt-3">
          <p className="font-semibold text-error">พูดแบบนี้สร้างปัญหา</p>
          <p className="text-base-content">{dialogue.wrongWay.speaker}</p>
          <p>{dialogue.wrongWay.text}</p>
          <p><span className={LABEL}>ผลเสีย</span> {dialogue.wrongWay.issue}</p>
        </div>
        <div data-dialogue="right" className="space-y-2 border-t-2 border-success pt-3">
          <p className="font-semibold text-success">พูดแบบนี้ได้ผล</p>
          <p className="text-base-content">{dialogue.rightWay.speaker}</p>
          <p>{dialogue.rightWay.text}</p>
          <p><span className={LABEL}>ผลลัพธ์</span> {dialogue.rightWay.benefit}</p>
        </div>
      </div>
    </div>
  );
};
