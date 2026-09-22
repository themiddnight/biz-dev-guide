import React from 'react';
import { ExperienceLevel, TabType, UserStats } from '../types';
import { LEVEL_TIERS } from '../data/badgesData';
import {
  BookOpen,
  Bot,
  Sparkles,
  Trophy,
  Award,
  Zap,
  Sun,
  Moon,
  Monitor,
  Sprout,
  Handshake
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (level: ExperienceLevel) => void;
  userStats: UserStats;
  theme?: 'light' | 'dark' | 'system';
  setTheme?: (theme: 'light' | 'dark' | 'system') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  experienceLevel,
  setExperienceLevel,
  userStats,
  theme = 'system',
  setTheme,
}) => {
  const currentTier = LEVEL_TIERS.slice().reverse().find(t => userStats.xp >= t.minXp) || LEVEL_TIERS[0];
  const nextTierIndex = LEVEL_TIERS.findIndex(t => t.level === currentTier.level + 1);
  const nextTier = nextTierIndex !== -1 ? LEVEL_TIERS[nextTierIndex] : null;

  const xpProgress = nextTier 
    ? Math.min(100, Math.round(((userStats.xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100))
    : 100;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md border-b border-neutral-200 dark:border-[#262626] transition-colors">
      {/* Top Banner / Brand & Gamification Ribbon */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border border-neutral-300 dark:border-[#262626] bg-neutral-100 dark:bg-[#141414] text-neutral-950 dark:text-white flex items-center justify-center font-bold text-sm tracking-tight rounded-[4px] shrink-0 shadow-2xs">
            B↔E
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-[#e5e5e5] tracking-tight leading-none">
              จุดที่ Business กับ Engineering มาเจอกัน
            </h1>
            <div className="label mt-1 text-[10px] tracking-widest text-neutral-500 dark:text-[#737373] uppercase font-bold">
              Interactive Guide &amp; AI Assistant
            </div>
          </div>
        </div>

        {/* Level & XP Capsule + Theme Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Level & XP Capsule */}
          <div className="flex items-center gap-2.5 bg-neutral-100 dark:bg-[#141414] rounded-[4px] px-2.5 py-1.5 border border-neutral-200 dark:border-[#262626]">
            <div className="w-6 h-6 rounded-[3px] bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 flex items-center justify-center text-xs font-bold shrink-0">
              Lv
            </div>
            <div className="flex flex-col min-w-[100px] sm:min-w-[120px]">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-neutral-800 dark:text-neutral-200">
                  {currentTier.level}
                </span>
                <span className="font-semibold text-neutral-600 dark:text-neutral-400 flex items-center gap-0.5 text-[11px]">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {userStats.xp} XP
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-neutral-200 dark:bg-[#262626] h-1 rounded-full overflow-hidden mt-1">
                <div 
                  className="bg-neutral-900 dark:bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Theme Switcher Capsule */}
          {setTheme && (
            <div 
              className="flex items-center p-0.5 bg-neutral-100 dark:bg-[#141414] rounded-[4px] border border-neutral-200 dark:border-[#262626]" 
              role="group" 
              aria-label="Theme mode switcher"
            >
              <button
                onClick={() => setTheme('light')}
                title="Light mode (สว่าง)"
                className={`p-1.5 rounded-[3px] transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 shadow-2xs font-bold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                aria-pressed={theme === 'light'}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                title="Dark mode (มืด)"
                className={`p-1.5 rounded-[3px] transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-neutral-900 dark:bg-[#262626] text-white shadow-2xs font-bold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                aria-pressed={theme === 'dark'}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setTheme('system')}
                title="System default (ตามระบบ)"
                className={`p-1.5 rounded-[3px] transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'bg-neutral-900 dark:bg-[#262626] text-white shadow-2xs font-bold'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
                aria-pressed={theme === 'system'}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar: Tabs & Experience Level */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-neutral-200 dark:border-[#262626]">
        {/* Navigation Tabs (Variation 4 Mono Button Style) */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none" aria-label="Main Navigation">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
              activeTab === 'guide'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                : 'border-neutral-200 dark:border-[#262626] text-neutral-600 dark:text-[#a3a3a3] hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guide [15]</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
              activeTab === 'ai'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                : 'border-neutral-200 dark:border-[#262626] text-neutral-600 dark:text-[#a3a3a3] hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Bridge</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
              activeTab === 'quiz'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                : 'border-neutral-200 dark:border-[#262626] text-neutral-600 dark:text-[#a3a3a3] hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quiz</span>
          </button>

          <button
            onClick={() => setActiveTab('gamification')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
              activeTab === 'gamification'
                ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 border-neutral-950 dark:border-white'
                : 'border-neutral-200 dark:border-[#262626] text-neutral-600 dark:text-[#a3a3a3] hover:bg-neutral-100 dark:hover:bg-[#1a1a1a] hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
        </nav>

        {/* Controls: Experience Level */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Experience Level Switcher (Beginner vs Experienced) */}
          <div 
            className="flex items-center p-0.5 bg-neutral-100 dark:bg-[#141414] rounded-[4px] border border-neutral-200 dark:border-[#262626]"
            role="group"
            aria-label="Experience Level Switcher"
          >
            <button
              onClick={() => setExperienceLevel('beginner')}
              title="สำหรับมือใหม่: เน้นเข้าใจ Mindset, Mental Model และคำศัพท์พื้นฐาน"
              className={`flex items-center gap-1 px-2 py-1 rounded-[3px] text-xs transition-all cursor-pointer ${
                experienceLevel === 'beginner'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold'
                  : 'text-neutral-600 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-white font-medium'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Beginner</span>
            </button>
            <button
              onClick={() => setExperienceLevel('experienced')}
              title="สำหรับคนทำงานจริง: เน้นคู่มือรับมือ Friction, ห้องเจรจา และสคริปต์คำพูดจริง"
              className={`flex items-center gap-1 px-2 py-1 rounded-[3px] text-xs transition-all cursor-pointer ${
                experienceLevel === 'experienced'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold'
                  : 'text-neutral-600 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-white font-medium'
              }`}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Experienced</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
