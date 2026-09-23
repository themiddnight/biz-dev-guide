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
import { TAP } from './ui/tapTarget';

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
        className="border border-base-border rounded-xl sm:rounded-2xl overflow-hidden bg-base-100 shadow-2xs transition-all"
      >
        <button
          onClick={onToggle}
          className={`${TAP} w-full p-3 sm:p-4 flex items-center justify-between bg-base-300 text-left cursor-pointer select-none transition-colors hover:bg-base-300`}
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-warning text-warning-content flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h3 className="text-xs sm:text-base font-bold text-base-content leading-snug">
                  คู่มือรับมือ Friction & วิธีเจรจา (Friction Playbook)
                </h3>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/25">
                  สำหรับ Experienced
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-base-content-muted mt-0.5 line-clamp-1 sm:line-clamp-none">
                หลักพื้นฐานเวลาเกิดความขัดแย้งในงาน
              </p>
            </div>
          </div>
          <div className="text-warning shrink-0 ml-2">
            {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
        </button>

        {isOpen && (
          <div className="p-2 sm:p-4 space-y-3 sm:space-y-4 border-t border-base-border bg-base-100 text-xs sm:text-sm">
            <div className="p-3 sm:p-3.5 rounded-xl bg-warning/10 border border-warning/25 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-warning text-xs sm:text-sm">
                <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
                <span>3 ข้อที่ควรจำเมื่อคุยเรื่อง {chapterTitle}</span>
              </div>
              <ul className="space-y-1.5 text-base-content-body text-xs">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-warning shrink-0">1.</span>
                  <span><strong>อย่าสั่งเป็นวิธีแก้ ให้บอกปัญหาและ Impact:</strong> Business ควรอธิบายว่า User เจอปัญหาอะไรและกระทบยอดขายแค่ไหน ส่วน Engineer ควรเสนอ 2 ทางเลือก (Fast vs Solid) พร้อม Trade-off</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-warning shrink-0">2.</span>
                  <span><strong>คำว่า "ทำไม่ได้" ห้ามพูดเดี่ยวๆ:</strong> ให้เปลี่ยนเป็น &ldquo;ทำได้ 2 แบบ: แบบเสร็จสัปดาห์นี้แต่รองรับได้แค่ 100 คน กับแบบทำ 3 สัปดาห์แต่รองรับได้ 10,000 คน อยากเลือกแบบไหน?&rdquo;</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-warning shrink-0">3.</span>
                  <span><strong>Technical Debt คือเรื่องการเงิน:</strong> หนี้เทคโนโลยีเหมือนบัตรเครดิต รูดใช้ก่อนได้ (เพื่อส่งงานเร็ว) แต่ถ้าไม่เคยจ่ายเงินต้น ดอกเบี้ยจะทบจนแอปพัง</span>
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
      className="border border-base-border rounded-xl sm:rounded-2xl overflow-hidden bg-base-100 shadow-2xs transition-all"
    >
      {/* Playbook Header Accordion */}
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-3 sm:p-4 flex items-center justify-between bg-base-300 text-left cursor-pointer select-none transition-colors hover:bg-base-300`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-warning text-warning-content flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs shrink-0">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h3 className="text-xs sm:text-base font-bold text-base-content leading-snug">
                คู่มือรับมือ Friction & วิธีเจรจา (Friction Playbook)
              </h3>
              <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/25">
                สำหรับ Experienced
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-base-content-muted mt-0.5 line-clamp-1 sm:line-clamp-none">
              จุดที่เถียงกัน: {playbook.battlegroundTitle}
            </p>
          </div>
        </div>
        <div className="text-warning shrink-0 ml-2">
          {isOpen ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-2 sm:p-4 space-y-3 sm:space-y-3.5 border-t border-base-border bg-base-100 text-xs sm:text-sm">
          {/* Section 1: The Iceberg - Frustrations and Root Cause */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-base-content">
              <Flame className="w-3.5 h-3.5 text-warning" />
              <span>สิ่งที่ไม่ได้พูดออกมา (Under the Surface)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {/* Business Frustration */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-warning/10 border border-warning/25">
                <div className="flex items-center gap-1.5 text-xs font-bold text-warning mb-1">
                  <Briefcase className="w-3.5 h-3.5 text-warning" />
                  <span>สิ่งที่ Business อึดอัดใจ</span>
                </div>
                <p className="text-xs text-base-content-body leading-relaxed">
                  {playbook.businessFrustration}
                </p>
              </div>

              {/* Engineer Frustration */}
              <div className="p-3 sm:p-3.5 rounded-xl bg-engineer/10 border border-engineer/25">
                <div className="flex items-center gap-1.5 text-xs font-bold text-engineer mb-1">
                  <Code2 className="w-3.5 h-3.5 text-engineer" />
                  <span>สิ่งที่ Engineer อึดอัดใจ</span>
                </div>
                <p className="text-xs text-base-content-body leading-relaxed">
                  {playbook.engineerFrustration}
                </p>
              </div>
            </div>

            {/* Root Cause Card */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-base-300 border border-base-border flex items-start gap-2 sm:gap-2.5">
              <span className="text-base shrink-0 mt-0.5">🎯</span>
              <div>
                <span className="font-bold text-base-content text-xs">
                  ต้นเหตุจริงของความขัดแย้ง:
                </span>
                <p className="text-xs text-base-content-secondary mt-0.5 leading-relaxed">
                  {playbook.underlyingRootCause}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Trade-off Matrix */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-base-content">
              <Scale className="w-3.5 h-3.5 text-success" />
              <span>ตารางการต่อรองแบบ Win-Win (Trade-off Matrix)</span>
            </div>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              การพัฒนาซอฟต์แวร์ไม่มีคำว่า &ldquo;เอาทุกอย่างพร้อมกัน&rdquo; คุณต้องเลือกสิ่งที่แคร์และยอมแลกบางอย่างเสมอ
            </p>

            <div className="overflow-x-auto -mx-1 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-base-border bg-base-300 text-[10px] sm:text-[11px] font-bold text-base-content-secondary uppercase tracking-wider">
                    <th className="py-2 px-2.5 sm:px-3">ถ้าคุณต้องการ (Need)</th>
                    <th className="py-2 px-2.5 sm:px-3">คุณต้องยอมแลกด้วย (Sacrifice)</th>
                    <th className="py-2 px-2.5 sm:px-3">ประโยคที่ใช้ต่อรอง (How to Negotiate)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-border text-xs">
                  {playbook.tradeOffMatrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-base-300 transition-colors">
                      <td className="py-2.5 px-2.5 sm:px-3 font-semibold text-base-content align-top">
                        {item.ifYouNeed}
                      </td>
                      <td className="py-2.5 px-2.5 sm:px-3 text-warning align-top">
                        {item.youMustSacrifice}
                      </td>
                      <td className="py-2.5 px-2.5 sm:px-3 text-base-content-body italic align-top bg-success/10">
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
            <div className="flex items-center gap-1.5 text-xs font-bold text-base-content">
              <MessageSquareQuote className="w-3.5 h-3.5 text-engineer" />
              <span>ประโยคต่อรองที่ใช้ได้จริง (Battle-tested Scripts)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
              {playbook.goldenScripts.map((script, idx) => (
                <div 
                  key={idx}
                  className="p-3 sm:p-3.5 rounded-xl border border-base-border bg-base-300 space-y-2"
                >
                  <div className="text-[11px] font-bold text-base-content-body pb-1 border-b border-base-border">
                    สถานการณ์: {script.situation}
                  </div>

                  {script.businessScript && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-warning/10 text-warning border border-warning/25">
                        💼 Business ควรพูด:
                      </span>
                      <div className="p-2 sm:p-2.5 rounded-lg bg-base-100 border border-base-border text-xs italic text-base-content leading-relaxed">
                        {script.businessScript}
                      </div>
                    </div>
                  )}

                  {script.engineerScript && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-engineer/10 text-engineer border border-engineer/25">
                        💻 Engineer ควรพูด:
                      </span>
                      <div className="p-2 sm:p-2.5 rounded-lg bg-base-100 border border-base-border text-xs italic text-base-content leading-relaxed">
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
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-base-300 border border-base-border space-y-3 sm:space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-1.5 sm:gap-2">
                <div className="flex items-center gap-1.5 text-base-content font-bold text-xs sm:text-sm">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
                  <span>จำลองสถานการณ์จริงในห้องประชุม (Meeting Dilemma)</span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/25">
                  +20 XP เมื่อตอบถูก
                </span>
              </div>

              {/* Dilemma Dialogue Quote */}
              <div className="p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-base-100 border border-base-border space-y-0.5 sm:space-y-1">
                <div className="text-[10px] sm:text-[11px] font-semibold text-base-content-muted">
                  สถานการณ์: {playbook.dilemma.scenario}
                </div>
                <div className="text-xs sm:text-sm font-bold text-base-content italic">
                  &ldquo;{playbook.dilemma.counterpartQuote}&rdquo;
                </div>
              </div>

              {/* Interactive Options */}
              <div className="space-y-2">
                <div className="text-[11px] sm:text-xs font-semibold text-base-content-body">
                  ถ้าคุณต้องตอบ คุณจะตอบยังไง?
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
                              ? 'bg-success/10 border-success font-medium'
                              : 'bg-error/10 border-error font-medium'
                            : showResult && option.isOptimal
                            ? 'bg-success/10 border-success/25'
                            : 'bg-base-100 border-base-border hover:border-base-border-strong'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectDilemma(option.id, option.isOptimal)}
                          aria-pressed={isSelected}
                          className={`${TAP} w-full flex items-start justify-between gap-2 text-left cursor-pointer rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-engineer`}
                        >
                          <span className="flex items-start gap-1.5 sm:gap-2">
                            <span className="font-bold text-base-content-muted shrink-0">
                              {['ก', 'ข', 'ค', 'ง', 'จ'][index] ?? index + 1}.
                            </span>
                            <span className="text-base-content leading-relaxed">
                              {option.text}
                            </span>
                          </span>
                          {isSelected && (
                            <span className="shrink-0">
                              {option.isOptimal ? (
                                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-error" />
                              )}
                            </span>
                          )}
                        </button>

                        {/* Explanation if selected */}
                        {isSelected && (
                          <div className={`mt-2 pt-2 border-t text-[11px] leading-relaxed ${
                            option.isOptimal 
                              ? 'border-success/25 text-success' 
                              : 'border-error/25 text-error'
                          }`}>
                            <div className="font-semibold mb-0.5">
                              {option.isOptimal ? '✓ คำตอบนี้ดีที่สุด (Optimal Negotiation)' : '✗ ยังไม่ใช่วิธีแก้ที่ดีที่สุด'}
                            </div>
                            <p>{option.result}</p>
                            <p className="mt-1 text-[10px] text-base-content-muted">
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
