# Section consolidation + UX run-1 fixes

Date: 2026-09-28 · Status: draft for owner review

Two independent parts; each can ship on its own.

- **Part A** cuts per-chapter sections from 11–13 to 6–9 by merging sections too short to stand alone and removing per-chapter filler. Owner chose option A (merge/remove), 2026-09-28.
- **Part B** fixes findings F-01…F-07 from `.ux-assessment-run1/runs/2026-09-25/report.md`, each re-verified against HEAD `4524b12`.

Part B's F-06 (chip-row scroll affordance) must work with Part A's smaller chip set. Everything else is disjoint.

Completion gate for each part: `npm run lint`, `npm test` and `npm run build` pass with no new warnings; UI changes are verified in the browser at 360×640 and 1440px.

## Part A — Section consolidation

### A.0 Verified facts (tree at `4524b12`)

- 19 chapters; before this change each shows **11–13** sections (`getChapterLayout`, identical count for both levels).
- Every chapter has a primer, a dialogue, 4 workflow steps, 5 checklist items and 2 examples; merges never leave an empty half today (code still handles one).
- `FRICTION_PLAYBOOKS` (`src/data/frictionPlaybooks.ts:3`) has **8** entries: s1, s2, s4, s6, s7, s8, s11, s12. The generic fallback (`src/components/FrictionPlaybookCard.tsx:32-89`) therefore renders in **11** chapters, not 10. `sectionHasTool(…,'friction')` (dilemma present) stays s1, s2, s6.
- Every s11 FAQ playbook link (`src/data/frictionFaqs.ts`, `relatedPlaybookChapterId`) targets s1, s2, s6, s8 or s11, all of which have playbooks.
- Exactly one inline block is anchored on a removed key: `src/data/chapterContentBlocks.ts:654` (s16 `#A1024` refund P&L table, `after: 'primer'`). The other two anchors (`:14`, `:134`) are `coreConcepts`.
- `src/data/readingTracks.ts`, `src/lib/chapterContext.ts` and `server/knowledge-base.ts` do not reference section keys (`chapterContext.ts:36` reads the `checklist` *field*, which is unchanged). No change.
- No "no-chapter" state exists: `GuideTab` always shows a chapter (`:205`). The landing surface is the page-top area `GuideTab.tsx:370-413` (`FirstVisitCard` or welcome banner). `IndexEmptyState` is the index's search-no-results message.

### A.1 Scope and non-goals

In scope: section keys, layer config, the four merges/removals, the chapter intro, the landing host for the role-mindset card, legacy-key routing, tests.

Non-goals: chapter text edits; F-06 chip-row clipping (Part B; fewer chips, 6–9 instead of 11–13, already shortens the row); redesigning `RoleMindsetCard`/`FrictionPlaybookCard`; `CHAPTER_CORE_OVERRIDES`.

### A.2 Decisions

| # | Decision | Notes |
|---|---|---|
| A1 | `primer` is no longer a `SectionKey`. `ChapterIntro` renders `beginnerPrimer` always visible, both levels, directly below `ChapterHero` and above the lens banner. | Owner decision 1. Placed before the lens controls so the prose reads straight on from the hero. |
| A2 | New key `practice`, chip `ลงมือทำ`: workflow steps, then checklist. Replaces `workflow` + `checklist`. | Owner decision 2. Checklist item keys stay `${chapter.id}_cl_${idx}`. |
| A3 | `dialogue` merges into `examples` (chip `ตัวอย่างจริง`): dialogue first, then cases. | Owner decision 3. |
| A4 | `friction` is present iff `chapter.frictionPlaybook` exists. The fallback branch is deleted. | Owner decision 4. |
| A5 | `mindset` is removed from chapters. `RoleMindsetCard` renders once, collapsed, in the GuideTab landing area, directly below the `FirstVisitCard`/welcome-banner ternary (rendered in both branches). The universal friction principles are kept and moved inside that card as a closing block. | Owner decision 5. Host choice: `IndexEmptyState` is a search-failure message (wrong meaning, rarely seen); `FirstVisitCard` disappears once a role is picked, so returning readers would lose the card. The landing area is on every page load and is always mounted, which makes the `mindset` alias (A7) feasible. |
| A6 | The s16 inline table is re-anchored `after: 'coreConcepts'` (no `conceptIndex`). | Keeps it in an open-by-default Core section for both levels. It is not anchored to the intro because a seven-row table at the top of the chapter would push the outline below the fold on mobile. |
| A7 | Legacy hash keys: `dialogue→examples`, `workflow→practice`, `checklist→practice`, `primer→chapter top`, `mindset→landing card` (opened and scrolled to). An absent section, including `friction` in a chapter without a playbook, also falls back to chapter top. The hash is canonicalised to the new form in every case. | Owner decision 7. The `mindset` alias targets the landing card, not chapter top, because A5 keeps that card always mounted. |
| A8 | Experienced lens hint (`GuideTab.tsx:708`) mentions Friction only when the chapter has it. | Otherwise the hint promises a section that does not exist in 11 chapters. |

