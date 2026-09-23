import React, { useState } from 'react';
import { ProtocolSimulator } from './ProtocolSimulator';
import { 
  ArrowRight, 
  Layers, 
  Shield, 
  Database, 
  Smartphone, 
  Globe, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  GitBranch, 
  TrendingUp, 
  Flame, 
  Sliders, 
  FileText, 
  Bot, 
  Lock, 
  Gauge, 
  HelpCircle,
  Eye,
  Activity,
  Play,
  RotateCcw,
  Send,
  Check,
  Compass,
  FileCode2,
  Users,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { TAP, TAP_Y } from './ui/tapTarget';

interface ChapterDiagramProps {
  chapterId: string;
}

export const ChapterDiagram: React.FC<ChapterDiagramProps> = ({ chapterId }) => {
  // Common states
  const [activeStep, setActiveStep] = useState<number>(0);
  const [c4Zoom, setC4Zoom] = useState<1 | 2 | 3 | 4>(1);
  const [pyramidLevel, setPyramidLevel] = useState<'unit' | 'integration' | 'e2e'>('unit');
  const [canaryPercent, setCanaryPercent] = useState<number>(5);
  const [canaryBug, setCanaryBug] = useState<boolean>(false);
  const [boehmPhase, setBoehmPhase] = useState<number>(0);

  // Code route state (s8)
  const [routeGate, setRouteGate] = useState<number>(0);
  const [skipChecks, setSkipChecks] = useState<boolean>(false);
  const [routeStatus, setRouteStatus] = useState<'idle' | 'running' | 'caught' | 'incident' | 'success'>('idle');

  // Chapter 5: Monolith vs Microservices failure state
  const [archMode, setArchMode] = useState<'monolith' | 'microservices'>('microservices');
  const [paymentFailed, setPaymentFailed] = useState<boolean>(false);

  // Chapter 11: Iron Triangle state
  const [scopeVal, setScopeVal] = useState<number>(80); // 20 - 100
  const [timeVal, setTimeVal] = useState<number>(3); // 1 - 6 months
  const [costVal, setCostVal] = useState<number>(3); // 1 - 5 headcount / budget

  // Chapter 12: Dual Track state
  const [dualTrackPhase, setDualTrackPhase] = useState<'discovery' | 'delivery' | 'synchronized'>('synchronized');

  // =========================================================================
  // Code route through the release gates (rendered in s8; moved from s1 per chapter figure briefs Q4)
  // =========================================================================
  const renderReleaseTrain = () => {
    const gates = [
      { name: 'Local Branch', role: 'เครื่อง Dev', passText: 'เขียนโค้ดและทดสอบบนเครื่องตัวเอง', risk: 'เห็นแค่มุมของคนเขียนคนเดียว' },
      { name: 'Pull Request', role: 'Code Review', passText: 'เพื่อนร่วมทีมอ่านและตรวจโค้ด', skippedText: 'ไม่มีใครอ่านโค้ดก่อน Merge', risk: 'ถ้ากดอนุมัติโดยไม่อ่าน บั๊กจะหลุด' },
      { name: 'Automated CI', role: 'เทสต์อัตโนมัติ', passText: 'รัน Unit Tests + Security Scan ทุกครั้ง', skippedText: 'ไม่มีเทสต์อัตโนมัติรันเลย', risk: 'จับตรรกะผิดได้เร็วและถูกที่สุด' },
      { name: 'Staging', role: 'ทดสอบรวมระบบ (QA)', passText: 'ทดสอบบนระบบที่ใกล้ของจริง', risk: 'เจอปัญหาการเชื่อมกับระบบภายนอก' },
      { name: 'Production', role: 'ผู้ใช้จริง', passText: 'ส่งถึงผู้ใช้จริง', risk: 'บั๊กที่หลุดมาถึงตรงนี้ ลูกค้าเจอก่อนทีม' }
    ];
    // Gates 2 (PR review) and 3 (CI) are the ones "skip mode" bypasses.
    const isSkipped = (idx: number, skip: boolean) => skip && (idx === 1 || idx === 2);

    // Where the bug surfaces depends on the gate: Staging still catches it before users.
    const statusAt = (gateIdx: number, skip: boolean) =>
      skip && gateIdx === 4 ? 'incident'
        : skip && gateIdx === 3 ? 'caught'
        : gateIdx === 4 ? 'success'
        : 'running';

    const selectGate = (gateIdx: number) => {
      setRouteGate(gateIdx);
      setRouteStatus(statusAt(gateIdx, skipChecks));
    };

    const current = gates[routeGate];

    return (
      <div className="space-y-4">
        {/* Code route: five gates from a dev's branch to real users */}
        <div className="p-4 sm:p-5 rounded-2xl bg-base-100 border border-base-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-engineer shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-base-content">
                  เส้นทางของโค้ดก่อนถึงผู้ใช้
                </h4>
                <p className="text-[11px] text-base-content-muted">
                  คลิกแต่ละด่านเพื่อดูว่าโค้ดผ่านอะไรมาบ้าง แล้วลองข้าม Review &amp; Tests
                </p>
              </div>
            </div>
            
            <button
              onClick={() => {
                // Keep the selected gate; re-evaluate it under the new mode.
                setSkipChecks(!skipChecks);
                if (routeStatus !== 'idle') setRouteStatus(statusAt(routeGate, !skipChecks));
              }}
              className={`${TAP} px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                skipChecks 
                  ? 'bg-error text-error-content shadow-xs' 
                  : 'bg-base-300 text-base-content-body hover:bg-base-border'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>ข้าม Review &amp; Tests: {skipChecks ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          {/* Gates with connectors (connectors hidden on the 2-column phone grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 pt-1">
            {gates.map((g, idx) => {
              const skipped = isSkipped(idx, skipChecks);
              const isCurrent = routeGate === idx;
              const isPassed = routeGate > idx && !skipped;
              return (
                <div key={idx} className="relative">
                  <button
                    onClick={() => selectGate(idx)}
                    className={`${TAP} w-full h-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrent && routeStatus === 'incident'
                        ? 'border-error bg-error/10 text-error ring-2 ring-error'
                        : isCurrent && routeStatus === 'caught'
                        ? 'border-warning bg-warning/10 text-warning ring-2 ring-warning'
                        : isCurrent
                        ? 'border-engineer bg-engineer/10 text-engineer ring-2 ring-engineer'
                        : skipped
                        ? 'border-dashed border-base-border-strong bg-base-300 text-base-content-muted'
                        : isPassed
                        ? 'border-success/25 bg-success/10 text-base-content-body'
                        : 'border-base-border bg-base-300 text-base-content-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-base-content-muted">ด่าน {idx + 1}</span>
                      {skipped ? (
                        <span className="text-base-content-muted font-bold">⤼ ถูกข้าม</span>
                      ) : isCurrent && routeStatus === 'incident' ? (
                        <span className="text-error font-bold">💥 เกิดเหตุ</span>
                      ) : isCurrent && routeStatus === 'caught' ? (
                        <span className="text-warning font-bold">⚠ จับบั๊กได้</span>
                      ) : isCurrent ? (
                        <span className="text-engineer font-bold">● อยู่ที่นี่</span>
                      ) : isPassed ? (
                        <span className="text-success font-bold flex items-center gap-0.5">
                          <Check className="w-3.5 h-3.5" /> ผ่าน
                        </span>
                      ) : (
                        <span className="text-base-content-muted">ยังไม่ถึง</span>
                      )}
                    </div>
                    <div className={`font-bold text-xs truncate ${skipped ? 'line-through' : ''}`}>{g.name}</div>
                    <div className={`text-[10px] truncate ${skipped ? 'line-through text-base-content-muted' : 'text-base-content-muted'}`}>{g.role}</div>
                  </button>
                  {idx < gates.length - 1 && (
                    <div className="hidden sm:flex absolute left-full top-1/2 -translate-y-1/2 w-4 justify-center pointer-events-none" aria-hidden="true">
                      <ArrowRight className={`w-3.5 h-3.5 ${routeGate > idx ? 'text-success' : 'text-base-content-subtle'}`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Outcome Banner */}
          {routeStatus === 'incident' ? (
            <div className="p-3.5 rounded-xl bg-error/10 border border-error/25 text-error text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-error">
                <Flame className="w-4 h-4" />
                <span>เกิดเหตุบน Production: บั๊กหลุดถึงผู้ใช้จริง</span>
              </div>
              <p className="text-[11px] leading-relaxed text-error">
                ข้าม Review และเทสต์อัตโนมัติ แล้ว Staging ก็ไม่เจอ (บางบั๊กโผล่เฉพาะกับข้อมูลจริง) ลูกค้าเจอก่อนทีม ต้อง Rollback และแก้ด่วน เคส Knight Capital เสียไปราว 440 ล้านดอลลาร์ในไม่ถึงชั่วโมง
              </p>
            </div>
          ) : routeStatus === 'caught' ? (
            <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/25 text-warning text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-warning">
                <AlertTriangle className="w-4 h-4" />
                <span>จับได้ก่อนถึงผู้ใช้: บั๊กโผล่ที่ Staging</span>
              </div>
              <p className="text-[11px] leading-relaxed text-warning">
                ด่านสุดท้ายก่อน Production ช่วยไว้ แต่ต้องย้อนกลับไปแก้ ซึ่งช้าและแพงกว่าจับได้ตั้งแต่ Review หรือ CI
              </p>
            </div>
          ) : routeStatus === 'success' ? (
            <div className="p-3.5 rounded-xl bg-success/10 border border-success/25 text-success text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-success">
                <CheckCircle2 className="w-4 h-4" />
                <span>ถึงผู้ใช้อย่างปลอดภัย</span>
              </div>
              <p className="text-[11px] text-success">
                ผ่าน Code Review, เทสต์อัตโนมัติ และทดสอบบน Staging ครบทุกด่าน ผู้ใช้ได้ฟีเจอร์ใหม่โดยระบบไม่ล่ม
              </p>
            </div>
          ) : (
            <div className="p-3 bg-neutral text-neutral-content rounded-xl text-xs flex items-center justify-between flex-wrap gap-1">
              {isSkipped(routeGate, skipChecks) ? (
                <span>ด่าน <b>{current.name}</b> ถูกข้าม: {current.skippedText}</span>
              ) : (
                <span>ด่านปัจจุบัน: <b>{current.name}</b> ({current.passText})</span>
              )}
              <span className="text-[11px] text-engineer">ความเสี่ยง: {current.risk}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // =========================================================================
  // CHAPTER 2: MoSCoW & RICE Matrix
  // =========================================================================
  if (chapterId === 's2') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* MoSCoW Grid */}
          <div className="p-4 rounded-2xl border border-base-border bg-base-100 space-y-3">
            <span className="text-xs font-bold text-engineer uppercase tracking-wider">
              MoSCoW Framework (จัดกลุ่มตามความจำเป็น)
            </span>
            <p className="text-[11px] text-base-content-muted">
              ไม่มีโควตาตายตัว แต่ Must ไม่ควรเกิน ~60% ของงานรอบนี้ ที่เหลือคือกันชนไว้ตัดเมื่องานบานปลาย
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-error/10 border border-error/25">
                <span className="font-bold text-error block mb-1">M - Must Have</span>
                <p className="text-[11px] text-base-content-secondary">ขาดแล้วระบบใช้งานไม่ได้เลย หรือผิดกฎหมาย เช่น ชำระเงิน</p>
              </div>
              <div className="p-2.5 rounded-xl bg-warning/10 border border-warning/25">
                <span className="font-bold text-warning block mb-1">S - Should Have</span>
                <p className="text-[11px] text-base-content-secondary">สำคัญมาก แต่ยังมีทางเลี่ยงชั่วคราวได้ เช่น ใบเสร็จ PDF</p>
              </div>
              <div className="p-2.5 rounded-xl bg-data-1/10 border border-data-1/25">
                <span className="font-bold text-data-1 block mb-1">C - Could Have</span>
                <p className="text-[11px] text-base-content-secondary">ถ้ามีเวลาเหลือจะทำ ช่วยเพิ่มความประทับใจ เช่น Dark mode</p>
              </div>
              <div className="p-2.5 rounded-xl bg-base-300 border border-base-border">
                <span className="font-bold text-base-content-secondary block mb-1">W - Won't Have</span>
                <p className="text-[11px] text-base-content-muted">ตัดทิ้งชัดเจนในรอบนี้ ไม่นำมาเปลืองสมาธิทีม</p>
              </div>
            </div>
          </div>

          {/* RICE Scoring Formula */}
          <div className="p-4 rounded-2xl border border-base-border bg-base-100 space-y-3">
            <span className="text-xs font-bold text-data-2 uppercase tracking-wider">
              RICE Scoring (ให้คะแนนตามสูตร)
            </span>
            <div className="p-3 bg-base-300 rounded-xl text-center text-xs font-bold text-base-content">
              Score = (Reach × Impact × Confidence) ÷ Effort
            </div>
            <div className="space-y-1.5 text-xs text-base-content-secondary">
              <div className="flex justify-between">
                <b className="text-engineer">Reach:</b> <span>ผู้ใช้ที่ได้รับผลกระทบต่อเดือน (เช่น 5,000 คน)</span>
              </div>
              <div className="flex justify-between">
                <b className="text-data-2">Impact:</b> <span>น้ำหนักผลลัพธ์ (3=สูงสุด, 2=สูง, 1=ปานกลาง, 0.5=ต่ำ)</span>
              </div>
              <div className="flex justify-between">
                <b className="text-success">Confidence:</b> <span>ความมั่นใจในข้อมูล (100%, 80%, 50%)</span>
              </div>
              <div className="flex justify-between">
                <b className="text-data-5">Effort:</b> <span>แรงทีม Dev (Person-Months เช่น 2 คน-เดือน)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 3: Design Fidelity Spectrum
  // =========================================================================
  if (chapterId === 's3') {
    return (
      <div className="space-y-4">
        <div className="text-xs text-base-content-muted">
          บันได 4 ขั้นของงานออกแบบ ยิ่งทดสอบในขั้นแรกๆ <b>ต้นทุนการรื้อทิ้งยิ่งถูกลง</b>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { step: '1. Sketch', speed: 'ทำเสร็จใน 1 ชั่วโมง', cost: 'ถูกสุด', change: 'ลบขีดใหม่ใน 3 นาที', color: 'border-data-1/40' },
            { step: '2. Low-Fi Wireframe', speed: 'ทำเสร็จใน 1 วัน', cost: 'ยังถูก', change: 'จัด Layout ใหม่ใน 20 นาที', color: 'border-engineer/40' },
            { step: '3. Hi-Fi Interactive Prototype', speed: 'ทำเสร็จใน 3-5 วัน', cost: 'เริ่มแพง', change: 'แก้สี ฟอนต์ แอนิเมชัน 2 ชม.', color: 'border-data-2/40' },
            { step: '4. Production Live Code', speed: 'ทำเสร็จใน 2-4 สัปดาห์', cost: 'แพงสุด', change: 'รื้อ Database/API/Test เป็นสัปดาห์', color: 'border-data-5/40' },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-2xl bg-base-100 border ${item.color} space-y-2`}>
              <span className="text-xs font-bold text-base-content block">{item.step}</span>
              <div className="text-[11px] text-base-content-muted space-y-1">
                <div>⏱️ {item.speed}</div>
                <div>💰 ต้นทุนการแก้: <b className="text-error">{item.cost}</b></div>
                <div>🔄 ความยืดหยุ่น: {item.change}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 4: The Iceberg Requirement
  // =========================================================================
  if (chapterId === 's4') {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-2xl bg-gradient-to-b from-data-4/10 via-data-1/10 to-engineer/10 border border-data-1/25 space-y-3">
          {/* Tip of Iceberg */}
          <div className="p-3.5 rounded-xl bg-base-100/90 border border-data-1/25 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-data-4 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>ส่วนที่มองเห็น: Functional Requirements (FR)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-data-4/10 text-data-4 font-bold">สิ่งที่ตาเห็น</span>
            </div>
            <p className="text-xs text-base-content-secondary">
              สิ่งที่ระบบต้อง <b>"ทำได้"</b>: กดปุ่มสมัครสมาชิกได้, มีตะกร้าสินค้า, ค้นหาตามชื่อสินค้าได้, มีใบเสร็จรับเงิน
            </p>
          </div>

          <div className="text-center font-bold text-[11px] text-data-1 tracking-wider">
            〰〰〰〰〰〰〰〰 ผิวน้ำ (จุดที่ Business มักมองเห็นแค่นี้) 〰〰〰〰〰〰〰〰
          </div>

          {/* Under water */}
          <div className="p-3.5 rounded-xl bg-engineer/10 border border-engineer/25 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-engineer flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                <span>ส่วนใต้น้ำ: Non-Functional Requirements (NFR)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-error/10 text-error font-bold">สิ่งที่ทำให้ระบบไม่ล่ม</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-base-100/90 rounded-lg">
                <b className="text-engineer block">Performance</b>
                <span className="text-[11px] text-base-content-muted">ตอบสนอง &lt;200ms แม้มี 10,000 req/sec</span>
              </div>
              <div className="p-2 bg-base-100/90 rounded-lg">
                <b className="text-engineer block">Security</b>
                <span className="text-[11px] text-base-content-muted">เข้ารหัสข้อมูล, ป้องกัน SQL Injection, PDPA</span>
              </div>
              <div className="p-2 bg-base-100/90 rounded-lg">
                <b className="text-engineer block">Availability</b>
                <span className="text-[11px] text-base-content-muted">Uptime 99.95% มีระบบ Auto-failover</span>
              </div>
              <div className="p-2 bg-base-100/90 rounded-lg">
                <b className="text-engineer block">Audit Log</b>
                <span className="text-[11px] text-base-content-muted">บันทึกทุกการโอนเงินเพื่อตรวจสอบย้อนหลัง</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 5: Monolith vs Microservices & API Gateway (failure blast radius)
  // =========================================================================
  if (chapterId === 's5') {
    const svcOk = 'bg-base-100 border-success/25';
    return (
      <div className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-base-100 border border-base-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🧩</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-base-content">
                  Monolith vs Microservices: เมื่อ Payment ล่ม
                </h4>
                <p className="text-[11px] text-base-content-muted">
                  ลองทำให้ส่วนตัดเงินพัง แล้วดูว่าแต่ละแบบเสียหายกว้างแค่ไหน
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex rounded-xl bg-base-300 p-1">
                <button
                  onClick={() => { setArchMode('monolith'); setPaymentFailed(false); }}
                  className={`${TAP} px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    archMode === 'monolith' ? 'bg-engineer text-engineer-content shadow-xs' : 'text-base-content-secondary'
                  }`}
                >
                  1. Monolith
                </button>
                <button
                  onClick={() => { setArchMode('microservices'); setPaymentFailed(false); }}
                  className={`${TAP} px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    archMode === 'microservices' ? 'bg-engineer text-engineer-content shadow-xs' : 'text-base-content-secondary'
                  }`}
                >
                  2. Microservices
                </button>
              </div>

              <button
                onClick={() => setPaymentFailed(!paymentFailed)}
                className={`${TAP} px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  paymentFailed 
                    ? 'bg-error text-error-content shadow-xs' 
                    : 'bg-base-300 text-base-content-body hover:bg-base-border'
                }`}
              >
                {paymentFailed ? '↺ กู้ Payment กลับมา' : '⚡ จำลอง Payment ล่ม'}
              </button>
            </div>
          </div>

          {/* Architecture Display */}
          {archMode === 'monolith' ? (
            <div className={`p-4 rounded-2xl border transition-all ${
              paymentFailed 
                ? 'bg-error/10 border-error text-error' 
                : 'bg-base-300 border-base-border'
            }`}>
              <div className="flex justify-between items-center mb-3 gap-2 flex-wrap">
                <span className="font-bold text-xs uppercase tracking-wider text-base-content-muted">
                  Monolith: แอปก้อนเดียว Deploy ก้อนเดียว
                </span>
                {paymentFailed ? (
                  <span className="px-2 py-0.5 rounded bg-error text-error-content text-[10px] font-bold">
                    💥 Deploy ก้อนเดียว พังพร้อมกันทั้งระบบ
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold">
                    ● ระบบทำงานปกติ
                  </span>
                )}
              </div>

              <div className="p-4 rounded-xl border border-dashed border-base-border-strong bg-base-100/90 text-center space-y-2">
                <div className="text-xs font-bold text-base-content">
                  📦 Monolith Application (User + Order + Payment + Inventory อยู่ในโปรแกรมเดียวกัน)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                  <div className={`p-2 rounded-lg ${paymentFailed ? 'bg-error/10 text-error' : 'bg-base-300'}`}>
                    1. จัดการสมาชิก
                  </div>
                  <div className={`p-2 rounded-lg ${paymentFailed ? 'bg-error/10 text-error' : 'bg-base-300'}`}>
                    2. สั่งสินค้า
                  </div>
                  <div className={`p-2 rounded-lg font-bold ${paymentFailed ? 'bg-error text-error-content animate-pulse' : 'bg-warning/10 text-warning'}`}>
                    3. ตัดบัตร (Payment) {paymentFailed && '🔥 ล่ม'}
                  </div>
                  <div className={`p-2 rounded-lg ${paymentFailed ? 'bg-error/10 text-error' : 'bg-base-300'}`}>
                    4. ตัดสต็อก
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-base-content-muted mt-2">
                {paymentFailed 
                  ? '⚠️ ผลกระทบ: โค้ดตัดบัตรมี Memory Leak จนโปรแกรมทั้งก้อนดับ ลูกค้าล็อกอินหรือดูสินค้าไม่ได้เลย' 
                  : '💡 จุดเด่น: สร้างง่าย ส่งของได้เร็วช่วงแรก แต่ส่วนหนึ่งพังอาจลากทั้งระบบลงไปด้วย'}
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-base-300 border border-base-border space-y-3">
              <div className="flex justify-between items-center gap-2 flex-wrap">
                <span className="font-bold text-xs uppercase tracking-wider text-engineer">
                  Microservices &amp; API Gateway
                </span>
                {paymentFailed ? (
                  <span className="px-2 py-0.5 rounded bg-warning text-warning-content text-[10px] font-bold">
                    ⚠️ เสียบางส่วน: ดูสินค้าได้ แต่จ่ายเงินไม่ได้
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold">
                    ● ทุก Service ทำงานปกติ
                  </span>
                )}
              </div>

              {/* API Gateway */}
              <div className="p-2.5 rounded-xl bg-data-2 text-data-content text-center text-xs font-bold shadow-xs">
                🚪 API Gateway (ประตูเดียวรับคำขอจาก Mobile/Web ส่งต่อให้แต่ละ Service และตรวจ Rate Limit)
              </div>

              {/* Independent services */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div className={`p-3 rounded-xl border text-center space-y-1 ${svcOk}`}>
                  <span className="text-base">👤</span>
                  <div className="font-bold text-success">User Service</div>
                  <span className="text-[10px] text-success">● ล็อกอินได้</span>
                </div>

                <div className={`p-3 rounded-xl border text-center space-y-1 ${svcOk}`}>
                  <span className="text-base">📋</span>
                  <div className="font-bold text-success">Catalog Service</div>
                  <span className="text-[10px] text-success">● ค้นหาสินค้าได้</span>
                </div>

                <div className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                  paymentFailed
                    ? 'bg-warning/10 border-warning text-warning'
                    : svcOk
                }`}>
                  <span className="text-base">🛒</span>
                  <div className={`font-bold ${paymentFailed ? '' : 'text-success'}`}>Order Service</div>
                  {paymentFailed ? (
                    <span className="text-[10px] text-warning font-bold">◐ ทำงานบางส่วน (จ่ายเงินไม่ได้ชั่วคราว)</span>
                  ) : (
                    <span className="text-[10px] text-success">● สั่งซื้อได้</span>
                  )}
                </div>

                <div className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                  paymentFailed 
                    ? 'bg-error/10 border-error text-error' 
                    : svcOk
                }`}>
                  <span className="text-base">💳</span>
                  <div className={`font-bold ${paymentFailed ? '' : 'text-success'}`}>Payment Service</div>
                  {paymentFailed ? (
                    <span className="text-[10px] text-error font-bold">🔥 ล่ม</span>
                  ) : (
                    <span className="text-[10px] text-success">● ตัดบัตรได้</span>
                  )}
                </div>

                <div className={`p-3 rounded-xl border text-center space-y-1 col-span-2 sm:col-span-1 ${svcOk}`}>
                  <span className="text-base">📦</span>
                  <div className="font-bold text-success">Inventory Service</div>
                  <span className="text-[10px] text-success">● เช็คสต็อกได้</span>
                </div>
              </div>

              <p className="text-[11px] text-base-content-muted">
                {paymentFailed 
                  ? '✅ บทเรียน: Payment ล่ม แต่ลูกค้ายังล็อกอิน ค้นหา และหยิบใส่ตะกร้าได้ ขั้นจ่ายเงินเท่านั้นที่ต้องรอ ทีมต้องออกแบบไว้ล่วงหน้าว่าช่วงนั้นจะบอกลูกค้าอย่างไร' 
                  : '💡 สิ่งที่ต้องแลก: Microservices ซับซ้อนกว่าและต้นทุนดูแลสูงกว่า จึงคุ้มเมื่อระบบและทีมเริ่มใหญ่'}
              </p>
            </div>
          )}
        </div>
        {/* Sync vs Async simulator (moved from former chapter 15 diagram), closed by default */}
        <details className="group rounded-2xl bg-base-100 border border-base-border overflow-hidden">
          <summary className={`${TAP_Y} flex items-center justify-between gap-2 p-3.5 sm:p-4 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden bg-base-300 hover:bg-base-300 transition-colors`}>
            <span className="text-xs sm:text-sm font-bold text-base-content">
              Sync vs Async: Polling / Webhook / WebSocket
            </span>
            <ChevronDown className="w-4 h-4 shrink-0 text-base-content-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="p-3 sm:p-4 border-t border-base-border">
            <ProtocolSimulator />
          </div>
        </details>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 6: Agile Delivery & Quality Gates
  // =========================================================================
  if (chapterId === 's6') {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-2xl border border-base-border bg-base-100 space-y-3">
          <span className="text-xs font-bold text-engineer uppercase tracking-wider">
            The Two Gates: Definition of Ready (DoR) vs Definition of Done (DoD)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/25 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-warning">
                <CheckCircle2 className="w-4 h-4" />
                <span>Gate 1: Definition of Ready (DoR)</span>
              </div>
              <p className="text-[11px] text-base-content-secondary">
                <b>"พร้อมหยิบเข้าทำ":</b> สเปกนิ่ง มี Acceptance Criteria ครบ มีดีไซน์พร้อม และทีม Dev เข้าใจตรงกัน ไม่มีบล็อกเกอร์ค้าง
              </p>
            </div>

            <div className="p-3 rounded-xl bg-success/10 border border-success/25 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-success">
                <CheckCircle2 className="w-4 h-4" />
                <span>Gate 2: Definition of Done (DoD)</span>
              </div>
              <p className="text-[11px] text-base-content-secondary">
                <b>"เสร็จจริงไม่ใช่แค่โค้ดเสร็จ":</b> ผ่าน Code Review, เทสต์ผ่านทั้งหมด + Coverage ตามเกณฑ์ทีม, Deploy บน Staging ตรวจแล้ว, และเอกสารถูกอัปเดต
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 7: Testing Pyramid
  // =========================================================================
  if (chapterId === 's7') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setPyramidLevel('e2e')}
            className={`${TAP} p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              pyramidLevel === 'e2e' ? 'border-error bg-error/10 shadow-xs' : 'border-base-border'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs text-error">E2E / UI Tests (10%)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-error/15 text-error">ช้า &amp; แพง</span>
            </div>
            <p className="text-[11px] text-base-content-muted">จำลองเปิดเบราว์เซอร์คลิกเหมือนคนจริง เปราะ พังง่ายเมื่อ UI เปลี่ยน</p>
          </button>

          <button
            onClick={() => setPyramidLevel('integration')}
            className={`${TAP} p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              pyramidLevel === 'integration' ? 'border-engineer bg-engineer/10 shadow-xs' : 'border-base-border'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs text-engineer">Integration Tests (20%)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-engineer/15 text-engineer">ปานกลาง</span>
            </div>
            <p className="text-[11px] text-base-content-muted">ทดสอบการเชื่อมต่อระหว่าง API กับ Database หรือ Service ภายนอก</p>
          </button>

          <button
            onClick={() => setPyramidLevel('unit')}
            className={`${TAP} p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              pyramidLevel === 'unit' ? 'border-success bg-success/10 shadow-xs' : 'border-base-border'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-xs text-success">Unit Tests (70%)</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/15 text-success">เร็ว &amp; ถูก</span>
            </div>
            <p className="text-[11px] text-base-content-muted">ทดสอบฟังก์ชันคำนวณย่อยๆ ในโค้ด รันหลักพันข้อเสร็จในไม่กี่วินาที</p>
          </button>
        </div>

        <div className="p-3 bg-base-300 rounded-xl text-xs text-base-content-secondary flex items-center justify-between">
          <span>⚠️ <b>Ice-Cream Cone Anti-pattern:</b> ถ้าทีมมีแต่ E2E test แต่ไม่มี Unit test บิลด์จะช้าเป็นชั่วโมงและไม่มีใครกล้าปล่อยของ</span>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 8: DevOps release gates & Canary Release
  // =========================================================================
  if (chapterId === 's8') {
    return (
      <div className="space-y-4">
        {renderReleaseTrain()}
        <div className="p-4 rounded-2xl border border-base-border bg-base-100 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-engineer uppercase tracking-wider">
              Canary Release Simulator (ปล่อยผู้ใช้ทีละกลุ่ม)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-warning">
                {canaryPercent}% Traffic ไปเวอร์ชันใหม่
              </span>
              <button
                onClick={() => setCanaryBug(!canaryBug)}
                className={`${TAP} px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  canaryBug ? 'bg-error text-error-content shadow-xs' : 'bg-base-300 text-base-content-secondary hover:bg-base-border'
                }`}
              >
                🐞 เวอร์ชันใหม่มีบั๊ก: {canaryBug ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          <div className="w-full bg-base-300 h-3 rounded-full overflow-hidden p-0.5 border border-base-border">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                canaryBug ? 'bg-error' : 'bg-gradient-to-r from-success to-engineer'
              }`}
              style={{ width: `${canaryPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex gap-1.5">
              {[5, 10, 25, 50, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setCanaryPercent(pct)}
                  className={`${TAP_Y} px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    canaryPercent === pct ? 'bg-engineer text-engineer-content' : 'bg-base-300 text-base-content-secondary'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <span className="text-[11px] text-base-content-muted">
              {canaryPercent < 100 ? '🛡️ ถ้าตัวชี้วัดเกินเกณฑ์ ระบบ Rollback อัตโนมัติ (เร็วแค่ไหนขึ้นกับว่าเช็กตัวชี้วัดถี่แค่ไหน)' : '✅ ปล่อยครบ, ปลอดภัยเพราะทุกขั้นก่อนหน้าผ่านเกณฑ์'}
            </span>
          </div>

          {canaryBug && (
            <div className="p-3 rounded-xl bg-error/10 border border-error/25 text-xs text-error space-y-1">
              {canaryPercent < 100 ? (
                <>
                  <div className="font-bold text-error">
                    กระทบผู้ใช้แค่ {canaryPercent}% → Error พุ่งเกินเกณฑ์ → Rollback อัตโนมัติ
                  </div>
                  <p className="text-[11px] text-error">
                    อีก {100 - canaryPercent}% ยังใช้เวอร์ชันเดิมอยู่และไม่เจอบั๊กเลย ยิ่งเริ่มจากกลุ่มเล็ก ยิ่งเสียหายน้อย
                  </p>
                </>
              ) : (
                <div className="font-bold text-error">
                  ถ้าเวอร์ชันนี้มีบั๊ก ระบบจะ Rollback ไปตั้งแต่ขั้นแรกแล้ว จึงไม่มีทางมาถึง 100%
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 9: Barry Boehm's Cost of Change Curve
  // =========================================================================
  if (chapterId === 's9') {
    const boehmData = [
      { phase: 'Requirement', cost: 'ถูกสุด', desc: 'แก้คำในเอกสาร ลบข้อความแล้วพิมพ์ใหม่' },
      { phase: 'Design/Prototype', cost: 'ยังถูก', desc: 'แก้ Flow ใน Figma และแจ้งทีมปรับความเข้าใจ' },
      { phase: 'Coding', cost: 'เริ่มแพง', desc: 'แก้โครงสร้าง Logic และแก้ Unit Tests ที่เขียนไปแล้ว' },
      { phase: 'QA Testing', cost: 'แพง', desc: 'ต้อง Re-test ทั้งระบบ ตก Sprint และเลื่อนวันส่งมอบ' },
      { phase: 'Live Production', cost: 'แพงสุด', desc: 'ข้อมูลลูกค้าพัง ระบบล่ม เสียชื่อเสียง และต้องออก Hotfix เร่งด่วน' },
    ];

    return (
      <div className="space-y-4">
        <div className="text-xs text-base-content-muted">
          ยิ่งเจอบั๊กหรือเปลี่ยนใจช้า ต้นทุนการแก้ยิ่งสูง ตัวคูณที่อ้างกันบ่อย (เช่น 100 เท่า) มาจากงานวิจัยยุคเก่าและเชื่อได้แค่ทิศทาง ไม่ใช่ตัวเลข
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {boehmData.map((b, idx) => (
            <button
              key={idx}
              onClick={() => setBoehmPhase(idx)}
              className={`${TAP} p-3 rounded-xl border text-left transition-all cursor-pointer ${
                boehmPhase === idx
                  ? 'border-error bg-error/10 shadow-xs'
                  : 'border-base-border bg-base-300'
              }`}
            >
              <span className="text-[10px] text-base-content-muted block">{idx + 1}. {b.phase}</span>
              <span className="font-bold text-xs text-error">{b.cost}</span>
            </button>
          ))}
        </div>
        <div className="p-3 bg-neutral text-neutral-content rounded-xl text-xs space-y-1">
          <div className="text-error font-bold">เจอตอน: {boehmData[boehmPhase].phase} ({boehmData[boehmPhase].cost})</div>
          <p className="text-base-content-subtle">{boehmData[boehmPhase].desc}</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 10: Feedback Loop
  // =========================================================================
  if (chapterId === 's10') {
    return (
      <div className="p-4 rounded-2xl border border-base-border bg-base-100 space-y-3">
        <span className="text-xs font-bold text-engineer uppercase tracking-wider">
          Closed-Loop Support &amp; Incident Escalation (L1 ➔ L2 ➔ L3)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-base-300 border border-base-border">
            <b className="text-base-content block mb-1">Tier 1: Customer Support</b>
            <p className="text-[11px] text-base-content-muted">ตอบคำถามทั่วไป แก้ปัญหาเบื้องต้นตามคู่มือ ถ้าแก้ไม่ได้ส่งต่อ L2</p>
          </div>
          <div className="p-3 rounded-xl bg-base-300 border border-base-border">
            <b className="text-base-content block mb-1">Tier 2: Tech Support / Ops</b>
            <p className="text-[11px] text-base-content-muted">ตรวจสอบ Log, สิทธิ์ผู้ใช้งาน, ข้อมูลใน Database และยืนยันบั๊ก</p>
          </div>
          <div className="p-3 rounded-xl bg-engineer/10 border border-engineer/25">
            <b className="text-engineer block mb-1">Tier 3: Engineering Team</b>
            <p className="text-[11px] text-base-content-secondary">ไล่ดู Code, ออกแบบ Hotfix และใส่บั๊กเข้า Product Backlog</p>
          </div>
        </div>
        {/* Return leg: without it the "loop" is just a one-way escalation */}
        <div className="p-3 rounded-xl bg-success/10 border border-success/25 text-xs flex items-start gap-2">
          <RotateCcw className="w-4 h-4 shrink-0 mt-0.5 text-success" />
          <div>
            <b className="text-success block mb-0.5">ปิดวงจร: แก้เสร็จ → L1 แจ้งลูกค้า → อัปเดต FAQ/Runbook</b>
            <p className="text-[11px] text-base-content-secondary">ครั้งหน้าที่เจอเรื่องเดิม L1 ตอบได้เองโดยไม่ต้องส่งต่อ</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 11: The Interactive Iron Triangle Simulator
  // =========================================================================
  if (chapterId === 's11') {
    // Qualitative pressure model: no real defect rate exists, so the output is a
    // level, not a percentage. Headcount has diminishing returns (Brooks's law):
    // effective team output flattens after scale 3.
    const TEAM_OUTPUT = [1, 1.8, 2.4, 2.6, 2.7];
    const pressure = (scopeVal * 1.5) / (timeVal * TEAM_OUTPUT[costVal - 1]);
    // One set of thresholds drives the badge, the meter, the advice and the triangle.
    const PRESSURE_LEVELS = [
      { max: 6, label: 'ต่ำ', text: '✨ คุณภาพสูงสุด (Pristine Quality)', color: 'text-success', bg: 'bg-success/10 border-success/25', stroke: 'var(--color-success)', core: 'var(--color-success)' },
      { max: 18, label: 'ปานกลาง', text: '⚖️ สมดุลใช้งานได้จริง (Production Balanced)', color: 'text-engineer', bg: 'bg-engineer/10 border-engineer/25', stroke: 'var(--color-engineer)', core: 'var(--color-success)' },
      { max: 35, label: 'สูง', text: '⚠️ หนี้ทางเทคนิคสะสมสูง (High Tech Debt)', color: 'text-warning', bg: 'bg-warning/10 border-warning/25', stroke: 'var(--color-warning)', core: 'var(--color-warning)' },
      { max: Infinity, label: 'สูงมาก', text: '💥 วิกฤติบั๊กล้นระบบ (System Meltdown Risk)', color: 'text-error', bg: 'bg-error/10 border-error/25', stroke: 'var(--color-error)', core: 'var(--color-error)' },
    ];
    const levelIdx = PRESSURE_LEVELS.findIndex((l) => pressure <= l.max);
    const level = PRESSURE_LEVELS[levelIdx];
    const isDanger = levelIdx >= 2;

    return (
      <div className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-base-100 border border-base-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🔺</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-base-content">
                  The Interactive Iron Triangle Simulator
                </h4>
                <p className="text-[11px] text-base-content-muted">
                  ลองเลื่อน 3 ด้าน แล้วดูว่าแรงกดดันต่อคุณภาพขึ้นหรือลง (ภาพเชิงเปรียบเทียบ ไม่ใช่ตัวเลขจริง)
                </p>
              </div>
            </div>

            <span className={`text-xs px-2.5 py-1 rounded-xl font-bold border ${level.bg} ${level.color}`}>
              {level.text}
            </span>
          </div>

          {/* 3 Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Scope */}
            <div className="p-3 rounded-xl bg-base-300 border border-base-border space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-warning">1. Scope (ปริมาณฟีเจอร์)</span>
                <span className="font-bold text-base-content-body">{scopeVal}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                step="5"
                value={scopeVal}
                onChange={(e) => setScopeVal(Number(e.target.value))}
                className="w-full accent-warning cursor-pointer"
              />
              <span className="text-[10px] text-base-content-muted block">
                {scopeVal > 80 ? 'ฟีเจอร์แน่นเอี๊ยดทุกหน้า' : scopeVal > 50 ? 'ขนาดกำลังดี' : 'เน้นเฉพาะ MVP แกนหลัก'}
              </span>
            </div>

            {/* Time */}
            <div className="p-3 rounded-xl bg-base-300 border border-base-border space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-data-1">2. Time (ระยะเวลาส่งมอบ)</span>
                <span className="font-bold text-base-content-body">{timeVal} เดือน</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={timeVal}
                onChange={(e) => setTimeVal(Number(e.target.value))}
                className="w-full accent-data-1 cursor-pointer"
              />
              <span className="text-[10px] text-base-content-muted block">
                {timeVal <= 1 ? 'ไฟลนก้น เร่งด่วนสุดขีด' : timeVal <= 3 ? 'ระยะเวลามาตรฐาน' : 'มีเวลาเก็บงานและทดสอบ'}
              </span>
            </div>

            {/* Cost / Headcount */}
            <div className="p-3 rounded-xl bg-base-300 border border-base-border space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-bold text-data-2">3. Cost (คนและงบประมาณ)</span>
                <span className="font-bold text-base-content-body">{costVal} สเกล</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={costVal}
                onChange={(e) => setCostVal(Number(e.target.value))}
                className="w-full accent-data-2 cursor-pointer"
              />
              <span className="text-[10px] text-base-content-muted block">
                {costVal <= 1 ? 'Dev ทำงานคนเดียว' : costVal <= 3 ? 'ทีมเล็ก' : 'ทีมใหญ่ขึ้น แต่ได้งานเพิ่มไม่มาก'}
              </span>
            </div>
          </div>

          {/* Real-time Triangle Visual & Metrics */}
          <div className="p-4 rounded-2xl bg-neutral text-neutral-content flex flex-col sm:flex-row items-center justify-between gap-4 border border-neutral">
            <div className="space-y-1.5 text-xs text-center sm:text-left">
              <div className="text-base-content-muted">แรงกดดันต่อคุณภาพ:</div>
              <div className={`text-2xl sm:text-3xl font-bold flex items-center justify-center sm:justify-start gap-2 ${level.color}`}>
                <span>{level.label}</span>
                <span className="flex gap-1" aria-hidden="true">
                  {PRESSURE_LEVELS.map((l, i) => (
                    <span
                      key={l.label}
                      className="w-4 h-2 rounded-sm"
                      style={{ backgroundColor: i <= levelIdx ? level.stroke : 'var(--color-base-border-strong)' }}
                    />
                  ))}
                </span>
              </div>
              <p className="text-[11px] text-base-content-muted max-w-md">
                {isDanger 
                  ? '⚠️ แรงกดดันสูงเกินไป ทางที่ได้ผลคือตัด Scope ที่ไม่จำเป็นหรือขยายเวลา การเติมคนกลางทางมักทำให้ช้าลง (Brooks\'s law) เพราะคนใหม่ต้องเรียนรู้และคนเดิมต้องเสียเวลาสอน' 
                  : '✅ ทีมยังคุมคุณภาพโค้ดและเทสต์ได้ครบ'}
              </p>
              {costVal >= 4 && (
                <p className="text-[11px] text-warning max-w-md">
                  💡 เพิ่มคนเกินจุดหนึ่งแทบไม่ได้งานเพิ่ม เพราะต้องประสานงานกันมากขึ้น
                </p>
              )}
            </div>

            {/* SVG Triangle Graphic */}
            <div className="w-36 h-32 flex items-center justify-center relative shrink-0">
              <svg viewBox="0 0 100 90" className="w-full h-full overflow-visible">
                {/* Triangle background */}
                <polygon
                  points="50,10 90,80 10,80"
                  fill={`color-mix(in oklab, ${level.stroke} 15%, transparent)`}
                  stroke={level.stroke}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                {/* Core Quality Circle: shrinks one step per pressure level */}
                <circle
                  cx="50"
                  cy="55"
                  r={18 - levelIdx * 4}
                  fill={level.core}
                  className="transition-all duration-300"
                />
                <text x="50" y="58" textAnchor="middle" className="fill-primary-content" fontSize="6" fontWeight="bold">
                  Quality
                </text>
                {/* Vertex Labels */}
                <text x="50" y="5" textAnchor="middle" className="fill-warning" fontSize="6" fontWeight="bold">Scope</text>
                <text x="5" y="88" textAnchor="start" className="fill-data-1" fontSize="6" fontWeight="bold">Time</text>
                <text x="95" y="88" textAnchor="end" className="fill-data-2" fontSize="6" fontWeight="bold">Cost</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 12: Dual-Track Agile (Discovery & Delivery, one team)
  // =========================================================================
  if (chapterId === 's12') {
    return (
      <div className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-base-100 border border-base-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">🔀</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-base-content">
                  Dual-Track Agile: ทีมเดียว สองเส้นงาน
                </h4>
                <p className="text-[11px] text-base-content-muted">
                  ทีมเดียวกันทำสองงานคู่กัน: Discovery พิสูจน์ไอเดียล่วงหน้า 1-2 Sprint ส่งงานที่ผ่านแล้วให้ Delivery สร้าง
                </p>
              </div>
            </div>

            <div className="flex rounded-xl bg-base-300 p-1">
              <button
                onClick={() => setDualTrackPhase('discovery')}
                className={`${TAP} px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dualTrackPhase === 'discovery' ? 'bg-data-3 text-data-content shadow-xs' : 'text-base-content-secondary'
                }`}
              >
                1. Discovery
              </button>
              <button
                onClick={() => setDualTrackPhase('delivery')}
                className={`${TAP} px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dualTrackPhase === 'delivery' ? 'bg-data-1 text-data-content shadow-xs' : 'text-base-content-secondary'
                }`}
              >
                2. Delivery
              </button>
              <button
                onClick={() => setDualTrackPhase('synchronized')}
                className={`${TAP} px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  dualTrackPhase === 'synchronized' ? 'bg-engineer text-engineer-content shadow-xs' : 'text-base-content-secondary'
                }`}
              >
                3. ทำคู่ขนาน
              </button>
            </div>
          </div>

          {/* Two tracks, same team */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className={`p-4 rounded-xl border transition-all ${
              dualTrackPhase === 'discovery' || dualTrackPhase === 'synchronized'
                ? 'bg-data-3/10 border-data-3/25'
                : 'bg-base-300 border-base-border opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <b className="text-data-3 font-bold flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>Track 1: Discovery (ล่วงหน้า Sprint N+1)</span>
                </b>
                <span className="text-[10px] px-2 py-0.5 rounded bg-data-3/10 text-data-3">
                  เน้นหาคำตอบ
                </span>
              </div>
              <p className="text-[11px] text-base-content-secondary mb-2">
                PM + Designer นำ โดยมี Dev ร่วมประเมินความเป็นไปได้: สัมภาษณ์ลูกค้า ทำ Prototype ทดสอบว่า "มีคนต้องการฟีเจอร์นี้จริงไหม"
              </p>
              <div className="p-2 rounded-lg bg-base-100/90 text-[10px] text-data-3">
                ผลที่ได้: Validated Backlog + ชัดเจนเรื่อง Acceptance Criteria
              </div>
            </div>

            <div className={`p-4 rounded-xl border transition-all ${
              dualTrackPhase === 'delivery' || dualTrackPhase === 'synchronized'
                ? 'bg-data-1/10 border-data-1/25'
                : 'bg-base-300 border-base-border opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <b className="text-data-1 font-bold flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4" />
                  <span>Track 2: Delivery (Sprint ปัจจุบัน N)</span>
                </b>
                <span className="text-[10px] px-2 py-0.5 rounded bg-data-1/10 text-data-1">
                  เน้นสร้างของจริง
                </span>
              </div>
              <p className="text-[11px] text-base-content-secondary mb-2">
                ทีมเดียวกัน (Dev + QA เป็นแกน) หยิบงานที่ผ่าน Discovery แล้วมาสร้างโค้ดระดับ Production เขียน Automated Test และ Deploy
              </p>
              <div className="p-2 rounded-lg bg-base-100/90 text-[10px] text-data-1">
                ผลที่ได้: ซอฟต์แวร์ที่ใช้งานได้และผ่านการทดสอบ
              </div>
            </div>
          </div>

          <div className="p-3 bg-base-300 rounded-xl text-xs text-base-content-secondary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span><b>หลักง่ายๆ:</b> อย่าเริ่มสร้างงานระดับ production ก่อน validate ไอเดียนั้น ถ้ายังไม่แน่ใจ ให้ทดสอบด้วย Prototype ที่ทิ้งได้ถูกๆ ก่อน</span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 13: AI in SDLC Transformation
  // =========================================================================
  if (chapterId === 's13') {
    return (
      <div className="space-y-3">
        <div className="p-4 rounded-2xl border border-base-border bg-base-100 space-y-3">
          <span className="text-xs font-bold text-data-2 uppercase tracking-wider flex items-center gap-1.5">
            <Bot className="w-4 h-4" />
            <span>SDLC ที่เปลี่ยนไปในยุค AI (2026+)</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-base-300">
              <b className="text-base-content-body block mb-1">สิ่งที่ AI ทำแทนได้รวดเร็ว:</b>
              <span className="text-[11px] text-base-content-muted">เขียน Boilerplate Code, เขียน Unit Test ตามสเปก, แปลง Figma เป็น HTML</span>
            </div>
            <div className="p-3 rounded-xl bg-data-2/10 border border-data-2/25">
              <b className="text-data-2 block mb-1">คอขวดใหม่ที่อยู่ที่คน:</b>
              <span className="text-[11px] text-base-content-secondary">เขียน Prompt/Spec ให้ไม่มีช่องโหว่, ตรวจ Security และ Architecture</span>
            </div>
            <div className="p-3 rounded-xl bg-engineer/10 border border-engineer/25">
              <b className="text-engineer block mb-1">ทักษะที่แพงที่สุด:</b>
              <span className="text-[11px] text-base-content-secondary">Domain Judgment: เข้าใจโจทย์ธุรกิจ และเลือก Trade-off เทคโนโลยีที่คุ้มค่า</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // s1 (Q4: its release train moved to s8), s14 (Q6: the hero replaced its text cards)
  // and s15 (glossary map) have no widget here. Keep DIAGRAM_WIDGET_CHAPTERS in sync.
  return null;
};
