import React from 'react';
import { ExperienceLevel, TabType, UserStats } from '../types';
import { LEVEL_TIERS } from '../data/badgesData';
import { ROLE_META, type LevelMode, type Role } from '../data/rolePerspective';
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
import { TAP, TAP_Y } from './ui/tapTarget';

const ROLE_OPTIONS: { value: Role | null; label: string; title?: string }[] = [
  { value: 'biz', label: `${ROLE_META.biz.icon} Business`, title: ROLE_META.biz.origin },
  { value: 'eng', label: `${ROLE_META.eng.icon} Engineering`, title: ROLE_META.eng.origin },
  { value: null, label: 'ไม่ระบุ' },
];

// Segmented-control button, at least 32px tall (spec P1.4); 44px to the finger below sm.
const segmentClass = (active: boolean) =>
  `${TAP} flex items-center gap-1 px-2 py-1 min-h-8 rounded-[3px] text-xs transition-all cursor-pointer ${
    active
      ? 'bg-primary text-primary-content font-bold'
      : 'text-base-content-secondary hover:text-base-content font-medium'
  }`;

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  experienceLevel: ExperienceLevel;
  setExperienceLevel: (level: ExperienceLevel) => void;
  role: Role | null;
  onChooseRole: (role: Role | null) => void;
  levelMode: LevelMode;
  onLevelModeChange: (mode: LevelMode) => void;
  userStats: UserStats;
  /** Total chapters, shown on the Guide tab. */
  chapterCount: number;
  theme?: 'light' | 'dark' | 'system';
  setTheme?: (theme: 'light' | 'dark' | 'system') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  experienceLevel,
  setExperienceLevel,
  role,
  onChooseRole,
  levelMode,
  onLevelModeChange,
  userStats,
  chapterCount,
  theme = 'system',
  setTheme,
}) => {
  const currentTier = LEVEL_TIERS.slice().reverse().find(t => userStats.xp >= t.minXp) || LEVEL_TIERS[0];
  const nextTierIndex = LEVEL_TIERS.findIndex(t => t.level === currentTier.level + 1);
  const nextTier = nextTierIndex !== -1 ? LEVEL_TIERS[nextTierIndex] : null;

  const xpProgress = nextTier 
    ? Math.min(100, Math.round(((userStats.xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100))
    : 100;

  // Role + level controls. Rendered inside the sticky header from md up; below md they sit in a
  // non-sticky strip under it so the sticky header stays short on phones.
  const controls = (
    <>
      {/* Role Switcher */}
      <div
        className="flex items-center p-0.5 bg-base-300 rounded-[4px] border border-base-border"
        role="group"
        aria-label="สายงานของคุณ"
      >
        {ROLE_OPTIONS.map(({ value, label, title }) => (
          <button
            key={value ?? 'none'}
            type="button"
            data-header-role={value ?? 'none'}
            aria-pressed={role === value}
            onClick={() => onChooseRole(value)}
            title={title}
            className={segmentClass(role === value)}
          >
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Experience Level Switcher */}
      <div 
        className="flex items-center p-0.5 bg-base-300 rounded-[4px] border border-base-border"
        role="group"
        aria-label="Experience Level Switcher"
      >
        {role === null ? (
          <>
            <button
              type="button"
              aria-pressed={experienceLevel === 'beginner'}
              onClick={() => setExperienceLevel('beginner')}
              title="สำหรับมือใหม่: เน้นเข้าใจ Mindset, Mental Model และคำศัพท์พื้นฐาน"
              className={segmentClass(experienceLevel === 'beginner')}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Beginner</span>
            </button>
            <button
              type="button"
              aria-pressed={experienceLevel === 'experienced'}
              onClick={() => setExperienceLevel('experienced')}
              title="สำหรับคนทำงานจริง: เน้นคู่มือรับมือ Friction, ห้องเจรจา และสคริปต์คำพูดจริง"
              className={segmentClass(experienceLevel === 'experienced')}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Experienced</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              data-header-level-mode="auto"
              aria-pressed={levelMode === 'auto'}
              onClick={() => onLevelModeChange('auto')}
              title="บทฝั่งคุณเปิดแบบคุ้นงาน บทอื่นเปิดแบบมือใหม่"
              className={segmentClass(levelMode === 'auto')}
            >
              <span>ตามสายงาน</span>
            </button>
            <button
              type="button"
              data-header-level-mode="beginner"
              aria-pressed={levelMode === 'beginner'}
              onClick={() => onLevelModeChange('beginner')}
              title="สำหรับมือใหม่: เน้นเข้าใจ Mindset, Mental Model และคำศัพท์พื้นฐาน"
              className={segmentClass(levelMode === 'beginner')}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Beginner</span>
            </button>
            <button
              type="button"
              data-header-level-mode="experienced"
              aria-pressed={levelMode === 'experienced'}
              onClick={() => onLevelModeChange('experienced')}
              title="สำหรับคนทำงานจริง: เน้นคู่มือรับมือ Friction, ห้องเจรจา และสคริปต์คำพูดจริง"
              className={segmentClass(levelMode === 'experienced')}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Experienced</span>
            </button>
          </>
        )}
      </div>
    </>
  );
  return (
    <>
      <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-border transition-colors">
        {/* Top Banner / Brand & Gamification Ribbon */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-base-border-strong bg-base-300 text-base-content flex items-center justify-center font-bold text-sm tracking-tight rounded-[4px] shrink-0 shadow-2xs">
              B↔E
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold text-base-content tracking-tight leading-none">
                จุดที่ Business กับ Engineering มาเจอกัน
              </h1>
              <div className="label hidden sm:block mt-1 text-[10px] tracking-widest text-base-content-muted uppercase font-bold">
                Interactive Guide &amp; AI Assistant
              </div>
            </div>
          </div>

          {/* Level & XP Capsule + Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Level & XP Capsule */}
            <div className="flex items-center gap-2.5 bg-base-300 rounded-[4px] px-2.5 py-1.5 border border-base-border">
              <div className="w-6 h-6 rounded-[3px] bg-primary text-primary-content flex items-center justify-center text-xs font-bold shrink-0">
                Lv
              </div>
              <div className="flex flex-col min-w-[100px] sm:min-w-[120px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-base-content">
                    {currentTier.level}
                  </span>
                  <span className="font-semibold text-base-content-secondary flex items-center gap-0.5 text-[11px]">
                    <Zap className="w-3 h-3 text-warning fill-warning" />
                    {userStats.xp} XP
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-base-border h-1 rounded-full overflow-hidden mt-1">
                  <div 
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Theme Switcher Capsule */}
            {setTheme && (
              <div 
                className="flex items-center p-0.5 bg-base-300 rounded-[4px] border border-base-border" 
                role="group" 
                aria-label="Theme mode switcher"
              >
                <button
                  onClick={() => setTheme('light')}
                  title="Light mode (สว่าง)"
                  className={`${TAP_Y} p-1.5 rounded-[3px] transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-base-100 text-base-content shadow-2xs font-bold'
                      : 'text-base-content-muted hover:text-base-content'
                  }`}
                  aria-pressed={theme === 'light'}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  title="Dark mode (มืด)"
                  className={`${TAP_Y} p-1.5 rounded-[3px] transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-primary text-primary-content shadow-2xs font-bold'
                      : 'text-base-content-muted hover:text-base-content'
                  }`}
                  aria-pressed={theme === 'dark'}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setTheme('system')}
                  title="System default (ตามระบบ)"
                  className={`${TAP_Y} p-1.5 rounded-[3px] transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'bg-primary text-primary-content shadow-2xs font-bold'
                      : 'text-base-content-muted hover:text-base-content'
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
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-base-border">
          {/* Navigation Tabs (Variation 4 Mono Button Style) */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 max-sm:-mt-2.5 max-sm:pt-2.5 max-sm:-mb-2.5 max-sm:pb-3.5 scrollbar-none" aria-label="Main Navigation">
            <button
              onClick={() => setActiveTab('guide')}
              className={`${TAP} flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
                activeTab === 'guide'
                  ? 'bg-primary text-primary-content border-primary'
                  : 'border-base-border text-base-content-secondary hover:bg-base-300 hover:text-base-content'
              }`}
            >
              <BookOpen className="max-sm:hidden w-3.5 h-3.5" />
              <span>Guide [{chapterCount}]</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`${TAP} flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
                activeTab === 'ai'
                  ? 'bg-primary text-primary-content border-primary'
                  : 'border-base-border text-base-content-secondary hover:bg-base-300 hover:text-base-content'
              }`}
            >
              <Bot className="max-sm:hidden w-3.5 h-3.5" />
              <span>AI Bridge</span>
            </button>

            <button
              onClick={() => setActiveTab('quiz')}
              className={`${TAP} flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
                activeTab === 'quiz'
                  ? 'bg-primary text-primary-content border-primary'
                  : 'border-base-border text-base-content-secondary hover:bg-base-300 hover:text-base-content'
              }`}
            >
              <Sparkles className="max-sm:hidden w-3.5 h-3.5 text-warning" />
              <span>Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('gamification')}
              className={`${TAP} flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-[4px] text-xs font-semibold uppercase tracking-wider transition-all shrink-0 cursor-pointer border ${
                activeTab === 'gamification'
                  ? 'bg-primary text-primary-content border-primary'
                  : 'border-base-border text-base-content-secondary hover:bg-base-300 hover:text-base-content'
              }`}
            >
              <Trophy className="max-sm:hidden w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Controls: Role + Experience Level (md and up; the mobile copy is below the header) */}
          <div className="hidden md:flex flex-wrap items-center gap-2 shrink-0">
            {controls}
          </div>
        </div>
      </header>

      {/* Mobile controls strip: scrolls away with the page instead of growing the sticky header. */}
      <div className="md:hidden border-b border-base-border bg-base-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center gap-2">
          {controls}
        </div>
      </div>
    </>
  );
};
