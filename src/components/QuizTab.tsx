import React, { useMemo, useState } from 'react';
import { QuizQuestion } from '../types';
import type { Role } from '../data/rolePerspective';
import { QUIZ_ROUNDS, QUIZ_ROUND_META, QuizRound, defaultQuizRound, getQuizRound, initialQuizRound } from '../data/quizRounds';
import { readStorage, removeStorage, writeStorage } from '../lib/storage';
import { missedItems, type QuizAnswer } from '../lib/quizResult';
import { QuizResultScreen } from './quiz/QuizResultScreen';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  HelpCircle, 
  Award,
  Zap,
  Bot,
  BookOpen
} from 'lucide-react';

type AnswerQuiz = (questionId: number, correct: boolean) => number; // pays XP now; returns XP actually awarded
type CompleteQuiz = (score: number, roundSize: number) => void; // stats and badges only

interface QuizTabProps {
  questions: QuizQuestion[]; // the full bank; the tab picks the round
  role: Role | null;
  onAnswer: AnswerQuiz;
  onCompleteQuiz: CompleteQuiz;
  onAskAIWithPrompt: (prompt: string) => void;
  onOpenChapter: (chapterId: string) => void;
}

interface QuizRunProps {
  questions: QuizQuestion[]; // one round
  onAnswer: AnswerQuiz;
  onCompleteQuiz: CompleteQuiz;
  onRunStarted: (started: boolean) => void;
  onAskAIWithPrompt: (prompt: string) => void;
  onOpenChapter: (chapterId: string) => void;
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

const ROUND_KEY = 'be_guide_quiz_round';

// Round chips (spec P5.3). The run below is keyed by round, so switching rounds
// restarts index, score and shuffled options with no confirmation (D12).
export const QuizTab: React.FC<QuizTabProps> = ({
  questions,
  role,
  onAnswer,
  onCompleteQuiz,
  onAskAIWithPrompt,
  onOpenChapter,
}) => {
  const [round, setRound] = useState<QuizRound>(() => initialQuizRound(readStorage(ROUND_KEY), role));
  const [roundRole, setRoundRole] = useState(role);
  // True once a question in the current run has been answered.
  const [runStarted, setRunStarted] = useState(false);
  if (role !== roundRole) {
    // A role change elsewhere moves the reader to their new default round, but never
    // abandons a run they have already started answering.
    setRoundRole(role);
    // A role change is not a round choice: drop the stored one so the new role's
    // default is what the tab offers next time (round3 spec D13).
    removeStorage(ROUND_KEY);
    if (!runStarted) setRound(defaultQuizRound(role));
  }
  const chooseRound = (r: QuizRound) => {
    if (r === round) return;
    writeStorage(ROUND_KEY, r);
    setRound(r);
    setRunStarted(false);
  };
  const roundQuestions = useMemo(() => getQuizRound(questions, round), [questions, round]);

  return (
    <div className="space-y-5 sm:space-y-6">
      <div
        role="group"
        aria-label="เลือกชุดคำถาม"
        className="max-w-3xl mx-auto flex flex-wrap gap-2"
      >
        {QUIZ_ROUNDS.map((r) => {
          const selected = r === round;
          const count = getQuizRound(questions, r).length;
          return (
            <button
              key={r}
              type="button"
              aria-pressed={selected}
              data-quiz-round={r}
              onClick={() => chooseRound(r)}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                selected
                  ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-[#0a0a0a] dark:border-white'
                  : 'bg-white dark:bg-[#141414] text-neutral-700 dark:text-[#c4c4c4] border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-[#404040]'
              }`}
            >
              {QUIZ_ROUND_META[r].label}{r === role ? ' (สายคุณ)' : ''} · {count} ข้อ
            </button>
          );
        })}
      </div>

      <QuizRun
        key={round}
        questions={roundQuestions}
        onAnswer={onAnswer}
        onCompleteQuiz={onCompleteQuiz}
        onRunStarted={setRunStarted}
        onAskAIWithPrompt={onAskAIWithPrompt}
        onOpenChapter={onOpenChapter}
      />
    </div>
  );
};

const QuizRun: React.FC<QuizRunProps> = ({
  questions,
  onAnswer,
  onCompleteQuiz,
  onRunStarted,
  onAskAIWithPrompt,
  onOpenChapter,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [awardedXp, setAwardedXp] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState(() => shuffleOptions(questions));

  const currentQ = questions[currentIndex];
  const currentOptions = shuffledOptions[currentIndex] ?? currentQ.options;

  const handleSelectOption = (idx: number) => {
    if (selectedOptionIndex !== null) return; // Already answered
    setSelectedOptionIndex(idx);

    const isCorrect = currentOptions[idx].isCorrect;
    if (isCorrect) setScore((prev) => prev + 1);
    // chosenText, not the shuffled index: the shuffle is re-rolled on restart (spec P2.2).
    setAnswers((prev) => [...prev, { questionId: currentQ.id, correct: isCorrect, chosenText: currentOptions[idx].text }]);
    onRunStarted(true);
    // XP is paid on the answer, not at the end, so leaving mid-round keeps it.
    const awarded = onAnswer(currentQ.id, isCorrect);
    if (awarded > 0) setAwardedXp((prev) => prev + awarded);
  };

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionIndex(null);
    } else {
      setIsFinished(true);
      // score already includes the last answer (updated in handleSelectOption).
      onCompleteQuiz(score, questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOptionIndex(null);
    setScore(0);
    setAwardedXp(0);
    setAnswers([]);
    onRunStarted(false);
    setIsFinished(false);
    setShuffledOptions(shuffleOptions(questions));
  };

  if (isFinished) {
    return (
      <QuizResultScreen
        score={score}
        total={questions.length}
        awardedXp={awardedXp}
        missed={missedItems(questions, answers)}
        onRestart={handleRestart}
        onAskAI={() => onAskAIWithPrompt('ช่วยสรุปข้อคิดและทบทวนสิ่งที่ควรระวังจากแบบทดสอบเรื่อง Business vs Engineering')}
        onOpenChapter={onOpenChapter}
      />
    );
  }

  const isAnswered = selectedOptionIndex !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6 pb-16">
      {/* Quiz Top Progress */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold text-neutral-500 dark:text-[#8e8e8e] uppercase tracking-wider">
            คำถามข้อที่ {currentIndex + 1} จาก {questions.length}
          </span>
          <h2 className="text-base sm:text-xl font-bold text-neutral-900 dark:text-[#fafafa]">
            {currentQ.category}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/25">
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
                <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
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
            <span>เฉลย:</span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-700 dark:text-[#c4c4c4] leading-relaxed font-normal">
            {currentOptions[selectedOptionIndex].explanation}
          </p>
        </div>
      )}

      {/* Next Button (+ related chapter, spec P5.3) */}
      {isAnswered && (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
          {currentQ.chapterId && (
            <button
              type="button"
              data-quiz-chapter={currentQ.chapterId}
              onClick={() => onOpenChapter(currentQ.chapterId!)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl sm:rounded-2xl bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-900 dark:text-[#e5e5e5] border border-neutral-200 dark:border-[#262626] text-xs sm:text-sm font-semibold hover:bg-neutral-200/70 dark:hover:bg-[#222222] transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>อ่านบทที่เกี่ยวข้อง</span>
            </button>
          )}
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-[#0a0a0a] text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>{currentIndex + 1 === questions.length ? 'ดูผล' : 'คำถามข้อถัดไป'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
