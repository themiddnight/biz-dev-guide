import React from 'react';
import { formatChapterHash } from '../../lib/chapterRoute';

/**
 * Renders the restored-content rich text subset without dangerouslySetInnerHTML:
 * - `**bold**`
 * - `\n` line break
 * - `[[sN|label]]` in-app chapter link (calls `onNavigateChapter(id)`)
 */
interface RichTextProps {
  text: string;
  onNavigateChapter?: (chapterId: string) => void;
}

const TOKEN_RE = /(\*\*[^*]+?\*\*|\[\[s\d+\|[^\]]+?\]\]|\n)/g;
const LINK_RE = /^\[\[(s\d+)\|([^\]]+)\]\]$/;

export const RichText: React.FC<RichTextProps> = ({ text, onNavigateChapter }) => {
  const parts = text.split(TOKEN_RE).filter(part => part !== '');

  return (
    <>
      {parts.map((part, idx) => {
        if (part === '\n') {
          return <br key={idx} />;
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
    </>
  );
};
