import React from 'react';
import { Clock, Check, Sparkles, Info, CheckCircle2 } from 'lucide-react';
import type { Chapter, ExperienceLevel, AudienceMode } from '../../types';

interface ChapterHeroProps {
  chapter: Chapter;
  experienceLevel: ExperienceLevel;
  audienceMode: AudienceMode;
  isRead: boolean;
}

export const ChapterHero: React.FC<ChapterHeroProps> = ({ chapter, experienceLevel, audienceMode, isRead }) => {
  const analogyHeading = (
    <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-[#fafafa]">
      <Sparkles className="w-4 h-4 text-amber-500" />
      <span>เปรียบแบบบ้านๆ (Real-World Analogy)</span>
    </div>
  );
  const analogyBody = (
    <p className="text-xs sm:text-sm text-neutral-700 dark:text-[#c4c4c4] leading-relaxed font-normal">
      {chapter.plainAnalogy}
    </p>
  );
  const analogyClassName = 'p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-1.5';

  return (
    <>
      {/* Chapter Header */}
      <div className="space-y-3 pb-4 sm:pb-5 border-b border-neutral-100 dark:border-[#262626]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] font-black text-sm flex items-center justify-center shrink-0 shadow-xs font-mono">
            {chapter.num}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#333333] text-neutral-800 dark:text-[#d4d4d4] text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
            {chapter.roleTag}
          </span>
          <span className="flex items-center gap-1 text-[11px] sm:text-xs text-neutral-500 dark:text-[#737373] font-medium font-mono">
            <Clock className="w-3.5 h-3.5" />
            {chapter.readTime}
          </span>
          {isRead && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/50 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-semibold font-mono">
              <Check className="w-3 h-3" />
              ผ่านแล้ว
            </span>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-neutral-900 dark:text-[#fafafa] tracking-tight leading-tight">
          {chapter.title}
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#8e8e8e] leading-relaxed font-normal">
          {chapter.subtitle}
        </p>
        <p className="text-sm text-neutral-800 dark:text-[#d4d4d4] leading-relaxed" data-key-takeaway>
          <span className="font-semibold">สาระสำคัญของบทนี้:</span> {chapter.keyTakeaway}
        </p>
      </div>

      {/* Quick Perspective & Metaphor Box */}
      <div className="space-y-3">
        {/* Plain Language Metaphor (เปรียบแบบบ้านๆ) */}
        {experienceLevel === 'beginner' ? (
          <div className={analogyClassName} data-analogy>
            {analogyHeading}
            {analogyBody}
          </div>
        ) : (
          <details className={analogyClassName} data-analogy>
            <summary className="cursor-pointer">{analogyHeading}</summary>
            {analogyBody}
          </details>
        )}

        {/* Audience Perspectives (Business & Engineer Notes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(audienceMode === 'business' || audienceMode === 'both') && (
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Info className="w-4 h-4 text-amber-500" />
                <span>มุมมองฝั่ง Business</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-[#a3a3a3] leading-relaxed font-normal">
                {chapter.businessNote}
              </p>
            </div>
          )}

          {(audienceMode === 'engineer' || audienceMode === 'both') && (
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span>มุมมองฝั่ง Engineer</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-[#a3a3a3] leading-relaxed font-normal">
                {chapter.engineerNote}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
