import React, { useState, useEffect } from 'react';
import { AudienceMode, TabType, UserStats, Badge } from './types';
import { CHAPTERS } from './data/chaptersData';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { INITIAL_BADGES, LEVEL_TIERS } from './data/badgesData';
import { Header } from './components/Header';
import { GuideTab } from './components/GuideTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { QuizTab } from './components/QuizTab';
import { GamificationTab } from './components/GamificationTab';
import { Sparkles, Trophy, Zap, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('guide');
  const [audienceMode, setAudienceMode] = useState<AudienceMode>('both');
  const [plainModeEnabled, setPlainModeEnabled] = useState(false);
  const [aiPromptPrefill, setAiPromptPrefill] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('be_guide_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('be_guide_stats');
    return saved ? JSON.parse(saved) : {
      xp: 25,
      level: 1,
      levelTitle: 'Novice Observer (ผู้สังเกตการณ์มือใหม่)',
      quizzesCompleted: 0,
      correctAnswers: 0,
      aiQuestionsAsked: 0,
      readChapters: ['s1'],
      bookmarks: ['s1', 's11'],
      plainModeEnabled: false,
    };
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('be_guide_stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('be_guide_badges', JSON.stringify(badges));
  }, [badges]);

  // Recalculate level on XP change
  const addXp = (amount: number, reason: string) => {
    setUserStats((prev) => {
      const newXp = prev.xp + amount;
      const currentTier = LEVEL_TIERS.slice().reverse().find(t => newXp >= t.minXp) || LEVEL_TIERS[0];
      return {
        ...prev,
        xp: newXp,
        level: currentTier.level,
        levelTitle: currentTier.title,
      };
    });

    setToastMessage({
      title: `+${amount} XP!`,
      subtitle: reason,
    });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const unlockBadge = (badgeId: string) => {
    setBadges((prev) =>
      prev.map((b) => {
        if (b.id === badgeId && !b.unlocked) {
          addXp(50, `ปลดล็อกเหรียญตรา: ${b.title}`);
          return {
            ...b,
            unlocked: true,
            unlockedAt: new Date().toLocaleDateString('th-TH'),
          };
        }
        return b;
      })
    );
  };

  // Audience toggle handler
  const handleAudienceChange = (mode: AudienceMode) => {
    setAudienceMode(mode);
    if (mode !== 'both') {
      unlockBadge('view_switcher');
    }
  };

  // Plain mode toggle handler
  const handleTogglePlainMode = () => {
    setPlainModeEnabled((prev) => {
      const next = !prev;
      if (next) {
        unlockBadge('plain_talker');
        addXp(10, 'เปิดโหมดแปลภาษาบ้านๆ');
      }
      return next;
    });
  };

  // Bookmark toggle
  const handleToggleBookmark = (chapterId: string) => {
    setUserStats((prev) => {
      const isBookmarked = prev.bookmarks.includes(chapterId);
      const newBookmarks = isBookmarked
        ? prev.bookmarks.filter((id) => id !== chapterId)
        : [...prev.bookmarks, chapterId];

      if (!isBookmarked) {
        addXp(15, 'บันทึกบทลงในบุ๊กมาร์ก');
      }

      return {
        ...prev,
        bookmarks: newBookmarks,
      };
    });
  };

  // Toggle chapter read status
  const handleToggleReadChapter = (chapterId: string) => {
    setUserStats((prev) => {
      const isRead = prev.readChapters.includes(chapterId);
      const newRead = isRead
        ? prev.readChapters.filter((id) => id !== chapterId)
        : [...prev.readChapters, chapterId];

      if (!isRead) {
        addXp(30, 'อ่านและทำความเข้าใจบทนี้สำเร็จ');
        unlockBadge('fast_learner');
        if (newRead.length >= 15) {
          unlockBadge('grandmaster');
        }
      }

      return {
        ...prev,
        readChapters: newRead,
      };
    });
  };

  // Ask AI handler
  const handleAskAIWithPrompt = (prompt: string) => {
    setAiPromptPrefill(prompt);
    setActiveTab('ai');
  };

  const handleQuestionAsked = () => {
    setUserStats((prev) => ({
      ...prev,
      aiQuestionsAsked: prev.aiQuestionsAsked + 1,
    }));
    addXp(20, 'ปรึกษา AI Bridge Assistant');
    unlockBadge('ai_consultant');
  };

  // Quiz completion
  const handleCompleteQuiz = (score: number, totalEarnedXp: number) => {
    setUserStats((prev) => ({
      ...prev,
      quizzesCompleted: prev.quizzesCompleted + 1,
      correctAnswers: prev.correctAnswers + score,
    }));
    unlockBadge('quiz_starter');

    if (score >= QUIZ_QUESTIONS.length * 0.8) {
      unlockBadge('quiz_master');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans antialiased transition-colors">
      {/* Toast Alert for XP / Badges */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl shadow-xl border border-zinc-700 dark:border-zinc-300 animate-slideUp">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <div className="pr-2">
            <div className="font-bold text-xs sm:text-sm text-amber-400 dark:text-amber-600">
              {toastMessage.title}
            </div>
            <div className="text-[11px] text-zinc-300 dark:text-zinc-600">
              {toastMessage.subtitle}
            </div>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white dark:hover:text-zinc-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Header & Nav */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        audienceMode={audienceMode}
        setAudienceMode={handleAudienceChange}
        userStats={userStats}
        togglePlainMode={handleTogglePlainMode}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'guide' && (
          <GuideTab
            chapters={CHAPTERS}
            audienceMode={audienceMode}
            plainModeEnabled={plainModeEnabled}
            bookmarks={userStats.bookmarks}
            readChapters={userStats.readChapters}
            onToggleBookmark={handleToggleBookmark}
            onToggleReadChapter={handleToggleReadChapter}
            onAskAIWithPrompt={handleAskAIWithPrompt}
            onStartQuiz={() => setActiveTab('quiz')}
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistantTab
            initialPrompt={aiPromptPrefill}
            onQuestionAsked={handleQuestionAsked}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizTab
            questions={QUIZ_QUESTIONS}
            onCompleteQuiz={handleCompleteQuiz}
            onAskAIWithPrompt={handleAskAIWithPrompt}
          />
        )}

        {activeTab === 'gamification' && (
          <GamificationTab
            badges={badges}
            userStats={userStats}
            onStartQuiz={() => setActiveTab('quiz')}
            onGoToGuide={() => setActiveTab('guide')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 mt-16 py-8 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-zinc-700 dark:text-zinc-300">
            จุดที่ business กับ engineering มาเจอกัน — Interactive Knowledge &amp; Collaboration Platform
          </p>
          <p>
            ออกแบบเพื่อลดช่องว่างความเข้าใจผิดระหว่าง Business และ Engineering พร้อมเครื่องมือ AI และระบบ Interactive Gamification
          </p>
        </div>
      </footer>
    </div>
  );
}
