# Spec: Concise, scannable Thai copy

- Date: 2026-09-22
- Status: Approved; pilot s1 done (owner decisions recorded in R1a, R6, R8, R9)
- Branch: `copy/concise-rewrite` (from `fix/ux-test-quick-fixes` @ `3f0081b`)
- Supersedes, for chapter titles only: the "English only in parentheses after the Thai label" rule in `2026-09-22-layers-and-tracks.md`. UI chrome labels keep that rule.

## 1. Problem

1. **Titles cannot be scanned.** Every chapter title is `long Thai (long English)` — one idea said twice. `TrackPanel.tsx:51` prefixes `บทที่ N: ` and truncates, so the term a reader searches for (QA, CI/CD, Tech Debt) sits in the part that gets cut. Case-study titles follow the same pattern.
2. **Repetition.** `JargonSection.tsx:54,58` prints `นิยามทางการ:` and `🗣️ แปลภาษาคน:` on each of ~70 terms, and the two fields often restate each other. The chapter hero (`ChapterHero.tsx`) shows `plainAnalogy`, `keyTakeaway`, `businessNote` and `engineerNote`, then `PrimerSection` shows `whatIsIt`, `whyItMatters` and `realWorldScenario` — the same core idea up to 7 times before the body starts.
3. **Textbook tone.** Filler openers ("ทำความเข้าใจ…", "ทำไม…ถึง…" in 6/15 subtitles), redundant English glosses in parentheses, and unsourced precise numbers ("บริบทหายเฉลี่ย 15-20%", "ราบรื่น 100%").

## 2. Style guide (applies to every rewritten string)

**R1 — Concise, still concrete.** Cut exposition; keep examples, analogies and numbers that have a source. One idea per sentence.

**R2 — Every field adds something new.** A field must not restate another field on the same screen. If it has nothing new to say, shorten it or merge it (see §4, §5).

**R3 — Use the words people really say.** Terms the Thai industry says in English stay English (CI/CD, QA, Sprint, API). Otherwise write Thai. Don't translate just to be translating.

**R4 — English gloss once.** Use `ไทย (English)` only at the first mention in a chapter, and only when the English is the term a reader would search for. Never gloss a plain word: drop `(Solution)` and `(Problem & Business Outcome)`.

**R5 — Banned fillers:** ทำความเข้าใจ, หัวใจของ, กฎเหล็ก, ศิลปะการ…, ทำการ…, ในการ… (when removable), ซึ่ง… (when a new sentence works), passive ถูก… (when active works), อย่างไร at the end of a title.

**R6 — Numbers.** Keep figures from real, attributable cases (e.g. Knight Capital $440M). Story parameters inside fictional scenarios (200,000 fans, 40% of customers) may stay; a scenario that reads like a real event should say it is illustrative. Replace unsourced precise figures with an honest magnitude word ("หายไปเยอะ", "เกือบทั้งหมด") or delete them.

**R1a — Cut clauses, not connectors.** Keep `ส่วน`, `พอ`, `กลับ`, `แต่` and list commas. The pilot showed that dropping them causes most segmentation ambiguity (e.g. `Output คือของที่ทีมส่งมอบ Outcome คือ…` reads as "the team delivers the Outcome"). Watch `เลย`/`พอ` right after a number or noun, where they can bind either way (`ไม่ถามทีม Dev เลยต้องทำโอที`).

**R8 — Canonical terms (site-wide).**
- Use `Dev` for the person in speech and in meeting examples. Use `ทีม Engineering` for the function. Don't use โปรแกรมเมอร์, วิศวกร or Developer as synonyms.
- Write `Sprint`, not สปรินต์ (R3).

**R9 — Jargon cards.**
- A `meetingExample` must contain the term itself.
- Keep `formalDefinition` whenever `humanTranslation` alone would misdefine the term. Example: Hand-off is neutral; "throwing work over the wall" is only its bad form.

**R7 — Thai readability** (checked by the reviewer, §7):
- (a) No segmentation ambiguity. Example: `ความต้องการรั่วระหว่างทาง` reads as `ความต้องการ|รั่ว` or `ความ|ต้องการรั่ว`. Fix it with a clear subject + verb or a different word (`โจทย์เพี้ยนระหว่างทาง`).
- (b) No long noun stacks (`การแปลงความต้องการเป็นสเปกของระบบ`). Prefer verbs.
- (c) No translationese.
- (d) Read-aloud test: would a colleague say this in a meeting?
- (e) Consistent Thai–English spacing and casing across the site (one spelling per term).

## 3. Chapter titles

- **Data:** `Chapter` gains `enTerm?: string`.
  - `title` = short Thai-or-industry term, search keyword first, no parentheses.
  - `enTerm` = the canonical English name, rendered as a small tag.
  - `subtitle` = one-line hook that states the reader's problem or payoff. It must not open with a banned filler.
- **Examples** (the final wording is picked by the owner):
  - `โจทย์เพี้ยนระหว่างทาง` + `Leaky Pipeline`
  - `CI/CD และการปล่อยของ` + `DevOps`
  - `หนี้ทางเทคนิค` + `Tech Debt`
