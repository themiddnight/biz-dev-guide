import React from 'react';
import type { GlossaryTerm } from '../../data/glossary';
import { RichText } from './RichText';

/**
 * Inline term definition at the point of use (term-definitions spec P3.3, D7, D10): a disclosure,
 * not a tooltip, so it works on touch, by keyboard and for a screen reader. `RichText` owns the
 * open state and places each open panel at the end of its text block, so the definition opens in
 * place — no navigation, no scroll, no hash change, no section-state reset.
 */

interface InlineTermTriggerProps {
  termId: string;
  label: string;
  open: boolean;
  panelId: string;
  onToggle: () => void;
}

/**
 * The term as written, as a real button. The touch box uses the project's 44px pattern
 * (`CoreConceptsSection.tsx`): `-my-3.5 py-3.5 sm:my-0 sm:py-0` grows the box without changing the
 * line box. The dotted underline is a text decoration, not a bottom border, so it stays under the
 * word instead of sitting at the bottom of the padded box.
 */
export const InlineTermTrigger: React.FC<InlineTermTriggerProps> = ({ termId, label, open, panelId, onToggle }) => (
  <button
    type="button"
    data-inline-term={termId}
    aria-expanded={open}
    aria-controls={open ? panelId : undefined}
    onClick={onToggle}
    className="inline-block -my-3.5 py-3.5 sm:my-0 sm:py-0 font-medium text-base-content underline decoration-dotted decoration-base-content-subtle underline-offset-[3px] hover:decoration-base-content cursor-pointer"
  >
    {label}
  </button>
);

interface InlineTermPanelProps {
  term: GlossaryTerm;
  panelId: string;
  onNavigateChapter?: (chapterId: string) => void;
  onSearchGlossary?: (query: string) => void;
}

/**
 * The definition, read from the glossary entry (the single source of truth, D8). Phrasing content
 * only (`span`s shown as blocks), so it is valid inside the `<p>` or `<li>` that holds the term.
 */
export const InlineTermPanel: React.FC<InlineTermPanelProps> = ({ term, panelId, onNavigateChapter, onSearchGlossary }) => (
  <span
    id={panelId}
    role="region"
    aria-label={term.term}
    data-inline-term-panel={term.id}
    className="block my-2 p-3 rounded-lg border border-base-border bg-base-100 text-xs sm:text-sm leading-relaxed text-base-content-body not-italic font-normal"
  >
    <span className="block font-semibold text-base-content">{term.term}</span>
    <span className="block mt-1">
      <RichText text={term.definition} onNavigateChapter={onNavigateChapter} />
    </span>
    {term.plain && (
      <span className="block mt-1 text-base-content-muted">
        <RichText text={term.plain} onNavigateChapter={onNavigateChapter} />
      </span>
    )}
    {onSearchGlossary && (
      <span className="block mt-1.5">
        <button
          type="button"
          onClick={() => onSearchGlossary(term.term)}
          className="inline-block -my-3.5 py-3.5 sm:my-0 sm:py-0 text-[11px] sm:text-xs font-semibold text-base-content-body underline underline-offset-2 hover:text-base-content cursor-pointer"
        >
          ดูในหน้ารวมคำศัพท์
        </button>
      </span>
    )}
  </span>
);
