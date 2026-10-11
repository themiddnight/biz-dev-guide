import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ChapterContentSection, ContentBlock, ContentPlacement, FigureKey } from '../../types';
import { FIGURES, FigureProps } from '../figures';
import { ContentTable } from './ContentTable';
import { RichText } from './RichText';
import { TAP } from '../ui/tapTarget';
import { DISCLOSURE_SUMMARY, DisclosureChevron } from '../ui/Disclosure';

interface ContentBlocksProps {
  sections: ChapterContentSection[];
  placement: ContentPlacement;
  onNavigateChapter?: (chapterId: string) => void;
}

type NoteTone = Extract<ContentBlock, { kind: 'note' }>['tone'];

/** The tone colours the note's title word only; the note itself is a ruled paragraph, not a box. */
const NOTE_TITLE_TONE: Record<NoteTone, string> = {
  info: 'text-base-content',
  warn: 'text-warning',
  ok: 'text-success',
};

const blockTitleClass = 'font-semibold text-base-content';
const introClass = 'text-base-content-secondary';
const detailsClass = 'group rounded-box border border-base-border overflow-hidden';

// Guards against keys missing at runtime (e.g. stale data) even though FIGURES is typed as complete.
const getFigure = (key: FigureKey): React.FC<FigureProps> | undefined => FIGURES[key];

// Figures drawn ≥600 units wide: keep labels legible on narrow screens by scrolling inside the figure only.
const WIDE_FIGURES: ReadonlySet<FigureKey> = new Set<FigureKey>([
  'c4-l1-hero',
  'gate-timeline',
  'env-flow',
  'uncertainty-spectrum',
]);

interface BlockProps {
  block: ContentBlock;
  onNavigateChapter?: (chapterId: string) => void;
}

const Block: React.FC<BlockProps> = ({ block, onNavigateChapter }) => {
  const rich = (text: string) => <RichText text={text} onNavigateChapter={onNavigateChapter} />;

  switch (block.kind) {
    case 'table':
      return <ContentTable block={block} onNavigateChapter={onNavigateChapter} />;

    case 'note':
      return (
        <div className="border-l-2 border-base-border-strong pl-4">
          {block.title && <div className={`font-semibold ${NOTE_TITLE_TONE[block.tone]}`}>{block.title}</div>}
          <div>{rich(block.body)}</div>
        </div>
      );

    case 'figure': {
      const Figure = getFigure(block.figureKey);
      if (!Figure) return null;
      return (
        <figure className="space-y-2">
          {block.title && <div className={blockTitleClass}>{block.title}</div>}
          {WIDE_FIGURES.has(block.figureKey) ? (
            <div className="overflow-x-auto">
              <div className="min-w-[520px]">
                <Figure className="w-full h-auto" />
              </div>
            </div>
          ) : (
            <Figure className="w-full h-auto" />
          )}
          {block.caption && (
            <figcaption className="text-sm text-base-content-muted">
              {rich(block.caption)}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'cards':
      return (
        <div className="space-y-3">
          {block.title && <h4 className={blockTitleClass}>{block.title}</h4>}
          {block.intro && <p className={introClass}>{rich(block.intro)}</p>}
          <dl className="divide-y divide-base-border border-y border-base-border">
            {block.cards.map((card, idx) => (
              <div key={idx} className="grid gap-x-6 gap-y-1 py-3 sm:grid-cols-[11rem_1fr]">
                <dt className="font-semibold text-base-content">{card.term}</dt>
                <dd className="min-w-0">{rich(card.def)}</dd>
              </div>
            ))}
          </dl>
        </div>
      );

    case 'details':
      return (
        <details className={detailsClass}>
          <summary className={DISCLOSURE_SUMMARY}>
            <span className={blockTitleClass}>{block.summary}</span>
            <DisclosureChevron />
          </summary>
          <div className="p-box-dense space-y-4 border-t border-base-border">
            {block.body.map(child => (
              <Block key={child.id} block={child} onNavigateChapter={onNavigateChapter} />
            ))}
          </div>
        </details>
      );

    case 'sources':
      return (
        <details className={detailsClass}>
          <summary className={DISCLOSURE_SUMMARY}>
            <span className={blockTitleClass}>{block.title ?? 'แหล่งอ้างอิง'}</span>
            <DisclosureChevron />
          </summary>
          <div className="p-box-dense space-y-3 border-t border-base-border">
            <ul className="list-disc space-y-1 pl-5">
              {block.items.map((item, idx) => (
                <li key={idx}>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${TAP} inline-flex items-center gap-1 underline decoration-base-content-subtle underline-offset-2 hover:decoration-base-content`}
                    >
                      {item.label}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    item.label
                  )}
                </li>
              ))}
            </ul>
            {block.caveat && <p className={introClass}>{rich(block.caveat)}</p>}
          </div>
        </details>
      );

    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
};

export const ContentBlocks: React.FC<ContentBlocksProps> = ({ sections, placement, onNavigateChapter }) => {
  // Unset placement means Reference; 'diagram' and 'inline' sections render only where asked for.
  const visible = sections.filter(section => (section.placement ?? 'reference') === placement);

  if (visible.length === 0) return null;

  return (
    <div className="space-y-7">
      {visible.map((section, sIdx) => (
        <section key={sIdx} className="space-y-4">
          {section.heading && (
            <h3 className="text-base font-bold text-base-content">{section.heading}</h3>
          )}
          {section.blocks.map(block => (
            <Block key={block.id} block={block} onNavigateChapter={onNavigateChapter} />
          ))}
        </section>
      ))}
    </div>
  );
};
