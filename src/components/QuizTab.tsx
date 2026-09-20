import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  HelpCircle, 
  Award,
  Zap,
  Bot
} from 'lucide-react';

interface QuizTabProps {
  questions: QuizQuestion[];
  onCompleteQuiz: (score: number, totalXpEarned: number) => void;
  onAskAIWithPrompt: (prompt: string) => void;
}

export const QuizTab: React.FC<QuizTabProps> = ({
  questions,
  onCompleteQuiz,
  onAskAIWithPrompt,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (selectedOptionIndex !== null) return; // Already answered
    setSelectedOptionIndex(idx);

    const isCorrect = currentQ.options[idx].isCorrect;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setEarnedXp((prev) => prev + currentQ.xp);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      setIsFinished(true);
      onCompleteQuiz(score + (currentQ.options[selectedOptionIndex ?? 0]?.isCorrect ? 1 : 0), earnedXp);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setEarnedXp(0);
    setIsFinished(false);
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center border-2 border-amber-500/20 shadow-lg shadow-amber-500/10 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ภารกิจเสร็จสิ้น! บันทึกผลสำเร็จเรียบร้อย</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            ยินดีด้วย! คุณทำแบบทดสอบครบแล้ว
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            คุณได้พิสูจน์ความเข้าใจในการลดช่องว่างระหว่างฝั่ง Business และ Engineering
          </p>
        </div>

        {/* Score & XP Card */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium">คะแนนที่ได้</span>
            <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {score} <span className="text-lg text-zinc-400 font-normal">/ {questions.length}</span>
            </div>
            <span className="text-xs text-zinc-500 font-medium">{percentage}% ถูกต้อง</span>
          </div>
          <div className="space-y-1 border-l border-zinc-100 dark:border-zinc-800 pl-4">
            <span className="text-xs text-zinc-400 font-medium">XP ที่ได้รับ</span>
            <div className="text-3xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
              <Zap className="w-6 h-6 fill-amber-500" />
              <span>+{earnedXp}</span>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">สะสมเข้าโปรไฟล์แล้ว</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleRestart}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ทำแบบทดสอบอีกครั้ง</span>
          </button>

          <button
            onClick={() => onAskAIWithPrompt("ช่วยสรุปข้อคิดและทบทวนสิ่งที่ควรระวังจากแบบทดสอบเรื่อง Business vs Engineering")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-sm font-semibold hover:bg-indigo-100 transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>ถาม AI ทบทวนข้อที่ยังไม่แม่น</span>
          </button>
        </div>
      </div>
    );
  }

  const isAnswered = selectedOptionIndex !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Quiz Top Progress */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            คำถามข้อที่ {currentIndex + 1} จาก {questions.length}
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
            {currentQ.category}
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
          <Zap className="w-3.5 h-3.5 fill-amber-500" />
          <span>+{currentQ.xp} XP</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Scenario Card */}
      <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
            สถานการณ์จำลอง (Role: {currentQ.role})
          </span>
        </div>
        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 italic bg-zinc-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 leading-relaxed">
          "{currentQ.scenario}"
        </p>
        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 pt-1">
          {currentQ.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-3">
        {currentQ.options.map((option, idx) => {
          const isSelected = selectedOptionIndex === idx;
          let btnStyle = 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700';

          if (isAnswered) {
            if (option.isCorrect) {
              btnStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500';
            } else if (isSelected) {
              btnStyle = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500';
            } else {
              btnStyle = 'opacity-50 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900';
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start justify-between gap-3 cursor-pointer disabled:cursor-default ${btnStyle}`}
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-relaxed">{option.text}</span>
              </div>

              {isAnswered && (
                <div className="shrink-0 mt-0.5">
                  {option.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box after answer */}
      {isAnswered && (
        <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <HelpCircle className="w-4 h-4" />
            <span>คำอธิบายเฉลยและเหตุผล:</span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
            {currentQ.options[selectedOptionIndex].explanation}
          </p>
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <span>{currentIndex + 1 === questions.length ? 'ดูสรุปผลลัพธ์' : 'คำถามข้อถัดไป'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