### A.3 Layer configuration

`SectionKey` (11 keys): `otherSide | friction | jargon | diagram | faq | examples | coreConcepts | reference | glossary | practice | pitfalls`.

```ts
export const LAYER_CONFIG = {
  beginner: {
    core:  ['jargon', 'otherSide', 'coreConcepts', 'diagram'],
    apply: ['examples', 'practice', 'pitfalls', 'faq', 'friction'],
    deep:  ['reference', 'glossary'],
  },
  experienced: {
    core:  ['otherSide', 'coreConcepts', 'pitfalls', 'diagram'],
    apply: ['friction', 'examples', 'practice', 'faq'],
    deep:  ['jargon', 'reference', 'glossary'],
  },
};
```

In experienced Apply, `examples` takes the slot `dialogue` held (second), because the merged section leads with the dialogue.

`SECTION_META` changes (all other rows unchanged):

| Key | Chip | Minutes |
|---|---|---|
| `examples` | `ตัวอย่างจริง` | 5 (examples 3 + dialogue 2) |
| `practice` | `ลงมือทำ` | 3 (workflow 2 + checklist 1) |
| removed: `primer`, `dialogue`, `workflow`, `checklist`, `mindset` | — | — |

Resulting section count per chapter (both levels): **6–9**, median 8, compared with 11–13 before.

| Count | Chapters |
|---|---|
| 6 | s16, s17, s18, s19 |
| 7 | s3, s9, s10, s14 |
| 8 | s1, s4, s5, s7, s13, s15 |
| 9 | s2, s6, s8, s11, s12 |

**Term-definitions rule** (`sectionLayers.ts:164-169`, D4): the jargon block must be open when a chapter title uses a term. The rule still holds. `jargon` is now the **first** beginner Core key (after overrides), `CHAPTER_CORE_COLLAPSED` stays `{}`, and `deriveOpenState` opens every Core section. Only the comment text changes ("moved to second" → "leads beginner Core"). Experienced keeps jargon in Deep, which is the same scope as before.

### A.4 Per-file changes

**`src/data/sectionLayers.ts`**
- `:7-14` `SectionKey` / `SECTION_KEYS` → the 11 keys of A.3, in this order: `otherSide, friction, jargon, diagram, faq, examples, coreConcepts, reference, glossary, practice, pitfalls`.
- `:16-27` `LAYER_CONFIG` → A.3. `:36-52` `SECTION_META` → A.3.
- `:115-131` `isSectionPresent`: `friction: !!chapter.frictionPlaybook`; `examples: (realWorldExamples?.length ?? 0) > 0 || !!dialogueExample`; `practice: (realWorldWorkflow?.length ?? 0) > 0 || (checklist?.length ?? 0) > 0`; delete the `mindset`, `primer`, `dialogue`, `workflow` and `checklist` cases. Replace the doc comment "Mirrors the pre-refactor render guards…" with "A section renders iff this returns true."
- `:164-168` comment update per A.3.

**`src/types.ts:103`**: no type change (`after: SectionKey` narrows automatically). **`src/data/chapterContentBlocks.ts:651-654`**: `after: 'coreConcepts'`, and update the comment to "right after the s16 core concepts".

**`src/lib/chapterRoute.ts`**
- Add `export type RouteFocus = 'top' | 'mindset'` and `export type RequestTarget = SectionKey | RouteFocus`. Change `ChapterRoute` to `{ chapterId; section?: SectionKey; focus?: RouteFocus }` and `RequestedSection.key` to `RequestTarget`.
- Add `const SECTION_ALIASES: Readonly<Record<string, SectionKey | RouteFocus>> = { dialogue: 'examples', workflow: 'practice', checklist: 'practice', primer: 'top', mindset: 'mindset' }` and `export function resolveSectionParam(raw: string): { section?: SectionKey; focus?: RouteFocus }`. It checks `isSectionKey` first, then the alias table, and returns `{}` when neither matches.
- `:24-25` `parseChapterHash` uses `resolveSectionParam`. `formatChapterHash` stays section-only, so a focus route canonicalises to `#/ch/N`.

