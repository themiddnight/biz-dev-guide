# Spec: Round-3 UX fixes (resume, quiz results, basics round, override scope, quiz default)

- Date: 2026-09-23
- Status: Ready for implementation. Every open choice is decided in §8 with its rationale.
- Branch: `feat/role-perspective` @ `2cc730d`
- Target app: `/Users/Pathompong/Sites/Personal/biz-dev-guide/src`
- Evidence: `work/ux-test-roles-r3/synthesis.md` (issue IDs I-06…I-17, round 3). Round-2 evidence: `work/ux-test-roles/synthesis.md`.
- **Order.** This spec follows `docs/specs/2026-09-23-role-ux-fixes.md` (whose five phases are shipped, commits `048a900`…`2cc730d`) and runs alongside `docs/specs/2026-09-23-term-definitions.md`; the two are independent — no phase here touches `src/data/glossary.ts`, `src/data/sectionLayers.ts` or the Jargon Buster, and the term-definitions spec touches no file listed here except `src/data/chapters/*` (different fields). Ship in whichever order suits; if both are in flight, land term-definitions Phase 1–2 first because they are smaller.
- UI copy is **Thai-first** and follows `2026-09-22-concise-copy.md` (R1–R9). Every Thai string quoted here is the literal copy to ship. Spec prose, code and tests are English.
- Decisions in this document are numbered from **D1**; they do not continue the numbering of `2026-09-23-role-ux-fixes.md`. Where a decision supersedes an earlier one, it says so in the row.

## 0. Background and verified facts

Round 3 ran the same four role personas (Mint biz-beginner, Bank eng-beginner, Nok biz-experienced mobile, Tee eng-crossover) against the five shipped fixes. All five landed. Teach-backs held at 10 Correct / 3 Partial / 0 Wrong, role-fit median rose 4 → 5 for all four, and the ch.12 override survived a role round trip 4/4 (round 2 lost it 4/4). The five issues below are what round 3 newly proved, worst first.

Every `file:line` in the synthesis was re-verified against the working tree before this spec was written. **Two corrections to the synthesis**, both in the reader's favour — the synthesis is right about the defect, imprecise about the number:

| Synthesis says | Code says |
|---|---|
| The track card's `อ่านต่อ` label and `firstUnreadId` target are at `TrackPanel.tsx:61,64` | The button is at `TrackPanel.tsx:57-65`; `onClick` → `firstUnreadId` at `:61`, the three-way label (`จบเส้นทางแล้ว — ทำแบบทดสอบ` / `เริ่มอ่าน` / `อ่านต่อ`) at `:64`. The finding holds exactly; there is a third label state the synthesis does not mention (`เริ่มอ่าน` when `read === 0`), and it must survive Phase 1. |
| I-07: "longest option up to **2.66× the mean**" | 2.66× is the ratio of the correct option to the **longest distractor** (id 5: 178 vs 67). The correct/mean ratio is 1.98×. Re-measured in this tree: correct is strictly longest in **7 of 8** (all but id 7), correct/longest-distractor = 1.58, 1.51, 1.98, 1.21, **2.66**, 1.65, 0.87, 1.57. The finding holds; Phase 3's budget is written against the re-measured numbers. |

**Verified code facts** (working tree, branch `feat/role-perspective`):

| Fact | Where |
|---|---|
| `DEFAULT_CHAPTER = 's1'`; the active chapter on a bare load is `route?.chapterId ?? DEFAULT_CHAPTER` — the stored chapter is never a candidate. | `hooks/useChapterRoute.ts:32, 37-40` |
| `be_guide_last_chapter` is read into `resumeCandidate` only (`useState`, never applied to `activeChapterId`), and written only after a real navigation or a hash load. | `useChapterRoute.ts:33, 44, 55-57` |
| `reduceRouteSession` sets `resumeDismissed: true` on **both** `navigate` and `pop`. One click on any track item, index row or search hit ends the banner for the page session. | `lib/chapterRoute.ts:53-58` |
| `showResume = !loadedFromHash && !!resumeChapter && resumeChapter.id !== activeChapterId && !showFirstVisit && !resumeDismissed`; `ResumeBanner` renders at the top of the reader column. | `components/GuideTab.tsx:278`, `:533-539` |
| `ResumeBanner` copy: `อ่านต่อจากครั้งก่อน? บทที่ {num}: {title}` and button `อ่านต่อบทที่ {num}`. | `components/guide/ResumeBanner.tsx:8, 12` |
| `jumpToTrackStart` returns early when `loadedFromHash`, with the comment `a shared link wins over onboarding (spec §4.3, D5)`. Both first-visit handlers call it. | `GuideTab.tsx:259-272` |
| Track card primary button: `onClick` → `firstUnreadId === null ? onStartQuiz() : onSelectChapter(firstUnreadId)`; label `จบเส้นทางแล้ว — ทำแบบทดสอบ` / `เริ่มอ่าน` / `อ่านต่อ`. `firstUnreadId` = first track id not in `readChapters`. | `components/guide/TrackPanel.tsx:57-65`; `data/readingTracks.ts:49-58` |
| Quiz results screen: fixed `ยินดีด้วย! คุณทำแบบทดสอบครบแล้ว` + `คุณเข้าใจงานระหว่าง Business กับ Engineering มากขึ้นแล้ว`, no score branch; bouncing trophy; score/XP card; exactly two buttons (`ทำแบบทดสอบอีกครั้ง`, `ถาม AI ทบทวนข้อที่ยังไม่แม่น`). | `components/QuizTab.tsx:172-238` |
| `QuizRun` keeps `currentIndex`, `selectedOptionIndex`, `score`, `awardedXp`, `isFinished`, `shuffledOptions`. **No per-question answer history is retained**, so nothing today could list missed items. | `QuizTab.tsx:129-135, 139-150` |
| Per-question explanation and `อ่านบทที่เกี่ยวข้อง` exist only inline during the run; the chapter button is gated on `currentQ.chapterId`. | `QuizTab.tsx:331-356` |
| **Ids 1–8 have no `chapterId` at all** (re-verified: `chapterId=undefined` for all eight). Ids 9–20 all have one, pinned by a test. | `data/quizQuestions.ts:3-253`; `quizQuestions.test.ts:44` |
| `defaultQuizRound(role) = role ?? 'basics'`, consumed as `useState(() => defaultQuizRound(role))`. With a role set the tab always opens the role round. A round change is never persisted. | `data/quizRounds.ts:22`; `QuizTab.tsx:62` |
| Rounds are `basics` (`forRole: 'both'`, 8), `eng` (6), `biz` (6), `all` (20). The chip strip marks the reader's own round ` (สายคุณ)`. | `data/quizRounds.ts:6-20`; `QuizTab.tsx:102` |
| Existing length guard: "not always the longest" for all three rounds; "at most 2 longest" and "ratio ≤ 1.1" for **role rounds only** (`q.id >= 9 && q.id <= 20`). | `data/quizQuestions.test.ts:66-92` |
| Per-chapter level behaviour is correct and per role: `resolveChapterLevel` is called inline per render; the active override map is recomputed from the current role per render. | `data/rolePerspective.ts:30-39`; `App.tsx:69`; `lib/rolePrefs.ts` |
| The lens row prints only the resolved level (`เปิดแบบคุ้นงาน` / `เปิดแบบมือใหม่` / `ใช้ระดับเดียวกันทุกบท`); the only "this chapter only" hint is `aria-label="ระดับของบทนี้"`; the reset link always reads `กลับไปใช้ค่าตามสายงาน`. | `GuideTab.tsx:678-722` |
| Test runner: vitest, node env; components via `renderToStaticMarkup` with explicit props (`IndexEmptyState.test.tsx`, `QuizTab.test.tsx`); `lint` = `tsc --noEmit`. There is **no DOM test environment and no `@testing-library`**, so hooks and interactive flows are only testable through extracted pure functions. | `package.json`; `components/QuizTab.test.tsx:8-11` |

