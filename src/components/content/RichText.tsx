import React, { useId, useState } from 'react';
import { formatChapterHash } from '../../lib/chapterRoute';
import { lookupTerm } from '../../data/glossary';
import { InlineTermPanel, InlineTermTrigger } from './InlineTerm';

/**
 * Renders the restored-content rich text subset without dangerouslySetInnerHTML:
 * - `**bold**`
 * - `\n` line break
 * - `[[sN|label]]` in-app chapter link (calls `onNavigateChapter(id)`)
 * - `[[g:<glossary-id>|label]]` inline term definition (term-definitions spec P3.1): a button that
 *   opens the glossary definition in place, at the end of this text block. An id the glossary
 *   cannot resolve renders the bare label.
 * - `[[!g:<id>]]` / `[[!g:*]]` author opt-out of automatic marking (`src/lib/autoTerms.ts`);
 *   `markTerms` strips it, and it never renders here either.
 */
interface RichTextProps {
  text: string;
  onNavigateChapter?: (chapterId: string) => void;
  /** Opens the full entry in the glossary chapter; the inline panel shows its link only when given. */
  onSearchGlossary?: (query: string) => void;
}

const TOKEN_RE = /(\*\*[^*]+?\*\*|\[\[g:[a-z0-9-]+\|[^\]]+?\]\]|\[\[s\d+\|[^\]]+?\]\]|\[\[!g:(?:[a-z0-9-]+|\*)\]\]|\n)/g;
const LINK_RE = /^\[\[(s\d+)\|([^\]]+)\]\]$/;
const TERM_RE = /^\[\[g:([a-z0-9-]+)\|([^\]]+)\]\]$/;
const OPT_OUT_RE = /^\[\[!g:(?:[a-z0-9-]+|\*)\]\]$/;

const splitParts = (text: string) => text.split(TOKEN_RE).filter(part => part !== '');

/**
 * Each term marker's stable key, by part index: its glossary id and which occurrence of that id it
 * is in this text (`sprint#0`). Open panels are keyed by it, not by the part index, so bold, links
 * or words added before a marker never move an open definition onto another term (review S1).
 */
function termKeysByPart(parts: readonly string[]): Map<number, string> {
  const keys = new Map<number, string>();
  const occurrences = new Map<string, number>();
  parts.forEach((part, idx) => {
    const id = TERM_RE.exec(part)?.[1];
    if (!id) return;
    const n = occurrences.get(id) ?? 0;
    occurrences.set(id, n + 1);
    keys.set(idx, `${id}#${n}`);
  });
  return keys;
}

/** The open-state keys of `text`'s term markers, in document order. */
export const termMarkerKeys = (text: string): string[] => [...termKeysByPart(splitParts(text)).values()];

export const RichText: React.FC<RichTextProps> = ({ text, onNavigateChapter, onSearchGlossary }) => {
  const parts = splitParts(text);
  const baseId = useId();
  const termKeys = termKeysByPart(parts);
  // Open term panels, by term key. Local state: opening one never scrolls, navigates or touches the hash.
  const [openTerms, setOpenTerms] = useState<readonly string[]>([]);
  const panelId = (key: string) => `${baseId}-term-${key.replace('#', '-')}`;
  const toggle = (key: string) =>
    setOpenTerms(open => (open.includes(key) ? open.filter(k => k !== key) : [...open, key]));

  return (
    <>
      {parts.map((part, idx) => {
        if (part === '\n') {
          return <br key={idx} />;
        }

        if (OPT_OUT_RE.test(part)) {
          return null;
        }

        const termMarker = TERM_RE.exec(part);
        if (termMarker) {
          const [, termId, label] = termMarker;
          if (!lookupTerm(termId)) return <React.Fragment key={idx}>{label}</React.Fragment>;
          const termKey = termKeys.get(idx)!;
          return (
            <InlineTermTrigger
              key={idx}
              termId={termId}
              label={label}
              open={openTerms.includes(termKey)}
              panelId={panelId(termKey)}
              onToggle={() => toggle(termKey)}
            />
          );
        }

        if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
          return (
            <strong key={idx} className="font-semibold text-neutral-900 dark:text-[#e5e5e5]">
              {part.slice(2, -2)}
            </strong>
          );
        }

        const link = LINK_RE.exec(part);
        if (link) {
          const [, chapterId, label] = link;
          if (!onNavigateChapter) {
            return <span key={idx}>{label}</span>;
          }
          return (
            <a
              key={idx}
              href={formatChapterHash(Number(chapterId.slice(1)))}
              onClick={event => {
                event.preventDefault();
                onNavigateChapter(chapterId);
              }}
              className="font-medium text-neutral-900 dark:text-white underline decoration-neutral-400 dark:decoration-[#525252] underline-offset-2 hover:decoration-neutral-900 dark:hover:decoration-white transition-colors"
            >
              {label}
            </a>
          );
        }

        return <React.Fragment key={idx}>{part}</React.Fragment>;
      })}
      {/* Open panels in document order; a key whose marker is gone from the text renders nothing. */}
      {[...termKeys.values()].filter(key => openTerms.includes(key)).map(key => {
        const term = lookupTerm(key.split('#')[0]);
        if (!term) return null;
        return (
          <InlineTermPanel
            key={`panel-${key}`}
            term={term}
            panelId={panelId(key)}
            onNavigateChapter={onNavigateChapter}
            onSearchGlossary={onSearchGlossary}
          />
        );
      })}
    </>
  );
};
