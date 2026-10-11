import React from 'react';
import { RichText } from '../../content/RichText';
import type { GuideSectionContext } from './registry';

export type ProseCtx = Pick<GuideSectionContext, 'onNavigateChapter' | 'onSearchGlossary'>;

/** A section's prose string, already marked by its `sectionTerms` walk, with the reader's links wired. */
export const Prose: React.FC<{ text: string; ctx: ProseCtx }> = ({ text, ctx }) => (
  <RichText text={text} onNavigateChapter={ctx.onNavigateChapter} onSearchGlossary={ctx.onSearchGlossary} />
);
