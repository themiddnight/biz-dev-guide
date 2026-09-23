import React, { useState, useEffect, useRef } from 'react';
import { ExperienceLevel, TabType, UserStats } from './types';
import { readStorage, writeStorage, removeStorage } from './lib/storage';
import { USER_STATS_KEY, parseUserStats } from './lib/userStats';
import { parseRole, parseLevelMode, planRoleChoice, loadChapterLevelsByRole, chapterLevelsFor, withChapterLevel } from './lib/rolePrefs';
import type { LevelInputs, LevelMode, Role } from './data/rolePerspective';
import { CHAPTERS } from './data/chaptersData';
import { formatChapterHash } from './lib/chapterRoute';
import { useChapterRoute } from './hooks/useChapterRoute';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { Header } from './components/Header';
import { GuideTab } from './components/GuideTab';
import { AIAssistantTab } from './components/AIAssistantTab';
import { QuizTab } from './components/QuizTab';
import { Check, X } from 'lucide-react';

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

  // First-visit choice or skip: set and persist the level (spec §4.1).
  const handleChooseInitialLevel = (level: ExperienceLevel) => {
    setExperienceLevel(level);
    writeStorage('be_guide_exp_level', level);
    setLevelChosen(true);
  };

  // Role perspective (spec P1.2). No role = today's behaviour (D2).
  const [role, setRole] = useState<Role | null>(() => parseRole(readStorage('be_guide_role')));
  const [levelMode, setLevelMode] = useState<LevelMode>(() => parseLevelMode(readStorage('be_guide_level_mode')));
  // Per-chapter overrides are stored per role and swap with it (role UX fixes Phase 3, supersedes D4).
  // The legacy flat key is migrated once and removed.
  const [levelsInit] = useState(() => loadChapterLevelsByRole(
    readStorage('be_guide_chapter_levels_by_role'), readStorage('be_guide_chapter_levels'),
    parseRole(readStorage('be_guide_role')), CHAPTERS.map(c => c.id),
  ));
  const [chapterLevelsByRole, setChapterLevelsByRole] = useState(levelsInit.byRole);
  useEffect(() => {
    if (!levelsInit.migrated) return;
    const json = JSON.stringify(levelsInit.byRole);
    writeStorage('be_guide_chapter_levels_by_role', json);
    // Drop the legacy key only once the new one is really stored (a full quota fails silently).
    if (readStorage('be_guide_chapter_levels_by_role') === json) removeStorage('be_guide_chapter_levels');
  }, [levelsInit]);
  const chapterLevels = chapterLevelsFor(chapterLevelsByRole, role);
  const levelInputs: LevelInputs = { role, baseLevel: experienceLevel, levelMode, chapterLevels };

  // Changing role keeps levelMode; the new role's override set applies through chapterLevelsFor.
  const handleChooseRole = (next: Role | null) => {
    const plan = planRoleChoice(role, next, levelChosen);
    // An explicit "no role" is a choice too: without this the first-visit card would reappear.
    if (plan.dismissFirstVisit) handleChooseInitialLevel(experienceLevel);
    if (!plan.changeRole) return;
    setRole(next);
    if (next === null) removeStorage('be_guide_role');
    else writeStorage('be_guide_role', next);
  };

  const handleLevelModeChange = (mode: LevelMode) => {
    setLevelMode(mode);
    writeStorage('be_guide_level_mode', mode);
  };

  const handleChapterLevelChange = (chapterId: string, level: ExperienceLevel | null) => {
    if (role === null) return; // the per-chapter switch is not rendered without a role
    const next = withChapterLevel(chapterLevelsByRole, role, chapterId, level);
    setChapterLevelsByRole(next);
    writeStorage('be_guide_chapter_levels_by_role', JSON.stringify(next));
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

  const [userStats, setUserStats] = useState<UserStats>(() => parseUserStats(readStorage(USER_STATS_KEY)));

  // Profiles from the gamified version also stored unlocked badges; nothing reads them now.
  useEffect(() => {
    removeStorage('be_guide_badges');
  }, []);

  useEffect(() => {
    writeStorage(USER_STATS_KEY, JSON.stringify(userStats));
  }, [userStats]);

  const showToast = (title: string, subtitle: string) => {
    setToastMessage({ title, subtitle });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Experience level toggle handler
  const handleExperienceLevelChange = (level: ExperienceLevel) => {
    writeStorage('be_guide_exp_level', level);
    setLevelChosen(true);
    if (level === experienceLevel) return;
    setExperienceLevel(level);
  };

  // Bookmark toggle
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
    setUserStats((prev) => ({
      ...prev,
      readChapters: isRead
        ? prev.readChapters.filter((id) => id !== chapterId)
        : [...prev.readChapters.filter((id) => id !== chapterId), chapterId],
    }));
    showToast(
      isRead ? 'ยกเลิกเครื่องหมายว่าอ่านแล้ว' : 'ทำเครื่องหมายว่าอ่านแล้ว',
      isRead ? 'บทนี้กลับเป็นยังไม่ได้อ่าน' : 'ดูบทที่อ่านแล้วได้ในรายการบท',
    );
  };

  // Ask AI handler
  const handleAskAIWithPrompt = (prompt: string) => {
    setAiPromptPrefill(prompt);
    setActiveTab('ai');
  };

  // Quiz "อ่านบทที่เกี่ยวข้อง": leave the quiz for the mapped chapter in the guide.
  const handleOpenChapterFromQuiz = (chapterId: string) => {
    setActiveTab('guide');
    route.navigate(chapterId);
  };

  return (
    <div className="min-h-screen bg-base-200 font-sans antialiased transition-colors duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-neutral text-neutral-content rounded-selector shadow-2xl border border-neutral animate-slideUp">
          <div className="w-7 h-7 rounded-selector bg-neutral-content text-neutral flex items-center justify-center font-bold shrink-0 text-xs">
            <Check className="w-3.5 h-3.5" />
          </div>
          <div className="pr-2">
            <div className="font-bold text-xs sm:text-sm text-neutral-content">
              {toastMessage.title}
            </div>
            <div className="text-[11px] text-neutral-content/70 font-normal">
              {toastMessage.subtitle}
            </div>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-content/60 hover:text-neutral-content cursor-pointer p-1"
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
        chapterCount={CHAPTERS.length}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-page pt-6 sm:pt-8">
        {activeTab === 'guide' && (
          <GuideTab
            chapters={CHAPTERS}
            levelInputs={levelInputs}
            onExperienceLevelChange={handleExperienceLevelChange}
            onChooseRole={handleChooseRole}
            onChapterLevelChange={handleChapterLevelChange}
            showFirstVisit={!levelChosen && role === null}
            onChooseInitialLevel={handleChooseInitialLevel}
            onLevelModeChange={handleLevelModeChange}
            bookmarks={userStats.bookmarks}
            readChapters={userStats.readChapters}
            onToggleBookmark={handleToggleBookmark}
            onToggleReadChapter={handleToggleReadChapter}
            onAskAIWithPrompt={handleAskAIWithPrompt}
            onStartQuiz={() => setActiveTab('quiz')}
            activeChapterId={route.activeChapterId}
            requestedSection={route.requestedSection}
            onNavigateChapter={route.navigate}
            onReplaceSection={route.replaceSection}
            onRequestedSectionApplied={route.clearRequestedSection}
            loadedFromHash={route.loadedFromHash}
            initialSource={route.initialSource}
            hasNavigated={route.hasNavigated}
          />
        )}

        {activeTab === 'ai' && (
          <AIAssistantTab
            initialPrompt={aiPromptPrefill}
          />
        )}

        {activeTab === 'quiz' && (
          <QuizTab
            questions={QUIZ_QUESTIONS}
            role={role}
            onAskAIWithPrompt={handleAskAIWithPrompt}
            onOpenChapter={handleOpenChapterFromQuiz}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-base-border mt-16 py-8 text-center text-xs text-base-content-muted">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-base-content-body">
            จุดที่ business กับ engineering มาเจอกัน — Interactive Knowledge &amp; Collaboration Platform
          </p>
          <p>คู่มือกลาง แชร์ต่อได้ — ปรับปรุงเพิ่มเองได้ตามงานที่เจอจริง</p>
          <p className="text-base-content-secondary max-w-2xl mx-auto">
            ช่วยให้ Business กับ Engineering เข้าใจกันง่ายขึ้น พร้อมผู้ช่วย AI และแบบทดสอบทบทวนความรู้
          </p>
        </div>
      </footer>
    </div>
  );
}
