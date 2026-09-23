import React from 'react';
import { Sparkles, RotateCcw, Trophy, Target, Zap, Bot, BookOpen } from 'lucide-react';
import { CHAPTERS } from '../../data/chaptersData';
import { resultCopy, scoreBand, type MissedItem } from '../../lib/quizResult';
import { TAP } from '../ui/tapTarget';

interface QuizResultScreenProps {
  score: number;
  total: number;
  awardedXp: number;
  missed: MissedItem[];
  onRestart: () => void;
  onAskAI: () => void;
  onOpenChapter: (id: string) => void;
}

// Props only, no hooks: the repo has no DOM test environment, so the screen is tested
// with renderToStaticMarkup the way IndexEmptyState is (round3 spec D6).
export const QuizResultScreen: React.FC<QuizResultScreenProps> = ({
  score,
  total,
  awardedXp,
  missed,
  onRestart,
  onAskAI,
  onOpenChapter,
}) => {
  const percentage = total === 0 ? 0 : Math.round((score / total) * 100);
  const band = scoreBand(score, total);
  const { heading, subtitle } = resultCopy(band);
  const Icon = band === 'strong' ? Trophy : Target;

  return (
    <div data-quiz-result={band} className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
      <div
        className={`w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center border-2 border-amber-500/20 shadow-lg shadow-amber-500/10 ${
          band === 'strong' ? 'animate-bounce' : ''
        }`}
      >
        <Icon className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ทำครบแล้ว! บันทึกผลแล้ว</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">{heading}</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{subtitle}</p>
      </div>

      {/* Score & XP Card */}
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto p-6 bg-white dark:bg-[#141414] rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-[#262626] shadow-2xs">
        <div className="space-y-1">
          <span className="text-xs text-neutral-500 dark:text-[#8e8e8e] font-medium">คะแนนที่ได้</span>
          <div className="text-3xl font-extrabold text-neutral-900 dark:text-[#fafafa]">
            {score} <span className="text-lg text-neutral-400 dark:text-[#666666] font-normal">/ {total}</span>
          </div>
          <span className="text-xs text-neutral-600 dark:text-[#a3a3a3] font-medium">{percentage}% ถูกต้อง</span>
        </div>
        <div className="space-y-1 border-l border-neutral-200 dark:border-[#262626] pl-4">
          <span className="text-xs text-neutral-500 dark:text-[#8e8e8e] font-medium">XP ที่ได้รับ</span>
          <div className="text-3xl font-extrabold text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1">
            <Zap className="w-6 h-6 fill-amber-500 text-amber-500" />
            <span>+{awardedXp}</span>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            {awardedXp > 0 ? 'สะสมเข้าโปรไฟล์แล้ว' : 'ข้อที่ตอบถูกเคยได้รับ XP ไปแล้ว'}
          </span>
        </div>
      </div>

      {/* Review of the wrong answers (round3 spec P2.4) */}
      {missed.length === 0 ? (
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">ตอบถูกทุกข้อ</p>
      ) : (
        <div data-quiz-review className="space-y-3 text-left">
          <h3 className="text-sm font-extrabold text-neutral-900 dark:text-[#fafafa]">
            ข้อที่ตอบผิด ({missed.length} ข้อ)
          </h3>
          {missed.map((item) => {
            const chapter = CHAPTERS.find((c) => c.id === item.question.chapterId);
            return (
              <div
                key={item.question.id}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] space-y-2 shadow-2xs"
              >
                <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa] break-words">
                  {item.question.question}
                </p>
                <p className="text-xs text-neutral-600 dark:text-[#a3a3a3] break-words">
                  คุณตอบ: {item.chosenText}
                </p>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 break-words">
                  คำตอบที่ถูก: {item.correctText}
                </p>
                <p className="text-xs text-neutral-700 dark:text-[#c4c4c4] leading-relaxed break-words">
                  {item.explanation}
                </p>
                {chapter && (
                  <button
                    type="button"
                    data-quiz-review-chapter={chapter.id}
                    onClick={() => onOpenChapter(chapter.id)}
                    className={`${TAP} inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-900 dark:text-[#e5e5e5] border border-neutral-200 dark:border-[#262626] text-xs font-semibold hover:bg-neutral-200/70 dark:hover:bg-[#222222] transition-all cursor-pointer max-w-full`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span className="truncate">อ่านบทที่ {chapter.num}: {chapter.title}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          onClick={onRestart}
          className={`${TAP} w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] text-xs sm:text-sm font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>ทำแบบทดสอบอีกครั้ง</span>
        </button>

        <button
          onClick={onAskAI}
          className={`${TAP} w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-900 dark:text-[#e5e5e5] border border-neutral-200 dark:border-[#262626] text-xs sm:text-sm font-semibold hover:bg-neutral-200/70 dark:hover:bg-[#222222] transition-all cursor-pointer`}
        >
          <Bot className="w-4 h-4" />
          <span>ถาม AI ทบทวนข้อที่ยังไม่แม่น</span>
        </button>
      </div>
    </div>
  );
};
