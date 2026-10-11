import React, { useState } from 'react';
import { ProtocolSimulator } from './ProtocolSimulator';
import { ArrowDown, ArrowRight, Layers, Shield, Database, Smartphone, Globe, Server, CheckCircle2, AlertTriangle, GitBranch, TrendingUp, Flame, Sliders, FileText, Bot, Lock, Gauge, HelpCircle, Eye, Activity, Play, RotateCcw, Send, Check, Compass, FileCode2, Users, AlertCircle } from 'lucide-react';
import { TAP, TAP_Y } from './ui/tapTarget';
import { DISCLOSURE_SUMMARY, DisclosureChevron } from './ui/Disclosure';
import { TABS_LAYOUT } from './ui/Tabs';
import { chipClass } from './ui/ToggleChip';

interface ChapterDiagramProps {
  chapterId: string;
}

// DiagramSection draws no frame around the widget, so each widget draws exactly one: this one.
const FRAME = 'rounded-box border border-base-border p-box-spacious space-y-6';
const RULE = 'border-t border-base-border pt-6';
const TITLE = 'font-semibold text-base-content';
const HINT = 'text-sm text-base-content-muted';
const LABEL = 'text-sm text-base-content-muted';
const FOCUS = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';
const RANGE = `h-11 w-full cursor-pointer accent-primary ${FOCUS}`;
const FOLD_SUMMARY = `${TAP_Y} flex cursor-pointer select-none list-none items-center justify-between gap-2 py-3 [&::-webkit-details-marker]:hidden ${FOCUS}`;

const WidgetHead: React.FC<{ title: string; hint?: string; children?: React.ReactNode }> = ({ title, hint, children }) => (
  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
    <div className="min-w-0 max-w-[34rem]">
      <h3 className={TITLE}>{title}</h3>
      {hint && <p className={HINT}>{hint}</p>}
    </div>
    {children}
  </div>
);

/** A toggle whose state is written out, so colour never carries it alone. */
const SwitchChip: React.FC<{ label: string; on: boolean; onToggle: () => void }> = ({ label, on, onToggle }) => (
  <button type="button" aria-pressed={on} onClick={onToggle} className={chipClass({ selected: on, size: 'md' })}>
    {label}
    <span className="text-base-content-muted">{on ? 'เปิด' : 'ปิด'}</span>
  </button>
);

/** A group of switch buttons joined into one segmented control. */
const Segmented: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div role="group" aria-label={label} className={TABS_LAYOUT.segmented.group}>{children}</div>
);
const segment = (selected: boolean) => ({ selected, shape: 'segment', size: 'md', tap: 'y' }) as const;

type Tone = 'success' | 'warning' | 'error';
const DOT: Record<Tone, string> = { success: 'bg-success', warning: 'bg-warning', error: 'bg-error' };
const TONE_TEXT: Record<Tone, string> = { success: 'text-success', warning: 'text-warning', error: 'text-error' };

