import React, { useState, useEffect } from 'react';
import { AudienceMode, ExperienceLevel, TabType, UserStats, Badge } from './types';
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
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(() => {
    const saved = localStorage.getItem('be_guide_exp_level') as ExperienceLevel | null;
    return saved || 'beginner';
  });
  const [aiPromptPrefill, setAiPromptPrefill] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  // Theme state: light | dark | system (defaults to dark for Variation 4)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const saved = localStorage.getItem('be_guide_theme') as 'light' | 'dark' | 'system' | null;
    return saved || 'dark';
  });

  // Apply theme class to document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };

    applyTheme();
    localStorage.setItem('be_guide_theme', theme);

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('be_guide_badges');
    if (!saved) return INITIAL_BADGES;
    // Merge saved unlock state onto the current badge list so removed badges
    // (e.g. the old `plain_talker`) and stale fields are dropped.
    try {
      const savedBadges = JSON.parse(saved) as Partial<Badge>[];
      return INITIAL_BADGES.map((b) => {
        const s = savedBadges.find((sb) => sb.id === b.id);
        return s?.unlocked ? { ...b, unlocked: true, unlockedAt: s.unlockedAt } : b;
      });
    } catch {
      return INITIAL_BADGES;
    }
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const defaults: UserStats = {
      xp: 0,
      level: 1,
      levelTitle: LEVEL_TIERS[0].title,
      quizzesCompleted: 0,
      correctAnswers: 0,
      aiQuestionsAsked: 0,
      readChapters: [],
      bookmarks: [],
    };
    const saved = localStorage.getItem('be_guide_stats');
    if (!saved) return defaults;
    try {
      const { plainModeEnabled: _legacyPlain, ...rest } = JSON.parse(saved);
      return { ...defaults, ...rest };
    } catch {
      return defaults;
    }
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('be_guide_stats', JSON.stringify(userStats));
  }, [userStats]);

  useEffect(() => {
    localStorage.setItem('be_guide_badges', JSON.stringify(badges));
  }, [badges]);

  const showToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Recalculate level on XP change
  const addXp = (amount: number, reason: string, title = `+${amount} XP!`) => {
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

    showToast(title, reason);
  };

  // Decide the unlock outside the state updater so XP is awarded exactly once
  // (updaters run twice under StrictMode).
  const unlockBadge = (badgeId: string) => {
    const badge = badges.find((b) => b.id === badgeId);
    if (!badge || badge.unlocked) return;
    const unlockedAt = new Date().toLocaleDateString('th-TH');
    setBadges((prev) =>
      prev.map((b) => (b.id === badgeId && !b.unlocked ? { ...b, unlocked: true, unlockedAt } : b))
    );
    addXp(50, `ปลดล็อกเหรียญตรา: ${badge.title}`);
  };

  // Audience toggle handler
  const handleAudienceChange = (mode: AudienceMode) => {
    if (mode === audienceMode) return;
    setAudienceMode(mode);
    if (mode !== 'both') {
      unlockBadge('view_switcher');
    }
  };

  // Experience level toggle handler
  const handleExperienceLevelChange = (level: ExperienceLevel) => {
    if (level === experienceLevel) return;
    setExperienceLevel(level);
    localStorage.setItem('be_guide_exp_level', level);
    if (level === 'experienced') {
      addXp(15, 'เปิดโหมด Experienced: ศึกษาคัมภีร์รับมือ Friction');
    } else {
      addXp(10, 'เปิดโหมด Beginner: ปูพื้นฐาน Mindset');
    }
  };

  // Bookmark toggle (no XP: bookmarking is not a learning action)
  const handleToggleBookmark = (chapterId: string) => {
    const isBookmarked = userStats.bookmarks.includes(chapterId);
    setUserStats((prev) => ({
      ...prev,
      bookmarks: isBookmarked
        ? prev.bookmarks.filter((id) => id !== chapterId)
        : [...prev.bookmarks.filter((id) => id !== chapterId), chapterId],
    }));
    showToast(isBookmarked ? 'นำบุ๊กมาร์กออกแล้ว' : 'บุ๊กมาร์กแล้ว', 'ดูบทที่บุ๊กมาร์กไว้ได้ในคู่มือ');
  };

  // Toggle chapter read status
  const handleToggleReadChapter = (chapterId: string) => {
    const isRead = userStats.readChapters.includes(chapterId);
    const newRead = isRead
      ? userStats.readChapters.filter((id) => id !== chapterId)
      : [...userStats.readChapters, chapterId];

    setUserStats((prev) => ({
      ...prev,
      readChapters: isRead
        ? prev.readChapters.filter((id) => id !== chapterId)
        : [...prev.readChapters.filter((id) => id !== chapterId), chapterId],
    }));

    if (isRead) {
      showToast('ยกเลิกเครื่องหมายว่าอ่านแล้ว', 'บทนี้กลับเป็นยังไม่ได้อ่าน');
      return;
    }

    addXp(30, 'อ่านและทำความเข้าใจบทนี้สำเร็จ', 'ทำเครื่องหมายว่าอ่านแล้ว +30 XP');
    unlockBadge('first_step');
    if (newRead.length >= CHAPTERS.length) {
      unlockBadge('deep_scholar');
    }
  };

  // Friction dilemma: GuideTab only reports XP for an optimal dilemma pick
  const handleDilemmaXp = (amount: number, reason: string) => {
    addXp(amount, reason);
    unlockBadge('conflict_mediator');
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
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-neutral-900 dark:text-[#e5e5e5] font-sans antialiased transition-colors duration-200">
      {/* Toast Alert for XP / Badges */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-neutral-950 dark:bg-[#141414] text-white rounded-[4px] shadow-2xl border border-neutral-800 dark:border-[#262626] animate-slideUp font-mono">
          <div className="w-7 h-7 rounded-[3px] bg-white text-neutral-950 flex items-center justify-center font-bold shrink-0 text-xs">
            <Zap className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="pr-2">
            <div className="font-bold text-xs sm:text-sm text-white">
              {toastMessage.title}
            </div>
            <div className="text-[11px] text-neutral-400 font-normal">
              {toastMessage.subtitle}
            </div>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-neutral-500 hover:text-white cursor-pointer p-1"
            aria-label="Close notification"
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
        experienceLevel={experienceLevel}
        setExperienceLevel={handleExperienceLevelChange}
        userStats={userStats}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'guide' && (
          <GuideTab
            chapters={CHAPTERS}
            audienceMode={audienceMode}
            experienceLevel={experienceLevel}
            onExperienceLevelChange={handleExperienceLevelChange}
            onAudienceChange={handleAudienceChange}
            bookmarks={userStats.bookmarks}
            readChapters={userStats.readChapters}
            onToggleBookmark={handleToggleBookmark}
            onToggleReadChapter={handleToggleReadChapter}
            onAskAIWithPrompt={handleAskAIWithPrompt}
            onStartQuiz={() => setActiveTab('quiz')}
            onEarnXp={handleDilemmaXp}
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
      <footer className="border-t border-slate-200 dark:border-slate-800/80 mt-16 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            จุดที่ business กับ engineering มาเจอกัน — Interactive Knowledge &amp; Collaboration Platform
          </p>
          <p>คู่มือกลาง แชร์ต่อได้ — ปรับปรุงเพิ่มเองได้ตามงานที่เจอจริง</p>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            ออกแบบเพื่อลดช่องว่างความเข้าใจผิดระหว่าง Business และ Engineering พร้อมเครื่องมือ AI และระบบ Interactive Gamification
          </p>
        </div>
      </footer>
    </div>
  );
}