**`src/hooks/useChapterRoute.ts`**
- `:43-45` initial request: `key = init.route?.section ?? init.route?.focus`.
- `:71` canonicalisation is unchanged. It already writes `formatChapterHash(num, route.section)`, so `#/ch/3/dialogue` becomes `#/ch/3/examples` and `#/ch/3/primer` becomes `#/ch/3`.
- `:80-96` popstate: after parsing, `replaceState` the canonical hash when it differs from `hash`. The chapter-start scroll condition at `:91` becomes `!route.section && !route.focus && …`, and `:95` requests `route.section ?? route.focus`.
- `navigate` / `replaceSection` keep `SectionKey` parameters (in-app callers never pass a focus).

**`src/components/GuideTab.tsx`**
- `:246-257` request effect: if `key === 'mindset'`, run `setMindsetOpen(true)`, `setPendingScrollId('role-mindset-card')` and `onReplaceSection(null)`. If `key === 'top'` or `!isSectionPresent(activeChapter, key)`, run `onReplaceSection(null)` and `scrollToChapterStart('smooth')`. Otherwise keep the current behaviour.
- New state `const [mindsetOpen, setMindsetOpen] = useState(false)` (not persisted). After the `showFirstVisit ? … : …` block that ends at `:413`, render `<RoleMindsetCard isOpen={mindsetOpen} onToggle={() => setMindsetOpen(o => !o)} />`.
- `:621-630`: after `<ChapterHero … />`, render `<ChapterIntro chapter={activeChapter} onNavigateChapter={handleSelectChapter} onSearchGlossary={handleSearchGlossary} />`.
- `:708` experienced hint: `` `⚡ โหมดทำงานข้ามทีม: เปิด ${coreHint} ไว้ก่อน` `` followed by `` ` วิธีรับมือ Friction อยู่ในชั้น "นำไปใช้"` `` when the Apply group contains `friction`, else `` ` ส่วนอื่นพับไว้ในชั้น "นำไปใช้" และ "เจาะลึก"` ``.
- `:321-332` `handleScrollToPlaybook`: no change. Links only target playbook chapters, a guard test enforces that, and a cross-chapter jump to an absent `friction` falls back to chapter top through the request effect.

**New `src/components/guide/ChapterIntro.tsx`**: returns `null` when `primerTerms(chapter)` is null. Otherwise it renders `<p id="chapter-intro" data-chapter-intro className="text-sm text-base-content-secondary leading-relaxed">`, which holds the three marked strings (`whatIsIt`, `whyItMatters`, `realWorldScenario`) as `RichText` fragments joined by a space. The block has no heading and no toggle. `RichText` returns a fragment (`RichText.tsx:63`), so one `<p>` is valid.

**`src/components/guide/sections/`**
- `PrimerSection.tsx`: delete. Its marker logic (`primerTerms`) moves unchanged to `ChapterIntro`.
- `WorkflowSection.tsx` → export `WorkflowSteps: FC<{ chapter }>` (body list only, markup from `:31-48`). `ChecklistSection.tsx` → export `ChecklistItems: FC<{ chapter; ctx }>` (body only, same `itemKey`).
- New `PracticeSection.tsx`: the accordion uses the existing header pattern. Icon `🛠️`, title `ลงมือทำ: ขั้นตอนงานและเช็กลิสต์`, subtitle `ส่งต่องานทีละขั้น แล้วเช็กให้ครบก่อนส่ง ({n} ขั้น · {m} ข้อ)`; drop either count part when its list is empty. The body has sub-heading `ขั้นตอนงาน` then `<WorkflowSteps>`, and sub-heading `เช็กลิสต์ก่อนส่งต่องาน` then `<ChecklistItems>`. It omits the sub-block for an empty list.
- `DialogueSection.tsx` → export `DialogueCompare: FC<{ chapter }>` (body only).
- `ExamplesSection.tsx`: title `ตัวอย่างจริง: บทสนทนาและเคสจากบริษัท`, subtitle `พูดแบบไหนพัง แบบไหนได้ผล และบทเรียนจากบริษัทจริง ({n} เคส)`. The body has sub-heading `บทสนทนาในที่ทำงาน` then `<DialogueCompare>`, and sub-heading `เคสจริงจากบริษัท` then the existing case list. It returns `null` only when both are absent.
- `registry.tsx:6,10,12,20,22,45-47,60-74`: drop `MindsetSection` and the `RoleMindsetCard` import. Replace `primer`, `dialogue`, `workflow` and `checklist` with `practice: PracticeSection`. `FrictionSection` passes `playbook={chapter.frictionPlaybook!}` and removes the unused `ctx`/`chapterTitle`.

**`src/components/FrictionPlaybookCard.tsx`**: delete the fallback branch (`:31-89`). `playbook` becomes required and the `chapterTitle` prop is removed.

**New `src/components/FrictionPrinciples.tsx`**: holds the three principle items from `FrictionPlaybookCard.tsx:73-86`, with the text kept verbatim, under the heading `3 ข้อที่ควรจำเมื่อทีมเห็นไม่ตรงกัน` (the `{chapterTitle}` interpolation is dropped). **`RoleMindsetCard.tsx`** renders `<FrictionPrinciples />` as the last block of its expanded body, below the role tabs.