/** A status word with a dot, so the state reads without the colour. */
const StatusWord: React.FC<{ tone: Tone; children: React.ReactNode }> = ({ tone, children }) => (
  <span className={`inline-flex items-center gap-1.5 font-semibold ${TONE_TEXT[tone]}`}>
    <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[tone]}`} aria-hidden="true" />
    {children}
  </span>
);

export const ChapterDiagram: React.FC<ChapterDiagramProps> = ({ chapterId }) => {
  // Common states
  const [canaryPercent, setCanaryPercent] = useState<number>(5);
  const [canaryBug, setCanaryBug] = useState<boolean>(false);
  const [pyramidLevel, setPyramidLevel] = useState<'unit' | 'integration' | 'e2e'>('unit');
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
      { name: 'Automated CI', role: 'เทสต์อัตโนมัติ', passText: 'รัน Unit Test และ Security Scan ทุกครั้ง', skippedText: 'ไม่มีเทสต์อัตโนมัติรันเลย', risk: 'จับตรรกะผิดได้เร็วและถูกที่สุด' },
      { name: 'Staging', role: 'QA ทดสอบรวมระบบ', passText: 'ทดสอบบนระบบที่ใกล้ของจริง', risk: 'เจอปัญหาการเชื่อมกับระบบภายนอก' },
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
      <div className="space-y-6">
        <WidgetHead
          title="เส้นทางของโค้ดก่อนถึงผู้ใช้"
          hint="คลิกแต่ละด่านเพื่อดูว่าโค้ดผ่านอะไรมาบ้าง แล้วลองข้าม Review และเทสต์"
        >
          <SwitchChip
            label="ข้าม Review และเทสต์"
            on={skipChecks}
            onToggle={() => {
              // Keep the selected gate; re-evaluate it under the new mode.
              setSkipChecks(!skipChecks);
              if (routeStatus !== 'idle') setRouteStatus(statusAt(routeGate, !skipChecks));
            }}
          />
        </WidgetHead>

        {/* Gates with connectors (connectors hidden on the 2-column phone grid) */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 sm:gap-4">
          {gates.map((g, idx) => {
            const skipped = isSkipped(idx, skipChecks);
            const isCurrent = routeGate === idx;
            const isPassed = routeGate > idx && !skipped;
            const tone =
              isCurrent && routeStatus === 'incident'
                ? 'border-error bg-base-300'
                : isCurrent && routeStatus === 'caught'
                ? 'border-warning bg-base-300'
                : isCurrent
                ? 'border-base-content bg-base-300'
                : skipped
                ? 'border-dashed border-base-border-strong text-base-content-muted'
                : isPassed
                ? 'border-base-border-strong text-base-content-body'
                : 'border-base-border text-base-content-secondary';
            return (
              <div key={idx} className="relative">
                <button
                  type="button"
                  onClick={() => selectGate(idx)}
                  aria-pressed={isCurrent}
                  className={`${TAP} flex h-full w-full cursor-pointer flex-col gap-0.5 rounded-field border p-3 text-left transition-colors ${FOCUS} ${tone}`}
                >
                  <span className="flex flex-wrap items-center justify-between gap-x-2 text-[13px] leading-5">
                    <span className="text-base-content-muted">ด่าน {idx + 1}</span>
                    {skipped ? (
                      <span className="font-semibold text-base-content-muted">ถูกข้าม</span>
                    ) : isCurrent && routeStatus === 'incident' ? (
                      <span className="font-semibold text-error">เกิดเหตุ</span>
                    ) : isCurrent && routeStatus === 'caught' ? (
                      <span className="font-semibold text-warning">จับบั๊กได้</span>
                    ) : isCurrent ? (
                      <span className="font-semibold text-base-content">อยู่ที่นี่</span>
                    ) : isPassed ? (
                      <span className="inline-flex items-center gap-0.5 font-semibold text-success">
                        <Check className="h-3.5 w-3.5" aria-hidden="true" /> ผ่าน
                      </span>
                    ) : (
                      <span className="text-base-content-muted">ยังไม่ถึง</span>
                    )}
                  </span>
                  <span className={`text-sm font-semibold leading-5 ${skipped ? 'line-through' : ''}`}>{g.name}</span>
                  <span className={`text-[13px] leading-5 text-base-content-muted ${skipped ? 'line-through' : ''}`}>{g.role}</span>
                </button>
                {idx < gates.length - 1 && (
                  <div className="pointer-events-none absolute left-full top-1/2 hidden w-4 -translate-y-1/2 justify-center sm:flex" aria-hidden="true">
                    <ArrowRight className={`h-3.5 w-3.5 ${routeGate > idx ? 'text-base-content' : 'text-base-content-subtle'}`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Outcome */}
        <div className="space-y-1" aria-live="polite">
          {routeStatus === 'incident' ? (
            <>
              <p className="font-semibold text-base-content">
                <span className="text-error">เกิดเหตุบน Production</span> บั๊กหลุดถึงผู้ใช้จริง
              </p>
              <p>
                ข้าม Review และเทสต์อัตโนมัติ แล้ว Staging ก็ไม่เจอ (บางบั๊กโผล่เฉพาะกับข้อมูลจริง) ลูกค้าเจอก่อนทีม ต้อง Rollback และแก้ด่วน เคส Knight Capital เสียไปราว 440 ล้านดอลลาร์ในไม่ถึงชั่วโมง
              </p>
            </>
          ) : routeStatus === 'caught' ? (
            <>
              <p className="font-semibold text-base-content">
                <span className="text-warning">จับได้ก่อนถึงผู้ใช้</span> บั๊กโผล่ที่ Staging
              </p>
              <p>
                ด่านสุดท้ายก่อน Production ช่วยไว้ แต่ต้องย้อนกลับไปแก้ ซึ่งช้าและแพงกว่าจับได้ตั้งแต่ Review หรือ CI
              </p>
            </>
          ) : routeStatus === 'success' ? (
            <>
              <p className="font-semibold text-base-content">
                <span className="text-success">ถึงผู้ใช้อย่างปลอดภัย</span>
              </p>
              <p>
                ผ่าน Code Review, เทสต์อัตโนมัติ และทดสอบบน Staging ครบทุกด่าน ผู้ใช้ได้ฟีเจอร์ใหม่โดยระบบไม่ล่ม
              </p>
            </>
          ) : isSkipped(routeGate, skipChecks) ? (
            <>
              <p><span className="font-semibold text-base-content">ด่าน {current.name} ถูกข้าม</span> {current.skippedText}</p>
              <p><span className={LABEL}>ความเสี่ยง</span> {current.risk}</p>
            </>
          ) : (
            <>
              <p><span className="font-semibold text-base-content">ด่านปัจจุบัน {current.name}</span> {current.passText}</p>
              <p><span className={LABEL}>ความเสี่ยง</span> {current.risk}</p>
            </>
          )}
        </div>
      </div>
    );
  };

  // =========================================================================
  // CHAPTER 2: MoSCoW & RICE Matrix
  // =========================================================================
  if (chapterId === 's2') {
    const moscow = [
      { letter: 'M', name: 'Must Have', text: 'ขาดแล้วระบบใช้งานไม่ได้เลย หรือผิดกฎหมาย เช่น ชำระเงิน' },
      { letter: 'S', name: 'Should Have', text: 'สำคัญมาก แต่ยังมีทางเลี่ยงชั่วคราวได้ เช่น ใบเสร็จ PDF' },
      { letter: 'C', name: 'Could Have', text: 'ถ้ามีเวลาเหลือจะทำ ช่วยเพิ่มความประทับใจ เช่น Dark mode' },
      { letter: 'W', name: "Won't Have", text: 'ตัดทิ้งชัดเจนในรอบนี้ ไม่นำมาเปลืองสมาธิทีม' },
    ];
    const rice = [
      { term: 'Reach', text: 'ผู้ใช้ที่โดนผลกระทบต่อเดือน (เช่น 5,000 คน)' },
      { term: 'Impact', text: 'น้ำหนักผลลัพธ์ (3=สูงสุด, 2=สูง, 1=ปานกลาง, 0.5=ต่ำ)' },
      { term: 'Confidence', text: 'ความมั่นใจในข้อมูล (100%, 80%, 50%)' },
      { term: 'Effort', text: 'แรงทีม Dev วัดเป็น Person-Months เช่น 2 คน-เดือน' },
    ];
    return (
      <div className={FRAME}>
        <div className="space-y-3">
          <WidgetHead
            title="MoSCoW จัดกลุ่มตามความจำเป็น"
            hint="ไม่มีโควตาตายตัว แต่ Must ไม่ควรเกิน ~60% ของงานรอบนี้ ที่เหลือคือกันชนไว้ตัดเมื่องานบานปลาย"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {moscow.map(m => (
              <div key={m.letter} className="rounded-field border border-base-border p-3">
                <p className="font-semibold text-base-content">
                  <span className="mr-1.5 text-base-content-muted">{m.letter}</span>
                  {m.name}
                </p>
                <p className="text-sm text-base-content-secondary">{m.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={`${RULE} space-y-3`}>
          <h3 className={TITLE}>RICE ให้คะแนนตามสูตร</h3>
          <p className="text-center font-semibold text-base-content">Score = (Reach × Impact × Confidence) ÷ Effort</p>
          <dl className="grid gap-x-4 gap-y-1 sm:grid-cols-[7rem_1fr]">
            {rice.map(r => (
              <React.Fragment key={r.term}>
                <dt className="font-semibold text-base-content">{r.term}</dt>
                <dd className="mb-2 sm:mb-0">{r.text}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 3: Design Fidelity Spectrum
  // =========================================================================
  if (chapterId === 's3') {
    const steps = [
      { step: '1. Sketch', speed: 'ทำเสร็จใน 1 ชั่วโมง', cost: 'ถูกสุด', change: 'ลบขีดใหม่ใน 3 นาที' },
      { step: '2. Low-Fi Wireframe', speed: 'ทำเสร็จใน 1 วัน', cost: 'ยังถูก', change: 'จัด Layout ใหม่ใน 20 นาที' },
      { step: '3. Hi-Fi Interactive Prototype', speed: 'ทำเสร็จใน 3-5 วัน', cost: 'เริ่มแพง', change: 'แก้สี ฟอนต์ แอนิเมชัน 2 ชม.' },
      { step: '4. Production Live Code', speed: 'ทำเสร็จใน 2-4 สัปดาห์', cost: 'แพงสุด', change: 'รื้อ Database/API/Test เป็นสัปดาห์' },
    ];
    return (
      <div className={FRAME}>
        <p>
          บันไดสี่ขั้นของงานออกแบบ ยิ่งทดสอบในขั้นแรกๆ <b className="text-base-content">ต้นทุนการรื้อทิ้งยิ่งถูกลง</b>
        </p>
        <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-4 sm:gap-y-0 sm:divide-x sm:divide-base-border">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className={`space-y-2 ${idx > 0 ? 'border-t border-base-border pt-5 sm:border-t-0 sm:pt-0' : ''} ${idx > 0 ? 'sm:pl-4' : ''} ${idx < steps.length - 1 ? 'sm:pr-4' : ''}`}
            >
              <h3 className={TITLE}>{item.step}</h3>
              <dl className="space-y-1 text-sm">
                <div><dt className={LABEL}>เวลาทำ</dt><dd>{item.speed}</dd></div>
                <div><dt className={LABEL}>ต้นทุนการแก้</dt><dd className="font-semibold text-base-content">{item.cost}</dd></div>
                <div><dt className={LABEL}>ความยืดหยุ่น</dt><dd>{item.change}</dd></div>
              </dl>
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
    const nfr = [
      { name: 'Performance', text: 'ตอบสนอง <200ms แม้มี 10,000 req/sec' },
      { name: 'Security', text: 'เข้ารหัสข้อมูล, ป้องกัน SQL Injection, PDPA' },
      { name: 'Availability', text: 'Uptime 99.95% มีระบบ Auto-failover' },
      { name: 'Audit Log', text: 'บันทึกทุกการโอนเงินเพื่อตรวจสอบย้อนหลัง' },
    ];
    return (
      <div className={FRAME}>
        {/* Tip of the iceberg */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className={TITLE}>ส่วนที่มองเห็นคือ Functional Requirements (FR)</h3>
            <span className={LABEL}>สิ่งที่ตาเห็น</span>
          </div>
          <p>
            สิ่งที่ระบบต้อง <b className="text-base-content">&ldquo;ทำได้&rdquo;</b> เช่น กดปุ่มสมัครสมาชิกได้, มีตะกร้าสินค้า, ค้นหาตามชื่อสินค้าได้, มีใบเสร็จรับเงิน
          </p>
        </div>

        {/* Waterline */}
        <div className="flex items-center gap-3" role="separator">
          <span className="h-px flex-1 border-t border-dashed border-base-border-strong" aria-hidden="true" />
          <span className={`${LABEL} text-center`}>ผิวน้ำ (จุดที่ฝั่ง Business มักมองเห็นแค่นี้)</span>
          <span className="h-px flex-1 border-t border-dashed border-base-border-strong" aria-hidden="true" />
        </div>

        {/* Under water */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4">
            <h3 className={TITLE}>ส่วนใต้น้ำคือ Non-Functional Requirements (NFR)</h3>
            <span className={LABEL}>สิ่งที่ทำให้ระบบไม่ล่ม</span>
          </div>
          <dl className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
            {nfr.map(n => (
              <div key={n.name}>
                <dt className="font-semibold text-base-content">{n.name}</dt>
                <dd className="text-sm text-base-content-secondary">{n.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 5: Monolith vs Microservices & API Gateway (failure blast radius)
  // =========================================================================
  if (chapterId === 's5') {
    const services = [
      { name: 'User Service', ok: 'ล็อกอินได้' },
      { name: 'Catalog Service', ok: 'ค้นหาสินค้าได้' },
      { name: 'Order Service', ok: 'สั่งซื้อได้' },
      { name: 'Payment Service', ok: 'ตัดบัตรได้' },
      { name: 'Inventory Service', ok: 'เช็คสต็อกได้' },
    ];
    const monolithCells = ['1. จัดการสมาชิก', '2. สั่งสินค้า', '3. Payment ตัดบัตร', '4. ตัดสต็อก'];
    return (
      <div className="space-y-6">
        <div className={FRAME}>
          <WidgetHead
            title="Monolith กับ Microservices เมื่อ Payment ล่ม"
            hint="ลองทำให้ส่วนตัดเงินพัง แล้วดูว่าแต่ละแบบเสียหายกว้างแค่ไหน"
          >
            <div className="flex flex-wrap items-center gap-3">
              <Segmented label="รูปแบบสถาปัตยกรรม">
                <button
                  type="button"
                  aria-pressed={archMode === 'monolith'}
                  onClick={() => { setArchMode('monolith'); setPaymentFailed(false); }}
                  className={chipClass(segment(archMode === 'monolith'))}
                >
                  Monolith
                </button>
                <button
                  type="button"
                  aria-pressed={archMode === 'microservices'}
                  onClick={() => { setArchMode('microservices'); setPaymentFailed(false); }}
                  className={chipClass(segment(archMode === 'microservices'))}
                >
                  Microservices
                </button>
              </Segmented>
              <button
                type="button"
                aria-pressed={paymentFailed}
                onClick={() => setPaymentFailed(!paymentFailed)}
                className={chipClass({ selected: paymentFailed, size: 'md' })}
              >
                {paymentFailed ? 'กู้ Payment กลับมา' : 'จำลอง Payment ล่ม'}
              </button>
            </div>
          </WidgetHead>

          {/* Architecture display */}
          {archMode === 'monolith' ? (
            <div className="space-y-3" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-base-content">Monolith คือแอปก้อนเดียว Deploy ก้อนเดียว</span>
                {paymentFailed ? (
                  <StatusWord tone="error">Deploy ก้อนเดียว พังพร้อมกันทั้งระบบ</StatusWord>
                ) : (
                  <StatusWord tone="success">ระบบทำงานปกติ</StatusWord>
                )}
              </div>

              <div className="space-y-3 rounded-field border border-dashed border-base-border-strong p-3 text-center">
                <p className="text-sm font-semibold text-base-content">
                  Monolith Application (User, Order, Payment และ Inventory อยู่ในโปรแกรมเดียวกัน)
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {monolithCells.map((cell, i) => {
                    const isPayment = i === 2;
                    return (
                      <div
                        key={cell}
                        className={`rounded-field border p-2 text-sm ${paymentFailed ? 'border-error' : 'border-base-border'} ${isPayment ? 'font-semibold text-base-content' : ''}`}
                      >
                        {cell}
                        {paymentFailed && (
                          <span className="block text-[13px] font-semibold text-error">{isPayment ? 'ล่ม' : 'ดับตาม'}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <p>
                {paymentFailed
                  ? <><span className="font-semibold text-error">ผลกระทบ</span> โค้ดตัดบัตรมี Memory Leak จนโปรแกรมทั้งก้อนดับ ลูกค้าล็อกอินหรือดูสินค้าไม่ได้เลย</>
                  : <><span className="font-semibold text-base-content">จุดเด่น</span> สร้างง่าย ส่งของได้เร็วช่วงแรก แต่ส่วนหนึ่งพังอาจลากทั้งระบบลงไปด้วย</>}
              </p>
            </div>
          ) : (
            <div className="space-y-3" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-base-content">Microservices และ API Gateway</span>
                {paymentFailed ? (
                  <span className="text-sm"><StatusWord tone="warning">เสียบางส่วน</StatusWord> ดูสินค้าได้ แต่จ่ายเงินไม่ได้</span>
                ) : (
                  <StatusWord tone="success">ทุก Service ทำงานปกติ</StatusWord>
                )}
              </div>

              {/* API Gateway */}
              <div className="rounded-field border border-base-border-strong p-3 text-center">
                <p className="font-semibold text-base-content">API Gateway</p>
                <p className="text-sm text-base-content-secondary">ประตูเดียวรับคำขอจาก Mobile/Web ส่งต่อให้แต่ละ Service และตรวจ Rate Limit</p>
              </div>

              {/* Independent services */}
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                {services.map((svc, i) => {
                  const isPayment = i === 3;
                  const isOrder = i === 2;
                  const border = paymentFailed && isPayment ? 'border-error' : paymentFailed && isOrder ? 'border-warning' : 'border-base-border';
                  return (
                    <div
                      key={svc.name}
                      className={`rounded-field border p-3 text-center ${border} ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
                    >
                      <div className="text-sm font-semibold text-base-content">{svc.name}</div>
                      <div className="mt-0.5 text-[13px] leading-5">
                        {paymentFailed && isPayment ? (
                          <StatusWord tone="error">ล่ม</StatusWord>
                        ) : paymentFailed && isOrder ? (
                          <StatusWord tone="warning">ทำงานบางส่วน (จ่ายเงินไม่ได้ชั่วคราว)</StatusWord>
                        ) : (
                          <StatusWord tone="success">{svc.ok}</StatusWord>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p>
                {paymentFailed
                  ? <><span className="font-semibold text-success">บทเรียน</span> Payment ล่ม แต่ลูกค้ายังล็อกอิน ค้นหา และหยิบใส่ตะกร้าได้ ขั้นจ่ายเงินเท่านั้นที่ต้องรอ ทีมต้องออกแบบไว้ล่วงหน้าว่าช่วงนั้นจะบอกลูกค้าอย่างไร</>
                  : <><span className="font-semibold text-base-content">สิ่งที่ต้องแลก</span> Microservices ซับซ้อนกว่าและต้นทุนดูแลสูงกว่า จึงคุ้มเมื่อระบบและทีมเริ่มใหญ่</>}
              </p>
            </div>
          )}
        </div>

        {/* Sync vs Async simulator (moved from former chapter 15 diagram), closed by default */}
        <details className="group border-y border-base-border">
          <summary className={FOLD_SUMMARY}>
            <span className={TITLE}>ลองเทียบ Polling, Webhook และ WebSocket</span>
            <DisclosureChevron />
          </summary>
          <div className="pb-4">
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
      <div className={FRAME}>
        <h3 className={TITLE}>สองด่านคุมคุณภาพ</h3>
        <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-y-0 sm:divide-x sm:divide-base-border">
          <div className="space-y-1 sm:pr-6">
            <p className={LABEL}>Gate 1</p>
            <h4 className={TITLE}>Definition of Ready (DoR)</h4>
            <p>
              <b className="text-base-content">พร้อมหยิบเข้าทำ</b> สเปกนิ่ง มี Acceptance Criteria ครบ มีดีไซน์พร้อม และทีม Dev เข้าใจตรงกัน ไม่มีบล็อกเกอร์ค้าง
            </p>
          </div>
          <div className="space-y-1 border-t border-base-border pt-5 sm:border-t-0 sm:pl-6 sm:pt-0">
            <p className={LABEL}>Gate 2</p>
            <h4 className={TITLE}>Definition of Done (DoD)</h4>
            <p>
              <b className="text-base-content">เสร็จจริงไม่ใช่แค่โค้ดเสร็จ</b> ผ่าน Code Review, เทสต์ผ่านทั้งหมดและ Coverage ตามเกณฑ์ทีม, Deploy บน Staging ตรวจแล้ว และอัปเดตเอกสารแล้ว
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 7: Testing Pyramid
  // =========================================================================
  if (chapterId === 's7') {
    const layers = [
      { id: 'e2e' as const, name: 'E2E / UI Tests (10%)', tag: 'ช้าและแพง', tagTone: 'text-error', text: 'จำลองเปิดเบราว์เซอร์คลิกเหมือนคนจริง เปราะ พังง่ายเมื่อ UI เปลี่ยน', width: 'sm:w-3/5' },
      { id: 'integration' as const, name: 'Integration Tests (20%)', tag: 'ปานกลาง', tagTone: 'text-warning', text: 'ทดสอบการเชื่อมต่อระหว่าง API กับ Database หรือ Service ภายนอก', width: 'sm:w-4/5' },
      { id: 'unit' as const, name: 'Unit Tests (70%)', tag: 'เร็วและถูก', tagTone: 'text-success', text: 'ทดสอบฟังก์ชันคำนวณย่อยๆ ในโค้ด รันหลักพันข้อเสร็จในไม่กี่วินาที', width: 'sm:w-full' },
    ];
    return (
      <div className={FRAME}>
        <div className="flex flex-col items-center gap-2">
          {layers.map(l => (
            <button
              key={l.id}
              type="button"
              onClick={() => setPyramidLevel(l.id)}
              aria-pressed={pyramidLevel === l.id}
              className={`${TAP} w-full ${l.width} cursor-pointer rounded-field border p-3 text-left transition-colors ${FOCUS} ${
                pyramidLevel === l.id ? 'border-base-content bg-base-300' : 'border-base-border hover:bg-base-300'
              }`}
            >
              <span className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-semibold text-base-content">{l.name}</span>
                <span className={`text-sm font-semibold ${l.tagTone}`}>{l.tag}</span>
              </span>
              <span className="block text-sm text-base-content-secondary">{l.text}</span>
            </button>
          ))}
        </div>

        <p className={RULE}>
          <span className="font-semibold text-warning">Ice-Cream Cone Anti-pattern</span> ถ้าทีมมีแต่ E2E Test แต่ไม่มี Unit Test บิลด์จะช้าเป็นชั่วโมงและไม่มีใครกล้าปล่อยของ
        </p>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 8: DevOps release gates & Canary Release
  // =========================================================================
  if (chapterId === 's8') {
    return (
      <div className={FRAME}>
        {renderReleaseTrain()}
        <div className={`${RULE} space-y-4`}>
          <WidgetHead title="จำลอง Canary Release" hint="ปล่อยให้ผู้ใช้ทีละกลุ่ม">
            <SwitchChip label="เวอร์ชันใหม่มีบั๊ก" on={canaryBug} onToggle={() => setCanaryBug(!canaryBug)} />
          </WidgetHead>

          <p className="font-semibold text-base-content">{canaryPercent}% Traffic ไปเวอร์ชันใหม่</p>

          <div className="h-3 w-full overflow-hidden rounded-full border border-base-border bg-base-300 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${canaryBug ? 'bg-error' : 'bg-base-content-secondary'}`}
              style={{ width: `${canaryPercent}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <Segmented label="สัดส่วน Traffic ไปเวอร์ชันใหม่">
              {[5, 10, 25, 50, 100].map(pct => (
                <button
                  key={pct}
                  type="button"
                  aria-pressed={canaryPercent === pct}
                  onClick={() => setCanaryPercent(pct)}
                  className={chipClass(segment(canaryPercent === pct))}
                >
                  {pct}%
                </button>
              ))}
            </Segmented>
            <span className={`${HINT} max-w-md`}>
              {canaryPercent < 100 ? 'ถ้าตัวชี้วัดเกินเกณฑ์ ระบบ Rollback อัตโนมัติ (เร็วแค่ไหนขึ้นกับว่าเช็กตัวชี้วัดถี่แค่ไหน)' : 'ปล่อยครบแล้ว ปลอดภัยเพราะทุกขั้นก่อนหน้าผ่านเกณฑ์'}
            </span>
          </div>

          {canaryBug && (
            <div className="space-y-1" aria-live="polite">
              {canaryPercent < 100 ? (
                <>
                  <p className="font-semibold text-base-content">
                    <span className="text-error">กระทบผู้ใช้แค่ {canaryPercent}%</span> จน Error พุ่งเกินเกณฑ์ ระบบจึง Rollback อัตโนมัติ
                  </p>
                  <p>
                    อีก {100 - canaryPercent}% ยังใช้เวอร์ชันเดิมอยู่และไม่เจอบั๊กเลย ยิ่งเริ่มจากกลุ่มเล็ก ยิ่งเสียหายน้อย
                  </p>
                </>
              ) : (
                <p className="font-semibold text-base-content">
                  ถ้าเวอร์ชันนี้มีบั๊ก ระบบจะ Rollback ไปตั้งแต่ขั้นแรกแล้ว จึงไม่มีทางมาถึง 100%
                </p>
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
      { phase: 'Coding', cost: 'เริ่มแพง', desc: 'แก้โครงสร้าง Logic และแก้ Unit Test ที่เขียนไปแล้ว' },
      { phase: 'QA Testing', cost: 'แพง', desc: 'ต้อง Re-test ทั้งระบบ ตก Sprint และเลื่อนวันส่งมอบ' },
      { phase: 'Live Production', cost: 'แพงสุด', desc: 'ข้อมูลลูกค้าพัง ระบบล่ม เสียชื่อเสียง และต้องออก Hotfix เร่งด่วน' },
    ];

    return (
      <div className={FRAME}>
        <p>
          ยิ่งเจอบั๊กหรือเปลี่ยนใจช้า ต้นทุนการแก้ยิ่งสูง ตัวคูณที่อ้างกันบ่อย (เช่น 100 เท่า) มาจากงานวิจัยยุคเก่าและเชื่อได้แค่ทิศทาง ไม่ใช่ตัวเลข
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {boehmData.map((b, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setBoehmPhase(idx)}
              aria-pressed={boehmPhase === idx}
              className={`${TAP} cursor-pointer rounded-field border p-3 text-left transition-colors ${FOCUS} ${
                boehmPhase === idx ? 'border-base-content bg-base-300' : 'border-base-border hover:bg-base-300'
              }`}
            >
              <span className="block text-sm text-base-content-muted">{idx + 1}. {b.phase}</span>
              <span className="block text-sm font-semibold text-base-content">{b.cost}</span>
            </button>
          ))}
        </div>
        <div className="space-y-1" aria-live="polite">
          <p>
            <span className={LABEL}>เจอตอน</span> <b className="text-base-content">{boehmData[boehmPhase].phase}</b> ({boehmData[boehmPhase].cost})
          </p>
          <p>{boehmData[boehmPhase].desc}</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // CHAPTER 10: Feedback Loop
  // =========================================================================
  if (chapterId === 's10') {
    const tiers = [
      { tier: 'Tier 1', name: 'ทีมซัพพอร์ตลูกค้า', text: 'ตอบคำถามทั่วไป แก้ปัญหาเบื้องต้นตามคู่มือ ถ้าแก้ไม่ได้ส่งต่อ Tier 2' },
      { tier: 'Tier 2', name: 'Tech Support และ Ops', text: 'ตรวจสอบ Log, สิทธิ์ผู้ใช้งาน, ข้อมูลใน Database และยืนยันบั๊ก' },
      { tier: 'Tier 3', name: 'ทีม Engineering', text: 'ไล่ดู Code, ออกแบบ Hotfix และใส่บั๊กเข้า Product Backlog' },
    ];
    return (
      <div className={FRAME}>
        <h3 className={TITLE}>ส่งต่อปัญหาจาก Tier 1 ถึง 3 แล้วปิดวงจร</h3>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row">
          {tiers.map((t, idx) => (
            <React.Fragment key={t.tier}>
              <div className="flex-1 rounded-field border border-base-border p-3">
                <p className={LABEL}>{t.tier}</p>
                <h4 className={TITLE}>{t.name}</h4>
                <p className="text-sm text-base-content-secondary">{t.text}</p>
              </div>
              {idx < tiers.length - 1 && (
                <>
                  <ArrowRight className="hidden h-4 w-4 shrink-0 self-center text-base-content-subtle sm:block" aria-hidden="true" />
                  <ArrowDown className="h-4 w-4 shrink-0 self-center text-base-content-subtle sm:hidden" aria-hidden="true" />
                </>
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Return leg: without it the "loop" is just a one-way escalation */}
        <div className="flex items-start gap-2">
          <RotateCcw className="mt-1.5 h-4 w-4 shrink-0 text-base-content-muted" aria-hidden="true" />
          <div>
            <p className="font-semibold text-base-content">ปิดวงจร เมื่อแก้เสร็จ Tier 1 แจ้งลูกค้า แล้วอัปเดต FAQ และ Runbook</p>
            <p>ครั้งหน้าที่เจอเรื่องเดิม Tier 1 ตอบได้เองโดยไม่ต้องส่งต่อ</p>
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
        <div className="p-box-dense rounded-box bg-base-100 border border-base-border space-y-4">
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
          <div className="p-4 rounded-box bg-neutral text-neutral-content flex flex-col sm:flex-row items-center justify-between gap-4 border border-neutral">
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
        <div className="p-box-dense rounded-box bg-base-100 border border-base-border space-y-4">
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
        <div className="p-4 rounded-box border border-base-border bg-base-100 space-y-3">
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
