import React from 'react';
import { FrictionFaqSection } from '../../FrictionFaqSection';
import { FRICTION_FAQS } from '../../../data/frictionFaqs';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';

export const FaqSection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
  if (chapter.id !== 's11') return null;
  return (
    <SectionShell {...props} sectionKey="faq" title="คำถามที่แต่ละฝั่งบ่นกันจริงๆ" note={`${FRICTION_FAQS.length} ข้อ`}>
      <FrictionFaqSection
        onNavigateChapter={ctx.onNavigateChapter}
        onScrollToPlaybook={ctx.onScrollToPlaybook}
        onSearchGlossary={ctx.onSearchGlossary}
      />
    </SectionShell>
  );
};
