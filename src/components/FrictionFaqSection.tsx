import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, ExternalLink, ListOrdered } from 'lucide-react';
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

const chipClass =
  'px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium border transition-colors';

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
      <div
        key={faq.id}
        id={faq.id}
        className="anchor-target bg-base-100 rounded-xl border border-base-border overflow-hidden"
      >
        <button
          type="button"
          onClick={() => toggleItem(faq.id)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className={`${TAP} w-full p-3.5 flex items-start justify-between gap-3 text-left cursor-pointer select-none hover:bg-base-300 transition-colors`}
        >
          <span className="flex items-start gap-2.5 font-bold text-xs sm:text-sm text-base-content leading-relaxed">
            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded-md bg-base-300 border border-base-border text-[10px] text-base-content-secondary">
              Q{num}
            </span>
            <span>{faq.question}</span>
          </span>
          <span className="shrink-0 text-base-content-muted text-base leading-none mt-0.5" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>

        {isOpen && (
          <div
            id={panelId}
            className="px-3.5 pb-3.5 pt-3 border-t border-base-border space-y-3 text-xs sm:text-sm"
          >
            <p className="text-base-content-body leading-relaxed">
              <RichText text={faq.real} onNavigateChapter={onNavigateChapter} />
            </p>

            {faq.figure && Figure && (
              <figure className="p-3 rounded-xl bg-base-100 border border-base-border space-y-2">
                <p className="text-[11px] sm:text-xs font-bold text-base-content">{faq.figure.title}</p>
                <div className="overflow-x-auto">
                  <Figure className="min-w-[480px] max-w-[560px] mx-auto" />
                </div>
                {faq.figure.caption && (
                  <figcaption className="text-[11px] sm:text-xs text-base-content-muted leading-relaxed">
                    <RichText text={faq.figure.caption} onNavigateChapter={onNavigateChapter} />
                  </figcaption>
                )}
                {faq.figure.note && (
                  <p className="text-[11px] sm:text-xs text-base-content-muted leading-relaxed">
                    <RichText text={faq.figure.note} onNavigateChapter={onNavigateChapter} />
                  </p>
                )}
              </figure>
            )}

            <div className="p-3 rounded-xl bg-success/10 border border-success/25 space-y-1.5">
              <div className="font-bold text-success">ทางออกที่ใช้ได้</div>
              <ul className="pl-4 space-y-1 list-disc text-success leading-relaxed marker:text-success">
                {faq.fixes.map((fix, idx) => (
                  <li key={idx}>
                    <RichText text={fix} onNavigateChapter={onNavigateChapter} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-base-content-muted">แนวคิดที่เกี่ยวข้อง:</span>
              {faq.concepts.map(concept =>
                GLOSSARY_KEYS.has(concept.toLowerCase()) ? (
                  <button
                    key={concept}
                    type="button"
                    onClick={() => onSearchGlossary(concept)}
                    title={`ค้นหา "${concept}" ในหน้ารวมคำศัพท์ (บทที่ 15)`}
                    className={`${TAP_GAP[6]} ${chipClass} cursor-pointer bg-base-300 border-base-border text-base-content-body hover:bg-base-border underline decoration-dotted decoration-base-content-subtle underline-offset-2`}
                  >
                    {concept}
                  </button>
                ) : (
                  <span
                    key={concept}
                    className={`${chipClass} bg-base-300 border-base-border text-base-content-secondary`}
                  >
                    {concept}
                  </span>
                )
              )}
            </div>

            {faq.relatedPlaybookChapterId && (
              <button
                type="button"
                onClick={() => onScrollToPlaybook(faq.relatedPlaybookChapterId as string)}
                className={`${TAP} inline-flex items-center gap-1.5 text-xs font-semibold text-base-content underline decoration-base-content-subtle underline-offset-2 hover:decoration-base-content cursor-pointer`}
              >
                {faq.relatedPlaybookChapterId === 's11'
                  ? 'ดู Iron Triangle ด้านบน'
                  : `ดู playbook เต็ม: บทที่ ${faq.relatedPlaybookChapterId.slice(1)}`}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Audience callouts (static .aud-callout) — both shown together */}
      <div className="p-box-dense rounded-xl border bg-base-300 border-base-border text-xs sm:text-sm text-base-content-body leading-relaxed space-y-2.5">
        <div>
          <span className="block font-bold text-base-content mb-0.5">
            {FAQ_AUDIENCE_CALLOUTS.business.who}
          </span>
          {FAQ_AUDIENCE_CALLOUTS.business.body}
        </div>
        <div>
          <span className="block font-bold text-base-content mb-0.5">
            {FAQ_AUDIENCE_CALLOUTS.engineer.who}
          </span>
          {FAQ_AUDIENCE_CALLOUTS.engineer.body}
        </div>
      </div>

      {/* Quick jump chips (collapsible on mobile) */}
      <nav aria-label="สารบัญคำถามในบทนี้" className="p-3 rounded-xl bg-base-100 border border-base-border space-y-2">
        <button
          type="button"
          onClick={() => setIsJumpOpen(prev => !prev)}
          aria-expanded={isJumpOpen}
          aria-controls="s11-faq-jump"
          className={`${TAP} w-full flex items-center justify-between gap-2 text-left sm:cursor-default cursor-pointer`}
        >
          <span className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-base-content">
            <ListOrdered className="w-4 h-4 text-base-content-muted" />
            {FAQ_QUICK_JUMP_TITLE}
          </span>
          <span className="sm:hidden">
            {isJumpOpen ? <ChevronUp className="w-4 h-4 text-base-content-muted" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
          </span>
        </button>
        <div id="s11-faq-jump" className={`${isJumpOpen ? 'flex' : 'hidden'} sm:flex flex-wrap gap-1.5`}>
          {FRICTION_FAQS.map((faq, idx) => (
            <button
              key={faq.id}
              type="button"
              onClick={() => jumpTo(faq.id)}
              className={`${TAP_GAP[6]} ${chipClass} cursor-pointer text-left bg-base-300 border-base-border text-base-content-body hover:bg-base-border`}
            >
              <span className="text-base-content-muted mr-1">{idx + 1}.</span>
              {faq.question}
            </button>
          ))}
        </div>
      </nav>

      {/* Groups, normal order */}
      {FAQ_GROUPS.map(group => (
        <section key={group.key} className="space-y-2.5">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-base-content">{group.title}</h4>
            <p className="text-[11px] sm:text-xs text-base-content-muted">{group.subtitle}</p>
          </div>
          {FRICTION_FAQS.filter(faq => faq.group === group.key).map(renderItem)}
        </section>
      ))}

      {/* Closing principles, caveat and sources */}
      <section className="space-y-3">
        <h4 className="text-xs sm:text-sm font-bold text-base-content">{FAQ_PRINCIPLES_TITLE}</h4>
        <ol className="space-y-2">
          {FAQ_PRINCIPLES.map((principle, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-base-100 border border-base-border text-xs sm:text-sm space-y-1"
            >
              <div className="font-bold text-base-content">
                {idx + 1}. {principle.title}
              </div>
              <p className="text-base-content-secondary leading-relaxed">
                <RichText text={principle.body} onNavigateChapter={onNavigateChapter} />
              </p>
            </li>
          ))}
        </ol>

        <div className="p-box-dense rounded-xl border text-xs sm:text-sm leading-relaxed bg-warning/10 border-warning/25 text-warning">
          <RichText text={FAQ_CAVEAT} onNavigateChapter={onNavigateChapter} />
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] sm:text-xs font-bold text-base-content-body">ที่มาของแนวคิดในบทที่ 11</div>
          <ul className="pl-5 space-y-1 list-disc text-xs sm:text-sm text-base-content-body">
            {FAQ_SOURCES.map(source => (
              <li key={source.url} className="leading-relaxed">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${TAP} inline-flex items-center gap-1 underline decoration-base-content-subtle underline-offset-2 hover:decoration-base-content`}
                >
                  {source.label}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
