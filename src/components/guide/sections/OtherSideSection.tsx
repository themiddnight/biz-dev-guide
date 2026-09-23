import React, { useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ROLES, ROLE_META, otherRole, type Role } from '../../../data/rolePerspective';
import type { GuideSectionContext, OtherSideView, SectionProps } from './registry';
import { RichText } from '../../content/RichText';
import { otherSideTerms, type SideViewTerms } from '../../../lib/sectionTerms';
import { TAP } from '../../ui/tapTarget';
import { IconBadge } from '../../ui/IconBadge';
import { Tabs } from '../../ui/Tabs';

const person = (r: Role) => ROLE_META[r].person;

const SWITCH_OPTIONS: { value: OtherSideView; label: string }[] = [
  { value: 'biz', label: ROLE_META.biz.side },
  { value: 'eng', label: ROLE_META.eng.side },
  { value: 'both', label: 'ทั้งสองฝั่ง' },
];

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="font-bold text-base-content text-xs">{children}</div>
);

/**
 * One side's view, read by the other side. Labels name both roles so `both` mode reads correctly.
 * `view` arrives already marked (`otherSideTerms`, computed once by the section): the card only
 * renders strings, so rendering it twice — as StrictMode does — cannot change its markers. Every
 * field is prose, the `saysVsHears` dialogue lines included (D21).
 */
const SideViewCard: React.FC<{
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
      className="min-w-0 p-box-dense rounded-xl bg-base-300 border border-base-border space-y-3.5 text-xs sm:text-sm"
    >
      <div className="text-xs font-bold text-base-content-muted">
        {ROLE_META[side].icon} {ROLE_META[side].side}
      </div>

      <div className="space-y-1">
        <Label>{person(side)} ถูกวัดผลด้วย</Label>
        <p className="text-base-content-body leading-relaxed">{prose(view.measuredBy)}</p>
      </div>

      <div className="space-y-1">
        <Label>{person(side)} กลัวอะไร</Label>
        <ul className="list-disc pl-5 space-y-1 text-base-content-body leading-relaxed">
          {view.fears.map(f => <li key={f}>{prose(f)}</li>)}
        </ul>
      </div>

      <div className="space-y-2">
        <Label>พูดยังไงให้ไม่พลาด</Label>
        {view.saysVsHears.map(row => (
          <div key={row.youSay} className="p-3 rounded-lg bg-base-100 border border-base-border space-y-1.5 leading-relaxed">
            <p className="text-base-content-body">
              <span className="font-semibold text-base-content">{person(reader)} พูด:</span> {prose(row.youSay)}
            </p>
            <p className="text-base-content-secondary">
              <span className="font-semibold text-warning">{person(side)} ได้ยินว่า:</span> {prose(row.theyHear)}
            </p>
            <p className="text-base-content-body">
              <span className="font-semibold text-success">พูดแบบนี้แทน:</span> {prose(row.sayInstead)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-1">
        <Label>ถาม {person(side)} แบบนี้</Label>
        <ul className="list-disc pl-5 space-y-1 text-base-content-body leading-relaxed">
          {view.askThem.map(q => <li key={q}>{prose(q)}</li>)}
        </ul>
      </div>

      <p className="pt-3 border-t border-base-border text-base-content-body leading-relaxed" data-other-side-note={reader}>
        <span className="font-semibold text-base-content">{person(reader)} ควรทำ:</span> {prose(view.note)}
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
    <div className="border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={!!isOpen}
        className={`${TAP} w-full p-box flex items-center justify-between bg-base-300 hover:bg-base-border text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <IconBadge size="md">🔁</IconBadge>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">{heading}</h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              เขาถูกวัดผลด้วยอะไร กลัวอะไร และควรพูดกับเขายังไง
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-box space-y-3.5 border-t border-base-border">
          <div data-other-side-switch>
            <Tabs<OtherSideView>
              variant="pills"
              aria-label="เลือกฝั่งที่จะดู"
              className="flex-wrap"
              items={SWITCH_OPTIONS}
              value={otherSideView}
              onChange={setOtherSideView}
            />
          </div>
          <div className={cards.length > 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-3' : ''}>
            {cards.map(view => <SideViewCard key={view.side} view={view} ctx={ctx} />)}
          </div>
        </div>
      )}
    </div>
  );
};
