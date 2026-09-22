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
  onCompleteQuiz: (score: number, correctQuestionIds: number[]) => number; // returns XP actually awarded
  onAskAIWithPrompt: (prompt: string) => void;
}

// Shuffle options once per attempt so the correct answer is not tied to a fixed position.
// Correctness always follows option.isCorrect, never the displayed index.
const shuffleOptions = (questions: QuizQuestion[]): QuizQuestion['options'][] =>
  questions.map((q) => {
    const opts = [...q.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  });

export const QuizTab: React.FC<QuizTabProps> = ({
  questions,
  onCompleteQuiz,
  onAskAIWithPrompt,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [correctIds, setCorrectIds] = useState<number[]>([]);
  const [awardedXp, setAwardedXp] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState(() => shuffleOptions(questions));

  const currentQ = questions[currentIndex];
  const currentOptions = shuffledOptions[currentIndex] ?? currentQ.options;

  const handleSelectOption = (idx: number) => {
    if (selectedOptionIndex !== null) return; // Already answered
    setSelectedOptionIndex(idx);

    const isCorrect = currentOptions[idx].isCorrect;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCorrectIds((prev) => [...prev, currentQ.id]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      setIsFinished(true);
      // score and correctIds already include the last answer (updated in handleSelectOption).
      setAwardedXp(onCompleteQuiz(score, correctIds));
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setCorrectIds([]);
    setAwardedXp(0);
    setIsFinished(false);
    setShuffledOptions(shuffleOptions(questions));
  };

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 text-amber-500 flex items-center justify-center border-2 border-amber-500/20 shadow-lg shadow-amber-500/10 animate-bounce">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ภารกิจเสร็จสิ้น! บันทึกผลสำเร็จเรียบร้อย</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50">
            ยินดีด้วย! คุณทำแบบทดสอบครบแล้ว
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            คุณได้พิสูจน์ความเข้าใจในการลดช่องว่างระหว่างฝั่ง Business และ Engineering
          </p>
        </div>

        {/* Score & XP Card */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto p-6 bg-white dark:bg-[#141414] rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-[#262626] shadow-2xs">
          <div className="space-y-1">
            <span className="text-xs text-neutral-500 dark:text-[#8e8e8e] font-medium">คะแนนที่ได้</span>
            <div className="text-3xl font-extrabold text-neutral-900 dark:text-[#fafafa]">
              {score} <span className="text-lg text-neutral-400 dark:text-[#666666] font-normal">/ {questions.length}</span>
            </div>
            <span className="text-xs text-neutral-600 dark:text-[#a3a3a3] font-medium">{percentage}% ถูกต้อง</span>
          </div>
          <div className="space-y-1 border-l border-neutral-200 dark:border-[#262626] pl-4">
            <span className="text-xs text-neutral-500 dark:text-[#8e8e8e] font-medium">XP ที่ได้รับ</span>
            <div className="text-3xl font-extrabold text-amber-500 dark:text-amber-400 flex items-center justify-center gap-1 font-mono">
              <Zap className="w-6 h-6 fill-amber-500 text-amber-500" />
              <span>+{awardedXp}</span>
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {awardedXp > 0 ? 'สะสมเข้าโปรไฟล์แล้ว' : 'ข้อที่ตอบถูกเคยได้รับ XP ไปแล้ว'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleRestart}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] text-xs sm:text-sm font-semibold hover:opacity-90 transition-all cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>ทำแบบทดสอบอีกครั้ง</span>
          </button>

          <button
            onClick={() => onAskAIWithPrompt("ช่วยสรุปข้อคิดและทบทวนสิ่งที่ควรระวังจากแบบทดสอบเรื่อง Business vs Engineering")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-900 dark:text-[#e5e5e5] border border-neutral-200 dark:border-[#262626] text-xs sm:text-sm font-semibold hover:bg-neutral-200/70 dark:hover:bg-[#222222] transition-all cursor-pointer"
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
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 pb-16">
      {/* Quiz Top Progress */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-neutral-500 dark:text-[#8e8e8e] uppercase tracking-wider font-mono">
            คำถามข้อที่ {currentIndex + 1} จาก {questions.length}
          </span>
          <h2 className="text-base sm:text-xl font-bold text-neutral-900 dark:text-[#fafafa]">
            {currentQ.category}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/25 font-mono">
          <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>+{currentQ.xp} XP</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-neutral-200 dark:bg-[#262626] h-1.5 sm:h-2 rounded-full overflow-hidden">
        <div 
          className="bg-neutral-900 dark:bg-white h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Scenario Card */}
      <div className="p-4 sm:p-6 bg-white dark:bg-[#141414] rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-[#262626] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-800 dark:text-[#d4d4d4] text-[11px] sm:text-xs font-semibold border border-neutral-200 dark:border-[#333333]">
            สถานการณ์จำลอง (Role: {currentQ.role})
          </span>
        </div>
        <p className="text-xs sm:text-sm text-neutral-700 dark:text-[#c4c4c4] italic bg-neutral-50 dark:bg-[#1a1a1a] p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-[#262626] leading-relaxed">
          &ldquo;{currentQ.scenario}&rdquo;
        </p>
        <h3 className="text-xs sm:text-base font-bold text-neutral-900 dark:text-[#fafafa] pt-1">
          {currentQ.question}
        </h3>
      </div>

      {/* Options List */}
      <div className="space-y-2.5 sm:space-y-3">
        {currentOptions.map((option, idx) => {
          const isSelected = selectedOptionIndex === idx;
          let btnStyle = 'border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-neutral-800 dark:text-[#e5e5e5] hover:border-neutral-400 dark:hover:border-[#404040]';

          if (isAnswered) {
            if (option.isCorrect) {
              btnStyle = 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500 font-semibold';
            } else if (isSelected) {
              btnStyle = 'border-rose-500 bg-rose-500/10 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-1 ring-rose-500 font-semibold';
            } else {
              btnStyle = 'border-neutral-200/80 dark:border-[#262626]/80 bg-neutral-50/70 dark:bg-[#141414]/60 text-neutral-400 dark:text-[#666666]';
            }
          }

          return (
            <button
              key={`${currentQ.id}-${option.text}`}
              onClick={() => handleSelectOption(idx)}
              disabled={isAnswered}
              className={`w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left text-xs sm:text-sm font-medium transition-all flex items-start justify-between gap-3 cursor-pointer disabled:cursor-default ${btnStyle}`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono ${
                  isAnswered && option.isCorrect
                    ? 'bg-emerald-600 text-white'
                    : isAnswered && isSelected
                    ? 'bg-rose-600 text-white'
                    : 'bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-[#a3a3a3]'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="leading-relaxed">{option.text}</span>
              </div>

              {isAnswered && (
                <div className="shrink-0 mt-0.5">
                  {option.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : isSelected ? (
                    <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  ) : null}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box after answer */}
      {isAnswered && (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#262626] space-y-1.5 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-[#e5e5e5]">
            <HelpCircle className="w-4 h-4 text-indigo-500" />
            <span>คำอธิบายเฉลยและเหตุผล:</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-[#c4c4c4] leading-relaxed font-normal">
            {currentOptions[selectedOptionIndex].explanation}
          </p>
        </div>
      )}

      {/* Next Button */}
      {isAnswered && (
        <div className="flex justify-end pt-2">
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-[#0a0a0a] text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>{currentIndex + 1 === questions.length ? 'ดูสรุปผลลัพธ์' : 'คำถามข้อถัดไป'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
