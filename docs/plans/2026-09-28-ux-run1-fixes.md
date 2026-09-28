# UX Run-1 Fixes (F-01…F-07) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the seven findings of UX run 2026-09-25: AI answer shape and site overview (F-01), raw `<br>`/`**` in AI answers (F-02), scroll carried across tabs (F-03), silent chip taps (F-04), nested chat scroll on mobile (F-05), clipped chip rows with no cue (F-06), and a first quiz question from an unread chapter (F-07).

**Architecture:** Every rule lives in a small pure module with a colocated Vitest file (`answerMarkdown`, `tabScroll`, `scrollEdges`, the quiz ordering helpers in `quizRounds`). Components only wire those rules in: `server/knowledge-base.ts` gains `SITE_OVERVIEW` for the prompt and the fallback; `AIAssistantTab` gets an `AnswerMarkdown` renderer, a `QuickPromptChips` row, scroll-to-question and a mobile layout; `App` runs one layout effect on tab change; a `ScrollFade` wrapper (with `useScrollEdges`) goes on the three chip rows; `QuizTab` orders each round once, from the chapters just read.

**Tech Stack:** React 19, Vite 8.3, TypeScript 7 (`tsc --noEmit`), Tailwind 4, react-markdown 10 + remark-gfm 4, Vitest 5.0.1 (node environment), Express dev server (`tsx server.ts`), esbuild server bundle.

**Spec:** `docs/specs/2026-09-28-section-consolidation-and-ux-run1.md`, **Part B only** (§B.0–B.10). Part A (section consolidation) is a separate plan. Nothing here depends on Part A landing first; Part A only shrinks the outline to 6–9 chips, and the F-06 fade is driven by measured overflow, not chip count.

## Global Constraints

- Every quoted Thai string in this plan or in spec Part B is literal copy to ship, character for character (prompt rules, `SITE_OVERVIEW`, the quiz hint `ชุดพื้นฐานมีคำถามจากบทที่ ${n} ที่คุณเพิ่งอ่าน` and its button `ไปชุดพื้นฐาน`). Code and comments are in English.
- Tests: `npm test` (script `vitest run`); one file: `npx vitest run <path>`. Never `bun test` (Bun's own runner cannot load `CHAPTERS`).
- Test files import from `vitest` explicitly. Default `node` environment. No DOM library (no jsdom, happy-dom, testing-library). Components are tested with `renderToStaticMarkup`; anything that needs real layout or scrolling is checked in the browser (Task 8).
- Server modules (`server/*.ts`, and anything `api/*.ts` imports) import local files with a `.js` extension. `api/esm-imports.test.ts` enforces it. `server/knowledge-base.ts` imports only the four chapter files, never `src/data/chaptersData` (bundle size; see its header comment).
- No new dependencies. No `rehype-raw`. Do not import `hast`/`unified` types directly (knip flags unlisted dependencies).
- Every `<button>` under `src/components/` carries a tap-target class (`TAP`, `TAP_Y`, `TAP_POSITIONED`, or `TAP_GAP[n]` where n equals the parent row's real gap in px). `src/components/ui/tapTargets.test.ts` enforces this.
- Colour classes are theme tokens only (`base-*`, `primary`, …). `src/components/ui/colorTokens.test.ts` enforces this.
- **Line numbers** cite HEAD `4524b12` and shift as tasks land. Find each block by the code quoted in the step. Large files (`GuideTab.tsx` 950 lines): read by range or with Serena, never whole.
- **Completion gate for every task:** `npm run lint` (tsc + knip), `npm test`, `npm run build` all pass, with **no warning that is not in the baseline** recorded in Task 1 Step 2. The build runs esbuild with `--log-override:empty-import-meta=error`. For each new warning, fix it, or suppress it at the narrowest scope with a comment saying why. Name each warning and what you did about it in the task report.
- Commits: conventional (`fix(ai): …`, `fix(quiz): …`), each message ending with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Branch `fix/ux-run1`.
- UI tasks are browser-verified once, in Task 8 (360×640 and 1440px). Tasks 1–7 end at the gate and a commit.

## Review Focus

1. **Role change during a started quiz run.** A reader answers Q1, then changes role in the header. The run must keep its question order: a reorder under a running `QuizRun` puts the question and its shuffled options out of step, because `shuffledOptions` is built once from the first order. Pinned by `QuizTab` ordering each round once and keeping that order (Task 7, Step 5), and by the Task 8 F-07 check.
2. **Site question asked with a chapter attached.** "ถาม AI" from a chapter sends `context`. The fallback must still return the site overview, not the chapter summary. Pinned by a fallback test in Task 1.
3. **Markdown the repair must not touch.** Fenced code, `<br>` inside inline code, `***bold italic***`, and bold between two Thai letters (`คำ**หนา**คำ`) must come out unchanged. A Thai tone mark before `**(` must count as a letter (`ที่**(ด่วน)**`). Pinned by `answerMarkdown.test.ts` in Task 2.
4. **Chip rows whose content changes without a resize.** A new chapter's outline chips, or glossary counts after a side filter, change `scrollWidth` but not the row's box, so a `ResizeObserver` alone misses them. `useScrollEdges` re-measures after every render (Task 6), and Task 8 checks the fade after a chapter change.
5. **Fade colour matches its surface.** The mobile index drawer's filter row sits on `bg-base-300`, not `bg-base-100`. A fade in the wrong colour shows as a light bar. Pinned by the `fadeFrom` test in Task 6 and the drawer check in Task 8.

---

## File map

| Path | Task | Responsibility |
|---|---|---|
| `server/knowledge-base.ts` | 1 | `SITE_OVERVIEW`; canned site answer as a list |
| `server/ask-ai.ts` | 1 | Thai-only answer rules + overview in `SYSTEM_INSTRUCTION`; user turn ends at the question |
| `api/ask-ai.test.ts` | 1 | prompt, Gemini parity and fallback tests |
| `src/lib/answerMarkdown.ts` (+ `.test.ts`) | 2 | `normalizeAnswerMarkdown`, `rehypeLineBreaks`, `LINE_SEPARATOR` |
| `src/components/AIAssistantTab.tsx` (+ `.test.tsx`) | 2, 3, 4 | `AnswerMarkdown`; `QuickPromptChips` + scroll to question; mobile page scroll + sticky input |
| `src/lib/tabScroll.ts` (+ `.test.ts`) | 5 | `tabEntryScroll` |
| `src/App.tsx` | 5, 7 | tab-entry scroll layout effect; quiz props |
| `src/lib/scrollEdges.ts` (+ `.test.ts`) | 6 | `scrollEdges` |
| `src/hooks/useScrollEdges.ts` | 6 | measure on scroll, resize and render |
| `src/components/ui/ScrollFade.tsx` | 6 | scroller + two edge fades below `sm` |
| `src/components/ui/Tabs.tsx` (+ `.test.tsx`) | 6 | `scroll` rows use `ScrollFade`; `fadeFrom` prop |
| `src/components/guide/SectionOutline.tsx`, `src/components/glossary/GlossaryPanel.tsx`, `src/components/GuideTab.tsx` | 6 | apply the fade |
| `src/data/quizRounds.ts` (+ `.test.ts`) | 7 | `orderQuizRound`, `quizAnchors`, `quizTrackKey`, `basicsHintChapter` |
| `src/components/QuizTab.tsx` (+ `.test.tsx`) | 7 | per-round order, basics hint |

---

### Task 1: F-01 — Thai answer rules and a site overview for the AI and its fallback

Spec §B.1. This task also creates the branch and records the warning baseline.

**Files:**
- Modify: `server/knowledge-base.ts` (after `const TAKEAWAY_MAX = 220;` at :18; top of `cannedAnswer` at :20-21)
- Modify: `server/ask-ai.ts` (import :5; `SYSTEM_INSTRUCTION` :19-28; `userContent` :111)
- Test: `api/ask-ai.test.ts`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces: `export const SITE_OVERVIEW: string` in `server/knowledge-base.ts`. Only `server/ask-ai.ts` and `api/ask-ai.test.ts` use it.

- [ ] **Step 1: Create the branch**

```bash
cd /Users/Pathompong/Sites/Personal/biz-dev-guide
git switch main && git switch -c fix/ux-run1
```

- [ ] **Step 2: Record the warning baseline**

Run each command and copy every warning line (tsc, knip, vitest stderr `warn`, vite and esbuild) into `work/ux-run1-baseline.md` (`work/` is gitignored). Later tasks compare their gate output against this file.

```bash
mkdir -p work
npm run lint 2>&1 | tee work/ux-run1-lint.txt | tail -20
npm test 2>&1 | tee work/ux-run1-test.txt | tail -20
npm run build 2>&1 | tee work/ux-run1-build.txt | grep -iE "warn|error" || echo "no build warnings"
```

Expected: all three pass. `npm test` prints `[Groq …] Failed (503)` lines from the existing failure-path tests in `api/ask-ai.test.ts`. That is logged output, not a warning; note it in the baseline as existing.

- [ ] **Step 3: Write the failing tests**

In `api/ask-ai.test.ts`, change the imports at the top:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './ask-ai';
import { SITE_OVERVIEW } from '../server/knowledge-base';
import { CHAPTERS } from '../src/data/chaptersData';
```

In `describe('POST /api/ask-ai with Groq', …)`, add after the test `'caps the context at 2,000 chars and ignores a non-string one'`:

```ts
  it('ends the user turn at the question, with no fixed answer structure (F-01)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(groqReply('คำตอบ'));
    vi.stubGlobal('fetch', fetchMock);

    await post(JSON.stringify({ question: 'เว็บนี้ทำอะไรได้บ้าง' }));
    const user = sentMessages(fetchMock).at(-1).content;
    expect(user.endsWith('[คำถาม]: เว็บนี้ทำอะไรได้บ้าง')).toBe(true);
    expect(user).not.toContain('แบ่งเป็นข้อคิด');
  });

  it('gives the model Thai-only rules and the site overview (F-01)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(groqReply('คำตอบ'));
    vi.stubGlobal('fetch', fetchMock);

    await post(JSON.stringify({ question: 'q' }));
    const system = sentMessages(fetchMock)[0].content;
    expect(system).toContain(`GUIDE คู่มือ ${CHAPTERS.length} บท`);
    expect(system).toContain(`ถ้าผู้ใช้ถามว่าเว็บนี้คืออะไรหรือทำอะไรได้ ให้ตอบจากข้อมูลนี้ สั้นๆ เป็นรายการ:\n${SITE_OVERVIEW}`);
    expect(system).toContain('ห้ามใช้ HTML ทุกชนิด รวมถึง <br>');
    expect(system).toContain('หัวข้อทุกระดับเป็นภาษาไทย');
    expect(system).not.toMatch(/\((Insights|Actionable|Friction|Real-world)/i);
    expect(system).not.toContain('สองด้านเสมอ');
  });
```

In `describe('POST /api/ask-ai with Gemini after Groq', …)`, replace its `afterEach` with:

```ts
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
```

and add after `'asks Gemini once every Groq model has failed'`:

```ts
  it('sends Gemini exactly the messages Groq got (F-01)', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {}); // the three Groq failures are expected here
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('down', { status: 503 }))
      .mockResolvedValueOnce(new Response('down', { status: 503 }))
      .mockResolvedValueOnce(new Response('down', { status: 503 }))
      .mockResolvedValueOnce(reply('คำตอบจาก Gemini'));
    vi.stubGlobal('fetch', fetchMock);

    const history = [{ role: 'user', content: 'q1' }, { role: 'assistant', content: 'a1' }];
    await post(JSON.stringify({ question: 'เว็บนี้ทำอะไรได้บ้าง', history, context: 'บทที่ 2 · x' }));
    const sent = calls(fetchMock);
    expect(sent[3].url).toBe(GEMINI_URL);
    expect(sent[3].messages).toEqual(sent[0].messages);
  });
