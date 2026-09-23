import React, { useState } from 'react';
import { RoleMindsetGuide } from '../types';
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
import { TAP } from './ui/tapTarget';

interface RoleMindsetCardProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const RoleMindsetCard: React.FC<RoleMindsetCardProps> = ({
  isOpen,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'business' | 'engineer'>('business');

  const currentRoleKey = activeTab;
  const guide: RoleMindsetGuide = ROLE_MINDSETS[currentRoleKey];

  return (
    <div 
      id="role-mindset-card"
      className="border border-base-border rounded-xl sm:rounded-2xl overflow-hidden bg-base-100 shadow-2xs transition-all"
    >
      {/* Header Button */}
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-3 sm:p-4 flex items-center justify-between bg-base-300 text-left cursor-pointer select-none transition-colors hover:bg-base-border`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-success text-success-content flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3 className="text-xs sm:text-base font-bold text-base-content leading-snug">
                เข้าใจวิธีคิดของแต่ละบทบาท (Role Mindset & Empathy)
              </h3>
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/25">
                สำหรับ Beginner
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-base-content-muted mt-0.5 line-clamp-1 sm:line-clamp-none">
              ทำไมเขาถึงคิดแบบนั้น? สิ่งที่เขาแคร์ สิ่งที่เขากลัว และวิธีคุยกับฝั่งนี้
            </p>
          </div>
        </div>
        <div className="text-success shrink-0 ml-2">
          {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 space-y-3.5 sm:space-y-4 border-t border-base-border bg-base-100 text-xs sm:text-sm">
          {/* Role Perspective Selector Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-base-border">
            <span className="text-[11px] sm:text-xs font-semibold text-base-content-secondary">
              กำลังดู Mindset ของ:
            </span>
            <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-base-300 rounded-lg sm:rounded-xl border border-base-border">
              <button
                onClick={() => setActiveTab('business')}
                className={`${TAP} flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-medium cursor-pointer transition-all ${
                  activeTab === 'business'
                    ? 'bg-base-100 text-business shadow-2xs font-bold'
                    : 'text-base-content-secondary hover:text-base-content'
                }`}
              >
                <Briefcase className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-business" />
                <span>ฝั่ง Business</span>
              </button>
              <button
                onClick={() => setActiveTab('engineer')}
                className={`${TAP} flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-medium cursor-pointer transition-all ${
                  activeTab === 'engineer'
                    ? 'bg-base-100 text-engineer shadow-2xs font-bold'
                    : 'text-base-content-secondary hover:text-base-content'
                }`}
              >
                <Code2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-engineer" />
                <span>ฝั่ง Engineer</span>
              </button>
            </div>
          </div>

          {/* Role Header Profile */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-base-300 border border-base-border flex flex-col items-start gap-2 sm:gap-2.5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl">{currentRoleKey === 'business' ? '💼' : '💻'}</span>
                <h4 className="font-bold text-base-content text-xs sm:text-sm">
                  {guide.title}
                </h4>
              </div>
            </div>
            <div className="flex items-start gap-1.5 max-w-full text-[11px] sm:text-xs leading-relaxed px-2.5 py-1 rounded-lg bg-success/10 text-success border border-success/25 font-medium">
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 mt-0.5 shrink-0 text-success" />
              <span className="min-w-0 break-words">วัดความสำเร็จจาก: {guide.howTheyMeasureSuccess}</span>
            </div>
          </div>

          {/* Two-Column: What they care about vs What keeps them awake */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5">
            {/* What they care about */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-engineer/10 border border-engineer/25 space-y-2">
              <div className="flex items-center gap-1.5 text-engineer font-bold text-xs">
                <Target className="w-3.5 h-3.5 text-engineer" />
                <span>3 สิ่งที่บทบาทนี้แคร์ที่สุดในงาน</span>
              </div>
              <ul className="space-y-1.5 text-base-content-body">
                {guide.whatTheyCareAboutMost.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-engineer shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What keeps them awake */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-warning/10 border border-warning/25 space-y-2">
              <div className="flex items-center gap-1.5 text-warning font-bold text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                <span>สิ่งที่เขากังวลหรือกลัว</span>
              </div>
              <ul className="space-y-1.5 text-base-content-body">
                {guide.whatKeepsThemUpAtNight.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Unspoken thoughts (The Iceberg Under the Surface) */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-data-2/10 border border-data-2/25 space-y-1.5">
            <div className="flex items-center gap-1.5 text-data-2 font-bold text-xs">
              <MessageCircle className="w-3.5 h-3.5 text-data-2" />
              <span>เสียงในใจที่เขาไม่ได้พูดออกมาตรงๆ (Unspoken Truth)</span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-lg bg-base-100 border border-base-border text-xs italic text-base-content-body leading-relaxed">
              &ldquo;{guide.unspokenThoughts}&rdquo;
            </div>
          </div>

          {/* Golden Bridge Advice: How to communicate with them */}
          <div className="p-3 sm:p-3.5 rounded-xl bg-success/10 border border-success/25 space-y-1.5">
            <div className="flex items-center gap-1.5 text-success font-bold text-xs sm:text-sm">
              <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
              <span>วิธีคุยกับฝั่งนี้ (Bridge Advice)</span>
            </div>
            <p className="text-base-content-body leading-relaxed text-xs sm:text-sm">
              {guide.bridgeAdvice}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
