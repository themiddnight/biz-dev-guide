import React from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import { ChapterContentSection, ContentBlock, FigureKey } from '../../types';
import { FIGURES, FigureProps } from '../figures';
import { ContentTable } from './ContentTable';
import { RichText } from './RichText';

interface ContentBlocksProps {
  sections: ChapterContentSection[];
  placement: 'reference' | 'diagram';
  onNavigateChapter?: (chapterId: string) => void;
}

type NoteTone = Extract<ContentBlock, { kind: 'note' }>['tone'];

const NOTE_TONES: Record<NoteTone, string> = {
  info: 'bg-neutral-50 dark:bg-[#181818] border-neutral-200 dark:border-[#262626] text-neutral-700 dark:text-[#d4d4d4]',
  warn: 'bg-amber-50 dark:bg-amber-950/30 border-amber-500/25 text-amber-900 dark:text-amber-200',
  ok: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/25 text-emerald-900 dark:text-emerald-200',
};

const blockTitleClass = 'text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]';
const introClass = 'text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3] leading-relaxed';
const detailsClass =
  'group rounded-xl border border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#141414] overflow-hidden';
const summaryClass =
  'flex items-center justify-between gap-2 p-3 sm:p-3.5 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] transition-colors';

const SummaryChevron = () => (
  <ChevronDown className="w-4 h-4 shrink-0 text-neutral-400 dark:text-[#737373] transition-transform group-open:rotate-180" />
);

// Guards against keys missing at runtime (e.g. stale data) even though FIGURES is typed as complete.
const getFigure = (key: FigureKey): React.FC<FigureProps> | undefined => FIGURES[key];

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
        <div className={`p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${NOTE_TONES[block.tone]}`}>
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
          <Figure className="w-full h-auto" />
          {block.caption && (
            <figcaption className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] leading-relaxed">
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
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-1.5"
              >
                <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa] leading-snug">
                  {card.term}
                </div>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3] leading-relaxed">
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
          <div className="p-3 sm:p-4 space-y-4 border-t border-neutral-100 dark:border-[#262626]">
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
          <div className="p-3 sm:p-4 space-y-3 border-t border-neutral-100 dark:border-[#262626]">
            <ul className="pl-5 space-y-1 list-disc text-xs sm:text-sm text-neutral-700 dark:text-[#d4d4d4]">
              {block.items.map((item, idx) => (
                <li key={idx} className="leading-relaxed">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 underline decoration-neutral-400 dark:decoration-[#525252] underline-offset-2 hover:decoration-neutral-900 dark:hover:decoration-white"
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
  const visible = sections.filter(section =>
    placement === 'diagram' ? section.placement === 'diagram' : section.placement !== 'diagram'
  );

  if (visible.length === 0) return null;

  return (
    <div className="space-y-6">
      {visible.map((section, sIdx) => (
        <section key={sIdx} className="space-y-4">
          {section.heading && (
            <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-[#fafafa] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white inline-block"></span>
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
