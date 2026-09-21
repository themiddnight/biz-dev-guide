import React, { useState } from 'react';
import { AudienceMode, RoleMindsetGuide } from '../types';
import { ROLE_MINDSETS } from '../data/roleMindsets';
import { 
  Briefcase, 
  Code2, 
  HeartHandshake, 
  AlertTriangle, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  MessageCircle,
  Trophy
} from 'lucide-react';

interface RoleMindsetCardProps {
  audienceMode: AudienceMode;
  onSelectRole?: (mode: AudienceMode) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const RoleMindsetCard: React.FC<RoleMindsetCardProps> = ({
  audienceMode,
  onSelectRole,
  isOpen,
  onToggle,
}) => {
  // If in 'both' mode, allow local tab switching between business and engineer
  const [activeTab, setActiveTab] = useState<'business' | 'engineer'>('business');

  const currentRoleKey = audienceMode === 'both' ? activeTab : audienceMode;
  const guide: RoleMindsetGuide = ROLE_MINDSETS[currentRoleKey];

  return (
    <div 
      id="role-mindset-card"
      className="border border-neutral-200 dark:border-[#262626] rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs transition-all"
    >
      {/* Header Button */}
      <button
        onClick={onToggle}
        className="w-full p-3 sm:p-4 flex items-center justify-between bg-neutral-50/80 dark:bg-[#181818] text-left cursor-pointer select-none transition-colors hover:bg-neutral-100/80 dark:hover:bg-[#1f1f1f]"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3 className="text-xs sm:text-base font-bold text-neutral-900 dark:text-[#e5e5e5] leading-snug">
                เข้าใจวิธีคิดของแต่ละบทบาท (Role Mindset & Empathy)
              </h3>
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                สำหรับ Beginner
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] mt-0.5 line-clamp-1 sm:line-clamp-none">
              ทำไมเขาถึงคิดแบบนั้น? สิ่งที่เขาแคร์ สิ่งที่เขากลัว และคำแนะนำในการสร้างสะพานเชื่อม
            </p>
          </div>
        </div>
        <div className="text-emerald-600 dark:text-emerald-400 shrink-0 ml-2">
          {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 border-t border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-xs sm:text-sm">
          {/* Role Perspective Selector Tabs (when in 'both' mode or to quickly peek) */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-neutral-100 dark:border-[#222222]">
            <span className="text-[11px] sm:text-xs font-semibold text-neutral-600 dark:text-[#a3a3a3]">
              กำลังดู Mindset ของ:
            </span>
            <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-neutral-100 dark:bg-[#1a1a1a] rounded-lg sm:rounded-xl border border-neutral-200/60 dark:border-[#262626]">
              <button
                onClick={() => {
                  setActiveTab('business');
                  if (onSelectRole && audienceMode !== 'both') onSelectRole('business');
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-medium cursor-pointer transition-all ${
                  (audienceMode === 'both' ? activeTab === 'business' : audienceMode === 'business')
                    ? 'bg-white dark:bg-[#262626] text-amber-700 dark:text-amber-300 shadow-2xs font-bold'
                    : 'text-neutral-600 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 dark:text-amber-400" />
                <span>ฝั่ง Business</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('engineer');
                  if (onSelectRole && audienceMode !== 'both') onSelectRole('engineer');
                }}
                className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-medium cursor-pointer transition-all ${
                  (audienceMode === 'both' ? activeTab === 'engineer' : audienceMode === 'engineer')
                    ? 'bg-white dark:bg-[#262626] text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                    : 'text-neutral-600 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>ฝั่ง Engineer</span>
              </button>
            </div>
          </div>

          {/* Role Header Profile */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl">{currentRoleKey === 'business' ? '💼' : '💻'}</span>
                <h4 className="font-bold text-neutral-900 dark:text-[#e5e5e5] text-xs sm:text-sm">
                  {guide.title}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 font-medium self-start sm:self-auto shrink-0">
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>เกณฑ์ความสำเร็จ: {guide.howTheyMeasureSuccess}</span>
            </div>
          </div>

          {/* Two-Column: What they care about vs What keeps them awake */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
            {/* What they care about */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300 font-bold text-xs">
                <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>3 สิ่งที่บทบาทนี้แคร์ที่สุดในงาน</span>
              </div>
              <ul className="space-y-1.5 text-neutral-700 dark:text-[#c4c4c4]">
                {guide.whatTheyCareAboutMost.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What keeps them awake */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-300 font-bold text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>สิ่งที่ทำให้เขากังวลใจ / กลัวใต้ผิวน้ำ</span>
              </div>
              <ul className="space-y-1.5 text-neutral-700 dark:text-[#c4c4c4]">
                {guide.whatKeepsThemUpAtNight.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Unspoken thoughts (The Iceberg Under the Surface) */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-300 font-bold text-xs">
              <MessageCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>เสียงในใจที่เขาไม่ได้พูดออกมาตรงๆ (Unspoken Truth)</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-lg bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#262626] text-xs italic text-neutral-700 dark:text-[#d4d4d4] leading-relaxed">
              &ldquo;{guide.unspokenThoughts}&rdquo;
            </div>
          </div>

          {/* Golden Bridge Advice: How to communicate with them */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/25 space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-bold text-xs sm:text-sm">
              <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
              <span>คำแนะนำในการสร้างสะพานเชื่อม (Bridge Advice)</span>
            </div>
            <p className="text-neutral-800 dark:text-[#d4d4d4] leading-relaxed text-xs sm:text-sm">
              {guide.bridgeAdvice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