```

In `describe('POST /api/ask-ai fallback knowledge base', …)`, add before `'falls back to the general advice when nothing matches'`:

```ts
  it('answers "what does this site do" with the site overview as a list (F-01)', async () => {
    const data = await ask({ question: 'เว็บนี้ทำอะไรได้บ้าง' });
    expect(data.answer).toContain(`- GUIDE คู่มือ ${CHAPTERS.length} บท`);
    expect(data.answer).toContain('- AI BRIDGE');
    expect(data.answer).toContain('- QUIZ');
    expect(data.answer).not.toContain('คำแนะนำเพื่อการทำงานร่วมกัน');
  });

  it('answers "คุณคือใคร" with the overview too', async () => {
    const data = await ask({ question: 'คุณคือใคร' });
    expect(data.answer).toContain('- AI BRIDGE');
  });

  it('keeps the overview ahead of the chapter being read', async () => {
    const data = await ask({ question: 'แอปนี้ใช้ยังไง', context: 'บทที่ 9 · Tech Debt และ Refactor: x\nใจความสำคัญ: y' });
    expect(data.answer).toContain('- AI BRIDGE');
    expect(data.answer).not.toContain('บทที่คุณกำลังอ่าน');
  });
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `npx vitest run api/ask-ai.test.ts`
Expected: FAIL. The user-turn test fails `endsWith` (the turn still ends `…ในที่ทำงาน:`). The system-prompt test fails on `GUIDE คู่มือ 19 บท`. The three fallback overview tests fail: `GENERIC_ANSWER` or the chapter summary comes back instead. The Gemini parity test already passes; it pins behaviour that exists today.

- [ ] **Step 5: Add `SITE_OVERVIEW` and the canned site answer**

In `server/knowledge-base.ts`, insert after `const TAKEAWAY_MAX = 220;`:

```ts
// What the site offers, for "what is this site?" questions: the AI prompt (server/ask-ai.ts) and
// the fallback below answer from the same text. The chapter count is derived, never typed in.
const SITE_INTRO = 'เว็บนี้คือคู่มือ "จุดที่ business กับ engineering มาเจอกัน" มี 3 แท็บ:';
const SITE_TABS = [
  `GUIDE คู่มือ ${CHAPTERS.length} บท เลือกสาย (Business / Engineering) และระดับ (Beginner / Experienced) ได้ มีเส้นทางการอ่านตามสาย สารบัญค้นหาและกรองตามสายงาน และบทศัพท์เทคนิค`,
  'AI BRIDGE ถามต่อจากบทที่อ่านอยู่ได้',
  'QUIZ แบบทดสอบ 4 ชุด (พื้นฐาน / สาย Business / สาย Engineering / ทั้งหมด)',
];
export const SITE_OVERVIEW = `${SITE_INTRO} ${SITE_TABS.join(', ')}`;
const SITE_OVERVIEW_LIST = `${SITE_INTRO}\n\n${SITE_TABS.map((tab) => `- ${tab}`).join('\n')}`;
const SITE_QUESTION = /(เว็บ|เว็บไซต์|แอป|ที่นี่)(นี้)?.{0,12}(ทำอะไร|ใช้ยังไง|ใช้อย่างไร|มีอะไร)/;
```

`SITE_OVERVIEW` reproduces the spec text exactly: `SITE_INTRO`, a space, then the three tab texts joined with `, `.

In `cannedAnswer`, make the site question the first case:

```ts
function cannedAnswer(question: string): string | null {
  const q = question.toLowerCase();
  if (SITE_QUESTION.test(q) || q.includes("คุณคือใคร")) return SITE_OVERVIEW_LIST;
  if (q.includes("ปุ่มเดียว") || q.includes("แค่เพิ่ม") || q.includes("button")) {
```

(the rest of the function is unchanged).

- [ ] **Step 6: Rewrite the prompt and the user turn**

In `server/ask-ai.ts`, change the import on line 5:

```ts
import { fallbackAnswer, SITE_OVERVIEW } from "./knowledge-base.js";
```

Replace lines 19-28 (the comment and `SYSTEM_INSTRUCTION`) with:

```ts
// Knowledge base summary for contextual grounding. Thai rules only: the English glosses the old
// prompt carried, e.g. (Actionable advice), came back as answer headings (spec F-01).
const SYSTEM_INSTRUCTION = `คุณคือ "AI Bridge Specialist" ผู้เชี่ยวชาญด้านการเชื่อมช่องว่างระหว่างทีม Business (Product Managers, Business Analysts, UX/UI, Marketing, Executives) และทีม Engineering (Software Engineers, Solution Architects, QA, DevOps, SRE).
อ้างอิงจากคู่มือ "จุดที่ business กับ engineering มาเจอกัน":
- ตอบให้ตรงคำถามก่อน ความยาวและรูปแบบให้ตามคำถาม: คำถามสั้นหรือถามข้อเท็จจริง ตอบสั้นๆ ไม่กี่บรรทัด ใช้หัวข้อหรือตารางเฉพาะเมื่อคำถามต้องการเปรียบเทียบหรือมีหลายขั้นตอน
- อธิบายมุมมองทั้งสองฝั่งเมื่อคำถามเป็นเรื่องที่สองฝั่งเห็นต่างกัน ไม่ต้องทำทุกครั้ง
- หัวข้อทุกระดับเป็นภาษาไทย ห้ามใช้หัวข้อหรือวงเล็บภาษาอังกฤษ ศัพท์เทคนิคที่คนในวงการใช้ทับศัพท์ (เช่น API, Acceptance Criteria) ใช้ในเนื้อความได้
- ห้ามใช้ HTML ทุกชนิด รวมถึง <br> ถ้าในช่องตารางมีหลายประเด็น ให้ใช้รายการนอกตารางแทน
- ใช้ภาษาไทยที่เป็นมิตร ชัดเจน ตรงประเด็น และกระชับ
- ใช้ภาษาพูดง่ายๆ แบบคนอธิบายให้ฟัง ไม่ใช่ภาษาตำรา
- ถ้ามี [บริบทเพิ่มเติม] จากบทในคู่มือ ให้ตอบโดยยึดเนื้อหานั้นเป็นหลัก แล้วค่อยเสริมด้วยความรู้ทั่วไป

ถ้าผู้ใช้ถามว่าเว็บนี้คืออะไรหรือทำอะไรได้ ให้ตอบจากข้อมูลนี้ สั้นๆ เป็นรายการ:
${SITE_OVERVIEW}`;
```

The first two lines (identity and guide name) and the last three rules (tone and context, old :26-28) are kept verbatim. The four new rules replace old :22-25.

Replace line 111 (`const userContent = …`) with:

```ts
  // Ends at the question: a fixed "insights + fixes" suffix made every answer one long template (F-01)
  const userContent = `[ผู้ใช้งานระบุมุมมอง: ${userRoleText}]\n${context ? `[บริบทเพิ่มเติม]: ${context}\n` : ''}\n[คำถาม]: ${question}`;
```

The prompt's `<br>` ban is the model-side defence for F-02 as well. Task 2 handles what models still emit.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run api/ask-ai.test.ts`
Expected: PASS, including the existing `/\n- q1\n- q2 บรรทัดสอง$/` test. The overview sits inside `SYSTEM_INSTRUCTION`, so the earlier-questions note is still appended at the very end.

- [ ] **Step 8: Gate**

Run: `npm run lint && npm test && npm run build`
Expected: all pass. `api/esm-imports.test.ts` passes (the new import keeps `.js`). Compare the warnings with `work/ux-run1-baseline.md`: there are no new ones.

- [ ] **Step 9: Commit**

```bash
git add server/knowledge-base.ts server/ask-ai.ts api/ask-ai.test.ts
git commit -m "$(cat <<'EOF'
fix(ai): answer site questions from an overview and drop the fixed answer template

The user turn now ends at the question. The system prompt uses Thai-only rules
(no English glosses, no HTML) and carries a site overview that the fallback also
returns for "what does this site do".

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: F-02 — Render model line breaks and repair Thai bold in AI answers

Spec §B.2.

**Files:**
- Create: `src/lib/answerMarkdown.ts`
- Test: `src/lib/answerMarkdown.test.ts`
- Modify: `src/components/AIAssistantTab.tsx` (imports :1-25; after `MARKDOWN_COMPONENTS` :43-79; the `<Markdown>` at :271-276)
- Test: `src/components/AIAssistantTab.test.tsx`

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces:
  - `src/lib/answerMarkdown.ts`: `export const LINE_SEPARATOR: string` (U+2028), `export function normalizeAnswerMarkdown(md: string): string`, `export function rehypeLineBreaks(): (tree: HastParent) => void`.
  - `src/components/AIAssistantTab.tsx`: `export function AnswerMarkdown({ content }: { content: string }): JSX.Element`. Tasks 3 and 4 leave it as is.

- [ ] **Step 1: Write the failing pure tests**

Create `src/lib/answerMarkdown.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { LINE_SEPARATOR, normalizeAnswerMarkdown, rehypeLineBreaks } from './answerMarkdown';

describe('normalizeAnswerMarkdown (F-02)', () => {
  it.each(['<br>', '<BR/>', '<br />'])('turns %s in a table row into a line separator and keeps one row', (tag) => {
    const out = normalizeAnswerMarkdown(`| a | 1️⃣ ทำ${tag}2️⃣ ตรวจ |`);
    expect(out).toBe(`| a | 1️⃣ ทำ${LINE_SEPARATOR}2️⃣ ตรวจ |`);
    expect(out.split('\n')).toHaveLength(1);
  });

  it('leaves <br> inside inline code', () => {
    expect(normalizeAnswerMarkdown('ใช้ `<br>` ไม่ได้')).toBe('ใช้ `<br>` ไม่ได้');
  });

  it('adds a space after a closing ** that follows punctuation and precedes a letter', () => {
    expect(normalizeAnswerMarkdown('**ขั้นตอน:**ทำ')).toBe('**ขั้นตอน:** ทำ');
  });

  it('adds a space before an opening ** that follows a letter and precedes punctuation', () => {
    expect(normalizeAnswerMarkdown('ทำ**(ด่วน)**')).toBe('ทำ **(ด่วน)**');
  });

  it('counts a Thai tone mark as part of the letter it sits on', () => {
    expect(normalizeAnswerMarkdown('ที่**(ด่วน)**')).toBe('ที่ **(ด่วน)**');
  });

  it('leaves bold between two letters alone', () => {
    expect(normalizeAnswerMarkdown('คำ**หนา**คำ')).toBe('คำ**หนา**คำ');
  });

  it('drops the unmatched trailing ** of a table cell (s09)', () => {
    expect(normalizeAnswerMarkdown('| **“ขยายความเร็ว”** – ทำแคมเปญเร็วขึ้น** | x |'))
      .toBe('| **“ขยายความเร็ว”** – ทำแคมเปญเร็วขึ้น | x |');
  });

  it('keeps an escaped pipe inside a cell', () => {
    expect(normalizeAnswerMarkdown('| a \\| b** | c |')).toBe('| a \\| b | c |');
  });

  it('does not balance ** outside tables: bold may span the lines of a paragraph', () => {
    expect(normalizeAnswerMarkdown('**เริ่ม\nจบ**')).toBe('**เริ่ม\nจบ**');
  });

  it('leaves fenced code untouched', () => {
    const md = '```html\n<br>\n**ขั้นตอน:**ทำ\n| a** |\n```';
    expect(normalizeAnswerMarkdown(md)).toBe(md);
  });

  it('leaves *** bold italic alone', () => {
    expect(normalizeAnswerMarkdown('***ขั้นตอน:***ทำ')).toBe('***ขั้นตอน:***ทำ');
  });
});

