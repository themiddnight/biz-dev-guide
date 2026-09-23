import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Lazy-initialize Gemini API
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Knowledge base summary for contextual grounding
const SYSTEM_INSTRUCTION = `คุณคือ "AI Bridge Specialist" ผู้เชี่ยวชาญด้านการเชื่อมช่องว่างระหว่างทีม Business (Product Managers, Business Analysts, UX/UI, Marketing, Executives) และทีม Engineering (Software Engineers, Solution Architects, QA, DevOps, SRE).
อ้างอิงจากคู่มือ "จุดที่ business กับ engineering มาเจอกัน":
- ยึดหลักการลดความเข้าใจผิด (Friction reduction)
- อธิบายด้วยเหตุผลสองด้านเสมอ (ทำไม Business คิดแบบนี้ vs ทำไม Engineer กังวลเรื่องนี้)
- ใช้คำอุปมาแบบบ้านๆ (Real-world analogies) เพื่อให้คนที่ไม่ใช่เทคนิคเข้าใจง่าย
- ให้คำแนะนำที่เอาไปใช้ได้เลย (Actionable advice) เช่น รูปประโยคที่ควรพูดในที่ประชุม หรือขั้นตอนตกลงร่วมกัน
- ใช้ภาษาไทยที่เป็นมิตร ชัดเจน ตรงประเด็น และกระชับ
- ใช้ภาษาพูดง่ายๆ แบบคนอธิบายให้ฟัง ไม่ใช่ภาษาตำรา`;

// AI Q&A API
app.post("/api/ask-ai", async (req, res) => {
  try {
    const { question, role = "both", context = "" } = req.body;
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "พิมพ์คำถามก่อน" });
    }

    // Attempt Gemini call
    try {
      const ai = getGeminiClient();
      const prompt = `${SYSTEM_INSTRUCTION}

[ผู้ใช้งานระบุมุมมอง: ${role === 'business' ? 'ฝั่ง Business' : role === 'engineer' ? 'ฝั่ง Engineer' : 'ทั้งสองฝั่ง'}]
${context ? `[บริบทเพิ่มเติม]: ${context}` : ''}

[คำถาม]: ${question}

ตอบให้ชัด แบ่งเป็นข้อคิดกับวิธีแก้ที่ใช้ได้จริงในที่ทำงาน:`;

      const candidateModels = ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-flash-latest"];
      let response: any = null;
      let lastModelError: any = null;

      for (const model of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: prompt,
          });
          if (response && response.text) {
            break;
          }
        } catch (mErr: any) {
          lastModelError = mErr;
          console.warn(`Model ${model} unavailable, trying next candidate:`, mErr?.message);
        }
      }

      if (!response || !response.text) {
        throw lastModelError || new Error("Failed to generate content with available Gemini models");
      }

      const answer = response.text || "ขออภัย ยังตอบไม่ได้ ลองใหม่อีกครั้ง";
      return res.json({ answer, source: "gemini" });
    } catch (geminiError: any) {
      console.warn("Gemini API call failed or key missing, falling back to expert knowledge base:", geminiError.message);
      
      // Fallback expert rule-based responses if API key is not yet set
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
      } else if (lower.includes("tech debt") || lower.includes("หนี้")) {
        fallbackAnswer = `**ทำไมงาน Technical Debt ถึงไม่เคยได้เข้า Sprint สักที?**

- **สาเหตุหลัก:** ทีม Dev มักขอในภาษาเทคนิค เช่น "ขอเวลา Refactor 2 สัปดาห์" ซึ่งฝั่ง Business คำนวณความคุ้มค่าไม่ได้ และจะแพ้ Feature ใหม่ที่มีตัวเลขรายได้ชัดเจนเสมอ
- **วิธีแก้:**
  1. แปลงเป็นความเสี่ยงหรือต้นทุนที่วัดได้ เช่น *"ถ้าไม่แก้ตรงนี้ ทุกครั้งที่ Deploy ระบบมีโอกาสล่ม 15% คิดเป็นความเสียหาย X บาท"*
  2. ใช้กรอบของ Martin Fowler (Tech Debt Quadrant): แยกหนี้ที่ตั้งใจ+รอบคอบ ออกจากหนี้ที่ประมาท
  3. ขอกันเวลาคงที่ เช่น 15–20% ของ Capacity ทุก Sprint ไว้ดูแลระบบ`;
      } else {
        fallbackAnswer = `**คำแนะนำ:**

เรื่องนี้เป็นปัญหาคลาสสิกที่เกิดจากความต่างของเป้าหมาย:
- **ฝั่ง Business:** แข่งกับเวลา ตลาด และความต้องการลูกค้าที่เปลี่ยนเร็ว ต้องการความยืดหยุ่นและการทดลอง
- **ฝั่ง Engineering:** แข่งกับความเสถียร สถาปัตยกรรมที่แก้ต่อได้ และความปลอดภัยของระบบ ไม่ต้องการให้ระบบพังเมื่อ Traffic สูง

**3 วิธีทำงานเข้าขากันขึ้น:**
1. **ทำให้ต้นทุนมองเห็นได้:** อย่ารับปากเงียบๆ หรือปฏิเสธห้วนๆ ให้แสดง Trade-off เสมอ ("ถ้าเอาข้อนี้ ต้องเลื่อนข้อไหนออก?")
2. **สร้าง Acceptance Criteria ร่วมกัน:** ตกลงกันก่อนว่า "เสร็จจริง" คืออะไร
3. **ใช้ Visual Diagram ที่ถูกระดับ:** เช่น C4 Level 1 สำหรับคุยภาพรวมกับผู้บริหาร และ Sequence สำหรับคุยรายละเอียดขั้นตอนกับทีม`;
      }

      return res.json({ 
        answer: fallbackAnswer, 
        source: "fallback",
        note: "ตอนนี้ใช้คำตอบสำเร็จรูปในเครื่อง (เพิ่ม GEMINI_API_KEY ใน Settings เพื่อใช้ Gemini AI)" 
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || "มีบางอย่างผิดพลาด ลองใหม่อีกครั้ง" });
  }
});

// Vite integration
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
