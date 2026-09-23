// The /api/ask-ai logic, shared by the Express server (local dev, Cloud Run) and the Vercel
// function in api/ask-ai.ts, which is what serves the route on Vercel. Answers come from Groq;
// without a key, or when every Groq model fails, a built-in knowledge base answers instead.
import { HISTORY_TURNS, type ChatHistoryItem } from "../src/lib/chatHistory";
import { fallbackAnswer } from "./knowledge-base";

interface AskAiInput {
  question?: unknown;
  role?: string;
  context?: unknown;
  history?: unknown;
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
const HISTORY_ITEM_MAX = 2000;
const CONTEXT_MAX = 2000;

// Malformed turns are dropped, not rejected: history only improves an answer.
function sanitizeHistory(raw: unknown): ChatHistoryItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m): m is ChatHistoryItem =>
      (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim() !== "")
    .slice(-HISTORY_TURNS)
    .map(({ role, content }) => ({ role, content: content.slice(0, HISTORY_ITEM_MAX) }));
}

// Helper for Groq Cloud API
async function callGroq(
  question: string,
  role: string,
  context: string,
  history: ChatHistoryItem[],
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

    const chapterContext = typeof context === "string" ? context.slice(0, CONTEXT_MAX).trim() : "";

    // 1. Groq, when GROQ_API_KEY is configured
    const groqAnswer = await callGroq(question, role, chapterContext, sanitizeHistory(history));
    if ("text" in groqAnswer) {
      return { status: 200, body: { answer: groqAnswer.text, source: "groq", model: groqAnswer.model } };
    }

    console.log("[AI Bridge] Serving request via expert knowledge base fallback");

    // 2. Fallback: the built-in knowledge base (server/knowledge-base.ts)
    return {
      status: 200,
      body: {
        answer: fallbackAnswer(question, chapterContext),
        source: "fallback",
        // A Groq model refused with 429: the client says the free quota ran out, not that the AI is offline
        ...(groqAnswer.rateLimited && { reason: "rate_limited" }),
      },
    };
  } catch (err: any) {
    return { status: 500, body: { error: err.message || "มีบางอย่างผิดพลาด ลองใหม่อีกครั้ง" } };
  }
}
