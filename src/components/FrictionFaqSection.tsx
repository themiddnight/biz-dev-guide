import React, { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import {
  FAQ_AUDIENCE_CALLOUTS,
  FAQ_CAVEAT,
  FAQ_GROUPS,
  FAQ_PRINCIPLES,
  FAQ_PRINCIPLES_TITLE,
  FAQ_QUICK_JUMP_TITLE,
  FAQ_SOURCES,
  FRICTION_FAQS,
  FrictionFaq,
} from '../data/frictionFaqs';
import { GLOSSARY } from '../data/glossary';
import { FIGURES } from './figures';
import { RichText } from './content/RichText';
import { TAP, TAP_GAP } from './ui/tapTarget';

interface FrictionFaqSectionProps {
  onNavigateChapter: (chapterId: string) => void;
  /** Scroll to the friction playbook of a chapter (the current one scrolls in-page). */
  onScrollToPlaybook: (chapterId: string) => void;
  /** Open the s15 glossary with its search prefilled. */
  onSearchGlossary: (query: string) => void;
}

/** Lowercased lookup keys for a glossary label: full text, text without "(…)", and each " / " part. */
const glossaryKeys = (label: string): string[] => {
  const strip = (text: string) => text.replace(/\s*\(.*?\)/g, '').trim().toLowerCase();
  const parts = label.split(/\s*\/\s*/);
  return [label.toLowerCase(), strip(label), ...parts.map(p => p.trim().toLowerCase()), ...parts.map(strip)];
};

const GLOSSARY_KEYS: Set<string> = new Set(
  GLOSSARY.flatMap(term => [term.term, ...(term.aliases ?? [])].flatMap(glossaryKeys))
);

const chipClass = 'rounded-field border border-base-border px-2.5 py-1 text-sm transition-colors';
const LINK = 'cursor-pointer underline decoration-base-border underline-offset-4 hover:decoration-base-content';

export const FrictionFaqSection: React.FC<FrictionFaqSectionProps> = ({
  onNavigateChapter,
  onScrollToPlaybook,
  onSearchGlossary,
}) => {
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [isJumpOpen, setIsJumpOpen] = useState(false);

  const toggleItem = (id: string) => {
    setOpenIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const jumpTo = (id: string) => {
    setOpenIds(prev => new Set(prev).add(id));
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const renderItem = (faq: FrictionFaq) => {
    const isOpen = openIds.has(faq.id);
    const num = FRICTION_FAQS.indexOf(faq) + 1;
    const panelId = `${faq.id}-panel`;
    const Figure = faq.figure ? FIGURES[faq.figure.key] : null;

    return (
      <div key={faq.id} id={faq.id} className="anchor-target">
        <h4>
          <button
            type="button"
            onClick={() => toggleItem(faq.id)}
            aria-expanded={isOpen}
            aria-controls={isOpen ? panelId : undefined}
            className={`${TAP} group flex w-full cursor-pointer items-baseline gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
          >
            <span className="shrink-0 text-sm text-base-content-muted">Q{num}</span>
            <span className="flex-1 font-semibold text-base-content">{faq.question}</span>
            <ChevronDown aria-hidden="true" className={`h-4 w-4 shrink-0 self-center text-base-content-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </h4>

        {isOpen && (
          <div id={panelId} className="space-y-4 pb-5">
            <p><RichText text={faq.real} onNavigateChapter={onNavigateChapter} /></p>

            {faq.figure && Figure && (
              <figure className="space-y-2 rounded-box border border-base-border p-box-dense">
                <p className="font-semibold text-base-content">{faq.figure.title}</p>
                <div className="overflow-x-auto">
                  <Figure className="min-w-[480px] max-w-[560px] mx-auto" />
                </div>
                {faq.figure.caption && (
                  <figcaption className="text-sm text-base-content-muted">
                    <RichText text={faq.figure.caption} onNavigateChapter={onNavigateChapter} />
                  </figcaption>
                )}
                {faq.figure.note && (
                  <p className="text-sm text-base-content-muted">
                    <RichText text={faq.figure.note} onNavigateChapter={onNavigateChapter} />
                  </p>
                )}
              </figure>
            )}

            <div>
              <div className="font-semibold text-success">ทางออกที่ใช้ได้</div>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {faq.fixes.map((fix, idx) => (
                  <li key={idx}><RichText text={fix} onNavigateChapter={onNavigateChapter} /></li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-base-content-muted">แนวคิดที่เกี่ยวข้อง</span>
              {faq.concepts.map(concept =>
                GLOSSARY_KEYS.has(concept.toLowerCase()) ? (
                  <button
                    key={concept}
                    type="button"
                    onClick={() => onSearchGlossary(concept)}
                    title={`ค้นหา "${concept}" ในรวมคำศัพท์ บทที่ 15`}
                    className={`${TAP_GAP[8]} ${chipClass} cursor-pointer text-base-content hover:bg-base-300`}
                  >
                    {concept}
                  </button>
                ) : (
                  <span key={concept} className={`${chipClass} text-base-content-muted`}>{concept}</span>
                )
              )}
            </div>

            {faq.relatedPlaybookChapterId && (
              <button
                type="button"
                onClick={() => onScrollToPlaybook(faq.relatedPlaybookChapterId as string)}
                className={`${TAP} ${LINK} text-sm text-base-content`}
              >
                {faq.relatedPlaybookChapterId === 's11'
                  ? 'ดูวิธีรับมือ Friction ของบทนี้'
                  : `ดูวิธีรับมือ Friction ในบทที่ ${faq.relatedPlaybookChapterId.slice(1)}`}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-7">
      <div className="space-y-2">
        <p><span className="font-semibold text-base-content">{FAQ_AUDIENCE_CALLOUTS.business.who}</span> {FAQ_AUDIENCE_CALLOUTS.business.body}</p>
        <p><span className="font-semibold text-base-content">{FAQ_AUDIENCE_CALLOUTS.engineer.who}</span> {FAQ_AUDIENCE_CALLOUTS.engineer.body}</p>
      </div>

      {/* Quick jump chips (collapsible on mobile) */}
      <nav aria-label="สารบัญคำถามในบทนี้" className="space-y-2">
        <button
          type="button"
          onClick={() => setIsJumpOpen(prev => !prev)}
          aria-expanded={isJumpOpen}
          aria-controls="s11-faq-jump"
          className={`${TAP} flex w-full cursor-pointer items-center justify-between gap-2 text-left sm:cursor-default`}
        >
          <span className="text-sm text-base-content-muted">{FAQ_QUICK_JUMP_TITLE}</span>
          <ChevronDown aria-hidden="true" className={`h-4 w-4 text-base-content-muted transition-transform sm:hidden ${isJumpOpen ? 'rotate-180' : ''}`} />
        </button>
        <div id="s11-faq-jump" className={`${isJumpOpen ? 'flex' : 'hidden'} flex-wrap gap-2 sm:flex`}>
          {FRICTION_FAQS.map((faq, idx) => (
            <button
              key={faq.id}
              type="button"
              data-faq-jump={faq.id}
              onClick={() => jumpTo(faq.id)}
              className={`${TAP_GAP[8]} ${chipClass} cursor-pointer text-left text-base-content hover:bg-base-300`}
            >
              <span className="mr-1 text-base-content-muted">{idx + 1}.</span>
              {faq.question}
            </button>
          ))}
        </div>
      </nav>

      {FAQ_GROUPS.map(group => (
        <section key={group.key}>
          <h3 className="font-semibold text-base-content">{group.title}</h3>
          <p className="text-sm text-base-content-muted">{group.subtitle}</p>
          <div className="mt-2 divide-y divide-base-border border-y border-base-border">
            {FRICTION_FAQS.filter(faq => faq.group === group.key).map(renderItem)}
          </div>
        </section>
      ))}

      <section className="space-y-4">
        <h3 className="font-semibold text-base-content">{FAQ_PRINCIPLES_TITLE}</h3>
        <ol className="space-y-3">
          {FAQ_PRINCIPLES.map((principle, idx) => (
            <li key={idx}>
              <div className="font-semibold text-base-content">{idx + 1}. {principle.title}</div>
              <p><RichText text={principle.body} onNavigateChapter={onNavigateChapter} /></p>
            </li>
          ))}
        </ol>

        <p className="border-l-2 border-base-border-strong pl-4">
          <RichText text={FAQ_CAVEAT} onNavigateChapter={onNavigateChapter} />
        </p>

        <div>
          <div className="text-sm text-base-content-muted">ที่มาของแนวคิดในบทนี้</div>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {FAQ_SOURCES.map(source => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${TAP} ${LINK} inline-flex items-center gap-1`}
                >
                  {source.label}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
