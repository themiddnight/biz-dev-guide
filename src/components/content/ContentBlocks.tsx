import React from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { ChapterContentSection, ContentBlock, ContentPlacement, FigureKey } from '../../types';
import { FIGURES, FigureProps } from '../figures';
import { ContentTable } from './ContentTable';
import { RichText } from './RichText';
import { TAP, TAP_Y } from '../ui/tapTarget';

interface ContentBlocksProps {
  sections: ChapterContentSection[];
  placement: ContentPlacement;
  onNavigateChapter?: (chapterId: string) => void;
}

type NoteTone = Extract<ContentBlock, { kind: 'note' }>['tone'];

const NOTE_TONES: Record<NoteTone, string> = {
  info: 'bg-base-300 border-base-border text-base-content-body',
  warn: 'bg-warning/10 border-warning/25 text-warning',
  ok: 'bg-success/10 border-success/25 text-success',
};

const blockTitleClass = 'text-xs sm:text-sm font-bold text-base-content';
const introClass = 'text-xs sm:text-sm text-base-content-secondary leading-relaxed';
const detailsClass =
  'group rounded-xl border border-base-border bg-base-100 overflow-hidden';
const summaryClass = `${TAP_Y} flex items-center justify-between gap-2 p-box-dense cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden bg-base-300 hover:bg-base-border transition-colors`;

const SummaryChevron = () => (
  <ChevronDown className="w-4 h-4 shrink-0 text-base-content-muted transition-transform group-open:rotate-180" />
);

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
        <div className={`p-box-dense rounded-xl border text-xs sm:text-sm leading-relaxed ${NOTE_TONES[block.tone]}`}>
          {block.title && <div className="font-bold mb-1">{block.title}</div>}
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
            <figcaption className="text-[11px] sm:text-xs text-base-content-muted leading-relaxed">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {block.cards.map((card, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-base-300 border border-base-border space-y-1.5"
              >
                <div className="text-xs sm:text-sm font-bold text-base-content leading-snug">
                  {card.term}
                </div>
                <p className="text-xs sm:text-sm text-base-content-secondary leading-relaxed">
                  {rich(card.def)}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'details':
      return (
        <details className={detailsClass}>
          <summary className={summaryClass}>
            <span className={blockTitleClass}>{block.summary}</span>
            <SummaryChevron />
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
          <summary className={summaryClass}>
            <span className={blockTitleClass}>{block.title ?? 'แหล่งอ้างอิง'}</span>
            <SummaryChevron />
          </summary>
          <div className="p-box-dense space-y-3 border-t border-base-border">
            <ul className="pl-5 space-y-1 list-disc text-xs sm:text-sm text-base-content-body">
              {block.items.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
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
    <div className="space-y-6">
      {visible.map((section, sIdx) => (
        <section key={sIdx} className="space-y-4">
          {section.heading && (
            <h3 className="text-sm sm:text-base font-bold text-base-content flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-base-content inline-block"></span>
              <span>{section.heading}</span>
            </h3>
          )}
          {section.blocks.map(block => (
            <Block key={block.id} block={block} onNavigateChapter={onNavigateChapter} />
          ))}
        </section>
      ))}
    </div>
  );
};
