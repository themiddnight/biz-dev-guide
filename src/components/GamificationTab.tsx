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
import { Button } from './ui/Button';
import { IconBadge } from './ui/IconBadge';
import { Card } from './ui/Card';

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
    <div className="max-w-4xl mx-auto space-y-section pb-16">
      {/* Profile & Level Card */}
      <div className="p-box-spacious bg-base-100 rounded-box border border-base-border shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <IconBadge size="lg" label={`Lv.${currentTier.level}`}>Lv.{currentTier.level}</IconBadge>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-2xl font-bold text-base-content">
                  {currentTier.title}
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-base-content-muted mt-0.5">
                ระดับของคุณในการทำงานข้าม Business ↔ Engineering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-warning/10 text-warning rounded-box font-bold text-sm sm:text-base border border-warning/25">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-warning text-warning" />
            <span>{userStats.xp} Total XP</span>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs text-base-content-muted">
            <span>อีกเท่าไรถึงระดับถัดไป</span>
            {nextTier ? (
              <span>{userStats.xp} / {nextTier.minXp} XP (ขาดอีก {nextTier.minXp - userStats.xp} XP)</span>
            ) : (
              <span className="text-warning font-bold">ระดับสูงสุดแล้ว!</span>
            )}
          </div>
          <div className="w-full bg-base-300 h-2.5 sm:h-3 rounded-full overflow-hidden p-0.5 border border-base-border">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-box bg-base-100 rounded-box border border-base-border shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-base-content-muted text-xs font-medium">
            <BookOpen className="w-3.5 h-3.5 text-base-content-secondary" />
            <span>อ่านแล้ว</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-base-content">
            {userStats.readChapters.length}/{chapterCount}
          </div>
          <span className="text-[11px] text-base-content-muted">บุ๊กมาร์ก {userStats.bookmarks.length}</span>
        </div>

        <div className="p-box bg-base-100 rounded-box border border-base-border shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-base-content-muted text-xs font-medium">
            <Bot className="w-3.5 h-3.5 text-base-content-secondary" />
            <span>คำถามที่ถาม AI</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-base-content">
            {userStats.aiQuestionsAsked}
          </div>
          <span className="text-[11px] text-base-content-muted">ครั้งที่ปรึกษา</span>
        </div>

        <div className="p-box bg-base-100 rounded-box border border-base-border shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-base-content-muted text-xs font-medium">
            <Trophy className="w-3.5 h-3.5 text-warning" />
            <span>ควิซที่ตอบถูก</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-base-content">
            {userStats.correctAnswers}
          </div>
          <span className="text-[11px] text-base-content-muted">ข้อที่ตอบถูก</span>
        </div>

        <div className="p-box bg-base-100 rounded-box border border-base-border shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-base-content-muted text-xs font-medium">
            <Award className="w-3.5 h-3.5 text-success" />
            <span>เหรียญความสำเร็จ</span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-base-content">
            {unlockedCount} / {badges.length}
          </div>
          <span className="text-[11px] text-success font-semibold">{Math.round((unlockedCount / badges.length) * 100)}% สำเร็จ</span>
        </div>
      </div>

      {/* Badges Showcase */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-base-content">
            เหรียญที่สะสมได้ (Badges &amp; Achievements)
          </h3>
          <p className="text-xs text-base-content-muted">
            ปลดล็อกได้จากการอ่านคู่มือ ถาม AI และทำควิซ
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {badges.map((badge) => {
            return (
              <div
                key={badge.id}
                className={`p-box rounded-box border transition-all flex items-start gap-3 ${
                  badge.unlocked
                    ? 'bg-base-100 border-base-border-strong shadow-xs'
                    : 'bg-base-100 border-base-border'
                }`}
              >
                {badge.unlocked ? (
                  <IconBadge size="none" className="w-9 h-9 sm:w-10 sm:h-10">{getIcon(badge.icon)}</IconBadge>
                ) : (
                  <IconBadge size="none" className="w-9 h-9 sm:w-10 sm:h-10 opacity-50 text-base-content-subtle">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                  </IconBadge>
                )}

                <div className="min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs sm:text-sm font-bold truncate ${
                      badge.unlocked ? 'text-base-content' : 'text-base-content-secondary'
                    }`}>
                      {badge.title}
                    </h4>
                    {badge.unlocked && (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-base-content-muted leading-snug">
                    {badge.description}
                  </p>
                  {badge.unlockedAt && (
                    <span className="inline-block text-[10px] text-base-content-secondary font-medium pt-0.5">
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
      <Card variant="subtle" padding="spacious" className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-base sm:text-lg font-bold">ต้องการเพิ่ม XP และปลดล็อกเหรียญที่เหลือ?</h3>
          <p className="text-xs sm:text-sm text-base-content-secondary">
            ลองทำแบบทดสอบจำลองสถานการณ์ หรือถามคำถามใหม่กับ AI เพื่อสะสม XP
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button color="primary" variant="solid" size="md" onClick={onStartQuiz}>
            ไปทำควิซ (+XP)
          </Button>
          <Button color="neutral" variant="outline" size="md" onClick={onGoToGuide}>
            อ่านคู่มือต่อ
          </Button>
        </div>
      </Card>
    </div>
  );
};