---

## Phase 1 — Reopening the guide returns the reader to where they were, and `อ่านต่อ` means one thing (I-06, I-12)

**Size: medium.** 1 hook, 1 pure lib, 2 components, 1 component deleted, 3 test files. The only phase that changes routing.

### Problem

Three of four personas could not get back to the chapter they were reading. The position is **not** lost — it is stored and read back, and then deliberately not used:

1. `be_guide_last_chapter` holds the chapter (`useChapterRoute.ts:33`, written at `:55-57`). Tee read the key in `localStorage` and found `"s12"`.
2. It is read back into `resumeCandidate` (`:44`) and never into `activeChapterId`, which is hard-coded to `DEFAULT_CHAPTER = 's1'` on a bare load (`:32, :38`). So Tee's report that "the stored position isn't read back" is wrong as stated, and the defect is worse than a storage bug: the app knows where the reader was and opens chapter 1 anyway.
3. The only restorer is `ResumeBanner`, below the fold of the reader column on mobile — Bank: "easy to miss on first glance".
4. **Any** navigation kills the banner for the page session (`lib/chapterRoute.ts:53-58`, on `navigate` **and** `pop`). One click on a track item, an index row or a search hit and the only route back is gone. This is the most likely explanation for Tee seeing no control at all, and for the round-3 R-7 divergence between his two runs (synthesis §5 caveat 6).
5. The track card's primary button is also labelled `อ่านต่อ` and goes to `firstUnreadId` — the next **unread** chapter, not the last **read** one (`TrackPanel.tsx:61, :64`). Mint's ch.12 → ch.14 jump is exactly this: with ch.1 and ch.2 marked read, the first unread chapter of `2,1,14,4,6,9,10,11` is ch.14. Two controls, the same Thai verb, different destinations.

Same routing code, second symptom (**I-12**): a leftover `#/ch/N` in the address bar silently cancels the first-visit track jump (`jumpToTrackStart` → `if (loadedFromHash) return;`, `GuideTab.tsx:261`). Bank and Nok both landed on ch.1 after picking a role whose track starts at ch.16 and ch.2, so this round's headline fix did not apply to half the personas, and both then rated expectation only "partly" matched. The rule it protects (a shared link beats onboarding) is right for a *load*; it is wrong for a choice the reader is making *right now*.

### Change

**P1.1 One precedence rule for the chapter shown on load.** Add to `lib/chapterRoute.ts`:

```ts
/** Hash wins (a shared link), then the stored chapter (resume), then the default. */
export function resolveInitialChapter(
  route: ChapterRoute | null,
  storedLast: string | null,
  chapters: ChapterRef[],
  fallback: string,
): { chapterId: string; source: 'hash' | 'stored' | 'default' };
```

- `route` non-null → `{ route.chapterId, 'hash' }`.
- else `storedLast` non-null **and** present in `chapters` → `{ storedLast, 'stored' }`. An unknown id (a deleted chapter, edited storage) falls through.
- else `{ fallback, 'default' }`.

`useChapterRoute` uses it in its `useState` initialiser (`:36-39`), reading `be_guide_last_chapter` there instead of into a separate `resumeCandidate` state. The hook returns `initialSource` in place of `resumeCandidate`.

**P1.2 The resume banner and its session state are deleted.** With P1.1 the reader is already on the chapter they left, so a banner offering to go there is a no-op, and the self-dismissing behaviour that lost Tee's only route back has nothing left to dismiss. Remove:

- `components/guide/ResumeBanner.tsx` (delete the file) and its render site (`GuideTab.tsx:533-539`).
- `showResume` / `resumeChapter` (`GuideTab.tsx:278`), the `resumeCandidate`, `resumeDismissed`, `dismissResume` members of `ChapterRouteApi`, the `dismissResume` callback, and the `dismissResume` event of `RouteSessionEvent`.
- `resumeDismissed` from `RouteSession`, `initRouteSession` and `reduceRouteSession`. `hashInUrl` stays: it has an unrelated consumer.
- Whatever prop threads `onDismissResume` from `App.tsx` into `GuideTab`.

**P1.3 The reader is told where they were put.** Auto-restore must not look like "the app forgot my navigation". In the chapter top-navigation bar (`GuideTab.tsx:542`), when `initialSource === 'stored'` **and** the reader has not navigated yet this session, render one muted line carrying `data-resumed`:

`อ่านต่อจากครั้งก่อน · บทที่ {num}`

It disappears on the first navigation (it is keyed off the same "has navigated" fact the hook already tracks — expose `hasNavigated: boolean` from `useChapterRoute`, derived from the existing `navigatedRef` promoted to state). It has no button and no dismiss control: there is nothing to act on.

**P1.4 The two controls get different verbs.** `อ่านต่อ` is reserved for "continue where you left off", which after P1.1 is what the app does by itself. The track card's primary button therefore never says `อ่านต่อ` again. Add to `data/readingTracks.ts`:

```ts
/** Literal label for the track card's primary button. */
export function trackPrimaryLabel(read: number, firstUnreadId: string | null): string;
```

| state | label (literal) |
|---|---|
| `firstUnreadId === null` | `จบเส้นทางแล้ว — ทำแบบทดสอบ` (unchanged) |
| `read === 0` | `เริ่มอ่านบทแรกของเส้นทาง` |
| otherwise | `ไปบทถัดไปที่ยังไม่อ่าน` |

`TrackPanel.tsx:64` calls it. The `onClick` behaviour is unchanged — the button advances the track, and now says so. This is the naming half of D3: the two controls differ in **wording**, not only in behaviour.

**P1.5 An explicit first-visit choice beats a stale hash (I-12).** `jumpToTrackStart` (`GuideTab.tsx:259-264`) drops `if (loadedFromHash) return;`. The shared-link rule moves to where it belongs — P1.1's precedence, which still lets a hash decide the chapter shown on load. A first-visit role or level choice is a deliberate act taken after the page is open, and it always jumps to the chosen track's first chapter. The comment is replaced with: `// An explicit first-visit choice wins over the loaded hash (round3 spec D4).`

### Files

`src/lib/chapterRoute.ts` · `src/hooks/useChapterRoute.ts` · `src/components/GuideTab.tsx` · `src/components/guide/TrackPanel.tsx` · `src/data/readingTracks.ts` · **deleted** `src/components/guide/ResumeBanner.tsx` · `src/App.tsx` (only if it threads `onDismissResume`) · tests below.

No storage-key change and no migration: `be_guide_last_chapter` keeps its name, shape and write points, and an existing value starts working the moment this ships.

### Tests

