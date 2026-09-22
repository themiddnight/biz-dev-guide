import React, { useState, useEffect, useRef } from 'react';
import { ExperienceLevel, TabType, UserStats, Badge } from './types';
import { readStorage, writeStorage, removeStorage } from './lib/storage';
import { parseRole, parseLevelMode, parseChapterLevels } from './lib/rolePrefs';
import type { LevelInputs, LevelMode, Role } from './data/rolePerspective';
import { CHAPTERS } from './data/chaptersData';
import { formatChapterHash } from './lib/chapterRoute';
import { useChapterRoute } from './hooks/useChapterRoute';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { INITIAL_BADGES, LEVEL_TIERS } from './data/badgesData';
import { applyXpClaims, unclaimed, seedLegacyClaims, xpKey, AI_XP_QUESTION_CAP, XpClaim } from './lib/xp';
import { Header } from './components/Header';
import { GuideTab } from './components/GuideTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { QuizTab } from './components/QuizTab';
import { GamificationTab } from './components/GamificationTab';
import { Sparkles, Trophy, Zap, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('guide');
  const route = useChapterRoute(CHAPTERS, { onChapterRoute: () => setActiveTab('guide') });

  // Tabs are not routes: clear the hash off the guide, restore it on return (spec §5.2) —
  // but only when the URL had a chapter hash, so a plain visit stays a bare URL. A hash
  // already present (back/forward from another tab) is kept as is, section included.
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    const prev = prevTabRef.current;
    prevTabRef.current = activeTab;
    if (activeTab !== 'guide') {
      if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return;
    }
    if (prev !== 'guide' && route.hashInUrl && !window.location.hash) {
      const num = CHAPTERS.find(c => c.id === route.activeChapterId)?.num;
      if (num !== undefined) window.history.replaceState(null, '', formatChapterHash(num));
    }
  }, [activeTab, route.activeChapterId, route.hashInUrl]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(() => {
    const saved = readStorage('be_guide_exp_level') as ExperienceLevel | null;
    return saved || 'beginner';
  });
  const [levelChosen, setLevelChosen] = useState(() => readStorage('be_guide_exp_level') !== null);

  // First-visit choice or skip: set and persist the level, no XP (spec §4.1).
  const handleChooseInitialLevel = (level: ExperienceLevel) => {
    setExperienceLevel(level);
    writeStorage('be_guide_exp_level', level);
    setLevelChosen(true);
  };

  // Role perspective (spec P1.2). No role = today's behaviour (D2). None of these pay XP (D5).
  const [role, setRole] = useState<Role | null>(() => parseRole(readStorage('be_guide_role')));
  const [levelMode, setLevelMode] = useState<LevelMode>(() => parseLevelMode(readStorage('be_guide_level_mode')));
  const [chapterLevels, setChapterLevels] = useState<Record<string, ExperienceLevel>>(() =>
    parseChapterLevels(readStorage('be_guide_chapter_levels'), CHAPTERS.map(c => c.id))
  );
  const levelInputs: LevelInputs = { role, baseLevel: experienceLevel, levelMode, chapterLevels };

  const persistChapterLevels = (next: Record<string, ExperienceLevel>) => {
    setChapterLevels(next);
    writeStorage('be_guide_chapter_levels', JSON.stringify(next));
  };

  // Changing role clears per-chapter overrides but keeps levelMode (D4).
  const handleChooseRole = (next: Role | null) => {
    setRole(next);
    if (next === null) {
      removeStorage('be_guide_role');
      // An explicit "no role" is a choice too: without this the first-visit card would reappear.
      if (!levelChosen) handleChooseInitialLevel(experienceLevel);
    } else {
      writeStorage('be_guide_role', next);
    }
    persistChapterLevels({});
  };

  const handleLevelModeChange = (mode: LevelMode) => {
    setLevelMode(mode);
    writeStorage('be_guide_level_mode', mode);
  };

  const handleChapterLevelChange = (chapterId: string, level: ExperienceLevel | null) => {
    const next = { ...chapterLevels };
    if (level === null) delete next[chapterId];
    else next[chapterId] = level;
    persistChapterLevels(next);
  };

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
      xpClaims: [],
    };
    const saved = localStorage.getItem('be_guide_stats');
    if (!saved) return defaults;
    try {
      const { plainModeEnabled: _legacyPlain, ...rest } = JSON.parse(saved);
      const stats: UserStats = { ...defaults, ...rest };
      if (!Array.isArray(rest.xpClaims)) {
        stats.xpClaims = seedLegacyClaims(stats, readStorage('be_guide_exp_level'));
      }
      return stats;
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

  // Pay out XP only for claims this profile hasn't earned yet; returns the XP
  // actually awarded. Decided against the rendered state so the toast shows once,
  // and re-checked inside the updater so a stale closure can't double-pay.
  const claimXp = (claims: XpClaim[], reason: string, title?: string) => {
    const amount = unclaimed(userStats, claims).reduce((sum, c) => sum + c.amount, 0);
    if (amount === 0) return 0;
    setUserStats((prev) => applyXpClaims(prev, claims));
    showToast(title ?? `+${amount} XP!`, reason);
    return amount;
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
    claimXp([{ key: xpKey.badge(badgeId), amount: 50 }], `ปลดล็อกเหรียญ: ${badge.title}`);
  };

  // Experience level toggle handler
  const handleExperienceLevelChange = (level: ExperienceLevel) => {
    writeStorage('be_guide_exp_level', level);
    setLevelChosen(true);
    if (level === experienceLevel) return;
    setExperienceLevel(level);
    // First switch into each mode pays once; toggling back and forth pays nothing.
    if (level === 'experienced') {
      claimXp([{ key: xpKey.mode(level), amount: 15 }], 'เปิดโหมด Experienced: อ่านคู่มือรับมือ Friction');
    } else {
      claimXp([{ key: xpKey.mode(level), amount: 10 }], 'เปิดโหมด Beginner: เริ่มจาก Mindset พื้นฐาน');
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

    // Re-marking a chapter after unmarking it does not pay again.
    if (claimXp([{ key: xpKey.read(chapterId), amount: 30 }], 'อ่านบทนี้จบแล้ว', 'ทำเครื่องหมายว่าอ่านแล้ว +30 XP') === 0) {
      showToast('ทำเครื่องหมายว่าอ่านแล้ว', 'บทนี้เคยได้รับ XP ไปแล้ว');
    }
    unlockBadge('first_step');
    if (newRead.length >= CHAPTERS.length) {
      unlockBadge('deep_scholar');
    }
  };

  // Friction dilemma: GuideTab only reports XP for an optimal dilemma pick; once per chapter
  const handleDilemmaXp = (chapterId: string, amount: number, reason: string) => {
    claimXp([{ key: xpKey.dilemma(chapterId), amount }], reason);
    unlockBadge('conflict_mediator');
  };

  // Ask AI handler
  const handleAskAIWithPrompt = (prompt: string) => {
    setAiPromptPrefill(prompt);
    setActiveTab('ai');
  };

  const handleQuestionAsked = () => {
    const n = userStats.aiQuestionsAsked + 1;
    setUserStats((prev) => ({
      ...prev,
      aiQuestionsAsked: prev.aiQuestionsAsked + 1,
    }));
    if (n <= AI_XP_QUESTION_CAP) {
      claimXp([{ key: xpKey.ai(n), amount: 20 }], `ปรึกษา AI Bridge Assistant (${n}/${AI_XP_QUESTION_CAP})`);
    }
    unlockBadge('ai_consultant');
  };

  // Quiz completion
  // Each question pays its XP the first time it's answered correctly; retakes only
  // pay for newly-correct questions. Returns the XP actually awarded.
  const handleCompleteQuiz = (score: number, correctQuestionIds: number[]) => {
    const claims = QUIZ_QUESTIONS.filter((q) => correctQuestionIds.includes(q.id)).map((q) => ({
      key: xpKey.quiz(q.id),
      amount: q.xp,
    }));
    const awarded = claimXp(claims, `ทำแบบทดสอบเสร็จ: ตอบถูก ${score} ข้อ`);
    setUserStats((prev) => ({
      ...prev,
      quizzesCompleted: prev.quizzesCompleted + 1,
      correctAnswers: prev.correctAnswers + score,
    }));
    unlockBadge('quiz_starter');

    if (score >= QUIZ_QUESTIONS.length * 0.8) {
      unlockBadge('quiz_master');
    }
    return awarded;
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-neutral-900 dark:text-[#e5e5e5] font-sans antialiased transition-colors duration-200">
      {/* Toast Alert for XP / Badges */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-neutral-950 dark:bg-[#141414] text-white rounded-[4px] shadow-2xl border border-neutral-800 dark:border-[#262626] animate-slideUp">
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
        experienceLevel={experienceLevel}
        setExperienceLevel={handleExperienceLevelChange}
        role={role}
        onChooseRole={handleChooseRole}
        levelMode={levelMode}
        onLevelModeChange={handleLevelModeChange}
        userStats={userStats}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'guide' && (
          <GuideTab
            chapters={CHAPTERS}
            levelInputs={levelInputs}
            onExperienceLevelChange={handleExperienceLevelChange}
            onChooseRole={handleChooseRole}
            onLevelModeChange={handleLevelModeChange}
            onChapterLevelChange={handleChapterLevelChange}
            showFirstVisit={!levelChosen && role === null}
            onChooseInitialLevel={handleChooseInitialLevel}
            bookmarks={userStats.bookmarks}
            readChapters={userStats.readChapters}
            onToggleBookmark={handleToggleBookmark}
            onToggleReadChapter={handleToggleReadChapter}
            onAskAIWithPrompt={handleAskAIWithPrompt}
            onStartQuiz={() => setActiveTab('quiz')}
            onEarnXp={handleDilemmaXp}
            activeChapterId={route.activeChapterId}
            requestedSection={route.requestedSection}
            onNavigateChapter={route.navigate}
            onReplaceSection={route.replaceSection}
            onRequestedSectionApplied={route.clearRequestedSection}
            loadedFromHash={route.loadedFromHash}
            resumeCandidate={route.resumeCandidate}
            resumeDismissed={route.resumeDismissed}
            onDismissResume={route.dismissResume}
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
            ช่วยให้ Business กับ Engineering เข้าใจกันง่ายขึ้น พร้อมเครื่องมือ AI และระบบ Interactive Gamification
          </p>
        </div>
      </footer>
    </div>
  );
}
