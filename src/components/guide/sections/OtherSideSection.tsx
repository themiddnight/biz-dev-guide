import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ROLES, ROLE_META, otherRole, type Role } from '../../../data/rolePerspective';
import type { GuideSectionContext, OtherSideView, SectionProps } from './registry';
import { RichText } from '../../content/RichText';
import { otherSideTerms, type SideViewTerms } from '../../../lib/sectionTerms';

const person = (r: Role) => ROLE_META[r].person;

const SWITCH_OPTIONS: { value: OtherSideView; label: string }[] = [
  { value: 'biz', label: ROLE_META.biz.side },
  { value: 'eng', label: ROLE_META.eng.side },
  { value: 'both', label: 'ทั้งสองฝั่ง' },
];

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="font-bold text-neutral-900 dark:text-[#e5e5e5] text-xs">{children}</div>
);

/**
 * One side's view, read by the other side. Labels name both roles so `both` mode reads correctly.
 * `view` arrives already marked (`otherSideTerms`, computed once by the section): the card only
 * renders strings, so rendering it twice — as StrictMode does — cannot change its markers. Every
 * field is prose, the `saysVsHears` dialogue lines included (D21).
 */
export const SideViewCard: React.FC<{
  view: SideViewTerms;
  ctx: Pick<GuideSectionContext, 'onNavigateChapter' | 'onSearchGlossary'>;
}> = ({ view, ctx }) => {
  const { side } = view;
  const reader = otherRole(side);
  const prose = (text: string) => (
    <RichText text={text} onNavigateChapter={ctx.onNavigateChapter} onSearchGlossary={ctx.onSearchGlossary} />
  );
  return (
    <div
      data-other-side-view={side}
      className="min-w-0 p-3.5 sm:p-4 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-3.5 text-xs sm:text-sm"
    >
      <div className="text-xs font-bold text-neutral-500 dark:text-[#8e8e8e]">
        {ROLE_META[side].icon} {ROLE_META[side].side}
      </div>

      <div className="space-y-1">
        <Label>{person(side)} ถูกวัดผลด้วย</Label>
        <p className="text-neutral-700 dark:text-[#c4c4c4] leading-relaxed">{prose(view.measuredBy)}</p>
      </div>

      <div className="space-y-1">
        <Label>{person(side)} กลัวอะไร</Label>
        <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-[#c4c4c4] leading-relaxed">
          {view.fears.map(f => <li key={f}>{prose(f)}</li>)}
        </ul>
      </div>

      <div className="space-y-2">
        <Label>พูดยังไงให้ไม่พลาด</Label>
        {view.saysVsHears.map(row => (
          <div key={row.youSay} className="p-3 rounded-lg bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] space-y-1.5 leading-relaxed">
            <p className="text-neutral-700 dark:text-[#c4c4c4]">
              <span className="font-semibold text-neutral-900 dark:text-[#e5e5e5]">{person(reader)} พูด:</span> {prose(row.youSay)}
            </p>
            <p className="text-neutral-600 dark:text-[#a3a3a3]">
              <span className="font-semibold text-amber-700 dark:text-amber-300">{person(side)} ได้ยินว่า:</span> {prose(row.theyHear)}
            </p>
            <p className="text-neutral-700 dark:text-[#c4c4c4]">
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">พูดแบบนี้แทน:</span> {prose(row.sayInstead)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <Label>ถาม {person(side)} แบบนี้</Label>
        <ul className="list-disc pl-5 space-y-1 text-neutral-700 dark:text-[#c4c4c4] leading-relaxed">
          {view.askThem.map(q => <li key={q}>{prose(q)}</li>)}
        </ul>
      </div>

      <p className="pt-3 border-t border-neutral-200 dark:border-[#262626] text-neutral-700 dark:text-[#c4c4c4] leading-relaxed" data-other-side-note={reader}>
        <span className="font-semibold text-neutral-900 dark:text-[#e5e5e5]">{person(reader)} ควรทำ:</span> {prose(view.note)}
      </p>
    </div>
  );
};

export const OtherSideSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  const { role, otherSideView, setOtherSideView } = ctx;
  // The shown cards share one first-occurrence walk (spec P3.5), a pure function of the chapter and
  // the switch. Never a `seen` set handed to the cards: they would mutate it during render.
  const cards = useMemo(
    () => otherSideTerms(chapter, otherSideView === 'both' ? ROLES : [otherSideView]),
    [chapter, otherSideView],
  );
  if (!chapter.perspectives) return null;
  const heading = role ? `${ROLE_META[otherRole(role)].side} มองเรื่องนี้ยังไง` : 'สองฝั่งมองเรื่องนี้ยังไง';

  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!!isOpen}
        className="w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] text-left cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            🔁
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">{heading}</h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              เขาถูกวัดผลด้วยอะไร กลัวอะไร และควรพูดกับเขายังไง
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 space-y-3.5 border-t border-neutral-100 dark:border-[#262626]">
          <div role="group" aria-label="เลือกฝั่งที่จะดู" className="flex flex-wrap gap-1.5" data-other-side-switch>
            {SWITCH_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={otherSideView === opt.value}
                onClick={() => setOtherSideView(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors ${
                  otherSideView === opt.value
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] border-neutral-900 dark:border-white'
                    : 'bg-white dark:bg-[#141414] text-neutral-700 dark:text-[#c4c4c4] border-neutral-200 dark:border-[#333333] hover:bg-neutral-100 dark:hover:bg-[#1f1f1f]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className={cards.length > 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : ''}>
            {cards.map(view => <SideViewCard key={view.side} view={view} ctx={ctx} />)}
          </div>
        </div>
      )}
    </div>
  );
};