- `src/lib/chapterRoute.test.ts`:
  - **new** `resolveInitialChapter`: hash + stored → hash, source `'hash'`; no hash + stored `'s12'` → `'s12'`, `'stored'`; no hash + stored `'s99'` (unknown id) → fallback, `'default'`; no hash + `null` → fallback, `'default'`; a legacy `#s12` hash still wins.
  - `:36-59` "route session": drop the two `resumeDismissed` assertions in `navigate`/`pop` and the whole `dismissResume` test (`:58`); keep and rename the `navigate`/`pop` tests to cover `hashInUrl` only.
- **new** `src/data/readingTracks.test.ts` block for `trackPrimaryLabel`: `(0, 's2')` → `เริ่มอ่านบทแรกของเส้นทาง`; `(3, 's14')` → `ไปบทถัดไปที่ยังไม่อ่าน`; `(8, null)` → `จบเส้นทางแล้ว — ทำแบบทดสอบ`; and a guard that no returned label contains `อ่านต่อ`.
- **new** `src/components/guide/TrackPanel.test.tsx` (`renderToStaticMarkup`, `CHAPTERS`, `trackKey: 'biz'`): with `readChapters: []` the markup contains `เริ่มอ่านบทแรกของเส้นทาง`; with two read it contains `ไปบทถัดไปที่ยังไม่อ่าน` and **not** `อ่านต่อ`; `data-track-primary` is present in both.
- Grep guard, run once by hand and recorded in the commit message: `rg 'อ่านต่อ' src/` returns only the `data-resumed` line of P1.3.

### Acceptance

1. Fresh profile, pick a role, read to ch.12 (click it in the sidebar), then reload with **no hash in the URL** (clear the fragment): ch.12 opens. No banner. The top bar shows `อ่านต่อจากครั้งก่อน · บทที่ 12`.
2. Same as 1, but click any index row or track item before reloading: ch.12 still opens on reload (the old banner would have been dismissed for good).
3. Open `#/ch/4` directly with `be_guide_last_chapter` = `s12`: ch.4 opens (a shared link still wins), and no resume line shows.
4. With a leftover `#/ch/1` in the address bar, `localStorage.clear()` and reload, then pick `💻 ฉันมาจากสาย Engineering`: **ch.16 opens**, not ch.1. Repeat for Business: ch.2 opens. This is the I-12 acceptance.
5. The track card reads `เริ่มอ่านบทแรกของเส้นทาง` on a fresh track, `ไปบทถัดไปที่ยังไม่อ่าน` once one chapter is read, and `จบเส้นทางแล้ว — ทำแบบทดสอบ` when the track is complete. No control anywhere in the app is labelled `อ่านต่อ`.
6. Back/forward still work: from ch.12 click ch.4, press Back → ch.12, Forward → ch.4, and the resume line does not reappear.
7. At 375px the resume line does not wrap the top bar into two rows or cause horizontal scroll.

---

## Phase 2 — The quiz result screen reviews wrong answers and stops praising every score (I-08)

**Size: medium–large.** The largest phase: a new data field on 8 questions, answer history in `QuizRun`, one extracted component, one new pure lib, 3 test files. Promoted out of `2026-09-23-role-ux-fixes.md` §10 Follow-ups on round-3 evidence.

### Problem

Four persona-hits across two consecutive rounds, with the same quote both times. Mint: "at the results screen the only ways back to it were `ทำแบบทดสอบอีกครั้ง` (redo the whole quiz) or `ถาม AI ทบทวนข้อที่ยังไม่แม่น`". Bank: "No dedicated review-my-mistakes screen". Both marked task S-5 **P** in round 2 and again in round 3.

The code confirms all of it (`QuizTab.tsx:172-238`): a fixed `ยินดีด้วย! คุณทำแบบทดสอบครบแล้ว` with a bouncing trophy and no score branch — shown identically at 8/8 and at 1/8 — then a score/XP card, then exactly two buttons. Per-question explanations exist only inline during the run (`:331-342`), and `QuizRun` keeps no answer history (`:129-135`), so there is nothing to review even if a screen existed. The AI button is the only remedy offered and is unavailable to a reader with no API key.

**Blocker the synthesis found, and this spec must clear first.** The per-question route back to the source chapter is gated on `currentQ.chapterId` (`:347-356`), and **ids 1–8 have no `chapterId`** — re-verified in this tree, all eight `undefined`. The 8-question basics round is the round both beginners actually sat. So a beginner who misses a question gets no route back today, and a review list would show them a missed question with nothing to click. **This is a data addition, not a refactor**, and it is P2.1.

### Change

**P2.1 Data: `chapterId` on the 8 basics questions.** `src/data/quizQuestions.ts`, ids 1–8. The field already exists on `QuizQuestion` (optional) and is already validated when present (`quizQuestions.test.ts:25-29`), so no type change is needed. Proposed mapping, each traced to the chapter that actually teaches the answer:

| id | topic | `chapterId` | evidence |
|---|---|---|---|
| 1 | PM vs PjM | `s2` | `chapters1_5.ts:164` (`Product Manager (PM) คือคนที่ตัดสินว่า…`) |
| 2 | Non-Functional Requirement | `s4` | s4 `BA และ NFR ที่คนมักลืม`, `chapters1_5.ts:436` |
| 3 | "just one button" is 5% of the work | `s11` | `chapters11_15.ts:56` case study `แค่เพิ่ม Checkbox เดียว ระบบล่ม` |
| 4 | C4 Level 1 for executives | `s5` | s5 `อ่าน Architecture ด้วย C4`, `chapters1_5.ts:579` |
| 5 | Severity vs Priority | `s7` | `chapters6_10.ts:235-242` (the Severity/Priority core concept) |
| 6 | rollback / feature flag first | `s10` | s10 `SRE และการรับมือระบบล่ม`, `chapters6_10.ts:566`. Runner-up `s8` (rollback mechanics, `chapters6_10.ts:373, 399, 421`); `s10` wins because the question is about what to do during an incident |
| 7 | Technical Debt Quadrant | `s9` | `chapters6_10.ts:509` (`หนี้ทางเทคนิค 4 แบบ (Martin Fowler's Quadrant)`) |
| 8 | Cone of Uncertainty | `s11` | `chapters11_15.ts:32, 69` — the term is defined in s11's jargon list, not in s17 |

The implementer re-checks each row with `rg` before committing; the test in P2.5 makes "every question has a `chapterId`" a permanent rule, so a future question cannot reopen this hole.

**P2.2 `QuizRun` records what was answered.** Add one state array beside `score`:

```ts
interface QuizAnswer { questionId: number; correct: boolean; chosenText: string }
const [answers, setAnswers] = useState<QuizAnswer[]>([]);
```

`handleSelectOption` appends one entry (it already computes `isCorrect` and has `currentOptions[idx]`). `handleRestart` clears it. Nothing else reads it during the run. `chosenText` is stored, not the shuffled index, because the shuffle is re-rolled on restart.

**P2.3 New pure module `src/lib/quizResult.ts`.** The screen's judgement moves out of JSX so it can be tested in the node env:

```ts
export type ScoreBand = 'strong' | 'partial' | 'weak';
/** ≥ 80% strong, ≥ 50% partial, below that weak. */
export function scoreBand(score: number, total: number): ScoreBand;
export function resultCopy(band: ScoreBand): { heading: string; subtitle: string };
/** The questions answered wrongly, in run order, paired with what was chosen. */
export function missedItems(questions: QuizQuestion[], answers: QuizAnswer[]):
  { question: QuizQuestion; chosenText: string; correctText: string; explanation: string }[];
```

