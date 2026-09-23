// The /api/ask-ai logic, shared by the Express server (local dev, Cloud Run) and the Vercel
// function in api/ask-ai.ts, which is what serves the route on Vercel. Answers come from Groq;
// without a key, or when every Groq model fails, a built-in knowledge base answers instead.
interface AskAiInput {
  question?: unknown;
  role?: string;
  context?: unknown;
  history?: unknown;
}

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

interface AskAiResult {
  status: number;
  body: Record<string, unknown>;
}

// Knowledge base summary for contextual grounding
const SYSTEM_INSTRUCTION = `คุณคือ "AI Bridge Specialist" ผู้เชี่ยวชาญด้านการเชื่อมช่องว่างระหว่างทีม Business (Product Managers, Business Analysts, UX/UI, Marketing, Executives) และทีม Engineering (Software Engineers, Solution Architects, QA, DevOps, SRE).
อ้างอิงจากคู่มือ "จุดที่ business กับ engineering มาเจอกัน":
- ยึดหลักการลดความเข้าใจผิด (Friction reduction)
- อธิบายด้วยเหตุผลสองด้านเสมอ (ทำไม Business คิดแบบนี้ vs ทำไม Engineer กังวลเรื่องนี้)
- ใช้คำอุปมาแบบบ้านๆ (Real-world analogies) เพื่อให้คนที่ไม่ใช่เทคนิคเข้าใจง่าย
- ให้คำแนะนำที่เอาไปใช้ได้เลย (Actionable advice) เช่น รูปประโยคที่ควรพูดในที่ประชุม หรือขั้นตอนตกลงร่วมกัน
- ใช้ภาษาไทยที่เป็นมิตร ชัดเจน ตรงประเด็น และกระชับ
- ใช้ภาษาพูดง่ายๆ แบบคนอธิบายให้ฟัง ไม่ใช่ภาษาตำรา
- ถ้ามี [บริบทเพิ่มเติม] จากบทในคู่มือ ให้ตอบโดยยึดเนื้อหานั้นเป็นหลัก แล้วค่อยเสริมด้วยความรู้ทั่วไป`;

// Models tried in order, all checked to answer Thai well. Groq's /models list is not usable
// here: it is unordered and led by allam-2-7b (an Arabic model that answers Thai with gibberish)
// and text-to-speech models. A model Groq retires just fails and the next one is tried.
const GROQ_MODELS = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];

// Thai costs several tokens per word; a full answer runs ~1,400 tokens, so 1,024 cut answers mid-list.
const GROQ_MAX_TOKENS = 4096;
// A full answer takes 2-5 s; leave room before giving up on a model and trying the next.
const GROQ_TIMEOUT_MS = 20_000;

// History and context come from the client, so they are bounded here too: every request must fit
// Groq's free tier of 8,000 tokens a minute per model.
const HISTORY_TURNS = 4;
const HISTORY_ITEM_MAX = 2000;
const CONTEXT_MAX = 2000;

// Malformed turns are dropped, not rejected: history only improves an answer.
function sanitizeHistory(raw: unknown): HistoryMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m): m is HistoryMessage =>
      (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim() !== "")
    .slice(-HISTORY_TURNS)
    .map(({ role, content }) => ({ role, content: content.slice(0, HISTORY_ITEM_MAX) }));
}

// Helper for Groq Cloud API
async function callGroq(
  question: string,
  role: string,
  context: string,
  history: HistoryMessage[],
): Promise<{ text: string; model: string } | { rateLimited: boolean }> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) return { rateLimited: false };

  const userRoleText = role === 'business' ? 'ฝั่ง Business' : role === 'engineer' ? 'ฝั่ง Engineer' : 'ทั้งสองฝั่ง';
  const userContent = `[ผู้ใช้งานระบุมุมมอง: ${userRoleText}]\n${context ? `[บริบทเพิ่มเติม]: ${context}\n` : ''}\n[คำถาม]: ${question}\n\nตอบให้ชัด แบ่งเป็นข้อคิดกับวิธีแก้ที่ใช้ได้จริงในที่ทำงาน:`;

  // GROQ_MODEL, when set, goes first
  const envModel = process.env.GROQ_MODEL?.trim();
  const candidateModels = envModel
    ? [envModel, ...GROQ_MODELS.filter((m) => m !== envModel)]
    : GROQ_MODELS;

  let rateLimited = false;
  for (const model of candidateModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            ...history,
            { role: "user", content: userContent },
          ],
          temperature: 0.6,
          max_tokens: GROQ_MAX_TOKENS,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data: any = await res.json();
        const choice = data?.choices?.[0];
        const text = choice?.message?.content?.trim();
        if (text) {
          // Say so rather than end on a dangling "3. **"
          const answer = choice.finish_reason === "length" ? `${text}\n\n_(คำตอบยาวเกินกำหนด เลยถูกตัดตรงนี้)_` : text;
          return { text: answer, model };
        }
      } else {
        if (res.status === 429) rateLimited = true;
        const err = await res.text().catch(() => "");
        console.warn(`[Groq ${model}] Failed (${res.status}):`, err.slice(0, 100));
      }
    } catch (e: any) {
      console.warn(`[Groq ${model}] Error:`, e?.message || e);
    }
  }

  return { rateLimited };
}