**`SectionOutline.tsx`, `LayerGroup.tsx`, `InlineSections`**: no code change. They iterate `layout` and `SECTION_META`.

### A.5 Routing behaviour

| Incoming hash | Resolves to | URL after load | Effect |
|---|---|---|---|
| `#/ch/3/dialogue` | section `examples` | `#/ch/3/examples` | open Apply → examples, scroll to `#sec-examples` |
| `#/ch/3/workflow`, `#/ch/3/checklist` | section `practice` | `#/ch/3/practice` | open and scroll to `#sec-practice` |
| `#/ch/3/primer` | focus `top` | `#/ch/3` | `scrollToChapterStart` (intro sits under the hero) |
| `#/ch/3/mindset` | focus `mindset` | `#/ch/3` | chapter 3 shown; landing card opened, scroll to `#role-mindset-card` |
| `#/ch/3/friction` (s3 has no playbook) | section `friction`, absent | `#/ch/3` | chapter-top fallback |
| `#/ch/1/friction` | section `friction` | unchanged | as today |
| `#/ch/3/bogus` | none | `#/ch/3` | as today |

Same resolution on popstate and manual hash edits.

### A.6 Test plan

Changed:
- `src/data/sectionLayers.test.ts`: `:33-36` new config literals; `:39-45` drop the `primer < jargon` line and assert `jargon` is `LAYER_CONFIG.beginner.core[0]`; `:85,96,108` core lists without `primer`; `:114` s1 beginner Core minutes = **5**; `:119` use `jargon`; `:135-137` → "otherSide in every chapter"; `:66-67,74` layer lookups for `friction` (s1 → apply) and remove the `mindset`/`primer` lookups; `:149` use `practice`; `:162-169` drop `sections.primer`; `:185-188` use `reference` on s1 in place of `mindset`; `:197` toggle `jargon`.
- `src/lib/chapterRoute.test.ts:14`: `'checklist'` → `'practice'`.
- `src/data/businessChapters.test.ts:58-68`: the s16 table is inline `after === 'coreConcepts'` with no `conceptIndex`.
- `src/components/guide/sections/termMarkerPurity.test.tsx:48,106`: render `ChapterIntro` instead of `PrimerSection`; the bucket name stays `primer`.
- `src/components/guide/sections/autoTermSnapshot.test.tsx:29-40`: render hero, then `ChapterIntro`, then the Core sections (the new DOM order). Rename the `primer:` labels to `intro:`; the marker lists are otherwise unchanged.

Unchanged and must pass as they are: `inlinePlacement.test.ts` (it now also validates the s16 anchor), `termCoverage.test.ts` (it models beginner-visible fields, and the intro stays visible), `copyBudgets.test.ts` (the primer budgets still apply), `visualFirst.test.ts`, `readingTracks.test.ts`, `autoTerms.test.ts`, `RichText.test.tsx`.

New:
1. `sectionLayers.test`: `SECTION_KEYS` excludes `mindset`, `primer`, `dialogue`, `workflow` and `checklist`; no chapter's layout at either level contains them.
2. `sectionLayers.test`: `idsWith('friction')` equals `Object.keys(FRICTION_PLAYBOOKS)` in chapter order (`s1, s2, s4, s6, s7, s8, s11, s12`).
3. `sectionLayers.test`: `idsWith('practice')` and `idsWith('examples')` have 19 entries each; every chapter's section count is between 6 and 9 at both levels; the exact counts of A.3 are pinned per chapter.
4. `sectionLayers.test`: `SECTION_META.practice.minutes === 3` and `SECTION_META.examples.minutes === 5`.
5. `chapterRoute.test`: `dialogue→{section:'examples'}`, `workflow`/`checklist→{section:'practice'}`, `primer→{focus:'top'}`, `mindset→{focus:'mindset'}`; `formatChapterHash` of each parsed alias yields the canonical hash of A.5.
6. `frictionFaqs` guard (new `src/data/frictionFaqs.test.ts`): every `relatedPlaybookChapterId` is a key of `FRICTION_PLAYBOOKS`.
7. `ChapterIntro.test.tsx`: renders `data-chapter-intro` with all three primer strings, has no `<button>`, and returns empty markup for a chapter without a primer.
8. Section render tests (static markup): `PracticeSection` open lists steps before checklist items and preserves the `s1_cl_0` key behaviour (toggle callback receives `s1_cl_0`); `ExamplesSection` open shows the dialogue before the first case; `RoleMindsetCard` open contains the `FrictionPrinciples` heading; `FrictionPlaybookCard` rendered with a playbook contains no `3 ข้อที่ควรจำเมื่อคุยเรื่อง` text (the fallback branch is gone; `playbook` is a required prop, so tsc enforces the rest).

