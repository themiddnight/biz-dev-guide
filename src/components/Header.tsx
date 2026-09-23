import React from 'react';
import { ExperienceLevel, TabType } from '../types';
import { ROLE_META, type LevelMode, type Role } from '../data/rolePerspective';
import {
  BookOpen,
  Bot,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Sprout,
  Handshake
} from 'lucide-react';
import { Tabs } from './ui/Tabs';

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
  chapterCount,
  theme = 'system',
  setTheme,
}) => {
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
        {/* Top Banner: Brand + Theme */}
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

          <div className="flex items-center gap-stack">
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