- **Case-study titles** (`RealWorldExample.title`): same rule. A short Thai headline. Keep the English name only if the case is known by it (e.g. `Knight Capital`).
- **Process:** one agent drafts **2–3 options per chapter** with R7 review notes. The **owner picks**. Nothing is committed before the owner picks.
- **Budgets** (see §8): `title` ≤ 24 characters, `enTerm` ≤ 24, `subtitle` ≤ 70, case-study `title` ≤ 32.

## 4. Chapter hero and Primer — one job per field

| Field | Job | Budget |
|---|---|---|
| `plainAnalogy` | One everyday analogy | 1 sentence, ≤ 120 chars |
| `keyTakeaway` | The one thing to remember | 1 sentence, ≤ 100 chars |
| `businessNote` | What business should *do*; starts with a verb | ≤ 100 chars |
| `engineerNote` | What engineers should *do*; starts with a verb | ≤ 100 chars |
| `beginnerPrimer.whatIsIt` | Definition, without repeating the analogy or the takeaway | ≤ 160 chars |
| `beginnerPrimer.whyItMatters` | Cost of getting it wrong | ≤ 160 chars |
| `beginnerPrimer.realWorldScenario` | One concrete chain of events (keep the `->` chain style) | ≤ 220 chars |

No UI change.

## 5. Jargon — layout A plus merging

- **Data:** `JargonTerm.formalDefinition` becomes optional.
  - The writer **omits** it when it would only restate `humanTranslation`.
  - When it is present, it gives the precise boundary of the term, and `humanTranslation` gives the picture (an analogy or an example).
- **UI** (`JargonSection.tsx`):
  - `humanTranslation` is the primary line: normal size, strong colour, no label.
  - `formalDefinition` renders below it: smaller, muted, no label. Skip it when it is absent.
  - `meetingExample` renders as a quote block.
  - The `นิยามทางการ:` and `🗣️ แปลภาษาคน:` labels are removed.
- **Glossary:** `glossary.ts` has no `formalDefinition` field. It gets the same R1–R7 copy pass only.
- **Budgets:** `humanTranslation` ≤ 120 chars, `formalDefinition` ≤ 140, `meetingExample` ≤ 160.

## 6. Other fields

- `coreConcepts`, `realWorldWorkflow`, `checklist`, `commonPitfalls`, `dialogueExample` and `realWorldExamples` bodies get the R1–R7 pass. There are no new budgets, but the target is ≥ 30% shorter where it doesn't lose an example.
- `ChapterPitfall.preventionRule` is rendered nowhere (verified: the only reference outside the chapter data is `types.ts:110`). **Delete** the field from the type and the data.
- `frictionFaqs.ts` and `frictionPlaybooks.ts` get the copy pass.
- **Out of scope:**
  - `chapterContentBlocks.ts`, `badgesData.ts`, `roleMindsets.ts`, `chapterIllustrations.ts` and UI chrome strings.
  - `quizQuestions.ts` is also out, except for strings that quote a chapter title or a jargon wording that changed. Those must be updated to match.
- Search (`GuideTab.tsx:285-286`) reads `title`/`keyTakeaway`/`plainAnalogy`. Add `enTerm` so that English searches still match after the English leaves the title.

## 7. Process

1. **Pilot — chapter s1.** A writer agent applies §2–§6 to s1, then a Thai reviewer agent runs R7. **The owner reviews the tone.** Adjust this spec if needed.
2. **Fan-out** (writers run in parallel on disjoint files):
   - W-titles: `title`, `enTerm`, `subtitle` and case-study titles for all 15 chapters → an options table for the owner (no commit).
   - W-A: s2–s5 (`chapters1_5.ts`, excluding titles).
   - W-B: s6–s10 (`chapters6_10.ts`).
   - W-C: s11–s15 (`chapters11_15.ts`), plus `glossary.ts`, `frictionFaqs.ts`, `frictionPlaybooks.ts`.
3. **Thai review.** A separate reviewer agent (not the writer) checks each batch against R7. It reports each finding with the location, the reason and 1–2 fixes, and does not rewrite silently. The writer applies the fixes.
4. **UI and types** (main session):
   - `enTerm` in `types.ts` and `ChapterHero`.
   - The TrackPanel label.
   - The JargonSection layout.
   - `formalDefinition` becomes optional.
   - `preventionRule` is removed.
   - Search includes `enTerm`.
5. **Verification:**
   - `npm test`, `tsc --noEmit`, and the budget test (§8).
   - Browser check: TrackPanel titles no longer truncate at desktop and mobile widths, and JargonSection renders in light and dark.
6. **One commit per batch** on `copy/concise-rewrite`.

## 8. Budget test

Add `src/data/copyBudgets.test.ts`. It iterates all chapters and asserts:

- the length budgets in §3–§5 (counted by `[...str].length`);
- no parentheses in `title`;
- `businessNote`/`engineerNote` do not start with a banned filler;
- no banned filler from R5 at the start of `subtitle`.

Failures list the chapter id, the field and the actual length, so writers can iterate.

## 9. Done when

- Every in-scope field passes §8.
- The owner has picked all 15 titles.
- The Thai reviewer has no open R7 findings.
- Tests and types pass.
- A browser screenshot shows untruncated track titles and the new jargon layout.
