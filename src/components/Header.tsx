import React from 'react';
import { AudienceMode, TabType, UserStats } from '../types';
import { LEVEL_TIERS } from '../data/badgesData';
import { 
  BookOpen, 
  Bot, 
  Sparkles, 
  Trophy, 
  Briefcase, 
  Code2, 
  Users, 
  Languages, 
  Award,
  Zap
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  audienceMode: AudienceMode;
  setAudienceMode: (mode: AudienceMode) => void;
  userStats: UserStats;
  togglePlainMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  audienceMode,
  setAudienceMode,
  userStats,
  togglePlainMode,
}) => {
  const currentTier = LEVEL_TIERS.slice().reverse().find(t => userStats.xp >= t.minXp) || LEVEL_TIERS[0];
  const nextTierIndex = LEVEL_TIERS.findIndex(t => t.level === currentTier.level + 1);
  const nextTier = nextTierIndex !== -1 ? LEVEL_TIERS[nextTierIndex] : null;

  const xpProgress = nextTier 
    ? Math.min(100, Math.round(((userStats.xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100))
    : 100;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-xs transition-colors">
      {/* Top Banner / Brand & Gamification Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/20">
            <span className="text-base tracking-wider">B↔E</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-tight">
              จุดที่ Business กับ Engineering มาเจอกัน
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Interactive Guide, AI Bridge Assistant &amp; Gamified Learning
            </p>
          </div>
        </div>

        {/* Level & XP Capsule */}
        <div className="flex items-center gap-3 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl p-1.5 pr-3 border border-zinc-200/80 dark:border-zinc-700/80">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
            <Award className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-[120px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                Lv.{currentTier.level}
              </span>
              <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-0.5">
                <Zap className="w-3 h-3 fill-indigo-500" />
                {userStats.xp} XP
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs & Audience Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800/60">
        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none" aria-label="Main Navigation">
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คู่มือ 15 บท</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>ถาม AI เพิ่มเติม</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 font-semibold">
              Gemini
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Interactive Quiz</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
              +XP
            </span>
          </button>

          <button
            onClick={() => setActiveTab('gamification')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 cursor-pointer ${
              activeTab === 'gamification'
                ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-500" />
            <span>ความสำเร็จ &amp; Badge</span>
          </button>
        </nav>

        {/* Audience Mode & Plain Language Metaphor Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Plain Metaphor Toggle Button */}
          <button
            onClick={togglePlainMode}
            title="เปิด/ปิด คำอธิบายแบบภาษาบ้านๆ ทันที"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              userStats.plainModeEnabled
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
            }`}
          >
            <Languages className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">ภาษาบ้านๆ:</span>
            <span>{userStats.plainModeEnabled ? 'เปิดอยู่' : 'ปิด'}</span>
          </button>

          {/* Audience Switcher */}
          <div className="flex items-center p-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setAudienceMode('business')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                audienceMode === 'business'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Business</span>
            </button>
            <button
              onClick={() => setAudienceMode('engineer')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                audienceMode === 'engineer'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Engineer</span>
            </button>
            <button
              onClick={() => setAudienceMode('both')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                audienceMode === 'both'
                  ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>ทั้งคู่</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