export async function askAi(input: unknown): Promise<AskAiResult> {
  try {
    const { question, role = "both", context, history } = (input ?? {}) as AskAiInput;
    if (!question || typeof question !== "string") {
      return { status: 400, body: { error: "พิมพ์คำถามก่อน" } };
    }

    // Set when a Groq model refused with 429, so the client can say the free quota ran out
    // rather than that the AI is offline.
    let rateLimited = false;

    // 1. Attempt Groq call if GROQ_API_KEY is configured
    if (process.env.GROQ_API_KEY?.trim()) {
      try {
        const groqAnswer = await callGroq(
          question,
          role,
          typeof context === "string" ? context.slice(0, CONTEXT_MAX) : "",
          sanitizeHistory(history),
        );
        if ("text" in groqAnswer) {
          return { status: 200, body: { answer: groqAnswer.text, source: "groq", model: groqAnswer.model } };
        }
        rateLimited = groqAnswer.rateLimited;
      } catch (err: any) {
        console.warn("[AI Bridge] Groq invocation failed, using the knowledge base:", err?.message || err);
      }
    }

    console.log("[AI Bridge] Serving request via expert knowledge base fallback");
    
    // 2. Fallback expert rule-based responses
      const lower = question.toLowerCase();
      let fallbackAnswer = "";

      if (lower.includes("ปุ่มเดียว") || lower.includes("แค่เพิ่ม") || lower.includes("button")) {
        fallbackAnswer = `**ทำไม "แค่เพิ่มปุ่มเดียว" ถึงใช้เวลาเป็นสัปดาห์?**

1. **สิ่งที่ตาเห็น vs งานใต้น้ำ:**
   - สิ่งที่เห็นคือปุ่มสี่เหลี่ยม 1 ปุ่ม (5% ของงาน)
   - งานใต้น้ำ: Database schema, Validation logic, State machine (เช่น กดยกเลิกตอนสถานะไหนได้บ้าง), Notification ส่งหา Rider/ร้านค้า, การบันทึกบัญชี/คืนเงิน Payment Gateway, และ Edge Cases ถ้าเน็ตหลุดตอนกด (95% ของงาน)

2. **มุมมอง Business:**
   - เห็นว่าแค่ฟังก์ชันเล็กๆ แค่ปุ่มเดียว ทำไมบอกทำไม่ได้
3. **เอาไปใช้ยังไง (สิ่งที่ควรพูดในห้องประชุม):**
   - ถามว่า: *"เวอร์ชันที่เร็วและเล็กที่สุด (MVP) ของปุ่มนี้ ตัดเงื่อนไขอะไรออกไปก่อนได้บ้างเพื่อให้ส่งได้เร็วขึ้น?"*`;
      } else if (lower.includes("pm") && lower.includes("pjm")) {
        fallbackAnswer = `**PM (Product Manager) vs PjM (Project Manager) ต่างกันอย่างไร?**

- **Product Manager (PM):** ดูแลเรื่อง **"ทำอะไร เพื่อใคร และทำไม (What & Why)"** เป็นคนตัดสินใจเดิมพันทิศทาง จัดลำดับ Backlog วัดผลทางธุรกิจ รับมือกับความไม่แน่นอน
- **Project Manager (PjM):** ดูแลเรื่อง **"ทำให้เสร็จทันเมื่อไหร่ และบริหารคน/เวลาอย่างไร (How & When)"** วาง Timeline, คุม Resource, บริหารความเสี่ยง, Fast-tracking หรือ Replanning

*เปรียบแบบบ้านๆ:* PM คือคนที่เลือกว่า "ทริปนี้เราจะไปเที่ยวภูเขาหรือทะเลดีกว่ากัน" ส่วน PjM คือคนที่ "จองตั๋ว กะเวลารถออก และเช็คว่าทุกคนถึงโรงแรมตรงเวลาไหม"`;
      } else if (lower.includes("tech debt") || lower.includes("หนี้") || lower.includes("refactor")) {
        fallbackAnswer = `**ทำไมงาน Technical Debt ถึงไม่เคยได้เข้า Sprint สักที?**

- **สาเหตุหลัก:** ทีม Dev มักขอในภาษาเทคนิค เช่น "ขอเวลา Refactor 2 สัปดาห์" ซึ่งฝั่ง Business คำนวณความคุ้มค่าไม่ได้ และจะแพ้ Feature ใหม่ที่มีตัวเลขรายได้ชัดเจนเสมอ
- **วิธีแก้:**
  1. แปลงเป็นความเสี่ยงหรือต้นทุนที่วัดได้ เช่น *"ถ้าไม่แก้ตรงนี้ ทุกครั้งที่ Deploy ระบบมีโอกาสล่ม 15% คิดเป็นความเสียหาย X บาท"*
  2. ใช้กรอบของ Martin Fowler (Tech Debt Quadrant): แยกหนี้ที่ตั้งใจ+รอบคอบ ออกจากหนี้ที่ประมาท
  3. ขอกันเวลาคงที่ เช่น 15–20% ของ Capacity ทุก Sprint ไว้ดูแลระบบ`;
      } else if (lower.includes("acceptance criteria") || lower.includes("ac") || lower.includes("user story") || lower.includes("ชำระเงิน") || lower.includes("payment")) {
        fallbackAnswer = `**ตัวอย่าง Acceptance Criteria (AC) สำหรับระบบชำระเงิน (Given-When-Then):**

1. **กรณีชำระเงินสำเร็จ (Happy Path):**
   - **Given:** ลูกค้ามียอดเงินเพียงพอและเลือกชำระผ่านบัตรเครดิต
   - **When:** ลูกค้ายืนยันรหัส OTP ถูกต้องภายใน 3 นาที
   - **Then:** ระบบต้องตัดยอดเงิน, อัปเดตสถานะคำสั่งซื้อเป็น "Paid", ส่งใบเสร็จผ่านอีเมลภายใน 5 วินาที และนำผู้ใช้ไปยังหน้าสรุปคำสั่งซื้อ

2. **กรณีเงินไม่พอหรือบัตรถูกปฏิเสธ (Unhappy Path):**
   - **Given:** บัตรของลูกค้าหมดอายุหรือวงเงินไม่พอ
   - **When:** Payment Gateway ส่งสถานะ Declined
   - **Then:** ระบบต้องไม่หักสต็อกสินค้า, แสดงข้อความแจ้งเตือนที่เข้าใจง่าย (ไม่ใช่ Error Code), และเปิดให้ลูกค้าเลือกช่องทางชำระเงินอื่นได้ทันที

3. **กรณีเน็ตหลุด / Timeout (Idempotency):**
   - **Then:** การกดปุ่มซ้ำต้องไม่เกิดการตัดเงินเบิ้ล (Idempotency Key ป้องกันการชำระซ้ำซ้อน)`;
      } else if (lower.includes("deadline") || lower.includes("เถียง") || lower.includes("กำหนดส่ง")) {
        fallbackAnswer = `**เมื่อ PM กับ Dev มีความเห็นไม่ตรงกันเรื่อง Deadline ควรแก้ปัญหาอย่างไร?**

1. **ทำความเข้าใจ Root Cause:**
   - Business มองว่าพลาดโอกาสทางการตลาดหรือสัญญาที่ตกลงกับคู่ค้าไว้
   - Dev กังวลเรื่องความเสถียรและไม่อยากปล่อยงานที่รู้ว่าต้องมาตามแก้บั๊กทั้งคืน

2. **เทคนิคการเจรจา (Iron Triangle):**
   - กฎเหล็กของโปรเจกต์เทค: **Scope, Time, Cost/Quality** — เมื่อเวลา (Time) ล็อคแน่น สิ่งที่ขยับได้มีเพียงอย่างเดียวคือ "ขอบเขตงาน (Scope)"
   - หลีกเลี่ยงประโยค: *"ทำไมทำไม่ทัน?"*
   - ให้เปลี่ยนเป็น: *"ถ้าเส้นตายวันที่ X ขยับไม่ได้ มีฟังก์ชันไหนใน Scope นี้ที่เราเลื่อนไปทำใน Phase 2 ได้บ้าง เพื่อให้ส่งมอบของที่มีคุณภาพได้ทันเวลา?"*

3. **แบ่งของเป็น Slice แนวดิ่ง (Vertical Slice):**
   - ทำ Core flow ให้ใช้งานได้จริง 1 เส้นทางก่อน ส่วนลูกเล่นและ Edge cases ค่อยทยอยปล่อยตามมา`;
      } else if (lower.includes("nfr") || lower.includes("scalability") || lower.includes("ขยายตัว")) {
        fallbackAnswer = `**NFR (Non-Functional Requirements) เรื่อง Scalability อธิบายแบบภาษาบ้านๆ:**

- **ความหมาย:** ไม่ใช่แค่ "ระบบทำงานได้ไหม" แต่คือ "เมื่อคนมาใช้งานพร้อมกัน 10,000 คน ระบบยังทำงานได้เร็วเหมือนตอนมีคนเดียวไหม"
- **เปรียบเทียบในชีวิตจริง:**
  - Functional Requirement = ร้านก๋วยเตี๋ยวทำก๋วยเตี๋ยวต้มยำได้รสชาติถูกต้อง
  - Scalability (NFR) = เมื่อมีทัวร์ลง 10 คันรถบัสพร้อมกัน ร้านยังเสิร์ฟก๋วยเตี๋ยวร้อนๆ ได้ภายใน 5 นาทีโดยครัวไม่ไหม้และเด็กเสิร์ฟไม่หนีกลับบ้าน
- **สิ่งที่ Business และ Tech ต้องคุยกัน:**
  - Peak Traffic อยู่ช่วงเวลาไหน? (เช่น 11:15 น. ทุกวันที่ 1 และ 16)
  - ยอมรับเวลารอได้สูงสุดกี่วินาที? (SLO / Latency)`;
      } else if (lower.includes("trunk") || lower.includes("git-flow") || lower.includes("branch")) {
        fallbackAnswer = `**เปรียบเทียบ Trunk-based Development vs Git-flow:**

- **Trunk-based Development:**
  - **วิธีทำ:** ทุกคนรวมโค้ดเข้า branch หลัก (main/trunk) บ่อยๆ (วันละหลายครั้ง) โดยใช้ Feature Flags ปิดฟีเจอร์ที่ยังไม่เสร็จ
  - **เหมาะสำหรับ:** ทีมขนาดเล็กถึงกลาง, ทีมที่ทำ CI/CD เต็มรูปแบบ, สตาร์ทอัพที่ต้องการปล่อยของเร็วและลดปัญหา Merge Conflict ก้อนใหญ่
- **Git-flow:**
  - **วิธีทำ:** แบ่ง branch ตามรอบ Release (develop, release, hotfix, feature) มีขั้นตอนการทดสอบและอนุมัติชัดเจน
  - **เหมาะสำหรับ:** ซอฟต์แวร์แบบดั้งเดิมที่มีรอบ Release นานๆ (เช่น แอปพลิเคชันฝังตัว หรือระบบองค์กรที่ต้องรอตรวจสอบความปลอดภัยเป็นรอบ)`;
      } else {
        fallbackAnswer = `**คำแนะนำเพื่อการทำงานร่วมกัน:**

เรื่องนี้เป็นปัญหาคลาสสิกที่เกิดจากความต่างของเป้าหมาย:
- **ฝั่ง Business:** แข่งกับเวลา ตลาด และความต้องการลูกค้าที่เปลี่ยนเร็ว ต้องการความยืดหยุ่นและการทดลอง
- **ฝั่ง Engineering:** แข่งกับความเสถียร สถาปัตยกรรมที่แก้ต่อได้ และความปลอดภัยของระบบ ไม่ต้องการให้ระบบพังเมื่อ Traffic สูง

**3 วิธีทำงานเข้าขากันขึ้น:**
1. **ทำให้ต้นทุนมองเห็นได้:** อย่ารับปากเงียบๆ หรือปฏิเสธห้วนๆ ให้แสดง Trade-off เสมอ ("ถ้าเอาข้อนี้ ต้องเลื่อนข้อไหนออก?")
2. **สร้าง Acceptance Criteria ร่วมกัน:** ตกลงกันก่อนว่า "เสร็จจริง" คืออะไร
3. **ใช้ Visual Diagram ที่ถูกระดับ:** เช่น C4 Level 1 สำหรับคุยภาพรวมกับผู้บริหาร และ Sequence สำหรับคุยรายละเอียดขั้นตอนกับทีม`;
      }

      return {
        status: 200,
        body: {
          answer: fallbackAnswer,
          source: "fallback",
          note: "ให้คำแนะนำจากคลังความรู้ผู้เชี่ยวชาญ (Bridge Knowledge Base)",
          ...(rateLimited && { reason: "rate_limited" }),
        },
      };
  } catch (err: any) {
    return { status: 500, body: { error: err.message || "มีบางอย่างผิดพลาด ลองใหม่อีกครั้ง" } };
  }
}
