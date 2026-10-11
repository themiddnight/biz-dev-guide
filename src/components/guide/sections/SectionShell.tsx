import React from 'react';
import { SECTION_LABEL, getInlineSectionsAt, type SectionKey } from '../../../data/sectionLayers';
import { InlineSections } from '../InlineSections';
import { TAP } from '../../ui/tapTarget';
import type { SectionProps } from './registry';

interface SectionShellProps extends SectionProps {
  sectionKey: SectionKey;
  /** Defaults to the section's control-row label. */
  title?: string;
  note?: string;
  children: React.ReactNode;
}

/**
 * A chapter section: a heading on a hairline, never a card. A Core section is open and has no
 * control; any other section's heading is its fold button. Owns the `sec-<key>` anchor that routes
 * and the control row scroll to, and the inline content placed after the section.
 */
export const SectionShell: React.FC<SectionShellProps> = ({
  sectionKey, chapter, fold, ctx, title = SECTION_LABEL[sectionKey], note, children,
}) => {
  const id = `sec-${sectionKey}`;
  const bodyId = `${id}-body`;
  const isOpen = !fold.foldable || fold.isOpen;
  const heading = (
    <>
      <span className="text-xl font-bold leading-7 text-base-content">{title}</span>
      {note && <span className="text-sm font-normal text-base-content-muted">{note}</span>}
    </>
  );
  return (
    <section id={id} data-section={sectionKey} tabIndex={-1} className="anchor-target border-t border-base-border focus:outline-none">
      <h2>
        {fold.foldable ? (
          <button
            type="button"
            aria-expanded={fold.isOpen}
            aria-controls={fold.isOpen ? bodyId : undefined}
            onClick={fold.onToggle}
            className={`${TAP} flex w-full cursor-pointer flex-wrap items-baseline gap-x-3 gap-y-1 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
          >
            {heading}
            <span aria-hidden="true" className="ml-auto text-sm font-normal text-base-content-muted">{fold.isOpen ? 'พับเก็บ' : 'เปิดอ่าน'}</span>
          </button>
        ) : (
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-7">{heading}</span>
        )}
      </h2>
      {isOpen && (
        <div id={bodyId} className={fold.foldable ? 'pb-7' : 'mt-5 pb-9'}>
          {children}
          <InlineSections
            className="mt-6"
            sections={getInlineSectionsAt(chapter, sectionKey)}
            onNavigateChapter={ctx.onNavigateChapter}
          />
        </div>
      )}
    </section>
  );
};