### A.7 Acceptance criteria

1. Every chapter shows 6–9 section chips (per A.3). No chip reads `จุดเริ่มต้น`, `บทสนทนา`, `ขั้นตอนงาน`, `เช็กลิสต์` or `วิธีคิดแต่ละบทบาท`.
2. The primer paragraph is visible under the hero without a click, in both levels, in all 19 chapters.
3. `รับมือ Friction` appears only in s1, s2, s4, s6, s7, s8, s11 and s12. The experienced lens hint mentions Friction only there.
4. The role-mindset card appears exactly once per page, collapsed, below the landing banner, and contains the three friction principles.
5. Checklist ticks made before the change remain ticked. They are session state, and the keys are unchanged.
6. Every hash in A.5 lands as specified, on load and on back/forward.
7. `npm run lint` (tsc + knip, no unused exports left from the deleted wrappers) and `npm test` pass with no new warnings.

### A.8 Risks

- **Experienced readers see ~460 more chars** (primer was in closed Deep). Accepted in decision 1; gating `ChapterIntro` on level is a one-line revert.
- **Landing card adds one collapsed row above the reader on mobile.** Chapter navigation lands at `#chapter-start`, so reading position is unaffected.
- **Absent-section fallback now scrolls** to chapter start for any absent key (e.g. `reference` on s3), not only clears the hash. Intended; same rule as the friction fallback.
- **Merged `examples` is long** (~1,740 chars median); it stays closed in Apply and sub-headings keep it scannable.
- **Old `mindset` links scroll to a card above the chapter**; the named chapter still loads below it.


## Part B — UX findings from run 2026-09-25

Source: `.ux-assessment-run1/runs/2026-09-25/report.md` and `findings.yaml` (3 personas, quick mode, `http://localhost:3100`).

### B.0 Verification against current code

All AI commits (`ac246f9`…`4524b12`, incl. the Gemini fallback) are dated 2026-09-23/24, before the run; `4524b12` is still HEAD. Every finding re-checks as **still present**:

| ID | Status | Evidence (HEAD `4524b12`) |
|---|---|---|
| F-01 | present | `server/ask-ai.ts:111` still appends the fixed structure; `:20-28` still seeds English cues |
| F-02 | present | `AIAssistantTab.tsx:271-276` passes `msg.content` to `<Markdown>` unmodified |
| F-03 | present | `App.tsx:26-37`, the only tab effect, edits the hash and never scrolls |
| F-04 | present | chips `AIAssistantTab.tsx:245-253` never disable; nothing scrolls after `:135` |
| F-05 | present | `AIAssistantTab.tsx:258` `min-h-[420px] max-h-[600px] overflow-y-auto` at all widths |
| F-06 | present | `SectionOutline.tsx:41` (also `ui/Tabs.tsx:35`, `GlossaryPanel.tsx:143`) |
| F-07 | present | `QuizTab.tsx:56` + `quizRounds.ts:16-20` keep bank order |

Tests: `bun run test` (vitest, node env, colocated `*.test.ts`); components via pure helpers or `renderToStaticMarkup`.

### B.1 F-01 — AI answers every question with one long template and English headings

**Root cause.** `buildMessages` ends every user turn with `ตอบให้ชัด แบ่งเป็นข้อคิดกับวิธีแก้ที่ใช้ได้จริงในที่ทำงาน:` (`server/ask-ai.ts:111`), so "เว็บนี้ทำอะไรได้บ้าง" got insights plus advice. `SYSTEM_INSTRUCTION` (`:20-28`) demands two sides "เสมอ" and carries English glosses (`Friction reduction`, `Actionable advice`…) the model reused as headings. Nothing describes the site. The fallback answers the same question with `GENERIC_ANSWER` (`server/knowledge-base.ts:138`).

**Fix.**
1. User turn (`:111`): end at `[คำถาม]: ${question}`. Remove the structure suffix.
2. Rewrite `SYSTEM_INSTRUCTION` as Thai rules with no English glosses:
   - `ตอบให้ตรงคำถามก่อน ความยาวและรูปแบบให้ตามคำถาม: คำถามสั้นหรือถามข้อเท็จจริง ตอบสั้นๆ ไม่กี่บรรทัด ใช้หัวข้อหรือตารางเฉพาะเมื่อคำถามต้องการเปรียบเทียบหรือมีหลายขั้นตอน`
   - `อธิบายมุมมองทั้งสองฝั่งเมื่อคำถามเป็นเรื่องที่สองฝั่งเห็นต่างกัน ไม่ต้องทำทุกครั้ง`
   - `หัวข้อทุกระดับเป็นภาษาไทย ห้ามใช้หัวข้อหรือวงเล็บภาษาอังกฤษ ศัพท์เทคนิคที่คนในวงการใช้ทับศัพท์ (เช่น API, Acceptance Criteria) ใช้ในเนื้อความได้`
   - `ห้ามใช้ HTML ทุกชนิด รวมถึง <br> ถ้าในช่องตารางมีหลายประเด็น ให้ใช้รายการนอกตารางแทน`
   - Keep the tone rules (`:26-28`).