describe('rehypeLineBreaks', () => {
  it('splits text on the line separator into br elements', () => {
    const tree = {
      type: 'root',
      children: [
        { type: 'element', tagName: 'td', properties: {}, children: [{ type: 'text', value: `a${LINE_SEPARATOR}b${LINE_SEPARATOR}c` }] },
      ],
    };
    rehypeLineBreaks()(tree);
    const cell = tree.children[0].children.map((n: { type: string; tagName?: string; value?: string }) => n.tagName ?? n.value);
    expect(cell).toEqual(['a', 'br', 'b', 'br', 'c']);
  });

  it('drops the empty text a leading or trailing separator would leave', () => {
    const tree = { type: 'root', children: [{ type: 'text', value: `${LINE_SEPARATOR}x${LINE_SEPARATOR}` }] };
    rehypeLineBreaks()(tree);
    expect(tree.children.map((n: { tagName?: string; value?: string }) => n.tagName ?? n.value)).toEqual(['br', 'x', 'br']);
  });
});
```

- [ ] **Step 2: Write the failing render test**

In `src/components/AIAssistantTab.test.tsx`, change the import line to:

```tsx
import { AIAssistantTab, AnswerMarkdown, answerSourceLabel, fallbackNotice } from './AIAssistantTab';
```

and append:

```tsx
describe('AnswerMarkdown (F-02)', () => {
  // The s09 answer from run 2026-09-25: a <br> list and an unmatched ** in table cells.
  const S09 = [
    '| กลยุทธ์ | วิธีทำ |',
    '|---|---|',
    '| **“ขยายความเร็ว”** – ทำแคมเปญเร็วขึ้น** | **ขั้นตอน:**1️⃣ วางแผน<br>2️⃣ ทำ<br>3️⃣ วัดผล |',
  ].join('\n');

  it('renders cell line breaks as <br> with no raw <br> or ** left', () => {
    const html = renderToStaticMarkup(<AnswerMarkdown content={S09} />);
    expect(html).toContain('<table');
    expect(html).not.toContain('&lt;br');
    expect(html).not.toContain('**');
    expect(html.match(/<br\/>/g)).toHaveLength(2);
    expect(html).toMatch(/<strong[^>]*>ขั้นตอน:<\/strong>/);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/lib/answerMarkdown.test.ts src/components/AIAssistantTab.test.tsx`
Expected: FAIL. `answerMarkdown.test.ts` cannot resolve `./answerMarkdown`. `AnswerMarkdown` is not exported (`Element type is invalid … got: undefined`).

- [ ] **Step 4: Implement `src/lib/answerMarkdown.ts`**

```ts
// Repairs the Markdown AI models emit before react-markdown renders it (spec F-02).
// HTML stays escaped, never parsed (no rehype-raw: that would open a raw-HTML surface for model
// output). A model's <br> becomes LINE_SEPARATOR instead, and rehypeLineBreaks renders that as a
// real <br> element.

/** U+2028 LINE SEPARATOR: not a Markdown line ending, so a table row that carries it stays one row. */
export const LINE_SEPARATOR = ' ';

const BR_TAG = /<br\s*\/?>/gi;
const FENCE = /^\s*(```|~~~)/;
const INLINE_CODE = /(`[^`\n]*`)/;
// A bold delimiter that is not part of *** (bold italic is left alone).
const BOLD = /(?<!\*)\*\*(?!\*)/g;
// CommonMark counts Unicode punctuation and symbols as punctuation when it decides flanking.
const PUNCT = /[\p{P}\p{S}]/u;
// Thai vowel and tone marks are \p{M}: they flank like the letter they sit on.
const WORD = /[\p{L}\p{N}\p{M}]/u;

/** <br> outside inline code becomes LINE_SEPARATOR. */
function replaceBreaks(line: string): string {
  return line
    .split(INLINE_CODE)
    .map((seg, i) => (i % 2 === 1 ? seg : seg.replace(BR_TAG, LINE_SEPARATOR)))
    .join('');
}

/**
 * Thai puts no space between words, so in `**ขั้นตอน:**ทำ` the closing ** (after punctuation,
 * before a letter) is not right-flanking and never closes. Adds one space after such a closing
 * delimiter, and one space before an opening ** that follows a letter and precedes punctuation.
 * Delimiters pair up in order within the text given (one line, or one table cell).
 */
function repairFlanking(text: string): string {
  let out = '';
  let last = 0;
  let count = 0;
  for (const m of text.matchAll(BOLD)) {
    const at = m.index;
    const before = text[at - 1] ?? '';
    const after = text[at + 2] ?? '';
    const opening = count % 2 === 0;
    count++;
    out += text.slice(last, at);
    if (!opening && PUNCT.test(before) && WORD.test(after)) out += '** ';
    else if (opening && WORD.test(before) && PUNCT.test(after)) out += ' **';
    else out += '**';
    last = at + 2;
  }
  return out + text.slice(last);
}

/** A cell with an odd number of ** loses its last one, so no stray ** shows as text. */
function balanceCell(cell: string): string {
  const matches = [...cell.matchAll(BOLD)];
  if (matches.length % 2 === 0) return cell;
  const at = matches[matches.length - 1].index;
  return cell.slice(0, at) + cell.slice(at + 2);
}

/** Cells only: in a paragraph, bold may legitimately span lines. */
function repairTableRow(line: string): string {
  return line
    .split(/(?<!\\)\|/)
    .map((cell) => repairFlanking(balanceCell(cell)))
    .join('|');
}

export function normalizeAnswerMarkdown(md: string): string {
  let inFence = false;
  return md
    .split('\n')
    .map((line) => {
      if (FENCE.test(line)) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      const withBreaks = replaceBreaks(line);
      return withBreaks.trimStart().startsWith('|') ? repairTableRow(withBreaks) : repairFlanking(withBreaks);
    })
    .join('\n');
}

// Minimal HAST shapes: enough for this walk, without importing `hast` types (not a direct dependency).
interface HastText { type: 'text'; value: string }
interface HastElement { type: 'element'; tagName: string; properties: Record<string, unknown>; children: HastNode[] }
interface HastParent { type: string; children?: HastNode[] }
type HastNode = HastText | HastElement | HastParent;

const isText = (node: HastNode): node is HastText => node.type === 'text';

function splitBreaks(parent: HastParent): void {
  if (!parent.children) return;
  parent.children = parent.children.flatMap((child): HastNode[] => {
    if (!isText(child)) {
      splitBreaks(child);
      return [child];
    }
    if (!child.value.includes(LINE_SEPARATOR)) return [child];
    return child.value.split(LINE_SEPARATOR).flatMap((value, i): HastNode[] => {
      const text: HastText[] = value ? [{ type: 'text', value }] : [];
      if (i === 0) return text;
      const br: HastElement = { type: 'element', tagName: 'br', properties: {}, children: [] };
      return [br, ...text];
    });
  });
}

/** Rehype plugin: each LINE_SEPARATOR in a text node becomes a <br> element. */
export function rehypeLineBreaks() {
  return (tree: HastParent) => splitBreaks(tree);
}
```

- [ ] **Step 5: Wire `AnswerMarkdown` into the chat**

In `src/components/AIAssistantTab.tsx`, add after the `import { buildChatHistory } …` line:

```tsx
import { normalizeAnswerMarkdown, rehypeLineBreaks } from '../lib/answerMarkdown';
```

Insert directly after the closing `};` of `MARKDOWN_COMPONENTS`:

```tsx
const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeLineBreaks];

/** An AI answer: model Markdown repaired (spec F-02), then rendered with the chat's components. */
export function AnswerMarkdown({ content }: { content: string }) {
  return (
    <Markdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={MARKDOWN_COMPONENTS}>
      {normalizeAnswerMarkdown(content)}
    </Markdown>
  );
}
```

Replace the message renderer (now around :283-288):

```tsx
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={MARKDOWN_COMPONENTS}
                    >
                      {msg.content}
                    </Markdown>
```

with:

```tsx
                    <AnswerMarkdown content={msg.content} />
```

`copyToClipboard(msg.content, …)` still copies the model's original text. That is intended: the copy is what the model sent.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/lib/answerMarkdown.test.ts src/components/AIAssistantTab.test.tsx`
Expected: PASS.

- [ ] **Step 7: Gate**

Run: `npm run lint && npm test && npm run build`
Expected: all pass. knip reports nothing: `LINE_SEPARATOR` is used by the module itself and its test, and `AnswerMarkdown` by its test. No new warnings compared with the baseline.

- [ ] **Step 8: Commit**

```bash
git add src/lib/answerMarkdown.ts src/lib/answerMarkdown.test.ts src/components/AIAssistantTab.tsx src/components/AIAssistantTab.test.tsx
git commit -m "$(cat <<'EOF'
fix(ai): render model line breaks and repair Thai bold in answers

A <br> from the model becomes a real line break inside table cells, without
parsing HTML. Bold that Thai text leaves unclosed is repaired, and a stray **
in a table cell is dropped.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: F-04 — Show the question and disable the chips while an answer loads

Spec §B.4. Same file as Task 4: do this task first, then Task 4.

**Files:**
- Modify: `src/components/AIAssistantTab.tsx` (React import :1; new component after `fallbackNotice` :91-95; state :118-121; `handleSend` :123-179; chips block :244-254; message wrapper :262-265)
- Test: `src/components/AIAssistantTab.test.tsx`

**Interfaces:**
- Consumes: `AnswerMarkdown` from Task 2 (untouched).
- Produces: `export function QuickPromptChips(props: { loading: boolean; activePrompt: string | null; onPick: (prompt: string) => void }): JSX.Element`. Each message wrapper carries `data-msg-id={msg.id}`.

- [ ] **Step 1: Write the failing tests**

In `src/components/AIAssistantTab.test.tsx`, change the import line to:

```tsx
import { AIAssistantTab, AnswerMarkdown, QuickPromptChips, answerSourceLabel, fallbackNotice } from './AIAssistantTab';
```

and append:

```tsx
describe('QuickPromptChips (F-04)', () => {
  const AC_PROMPT = 'ช่วยเขียน Acceptance Criteria ให้ระบบชำระเงิน';
  const chips = (html: string) => html.split('</button>').slice(0, -1);

  it('disables every chip while an answer loads and spins only the tapped one', () => {
    const html = renderToStaticMarkup(<QuickPromptChips loading activePrompt={AC_PROMPT} onPick={() => {}} />);
    const all = chips(html);
    expect(all).toHaveLength(5);
    expect(all.every((c) => /<button[^>]*disabled=""/.test(c))).toBe(true);
    expect(all.map((c) => c.includes('animate-spin'))).toEqual([false, true, false, false, false]);
    expect(all[1]).toContain(AC_PROMPT);
    expect(html).toContain('disabled:opacity-60');
    expect(html).toContain('disabled:cursor-not-allowed');
  });

  it('is enabled and spinner-free when idle', () => {
    const html = renderToStaticMarkup(<QuickPromptChips loading={false} activePrompt={null} onPick={() => {}} />);
    expect(html).not.toContain('disabled=""');
    expect(html).not.toContain('animate-spin');
  });
});

describe('chat messages are scroll targets (F-04)', () => {
  it('each message carries its id and clears the sticky header when scrolled to', () => {
    const html = renderToStaticMarkup(<AIAssistantTab />);
    expect(html).toMatch(/<div data-msg-id="welcome" class="[^"]*scroll-mt-\[calc\(var\(--header-h\)\+8px\)\]/);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/AIAssistantTab.test.tsx`
Expected: FAIL. `QuickPromptChips` is undefined (`Element type is invalid`), and the `data-msg-id` pattern does not match.

- [ ] **Step 3: Extract `QuickPromptChips`**

In `src/components/AIAssistantTab.tsx`, change line 1 to:

```tsx
import React, { useEffect, useState } from 'react';
```

Insert after the `fallbackNotice` function:

```tsx
/** The suggested-question row. Disabled while an answer loads, so a second tap is not silently dropped (F-04). */
export function QuickPromptChips({ loading, activePrompt, onPick }: {
  loading: boolean;
  /** The chip whose question is being answered; it shows the spinner. */
  activePrompt: string | null;
  onPick: (prompt: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {QUICK_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          type="button"
          disabled={loading}
          onClick={() => onPick(prompt)}
          className={`${TAP_GAP[8]} text-xs px-3 py-1.5 rounded-xl bg-base-100 hover:bg-base-300 text-base-content-body border border-base-border hover:border-base-border-strong transition-all text-left cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-not-allowed`}
        >
          {loading && prompt === activePrompt && (
            <Loader2 className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5 animate-spin" />
          )}
          {prompt}
        </button>
      ))}
    </div>
  );
}
```

`TAP_GAP[8]` matches the row's `gap-2` (8px). `tapTargets.test.ts` reads the gap from this parent `<div>`.

Replace the old chip row inside the component (the `<div className="flex flex-wrap gap-2">` … `</div>` block under `คำถามยอดฮิตที่เลือกถามได้ทันที:`) with:

```tsx
        <QuickPromptChips loading={isLoading} activePrompt={activePrompt} onPick={handleSend} />
```

- [ ] **Step 4: Scroll to the new question**

Below `const [copiedId, setCopiedId] = useState<string | null>(null);` add:

```tsx
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  // Set by handleSend; the effect scrolls the new question to the top once it has rendered (F-04).
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);

  // To the question, not the end of the answer: the answer then reads from its top. scrollIntoView
  // scrolls every ancestor, so this works in the desktop box and on the mobile page (F-05).
  useEffect(() => {
    if (!pendingScrollId) return;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .querySelector(`[data-msg-id="${pendingScrollId}"]`)
      ?.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    setPendingScrollId(null);
  }, [messages, pendingScrollId]);
```

In `handleSend`, replace:

```tsx
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);
```

with:

```tsx
    setMessages((prev) => [...prev, userMsg]);
    setPendingScrollId(userMsg.id);
    setActivePrompt(questionText ?? null);
    setInputQuestion('');
    setIsLoading(true);
```

and replace:

```tsx
    } finally {
      setIsLoading(false);
    }
```

with:

```tsx
    } finally {
      setIsLoading(false);
      setActivePrompt(null);
    }
```

Message ids are `Date.now()` digits or `welcome`, so the attribute selector needs no escaping.

- [ ] **Step 5: Mark messages as scroll targets**

Replace the message wrapper:

```tsx
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
            >
```

with:

```tsx
            <div
              key={msg.id}
              data-msg-id={msg.id}
              className={`flex items-start gap-3 scroll-mt-[calc(var(--header-h)+8px)] ${isAi ? '' : 'flex-row-reverse'}`}
            >
```

`--header-h` is published on `<html>` by GuideTab (`GuideTab.tsx:175-186`). The app always mounts on the guide tab first, so the variable is set before the AI tab can open.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/components/AIAssistantTab.test.tsx src/components/ui/tapTargets.test.ts`
Expected: PASS. The tap-target guard still finds the chip button with `TAP_GAP[8]` in a `gap-2` row.

- [ ] **Step 7: Gate**

Run: `npm run lint && npm test && npm run build`
Expected: all pass. No new warnings.

- [ ] **Step 8: Commit**

```bash
git add src/components/AIAssistantTab.tsx src/components/AIAssistantTab.test.tsx
git commit -m "$(cat <<'EOF'
fix(ai): show the question and disable the chips while an answer loads

Tapping a suggested question scrolls it to the top of the view, and the
chips are disabled, with a spinner on the tapped one, until the answer arrives.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: F-05 — Let the page scroll the chat on mobile, with the input pinned

Spec §B.5. Same file as Task 3; start from Task 3's commit.

**Files:**
- Modify: `src/components/AIAssistantTab.tsx` (thread `<div>` at old :258; input wrapper at old :329; quota note at old :379-381)
- Test: `src/components/AIAssistantTab.test.tsx`

**Interfaces:**
- Consumes: Task 3's `data-msg-id` scroll (it scrolls the page once the thread is no longer a scroll box).
- Produces: markers `data-chat-thread`, `data-chat-input`, and `data-quota-note="mobile" | "desktop"`. Task 8 uses them.

- [ ] **Step 1: Write the failing tests**

In `src/components/AIAssistantTab.test.tsx`, replace the whole `describe('free-tier note', …)` block with:

```tsx
describe('mobile chat layout (F-05)', () => {
  const html = renderToStaticMarkup(<AIAssistantTab />);
  const classesOf = (marker: string) =>
    (html.match(new RegExp(`<div ${marker}[^>]*class="([^"]*)"`))?.[1] ?? '').split(' ');

  it('the thread is a scroll box from sm only; below sm the page scrolls', () => {
    const thread = classesOf('data-chat-thread="true"');
    expect(thread).toEqual(expect.arrayContaining(['sm:min-h-[420px]', 'sm:max-h-[600px]', 'sm:overflow-y-auto']));
    const sizing = thread.filter((c) => /(^|:)(min-h|max-h|overflow-y)-/.test(c));
    expect(sizing.every((c) => c.startsWith('sm:'))).toBe(true);
  });

  it('the input block sticks to the bottom below sm', () => {
    const input = classesOf('data-chat-input="true"');
    expect(input).toEqual(expect.arrayContaining(['max-sm:sticky', 'max-sm:bottom-0', 'max-sm:z-20', 'max-sm:bg-base-200']));
    expect(input).toContain('max-sm:pb-[max(0.5rem,env(safe-area-inset-bottom))]');
  });

  it('the free-tier note sits under the input from sm and under the thread below sm, outside the sticky block', () => {
    const note = 'AI ตัวนี้ใช้ Groq และ Gemini แบบฟรี';
    expect(html.split(note)).toHaveLength(3);
    expect(html).toMatch(/<p data-quota-note="mobile" class="sm:hidden[^"]*">AI ตัวนี้ใช้/);
    expect(html).toMatch(/<p data-quota-note="desktop" class="max-sm:hidden[^"]*">AI ตัวนี้ใช้/);
    const mobileAt = html.indexOf('data-quota-note="mobile"');
    expect(mobileAt).toBeGreaterThan(html.indexOf('data-chat-thread'));
    expect(mobileAt).toBeLessThan(html.indexOf('data-chat-input'));
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/AIAssistantTab.test.tsx`
Expected: FAIL. `data-chat-thread` and `data-chat-input` are missing, and the note appears once.

- [ ] **Step 3: Implement**

In `src/components/AIAssistantTab.tsx`, add after `QUICK_PROMPTS`:

```tsx
const QUOTA_NOTE = 'AI ตัวนี้ใช้ Groq และ Gemini แบบฟรี จำกัดจำนวนคำถามต่อนาทีและต่อวัน ถ้าถามถี่เกินไป ระบบจะสลับ model หรือตอบจากคลังความรู้ในตัวแทน';
```

Replace the thread opening tag:

```tsx
      <div className="bg-base-100 border border-base-border rounded-box p-box-spacious min-h-[420px] max-h-[600px] overflow-y-auto space-y-4 shadow-2xs">
```

with:

```tsx
      {/* A scroll box from sm only: on a phone it left ~250px for the answer, so the page scrolls instead (F-05) */}
      <div data-chat-thread className="bg-base-100 border border-base-border rounded-box p-box-spacious sm:min-h-[420px] sm:max-h-[600px] sm:overflow-y-auto space-y-4 shadow-2xs">
```

Directly after that thread `</div>` (the one closing after the `{isLoading && (…)}` block), and before the input wrapper, insert:

```tsx
      {/* Below sm the note sits here, out of the sticky input block, to keep that block short */}
      <p data-quota-note="mobile" className="sm:hidden px-1 text-[11px] text-base-content-muted">{QUOTA_NOTE}</p>
```

Replace the input wrapper opening tag (the `<div className="space-y-2">` that contains `{chapterContext && (`):

```tsx
      <div className="space-y-2">
        {chapterContext && (
```

with:

```tsx
      <div
        data-chat-input
        className="space-y-2 max-sm:sticky max-sm:bottom-0 max-sm:z-20 max-sm:bg-base-200 max-sm:pt-2 max-sm:pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        {chapterContext && (
```

Replace the old note:

```tsx
        <p className="px-1 text-[11px] text-base-content-muted">
          AI ตัวนี้ใช้ Groq และ Gemini แบบฟรี จำกัดจำนวนคำถามต่อนาทีและต่อวัน ถ้าถามถี่เกินไป ระบบจะสลับ model หรือตอบจากคลังความรู้ในตัวแทน
        </p>
```

with:

```tsx
        <p data-quota-note="desktop" className="max-sm:hidden px-1 text-[11px] text-base-content-muted">{QUOTA_NOTE}</p>
```

The root `max-w-4xl mx-auto space-y-section pb-16` stays. Its `pb-16` leaves room under the sticky block at the end of the page. `bg-base-200` matches the page background (`App.tsx:198`). `z-20` sits under the header (`z-40`) and the toast (`z-50`).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/AIAssistantTab.test.tsx src/components/ui/hierarchy.test.ts src/components/ui/colorTokens.test.ts`
Expected: PASS.

- [ ] **Step 5: Gate**

Run: `npm run lint && npm test && npm run build`
Expected: all pass. No new warnings.

- [ ] **Step 6: Commit**

```bash
git add src/components/AIAssistantTab.tsx src/components/AIAssistantTab.test.tsx
git commit -m "$(cat <<'EOF'
fix(ai): let the page scroll the chat on mobile with the input pinned

Below sm the thread is no longer a nested scroll box, the input block sticks to
the bottom, and the free-tier note moves under the thread. Desktop is unchanged.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: F-03 — Start each tab at its top and the guide at the chapter start

Spec §B.3.

**Files:**
- Create: `src/lib/tabScroll.ts`
- Test: `src/lib/tabScroll.test.ts`
- Modify: `src/App.tsx` (imports :1-16; new effect after the hash effect :25-37)

**Interfaces:**
- Consumes: `scrollToChapterStart(behavior?: ScrollBehavior): void` from `src/lib/chapterScroll.ts` (existing). `TabType = 'guide' | 'ai' | 'quiz' | 'simulator'` from `src/types.ts` (`'simulator'` is never rendered).
- Produces: `export type TabEntryScroll = 'none' | 'top' | 'chapter-start'` and `export function tabEntryScroll(prev: TabType, next: TabType, hasRequestedSection: boolean): TabEntryScroll`.

- [ ] **Step 1: Write the failing test**

Create `src/lib/tabScroll.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import type { TabType } from '../types';
import { tabEntryScroll } from './tabScroll';

const TABS: TabType[] = ['guide', 'ai', 'quiz'];

describe('tabEntryScroll (F-03)', () => {
  it.each(TABS)('staying on %s never scrolls', (tab) => {
    expect(tabEntryScroll(tab, tab, false)).toBe('none');
    expect(tabEntryScroll(tab, tab, true)).toBe('none');
  });

  it.each([
    ['guide', 'ai'],
    ['guide', 'quiz'],
    ['ai', 'quiz'],
    ['quiz', 'ai'],
  ] as const)('%s -> %s starts at the page top', (prev, next) => {
    expect(tabEntryScroll(prev, next, false)).toBe('top');
    // A section request belongs to the guide; it never holds another tab in place.
    expect(tabEntryScroll(prev, next, true)).toBe('top');
  });

  it.each(['ai', 'quiz'] as const)('%s -> guide lands at the chapter start', (prev) => {
    expect(tabEntryScroll(prev, 'guide', false)).toBe('chapter-start');
  });

  it.each(['ai', 'quiz'] as const)('%s -> guide with a requested section leaves the scroll to GuideTab', (prev) => {
    expect(tabEntryScroll(prev, 'guide', true)).toBe('none');
  });

  it('treats the unrendered simulator value like any other non-guide tab', () => {
    expect(tabEntryScroll('guide', 'simulator', false)).toBe('top');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/lib/tabScroll.test.ts`
Expected: FAIL (`Failed to resolve import "./tabScroll"`).

- [ ] **Step 3: Implement `src/lib/tabScroll.ts`**

```ts
import type { TabType } from '../types';

export type TabEntryScroll = 'none' | 'top' | 'chapter-start';

/**
 * Where the window lands when the reader switches tab (spec F-03). The tabs share the window's
 * scroll, so without this a new tab opens at the old tab's offset.
 * - Guide with a requested section: GuideTab's own effect scrolls to that section, so do nothing.
 * - Guide otherwise: the chapter start. GuideTab remounts and re-derives its open sections, so an
 *   old offset would not point at the same content.
 * - Any other tab: its top.
 */
export function tabEntryScroll(prev: TabType, next: TabType, hasRequestedSection: boolean): TabEntryScroll {
  if (prev === next) return 'none';
  if (next === 'guide') return hasRequestedSection ? 'none' : 'chapter-start';
  return 'top';
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/lib/tabScroll.test.ts`
Expected: PASS.

- [ ] **Step 5: Run it in `App`**

In `src/App.tsx`, change line 1 to:

```tsx
import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
```

and add after `import { useChapterRoute } from './hooks/useChapterRoute';`:

```tsx
import { scrollToChapterStart } from './lib/chapterScroll';
import { tabEntryScroll } from './lib/tabScroll';
```

Insert directly after the hash effect (after its closing `}, [activeTab, route.activeChapterId, route.hashInUrl]);`):

```tsx
  // Each tab opens at its top, and the guide at the chapter start (spec F-03). A layout effect, so it
  // runs before GuideTab's passive section effect and that effect's two-frame deferred scroll; a
  // section link (#/ch/N/key from back/forward) therefore still lands on its section. Own ref, and
  // skips the first mount so load-time hash scrolls are untouched.
  const scrollTabRef = useRef<TabType | null>(null);
  useLayoutEffect(() => {
    const prev = scrollTabRef.current;
    scrollTabRef.current = activeTab;
    if (prev === null) return;
    // Read at the switch only: the request is consumed a moment later by GuideTab.
    const action = tabEntryScroll(prev, activeTab, route.requestedSection !== null);
    if (action === 'top') window.scrollTo(0, 0);
    else if (action === 'chapter-start') scrollToChapterStart();
  }, [activeTab]);
```

`handleOpenChapterFromQuiz` (:192-195) needs no change. It sets the tab and navigates with no section in one batch, so this effect scrolls to the chapter start. A popstate chapter change with no section also calls `scrollToChapterStart` itself (`useChapterRoute.ts:91-93`); both target the same point.

- [ ] **Step 6: Gate**

Run: `npm run lint && npm test && npm run build`
Expected: all pass. No new warnings.

- [ ] **Step 7: Commit**

```bash
git add src/lib/tabScroll.ts src/lib/tabScroll.test.ts src/App.tsx
git commit -m "$(cat <<'EOF'
fix(nav): start each tab at its top and the guide at the chapter start

Switching tabs no longer carries the previous tab's scroll offset. Section
deep links still land on their section, and the quiz's related-chapter link
opens at the chapter title.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: F-06 — Fade the clipped edge of scrolling chip rows on mobile

Spec §B.6.

**Files:**
- Create: `src/lib/scrollEdges.ts`, `src/lib/scrollEdges.test.ts`, `src/hooks/useScrollEdges.ts`, `src/components/ui/ScrollFade.tsx`
- Modify: `src/components/ui/Tabs.tsx` (whole file, 55 lines), `src/components/ui/Tabs.test.tsx` (the `render` helper at :62-63; new tests after :91)
- Modify: `src/components/guide/SectionOutline.tsx` (imports :1-5; row `<div>` :41 and its `</div>` :76)
- Modify: `src/components/glossary/GlossaryPanel.tsx` (imports; category row `<div>` :143 and its closing `</div>`)
- Modify: `src/components/GuideTab.tsx` (the drawer's `<Tabs<string>` at :871-879 only)

**Interfaces:**
- Consumes: nothing from other tasks.
- Produces:
  - `src/lib/scrollEdges.ts`: `export interface ScrollEdgeState { start: boolean; end: boolean }` and `export function scrollEdges(scrollLeft: number, clientWidth: number, scrollWidth: number, tolerance = 1): ScrollEdgeState`.
  - `src/hooks/useScrollEdges.ts`: `export function useScrollEdges(ref: RefObject<HTMLElement | null>): ScrollEdgeState`.
  - `src/components/ui/ScrollFade.tsx`: `export type FadeFrom = 'from-base-100' | 'from-base-300'` and `export function ScrollFade(props: React.HTMLAttributes<HTMLDivElement> & { fadeFrom?: FadeFrom })`. The props go to the inner scroller.
  - `Tabs` gains `fadeFrom?: FadeFrom` (used only with `scroll`).

- [ ] **Step 1: Write the failing tests**

Create `src/lib/scrollEdges.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { scrollEdges } from './scrollEdges';

describe('scrollEdges (F-06)', () => {
  it('a row that fits hides nothing', () => {
    expect(scrollEdges(0, 300, 300)).toEqual({ start: false, end: false });
  });
  it('at the start only the end hides content', () => {
    expect(scrollEdges(0, 300, 600)).toEqual({ start: false, end: true });
  });
  it('in the middle both edges hide content', () => {
    expect(scrollEdges(150, 300, 600)).toEqual({ start: true, end: true });
  });
  it('at the end only the start hides content', () => {
    expect(scrollEdges(300, 300, 600)).toEqual({ start: true, end: false });
  });
  it('ignores sub-pixel overflow within the tolerance', () => {
    expect(scrollEdges(0.5, 300, 300.8)).toEqual({ start: false, end: false });
    expect(scrollEdges(299.5, 300, 600)).toEqual({ start: true, end: false });
  });
});
```

In `src/components/ui/Tabs.test.tsx`, add this import:

```tsx
import type { FadeFrom } from './ScrollFade';
```

Replace the `render` helper (:62-63) with:

```tsx
  const render = (variant: 'segmented' | 'pills' | 'underline', scroll?: boolean, fadeFrom?: FadeFrom) =>
    renderToStaticMarkup(<Tabs items={items} value="b" onChange={() => {}} variant={variant} aria-label="pick" scroll={scroll} fadeFrom={fadeFrom} />);
```

and add after the test `'a scrolling strip gets room for the rings and chips that do not shrink'`:

```tsx
  it('a scrolling strip sits in a fade wrapper with two hidden, decorative, mobile-only edges (F-06)', () => {
    const html = render('pills', true);
    expect(html).toMatch(/^<div data-scroll-fade="true" class="relative">/);
    const fades = html.match(/<span aria-hidden="true" data-fade="(start|end)" class="[^"]*"/g) ?? [];
    expect(fades).toHaveLength(2);
    for (const f of fades) {
      expect(f).toContain('pointer-events-none');
      expect(f).toContain('sm:hidden');
      expect(f).toContain('from-base-100');
      // Before the first measure, both edges are hidden.
      expect(f.split('"')[5].split(' ')).toContain('hidden');
    }
    // The group semantics stay on the scroller, not on the wrapper.
    expect(html).toMatch(/<div role="group" aria-label="pick" class="[^"]*overflow-x-auto/);
  });

  it('the fade takes the colour of the surface it sits on', () => {
    expect(render('pills', true, 'from-base-300')).toContain('from-base-300');
    expect(render('pills', true, 'from-base-300')).not.toContain('from-base-100');
  });

  it('a strip that does not scroll gets no fade', () => {
    expect(render('pills')).not.toContain('data-scroll-fade');
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/lib/scrollEdges.test.ts src/components/ui/Tabs.test.tsx`
Expected: FAIL. `./scrollEdges` does not resolve, and the new Tabs tests find no `data-scroll-fade`.

- [ ] **Step 3: Implement `src/lib/scrollEdges.ts`**

```ts
export interface ScrollEdgeState {
  /** Content is hidden off the start (left) edge. */
  start: boolean;
  /** Content is hidden off the end (right) edge. */
  end: boolean;
}

/** Which edges of a horizontal scroller hide content. `tolerance` absorbs sub-pixel layout widths. */
export function scrollEdges(scrollLeft: number, clientWidth: number, scrollWidth: number, tolerance = 1): ScrollEdgeState {
  return {
    start: scrollLeft > tolerance,
    end: scrollLeft + clientWidth < scrollWidth - tolerance,
  };
}
```

- [ ] **Step 4: Implement `src/hooks/useScrollEdges.ts`**

```ts
import { type RefObject, useCallback, useEffect, useState } from 'react';
import { scrollEdges, type ScrollEdgeState } from '../lib/scrollEdges';

const NO_EDGES: ScrollEdgeState = { start: false, end: false };

/** Tracks which edges of a horizontal scroller hide content (spec F-06). */
export function useScrollEdges(ref: RefObject<HTMLElement | null>): ScrollEdgeState {
  const [edges, setEdges] = useState<ScrollEdgeState>(NO_EDGES);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const next = scrollEdges(el.scrollLeft, el.clientWidth, el.scrollWidth);
    // Same values: keep the old object so React bails out and no render loop starts.
    setEdges(prev => (prev.start === next.start && prev.end === next.end ? prev : next));
  }, [ref]);

  // After every render: new chips (another chapter, other glossary counts) change scrollWidth
  // without resizing the row, which a ResizeObserver would miss.
  useEffect(() => {
    measure();
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('scroll', measure, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(el);
    return () => {
      el.removeEventListener('scroll', measure);
      observer?.disconnect();
    };
  }, [ref, measure]);

  return edges;
}
```

- [ ] **Step 5: Implement `src/components/ui/ScrollFade.tsx`**

```tsx
import React, { useRef } from 'react';
import { cn } from './cn';
import { useScrollEdges } from '../../hooks/useScrollEdges';

/** Gradient start colour: the surface the row sits on. Literal classes, so Tailwind generates them. */
export type FadeFrom = 'from-base-100' | 'from-base-300';

const FADE = 'pointer-events-none absolute inset-y-0 w-6 to-transparent sm:hidden';

/**
 * A horizontal scroller with a 24px fade on each edge that hides content (spec F-06). Below sm
 * only: from sm the rows this wraps either wrap or have room. The fades follow measured
 * overflow, not chip count, so a row that fits shows none.
 * Every prop except `fadeFrom` goes to the inner scroller, which keeps its role and aria-label.
 */
export function ScrollFade({ fadeFrom = 'from-base-100', children, ...scrollerProps }: React.HTMLAttributes<HTMLDivElement> & { fadeFrom?: FadeFrom }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(scrollerRef);
  return (
    <div data-scroll-fade className="relative">
      <div ref={scrollerRef} {...scrollerProps}>
        {children}
      </div>
      <span aria-hidden="true" data-fade="start" className={cn(FADE, 'left-0 bg-linear-to-r', fadeFrom, !edges.start && 'hidden')} />
      <span aria-hidden="true" data-fade="end" className={cn(FADE, 'right-0 bg-linear-to-l', fadeFrom, !edges.end && 'hidden')} />
    </div>
  );
}
```

`cn` (`src/components/ui/cn.ts`) is a plain join that drops falsy values, so `hidden` (while an edge shows nothing) and `sm:hidden` (always) both reach the DOM. Below `sm` a fade is shown only while its edge hides content; from `sm` it is never shown.

- [ ] **Step 6: Use it in `Tabs`**

Replace `src/components/ui/Tabs.tsx` from the `TabsProps` interface to the end of the file with:

```tsx
export interface TabsProps<T extends string> {
  items: readonly { value: T; label: React.ReactNode; icon?: React.ReactNode; title?: string }[];
  value: T;
  onChange: (value: T) => void;
  variant: 'segmented' | 'pills' | 'underline';
  size?: 'xs' | 'sm';
  'aria-label': string;
  scroll?: boolean;
  /** With `scroll`: the fade colour, matching the surface behind the row (default base-100). */
  fadeFrom?: FadeFrom;
  className?: string;
}

/** Group classes, chip shape and tap ring per variant. `gapPx` is the real gap between chips. */
export const TABS_LAYOUT: Record<TabsProps<string>['variant'], { group: string; gapPx: number; shape: NonNullable<ToggleChipProps['shape']>; tap: Tap }> = {
  segmented: { group: 'inline-flex items-center p-0.5 rounded-field bg-base-100 border border-base-border', gapPx: 0, shape: 'segment', tap: 'y' },
  pills: { group: 'flex items-center gap-1.5', gapPx: 6, shape: 'pill', tap: 'gap-6' },
  underline: { group: 'flex items-center border-b border-base-border', gapPx: 0, shape: 'tab', tap: 'y' },
};

export function Tabs<T extends string>({ items, value, onChange, variant, size = 'sm', scroll, fadeFrom, className, ...aria }: TabsProps<T>) {
  const layout = TABS_LAYOUT[variant];
  const chips = items.map(item => (
    <ToggleChip
      key={item.value}
      data-value={item.value}
      selected={item.value === value}
      shape={layout.shape}
      size={size}
      tap={layout.tap}
      title={item.title}
      onClick={() => onChange(item.value)}
      className={scroll ? 'shrink-0' : undefined}
    >
      {item.icon}
      {item.label}
    </ToggleChip>
  ));
  if (scroll) {
    return (
      <ScrollFade
        fadeFrom={fadeFrom}
        role="group"
        aria-label={aria['aria-label']}
        className={cn(layout.group, `overflow-x-auto scrollbar-none ${SCROLL_ROOM}`, className)}
      >
        {chips}
      </ScrollFade>
    );
  }
  return (
    <div role="group" aria-label={aria['aria-label']} className={cn(layout.group, className)}>
      {chips}
    </div>
  );
}
```

and add to the imports at the top of the file:

```tsx
import { ScrollFade, type FadeFrom } from './ScrollFade';
```

The header's main nav (`Header.tsx:144-150`, header `bg-base-100/90`) and the desktop sidebar filter (`GuideTab.tsx:453-462`, `hidden lg:block`, so the `sm:hidden` fade never shows) take the default.

- [ ] **Step 7: Apply it to the outline, glossary and drawer rows**

`src/components/guide/SectionOutline.tsx`. Add the import:

```tsx
import { ScrollFade } from '../ui/ScrollFade';
```

Replace:

```tsx
      <div className={`flex flex-nowrap sm:flex-wrap items-center gap-1.5 overflow-x-auto ${SCROLL_ROOM}`}>
```

with:

```tsx
      <ScrollFade className={`flex flex-nowrap sm:flex-wrap items-center gap-1.5 overflow-x-auto ${SCROLL_ROOM}`}>
```

and replace that row's closing `</div>` (the one right after the `ขยายทั้งหมด | ย่อทั้งหมด` `</span>`, before the bar's own `</div>`) with `</ScrollFade>`. The bar is `bg-base-100`, so it takes the default fade.

`src/components/glossary/GlossaryPanel.tsx`. Add the import:

```tsx
import { ScrollFade } from '../ui/ScrollFade';
```

Replace:

```tsx
      {/* Category chips: scroll horizontally on mobile, wrap from sm */}
      <div className="flex flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 max-sm:-mt-2.5 max-sm:pt-2.5 max-sm:-mb-2.5 max-sm:pb-3.5 -mx-1 px-1">
```

with:

```tsx
      {/* Category chips: scroll horizontally on mobile with a fade on the clipped edge, wrap from sm */}
      <ScrollFade className="flex flex-nowrap sm:flex-wrap gap-1.5 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0 max-sm:-mt-2.5 max-sm:pt-2.5 max-sm:-mb-2.5 max-sm:pb-3.5 -mx-1 px-1">
```

and change that row's closing `</div>` (after the `GLOSSARY_CATEGORIES.map(…)` block) to `</ScrollFade>`. The panel sits in the chapter reader card (`bg-base-100`), so it takes the default.

`src/components/GuideTab.tsx`, in the index drawer (inside `<div className="p-4 border-b border-base-border space-y-3 bg-base-300">`). Read `sed -n '866,882p' src/components/GuideTab.tsx`, then replace:

```tsx
                <Tabs<string>
                  variant="pills"
                  size="xs"
                  scroll
                  aria-label="กรองตามสายงาน"
                  items={ROLE_FILTERS}
                  value={selectedRole}
                  onChange={setSelectedRole}
                />
```

with:

```tsx
                <Tabs<string>
                  variant="pills"
                  size="xs"
                  scroll
                  fadeFrom="from-base-300"
                  aria-label="กรองตามสายงาน"
                  items={ROLE_FILTERS}
                  value={selectedRole}
                  onChange={setSelectedRole}
                />
```

This block differs from the sidebar one (:453) by its indentation and the missing `className="shrink-0"`. Make sure the edit lands on the drawer copy.

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx vitest run src/lib/scrollEdges.test.ts src/components/ui/Tabs.test.tsx src/components/Header.test.tsx src/components/glossary/GlossaryPanel.test.tsx src/components/ui/tapTargets.test.ts src/components/ui/colorTokens.test.ts`
Expected: PASS.

- [ ] **Step 9: Gate**

Run: `npm run lint && npm test && npm run build`
Expected: all pass. knip is clean: `scrollEdges`, `useScrollEdges`, `ScrollFade` and `FadeFrom` each have an importer. No new warnings.

- [ ] **Step 10: Commit**

```bash
git add src/lib/scrollEdges.ts src/lib/scrollEdges.test.ts src/hooks/useScrollEdges.ts src/components/ui/ScrollFade.tsx src/components/ui/Tabs.tsx src/components/ui/Tabs.test.tsx src/components/guide/SectionOutline.tsx src/components/glossary/GlossaryPanel.tsx src/components/GuideTab.tsx
git commit -m "$(cat <<'EOF'
fix(ui): fade the clipped edge of scrolling chip rows on mobile

The section outline, the index role filter and the glossary category row show
a fade on each edge that hides chips, below sm only. Rows that fit show none.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: F-07 — Open the quiz on questions from the chapters just read

Spec §B.7.

**Files:**
- Modify: `src/data/quizRounds.ts` (append after `initialQuizRound`)
- Test: `src/data/quizRounds.test.ts`
- Modify: `src/components/QuizTab.tsx` (imports :1-18; `QuizTabProps` :20-25; `QuizTab` :50-110)
- Test: `src/components/QuizTab.test.tsx`
- Modify: `src/App.tsx` (the `<QuizTab …/>` at :276-281)

**Interfaces:**
- Consumes: `resolveTrack(key: TrackKey, chapters: ChapterRef[]): string[]`, `type TrackKey`, `type ChapterRef` from `src/data/readingTracks.ts`. `getQuizRound`, `QuizRound` (existing). The route fields `activeChapterId`, `hasNavigated`, `initialSource` from `useChapterRoute`.
- Produces (in `src/data/quizRounds.ts`):
  - `orderQuizRound(qs: QuizQuestion[], opts: { trackIds: readonly string[]; anchors: readonly string[] }): QuizQuestion[]`
  - `quizAnchors(currentChapterId: string | null, readChapters: readonly string[]): string[]`
  - `quizTrackKey(round: QuizRound, role: Role | null): TrackKey`
  - `basicsHintChapter(round: QuizRound, qs: QuizQuestion[], anchors: readonly string[]): string | null`
  - `QuizTab` gets the new required props `chapters: ChapterRef[]`, `readChapters: readonly string[]` and `currentChapterId: string | null`.

- [ ] **Step 1: Write the failing pure tests**

In `src/data/quizRounds.test.ts`, replace the imports with:

```ts
import { describe, it, expect } from 'vitest';
import type { QuizQuestion } from '../types';
import { QUIZ_QUESTIONS } from './quizQuestions';
import { CHAPTERS } from './chaptersData';
import { resolveTrack } from './readingTracks';
import {
  getQuizRound, defaultQuizRound, initialQuizRound, parseQuizRound, QUIZ_ROUND_META,
  orderQuizRound, quizAnchors, quizTrackKey, basicsHintChapter,
} from './quizRounds';
```

and append:

```ts
// Only id and chapterId matter to the ordering.
const q = (id: number, chapterId?: string) => ({ id, chapterId }) as QuizQuestion;
const ids = (qs: QuizQuestion[]) => qs.map((x) => x.id);

describe('orderQuizRound (F-07)', () => {
  const bank = [q(1, 's4'), q(2, 's6'), q(3, 's8'), q(4, 's9'), q(5), q(6, 's2')];
  const trackIds = ['s2', 's1', 's9', 's4', 's6'];

  it('puts questions on anchor chapters first, in anchor order, then the rest by track', () => {
    expect(ids(orderQuizRound(bank, { trackIds, anchors: ['s6', 's4'] }))).toEqual([2, 1, 6, 4, 3, 5]);
  });

  it('with no anchors follows the track, then off-track questions in bank order', () => {
    expect(ids(orderQuizRound(bank, { trackIds, anchors: [] }))).toEqual([6, 4, 1, 2, 3, 5]);
  });

  it('keeps bank order between questions on the same chapter', () => {
    const same = [q(7, 's11'), q(8, 's2'), q(9, 's11')];
    expect(ids(orderQuizRound(same, { trackIds: [], anchors: ['s11'] }))).toEqual([7, 9, 8]);
  });

  it('does not change the round it orders', () => {
    const before = ids(bank);
    orderQuizRound(bank, { trackIds, anchors: ['s9'] });
    expect(ids(bank)).toEqual(before);
  });

  it('a Business reader who read s4 opens on the s4 question', () => {
    const biz = getQuizRound(QUIZ_QUESTIONS, 'biz');
    const ordered = orderQuizRound(biz, { trackIds: resolveTrack('biz', CHAPTERS), anchors: ['s4'] });
    expect(ordered[0].chapterId).toBe('s4');
    expect(ordered).toHaveLength(biz.length);
  });
});

describe('quizAnchors', () => {
  it('current chapter first, then read chapters newest first, without repeats', () => {
    expect(quizAnchors('s3', ['s1', 's2', 's3'])).toEqual(['s3', 's2', 's1']);
  });
  it('no current chapter: read chapters newest first', () => {
    expect(quizAnchors(null, ['s1', 's2'])).toEqual(['s2', 's1']);
    expect(quizAnchors(null, [])).toEqual([]);
  });
});

describe('quizTrackKey', () => {
  it('role rounds use their own track', () => {
    expect(quizTrackKey('biz', 'eng')).toBe('biz');
    expect(quizTrackKey('eng', null)).toBe('eng');
  });
  it('basics and all use the reader\'s role track, else beginner', () => {
    expect(quizTrackKey('basics', 'biz')).toBe('biz');
    expect(quizTrackKey('all', 'eng')).toBe('eng');
    expect(quizTrackKey('basics', null)).toBe('beginner');
  });
});

describe('basicsHintChapter', () => {
  it('biz reader who read only s2: the biz round has no s2 question, basics does', () => {
    expect(basicsHintChapter('biz', QUIZ_QUESTIONS, ['s2'])).toBe('s2');
  });
  it('no hint once the round has a question on any anchor', () => {
    expect(basicsHintChapter('biz', QUIZ_QUESTIONS, ['s2', 's4'])).toBeNull();
  });
  it('no hint with no anchors, on basics itself, or when basics has nothing either', () => {
    expect(basicsHintChapter('biz', QUIZ_QUESTIONS, [])).toBeNull();
    expect(basicsHintChapter('basics', QUIZ_QUESTIONS, ['s2'])).toBeNull();
    expect(basicsHintChapter('biz', QUIZ_QUESTIONS, ['s1'])).toBeNull();
  });
  it('names the first anchor basics covers', () => {
    expect(basicsHintChapter('eng', QUIZ_QUESTIONS, ['s1', 's5'])).toBe('s5');
  });
  it('the all round contains basics, so it never needs the hint', () => {
    expect(basicsHintChapter('all', QUIZ_QUESTIONS, ['s2'])).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/data/quizRounds.test.ts`
Expected: FAIL (`orderQuizRound is not a function`, and the same for the other three).

- [ ] **Step 3: Implement the helpers**

In `src/data/quizRounds.ts`, add to the imports:

```ts
import type { TrackKey } from './readingTracks';
```

and append:

```ts
/**
 * Spec F-07: questions on the chapters just read come first, in anchor order; then the rest in
 * reading-track order; then off-track questions in bank order. Stable; returns a new array.
 */
export function orderQuizRound(
  qs: QuizQuestion[],
  { trackIds, anchors }: { trackIds: readonly string[]; anchors: readonly string[] },
): QuizQuestion[] {
  const rank = (q: QuizQuestion): [number, number] => {
    const anchor = q.chapterId ? anchors.indexOf(q.chapterId) : -1;
    if (anchor >= 0) return [0, anchor];
    const onTrack = q.chapterId ? trackIds.indexOf(q.chapterId) : -1;
    return onTrack >= 0 ? [1, onTrack] : [2, 0];
  };
  return qs
    .map((q, i) => ({ q, i, r: rank(q) }))
    .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.i - b.i)
    .map(({ q }) => q);
}

/** The chapter open in the guide first, then read chapters newest first (they are stored in read order). */
export function quizAnchors(currentChapterId: string | null, readChapters: readonly string[]): string[] {
  const newestFirst = [...readChapters].reverse();
  return [...new Set(currentChapterId ? [currentChapterId, ...newestFirst] : newestFirst)];
}

/** Role rounds follow their own track; basics and all follow the reader's, else the beginner track. */
export function quizTrackKey(round: QuizRound, role: Role | null): TrackKey {
  return round === 'biz' || round === 'eng' ? round : role ?? 'beginner';
}

/**
 * Ordering cannot help when the round has no question on any chapter just read. Returns the first
 * anchor chapter the basics round covers, so the tab can point there; null when no hint applies.
 */
export function basicsHintChapter(round: QuizRound, qs: QuizQuestion[], anchors: readonly string[]): string | null {
  if (round === 'basics') return null;
  const covers = (list: QuizQuestion[], id: string) => list.some((q) => q.chapterId === id);
  const roundQs = getQuizRound(qs, round);
  if (anchors.some((id) => covers(roundQs, id))) return null;
  const basics = getQuizRound(qs, 'basics');
  return anchors.find((id) => covers(basics, id)) ?? null;
}
```

`readingTracks.ts` imports only types from `rolePerspective`, and this is a type-only import, so no import cycle is added.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/data/quizRounds.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing component tests**

In `src/components/QuizTab.test.tsx`, replace the imports and the `render` helper (:1-11) with:

```tsx
import { afterEach, describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { CHAPTERS } from '../data/chaptersData';
import { resolveTrack } from '../data/readingTracks';
import { getQuizRound, orderQuizRound } from '../data/quizRounds';
import { QuizTab } from './QuizTab';

const noop = () => {};
const render = (role: 'eng' | 'biz' | null, read: string[] = [], current: string | null = null) =>
  renderToStaticMarkup(
    <QuizTab
      questions={QUIZ_QUESTIONS}
      chapters={CHAPTERS}
      role={role}
      readChapters={read}
      currentChapterId={current}
      onAskAIWithPrompt={noop}
      onOpenChapter={noop}
    />,
  );
const scenario = (id: number) => QUIZ_QUESTIONS.find((x) => x.id === id)!.scenario.replace(/"/g, '&quot;');
```

In the test `'role eng opens on its own round, …'`, replace:

```tsx
    const first = getQuizRound(QUIZ_QUESTIONS, 'eng')[0];
```

with:

```tsx
    // With nothing read, the eng round follows the eng reading track (F-07).
    const first = orderQuizRound(getQuizRound(QUIZ_QUESTIONS, 'eng'), { trackIds: resolveTrack('eng', CHAPTERS), anchors: [] })[0];
```

Append:

```tsx
describe('QuizTab opens on what was just read (F-07)', () => {
  it('a Business reader who read s9 starts on the s9 question', () => {
    const s9 = getQuizRound(QUIZ_QUESTIONS, 'biz').find((x) => x.chapterId === 's9')!;
    const html = render('biz', ['s9']);
    expect(html).toContain(scenario(s9.id));
  });

  it('the chapter open in the guide outranks older reads', () => {
    const s6 = getQuizRound(QUIZ_QUESTIONS, 'biz').find((x) => x.chapterId === 's6')!;
    expect(render('biz', ['s9'], 's6')).toContain(scenario(s6.id));
  });

  it('a Business reader who read only s2 is pointed to the basics round', () => {
    const html = render('biz', ['s2']);
    expect(html).toContain('ชุดพื้นฐานมีคำถามจากบทที่ 2 ที่คุณเพิ่งอ่าน');
    expect(html).toMatch(/<button[^>]*data-quiz-basics-hint[^>]*>ไปชุดพื้นฐาน<\/button>/);
  });

  it('no hint when the round already covers what was read, or nothing was read', () => {
    expect(render('biz', ['s4'])).not.toContain('ไปชุดพื้นฐาน');
    expect(render('biz')).not.toContain('ไปชุดพื้นฐาน');
  });
});
```

- [ ] **Step 6: Run the tests to verify they fail**

Run: `npx vitest run src/components/QuizTab.test.tsx`
Expected: FAIL. The eng test now expects the s16 question first, but bank order shows s17. The s9/s6 tests see the s4 question. No hint is rendered.

- [ ] **Step 7: Implement in `QuizTab`**

In `src/components/QuizTab.tsx`, change the quizRounds import to:

```tsx
import {
  QUIZ_ROUNDS, QUIZ_ROUND_META, QuizRound, defaultQuizRound, getQuizRound, initialQuizRound,
  orderQuizRound, quizAnchors, quizTrackKey, basicsHintChapter,
} from '../data/quizRounds';
import { resolveTrack, type ChapterRef } from '../data/readingTracks';
```

Replace `QuizTabProps` with:

```tsx
interface QuizTabProps {
  questions: QuizQuestion[]; // the full bank; the tab picks the round
  /** For reading-track order and chapter numbers. */
  chapters: ChapterRef[];
  role: Role | null;
  /** Read chapters in the order they were marked read (UserStats.readChapters). */
  readChapters: readonly string[];
  /** The chapter open in the guide, or null when the reader has not chosen one (the default s1). */
  currentChapterId: string | null;
  onAskAIWithPrompt: (prompt: string) => void;
  onOpenChapter: (chapterId: string) => void;
}
```

Change the destructure of `QuizTab` to:

```tsx
export const QuizTab: React.FC<QuizTabProps> = ({
  questions,
  chapters,
  role,
  readChapters,
  currentChapterId,
  onAskAIWithPrompt,
  onOpenChapter,
}) => {
```

Replace:

```tsx
  const roundQuestions = useMemo(() => getQuizRound(questions, round), [questions, round]);
```

with:

```tsx
  // Read once per visit to the tab: what the reader has just read cannot change while they are here.
  const [anchors] = useState(() => quizAnchors(currentChapterId, readChapters));
  const orderRound = (r: QuizRound) =>
    orderQuizRound(getQuizRound(questions, r), { trackIds: resolveTrack(quizTrackKey(r, role), chapters), anchors });
  // Ordered once per round (spec F-07). A role change mid-run keeps the round, and must keep its order
  // too: QuizRun shuffles each question's options once, by index, so a reorder would mismatch them.
  const [ordered, setOrdered] = useState(() => ({ round, questions: orderRound(round) }));
  let current = ordered;
  if (ordered.round !== round) {
    current = { round, questions: orderRound(round) };
    setOrdered(current);
  }
  const roundQuestions = current.questions;
  const hintChapterId = useMemo(() => basicsHintChapter(round, questions, anchors), [round, questions, anchors]);
  const hintNum = chapters.find((c) => c.id === hintChapterId)?.num;
```

Between the round-chip group's closing `</div>` and `<QuizRun`, insert:

```tsx
      {hintNum !== undefined && (
        <p data-quiz-hint className="max-w-3xl mx-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-base-content-body">
          <span>{`ชุดพื้นฐานมีคำถามจากบทที่ ${hintNum} ที่คุณเพิ่งอ่าน`}</span>
          <button
            type="button"
            data-quiz-basics-hint
            onClick={() => chooseRound('basics')}
            className={`${TAP} font-semibold text-base-content underline underline-offset-2 cursor-pointer`}
          >
            ไปชุดพื้นฐาน
          </button>
        </p>
      )}
```

The Thai sentence is one template literal so that `renderToStaticMarkup` emits it without `<!-- -->` separators. `TAP` is already imported (`./ui/tapTarget`). `useMemo` stays in use (the hint), so the React import is unchanged.

The render-phase `setOrdered` follows the same pattern this component already uses for `roundRole` (:59-67). React re-runs the component before rendering children, so `QuizRun` never sees a mismatched round.

- [ ] **Step 8: Pass the props from `App`**

In `src/App.tsx`, replace:

```tsx
          <QuizTab
            questions={QUIZ_QUESTIONS}
            role={role}
            onAskAIWithPrompt={handleAskAIWithPrompt}
            onOpenChapter={handleOpenChapterFromQuiz}
          />
```

with:

```tsx
          <QuizTab
            questions={QUIZ_QUESTIONS}
            chapters={CHAPTERS}
            role={role}
            readChapters={userStats.readChapters}
            // An untouched default chapter is not reading (spec F-07): count it only after a navigation or a hash/stored load.
            currentChapterId={route.hasNavigated || route.initialSource !== 'default' ? route.activeChapterId : null}
            onAskAIWithPrompt={handleAskAIWithPrompt}
            onOpenChapter={handleOpenChapterFromQuiz}
          />
```

- [ ] **Step 9: Run the tests to verify they pass**

Run: `npx vitest run src/data/quizRounds.test.ts src/components/QuizTab.test.tsx src/components/ui/tapTargets.test.ts`
Expected: PASS. The other existing QuizTab tests are unchanged and still pass: basics with no role, or with the eng track, still opens on question 1 (s2).

- [ ] **Step 10: Gate**

Run: `npm run lint && npm test && npm run build`
Expected: all pass. No new warnings.

- [ ] **Step 11: Commit**

```bash
git add src/data/quizRounds.ts src/data/quizRounds.test.ts src/components/QuizTab.tsx src/components/QuizTab.test.tsx src/App.tsx
git commit -m "$(cat <<'EOF'
fix(quiz): open on questions from chapters just read

Each round puts questions on the chapter open in the guide and on recently read
chapters first, then follows the reading track. When the round has none of
them and basics does, a hint points to the basics round.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Browser verification of F-01…F-07 (controller, not a subagent)

Spec §B.1–B.7 acceptance. Checks the whole branch in the running app. Change code only to fix a failure found here: each fix is a new commit `fix(<scope>): …` with its own test where one is possible, then rerun the gate.

**Files:**
- Evidence: `work/acceptance-ux-run1.md` (gitignored). Write one section per finding: the objective, the decisive selector/URL, what you observed, and PASS/FAIL. Overwrite stale notes; do not paste DOM dumps.

- [ ] **Step 1: Start the app and a fresh profile**

Start or reuse the dev server with the Claude Browser tool `preview_start` using `name: "dev"` (`.claude/launch.json`, port 3000, auto port). Then run:

```js
Object.keys(localStorage).filter(k => k.startsWith('be_guide_')).forEach(k => localStorage.removeItem(k)); location.hash = ''; location.reload();
```

Use `javascript_tool`, `find` and `get_page_text` in preference to screenshots. After each finding, `read_console_messages` with `onlyErrors: true` must return nothing.

- [ ] **Step 2: F-01 — site question and headings (360×640, then 1440)**

`resize_window` to 360×640. Open AI BRIDGE and ask `เว็บนี้ทำอะไรได้บ้าง`. Expected: an answer of about 8 lines or fewer that lists GUIDE, AI BRIDGE and QUIZ. Record the footer label (`Groq · …`, `Gemini · …`, or `คลังความรู้ผู้เชี่ยวชาญ`). Tap the chip `PM กับ Dev เถียงกันเรื่อง Deadline ควรแก้ปัญหายังไง?`. Expected: any headings are Thai, with no English heading or English parenthetical (`(Insights…)`, `(Actionable…)`).

Check this once per provider you can reach (spec §B.10). The free tier may answer 429. The fallback banner (`ตอนนี้ AI ถูกใช้ครบโควตาฟรีชั่วคราว…`), together with the overview list as the answer, is acceptable evidence for the no-key behaviour. For an explicit no-key check, start a second server with empty keys as a background command. `dotenv.config()` in `server.ts` does not override variables that are already set, empty ones included.

```bash
GROQ_API_KEY= GEMINI_API_KEY= PORT=3101 npx tsx server.ts
```

Once it logs `Server running on http://0.0.0.0:3101`, run:

```bash
curl -s -X POST localhost:3101/api/ask-ai -H 'Content-Type: application/json' -d '{"question":"เว็บนี้ทำอะไรได้บ้าง"}'
```

Expected: `"source":"fallback"` and an answer containing `- AI BRIDGE` and `- QUIZ`. Stop the second server afterwards.

- [ ] **Step 3: F-02 — replay the s09 answer**

On AI BRIDGE, stub the API so the s09 table comes back, then tap any chip:

```js
const S09 = '| กลยุทธ์ | วิธีทำ |\n|---|---|\n| **“ขยายความเร็ว”** – ทำแคมเปญเร็วขึ้น** | **ขั้นตอน:**1️⃣ วางแผน<br>2️⃣ ทำ<br>3️⃣ วัดผล |\n| **“ลดต้นทุน”** – ใช้มาตรฐาน** | ทำ**(ด่วน)** |';
window.__realFetch ??= window.fetch;
window.fetch = async (url, init) => String(url).includes('/api/ask-ai')
  ? new Response(JSON.stringify({ answer: S09, source: 'groq', model: 'replay' }), { headers: { 'Content-Type': 'application/json' } })
  : window.__realFetch(url, init);
```

Expected: in the last `[data-msg-id]` answer, `innerText` contains no `<br>` and no `**`; the first row's second cell holds 2 `br` elements (`td.querySelectorAll('br').length === 2`); `ขั้นตอน:` and `(ด่วน)` are bold. Restore with `window.fetch = window.__realFetch`.

- [ ] **Step 4: F-04 — chip tap feedback (360×640)**

Stub a slow answer:

```js
window.__realFetch ??= window.fetch;
window.fetch = (url, init) => String(url).includes('/api/ask-ai')
  ? new Promise(r => setTimeout(() => r(new Response(JSON.stringify({ answer: 'คำตอบ\n\n'.repeat(40), source: 'groq', model: 'slow' }), { headers: { 'Content-Type': 'application/json' } })), 3000))
  : window.__realFetch(url, init);
```

Scroll to the top and tap the first chip. Within 1 s: the new user `[data-msg-id]` top sits just under the sticky header (`getBoundingClientRect().top` between `--header-h` and `--header-h + 16`). `กำลังคิดคำตอบ...` is in the viewport. All 5 chips have `disabled`, and only the tapped one holds `.animate-spin`. After about 3 s the answer appears under the question and the chips are enabled again. Restore `fetch`.

- [ ] **Step 5: F-05 — one scrollbar and a pinned input (360×640 and 1440)**

At 360×640, after the long answer from Step 4: `getComputedStyle(document.querySelector('[data-chat-thread]')).overflowY === 'visible'`. Scroll to the middle of the answer: the `[data-chat-input]` bottom equals `innerHeight` (±2px) and the input is visible. `[data-quota-note="mobile"]` is displayed and `[data-quota-note="desktop"]` is not. At 1440: `overflowY === 'auto'`, `maxHeight === '600px'`, the input is not sticky, and the desktop note shows under the input. The layout matches HEAD `4524b12` otherwise.

- [ ] **Step 6: F-03 — tab switches (360×640)**

Open `#/ch/3`, scroll 1500px down, and tap QUIZ: `scrollY === 0` and `คำถามข้อที่ 1` is visible. Scroll down, then tap AI BRIDGE: `scrollY === 0`, and the header card plus `มุมมอง:` are visible. Navigate to `#/ch/3/examples`, tap QUIZ, then run `history.back()`: the tab is GUIDE and `#sec-examples` top sits just under header + outline. In QUIZ, answer question 1 and tap `อ่านบทที่เกี่ยวข้อง`: `#chapter-start` top is within 8–24px under the header, so the chapter title is visible.

- [ ] **Step 7: F-06 — chip-row fades (360px, then 1440)**

On a chapter whose outline overflows (check `scrollWidth > clientWidth` on the outline row inside `[data-section-outline]`): at scroll start, `[data-fade="end"]` is displayed and `[data-fade="start"]` is not. Scroll the row to its end: only the start fade shows. Open another chapter with the prev/next buttons, without resizing: the fades follow the new row (Review Focus 4). Open the index drawer: the role-filter row fades, and the fade class is `from-base-300` (Review Focus 5). Open `#/ch/15/glossary`: the category row fades the same way, and changing the side filter re-measures it. A row that fits shows no fade. At 1440, no fade is displayed anywhere (`sm:hidden`).

- [ ] **Step 8: F-07 — quiz order and hint**

Fresh profile, choose the Business role. Open chapter 4 via the index and mark it read, then open QUIZ: question 1 is the s4 question (`NFR`). Fresh profile again, Business role, open chapter 2, mark it read, open QUIZ: the hint reads `ชุดพื้นฐานมีคำถามจากบทที่ 2 ที่คุณเพิ่งอ่าน`. Tap `ไปชุดพื้นฐาน`: the basics round opens with the s2 question first. Review Focus 1: in the biz round, answer question 1, then change the role to Engineering in the header. The run stays on the biz round, and question 2's options still belong to question 2 (the explanation after answering matches the scenario).

- [ ] **Step 9: Gate and hand-off**

Run: `npm run lint && npm test && npm run build`
Expected: all pass, with no warnings beyond `work/ux-run1-baseline.md`. List each warning and the decision on it in the final report. Mark every finding PASS or FAIL in `work/acceptance-ux-run1.md`, with the provider(s) that answered F-01. Do not merge. Hand off with superpowers:finishing-a-development-branch.

---

## Self-review

**Spec coverage (Part B).**
- §B.1 F-01: user turn (Task 1 Step 6), Thai rules and the `<br>` ban (Step 6), `SITE_OVERVIEW` derived from the chapter count (Step 5), Gemini parity test (Step 3), fallback regex and `คุณคือใคร` (Step 5). All four spec tests are in Step 3, and acceptance is in Task 8 Step 2.
- §B.2 F-02: the three normalisation steps, fences skipped, the plugin, `<Markdown rehypePlugins>`: Task 2. All the spec tests are there, including the HAST fixture and the `renderToStaticMarkup` check. Acceptance: Task 8 Step 3.
- §B.3 F-03: `tabEntryScroll` in `src/lib/tabScroll.ts`, the layout effect with its own ref that skips first mount, and `route.requestedSection !== null`: Task 5. Tests cover all transitions plus guide entry with and without a section. Acceptance: Task 8 Step 6.
- §B.4 F-04: pending scroll id, reduced-motion `auto`, `data-msg-id` + `scroll-mt`, disabled chips with the spinner, and the extracted `QuickPromptChips`: Task 3. Acceptance: Task 8 Step 4.
- §B.5 F-05: `sm:`-only thread sizing, `max-sm:sticky…` input wrapper, the note moved under the thread below `sm`, `pb-16` kept: Task 4. Acceptance: Task 8 Step 5.
- §B.6 F-06: `scrollEdges`, `useScrollEdges`, `ScrollFade` on the outline, `Tabs scroll` and the glossary row: Task 6. Acceptance: Task 8 Step 7.
- §B.7 F-07: `orderQuizRound`, the track choice, anchors, the `hasNavigated || initialSource !== 'default'` rule, order memoised per round, the basics hint with `chooseRound('basics')`: Task 7. Acceptance: Task 8 Step 8.
- §B.8 is out of scope; §B.10 per-provider F-01 check: Task 8 Step 2.

**Resolved while planning.**
- `quizRounds.ts` lives in `src/data/`, not `src/lib/`.
- `GENERIC_ANSWER` is defined at `server/knowledge-base.ts:106`; `:138` is `fallbackAnswer`.
- `TabType` also has an unrendered `'simulator'`, which `tabEntryScroll` treats as a non-guide tab.
- The identity lines of `SYSTEM_INSTRUCTION` (old :20-21, with an English role list) are kept, because the spec changes only :22-25.
- The mobile drawer's filter row sits on `bg-base-300`, which needs `fadeFrom`.
- The existing eng-round QuizTab test changes: with no reads, the eng round now opens on the s16 question (track order), not s17.
- "Order memoised per round" is implemented as state, not `useMemo`, so a role change mid-run cannot reorder a running round.
- The fallback "list" is the three tab texts as `- ` bullets under the intro line; `SITE_OVERVIEW` itself stays the exact one-line spec text.

**Placeholder scan.** Every code step has complete code. No "TBD", "similar to Task N", or "add tests" without test code. Task 8 is a browser task, with each check stated as a concrete DOM predicate.

**Type consistency.** `SITE_OVERVIEW` (Task 1). `LINE_SEPARATOR`, `normalizeAnswerMarkdown` and `rehypeLineBreaks` (Task 2). `AnswerMarkdown` (Task 2, untouched after). `QuickPromptChips({ loading, activePrompt, onPick })` (Task 3). `data-chat-thread`, `data-chat-input` and `data-quota-note` (Task 4, used in Task 8). `tabEntryScroll(prev, next, hasRequestedSection)` → `'none' | 'top' | 'chapter-start'` (Task 5). `scrollEdges` → `ScrollEdgeState`, `useScrollEdges(ref)`, `ScrollFade` + `FadeFrom`, and `Tabs.fadeFrom` (Task 6). `orderQuizRound(qs, { trackIds, anchors })`, `quizAnchors(current, read)`, `quizTrackKey(round, role)`, `basicsHintChapter(round, qs, anchors)` and the QuizTab props `chapters`, `readChapters` and `currentChapterId` (Task 7, wired in App in the same task). Names match across tasks and in Task 8's selectors (`data-fade`, `data-quiz-basics-hint`, `data-msg-id`).

**Review Focus.** Item 1: Task 7 Step 7 (per-round state) and Task 8 Step 8. Item 2: Task 1 Step 3 test. Item 3: Task 2 Step 1 tests. Item 4: Task 6 Step 4 (measure after every render) and Task 8 Step 7. Item 5: Task 6 Step 1 test and Task 8 Step 7.
