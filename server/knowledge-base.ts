// The answers /api/ask-ai gives when Groq cannot: hand-written answers to the questions people ask
// most, then the chapter the user was reading, then guide chapters that name what the question
// names, and last a general answer.
import { chapters1_5 } from "../src/data/chapters/chapters1_5";
import { chapters6_10 } from "../src/data/chapters/chapters6_10";
import { chapters11_15 } from "../src/data/chapters/chapters11_15";
import { chapters16_19 } from "../src/data/chapters/chapters16_19";
import { GLOSSARY } from "../src/data/glossary";
import { plainText } from "../src/lib/chapterContext";
import { formatChapterHash } from "../src/lib/chapterRoute";
import { mentions, suggestChapters } from "../src/lib/chapterSuggest";

// The chapter files alone, not CHAPTERS: matching reads titles, jargon and takeaways, and the
// content blocks, figures and playbooks CHAPTERS adds would grow build/server.cjs by a further
// 300 KB, past esbuild's large-file warning.
const CHAPTERS = [...chapters1_5, ...chapters6_10, ...chapters11_15, ...chapters16_19];

const TAKEAWAY_MAX = 220;

const has = (q: string, keyword: string) => q.includes(keyword);
const hasWord = mentions;

function cannedAnswer(question: string): string | null {
  const q = question.toLowerCase();
  if (has(q, "ปุ่มเดียว") || has(q, "แค่เพิ่ม") || has(q, "button")) {
    return `**ทำไม "แค่เพิ่มปุ่มเดียว" ถึงใช้เวลาเป็นสัปดาห์?**

1. **สิ่งที่ตาเห็น vs งานใต้น้ำ:**
   - สิ่งที่เห็นคือปุ่มสี่เหลี่ยม 1 ปุ่ม (5% ของงาน)
   - งานใต้น้ำ: Database schema, Validation logic, State machine (เช่น กดยกเลิกตอนสถานะไหนได้บ้าง), Notification ส่งหา Rider/ร้านค้า, การบันทึกบัญชี/คืนเงิน Payment Gateway, และ Edge Cases ถ้าเน็ตหลุดตอนกด (95% ของงาน)

2. **มุมมอง Business:**
   - เห็นว่าแค่ฟังก์ชันเล็กๆ แค่ปุ่มเดียว ทำไมบอกทำไม่ได้
3. **เอาไปใช้ยังไง (สิ่งที่ควรพูดในห้องประชุม):**
   - ถามว่า: *"เวอร์ชันที่เร็วและเล็กที่สุด (MVP) ของปุ่มนี้ ตัดเงื่อนไขอะไรออกไปก่อนได้บ้างเพื่อให้ส่งได้เร็วขึ้น?"*`;
  }
  if (hasWord(q, "pm") && hasWord(q, "pjm")) {
    return `**PM (Product Manager) vs PjM (Project Manager) ต่างกันอย่างไร?**

- **Product Manager (PM):** ดูแลเรื่อง **"ทำอะไร เพื่อใคร และทำไม (What & Why)"** เป็นคนตัดสินใจเดิมพันทิศทาง จัดลำดับ Backlog วัดผลทางธุรกิจ รับมือกับความไม่แน่นอน
- **Project Manager (PjM):** ดูแลเรื่อง **"ทำให้เสร็จทันเมื่อไหร่ และบริหารคน/เวลาอย่างไร (How & When)"** วาง Timeline, คุม Resource, บริหารความเสี่ยง, Fast-tracking หรือ Replanning

*เปรียบแบบบ้านๆ:* PM คือคนที่เลือกว่า "ทริปนี้เราจะไปเที่ยวภูเขาหรือทะเลดีกว่ากัน" ส่วน PjM คือคนที่ "จองตั๋ว กะเวลารถออก และเช็คว่าทุกคนถึงโรงแรมตรงเวลาไหม"`;
  }
  if (has(q, "tech debt") || has(q, "หนี้") || has(q, "refactor")) {
    return `**ทำไมงาน Technical Debt ถึงไม่เคยได้เข้า Sprint สักที?**

- **สาเหตุหลัก:** ทีม Dev มักขอในภาษาเทคนิค เช่น "ขอเวลา Refactor 2 สัปดาห์" ซึ่งฝั่ง Business คำนวณความคุ้มค่าไม่ได้ และจะแพ้ Feature ใหม่ที่มีตัวเลขรายได้ชัดเจนเสมอ
- **วิธีแก้:**
  1. แปลงเป็นความเสี่ยงหรือต้นทุนที่วัดได้ เช่น *"ถ้าไม่แก้ตรงนี้ ทุกครั้งที่ Deploy ระบบมีโอกาสล่ม 15% คิดเป็นความเสียหาย X บาท"*
  2. ใช้กรอบของ Martin Fowler (Tech Debt Quadrant): แยกหนี้ที่ตั้งใจ+รอบคอบ ออกจากหนี้ที่ประมาท
  3. ขอกันเวลาคงที่ เช่น 15–20% ของ Capacity ทุก Sprint ไว้ดูแลระบบ`;
  }
  if (has(q, "acceptance criteria") || hasWord(q, "ac") || has(q, "user story") || has(q, "ชำระเงิน") || has(q, "payment")) {
    return `**ตัวอย่าง Acceptance Criteria (AC) สำหรับระบบชำระเงิน (Given-When-Then):**

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
  }
  if (has(q, "deadline") || has(q, "เถียง") || has(q, "กำหนดส่ง")) {
    return `**เมื่อ PM กับ Dev มีความเห็นไม่ตรงกันเรื่อง Deadline ควรแก้ปัญหาอย่างไร?**

1. **ทำความเข้าใจ Root Cause:**
   - Business มองว่าพลาดโอกาสทางการตลาดหรือสัญญาที่ตกลงกับคู่ค้าไว้
   - Dev กังวลเรื่องความเสถียรและไม่อยากปล่อยงานที่รู้ว่าต้องมาตามแก้บั๊กทั้งคืน

2. **เทคนิคการเจรจา (Iron Triangle):**
   - กฎเหล็กของโปรเจกต์เทค: **Scope, Time, Cost/Quality** — เมื่อเวลา (Time) ล็อคแน่น สิ่งที่ขยับได้มีเพียงอย่างเดียวคือ "ขอบเขตงาน (Scope)"
   - หลีกเลี่ยงประโยค: *"ทำไมทำไม่ทัน?"*
   - ให้เปลี่ยนเป็น: *"ถ้าเส้นตายวันที่ X ขยับไม่ได้ มีฟังก์ชันไหนใน Scope นี้ที่เราเลื่อนไปทำใน Phase 2 ได้บ้าง เพื่อให้ส่งมอบของที่มีคุณภาพได้ทันเวลา?"*

3. **แบ่งของเป็น Slice แนวดิ่ง (Vertical Slice):**
   - ทำ Core flow ให้ใช้งานได้จริง 1 เส้นทางก่อน ส่วนลูกเล่นและ Edge cases ค่อยทยอยปล่อยตามมา`;
  }
  if (hasWord(q, "nfr") || has(q, "scalability") || has(q, "ขยายตัว")) {
    return `**NFR (Non-Functional Requirements) เรื่อง Scalability อธิบายแบบภาษาบ้านๆ:**

- **ความหมาย:** ไม่ใช่แค่ "ระบบทำงานได้ไหม" แต่คือ "เมื่อคนมาใช้งานพร้อมกัน 10,000 คน ระบบยังทำงานได้เร็วเหมือนตอนมีคนเดียวไหม"
- **เปรียบเทียบในชีวิตจริง:**
  - Functional Requirement = ร้านก๋วยเตี๋ยวทำก๋วยเตี๋ยวต้มยำได้รสชาติถูกต้อง
  - Scalability (NFR) = เมื่อมีทัวร์ลง 10 คันรถบัสพร้อมกัน ร้านยังเสิร์ฟก๋วยเตี๋ยวร้อนๆ ได้ภายใน 5 นาทีโดยครัวไม่ไหม้และเด็กเสิร์ฟไม่หนีกลับบ้าน
- **สิ่งที่ Business และ Tech ต้องคุยกัน:**
  - Peak Traffic อยู่ช่วงเวลาไหน? (เช่น 11:15 น. ทุกวันที่ 1 และ 16)
  - ยอมรับเวลารอได้สูงสุดกี่วินาที? (SLO / Latency)`;
  }
  if (has(q, "trunk") || has(q, "git-flow") || has(q, "branch")) {
    return `**เปรียบเทียบ Trunk-based Development vs Git-flow:**

- **Trunk-based Development:**
  - **วิธีทำ:** ทุกคนรวมโค้ดเข้า branch หลัก (main/trunk) บ่อยๆ (วันละหลายครั้ง) โดยใช้ Feature Flags ปิดฟีเจอร์ที่ยังไม่เสร็จ
  - **เหมาะสำหรับ:** ทีมขนาดเล็กถึงกลาง, ทีมที่ทำ CI/CD เต็มรูปแบบ, สตาร์ทอัพที่ต้องการปล่อยของเร็วและลดปัญหา Merge Conflict ก้อนใหญ่
- **Git-flow:**
  - **วิธีทำ:** แบ่ง branch ตามรอบ Release (develop, release, hotfix, feature) มีขั้นตอนการทดสอบและอนุมัติชัดเจน
  - **เหมาะสำหรับ:** ซอฟต์แวร์แบบดั้งเดิมที่มีรอบ Release นานๆ (เช่น แอปพลิเคชันฝังตัว หรือระบบองค์กรที่ต้องรอตรวจสอบความปลอดภัยเป็นรอบ)`;
  }
  return null;
}

const GENERIC_ANSWER = `**คำแนะนำเพื่อการทำงานร่วมกัน:**

เรื่องนี้เป็นปัญหาคลาสสิกที่เกิดจากความต่างของเป้าหมาย:
- **ฝั่ง Business:** แข่งกับเวลา ตลาด และความต้องการลูกค้าที่เปลี่ยนเร็ว ต้องการความยืดหยุ่นและการทดลอง
- **ฝั่ง Engineering:** แข่งกับความเสถียร สถาปัตยกรรมที่แก้ต่อได้ และความปลอดภัยของระบบ ไม่ต้องการให้ระบบพังเมื่อ Traffic สูง

**3 วิธีทำงานเข้าขากันขึ้น:**
1. **ทำให้ต้นทุนมองเห็นได้:** อย่ารับปากเงียบๆ หรือปฏิเสธห้วนๆ ให้แสดง Trade-off เสมอ ("ถ้าเอาข้อนี้ ต้องเลื่อนข้อไหนออก?")
2. **สร้าง Acceptance Criteria ร่วมกัน:** ตกลงกันก่อนว่า "เสร็จจริง" คืออะไร
3. **ใช้ Visual Diagram ที่ถูกระดับ:** เช่น C4 Level 1 สำหรับคุยภาพรวมกับผู้บริหาร และ Sequence สำหรับคุยรายละเอียดขั้นตอนกับทีม`;

// The client sends the chapter as "label: subtitle" then one fact per line (src/lib/chapterContext.ts).
function chapterContextAnswer(context: string): string {
  const [heading, ...rest] = context.split("\n").map((l) => l.trim()).filter(Boolean);
  return [
    "**AI ยังตอบไม่ได้ตอนนี้ นี่คือสรุปของบทที่คุณกำลังอ่าน:**",
    `**${heading}**`,
    ...rest,
    "_ลองถามใหม่อีกครั้งในอีกสักครู่ เพื่อให้ AI ตอบคำถามนี้โดยตรง_",
  ].join("\n\n");
}

function suggestionAnswer(question: string): string | null {
  const found = suggestChapters(question, CHAPTERS, GLOSSARY);
  if (found.length === 0) return null;
  const clip = (t: string) => (t.length > TAKEAWAY_MAX ? `${t.slice(0, TAKEAWAY_MAX - 1).trimEnd()}…` : t);
  return [
    "**AI ยังตอบไม่ได้ตอนนี้ แต่บทในคู่มือเหล่านี้พูดถึงเรื่องที่ถามอยู่:**",
    found.map((c) => `- [บทที่ ${c.num} · ${c.title}](${formatChapterHash(c.num)}): ${clip(plainText(c.keyTakeaway))}`).join("\n"),
    "_กดชื่อบทเพื่อเปิดอ่าน หรือลองถามใหม่อีกครั้งในอีกสักครู่_",
  ].join("\n\n");
}

export function fallbackAnswer(question: string, context: string): string {
  return cannedAnswer(question) ?? (context ? chapterContextAnswer(context) : null) ?? suggestionAnswer(question) ?? GENERIC_ANSWER;
}