3. `server/knowledge-base.ts` (which already holds the chapter list and is imported by `ask-ai.ts`) exports `SITE_OVERVIEW`, used by prompt and fallback; `${n}` = `CHAPTERS.length`, so Part A cannot stale it. Text: `เว็บนี้คือคู่มือ "จุดที่ business กับ engineering มาเจอกัน" มี 3 แท็บ: GUIDE คู่มือ ${n} บท เลือกสาย (Business / Engineering) และระดับ (Beginner / Experienced) ได้ มีเส้นทางการอ่านตามสาย สารบัญค้นหาและกรองตามสายงาน และบทศัพท์เทคนิค, AI BRIDGE ถามต่อจากบทที่อ่านอยู่ได้, QUIZ แบบทดสอบ 4 ชุด (พื้นฐาน / สาย Business / สาย Engineering / ทั้งหมด)`. The system prompt appends `ถ้าผู้ใช้ถามว่าเว็บนี้คืออะไรหรือทำอะไรได้ ให้ตอบจากข้อมูลนี้ สั้นๆ เป็นรายการ:` and the overview.
4. Gemini already shares the prompt: `messages` is built once (`:183`) and sent to every provider (`:187-188`). A test pins it.
5. Fallback: first `cannedAnswer` case matches `/(เว็บ|เว็บไซต์|แอป|ที่นี่)(นี้)?.{0,12}(ทำอะไร|ใช้ยังไง|ใช้อย่างไร|มีอะไร)/` or `คุณคือใคร` and returns `SITE_OVERVIEW` as a list. Other canned answers have no English headings; unchanged.

**Tests** (`api/ask-ai.test.ts` covers routing/history/fallback but no prompt text today):
- User content ends with the question and contains no `แบ่งเป็นข้อคิด`.
- System content contains the overview line with the current chapter count and does not match `/\((Insights|Actionable|Friction|Real-world)/i`.
- In the "Gemini after Groq" block, the messages sent to Gemini deep-equal those sent to Groq.
- Fallback: `เว็บนี้ทำอะไรได้บ้าง` returns the overview (contains `AI BRIDGE` and `QUIZ`); existing canned-answer tests stay green.

**Acceptance.** Live key: `เว็บนี้ทำอะไรได้บ้าง` → ≤ ~8 lines listing the 3 tabs; chip questions may use headings, none English. No key: the overview, not generic advice.

### B.2 F-02 — raw `<br>` and `**` in AI table cells

**Root cause.** `react-markdown` escapes HTML (no `rehype-raw`, which is not added: it opens a raw-HTML surface for model output), so `<br>` shows as text (s09: `… <br>2️⃣`). Literal `**` has two causes: CommonMark flanking — Thai has no spaces, so in `**ขั้นตอน:**ทำ` a closing `**` after punctuation is followed by a letter and never closes; and an odd `**` count per cell (s09 cells end `…เร็วขึ้น**`, `…มาตรฐาน**` after a bold lead).

