// The /api/ask-ai logic, shared by the Express server (local dev, Cloud Run) and the Vercel
// function in api/ask-ai.ts, which is what serves the route on Vercel. Answers come from Groq, then
// Gemini, each only when its key is set; when neither answers, a built-in knowledge base does.
import { compactHistory, type ChatHistoryItem } from "../src/lib/chatHistory.js";
import { fallbackAnswer } from "./knowledge-base.js";

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

const EARLIER_QUESTIONS_NOTE = `หัวข้อที่ผู้ใช้เคยถามไปก่อนหน้านี้ในแชทนี้ (ใช้เป็นพื้นหลังเท่านั้น ถ้าคำถามใหม่อ้างถึง "ข้อนั้น" "ที่ว่ามา" หรือ "ข้อแรก" ให้หมายถึงคำตอบล่าสุดของคุณ):`;

// Models tried in order, all checked to answer Thai well. Groq's /models list is not usable
// here: it is unordered and led by allam-2-7b (an Arabic model that answers Thai with gibberish)
// and text-to-speech models. A model Groq retires just fails and the next one is tried.
// Not qwen first: its free tier allows 1,000 output tokens a minute, less than one ~1,400-token
// answer, so Groq refuses most requests to it up front.
const GROQ_MODELS = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"];
// Gemini's free tier counts its quota apart from Groq's, so it can still answer once Groq is used up.
// Stable models only: preview ones get tighter limits and are shut down without notice.
const GEMINI_MODELS = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];

// Thai costs several tokens per word; a full answer runs ~1,400 tokens, so 1,024 cut answers mid-list.
const MAX_TOKENS = 4096;
// A full answer takes 2-5 s; leave room before giving up on a model and trying the next.
const TIMEOUT_MS = 20_000;

// History and context come from the client, so they are bounded here too: every request must fit
// Groq's free tier of 8,000 tokens a minute per model.
const HISTORY_ITEM_MAX = 2000;
const CONTEXT_MAX = 2000;

interface Provider {
  name: "groq" | "gemini";
  label: string;
  url: string;
  apiKey?: string;
  models: string[];
  // Request fields only this provider takes
  options?: Record<string, unknown>;
}

// <NAME>_MODEL, when set, goes first
function modelsWithEnvFirst(envModel: string | undefined, models: string[]): string[] {
  const first = envModel?.trim();
  return first ? [first, ...models.filter((m) => m !== first)] : models;
}

// Read on every request: tests and the dev server change the environment after import
function providers(): Provider[] {
  return [
    {
      name: "groq",
      label: "Groq",
      url: "https://api.groq.com/openai/v1/chat/completions",
      apiKey: process.env.GROQ_API_KEY?.trim(),
      models: modelsWithEnvFirst(process.env.GROQ_MODEL, GROQ_MODELS),
    },
    {
      name: "gemini",
      label: "Gemini",
      url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      apiKey: process.env.GEMINI_API_KEY?.trim(),
      models: modelsWithEnvFirst(process.env.GEMINI_MODEL, GEMINI_MODELS),
      // Gemini 3 always thinks, and thinking spends the same token cap and time the answer needs
      options: { reasoning_effort: "low" },
    },
  ];
}

// Malformed turns are dropped, not rejected: history only improves an answer.
function sanitizeHistory(raw: unknown): ChatHistoryItem[] {
  if (!Array.isArray(raw)) return [];
  const valid = raw.filter((m): m is ChatHistoryItem =>
    (m?.role === "user" || m?.role === "assistant") && typeof m.content === "string" && m.content.trim() !== "");
  return compactHistory(valid).map(({ role, content }) => ({ role, content: content.slice(0, HISTORY_ITEM_MAX) }));
}

// The latest exchange stays as real turns, so a follow-up can point into that answer. Earlier
// questions, whose answers are no longer sent, only tell the model what the chat has covered.
function buildMessages(question: string, role: string, context: string, history: ChatHistoryItem[]) {
  const answerAt = history.findIndex((m) => m.role === "assistant");
  const lastTurn = answerAt > 0 && history[answerAt - 1].role === "user" ? history.slice(answerAt - 1, answerAt + 1) : [];
  const earlier = history
    .filter((m) => m.role === "user" && !lastTurn.includes(m))
    .map((m) => `- ${m.content.replace(/\s+/g, " ").trim()}`);
  // Background, not the topic: listed next to the new question, a model answered "what did the
  // first point mean?" about the oldest question instead of the latest answer
  const system = earlier.length ? `${SYSTEM_INSTRUCTION}\n\n${EARLIER_QUESTIONS_NOTE}\n${earlier.join("\n")}` : SYSTEM_INSTRUCTION;

  const userRoleText = role === 'business' ? 'ฝั่ง Business' : role === 'engineer' ? 'ฝั่ง Engineer' : 'ทั้งสองฝั่ง';
  const userContent = `[ผู้ใช้งานระบุมุมมอง: ${userRoleText}]\n${context ? `[บริบทเพิ่มเติม]: ${context}\n` : ''}\n[คำถาม]: ${question}\n\nตอบให้ชัด แบ่งเป็นข้อคิดกับวิธีแก้ที่ใช้ได้จริงในที่ทำงาน:`;

  return [
    { role: "system", content: system },
    ...lastTurn,
    { role: "user", content: userContent },
  ];
}

// Tries the provider's models in order through its OpenAI-compatible endpoint
async function callProvider(
  provider: Provider,
  messages: { role: string; content: string }[],
): Promise<{ text: string; model: string } | { rateLimited: boolean }> {
  if (!provider.apiKey) return { rateLimited: false };

  let rateLimited = false;
  for (const model of provider.models) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(provider.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.6,
          max_tokens: MAX_TOKENS,
          ...provider.options,
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
        const err = await res.text().catch(() => "");
        // "Request too large" is a 429 too, but it refuses one oversized answer: the quota is not used up
        if (res.status === 429 && !err.includes("Request too large")) rateLimited = true;
        // Long enough for a 429 to name the limit it hit (per minute or per day) and when it resets
        console.warn(`[${provider.label} ${model}] Failed (${res.status}):`, err.slice(0, 300));
      }
    } catch (e: any) {
      console.warn(`[${provider.label} ${model}] Error:`, e?.message || e);
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
    const messages = buildMessages(question, role, chapterContext, sanitizeHistory(history));

    // 1. Groq, then Gemini: each only when its API key is configured
    let rateLimited = false;
    for (const provider of providers()) {
      const result = await callProvider(provider, messages);
      if ("text" in result) {
        return { status: 200, body: { answer: result.text, source: provider.name, model: result.model } };
      }
      rateLimited ||= result.rateLimited;
    }

    console.log("[AI Bridge] Serving request via expert knowledge base fallback");

    // 2. Fallback: the built-in knowledge base (server/knowledge-base.ts)
    return {
      status: 200,
      body: {
        answer: fallbackAnswer(question, chapterContext),
        source: "fallback",
        // A model refused with 429: the client says the free quota ran out, not that the AI is offline
        ...(rateLimited && { reason: "rate_limited" }),
      },
    };
  } catch (err: any) {
    return { status: 500, body: { error: err.message || "มีบางอย่างผิดพลาด ลองใหม่อีกครั้ง" } };
  }
}