`resultCopy` literals — this replaces the unconditional `ยินดีด้วย!`:

| band | heading | subtitle |
|---|---|---|
| `strong` | `ทำได้ดีมาก` | `เข้าใจภาพรวมงานระหว่าง Business กับ Engineering แล้ว` |
| `partial` | `ผ่านแล้ว แต่ยังมีจุดที่ควรทบทวน` | `ดูข้อที่ตอบผิดด้านล่าง แล้วกลับไปอ่านบทที่เกี่ยวข้อง` |
| `weak` | `ยังไม่แม่น ลองทบทวนก่อนทำอีกครั้ง` | `ดูข้อที่ตอบผิดด้านล่าง แล้วกลับไปอ่านบทที่เกี่ยวข้อง` |

`explanation` in `missedItems` is the **correct** option's explanation — the sentence that teaches, not the one that rebuts the reader's pick.

**P2.4 New component `src/components/quiz/QuizResultScreen.tsx`.** Move `QuizTab.tsx:172-238` into it verbatim, then change:

- Props: `{ score: number; total: number; awardedXp: number; missed: ReturnType<typeof missedItems>; onRestart: () => void; onAskAI: () => void; onOpenChapter: (id: string) => void }`. No hooks, no context — same shape as `IndexEmptyState`, so it is testable with `renderToStaticMarkup`.
- Heading and subtitle come from `resultCopy(scoreBand(score, total))`. Root carries `data-quiz-result={band}`.
- The icon follows the band: `Trophy` with `animate-bounce` for `strong` only; `partial` and `weak` use a static `Target` (already available from `lucide-react`) with the existing amber tile, no bounce. The `ทำครบแล้ว! บันทึกผลแล้ว` pill stays for all bands — it is a fact, not praise.
- The score/XP card is unchanged.
- **New review block**, between the score card and the buttons, rendered only when `missed.length > 0`, with `data-quiz-review`:
  - heading `ข้อที่ตอบผิด ({missed.length} ข้อ)`;
  - one card per missed item, in run order: the question text; `คุณตอบ: {chosenText}`; `คำตอบที่ถูก: {correctText}`; the correct option's `explanation`; and a button `อ่านบทที่ {num}: {title}` carrying `data-quiz-review-chapter={chapterId}` that calls `onOpenChapter`. After P2.1 every question has a `chapterId`, so the button always renders; if it is ever missing, the card renders without the button rather than crashing.
  - When `missed.length === 0`, a single line instead: `ตอบถูกทุกข้อ`.
- The two existing buttons keep their copy and order. `ถาม AI ทบทวนข้อที่ยังไม่แม่น` stays, but is no longer the only review path (that was the substance of the complaint).

`QuizRun` renders `<QuizResultScreen … />` when `isFinished`, passing `missedItems(questions, answers)`.

### Files

`src/data/quizQuestions.ts` (ids 1–8, add `chapterId`) · `src/components/QuizTab.tsx` · **new** `src/lib/quizResult.ts` · **new** `src/components/quiz/QuizResultScreen.tsx` · `src/data/quizQuestions.test.ts` · **new** `src/lib/quizResult.test.ts` · **new** `src/components/quiz/QuizResultScreen.test.tsx`.

### Tests

- `src/data/quizQuestions.test.ts`: tighten `:25-29` to **every** question has a `chapterId` and it exists in `CHAPTERS` (the failure message names the id). Add the literal map of P2.1 as an assertion, so a silent re-pointing of a basics question shows up in review.
- **new** `src/lib/quizResult.test.ts`:
  - `scoreBand`: `8/8` and `7/8` → `strong`; `4/8` → `partial`; `3/8` → `weak`; `0/8` → `weak`; `6/6` → `strong`. Boundaries stated explicitly: exactly 80% → `strong`, exactly 50% → `partial`.
  - `resultCopy`: `strong` heading is `ทำได้ดีมาก`; no band's heading or subtitle contains `ยินดีด้วย`.
  - `missedItems`: wrong answers only, in run order; each item's `correctText` is the option with `isCorrect`; `explanation` is that option's explanation, not the chosen one's; all-correct answers → `[]`.
- **new** `src/components/quiz/QuizResultScreen.test.tsx` (`renderToStaticMarkup`, props built from `getQuizRound(QUIZ_QUESTIONS, 'basics')`):
  - `score: 1, total: 8` with one missed item → contains `data-quiz-result="weak"`, `ยังไม่แม่น`, `ข้อที่ตอบผิด (1 ข้อ)`, `data-quiz-review-chapter=`, and **not** `ยินดีด้วย` and **not** `animate-bounce`.
  - `score: 8, total: 8`, `missed: []` → contains `ทำได้ดีมาก`, `ตอบถูกทุกข้อ`, `animate-bounce`, and no `data-quiz-review`.
  - A missed item renders `คุณตอบ:`, `คำตอบที่ถูก:` and the correct option's explanation text.
- `src/components/QuizTab.test.tsx` is unchanged (it renders the pre-run state).

### Acceptance

1. Play `พื้นฐาน · 8 ข้อ` and answer 1 correctly: the result heading reads `ยังไม่แม่น ลองทบทวนก่อนทำอีกครั้ง`, the trophy does not bounce, and `ยินดีด้วย!` appears nowhere.
2. The same screen lists 7 cards under `ข้อที่ตอบผิด (7 ข้อ)`, each showing what was chosen, the correct answer, the explanation, and a working `อ่านบทที่ N: …` button. Clicking one opens that chapter in the Guide tab.
3. Every one of the 8 basics questions has a chapter button — none renders a card with no route back.
4. Answer all 8 correctly: heading `ทำได้ดีมาก`, the bouncing trophy returns, and the review block is replaced by `ตอบถูกทุกข้อ`.
5. Answer 4 of 8: heading `ผ่านแล้ว แต่ยังมีจุดที่ควรทบทวน`.
6. `ทำแบบทดสอบอีกครั้ง` still resets the run, and a second run's review block reflects the second run's answers only.
7. XP is unchanged: the XP card shows the same number as before this phase for the same answers (XP is still paid per answer, `QuizTab.tsx:148`).
8. At 375px the review cards do not overflow horizontally; long option text wraps.

---

## Phase 3 — The basics round no longer leaks its answer through option length (I-07)

**Size: small–medium.** 1 data file (8 questions, option text only), 1 test file. Content authoring, no logic.

### Problem

Mint and Bank both sat `พื้นฐาน · 8 ข้อ` and both scored 7/8. Re-measured in this tree with `[...text].length`: the correct option is strictly the longest in **7 of the 8** questions (all but id 7), at correct/longest-distractor ratios of 1.58, 1.51, 1.98, 1.21, **2.66** (id 5: 178 vs 67), 1.65, 0.87, 1.57. A reader can pass the round the app uses as its own comprehension signal by picking the long answer. `2026-09-23-role-ux-fixes.md` Phase 5 fixed ids 9–20 to a 1.04 maximum and left the basics round explicitly as a follow-up (its D17); the guard test it added also stops at id 20 (`quizQuestions.test.ts:84`).

### Change

**P3.1 Extend the existing guard, do not invent a mechanism.** `src/data/quizQuestions.test.ts:66-92` already holds the shape of the answer. Change three things:

- The `≤ 2 longest` test covers `basics` too, at **`≤ 3`** for an 8-question round (chance expectation with 4 options is 2).
- The `ratio ≤ 1.1` test drops its `q.id >= 9 && q.id <= 20` filter and covers **all 20 questions**, at a budget of **1.15** (ids 9–20 sit at 1.04, so the looser budget costs nothing there and gives the Thai rewrite of ids 1–8 usable headroom).
- The "not always the longest" test is unchanged; it already passes on all three rounds and keeps passing.

**P3.2 Rewrite option text for ids 1–8** in `src/data/quizQuestions.ts`. `isCorrect`, `question`, `scenario`, `role`, `category`, `xp`, `forRole`, `explanation` and (from Phase 2) `chapterId` are **unchanged**. The method is the one Phase 5 of the previous spec used, and it has a direction: **lengthen thin distractors into plausible misconceptions rather than truncating the correct answer**, so no teaching content is lost. Target band: every option in a question within **60–95** code points, and no option more than 1.15× the longest other option.

Two questions need more than distractor padding, and the spec names them so they are not discovered late:

- **id 5 (178 → ~90).** The correct option currently carries four claims at once (Severity and Priority for *both* bugs). It must compress to the rule plus one worked side — e.g. keep "Severity ต่ำ/Priority สูง for the typo, the reverse for the tax bug" as a symmetry rather than spelling out both parentheses — and whatever is cut moves into the option's `explanation`, which is not length-budgeted for `forRole: 'both'` questions (`quizQuestions.test.ts:59` filters them out). Its three distractors (53, 62, 67) grow toward 80.
- **id 3 (131 → ~95).** The correct option lists four downstream systems; two are enough to make the point, and the full list belongs in the explanation.

Ids 1, 2, 4, 6, 8 are reachable by lengthening distractors alone. Id 7 already passes (ratio 0.87) and **must not be touched** — it is the one question that proves the round is not uniformly cued, and its distractors are already full-length reasoning.

The writer re-measures with `[...text].length` after pasting, exactly as the previous spec's P5.1 warned: editors normalise spaces and Thai characters, and the test is the authority. This spec deliberately does **not** paste 32 literal Thai strings the way `2026-09-23-role-ux-fixes.md` P5.1 did — there the rewrite touched distractors only, so the text could be fixed in advance; here two correct options carry must-have teaching content whose compression is an editorial judgement best made against the chapter, with the guard test as the objective check (D8).

### Files

`src/data/quizQuestions.ts` (ids 1–8, `options[i].text` only) · `src/data/quizQuestions.test.ts`.

### Tests

`src/data/quizQuestions.test.ts`, the `option length does not reveal the answer` block:

- `it.each(['basics', 'biz', 'eng', 'all'])('%s round: the correct option is not always the longest')` — add `'all'`.
- `it('basics round: the correct option is the longest in at most 3 questions')`.
- `it('every question: the correct option is at most 1.15× the longest distractor')` over all 20, failure message `q<id>: <ratio>` (keep the existing message format).
- Add `it('every option is 40–110 characters')` as a floor/ceiling on the rewrite, so padding a distractor with filler to satisfy the ratio fails too.
- The structure, coverage and 160-character explanation tests are unchanged. Note: id 7's correct-option explanation is 201 characters and legitimately exempt (`quizQuestions.test.ts:59` covers `forRole !== 'both'` only); do not "fix" it in this phase.

### Acceptance

1. `bun run test` passes. Reverting any single rewritten option to its old text fails the 1.15× test with that question's id named.
2. In the Quiz tab, play `พื้นฐาน · 8 ข้อ`: no option is visibly longer than its siblings in any of the 8 questions. Read all 8 explanations once — each still answers the option it is attached to.
3. Id 5's correct option still contains both the Severity rule and the Priority rule (compressed, not dropped); the detail that moved is present in its explanation.
4. `สาย Engineering` and `สาย Business` are unaffected: their ratios stay at 1.04 (the test prints nothing for ids 9–20).

---

## Phase 4 — The per-chapter override says that it belongs to this chapter and this role (I-13)

**Size: small.** 1 component, 1 copy helper, 1 test file. **Copy and affordance only — no behaviour and no storage change.**

### Problem

All four personas commented on the round-4 trip, and all four inferred the rule by experiment: Mint "surprisingly, Ch12's override reverted to `เปิดแบบมือใหม่` under the Engineering role (the override is stored per role+chapter, not globally)"; Tee "my per-chapter `⚡ คุ้นงานแล้ว` override on ch.12 was Engineering-role-specific". One earlier run reported it as a bug (a stale label), and the synthesis resolved that against the code: `resolveChapterLevel` runs inline on every render with the current inputs (`rolePerspective.ts:30-39`, `GuideTab.tsx:180`) and the active override map is recomputed from the current role on every render (`App.tsx:69`). There is no memoisation that could hold a previous role's value. **The behaviour is correct and stays exactly as `2026-09-23-role-ux-fixes.md` Phase 3 shipped it.**

