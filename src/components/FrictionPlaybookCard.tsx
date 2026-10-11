import React, { useMemo, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { FrictionPlaybook } from '../types';
import { TAP } from './ui/tapTarget';
import { Prose, type ProseCtx } from './guide/sections/Prose';
import { frictionTerms } from '../lib/sectionTerms';

interface FrictionPlaybookCardProps {
  playbook: FrictionPlaybook;
  ctx: ProseCtx;
}

const LABEL = 'block font-semibold text-base-content';
const ROW_LABEL = 'text-sm text-base-content-muted';
const OPTION_LETTERS = ['ก', 'ข', 'ค', 'ง', 'จ'];

/**
 * The friction playbook: one of the few framed blocks in the reader, because it is a worked tool
 * and not chapter prose. Inside the frame everything is rows on hairlines.
 */
export const FrictionPlaybookCard: React.FC<FrictionPlaybookCardProps> = ({ playbook, ctx }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  // One first-occurrence walk for the playbook, computed purely from it.
  const marked = useMemo(() => frictionTerms(playbook), [playbook]);
  const { dilemma } = playbook;
  const markedDilemma = marked.dilemma;
  const prose = (text: string) => <Prose text={text} ctx={ctx} />;

  return (
    <div data-friction-playbook className="rounded-box border border-base-border p-box-spacious">
      <h3 className="text-base font-bold text-base-content">{playbook.battlegroundTitle}</h3>

      <div className="mt-4 grid gap-5 sm:grid-cols-2">
        <p><span className={LABEL}>ฝั่ง Business หงุดหงิดเรื่อง</span>{prose(marked.businessFrustration)}</p>
        <p><span className={LABEL}>ฝั่ง Engineering หงุดหงิดเรื่อง</span>{prose(marked.engineerFrustration)}</p>
      </div>
      <p className="mt-5"><span className={LABEL}>สาเหตุจริง</span>{prose(marked.underlyingRootCause)}</p>

      <div className="mt-6" data-playbook-tradeoffs>
        <h4 className="font-semibold text-base-content">อยากได้อย่างหนึ่ง ต้องยอมเสียอีกอย่าง</h4>
        {playbook.tradeOffMatrix.map((_, idx) => (
          <dl key={idx} className="mt-4 grid gap-x-4 gap-y-1 border-t border-base-border pt-4 sm:grid-cols-[9rem_1fr]">
            <dt className={ROW_LABEL}>ถ้าต้องการ</dt><dd className="font-medium text-base-content">{prose(marked.tradeOffs[idx].ifYouNeed)}</dd>
            <dt className={ROW_LABEL}>ต้องยอมเสีย</dt><dd>{prose(marked.tradeOffs[idx].youMustSacrifice)}</dd>
            <dt className={ROW_LABEL}>วิธีคุย</dt><dd>{prose(marked.tradeOffs[idx].howToNegotiate)}</dd>
          </dl>
        ))}
      </div>

      <div className="mt-6" data-playbook-scripts>
        <h4 className="font-semibold text-base-content">ประโยคที่หยิบไปพูดได้เลย</h4>
        {playbook.goldenScripts.map((script, idx) => (
          <dl key={idx} className="mt-4 grid gap-x-4 gap-y-1 border-t border-base-border pt-4 sm:grid-cols-[9rem_1fr]">
            <dt className={ROW_LABEL}>สถานการณ์</dt><dd className="font-medium text-base-content">{script.situation}</dd>
            {marked.scripts[idx].businessScript !== undefined && (<><dt className={ROW_LABEL}>Business พูด</dt><dd>{prose(marked.scripts[idx].businessScript)}</dd></>)}
            {marked.scripts[idx].engineerScript !== undefined && (<><dt className={ROW_LABEL}>Dev พูด</dt><dd>{prose(marked.scripts[idx].engineerScript)}</dd></>)}
          </dl>
        ))}
      </div>

      {dilemma && markedDilemma && (
        <div className="mt-6 border-t border-base-border pt-5" data-playbook-dilemma>
          <h4 className="font-semibold text-base-content">ลองตอบดู</h4>
          <p className="mt-2"><span className="font-semibold text-base-content">สถานการณ์</span> {prose(markedDilemma.scenario)}</p>
          <p className="mt-2 font-medium text-base-content">&ldquo;{prose(markedDilemma.counterpartQuote)}&rdquo;</p>
          <p className="mt-4 text-sm text-base-content-muted">ถ้าเป็นคุณ จะตอบยังไง</p>
          <ul className="mt-1 divide-y divide-base-border border-y border-base-border">
            {dilemma.options.map((option, index) => {
              const isSelected = selectedOptionId === option.id;
              const answered = selectedOptionId !== null;
              return (
                <li key={option.id} className="py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedOptionId(option.id)}
                    aria-pressed={isSelected}
                    className={`${TAP} flex w-full cursor-pointer items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
                  >
                    <span className="shrink-0 text-base-content-muted">{OPTION_LETTERS[index] ?? index + 1}.</span>
                    <span className={`flex-1 ${isSelected ? 'font-medium text-base-content' : ''}`}>{option.text}</span>
                    {isSelected && (option.isOptimal
                      ? <CheckCircle className="mt-1.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                      : <XCircle className="mt-1.5 h-4 w-4 shrink-0 text-error" aria-hidden="true" />)}
                    {answered && !isSelected && option.isOptimal && (
                      <span className="shrink-0 text-sm font-semibold text-success">ข้อนี้ดีที่สุด</span>
                    )}
                  </button>
                  {isSelected && (
                    <div className="mt-2 space-y-1 pl-7" data-dilemma-result={option.isOptimal ? 'optimal' : 'other'}>
                      <p>
                        <span className={`font-semibold ${option.isOptimal ? 'text-success' : 'text-error'}`}>
                          {option.isOptimal ? 'ข้อนี้ดีที่สุด' : 'ยังไม่ใช่ข้อที่ดีที่สุด'}
                        </span>{' '}
                        {prose(markedDilemma.options[index].result)}
                      </p>
                      <p><span className="text-base-content-muted">เทคนิค</span> {prose(markedDilemma.options[index].tip)}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
