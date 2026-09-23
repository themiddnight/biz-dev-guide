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
import { Tabs } from './ui/Tabs';
import { IconBadge } from './ui/IconBadge';

const ROLE_ITEMS = [
  { value: 'biz', label: `${ROLE_META.biz.icon} Business`, title: ROLE_META.biz.origin },
  { value: 'eng', label: `${ROLE_META.eng.icon} Engineering`, title: ROLE_META.eng.origin },
  { value: 'none', label: 'ไม่ระบุ' },
] as const;

const BEGINNER_TITLE = 'สำหรับมือใหม่: เน้นเข้าใจ Mindset, Mental Model และคำศัพท์พื้นฐาน';
const EXPERIENCED_TITLE = 'สำหรับคนทำงานจริง: เน้นคู่มือรับมือ Friction, ห้องเจรจา และสคริปต์คำพูดจริง';

const EXPERIENCE_ITEMS = [
  { value: 'beginner', label: 'Beginner', icon: <Sprout className="w-3.5 h-3.5" />, title: BEGINNER_TITLE },
  { value: 'experienced', label: 'Experienced', icon: <Handshake className="w-3.5 h-3.5" />, title: EXPERIENCED_TITLE },
] as const;

const LEVEL_MODE_ITEMS = [
  { value: 'auto', label: 'ตามสายงาน', title: 'บทฝั่งคุณเปิดแบบคุ้นงาน บทอื่นเปิดแบบมือใหม่' },
  ...EXPERIENCE_ITEMS,
] as const;

const THEME_ITEMS = [
  { value: 'light', label: null, icon: <Sun className="w-3.5 h-3.5" />, title: 'Light mode (สว่าง)' },
  { value: 'dark', label: null, icon: <Moon className="w-3.5 h-3.5" />, title: 'Dark mode (มืด)' },
  { value: 'system', label: null, icon: <Monitor className="w-3.5 h-3.5" />, title: 'System default (ตามระบบ)' },
] as const;

const navItems = (chapterCount: number) => [
  { value: 'guide', label: <span className="uppercase tracking-wider">Guide [{chapterCount}]</span>, icon: <BookOpen className="max-sm:hidden w-3.5 h-3.5" /> },
  { value: 'ai', label: <span className="uppercase tracking-wider">AI Bridge</span>, icon: <Bot className="max-sm:hidden w-3.5 h-3.5" /> },
  { value: 'quiz', label: <span className="uppercase tracking-wider">Quiz</span>, icon: <Sparkles className="max-sm:hidden w-3.5 h-3.5 text-warning" /> },
  { value: 'gamification', label: <span className="uppercase tracking-wider">Dashboard</span>, icon: <Trophy className="max-sm:hidden w-3.5 h-3.5" /> },
] as const;

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
      <Tabs<'biz' | 'eng' | 'none'>
        variant="segmented"
        aria-label="สายงานของคุณ"
        items={ROLE_ITEMS}
        value={role ?? 'none'}
        onChange={v => onChooseRole(v === 'none' ? null : v)}
      />
      {role === null ? (
        <Tabs<ExperienceLevel>
          variant="segmented"
          aria-label="Experience Level Switcher"
          items={EXPERIENCE_ITEMS}
          value={experienceLevel}
          onChange={setExperienceLevel}
        />
      ) : (
        <Tabs<LevelMode>
          variant="segmented"
          aria-label="Experience Level Switcher"
          items={LEVEL_MODE_ITEMS}
          value={levelMode}
          onChange={onLevelModeChange}
        />
      )}
    </>
  );
  return (
    <>
      <header className="sticky top-0 z-40 bg-base-100/90 backdrop-blur-md border-b border-base-border transition-colors">
        {/* Top Banner / Brand & Gamification Ribbon */}
        <div className="max-w-[1600px] mx-auto px-page py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-base-border-strong bg-base-300 text-base-content flex items-center justify-center font-bold text-sm tracking-tight rounded-selector shrink-0 shadow-2xs">
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
          <div className="flex items-center gap-stack">
            {/* Level & XP Capsule */}
            <div className="flex items-center gap-2.5 bg-base-300 rounded-selector px-2.5 py-1.5 border border-base-border">
              <IconBadge size="sm">Lv</IconBadge>
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
              <Tabs<'light' | 'dark' | 'system'>
                variant="segmented"
                size="xs"
                aria-label="Theme mode switcher"
                items={THEME_ITEMS}
                value={theme}
                onChange={setTheme}
              />
            )}
          </div>
        </div>

        {/* Control Bar: Tabs & Experience Level */}
        <div className="max-w-[1600px] mx-auto px-page py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-base-border">
          {/* Navigation Tabs (Variation 4 Mono Button Style) */}
          <nav aria-label="Main Navigation" className="min-w-0">
            <Tabs<TabType>
              variant="pills"
              scroll
              aria-label="แท็บหลัก"
              items={navItems(chapterCount)}
              value={activeTab}
              onChange={setActiveTab}
            />
          </nav>

          {/* Controls: Role + Experience Level (md and up; the mobile copy is below the header) */}
          <div className="hidden md:flex flex-wrap items-center gap-2 shrink-0">
            {controls}
          </div>
        </div>
      </header>

      {/* Mobile controls strip: scrolls away with the page instead of growing the sticky header. */}
      <div className="md:hidden border-b border-base-border bg-base-100">
        <div className="max-w-[1600px] mx-auto px-page py-2 flex flex-wrap items-center gap-2">
          {controls}
        </div>
      </div>
    </>
  );
};