**Fix.** New pure module `src/lib/answerMarkdown.ts`:
- `normalizeAnswerMarkdown(md)`, applied to AI messages at `AIAssistantTab.tsx:275`; ``` fenced lines skipped:
  1. `/<br\s*\/?>/gi` → U+2028 LINE SEPARATOR (not a Markdown line ending, so table rows survive).
  2. Flanking repair: one space after a closing `**` that follows punctuation and precedes a letter; one space before an opening `**` that follows a letter and precedes punctuation.
  3. Table rows only (`|`-lines): split on unescaped `|`; a cell with an odd `**` count drops its last `**`. Cells only, since bold may span paragraph lines.
- `rehypeLineBreaks`: dependency-free rehype plugin (~15-line recursive walk) splitting text nodes on U+2028 into `br` elements; `<Markdown rehypePlugins={[rehypeLineBreaks]}>`.
- The B.1 prompt ban is the first defence; this handles what models still emit.

**Tests** (`src/lib/answerMarkdown.test.ts`): `<br>`/`<BR/>`/`<br />` in a row keep one row; `**ขั้นตอน:**ทำ` → `**ขั้นตอน:** ทำ`; `ทำ**(ด่วน)**` → `ทำ **(ด่วน)**`; `คำ**หนา**คำ` unchanged; s09 cell `| **“ขยายความเร็ว”** – ทำแคมเปญเร็วขึ้น** |` loses the trailing `**`; fences untouched; plugin on a HAST fixture yields the expected `br` count; `renderToStaticMarkup` of a table answer contains no `&lt;br` or `**`.

**Acceptance.** Replaying the s09 answer text renders line breaks in cells with no visible `<br>` or `**`.

### B.3 F-03 — scroll position carries across tab switches

**Root cause.** Tabs share window scroll; `setActiveTab` (`Header.tsx:150`, `App.tsx:188/193/255`) swaps content and `App.tsx:26-37` never scrolls. `handleOpenChapterFromQuiz` (`:192-195`) also skips the scroll `handleSelectChapter` does (`GuideTab.tsx:281-285`).

**Fix.** Add a pure `tabEntryScroll(prev: TabType, next: TabType, hasRequestedSection: boolean): 'none' | 'top' | 'chapter-start'` in `src/lib/tabScroll.ts`:
- Same tab: `none`.
- Entering `guide` with a requested section: `none`. GuideTab's section effect (`:247-257`) scrolls two frames later (`:188-202`).
- Entering `guide` otherwise: `chapter-start`, which uses `scrollToChapterStart()` (page top on desktop, reader card below `lg`).
- Entering `ai` or `quiz`: `top`, which uses `window.scrollTo(0, 0)`.

App runs it in a `useLayoutEffect` on `activeTab` (own prev-tab ref, skips first mount so load-time hash scrolls are untouched), passing `route.requestedSection !== null`.

**Interplay with deep links.**
- The layout effect runs before GuideTab's passive effect and its rAF scroll, so a section link (popstate `#/ch/N/key`) still lands on the section.
- Popstate chapter-only changes already schedule `scrollToChapterStart` (`useChapterRoute.ts:91-93`); both target the same point.
- Quiz "อ่านบทที่เกี่ยวข้อง" now lands at chapter start with no extra call.

**Tests** (`src/lib/tabScroll.test.ts`): cover all 3×3 transitions plus guide entry with and without a section.

**Acceptance.** 360px: scrolled GUIDE → QUIZ shows question 1; → AI BRIDGE shows the header card and `มุมมอง:`. Back to `#/ch/3/<section>` from QUIZ lands on the section. Quiz "อ่านบทที่เกี่ยวข้อง" shows the chapter title under the sticky header.

### B.4 F-04 — tapping a suggested question changes nothing visible on mobile

**Root cause.** `handleSend` appends below the fold (thread under the chips, `:257`) and nothing scrolls (98.7 dB PSNR, no change). Chips keep their state while loading; a second tap is silently dropped (`:125`).

**Fix** (`AIAssistantTab.tsx`):
- `pendingScrollId` state: `handleSend` sets it to the new user message id; an effect on `[messages, pendingScrollId]` calls `scrollIntoView({ block: 'start', behavior })` on `[data-msg-id=…]` (`auto` under `prefers-reduced-motion`, else `smooth`), then clears it. It scrolls every ancestor, so it works in the desktop box and the mobile page (B.5).
- Scroll to the question, never the answer's end: the answer then reads from its top.
- Message wrappers get `data-msg-id` and `scroll-mt-[calc(var(--header-h)+8px)]`.
- While `isLoading`, chips are `disabled` (`disabled:opacity-60 disabled:cursor-not-allowed`); the tapped chip shows `Loader2`.

**Tests.** Extract `QuickPromptChips({ loading, activePrompt, onPick })`; in `AIAssistantTab.test.tsx`, `renderToStaticMarkup` with `loading` shows every button `disabled` and the spinner in the active chip. Scroll is browser-verified.

**Acceptance.** 360×640: a chip tap shows the question and "กำลังคิดคำตอบ..." within 1 s, chips visibly disabled; the answer appears under the question.

### B.5 F-05 — AI answer inside a nested scroll box on mobile

**Root cause.** `AIAssistantTab.tsx:258` applies `min-h-[420px] max-h-[600px] overflow-y-auto` at every width; on 640px about 250px of box is visible (s19).

**Fix.**
- Thread: `sm:min-h-[420px] sm:max-h-[600px] sm:overflow-y-auto`; below `sm` the page scrolls.
- Input wrapper (`:329`): `max-sm:sticky max-sm:bottom-0 max-sm:z-20 max-sm:bg-base-200 max-sm:pt-2 max-sm:pb-[max(0.5rem,env(safe-area-inset-bottom))]`. The quota note (`:379`) moves out of the sticky block on mobile (render it under the thread below `sm`), saving ~30px of sticky height.
- Root `pb-16` (`:193`) stays. Desktop unchanged.

