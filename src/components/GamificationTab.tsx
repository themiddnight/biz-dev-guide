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
  onStartQuiz: () => void;
  onGoToGuide: () => void;
}

export const GamificationTab: React.FC<GamificationTabProps> = ({
  badges,
  userStats,
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
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Profile & Level Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-indigo-600/20">
              Lv.{currentTier.level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {currentTier.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                ระดับความเชี่ยวชาญในการเชื่อมโยง Business ↔ Engineering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl font-mono font-bold text-base">
            <Zap className="w-5 h-5 fill-amber-500" />
            <span>{userStats.xp} Total XP</span>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>ความคืบหน้าสู่ระดับถัดไป</span>
            {nextTier ? (
              <span>{userStats.xp} / {nextTier.minXp} XP (ขาดอีก {nextTier.minXp - userStats.xp} XP)</span>
            ) : (
              <span className="text-amber-500 font-bold">ระดับสูงสุดแล้ว!</span>
            )}
          </div>
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-3 rounded-full overflow-hidden p-0.5 border border-zinc-200/80 dark:border-zinc-700">
            <div 
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>บทที่บันทึก/อ่าน</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {userStats.bookmarks.length}
          </div>
          <span className="text-[11px] text-zinc-400">จากทั้งหมด 15 บท</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <Bot className="w-4 h-4 text-purple-500" />
            <span>คำถามที่ถาม AI</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {userStats.aiQuestionsAsked}
          </div>
          <span className="text-[11px] text-zinc-400">ครั้งที่ปรึกษา</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>ควิซที่ตอบถูก</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {userStats.correctAnswers}
          </div>
          <span className="text-[11px] text-zinc-400">ข้อที่ตอบถูก</span>
        </div>

        <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <Award className="w-4 h-4 text-emerald-500" />
            <span>เหรียญความสำเร็จ</span>
          </div>
          <div className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            {unlockedCount} / {badges.length}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium">{Math.round((unlockedCount / badges.length) * 100)}% สำเร็จ</span>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              เหรียญรางวัลและความสำเร็จ (Badges &amp; Achievements)
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ปลดล็อกเมื่อคุณมีปฏิสัมพันธ์กับคู่มือ ถาม AI และทำควิซ
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {badges.map((badge) => {
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  badge.unlocked
                    ? 'bg-white dark:bg-zinc-900 border-indigo-200 dark:border-indigo-900/60 shadow-xs'
                    : 'bg-zinc-50/60 dark:bg-zinc-900/40 border-zinc-200/80 dark:border-zinc-800/80 opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    badge.unlocked
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {badge.unlocked ? getIcon(badge.icon) : <Lock className="w-5 h-5" />}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {badge.title}
                    </h4>
                    {badge.unlocked && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                    {badge.description}
                  </p>
                  {badge.unlockedAt && (
                    <span className="inline-block text-[10px] text-indigo-500 dark:text-indigo-400 font-medium pt-0.5">
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
      <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-600/10">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold">ต้องการเพิ่ม XP และปลดล็อกเหรียญที่เหลือ?</h3>
          <p className="text-xs sm:text-sm text-indigo-100">
            ลองทำแบบทดสอบจำลองสถานการณ์ หรือถามคำถามใหม่กับ AI เพื่อสะสม XP
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onStartQuiz}
            className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-xs sm:text-sm font-bold shadow-sm hover:bg-indigo-50 transition-all cursor-pointer"
          >
            ไปทำควิซ (+XP)
          </button>
          <button
            onClick={onGoToGuide}
            className="px-4 py-2.5 rounded-xl bg-indigo-700/60 text-white border border-indigo-400/30 text-xs sm:text-sm font-semibold hover:bg-indigo-700 transition-all cursor-pointer"
          >
            อ่านคู่มือต่อ
          </button>
        </div>
      </div>
    </div>
  );
};
