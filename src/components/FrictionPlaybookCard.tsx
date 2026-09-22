import React, { useState } from 'react';
import { FrictionPlaybook } from '../types';
import { 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  Scale, 
  MessageSquareQuote, 
  CheckCircle, 
  XCircle, 
  Sparkles,
  Briefcase,
  Code2
} from 'lucide-react';

interface FrictionPlaybookCardProps {
  playbook?: FrictionPlaybook;
  chapterTitle: string;
  isOpen: boolean;
  onToggle: () => void;
  onEarnXp?: (amount: number, reason: string) => void;
}

export const FrictionPlaybookCard: React.FC<FrictionPlaybookCardProps> = ({
  playbook,
  chapterTitle,
  isOpen,
  onToggle,
  onEarnXp,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasEarnedXp, setHasEarnedXp] = useState(false);

  // If no specific playbook exists for this chapter, show a universal friction principle
  if (!playbook) {
    return (
      <div 
        id="friction-playbook-card"
        className="border border-neutral-200 dark:border-[#262626] rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs transition-all"
      >
        <button
          onClick={onToggle}
          className="w-full p-3 sm:p-4 flex items-center justify-between bg-neutral-50/80 dark:bg-[#181818] text-left cursor-pointer select-none transition-colors hover:bg-neutral-100/80 dark:hover:bg-[#1f1f1f]"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-xs sm:text-base font-bold text-neutral-900 dark:text-[#e5e5e5] leading-snug">
                  คัมภีร์รับมือ Friction & เทคนิคเจรจา (Friction Playbook)
                </h3>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                  สำหรับ Experienced
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] mt-0.5 line-clamp-1 sm:line-clamp-none">
                หลักการพื้นฐานเมื่อเกิดความขัดแย้งในการทำงานจริง
              </p>
            </div>
          </div>
          <div className="text-amber-600 dark:text-amber-400 shrink-0 ml-2">
            {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
        </button>

        {isOpen && (
          <div className="p-2 sm:p-4 space-y-3 sm:space-y-4 border-t border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-xs sm:text-sm">
            <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/25 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-300 text-xs sm:text-sm">
                <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
                <span>กฎทองคำ 3 ข้อเมื่อคุยเรื่อง {chapterTitle}</span>
              </div>
              <ul className="space-y-1.5 text-neutral-700 dark:text-[#c4c4c4] text-xs">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">1.</span>
                  <span><strong>อย่าสั่งเป็นวิธีแก้ ให้บอกปัญหาและ Impact:</strong> Business ควรอธิบายว่า User เจอปัญหาอะไรและส่งผลต่อยอดขายอย่างไร ส่วน Engineer ควรเสนอ 2 ทางเลือก (Fast vs Solid) พร้อม Trade-off</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">2.</span>
                  <span><strong>คำว่า "ทำไม่ได้" ห้ามพูดเดี่ยวๆ:</strong> ให้เปลี่ยนเป็น &ldquo;ทำได้ 2 แบบ: แบบเสร็จสัปดาห์นี้แต่รองรับได้แค่ 100 คน กับแบบทำ 3 สัปดาห์แต่รองรับได้ 10,000 คน อยากเลือกแบบไหน?&rdquo;</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">3.</span>
                  <span><strong>Technical Debt คือเรื่องการเงิน:</strong> หนี้เทคโนโลยีเหมือนบัตรเครดิต รูดใช้ก่อนได้ (เพื่อส่งมอบงานเร็ว) แต่ถ้าไม่เคยจ่ายเงินต้น ดอกเบี้ยจะทบจนแอปพัง</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleSelectDilemma = (optionId: string, isOptimal: boolean) => {
    setSelectedOptionId(optionId);
    if (isOptimal && !hasEarnedXp && onEarnXp) {
      setHasEarnedXp(true);
      onEarnXp(20, 'ผ่านสถานการณ์จำลองการเจรจา (Friction Dilemma)');
    }
  };

  return (
    <div 
      id="friction-playbook-card"
      className="border border-neutral-200 dark:border-[#262626] rounded-xl sm:rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs transition-all"
    >
      {/* Playbook Header Accordion */}
      <button
        onClick={onToggle}
        className="w-full p-3 sm:p-4 flex items-center justify-between bg-neutral-50/80 dark:bg-[#181818] text-left cursor-pointer select-none transition-colors hover:bg-neutral-100/80 dark:hover:bg-[#1f1f1f]"
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3 className="text-xs sm:text-base font-bold text-neutral-900 dark:text-[#e5e5e5] leading-snug">
                คัมภีร์รับมือ Friction & เทคนิคเจรจา (Friction Playbook)
              </h3>
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                สำหรับ Experienced
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] mt-0.5 line-clamp-1 sm:line-clamp-none">
              สมรภูมิ: {playbook.battlegroundTitle}
            </p>
          </div>
        </div>
        <div className="text-amber-600 dark:text-amber-400 shrink-0 ml-2">
          {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-2 sm:p-4 space-y-3 sm:space-y-3.5 border-t border-neutral-200 dark:border-[#262626] bg-white dark:bg-[#141414] text-xs sm:text-sm">
          {/* Section 1: The Iceberg - Frustrations and Root Cause */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-[#e5e5e5]">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span>เบื้องลึกใต้ภูเขาน้ำแข็ง (Under the Surface)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Business Frustration */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300 mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>สิ่งที่ Business อึดอัดใจ</span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-[#c4c4c4] leading-relaxed">
                  {playbook.businessFrustration}
                </p>
              </div>

              {/* Engineer Frustration */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/20">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                  <Code2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>สิ่งที่ Engineer อึดอัดใจ</span>
                </div>
                <p className="text-xs text-neutral-700 dark:text-[#c4c4c4] leading-relaxed">
                  {playbook.engineerFrustration}
                </p>
              </div>
            </div>

            {/* Root Cause Card */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#262626] flex items-start gap-2 sm:gap-2.5">
              <span className="text-base shrink-0 mt-0.5">🎯</span>
              <div>
                <span className="font-bold text-neutral-900 dark:text-[#e5e5e5] text-xs">
                  รากเหง้าที่แท้จริงของความขัดแย้ง:
                </span>
                <p className="text-xs text-neutral-600 dark:text-[#a3a3a3] mt-0.5 leading-relaxed">
                  {playbook.underlyingRootCause}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Trade-off Matrix */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-[#e5e5e5]">
              <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>ตารางการต่อรองแบบ Win-Win (Trade-off Matrix)</span>
            </div>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              การพัฒนาซอฟต์แวร์ไม่มีคำว่า &ldquo;เอาทุกอย่างพร้อมกัน&rdquo; คุณต้องเลือกสิ่งที่แคร์และยอมแลกบางอย่างเสมอ
            </p>

            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#1a1a1a] text-[10px] sm:text-[11px] font-bold text-neutral-600 dark:text-[#a3a3a3] uppercase tracking-wider">
                    <th className="py-2 px-2.5 sm:px-3">ถ้าคุณต้องการ (Need)</th>
                    <th className="py-2 px-2.5 sm:px-3">คุณต้องยอมแลกด้วย (Sacrifice)</th>
                    <th className="py-2 px-2.5 sm:px-3">ประโยคเสนอดีลเจรจา (How to Negotiate)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-[#262626] text-xs">
                  {playbook.tradeOffMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-[#1f1f1f]/50 transition-colors">
                      <td className="py-2.5 px-2.5 sm:px-3 font-semibold text-neutral-900 dark:text-[#e5e5e5] align-top">
                        {item.ifYouNeed}
                      </td>
                      <td className="py-2.5 px-2.5 sm:px-3 text-amber-700 dark:text-amber-300 align-top">
                        {item.youMustSacrifice}
                      </td>
                      <td className="py-2.5 px-2.5 sm:px-3 text-neutral-700 dark:text-[#c4c4c4] italic align-top bg-emerald-500/5 dark:bg-emerald-950/10">
                        {item.howToNegotiate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Battle-tested Golden Scripts */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800 dark:text-[#e5e5e5]">
              <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>ประโยคทองคำในการเจรจาประจำบทนี้ (Battle-tested Scripts)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {playbook.goldenScripts.map((script, idx) => (
                <div 
                  key={idx}
                  className="p-3 sm:p-3.5 rounded-xl border border-neutral-200 dark:border-[#262626] bg-neutral-50/70 dark:bg-[#1a1a1a] space-y-2"
                >
                  <div className="text-[11px] font-bold text-neutral-700 dark:text-[#d4d4d4] pb-1 border-b border-neutral-200/80 dark:border-[#262626]">
                    สถานการณ์: {script.situation}
                  </div>

                  {script.businessScript && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20">
                        💼 Business ควรพูด:
                      </span>
                      <div className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] text-xs italic text-neutral-900 dark:text-[#e5e5e5] leading-relaxed">
                        {script.businessScript}
                      </div>
                    </div>
                  )}

                  {script.engineerScript && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-500/20">
                        💻 Engineer ควรพูด:
                      </span>
                      <div className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] text-xs italic text-neutral-900 dark:text-[#e5e5e5] leading-relaxed">
                        {script.engineerScript}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Interactive Dilemma Simulator (if available) */}
          {playbook.dilemma && (
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-3 sm:space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 text-neutral-950 dark:text-[#e5e5e5] font-bold text-xs sm:text-sm">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                  <span>จำลองสถานการณ์จริงในห้องประชุม (Meeting Dilemma)</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
                  +20 XP เมื่อตอบถูก
                </span>
              </div>

              {/* Dilemma Dialogue Quote */}
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] space-y-0.5 sm:space-y-1">
                <div className="text-[10px] sm:text-[11px] font-semibold text-neutral-500 dark:text-[#8e8e8e]">
                  สถานการณ์: {playbook.dilemma.scenario}
                </div>
                <div className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#e5e5e5] italic">
                  &ldquo;{playbook.dilemma.counterpartQuote}&rdquo;
                </div>
              </div>

              {/* Interactive Options */}
              <div className="space-y-2">
                <div className="text-[11px] sm:text-xs font-semibold text-neutral-700 dark:text-[#c4c4c4]">
                  ถ้าคุณต้องตอบ คุณจะตอบอย่างไร?
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  {playbook.dilemma.options.map((option, index) => {
                    const isSelected = selectedOptionId === option.id;
                    const showResult = selectedOptionId !== null;

                    return (
                      <div
                        key={option.id}
                        className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl border text-xs transition-all ${
                          isSelected
                            ? option.isOptimal
                              ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 font-medium'
                              : 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500 dark:border-rose-500 font-medium'
                            : showResult && option.isOptimal
                            ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/30 dark:border-emerald-500/30'
                            : 'bg-white dark:bg-[#141414] border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-[#404040]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectDilemma(option.id, option.isOptimal)}
                          aria-pressed={isSelected}
                          className="w-full flex items-start justify-between gap-2 text-left cursor-pointer rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <span className="flex items-start gap-1.5 sm:gap-2">
                            <span className="font-bold text-neutral-400 dark:text-[#737373] shrink-0">
                              {['ก', 'ข', 'ค', 'ง', 'จ'][index] ?? index + 1}.
                            </span>
                            <span className="text-neutral-900 dark:text-[#e5e5e5] leading-relaxed">
                              {option.text}
                            </span>
                          </span>
                          {isSelected && (
                            <span className="shrink-0">
                              {option.isOptimal ? (
                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500 dark:text-rose-400" />
                              )}
                            </span>
                          )}
                        </button>

                        {/* Explanation if selected */}
                        {isSelected && (
                          <div className={`mt-2 pt-2 border-t text-[11px] leading-relaxed ${
                            option.isOptimal 
                              ? 'border-emerald-500/20 text-emerald-800 dark:text-emerald-300' 
                              : 'border-rose-500/20 text-rose-800 dark:text-rose-300'
                          }`}>
                            <div className="font-semibold mb-0.5">
                              {option.isOptimal ? '✓ คำตอบนี้เหมาะสมที่สุด (Optimal Negotiation)' : '✗ ยังไม่ใช่วิธีแก้ที่ดีที่สุด'}
                            </div>
                            <p>{option.result}</p>
                            <p className="mt-1 text-[10px] text-neutral-500 dark:text-[#8e8e8e]">
                              💡 เทคนิค: {option.tip}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