**Tests.** `renderToStaticMarkup`: thread `max-h`/`overflow-y-auto` only with `sm:`; form wrapper has `max-sm:sticky`.

**Acceptance.** 360×640: a long answer reads with one (page) scrollbar, input visible at the bottom. 1440px: unchanged.

### B.6 F-06 — clipped chip rows with no scroll hint on mobile

**Root cause.** `SectionOutline.tsx:41` is `flex-nowrap overflow-x-auto` below `sm` with no edge cue; `Tabs scroll` (`ui/Tabs.tsx:35`, index filter `GuideTab.tsx:456/874`) also sets `scrollbar-none`; `GlossaryPanel.tsx:143` shares the pattern.

**Fix: edge fade, not wrap.** The outline is sticky; wrapping layer labels, 6–9 chips and `ขยายทั้งหมด | ย่อทั้งหมด` at 360px needs 2–3 rows (~100px of 640) on every chapter, even after Part A.
- Pure `scrollEdges(scrollLeft, clientWidth, scrollWidth, tolerance = 1) → { start, end }` (`src/lib/scrollEdges.ts`); `useScrollEdges(ref)` (`src/hooks/`) recomputes on passive `scroll` and `ResizeObserver`.
- `ui/ScrollFade.tsx`: `relative` wrapper with two `aria-hidden pointer-events-none` 24px gradients (`from-base-100`, overridable), each shown only while that edge hides content, below `sm` only.
- Apply to the SectionOutline row, `Tabs` with `scroll`, and the glossary category row. Driven by overflow, not chip count, so it holds at 6–9 chips and vanishes when a row fits.

**Tests.** `scrollEdges.test.ts`: fits, start, middle, end, sub-pixel within tolerance. `Tabs scroll` static render includes the fade wrapper.

**Acceptance.** 360px: outline, index filter and glossary rows show a right fade while chips are hidden; at the end, a left fade only. Rows that fit show none.

### B.7 F-07 — quiz question 1 comes from an unread chapter

**Root cause.** `getQuizRound` (`quizRounds.ts:16-20`) keeps bank order; biz Q1 is `s4` (NFR). phone-mint had read `s2`, first on the biz track (`readingTracks.ts:9`), and the biz round has no question on `s2`, `s1` or `s14`.

**Fix: most recently read first, then reading-track order.** Track order alone was rejected: every biz reader would still open on `s4`, which does not serve "check what I just read".

- Pure `orderQuizRound(qs, { trackIds, anchors })` in `quizRounds.ts`. Anchors: current guide chapter, then `readChapters` newest-first (appended in read order, `App.tsx:176`). Anchor questions first in anchor order; rest by `trackIds`; off-track last in bank order; stable.
- Track: `biz`/`eng` rounds use theirs; `basics`/`all` use the role's, else `beginner`.
- `QuizTab` receives `readChapters` and `currentChapterId`; the current chapter counts only if `route.hasNavigated || route.initialSource !== 'default'` (an untouched default `s1` is not reading). Order is memoised per round.
- Ordering alone cannot help phone-mint (no biz question on her chapters). When the round has no anchor question and `basics` does, show above Q1: `ชุดพื้นฐานมีคำถามจากบทที่ ${n} ที่คุณเพิ่งอ่าน` + text button `ไปชุดพื้นฐาน` → `chooseRound('basics')`. Round3 D12 (role round as first-visit default) stands.

**Tests** (`quizRounds.test.ts`): anchor order; stable ties; off-track last; no anchors = track order; hint predicate true for biz with anchor `s2`, false when a biz question matches.

**Acceptance.** Business, read `s4` → Q1 is the `s4` question. Business, read only `s2` → hint names บทที่ 2; tapping it opens basics with the `s2` question first.

### B.8 F-08 — out of scope

Harness reported `visual_change: none` at phone-mint step 16 though s16/s17 differ (17.6 dB). Assessment-tool defect; no app change.

### B.9 Decisions made while specifying

Justified inline: F-02 sentinel + plugin over `rehype-raw` (no raw-HTML surface, no dependency); F-03 chapter start on GUIDE return (GuideTab remounts and re-derives open sections, `GuideTab.tsx:241`, so an old offset would not map to the same content); F-04 scroll to the question; F-06 fade over wrap; F-07 read-first order plus a basics hint, keeping D12.

### B.10 Not covered by this run

Engineering track, returning visits, screen reader, slow network, AI/content accuracy, quiz results, Experienced level, index search, in-chapter "ask AI", `มุมมอง:`, theme switch. No console/HTTP capture, so the answering provider is unknown: check F-01 acceptance once per provider (Groq, Gemini, fallback).
