import React from 'react';
import { Sparkles, RotateCcw, Trophy, Target, Bot, BookOpen } from 'lucide-react';
import { CHAPTERS } from '../../data/chaptersData';
import { resultCopy, scoreBand, type MissedItem } from '../../lib/quizResult';
import { Button } from '../ui/Button';
import { TAP } from '../ui/tapTarget';

interface QuizResultScreenProps {
  score: number;
  total: number;
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
        className={`w-20 h-20 mx-auto rounded-3xl bg-warning/10 text-warning flex items-center justify-center border-2 border-warning/25 shadow-lg shadow-warning/10 ${
          band === 'strong' ? 'animate-bounce' : ''
        }`}
      >
        <Icon className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/25">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ทำครบแล้ว · ใช้ทบทวนเท่านั้น ไม่บันทึกคะแนน</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-base-content">{heading}</h2>
        <p className="text-base-content-secondary text-sm">{subtitle}</p>
      </div>

      {/* Score for this round only */}
      <div className="max-w-xs mx-auto p-6 bg-base-100 rounded-box border border-base-border shadow-2xs">
        <div className="space-y-1">
          <span className="text-xs text-base-content-muted font-medium">คะแนนที่ได้</span>
          <div className="text-3xl font-extrabold text-base-content">
            {score} <span className="text-lg text-base-content-muted font-normal">/ {total}</span>
          </div>
          <span className="text-xs text-base-content-secondary font-medium">{percentage}% ถูกต้อง</span>
        </div>
      </div>

      {/* Review of the wrong answers (round3 spec P2.4) */}
      {missed.length === 0 ? (
        <p className="text-sm font-semibold text-success">ตอบถูกทุกข้อ</p>
      ) : (
        <div data-quiz-review className="space-y-3 text-left">
          <h3 className="text-sm font-extrabold text-base-content">
            ข้อที่ตอบผิด ({missed.length} ข้อ)
          </h3>
          {missed.map((item) => {
            const chapter = CHAPTERS.find((c) => c.id === item.question.chapterId);
            return (
              <div
                key={item.question.id}
                className="p-box rounded-box bg-base-100 border border-base-border space-y-2 shadow-2xs"
              >
                <p className="text-xs sm:text-sm font-bold text-base-content break-words">
                  {item.question.question}
                </p>
                <p className="text-xs text-base-content-secondary break-words">
                  คุณตอบ: {item.chosenText}
                </p>
                <p className="text-xs font-semibold text-success break-words">
                  คำตอบที่ถูก: {item.correctText}
                </p>
                <p className="text-xs text-base-content-body leading-relaxed break-words">
                  {item.explanation}
                </p>
                {chapter && (
                  <button
                    type="button"
                    data-quiz-review-chapter={chapter.id}
                    onClick={() => onOpenChapter(chapter.id)}
                    className={`${TAP} inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-base-300 text-base-content border border-base-border text-xs font-semibold hover:bg-base-border transition-all cursor-pointer max-w-full`}
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
        <Button color="primary" variant="solid" size="lg" onClick={onRestart} className="w-full sm:w-auto">
          <RotateCcw className="w-4 h-4" />
          <span>ทำแบบทดสอบอีกครั้ง</span>
        </Button>

        <Button color="neutral" variant="soft" size="lg" onClick={onAskAI} className="w-full sm:w-auto">
          <Bot className="w-4 h-4" />
          <span>ถาม AI ทบทวนข้อที่ยังไม่แม่น</span>
        </Button>
      </div>
    </div>
  );
};
