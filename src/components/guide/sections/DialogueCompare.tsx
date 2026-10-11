import React from 'react';
import type { ExamplesTerms } from '../../../lib/sectionTerms';
import { Prose, type ProseCtx } from './Prose';

const LABEL = 'font-semibold text-base-content';

/**
 * The wrong-way / right-way workplace dialogue, body only; hosted by ExamplesSection (spec A3).
 * The one place the reader uses red and green as a pair. `dialogue` arrives already marked.
 */
export const DialogueCompare: React.FC<{ dialogue: NonNullable<ExamplesTerms['dialogue']>; ctx: ProseCtx }> = ({ dialogue, ctx }) => (
  <div className="space-y-4">
    <p><span className={LABEL}>สถานการณ์</span> <Prose text={dialogue.context} ctx={ctx} /></p>
    <div className="grid gap-5 sm:grid-cols-2">
      <div data-dialogue="wrong" className="space-y-2 border-t-2 border-error pt-3">
        <p className="font-semibold text-error">พูดแบบนี้สร้างปัญหา</p>
        <p className="text-base-content"><Prose text={dialogue.wrongWay.speaker} ctx={ctx} /></p>
        <p><Prose text={dialogue.wrongWay.text} ctx={ctx} /></p>
        <p><span className={LABEL}>ผลเสีย</span> <Prose text={dialogue.wrongWay.outcome} ctx={ctx} /></p>
      </div>
      <div data-dialogue="right" className="space-y-2 border-t-2 border-success pt-3">
        <p className="font-semibold text-success">พูดแบบนี้ได้ผล</p>
        <p className="text-base-content"><Prose text={dialogue.rightWay.speaker} ctx={ctx} /></p>
        <p><Prose text={dialogue.rightWay.text} ctx={ctx} /></p>
        <p><span className={LABEL}>ผลลัพธ์</span> <Prose text={dialogue.rightWay.outcome} ctx={ctx} /></p>
      </div>
    </div>
  </div>
);
