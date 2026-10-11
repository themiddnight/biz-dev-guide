import React, { useMemo } from 'react';
import { ROLES, ROLE_META, otherRole, type Role } from '../../../data/rolePerspective';
import type { GuideSectionContext, OtherSideView, SectionProps } from './registry';
import { SectionShell } from './SectionShell';
import { RichText } from '../../content/RichText';
import { otherSideTerms, type SideViewTerms } from '../../../lib/sectionTerms';
import { Tabs } from '../../ui/Tabs';

const person = (r: Role) => ROLE_META[r].person;

const SWITCH_OPTIONS: { value: OtherSideView; label: string }[] = [
  { value: 'biz', label: ROLE_META.biz.side },
  { value: 'eng', label: ROLE_META.eng.side },
  { value: 'both', label: 'ทั้งสองฝั่ง' },
];

const LABEL = 'font-semibold text-base-content';

/**
 * One side's view, read by the other side. Labels name both roles so `both` mode reads correctly.
 * `view` arrives already marked (`otherSideTerms`, computed once by the section): this component
 * only renders strings, so rendering it twice — as StrictMode does — cannot change its markers.
 * Every field is prose, the `saysVsHears` dialogue lines included (D21).
 */
const SideViewBody: React.FC<{
  view: SideViewTerms;
  /** Two views side by side: name the side, and stack each label over its line. */
  paired: boolean;
  ctx: Pick<GuideSectionContext, 'onNavigateChapter' | 'onSearchGlossary'>;
}> = ({ view, paired, ctx }) => {
  const { side } = view;
  const reader = otherRole(side);
  const prose = (text: string) => (
    <RichText text={text} onNavigateChapter={ctx.onNavigateChapter} onSearchGlossary={ctx.onSearchGlossary} />
  );
  return (
    <div data-other-side-view={side} className="min-w-0 space-y-5">
      {paired && <h3 className="text-sm text-base-content-muted">{ROLE_META[side].side}</h3>}

      <p><span className={LABEL} data-measured-by>ผลงานของ {person(side)} วัดจาก</span> {prose(view.measuredBy)}</p>

      <div>
        <div className={LABEL}>{person(side)} กลัวอะไร</div>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {view.fears.map(f => <li key={f}>{prose(f)}</li>)}
        </ul>
      </div>

      <div>
        <div className={LABEL}>พูดยังไงให้ไม่พลาด</div>
        <div className="mt-2 divide-y divide-base-border border-y border-base-border">
          {view.saysVsHears.map(row => (
            <dl key={row.youSay} className={`grid gap-x-4 gap-y-1 py-3 ${paired ? '' : 'sm:grid-cols-[9rem_1fr]'}`}>
              <dt className="text-sm text-base-content-muted">{person(reader)} พูด</dt>
              <dd>{prose(row.youSay)}</dd>
              <dt className="text-sm text-base-content-muted">{person(side)} ได้ยินว่า</dt>
              <dd>{prose(row.theyHear)}</dd>
              <dt className="text-sm text-base-content-muted">พูดแบบนี้แทน</dt>
              <dd className="font-medium text-base-content">{prose(row.sayInstead)}</dd>
            </dl>
          ))}
        </div>
      </div>

      <div>
        <div className={LABEL}>ถาม {person(side)} แบบนี้</div>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {view.askThem.map(q => <li key={q}>{prose(q)}</li>)}
        </ul>
      </div>

      <p data-other-side-note={reader}>
        <span className={LABEL}>{person(reader)} ควรทำ</span> {prose(view.note)}
      </p>
    </div>
  );
};

export const OtherSideSection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
  const { role, otherSideView, setOtherSideView } = ctx;
  // The shown views share one first-occurrence walk (spec P3.5), a pure function of the chapter and
  // the switch. Never a `seen` set handed to the views: they would mutate it during render.
  const views = useMemo(
    () => otherSideTerms(chapter, otherSideView === 'both' ? ROLES : [otherSideView]),
    [chapter, otherSideView],
  );
  if (!chapter.perspectives) return null;
  const heading = role ? `${ROLE_META[otherRole(role)].side} มองเรื่องนี้ยังไง` : 'สองฝั่งมองเรื่องนี้ยังไง';
  const paired = views.length > 1;

  return (
    <SectionShell {...props} sectionKey="otherSide" title={heading}>
      <div data-other-side-switch className="mb-5">
        <Tabs<OtherSideView>
          variant="underline"
          size="md"
          aria-label="เลือกฝั่งที่จะดู"
          items={SWITCH_OPTIONS}
          value={otherSideView}
          onChange={setOtherSideView}
        />
      </div>
      <div className={paired ? 'grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2' : ''}>
        {views.map(view => <SideViewBody key={view.side} view={view} paired={paired} ctx={ctx} />)}
      </div>
    </SectionShell>
  );
};
