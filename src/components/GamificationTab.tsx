import React from 'react';
import { Badge, UserStats } from '../types';
import { LEVEL_TIERS } from '../data/badgesData';
import { 
  Trophy, 
  Award, 
  Zap, 
  BookOpen, 
  Bot, 
  CheckCircle2, 
  Lock, 
  Sparkles,
  Compass,
  Repeat,
  MessageSquareText,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

interface GamificationTabProps {
  badges: Badge[];
  userStats: UserStats;
  /** Total chapters, the denominator of the read counter. */
  chapterCount: number;
  onStartQuiz: () => void;
  onGoToGuide: () => void;
}

export const GamificationTab: React.FC<GamificationTabProps> = ({
  badges,
  userStats,
  chapterCount,
  onStartQuiz,
  onGoToGuide,
}) => {
  const currentTier = LEVEL_TIERS.slice().reverse().find(t => userStats.xp >= t.minXp) || LEVEL_TIERS[0];
  const nextTierIndex = LEVEL_TIERS.findIndex(t => t.level === currentTier.level + 1);
  const nextTier = nextTierIndex !== -1 ? LEVEL_TIERS[nextTierIndex] : null;

  const xpProgress = nextTier 
    ? Math.min(100, Math.round(((userStats.xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100))
    : 100;

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass': return <Compass className="w-5 h-5" />;
      case 'Repeat': return <Repeat className="w-5 h-5" />;
      case 'MessageSquareText': return <MessageSquareText className="w-5 h-5" />;
      case 'Award': return <Award className="w-5 h-5" />;
      case 'Trophy': return <Trophy className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'GraduationCap': return <GraduationCap className="w-5 h-5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-16">
      {/* Profile & Level Card */}
      <div className="p-5 sm:p-6 bg-white dark:bg-[#141414] rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-[#262626] shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-xs">
              Lv.{currentTier.level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-[#fafafa]">
                  {currentTier.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#8e8e8e] mt-0.5">
                ระดับของคุณในการทำงานข้าม Business ↔ Engineering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base border border-amber-500/25">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-500 text-amber-500" />
            <span>{userStats.xp} Total XP</span>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-[#8e8e8e]">
            <span>อีกเท่าไรถึงระดับถัดไป</span>
            {nextTier ? (
              <span>{userStats.xp} / {nextTier.minXp} XP (ขาดอีก {nextTier.minXp - userStats.xp} XP)</span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400 font-bold">ระดับสูงสุดแล้ว!</span>
            )}
          </div>
          <div className="w-full bg-neutral-100 dark:bg-[#262626] h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 border border-neutral-200 dark:border-[#333333]">
            <div 
              className="bg-neutral-900 dark:bg-white h-full rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#141414] rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-[#8e8e8e] text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5 text-neutral-700 dark:text-[#a3a3a3]" />
            <span>อ่านแล้ว</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-[#fafafa]">
            {userStats.readChapters.length}/{chapterCount}
          </div>
          <span className="text-[11px] text-neutral-400 dark:text-[#666666]">บุ๊กมาร์ก {userStats.bookmarks.length}</span>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#141414] rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-[#8e8e8e] text-xs font-medium">
            <Bot className="w-3.5 h-3.5 text-neutral-700 dark:text-[#a3a3a3]" />
            <span>คำถามที่ถาม AI</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-[#fafafa]">
            {userStats.aiQuestionsAsked}
          </div>
          <span className="text-[11px] text-neutral-400 dark:text-[#666666]">ครั้งที่ปรึกษา</span>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#141414] rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-[#8e8e8e] text-xs font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>ควิซที่ตอบถูก</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-[#fafafa]">
            {userStats.correctAnswers}
          </div>
          <span className="text-[11px] text-neutral-400 dark:text-[#666666]">ข้อที่ตอบถูก</span>
        </div>

        <div className="p-3.5 sm:p-4 bg-white dark:bg-[#141414] rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-[#8e8e8e] text-xs font-medium">
            <Award className="w-3.5 h-3.5 text-emerald-500" />
            <span>เหรียญความสำเร็จ</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-[#fafafa]">
            {unlockedCount} / {badges.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{Math.round((unlockedCount / badges.length) * 100)}% สำเร็จ</span>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-[#fafafa]">
            เหรียญที่สะสมได้ (Badges &amp; Achievements)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-[#8e8e8e]">
            ปลดล็อกได้จากการอ่านคู่มือ ถาม AI และทำควิซ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((badge) => {
            return (
              <div
                key={badge.id}
                className={`p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex items-start gap-3 ${
                  badge.unlocked
                    ? 'bg-white dark:bg-[#141414] border-neutral-300 dark:border-[#333333] shadow-xs'
                    : 'bg-neutral-50/70 dark:bg-[#141414]/60 border-neutral-200/80 dark:border-[#262626]'
                }`}
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    badge.unlocked
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] shadow-xs'
                      : 'bg-neutral-200 dark:bg-[#262626] text-neutral-400 dark:text-[#666666]'
                  }`}
                >
                  {badge.unlocked ? getIcon(badge.icon) : <Lock className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${
                      badge.unlocked ? 'text-neutral-900 dark:text-[#fafafa]' : 'text-neutral-600 dark:text-[#737373]'
                    }`}>
                      {badge.title}
                    </h4>
                    {badge.unlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] leading-snug">
                    {badge.description}
                  </p>
                  {badge.unlockedAt && (
                    <span className="inline-block text-[10px] text-neutral-700 dark:text-[#a3a3a3] font-medium pt-0.5">
                      ปลดล็อกแล้ว ({badge.unlockedAt})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action CTA */}
      <div className="p-5 sm:p-6 bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold">ต้องการเพิ่ม XP และปลดล็อกเหรียญที่เหลือ?</h3>
          <p className="text-xs sm:text-sm text-neutral-300 dark:text-neutral-600">
            ลองทำแบบทดสอบจำลองสถานการณ์ หรือถามคำถามใหม่กับ AI เพื่อสะสม XP
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onStartQuiz}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-white text-xs sm:text-sm font-bold shadow-xs hover:opacity-90 transition-all cursor-pointer"
          >
            ไปทำควิซ (+XP)
          </button>
          <button
            onClick={onGoToGuide}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-neutral-700 dark:border-neutral-300 text-neutral-200 dark:text-neutral-800 text-xs sm:text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all cursor-pointer"
          >
            อ่านคู่มือต่อ
          </button>
        </div>
      </div>
    </div>
  );
};