What is missing is the UI saying so. The lens row prints only the resolved level (`เปิดแบบคุ้นงาน` / `เปิดแบบมือใหม่`, `GuideTab.tsx:686-688`), the reset link always reads `กลับไปใช้ค่าตามสายงาน` even when the fallback is the global level (`:717`, unchanged since round 2's I-13), and the only "this chapter only" hint in the product is an `aria-label` (`aria-label="ระดับของบทนี้"`, `:693`) — invisible to a sighted reader. This closes both follow-ups the previous spec left open (its §10 I-03b and I-13) and its D18, which deferred the label because nothing was being cleared.

### Change

**P4.1 A visible scope chip.** In the per-chapter switch group (`GuideTab.tsx:693-721`), when `levelSource === 'chapter'`, render a chip before the reset link, carrying `data-chapter-level-scope`:

`เฉพาะบทนี้ · เฉพาะสาย {ROLE_META[role].label}`

Styling follows the muted chip text already in that row (`text-xs text-neutral-500 dark:text-[#8e8e8e]`). It is a label, not a button. When `levelSource !== 'chapter'` nothing is rendered — there is no override to scope.

**P4.2 The reset link names the real fallback.** `กลับไปใช้ค่าตามสายงาน` is only true when `levelMode === 'auto'`. Add to `src/components/guide/rolePerspectiveUi.ts` (or the file that already holds that module's copy helpers; create it beside `rolePerspectiveUi.test.tsx` if it does not exist as a non-test module):

```ts
export function chapterLevelResetLabel(levelMode: LevelMode): string;
export function chapterLevelScopeLabel(role: Role): string;
```

| `levelMode` | reset label (literal) |
|---|---|
| `'auto'` | `กลับไปใช้ค่าตามสายงาน` (unchanged) |
| `'beginner'` / `'experienced'` | `กลับไปใช้ระดับจากแถบบน` |

`chapterLevelScopeLabel` returns P4.1's literal.

**P4.3 The `aria-label` stays.** `aria-label="ระดับของบทนี้"` is not replaced by the chip; a screen-reader user keeps the group label and now also hears the chip text.

### Files

`src/components/GuideTab.tsx` · `src/components/guide/rolePerspectiveUi.ts` (new or existing copy module) · `src/components/guide/rolePerspectiveUi.test.tsx`.

**No storage change.** `be_guide_chapter_levels_by_role` keeps its key, shape and write points; `App.tsx`, `lib/rolePrefs.ts` and `data/rolePerspective.ts` are not touched by this phase.

### Tests

`src/components/guide/rolePerspectiveUi.test.tsx`:

- `chapterLevelResetLabel('auto')` → `กลับไปใช้ค่าตามสายงาน`; `('beginner')` and `('experienced')` → `กลับไปใช้ระดับจากแถบบน`.
- `chapterLevelScopeLabel('eng')` → contains `เฉพาะบทนี้` and the Engineering role label; `('biz')` names the Business one; the two differ.
- In the existing lens-row render block: with an override in force the markup contains `data-chapter-level-scope` and `เฉพาะบทนี้`; with no override it contains neither.

### Acceptance

1. Role Engineering, open ch.12, press `⚡ คุ้นงานแล้ว`: a chip reads `เฉพาะบทนี้ · เฉพาะสาย Engineering` next to the switch, and the reset link is visible.
2. Switch the header role to Business: ch.12 opens as beginner, no chip (there is no Business override for ch.12). Switch back: the chip and the override return. Behaviour is bit-for-bit what Phase 3 of the previous spec shipped.
3. Set the header level mode to `🌱 มือใหม่` (not auto) with a chapter override in force: the reset link reads `กลับไปใช้ระดับจากแถบบน`, and pressing it falls back to the header level, not to the role default.
4. With no override, neither the chip nor the reset link renders.
5. `localStorage` is unchanged by this phase: with the same clicks, `be_guide_chapter_levels_by_role` holds exactly what it held before it shipped.

---

## Phase 5 — The Quiz tab opens the round the reader chose (I-09)

**Size: small.** 1 data module, 1 component, 1 storage key, 2 test files.

### Problem

Mint: "it defaulted to my Business track quiz; had to switch tabs to `พื้นฐาน · 8 ข้อ`". Bank logged the same as an explicit wrong turn. `QuizTab.tsx:62` is `useState(() => defaultQuizRound(role))` and `defaultQuizRound(role) = role ?? 'basics'` (`quizRounds.ts:22`), so with a role set the tab always opens the role round and a reader who wants the general round pays one wrong turn **every time they open the tab** — the choice is never remembered. The role default itself is defensible (D12 of this spec keeps it for a first visit); what is not defensible is discarding an explicit choice.

### Change

**P5.1 Remember the chosen round.** New storage key `be_guide_quiz_round` (values: `basics` | `eng` | `biz` | `all`). Written by `chooseRound` (`QuizTab.tsx:74-78`) on every explicit chip press. Never written by the role-change path — a role change is not a round choice.

**P5.2 Pure resolution in `src/data/quizRounds.ts`:**

```ts
export function parseQuizRound(raw: string | null): QuizRound | null;
/** An explicit past choice wins; otherwise the reader's own round; otherwise basics. */
export function initialQuizRound(stored: string | null, role: Role | null): QuizRound;
```

`initialQuizRound` = `parseQuizRound(stored) ?? defaultQuizRound(role)`. `defaultQuizRound` stays exported and unchanged (it is the role-change path at `QuizTab.tsx:70`).

**P5.3 `QuizTab` uses it.** `useState(() => initialQuizRound(readStorage('be_guide_quiz_round'), role))` at `:62`. The role-change branch at `:66-71` is unchanged: a role change still moves an un-started reader to their new default round, and still never abandons a started run. It also clears the stored round, so the new role's default is what the tab offers next time.

**P5.4 The chip strip says what `พื้นฐาน` is.** `QUIZ_ROUND_META.basics.label` becomes `พื้นฐาน (ทุกสาย)`. The ` (สายคุณ)` suffix on the reader's own round is unchanged. This is the discoverability half of the fix: the round both beginners wanted reads as the general set instead of as a level.

### Files

`src/data/quizRounds.ts` · `src/components/QuizTab.tsx` · `src/data/quizRounds.test.ts` · `src/components/QuizTab.test.tsx`.

### Tests

- `src/data/quizRounds.test.ts`:
  - `parseQuizRound`: each of the four valid values round-trips; `null`, `''`, `'pm'` and `'BASICS'` → `null`.
  - `initialQuizRound('basics', 'biz')` → `'basics'`; `(null, 'biz')` → `'biz'`; `(null, null)` → `'basics'`; `('garbage', 'eng')` → `'eng'`.
  - `getQuizRound` sizes are unchanged (8 / 6 / 6 / 20).
- `src/components/QuizTab.test.tsx`:
  - `:17-19` expectations update to `พื้นฐาน (ทุกสาย) · 8 ข้อ`.
  - New: with `be_guide_quiz_round = 'basics'` in storage and `role: 'eng'`, the markup has `aria-pressed="true"` on the `พื้นฐาน (ทุกสาย)` chip and renders the first basics question's scenario. (The test sets the key through the same `readStorage` guard the app uses; `lib/storage.ts` is safe in the node env.)
  - The existing `no role opens on basics` test keeps passing with no stored key.

### Acceptance

1. Role Business, open the Quiz tab: the `สาย Business (สายคุณ)` round opens (unchanged first-visit behaviour).
2. Press `พื้นฐาน (ทุกสาย) · 8 ข้อ`, leave to the Guide tab, come back: the basics round is still selected. Reload: still selected.
3. Change the header role to Engineering without starting a run: the tab moves to `สาย Engineering (สายคุณ)`, and after a reload it is still that round (the stored choice was cleared by the role change).
4. Start answering a run, then change role: the run is not abandoned (unchanged, `QuizTab.tsx:66-71`).
5. The chip strip reads `พื้นฐาน (ทุกสาย) · 8 ข้อ`, `สาย Engineering · 6 ข้อ`, `สาย Business (สายคุณ) · 6 ข้อ`, `ทั้งหมด · 20 ข้อ` at 375px without wrapping into more than two rows.

---

## 6. Verification (every phase)

1. `bun run lint` (tsc covers the test files), `bun run test` and `bun run build` pass.
2. Browser check with `bun run dev` at 1440px and 375px on a clean profile with the console open: run that phase's acceptance steps. No console errors, no horizontal scroll at 375px (Phase 1's resume line, Phase 2's review cards, Phase 4's chip, Phase 5's chip strip).
3. Phase 1 also, on an **existing** profile: `be_guide_last_chapter` already present and no hash → that chapter opens. And with a stale `#/ch/1` → acceptance 4.
4. Phase 2 also: play the round twice in one session (restart) and confirm the review block reflects the second run only; confirm XP is unchanged for identical answers.
5. Keyboard: Phase 2's `อ่านบทที่ N` buttons and Phase 5's round chips are reachable with Tab and fire on Enter/Space. Phase 4's chip is not focusable (it is a label).
6. **Commit order and independence.** One commit per phase, in this order: Phase 1 → 2 → 3 → 4 → 5. Each is independently shippable and separately committable, and none depends on another: Phase 1 touches routing only; Phase 2 touches the quiz result path and `chapterId`; Phase 3 touches option text only (it does not conflict with Phase 2, which touches a different field of the same 8 objects — if both are in flight, land Phase 2 first and rebase); Phase 4 touches the lens row only; Phase 5 touches the round default only.

## 7. Storage keys (changes only)

| key | phase | format | notes |
|---|---|---|---|
| `be_guide_last_chapter` | 1 | unchanged (`string`, a chapter id) | **No migration.** Same name, shape and write points; Phase 1 only starts *applying* it on load. An unknown id falls back to `s1`. |
| `be_guide_quiz_round` | 5 | `'basics' \| 'eng' \| 'biz' \| 'all'` | **new.** Written on an explicit chip press, cleared on a role change. Invalid values are ignored, not repaired. |

Phase 2's answer history and Phase 4's chip are component state / derived copy — not persisted.

## 7a. Data changes (not storage)

| change | phase | why it is a data change |
|---|---|---|
| `chapterId` added to `QUIZ_QUESTIONS` ids 1–8 | 2 | The field is optional on `QuizQuestion` and simply absent on the 8 basics questions. Without it a missed basics question has no route back to its chapter, which is half of what I-08 asks for. No type change, no migration — the data ships in the bundle. |
| `options[i].text` rewritten for ids 1–8 | 3 | Content authoring in the source data file. No schema change. |

## 8. Decisions (made while specifying)

| # | Decision | Rationale |
|---|---|---|
| D1 | **`อ่านต่อ` means "continue where you left off", and nothing else in the app uses the phrase.** The app does it automatically on load, so no control needs the label at all. | The synthesis' strongest new finding is a verb collision, not a storage bug: the banner's `อ่านต่อ` went to the chapter you left, the track card's `อ่านต่อ` to the next unread one, and Mint followed the wrong one from ch.12 to ch.14. Reserving the verb for the semantics readers already assume, and then satisfying it without a control, removes the collision instead of relabelling it. |
| D2 | **The stored chapter is applied on load**, with precedence hash > stored > default. The reader is told with a one-line `อ่านต่อจากครั้งก่อน · บทที่ N` marker. | Three of four personas expected it (Mint stated it as the expectation outright), the value was already in storage and already read into memory, and the recovery path that existed was a banner below the fold that self-destructed on the first click anywhere (`chapterRoute.ts:53-58`). The marker exists so auto-restore does not read as "the app lost my place"; it carries no action because there is nothing to act on. |
| D3 | The track card's primary button becomes `ไปบทถัดไปที่ยังไม่อ่าน` (and `เริ่มอ่านบทแรกของเส้นทาง` when nothing is read). **Its behaviour is unchanged** — it still advances the track. | The task requires the two controls to be distinguishable in wording, not only behaviour. `firstUnreadId` is the right target for a track: a reader marking chapters read is walking a route, and re-offering a finished chapter would be worse. The defect was only ever the label. The `read === 0` state gets its own literal because "next unread" reads oddly when nothing is read. |
| D4 | **An explicit first-visit choice wins over a hash in the URL** (`jumpToTrackStart` drops its `loadedFromHash` guard). This narrows `2026-09-22-role-perspective.md` D5 ("a shared link wins over onboarding") to the load path. | A stale `#/ch/1` silently cancelled this round's headline fix for two of four personas, who then rated expectation only "partly" matched (I-12). The rule protecting shared links still holds where it matters — D2's precedence lets a hash decide the chapter shown on load — but a role card pressed *after* the page is open is a later, more specific instruction than the fragment the page happened to carry. |
| D5 | `ResumeBanner`, `resumeCandidate`, `resumeDismissed` and `dismissResume` are **deleted**, not kept as a fallback. | After D2 the banner's condition (`resumeChapter.id !== activeChapterId`) is false on exactly the loads it existed for, so keeping it would ship dead code plus the session state whose `navigate`/`pop` dismissal caused the round-3 R-7 divergence in the first place. Deleting it removes the only self-destructing affordance in the app. |
| D6 | Phase 2 **extracts** the finished screen into `QuizResultScreen.tsx` and its judgement into `lib/quizResult.ts` rather than growing `QuizTab.tsx` in place. | The repo has no DOM test environment and no `@testing-library` (`QuizTab.test.tsx:8-11` renders static markup with explicit props). A 200-line result screen reading `QuizRun` state is untestable here; a props-only component and three pure functions are testable in the node env, the way `IndexEmptyState` already is. |
| D7 | The results header branches on score into three bands (≥80 / ≥50 / below), and the celebratory bounce is reserved for the top band. The `ทำครบแล้ว! บันทึกผลแล้ว` pill stays at every score. | `ยินดีด้วย!` at 1/8 is the credibility cost the synthesis names, and it is shown today with no score branch at all (`QuizTab.tsx:186-191`). Three bands is the smallest split that lets the two lower headings point at the new review block. The pill is a fact about what was saved, not praise, so it is score-independent. |
| D8 | Phase 3 specifies a **measured budget and a named editorial method**, not 32 literal Thai strings — unlike `2026-09-23-role-ux-fixes.md` P5.1, which pasted its table. | There the rewrite touched distractors only, so the exact text could be fixed in advance. Here two correct options (ids 5 and 3) carry the teaching content the question exists to test — id 5 packs Severity **and** Priority for two bugs into 178 characters — and compressing them without dropping a must-have is a judgement made against the chapter, not against a character count. The guard test is the objective authority either way, and it is the artefact a reviewer can run. |
| D9 | Phase 3's budget is `≤ 3` longest for the 8-question basics round and `≤ 1.15×` the longest distractor across **all 20** questions, and the ratio test's id filter is deleted. | The previous spec's D16 reasoning carries over: forcing "never longest" would itself become a cue. `≤ 3` of 8 is the chance expectation with 4 options (2) plus one, the same slack `≤ 2` of 6 gave the role rounds. One budget for all 20 means a future question cannot land in an unguarded range — ids 9–20 already sit at 1.04, so 1.15 costs them nothing. |
| D10 | Id 7 of the basics round is **not** rewritten. | Its correct option is already shorter than every distractor (ratio 0.87) and its distractors are already full-length reasoning. Touching it would risk the one question that proves the round is not uniformly cued, for no measured gain. |
| D11 | Phase 4 is **copy and affordance only**. The per-role storage model, `resolveChapterLevel` and `App.tsx` are untouched. This supersedes `2026-09-23-role-ux-fixes.md` **D18** ("no visible `เฉพาะบทนี้` label in Phase 3"). | The synthesis resolved the contested "stale label" report against the code and against the reporter: there is no desync, because resolution is inline per render (`rolePerspective.ts:30-39`, `App.tsx:69`). What four of four personas hit was a UI that never states its own scope. D18 deferred the label on the grounds that nothing is cleared, which is still true — and is exactly why the label, not a toast, is the fix. It also closes the previous spec's I-03b and I-13 follow-ups. |
| D12 | Phase 5 keeps the role round as the **first-visit** default and adds a remembered choice (`be_guide_quiz_round`), rather than switching the default to `basics`. | A reader with a role usually wants their own round, and both affected personas' complaint was about repetition, not about the first screen — Mint "had to switch tabs", Bank logged it as a recurring wrong turn. Remembering the choice costs one key and answers the issue title literally: the tab opens the round the reader chose. |
| D13 | A role change clears the stored round. | The stored value records "I chose this round", and a role change invalidates what "my round" means. Leaving it would strand a reader who switched roles on the previous role's round with no explanation. |
| D14 | `QUIZ_ROUND_META.basics.label` becomes `พื้นฐาน (ทุกสาย)`. | `พื้นฐาน` alone reads as a difficulty level next to two role labels, which is why it had to be "discovered" (I-09). Naming its scope is a two-word fix and needs no new UI. |
| D15 | Round-2 **I-17** (resume returns to the chapter top, not the last section) stays out of scope. | It sits on top of I-06 rather than inside it, and the fix is a different mechanism — restoring `#/ch/N/<section>`. Phase 1's precedence function is the seam it would extend; see Follow-ups. |

## 9. Risks

- **Auto-restore surprises a reader who wanted a fresh start.** After Phase 1 there is no "start at chapter 1" control other than the index and the track card. The index and track panel are always visible, so the cost is one click, and D2's marker names what happened. Watch it in the next test round; if it bites, the answer is a `เริ่มใหม่จากบทที่ 1` link in the marker line, not a return to the banner.
- **Phase 1 deletes state that a future feature might want.** `resumeDismissed` is the only per-page-session flag in `RouteSession`. If something later needs one, `reduceRouteSession` is still there with `hashInUrl`.
- **Phase 2 and Phase 3 touch the same 8 objects in `quizQuestions.ts`** (different fields). Land Phase 2 first and rebase Phase 3, or expect a mechanical conflict.
- **Thai length drift in Phase 3.** The budget is code-point counts of literal strings; editors normalise spaces and Thai characters. Re-measure with `[...text].length`, as the tests do.
- **Id 5's rewrite can lose a must-have.** It is the only option in the basics round carrying two rules at once. The acceptance criterion names both rules explicitly so a reviewer checks for them rather than for a character count.
- **Phase 5's test writes to `localStorage` in the node env.** `lib/storage.ts:1-24` is guarded, so a missing `localStorage` yields `null` rather than throwing; if the runner has no storage the new test must stub it rather than be skipped.

## 10. Follow-ups (out of scope, with their evidence and why they are deferred)

- **I-10 — the glossary sends `User story` to chapter 4, which contains no user story.** M, 1 of 4 recurring, Confirmed. `src/data/glossary.ts:114-120` (`relatedChapterIds: ['s4']`); ch.4 (`src/data/chapters/chapters1_5.ts:433-575`) has no user-story content; the template is in ch.2's jargon list (`chapters1_5.ts:187-189`) and the worked Role-Action-Value example in ch.14 (`chapters11_15.ts:504, :519, :537`). Cost Nok ~5 minutes and a full wrong turn in R-8. **Deferred because it is already specified**: `docs/specs/2026-09-23-term-definitions.md` Phase 2, P2.5 and acceptance 6, which generalises it into a test over every entry's `relatedChapterIds` (its D19). Fixing it here would duplicate that work in the same file.
- **I-11 — `SLO` has no glossary entry.** M, 1 of 4 plus the term audit, Confirmed. Zero occurrences in `src/data/glossary.ts` (`SLA` exists at `:141`) while SLO is taught in ch.10 (`chapters6_10.ts:566, 568, 573`) and ch.19 (`chapters16_19.ts:537`); Bank's search returned `แสดง 0 จาก 113 คำ · ไม่พบคำที่ค้นหา`. **Deferred to the same place**: `2026-09-23-term-definitions.md` Phase 2, P2.1 (first table row) and acceptance 7. It is one row of a 24-entry data change that belongs in one commit with the coverage test.
- **I-14 — badges live behind an English-only `Dashboard` tab.** L, 1 of 4, Confirmed. `src/components/Header.tsx:308`; one wrong turn in Nok's S-6, on mobile, where the tab strip is tightest. Deferred: a single-persona, single-run L finding, and the synthesis' own variance caveat (§5.4) says to read those as hypotheses. The fix is also not just a string — a Thai label lengthens the tab strip at 375px, which needs its own layout check. Fold it into the next header/nav change. **Done 2026-09-23 (owner: fit, keep the label):** the root cause at 375px was that `Dashboard` sat ~75% off-screen (strip content 444px in a 343px nav). Below `sm` the tabs drop their icons and use `px-2`, so all four fit (content 343px, last tab ends at x 348); at 320px the strip still scrolls, with ~70% of `Dashboard` visible.
- **I-15 — the first-visit card offers role *or* level.** L-M, 1 of 4 (was 3 of 4 in round 2), Confirmed, unchanged. `src/components/guide/FirstVisitCard.tsx:12-13` (two level buttons) under the label `ไม่ระบุสาย:` at `:42`; Mint: "is that a third choice, or do I need both a role AND a level?". Deferred: it is already `2026-09-23-role-ux-fixes.md` §10 I-06 (let the card set level *alongside* role), it dropped from 3/4 to 1/4 hits after the track fixes, and the redesign it needs is a change to the onboarding contract — bigger than any phase here.
- **I-16 — ch.1 is still the second stop on both tracks and still reads as off-topic.** L, 3 of 4, Confirmed. `src/data/readingTracks.ts:9-10`; Bank fit 3 (`โจทย์เพี้ยนระหว่างทาง … ALL`, "not the business-vocab I came for"), Nok fit 3, Mint rated it 5. Deferred: this is content-market fit, not a defect — the previous spec moved ch.1 off step 1 deliberately (its D5, D7) and three of four still said "partly" on expectation. The next move is either a rewrite of ch.1's opening for the two engineer-of-business readers or dropping it from the biz track, and both need a decision about what ch.1 is for. Do not reorder tracks again on this evidence alone. **Done 2026-09-23 (owner: rewrite the opening, keep the tracks):** ch.1's `chapterOpening` now starts from the reader's stake on either side — `ของที่ Business ขอกับที่ Engineering ส่งมักไม่ตรงกัน` — before naming the hand-offs (158 code points). Track order unchanged; re-test with the next persona round.
- **I-17 — a mobile top-nav tap that did not register.** L, 1 of 4, **Unconfirmed**. Mint at 375×812: "my clicks on it didn't visibly navigate at first". Commit `2cc730d` enlarged a mobile tap target between rounds, and no code defect was found. **What would confirm it:** the same viewport driven by a second browser tool, with (a) the element's rendered box from `getBoundingClientRect` for the tab the tap missed, checked against the 44×44 CSS-px minimum, (b) a click dispatched at the box's centre rather than at recorded coordinates, and (c) a console listener logging `pointerdown`/`click` on the nav container, so a swallowed event is distinguishable from a mis-aimed one. Until one of those three shows a real miss, the synthesis' caveat §5.2 (tool-level click-coordinate artefacts, the same class as Mint's "the toggle needed two clicks", which is not reproducible from the code) is the better explanation. Also unresolved from round 2 in the same class. **Checked 2026-09-23, not reproduced:** at 375px every tab has a 44px-tall ring, a centre click activates all four, and capture listeners on the nav logged pointerdown + click for each. The only finding was `Dashboard` sitting mostly off-screen, fixed with I-14.
- **Round-2 I-17 — resume returns to the chapter top, not the last section read.** Stands unchanged on top of I-06 (synthesis §3, I-06 closing line). Phase 1's `resolveInitialChapter` is the seam: store `#/ch/N/<section>` instead of a bare chapter id and return the section as well. Deferred because it needs a second storage decision (which section counts as "where I was" — the last opened, or the last scrolled past) and it is listed in `2026-09-23-role-ux-fixes.md` §10 as I-17 already.
