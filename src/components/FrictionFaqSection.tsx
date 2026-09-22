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
        className="anchor-target bg-white dark:bg-[#141414] rounded-xl border border-neutral-200 dark:border-[#262626] overflow-hidden"
      >
        <button
          type="button"
          onClick={() => toggleItem(faq.id)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="w-full p-3.5 flex items-start justify-between gap-3 text-left cursor-pointer select-none hover:bg-neutral-50 dark:hover:bg-[#181818] transition-colors"
        >
          <span className="flex items-start gap-2.5 font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa] leading-relaxed">
            <span className="shrink-0 mt-0.5 px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#333333] text-[10px] text-neutral-600 dark:text-[#a3a3a3]">
              Q{num}
            </span>
            <span>{faq.question}</span>
          </span>
          <span className="shrink-0 text-neutral-400 dark:text-[#737373] text-base leading-none mt-0.5" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>

        {isOpen && (
          <div
            id={panelId}
            className="px-3.5 pb-3.5 pt-3 border-t border-neutral-100 dark:border-[#262626] space-y-3 text-xs sm:text-sm"
          >
            <p className="text-neutral-700 dark:text-[#c4c4c4] leading-relaxed">
              <RichText text={faq.real} onNavigateChapter={onNavigateChapter} />
            </p>

            {faq.figure && Figure && (
              <figure className="p-3 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] space-y-2">
                <p className="text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-[#fafafa]">{faq.figure.title}</p>
                <div className="overflow-x-auto">
                  <Figure className="min-w-[480px] max-w-[560px] mx-auto" />
                </div>
                {faq.figure.caption && (
                  <figcaption className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] leading-relaxed">
                    <RichText text={faq.figure.caption} onNavigateChapter={onNavigateChapter} />
                  </figcaption>
                )}
                {faq.figure.note && (
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] leading-relaxed">
                    <RichText text={faq.figure.note} onNavigateChapter={onNavigateChapter} />
                  </p>
                )}
              </figure>
            )}

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 space-y-1.5">
              <div className="font-bold text-emerald-900 dark:text-emerald-200">ทางออกที่ใช้ได้</div>
              <ul className="pl-4 space-y-1 list-disc text-emerald-900 dark:text-emerald-100/90 leading-relaxed marker:text-emerald-600 dark:marker:text-emerald-400">
                {faq.fixes.map((fix, idx) => (
                  <li key={idx}>
                    <RichText text={fix} onNavigateChapter={onNavigateChapter} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-neutral-500 dark:text-[#8e8e8e]">แนวคิดที่เกี่ยวข้อง:</span>
              {faq.concepts.map(concept =>
                GLOSSARY_KEYS.has(concept.toLowerCase()) ? (
                  <button
                    key={concept}
                    type="button"
                    onClick={() => onSearchGlossary(concept)}
                    title={`ค้นหา "${concept}" ในคลังคำศัพท์ (บทที่ 15)`}
                    className={`${chipClass} cursor-pointer bg-neutral-100 dark:bg-[#1f1f1f] border-neutral-200 dark:border-[#333333] text-neutral-800 dark:text-[#d4d4d4] hover:bg-neutral-200 dark:hover:bg-[#262626] underline decoration-dotted decoration-neutral-400 dark:decoration-[#525252] underline-offset-2`}
                  >
                    {concept}
                  </button>
                ) : (
                  <span
                    key={concept}
                    className={`${chipClass} bg-neutral-50 dark:bg-[#181818] border-neutral-200 dark:border-[#262626] text-neutral-600 dark:text-[#a3a3a3]`}
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
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-900 dark:text-white underline decoration-neutral-400 dark:decoration-[#525252] underline-offset-2 hover:decoration-neutral-900 dark:hover:decoration-white cursor-pointer"
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
      <div className="p-3 sm:p-3.5 rounded-xl border bg-neutral-50 dark:bg-[#181818] border-neutral-200 dark:border-[#262626] text-xs sm:text-sm text-neutral-700 dark:text-[#d4d4d4] leading-relaxed space-y-2.5">
        <div>
          <span className="block font-bold text-neutral-900 dark:text-[#fafafa] mb-0.5">
            {FAQ_AUDIENCE_CALLOUTS.business.who}
          </span>
          {FAQ_AUDIENCE_CALLOUTS.business.body}
        </div>
        <div>
          <span className="block font-bold text-neutral-900 dark:text-[#fafafa] mb-0.5">
            {FAQ_AUDIENCE_CALLOUTS.engineer.who}
          </span>
          {FAQ_AUDIENCE_CALLOUTS.engineer.body}
        </div>
      </div>

      {/* Quick jump chips (collapsible on mobile) */}
      <nav aria-label="สารบัญคำถามในบทนี้" className="p-3 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] space-y-2">
        <button
          type="button"
          onClick={() => setIsJumpOpen(prev => !prev)}
          aria-expanded={isJumpOpen}
          aria-controls="s11-faq-jump"
          className="w-full flex items-center justify-between gap-2 text-left sm:cursor-default cursor-pointer"
        >
          <span className="flex items-center gap-2 text-[11px] sm:text-xs font-bold text-neutral-900 dark:text-[#fafafa]">
            <ListOrdered className="w-4 h-4 text-neutral-500 dark:text-[#a3a3a3]" />
            {FAQ_QUICK_JUMP_TITLE}
          </span>
          <span className="sm:hidden">
            {isJumpOpen ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </span>
        </button>
        <div id="s11-faq-jump" className={`${isJumpOpen ? 'flex' : 'hidden'} sm:flex flex-wrap gap-1.5`}>
          {FRICTION_FAQS.map((faq, idx) => (
            <button
              key={faq.id}
              type="button"
              onClick={() => jumpTo(faq.id)}
              className={`${chipClass} cursor-pointer text-left bg-neutral-50 dark:bg-[#181818] border-neutral-200 dark:border-[#262626] text-neutral-700 dark:text-[#c4c4c4] hover:bg-neutral-100 dark:hover:bg-[#1f1f1f]`}
            >
              <span className="text-neutral-400 dark:text-[#737373] mr-1">{idx + 1}.</span>
              {faq.question}
            </button>
          ))}
        </div>
      </nav>

      {/* Groups, normal order */}
      {FAQ_GROUPS.map(group => (
        <section key={group.key} className="space-y-2.5">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">{group.title}</h4>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">{group.subtitle}</p>
          </div>
          {FRICTION_FAQS.filter(faq => faq.group === group.key).map(renderItem)}
        </section>
      ))}

      {/* Closing principles, caveat and sources */}
      <section className="space-y-3">
        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">{FAQ_PRINCIPLES_TITLE}</h4>
        <ol className="space-y-2">
          {FAQ_PRINCIPLES.map((principle, idx) => (
            <li
              key={idx}
              className="p-3 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] text-xs sm:text-sm space-y-1"
            >
              <div className="font-bold text-neutral-900 dark:text-[#fafafa]">
                {idx + 1}. {principle.title}
              </div>
              <p className="text-neutral-600 dark:text-[#a3a3a3] leading-relaxed">
                <RichText text={principle.body} onNavigateChapter={onNavigateChapter} />
              </p>
            </li>
          ))}
        </ol>

        <div className="p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed bg-amber-50 dark:bg-amber-950/30 border-amber-500/25 text-amber-900 dark:text-amber-200">
          <RichText text={FAQ_CAVEAT} onNavigateChapter={onNavigateChapter} />
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] sm:text-xs font-bold text-neutral-700 dark:text-[#c4c4c4]">แหล่งอ้างอิงสำหรับแนวคิดในบทที่ 11</div>
          <ul className="pl-5 space-y-1 list-disc text-xs sm:text-sm text-neutral-700 dark:text-[#d4d4d4]">
            {FAQ_SOURCES.map(source => (
              <li key={source.url} className="leading-relaxed">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline decoration-neutral-400 dark:decoration-[#525252] underline-offset-2 hover:decoration-neutral-900 dark:hover:decoration-white"
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
