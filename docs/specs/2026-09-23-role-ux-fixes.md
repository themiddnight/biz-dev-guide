# Spec: Role UX fixes from the round-2 persona test

- Date: 2026-09-23
- Status: Ready for implementation. The owner asked for no further questions; every open choice is decided in §8 with its rationale.
- Branch: `feat/role-perspective` @ `cad3cb4`
- Target app: `/Users/Pathompong/Sites/Personal/biz-dev-guide/src`
- Evidence: `work/ux-test-roles/synthesis.md` (issue IDs I-01…I-21). Round-1 baseline: `work/ux-test/synthesis.md` §6e.
- UI copy is **Thai-first** and follows `2026-09-22-concise-copy.md` (R1–R9). Every Thai string quoted in this spec is the literal copy to ship. Spec prose is English.
- **Supersedes** `2026-09-22-role-perspective.md` **D4** ("Changing role clears per-chapter overrides") and its §7 row for `be_guide_chapter_levels`. See Phase 3.

## 0. Background and verified facts

Round 2 ran four role personas (Mint biz-beginner, Bank eng-beginner, Nok biz-experienced, Tee eng-crossover). The role switch met the design rule for all four, and 0 of 13 core chapters needed help. Five issues block or slow the primary audiences:

- **I-01 (H, 4/4).** All 3 Partial teach-backs miss a must-have that sits in `แนวคิดหลัก` or the takeaway. In the beginner layout, `แนวคิดหลัก` and `กับดัก` are inside the collapsed `เจาะลึก` layer.
- **I-02 (H, both business personas).** The Business track leaves out ch.2, ch.3 and ch.14, includes ch.5 (Mint: fit 2), and the card line `บทฝั่งคุณเริ่มจากแนวคิดหลัก` is true for no chapter on the track.
- **I-03 (M, 4/4).** The ch.12 override was cleared by a role round trip and all four were surprised. It was by design (D4).
- **I-04 (M-H, 3/4).** Index search misses core-concept text (`user story` does not find ch.14) and shows a blank list when nothing matches.
- **I-05 (M, 3/4).** In the role rounds the correct option is the longest in 12/12 questions (1.7–3.7× the longest distractor).

**Why layers exist (round-1 §6e).** Round 1 found overload because every section showed at once, in every chapter, to everyone. Collapse-all alone moved Mint's overwhelm 4 → 3. §6e proposed Core (open, ≤ 5 min), Apply (collapsed, one-line previews, including pitfalls) and Deep (core concepts, reference, case studies). Round 2 shows the Deep placement of core concepts was wrong for beginners: the must-haves live there. Phase 1 moves them back into Core in a **compact** form, so the overload fix is kept.

**Verified code facts** (branch `feat/role-perspective`, commit `cad3cb4`):

| Fact | Where |
|---|---|
| Beginner layers: core `primer, otherSide, jargon, diagram`; apply `dialogue, examples, workflow, checklist, faq, friction`; deep `coreConcepts, pitfalls, reference, glossary, mindset`. Experienced core is `otherSide, coreConcepts, pitfalls, diagram`. | `data/sectionLayers.ts:16-27` |
| `SECTION_META` minutes are level-independent (`coreConcepts` 3, `pitfalls` 2). Layer minutes = sum of `SECTION_META[k].minutes`; the only consumer is the layer header `≈ {group.minutes} นาที`. | `sectionLayers.ts:35-51, 141-146`; `components/guide/LayerGroup.tsx:24` |
| `CHAPTER_CORE_OVERRIDES` puts `faq` (s11) and `glossary` (s15) first in Core for both levels. | `sectionLayers.ts:30-33, 131-135` |
| Every chapter s1–s19 has exactly 3 core concepts. `detail` is 21–179 characters. Bullets: 0–5 per concept. Inline sections anchored to `coreConcepts`: s1 (1), s5 (1). | measured over `CHAPTERS`; `inlinePlacement.test.ts:41-63` |
| The Partial must-haves are in core concepts: s9 15–20% in CC2 `detail`; s11 `2. ตอบว่า "ได้ ถ้า..." (Yes, if...)`; s18 `1. เป้าไหลจากบนลงล่าง`; s14 `2. สูตร User Story: Role-Action-Value`. | `chapters6_10.ts:520`; `chapters11_15.ts:91, 504`; `chapters16_19.ts:381` |
| `CoreConceptsSection` renders heading, `detail`, bullets and inline sections for every concept. It has no level input. | `components/guide/sections/CoreConceptsSection.tsx:7-57` |
| `GuideSectionContext` has `role` but no level. GuideTab builds it at line 312 and resolves `chapterLevel` at 175. | `sections/registry.tsx:27-41`; `GuideTab.tsx:175-177, 312` |
| Layer tests pin the membership: 15 keys per level, beginner core, s1/s11/s15 core lists, s1 beginner core minutes 6. | `sectionLayers.test.ts:22-45, 68-81, 95-101` |
| Tracks: `biz: [1, 4, 5, 6, 9, 10, 11, 13]` (98 min), `eng: [1, 16, 2, 17, 18, 4, 11, 19, 9]` (100 min). | `data/readingTracks.ts:9-10`; `readingTracks.test.ts:7-8, 51-53` |
| Chapter homes: `biz` s2, s3, s16–s19; `eng` s5–s10, s13, s15; `shared` s1, s4, s11, s12, s14. Read times: s1 10, s2 11, s4 12, s6 11, s9 12, s10 12, s11 15, s14 11 min. | `data/chapters/*.ts` (`home:` / `readTime:` lines) |
| First-visit card lines: biz `บทฝั่ง Engineering จะเริ่มจากพื้นฐาน บทฝั่งคุณเริ่มจากแนวคิดหลัก`; eng `บทฝั่ง Business จะเริ่มจากพื้นฐาน และขึ้นมาอยู่ต้นเส้นทาง`. | `components/guide/FirstVisitCard.tsx:6-9` |
| Header `ตามสายงาน` tooltip: `บทฝั่งคุณเปิดแบบคุ้นงาน บทอีกฝั่งเปิดแบบมือใหม่`. Shared chapters also open as beginner, so the tooltip is incomplete. | `components/Header.tsx:132`; `data/rolePerspective.ts:38` |
| Per-chapter overrides: one flat `Record<chapterId, ExperienceLevel>` in `be_guide_chapter_levels`. `handleChooseRole` calls `persistChapterLevels({})` on every real role change. | `App.tsx:53-88` |
| `resolveChapterLevel` ignores `chapterLevels` when role is null. | `data/rolePerspective.ts:30-39` |
| `planRoleChoice` returns `{ changeRole, dismissFirstVisit }`; its doc comment says a change clears overrides. `parseChapterLevels` sanitises one flat map. | `lib/rolePrefs.ts:15-44`; `lib/rolePrefs.test.ts:50-64` |
| Storage helpers `readStorage` / `writeStorage` / `removeStorage` are guarded. | `lib/storage.ts:1-24` |
| Index search is inline in GuideTab: title, subtitle, `enTerm`, `keyTakeaway`, `plainAnalogy`, jargon terms, and glossary terms for s15. No trim. Both index lists (desktop 476, mobile drawer 918) map `filteredChapters` with no empty state. | `GuideTab.tsx:329-345, 476, 918` |
| Search probe: `user story` matches only s2 today; core-concept text would add s14. `15–20` matches nothing today; core concepts add s9. `ด่วน` matches nothing today; core concepts add s7, s10, s17. | bun script over `CHAPTERS` |
| Role filter chip state `selectedRole` (`'all'` default); chips at 450 (desktop) and 891 (mobile). | `GuideTab.tsx:104, 450-470, 891-910` |
| Quiz rounds: `basics` = `forRole: 'both'` (ids 1–8), `eng` = ids 9–14, `biz` = ids 15–20. The correct option is stored at index 0 in ids 9–20; `QuizTab` shuffles at display. | `data/quizRounds.ts:16-20`; `data/quizQuestions.ts:255…` |
| Correct/longest-distractor length ratio today: ids 9–14 = 2.53, 2.00, 2.79, 2.70, 1.73, 2.53; ids 15–20 = 1.98, 1.89, 2.08, 2.02, 3.70, 1.88. Basics: correct is longest in 7/8 (not id 7). | bun script, `[...text].length` |
| Quiz tests: ids 1–20 unique, 4 options, one correct; scenario explanations ≤ 160 chars; eng all `Dev`. | `quizQuestions.test.ts:10-60` |
| Test runner: vitest, node env; components via `renderToStaticMarkup`; `lint` = `tsc --noEmit`. | `package.json`; `components/guide/rolePerspectiveUi.test.tsx:10` |

---

## Phase 1 — Core concepts reachable in the beginner Core layer (I-01)

**Goal.** A beginner sees every chapter's three core ideas without expanding anything, and Core does not grow back into round 1's wall of text.

### P1.1 Layer config — `data/sectionLayers.ts`

```ts
beginner: {
  core:  ['primer', 'otherSide', 'coreConcepts', 'jargon', 'diagram'],
  apply: ['dialogue', 'examples', 'workflow', 'checklist', 'pitfalls', 'faq', 'friction'],
  deep:  ['reference', 'glossary', 'mindset'],
},
experienced: { /* unchanged */ },
```

- `coreConcepts` moves Deep → Core, after `otherSide` (the chapter's ideas come after "what is it" and "how the other side sees it", before vocabulary).
- `pitfalls` moves Deep → Apply, after `checklist`. This is where round-1 §6e placed it. Apply shows one-line previews, so pitfalls are one tap away without adding to Core.
- Each level still holds all 15 keys exactly once.

### P1.2 Compact core concepts for beginners

- `GuideSectionContext` gains `chapterLevel: ExperienceLevel`. GuideTab passes the resolved `chapterLevel` (line 175) into `sectionCtx` (line 312).
- `CoreConceptsSection`, when `ctx.chapterLevel === 'beginner'`:
  - renders each concept's `heading` and `detail` as today;
  - hides `bulletPoints` and the concept's inline sections behind a per-concept text button. The button is shown only when the concept has bullets or inline sections;
  - the button toggles local state (`useState<Record<number, boolean>>`, default all closed). It carries `data-concept-more={cIdx}` and `aria-expanded`.
- When `ctx.chapterLevel === 'experienced'`, rendering is unchanged (bullets and inline sections always shown).
- Button copy, literal:
  - closed: `ดูรายละเอียด ({n} ข้อ)` where `n` = bullet count; when the concept has inline sections but no bullets: `ดูรายละเอียด`
  - open: `ซ่อนรายละเอียด`

### P1.3 Honest minutes

- Add `export function sectionMinutes(level: ExperienceLevel, key: SectionKey): number` in `sectionLayers.ts`: returns `1` for `level === 'beginner' && key === 'coreConcepts'`, else `SECTION_META[key].minutes`. Three `detail` lines of ≤ 180 characters read in about a minute.
- `getChapterLayout` sums `sectionMinutes(level, k)`.
- Resulting beginner Core: s1 = primer 2 + otherSide 2 + coreConcepts 1 + jargon 2 = **7 min** (was 6). A chapter with a diagram: **10 min** (was 9).

### P1.4 Files

`data/sectionLayers.ts` · `components/guide/sections/registry.tsx` (`chapterLevel` in the context type) · `components/GuideTab.tsx` (pass `chapterLevel`) · `components/guide/sections/CoreConceptsSection.tsx` · tests below.

### P1.5 Tests

- `data/sectionLayers.test.ts`:
  - `:22-26` stays (15 keys once per level).
  - `:32` → `['primer', 'otherSide', 'coreConcepts', 'jargon', 'diagram']`. Add `expect(LAYER_CONFIG.beginner.apply).toContain('pitfalls')` and `expect(LAYER_CONFIG.beginner.deep).toEqual(['reference', 'glossary', 'mindset'])`.
  - `:45` biz + s6 core → `['primer', 'otherSide', 'coreConcepts', 'jargon', 'diagram']`.
  - `getLayerOf('beginner', 'coreConcepts', 's1')` → `'core'`; `getLayerOf('beginner', 'pitfalls', 's1')` → `'apply'`.
  - `:69` beginner s1 core → `['primer', 'otherSide', 'coreConcepts', 'jargon']`.
  - `:80` beginner s15 core → `['glossary', 'primer', 'otherSide', 'coreConcepts', 'diagram']`.
  - `:95` beginner s11 core → `['faq', 'primer', 'otherSide', 'coreConcepts', 'jargon', 'diagram']`.
  - `:97-101` minutes test uses `sectionMinutes(level, k)`; s1 beginner core minutes → `7`.
  - New: `sectionMinutes('beginner', 'coreConcepts') === 1`, `sectionMinutes('experienced', 'coreConcepts') === 3`.
  - New: every chapter s1–s19 has `coreConcepts` in beginner Core (guards against a future chapter override removing it).
- **New** `components/guide/sections/CoreConceptsSection.test.tsx` (`renderToStaticMarkup`, `isOpen: true`, a minimal ctx cast):
  - beginner + s9: contains `15–20%` (it is in `detail`), contains `ดูรายละเอียด (4 ข้อ)` for CC1, and does **not** contain CC1's first bullet text.
  - experienced + s9: contains CC1's first bullet text and no `ดูรายละเอียด`.
  - beginner + s5: CC1 shows `ดูรายละเอียด (4 ข้อ)`; the `three-lenses` inline figure is not in the markup.

### P1.6 Acceptance

1. Role null, level Beginner, open s9: Core shows `แนวคิดหลัก (Core Concepts)` open, with three headings and their one-paragraph details, including `15–20%`. The bullets are hidden behind `ดูรายละเอียด (n ข้อ)`.
2. The Core header reads `≈ 10 นาที` on s9 (primer, other side, core concepts, jargon, diagram).
3. `กับดัก` appears in `นำไปใช้ (Apply)` for beginners, and `เจาะลึก (Deep)` lists only reference, glossary and mindset.
4. Experienced layout is unchanged on every chapter.
5. Role eng, open s18 (beginner by role): `1. เป้าไหลจากบนลงล่าง` is visible without expanding anything.

---

## Phase 2 — Business track redesign and card copy (I-02, plus the eng-track check)

**Goal.** The Business track starts from a chapter the reader owns, contains the spec chapter both business personas searched for, drops the architecture chapter, and the card line describes the track truthfully.

### P2.1 Tracks — `data/readingTracks.ts`

```ts
biz: [2, 1, 14, 4, 6, 9, 10, 11], // 94 min: start from the PM hand-off, follow the work through Engineering
eng: [16, 1, 2, 17, 18, 4, 11, 19, 9], // 100 min: money first, then the hand-off
```

- **Business, 94 min** (was 98): s2 PM 11 → s1 hand-off 10 → s14 specs 11 → s4 BA/NFR 12 → s6 DoR/DoD 11 → s9 tech debt 12 → s10 incidents 12 → s11 friction 15.
  - Added: s2 (Business-home, opens experienced, so the reader starts on familiar ground), s14 (the spec chapter Mint and Nok found only through search).
  - Removed: s5 C4 architecture (Mint fit 2, Bank fit 3) and s13 AI (not a goal chapter for any business persona; still in the index).
  - s3 UX stays off the track (see D6).
  - Covers every business-persona goal chapter: Mint s1, s6, s14; Nok s6, s9, s11.
- **Engineering check (same class of problem).** Does the eng track miss the engineer's goal chapters, include off-goal ones, or make a card promise no chapter keeps? Membership: no. Both engineers reached ch.16–19 with 0 wrong turns, and the card line holds for s16–s19. The one related defect: ch.1 is step 1, which three personas rated fit 3 (I-07). Moving s16 to step 1 makes the card phrase `ขึ้นมาอยู่ต้นเส้นทาง` literally true. The set and the minutes do not change.
- `TRACK_META` titles and descriptions: unchanged. The biz description `เข้าใจว่าทีม Engineering ทำงานยังไง ตั้งแต่สเปกถึงวันที่ระบบล่ม` still matches (s14 spec → s10 incident).

### P2.2 Copy

| Where | Old | New (literal) |
|---|---|---|
| `FirstVisitCard.tsx:7` biz line | `บทฝั่ง Engineering จะเริ่มจากพื้นฐาน บทฝั่งคุณเริ่มจากแนวคิดหลัก` | `เริ่มจากบท PM ที่คุณคุ้น แล้วไปดูว่าทีม Engineering รับงานต่อยังไง` |
| `FirstVisitCard.tsx:8` eng line | `บทฝั่ง Business จะเริ่มจากพื้นฐาน และขึ้นมาอยู่ต้นเส้นทาง` | unchanged (true after P2.1) |
| `Header.tsx:132` `ตามสายงาน` title | `บทฝั่งคุณเปิดแบบคุ้นงาน บทอีกฝั่งเปิดแบบมือใหม่` | `บทฝั่งคุณเปิดแบบคุ้นงาน บทอื่นเปิดแบบมือใหม่` |

The biz line drops the level claim. After Phase 1, beginners also see core concepts in Core, so "your side starts from core concepts" no longer marks a difference. It also conflicted with being new (Mint). The track line under each card (`เส้นทาง: บท … · ≈ N นาที`) is computed and updates by itself to `บท 2 → 1 → 14 …` and `≈ 94 นาที`.

### P2.3 Files

`data/readingTracks.ts` · `components/guide/FirstVisitCard.tsx` · `components/Header.tsx` · tests below.

### P2.4 Tests

- `data/readingTracks.test.ts`:
  - `BIZ = ['s2', 's1', 's14', 's4', 's6', 's9', 's10', 's11']`; `ENG = ['s16', 's1', 's2', 's17', 's18', 's4', 's11', 's19', 's9']`.
  - `:51-53` → `getTrackMinutes(BIZ) === 94`, `ENG === 100`.
  - New: the biz track starts with a Business-home chapter (`homeOf(BIZ[0]) === 'biz'`); the eng track starts with a Business-home chapter (`homeOf(ENG[0]) === 'biz'`).
  - New: the biz track includes `s14` and excludes `s5`.
  - New: neither role track starts with `s1`.
  - Keep: the eng biz-before-eng ordering test, the s16/s17 test, and "biz track does not include the business chapters".
- `components/guide/rolePerspectiveUi.test.tsx` (FirstVisitCard block):
  - Markup contains `เริ่มจากบท PM ที่คุณคุ้น` and does not contain `บทฝั่งคุณเริ่มจากแนวคิดหลัก`.
  - Markup contains `≈ 94 นาที` and `≈ 100 นาที`.

### P2.5 Acceptance

1. Fresh profile, choose `💼 ฉันมาจากสาย Business`: s2 opens (with experienced layout) and the track panel lists 2, 1, 14, 4, 6, 9, 10, 11.
2. Choose `💻 ฉันมาจากสาย Engineering`: s16 opens first.
3. The card shows the new biz line and `≈ 94 นาที`.
4. Hovering `ตามสายงาน` shows `บทฝั่งคุณเปิดแบบคุ้นงาน บทอื่นเปิดแบบมือใหม่`.

---

## Phase 3 — Per-role chapter-level overrides (I-03, owner decision)

**Owner decision.** Per-chapter level overrides are stored **per role**. Switching role swaps to that role's override set. Switching back restores it. **This supersedes role-perspective spec D4** ("Changing role clears per-chapter overrides but keeps `levelMode`"). D4's rationale still holds: an override is relative to one role's defaults. Scoping the stored set to that role keeps it valid without deleting it.

### P3.1 Storage

| key | format | notes |
|---|---|---|
| `be_guide_chapter_levels_by_role` (**new**) | JSON `{ "biz"?: Record<chapterId, ExperienceLevel>, "eng"?: Record<chapterId, ExperienceLevel> }` | Written on every override change. Empty role maps are dropped. |
| `be_guide_chapter_levels` (**legacy**) | JSON `Record<chapterId, ExperienceLevel>` | Read once for migration, then removed. Never written again. |
| `be_guide_level_mode` | unchanged | Stays global, not per role (D11). |

**Migration** (at App init, in this order):

1. If the new key is present: parse it. Ignore the legacy key's contents and remove it.
2. Else if the legacy key is present and the stored role is `biz` or `eng`: the legacy map becomes that role's set. Write the new key, then remove the legacy key.
3. Else if the legacy key is present and the role is null: drop it (overrides have no effect without a role, and D4 already cleared them on a switch to "no role"). Remove the legacy key.
4. Else: `{}`.

Parsing reuses the flat-map rules: unknown chapter ids and non-level values are dropped; unknown role keys are dropped; garbage gives `{}`.

### P3.2 Pure helpers — `lib/rolePrefs.ts`

```ts
export type ChapterLevelsByRole = Partial<Record<Role, Record<string, ExperienceLevel>>>;

/** Sanitised per-role map; garbage → {}. Reuses parseChapterLevels' per-entry rules. */
export function parseChapterLevelsByRole(raw: string | null, validIds: readonly string[]): ChapterLevelsByRole;

/** P3.1 migration. `migrated` = the caller must write the new key and remove the legacy key. */
export function loadChapterLevelsByRole(
  byRoleRaw: string | null, legacyRaw: string | null, role: Role | null, validIds: readonly string[],
): { byRole: ChapterLevelsByRole; migrated: boolean };

/** Overrides in force: the role's set, or {} when role is null. Returns a shared frozen EMPTY for "none". */
export function chapterLevelsFor(byRole: ChapterLevelsByRole, role: Role | null): Readonly<Record<string, ExperienceLevel>>;

/** Immutable update of one role's set; `level: null` deletes; an emptied role map is removed. */
export function withChapterLevel(
  byRole: ChapterLevelsByRole, role: Role, chapterId: string, level: ExperienceLevel | null,
): ChapterLevelsByRole;
```

- Refactor `parseChapterLevels` so the per-entry filter is a private `sanitizeLevels(obj, validIds)` that both parsers share. `parseChapterLevels` stays exported (it is used for the legacy key).
- `planRoleChoice` keeps its signature and logic. Update the doc comment on `changeRole` to: `/** Persist the new role. Per-chapter overrides are kept per role and swap with it (supersedes D4). */`.
- `migrated` is `true` in cases 1–3 of P3.1 when the legacy key was present, else `false`.

### P3.3 App — `App.tsx:53-88`

```ts
const [levelsInit] = useState(() => loadChapterLevelsByRole(
  readStorage('be_guide_chapter_levels_by_role'), readStorage('be_guide_chapter_levels'),
  parseRole(readStorage('be_guide_role')), CHAPTERS.map(c => c.id),
));
const [chapterLevelsByRole, setChapterLevelsByRole] = useState(levelsInit.byRole);
useEffect(() => {
  if (!levelsInit.migrated) return;
  writeStorage('be_guide_chapter_levels_by_role', JSON.stringify(levelsInit.byRole));
  removeStorage('be_guide_chapter_levels');
}, [levelsInit]);
const chapterLevels = chapterLevelsFor(chapterLevelsByRole, role);
const levelInputs: LevelInputs = { role, baseLevel: experienceLevel, levelMode, chapterLevels };
```

- `handleChooseRole`: remove `persistChapterLevels({})`. Nothing else changes. The new role's set applies through `chapterLevelsFor`.
- `handleChapterLevelChange(chapterId, level)`: if `role === null`, return (the per-chapter switch is not rendered without a role, so this is a guard). Otherwise `next = withChapterLevel(chapterLevelsByRole, role, chapterId, level)`, set state and write the new key.
- Delete `persistChapterLevels` and the `setChapterLevels` state.
- `LevelInputs`, `resolveChapterLevel`, `planChapterLevelChoice` and GuideTab props are unchanged. GuideTab still receives the active role's flat map.
- **Role = null:** overrides are ignored (unchanged, `rolePerspective.ts:34`). Both role sets stay in storage. Choosing a role later restores that role's set.
- No XP (D5 unchanged).
- Also update the old spec in the same commit: in `docs/specs/2026-09-22-role-perspective.md`, append `Superseded by 2026-09-23-role-ux-fixes.md Phase 3.` to D4, and replace the §7 `be_guide_chapter_levels` row note with `legacy; migrated to be_guide_chapter_levels_by_role`.

### P3.4 Files

`lib/rolePrefs.ts` · `App.tsx` · `docs/specs/2026-09-22-role-perspective.md` (D4 and §7 note only) · tests below.

### P3.5 Tests — `lib/rolePrefs.test.ts`

- `planRoleChoice`: rename `:55` to `'a different role changes the role (overrides are kept per role)'`; the expectations are unchanged.
- `parseChapterLevelsByRole`: round-trips `{ biz: { s12: 'experienced' }, eng: { s2: 'experienced' } }`; drops unknown role keys (`{ pm: {...} }`), unknown ids and bad levels; `null`, non-JSON, arrays and `{ biz: 'x' }` give `{}` or drop that role.
- `loadChapterLevelsByRole`:
  - new key present + legacy present → the new key's map, `migrated: true`.
  - new key absent + legacy `{"s12":"experienced"}` + role `eng` → `{ eng: { s12: 'experienced' } }`, `migrated: true`.
  - new key absent + legacy + role null → `{}`, `migrated: true`.
  - neither → `{}`, `migrated: false`.
- `chapterLevelsFor`: null role → `{}` even when both sets exist; `biz` → the biz set; a missing role set → `{}`; the empty result is the same object across calls (`toBe`).
- `withChapterLevel`: sets without touching the other role; `null` deletes; deleting the last entry removes the role key; the input is not mutated.
- **Round trip (the R-4 scenario, pure).** Start `{}`, role eng. `withChapterLevel(…, 'eng', 's12', 'experienced')`. Then with `chapterLevelsFor(byRole, 'biz')`, `resolveChapterLevel` for s12 gives beginner/role. With `chapterLevelsFor(byRole, 'eng')`, it gives experienced/chapter.
- `planChapterLevelChoice` tests are unchanged.

### P3.6 Acceptance

1. Role Engineering, open s12, press `⚡ คุ้นงานแล้ว`. Switch the header role to `💼 Business`: s12 opens as beginner. Switch back to `💻 Engineering`: s12 opens as experienced with `กลับไปใช้ค่าตามสายงาน` visible.
2. Same as 1, with a reload between each switch: same result.
3. In role Business, set s6 to `⚡ คุ้นงานแล้ว`. Switch to Engineering and back: s6 is still experienced for Business, and Engineering's s12 override is intact.
4. Choose `ไม่ระบุ`: every chapter uses the global level. Choose Engineering again: the s12 override is back.
5. Legacy profile with `be_guide_role=eng` and `be_guide_chapter_levels={"s12":"experienced"}`: after load, s12 is experienced, `be_guide_chapter_levels_by_role` holds `{"eng":{"s12":"experienced"}}`, and `be_guide_chapter_levels` is gone.

---

## Phase 4 — Index search covers core concepts, with an empty state (I-04)

### P4.1 Pure search — **new** `lib/chapterSearch.ts`

```ts
/** Every string the index search reads for one chapter (lower-cased by the matcher). */
export function chapterSearchFields(ch: Chapter): string[];
/** Trimmed, case-insensitive substring match. Empty query matches everything. */
export function matchesChapterQuery(ch: Chapter, query: string, glossaryTerms: readonly string[]): boolean;
/** The index filter: query match AND role chip (`'all'`, exact roleTag, or roleTag 'all'). */
export function filterIndexChapters(
  chapters: Chapter[], query: string, roleFilter: string, glossaryTerms: readonly string[],
): Chapter[];
```

- Fields: `title`, `subtitle`, `enTerm`, `keyTakeaway`, `plainAnalogy`, each `jargonList[].term`, **plus** each `coreConcepts[].heading`, `coreConcepts[].detail`, `coreConcepts[].bulletPoints[]`, and each `commonPitfalls[].pitfall`.
- s15 also matches when any glossary term matches (today's rule, `GuideTab.tsx:337`). GuideTab passes `GLOSSARY.map(g => g.term)`, computed once at module level.
- The query is trimmed. Today `' qa'` with a leading space fails.
- The role-chip logic moves unchanged from `GuideTab.tsx:339-342`. The taxonomy clash is I-12 and out of scope.
- GuideTab replaces `329-345` with `const filteredChapters = filterIndexChapters(chapters, searchQuery, selectedRole, GLOSSARY_TERMS);`.

### P4.2 Empty state — **new** `components/guide/IndexEmptyState.tsx`

Props: `{ query: string; roleFiltered: boolean; onClear: () => void }`. Rendered by GuideTab in **both** index lists (desktop at 476, mobile drawer at 918) when `filteredChapters.length === 0`. Root carries `data-index-empty` and `role="status"`.

Literal copy:
- Line 1: `ไม่พบบทที่มีคำว่า "{query}"` (query trimmed).
- Line 2, when `roleFiltered` (`selectedRole !== 'all'`): `ลองกด "ทั้งหมด" หรือใช้คำอื่น`.
- Line 2, otherwise: `ลองคำที่สั้นลง หรือค้นเป็นภาษาอังกฤษ`.
- Button: `ล้างการค้นหา`. It calls `onClear`, which GuideTab wires to `setSearchQuery('')` and `setSelectedRole('all')`.

Styling follows the list's muted text (`text-xs text-neutral-500 dark:text-[#8e8e8e]`, padding `p-4`). The button uses the existing chip button classes.

### P4.3 Files

**new** `lib/chapterSearch.ts` · **new** `components/guide/IndexEmptyState.tsx` · `components/GuideTab.tsx` · tests below.

### P4.4 Tests

- **new** `lib/chapterSearch.test.ts`:
  - `user story` → the result includes `s14` (from the core concept) and `s2`.
  - `User Story` and `  user story  ` give the same result.
  - `15–20` → includes `s9`; `ด่วน` → includes `s10`.
  - A glossary-only term (pick one that `GLOSSARY` has and no chapter field contains, found by the test itself) → `['s15']`.
  - Empty and whitespace-only query → all chapters.
  - `filterIndexChapters(CHAPTERS, 'user story', 'pm', terms)` includes s2 and s14 (s14 has `roleTag: 'all'`).
  - `filterIndexChapters(CHAPTERS, 'zzzz-no-match', 'all', terms)` → `[]`.
- **new** `components/guide/IndexEmptyState.test.tsx` (`renderToStaticMarkup`):
  - query `ด่วนมาก`, `roleFiltered: false` → contains `ไม่พบบทที่มีคำว่า "ด่วนมาก"`, `ลองคำที่สั้นลง หรือค้นเป็นภาษาอังกฤษ`, `ล้างการค้นหา`, `data-index-empty`.
  - `roleFiltered: true` → contains `ลองกด "ทั้งหมด" หรือใช้คำอื่น`.

### P4.5 Acceptance

1. Type `user story` in the index: ch.14 `เอกสารสเปก 4 ชั้น` is listed.
2. Type `qwerty`: desktop and the 375px drawer both show the empty state. `ล้างการค้นหา` restores the full list and the `ทั้งหมด` chip.
3. With the `PM` chip active, type `canary`: the empty state line 2 reads `ลองกด "ทั้งหมด" หรือใช้คำอื่น`.

---

## Phase 5 — Role-round options of comparable length (I-05)

**Goal.** Option length no longer reveals the answer in the role rounds. Distractors become plausible reasoning (a real misconception with a reason), not strawmen.

### P5.1 Data — `data/quizQuestions.ts`, ids 9–20

Replace `options[i].text` with the table below. Index 0 is the correct option, as today. **`explanation`, `isCorrect`, `scenario`, `question`, `role`, `chapterId` and `xp` are unchanged.** Each new distractor keeps the error its explanation rebuts, so every explanation still fits (checked per row). Lengths are `[...text].length`.

| id | opt | text (literal) | len |
|---|---|---|---|
| 9 | 0 ✓ | `ตัดขอบเขต: ให้ทันแคมเปญเฉพาะคืนเงินกรณีของไม่ถึง ที่เหลือตามมาใน 2 สัปดาห์` | 74 |
| 9 | 1 | `ขอเลื่อนแคมเปญออกไป 2 สัปดาห์ เพื่อให้ปล่อยฟีเจอร์คืนเงินครบทุกข้อในรอบเดียว` | 76 |
| 9 | 2 | `รับปากว่าทันครบทุกข้อ แล้วให้ทีมทำโอทีช่วงสองสัปดาห์สุดท้ายก่อนแคมเปญ` | 69 |
| 9 | 3 | `ยืนตามตัวเลขที่ประเมินไว้ แล้วให้ PM ไปแจ้งทีมการตลาดว่าไม่ทันแคมเปญ` | 68 |
| 10 | 0 ✓ | `คิดเป็นเงิน: 40 ออเดอร์ × ราว ฿900 = ราว ฿36,000 ต่อเดือน แล้วเทียบกับงานหน้า Admin` | 83 |
| 10 | 1 | `แก้ทีหลัง เพราะ 40 ออเดอร์ต่อเดือนถือว่าน้อยมาก เมื่อเทียบกับยอดขายทั้งหมดของบริษัทในเดือนนั้น` | 94 |
| 10 | 2 | `ให้ฝ่ายการเงินตัดสินใจเอง เพราะเป็นเรื่องเงิน ส่วน Dev รับผิดชอบแค่เรื่องโค้ด` | 77 |
| 10 | 3 | `หยุดงานหน้า Admin แล้วแก้บั๊กทันทีโดยไม่ต้องบอกใคร เพราะบั๊กต้องมาก่อนเสมอ` | 74 |
| 11 | 0 ✓ | `รับได้ แต่งานลดเวลาคืนเงินจะช้าไป 3 วัน ให้ PM หรือหัวหน้าเลือกว่าอะไรสำคัญกว่า` | 79 |
| 11 | 1 | `รับทำเลย เพราะแค่ 3 วันไม่น่ากระทบเป้าทั้งไตรมาส และยังช่วยให้ Sales ปิดลูกค้ารายนี้ได้` | 87 |
| 11 | 2 | `ปฏิเสธ เพราะรายงานนี้ไม่อยู่ใน OKR ของทีม งานนอก OKR ต้องรอไตรมาสหน้า` | 69 |
| 11 | 3 | `รับไว้ แล้วแอบทำนอกเวลางาน เพื่อไม่ให้กระทบงานลดเวลาคืนเงินของทีม` | 65 |
| 12 | 0 ✓ | `ดู uptime จริงย้อนหลัง แล้วเสนอตัวเลขที่ต่ำกว่านั้นเพื่อมีระยะเผื่อ เช่น 99.9%` | 78 |
| 12 | 1 | `ตอบว่าได้ เพราะระบบแทบไม่เคยล่ม และ 99.99% ต่างจาก 100% แค่นิดเดียว` | 67 |
| 12 | 2 | `บอกว่าตัวเลขในสัญญาเป็นงานของ Sales และฝ่ายกฎหมาย ไม่เกี่ยวกับทีม Dev` | 69 |
| 12 | 3 | `รับตัวเลขไปก่อนเพื่อปิดดีล แล้วค่อยลงทุนเพิ่มให้ระบบถึง 99.99% หลังเซ็นสัญญา` | 76 |
| 13 | 0 ✓ | `ถามเหตุผลที่ PM ตัด เล่าว่าโค้ดที่ทำไปแล้วใช้ต่อได้แค่ไหน แล้วทำตามลำดับที่ตกลงกัน` | 82 |
| 13 | 1 | `ทำต่อให้เสร็จเงียบๆ เพราะทำไปครึ่งหนึ่งแล้ว ถ้าหยุดตอนนี้ เวลาที่ใช้ไปทั้งหมดจะเสียเปล่า` | 88 |
| 13 | 2 | `ลบโค้ดส่วนนั้นทิ้งทันทีเพื่อให้โค้ดสะอาด แล้วไปทำคืนเงินเต็มจำนวนต่อ` | 68 |
| 13 | 3 | `ขอให้ผู้ใช้โหวตว่าอยากได้ฟีเจอร์ไหนก่อน แล้วให้ทีมทำตามผลโหวต` | 61 |
| 14 | 0 ✓ | `สองฝ่ายวัดผลคนละแบบ Business ดูความพอใจของลูกค้า ส่วน Dev ดูความเสี่ยงของระบบ` | 77 |
| 14 | 1 | `Business ไม่เข้าใจเทคนิค จึงขอฟีเจอร์ที่เสี่ยงโดยไม่รู้ว่าระบบต้องรับอะไรบ้าง` | 77 |
| 14 | 2 | `Dev กังวลเกินไป เรื่องโกงเกิดน้อย ควรทำตามที่ Business ขอแล้วค่อยดูผล` | 69 |
| 14 | 3 | `สเปกเขียนไม่ละเอียดพอ ถ้าเขียนทุกเงื่อนไขให้ครบตั้งแต่แรกก็ไม่มีเรื่องให้เถียง` | 78 |
| 15 | 0 ✓ | `ใช้ยอดแคมเปญปีก่อนประเมิน แล้วเขียนในสเปกว่ารองรับกี่คนพร้อมกัน ตอบภายในกี่วินาที` | 81 |
| 15 | 1 | `บอกว่าเป็นเรื่องเทคนิค ให้ Dev ประเมินจำนวนคนและความเร็วเองตามที่เห็นสมควร` | 74 |
| 15 | 2 | `เขียนในสเปกว่า "ต้องเร็วที่สุดและรองรับได้ไม่จำกัด" เพื่อไม่ให้ระบบล่มในวันแคมเปญ` | 81 |
| 15 | 3 | `ข้ามเรื่องนี้ไปก่อน แล้วค่อยปรับระบบถ้าเจอปัญหาหลังเปิดใช้งานจริง` | 65 |
| 16 | 0 ✓ | `ถือว่ายังไม่เสร็จ ถ้าต้องโชว์ ให้เดโมบนระบบทดสอบ และบอกลูกค้าว่ายังไม่เปิดใช้จริง` | 81 |
| 16 | 1 | `ปล่อยขึ้นระบบจริงเลย เพราะ Dev ยืนยันแล้วว่าใช้ได้ ส่วนเทสต์ค่อยตามมาทีหลัง` | 75 |
| 16 | 2 | `ตัดเรื่องเทสต์ออกจาก DoD เฉพาะ Sprint นี้ แล้วกลับไปใช้ DoD เต็มตั้งแต่ Sprint หน้า` | 83 |
| 16 | 3 | `ให้ Dev ทำโอทีคืนนี้ เขียนเทสต์ให้ครบก่อนเช้า แล้วปล่อยขึ้นระบบจริงก่อนโชว์` | 75 |
| 17 | 0 ✓ | `ชิ้นเล็กพังก็รู้ทันทีว่าเพราะอะไรและถอยกลับได้เร็ว ก้อนใหญ่ต้องไล่หาต้นเหตุทั้งเดือน` | 84 |
| 17 | 1 | `จริง ปล่อยบ่อยเสี่ยงกว่า แต่คุ้มถ้าทีม Dev อยากลองวิธีใหม่และรับผิดชอบเอง` | 73 |
| 17 | 2 | `ปล่อยบ่อยดี เพราะลูกค้าจะได้เห็นฟีเจอร์ใหม่ทุกวัน และธุรกิจก็ขายของใหม่ได้เร็วขึ้นมาก` | 85 |
| 17 | 3 | `ไม่พังบ่อยขึ้น เพราะพอมีท่ออัตโนมัติแล้วก็ไม่ต้องพึ่งเทสต์อีก ระบบตรวจให้เอง` | 76 |
| 18 | 0 ✓ | `ให้เวลาประจำทุก Sprint และขอผลที่วัดได้ เช่น แก้เงื่อนไขเร็วขึ้น บั๊กหลุดน้อยลง` | 79 |
| 18 | 1 | `ไม่ให้ เพราะ Refactor ไม่ได้เพิ่มฟีเจอร์ที่ลูกค้าเห็น ไว้ทำตอนโรดแมปว่างก่อน` | 76 |
| 18 | 2 | `หยุดทำฟีเจอร์ทั้งหมด 1 เดือน แล้ว Refactor ให้จบในรอบเดียว จะได้ไม่ค้างคา` | 73 |
| 18 | 3 | `ให้ Refactor ได้ แต่ต้องทำนอกเวลางาน เพื่อไม่ให้กระทบฟีเจอร์ในโรดแมป` | 68 |
| 19 | 0 ✓ | `ทำ Blameless Postmortem: พังเพราะอะไร กระทบใคร กันซ้ำยังไง แล้วสรุปให้ผู้บริหาร` | 79 |
| 19 | 1 | `ชี้ตัว Dev ที่ปล่อยโค้ดล่าสุด เพราะผู้บริหารต้องการคนรับผิดชอบที่ชัดเจนและจับต้องได้` | 84 |
| 19 | 2 | `ขอให้ทีมสัญญาว่าจะไม่ล่มอีกเลย แล้วรายงานผู้บริหารว่าแก้เรียบร้อยแล้ว` | 69 |
| 19 | 3 | `ปล่อยผ่าน เพราะทีมกู้คืนได้ใน 40 นาที ถือว่าเร็วพอแล้วสำหรับระบบนี้` | 67 |
| 20 | 0 ✓ | `เวลาส่วนใหญ่อยู่ที่ตั้งโจทย์ รีวิวโค้ด และทดสอบว่าคืนเงินถูกทุกกรณี ไม่ใช่การพิมพ์` | 82 |
| 20 | 1 | `Dev ยังใช้ AI ไม่คล่อง เลยต้องเผื่อเวลาเรียนรู้เครื่องมือใหม่ไปด้วย` | 67 |
| 20 | 2 | `Dev เผื่อเวลากันพลาดไว้มาก ที่จริงถ้าให้ AI เขียนทั้งหมด วันเดียวก็พอ` | 69 |
| 20 | 3 | `AI เขียนได้แค่โค้ดง่ายๆ งานคืนเงินที่ซับซ้อนแบบนี้จึงต้องให้ Dev เขียนเองทั้งหมด` | 80 |

Result: the correct option is strictly longest in **1/6** eng questions (id 12) and **2/6** biz questions (ids 18, 20). The largest correct/longest-distractor ratio is **1.04** (was 3.70). Content that left a correct option (for example, id 12's "or say what it costs to reach 99.99%", id 14's "find a way that serves both") remains in that option's explanation.

The writer must re-measure with `[...text].length` after pasting. Editors can normalise spaces or Thai characters, and the lengths above assume the literal strings.

### P5.2 Files

`data/quizQuestions.ts` (ids 9–20 option texts only) · `data/quizQuestions.test.ts`.

### P5.3 Tests — `data/quizQuestions.test.ts`

```ts
const len = (s: string) => [...s].length;
const correctIsLongest = (q: QuizQuestion) => {
  const c = q.options.find(o => o.isCorrect)!;
  return q.options.every(o => o === c || len(c.text) > len(o.text));
};
```

- `it.each(['basics', 'biz', 'eng'])('%s round: the correct option is not always the longest', …)`: `getQuizRound(QUIZ_QUESTIONS, round).filter(correctIsLongest).length < round size`.
- `it.each(['biz', 'eng'])('%s round: the correct option is the longest in at most 2 questions', …)`: `≤ 2`.
- `it('role-round correct options are at most 1.1× the longest distractor', …)`: over ids 9–20. The failure message lists `q<id>: <ratio>`.
- The existing structure, coverage and 160-character explanation tests stay unchanged.

### P5.4 Acceptance

1. `bun run test` passes the three new tests. Reverting any one row to its old text fails at least the 1.1× test.
2. In the Quiz tab, play `สาย Engineering` and `สาย Business`: no option is visibly longer than the rest. The answer and explanation still agree for each of the 12 questions (read each once).

---

## 6. Verification (every phase)

1. `bun run lint` (tsc checks the test files too), `bun run test` and `bun run build` pass.
2. Browser check with `bun run dev` at 1440px and 375px, on a clean profile with the console open: run the phase's acceptance steps. Check for no console errors and no horizontal scroll at 375px (the concept `ดูรายละเอียด` buttons and the index empty state).
3. Phase 3 also: a legacy profile (`be_guide_role`, `be_guide_chapter_levels`, stats, badges) loads with no onboarding and is migrated as in P3.6.5.
4. Keyboard: `ดูรายละเอียด` and `ล้างการค้นหา` are reachable with Tab and work with Enter/Space. `ดูรายละเอียด` exposes `aria-expanded`.
5. Suggested commit order: one commit per phase (P1 → P5), in priority order. Each phase is independent except that P2's copy rationale assumes P1.

## 7. Storage keys (changes only)

| key | phase | format | notes |
|---|---|---|---|
| `be_guide_chapter_levels_by_role` | 3 | JSON `{ biz?: Record<id, level>, eng?: Record<id, level> }` | new; kept across role switches and "no role" |
| `be_guide_chapter_levels` | 3 | legacy JSON map | read once, migrated, removed |

Per-concept `ดูรายละเอียด` state and the index empty state are component state only (not persisted).

## 8. Decisions (made while specifying)

| # | Decision | Rationale |
|---|---|---|
| D1 | Beginner Core gains `coreConcepts` after `otherSide`, rendered compact (heading + `detail`; bullets and inline sections behind `ดูรายละเอียด`). | All 3 Partials and the missing 15–20% trace to core concepts in Deep (I-01). The compact form adds about 1 minute, not 3, so the round-1 overload fix (§6e) holds. Every must-have probed in round 2 (15–20%, "yes, if…", cascade, User Story value) sits in a heading or `detail`, not in a bullet. |
| D2 | Beginner `pitfalls` moves Deep → Apply, not to Core. | Round-1 §6e placed pitfalls in Apply. No teach-back must-have is a pitfall. Core stays at most one section longer than today. |
| D3 | Minutes become level-aware only for beginner `coreConcepts` (1 min), through `sectionMinutes`. | The layer header must stay honest. Changing `SECTION_META` would misstate the experienced layout, where concepts render in full. |
| D4 | Experienced layout unchanged. | Round 2 raised no layout issue for experienced readers. Tee's issues were boilerplate content (I-11). |
| D5 | Business track `[2, 1, 14, 4, 6, 9, 10, 11]`, 94 min. s5 and s13 leave, s2 and s14 join. | It starts on a Business-home chapter, which makes a "your side" statement true. It covers every business-persona goal chapter and removes the one rated fit 2. It is 4 minutes shorter than today (Nok flagged length). Order: the hand-off (s2 → s1), then what you write (s14, s4), then what Engineering does with it (s6, s9, s10), then the friction wrap-up (s11). |
| D6 | s3 UX stays off the Business track. | It is the reader's own side, adds 10 minutes, and no business persona asked for it. s2 alone gives the familiar entry. The index still lists it. |
| D7 | Eng track: same chapters, s16 moves to step 1 (was ch.1). | The eng check found no missing or off-goal chapter. ch.1-first was rated fit 3 by both engineers (I-07). One reorder fixes it and makes the card phrase `ขึ้นมาอยู่ต้นเส้นทาง` literally true. It does not change minutes. |
| D8 | The biz card line becomes a route statement (`เริ่มจากบท PM ที่คุณคุ้น…`) and drops the level claim. The eng line is unchanged. | The old line was true for no track chapter. After P1 "starts from core concepts" is no longer a distinguishing claim, and it conflicted with beginners (Mint). |
| D9 | Header tooltip `บทอีกฝั่ง` → `บทอื่น`. | Shared chapters also open as beginner (D3 of the role spec). This is the same "copy matches no chapter" class as I-02, and a one-word fix. |
| D10 | Per-role overrides use a **new** key, `be_guide_chapter_levels_by_role`, with a one-time migration. The legacy key is not reused. | A new key keeps the parsers simple, with no shape sniffing. Migration is idempotent, and a stale legacy key can never be re-read after removal. |
| D11 | `levelMode` stays global, not per role. | It is shown in the header, so it is never hidden state. D4's "keep `levelMode`" part is unchanged. Only the override half is superseded. |
| D12 | "No role" keeps both role sets in storage and ignores them. | "Switching back restores" should hold for a detour through "no role" too. Overrides already have no effect without a role. |
| D13 | Legacy overrides with no stored role are dropped at migration. | Under the old code they were already inert, and D4 cleared them on a switch to "no role". There is no role to attach them to. |
| D14 | Search extraction into `lib/chapterSearch.ts`. Adds core-concept heading/detail/bullets and pitfall titles. No snippets or jump-to-term. | This makes search unit-testable in the node env. These fields hold the terms personas searched for (`user story`, `15–20`, `ด่วน`). Snippets and jump are a larger UX change (a follow-up). |
| D15 | The empty-state button clears both the query and the role chip. | A hidden chip filter is the other way to get zero results. One action always restores the full list. |
| D16 | Quiz rebalance edits option text only. Explanations and framing roles are unchanged. The correct option may still be longest in ≤ 2 of 6 per role round. | The explanations still rebut each rewritten distractor, which keeps the diff and the review small. Forcing "never longest" would itself become a cue (the correct answer is never the longest). ≤ 2/6 is near the 1.5/6 expected by chance with 4 options. |
| D17 | Guard tests: every round "not always longest"; role rounds ≤ 2 longest and ratio ≤ 1.1. The basics round is not rebalanced here. | Scope is the role rounds (I-05). Basics already passes "not always" (7/8), and its rebalance is a follow-up. |
| D18 | No visible `เฉพาะบทนี้` label or clear-toast in Phase 3. | With per-role storage, nothing is cleared, so the toast has nothing to report. The label is separate polish (a follow-up). |

## 9. Risks

- **Core length for s11.** The beginner s11 Core becomes faq 6 + primer 2 + otherSide 2 + concepts 1 + jargon 2 + diagram 3 = 16 min. The FAQ override is an earlier owner decision (layers spec D10), so it is left as is. Watch it in the next test round.
- **Stale acceptance text.** Role-perspective P1.9.2 ("s2 opens with จุดเริ่มต้น, ศัพท์จำเป็น") describes the old beginner Core. Phase 1 changes that by design. The old spec is not edited beyond D4/§7.
- **Thai length drift.** P5 lengths are code-point counts of the literal strings. Re-measure after editing, as the tests do.

## 10. Follow-ups (out of scope)

- **I-04b**: search result snippets and jump-to-term in the chapter.
- **I-05b**: vary the framing role in the role rounds (BA/support for business; lead/EM for engineering), and rebalance the basics round lengths (7/8 longest).
- **I-06**: let the first-visit card set level alongside role (`💻 Engineering · 🌱 ใหม่ / ⚡ มีประสบการณ์`).
- **I-03b**: visible `เฉพาะบทนี้` label next to the per-chapter switch (today it is aria-label only).
- **I-08**: add `chapterId` to the 8 basics questions and list missed questions on the results screen.
- **I-09**: reader-aware primer subtitle; `เข้าใจได้แม้ไม่เคยเขียนโค้ด` is wrong for engineers on Business-home chapters.
- **I-10**: branch the results header on score; static `ยินดีด้วย!` shows even at 1/8.
- **I-11**: bespoke friction playbooks for s16–s19, or hide the template; drop the generic Role Mindset there.
- **I-12**: one taxonomy (`home`) for the `ธุรกิจ` chip and the lens banner; s15 home → `shared`.
- **I-13**: lens-banner reset label names the real fallback (`กลับไปใช้ระดับจากแถบบน` when `levelMode !== 'auto'`).
- **I-14**: order the ch.11 FAQ groups by role.
- **I-15**: content fixes: ch.18 cascade line as an outcome, one burn term, Churn in ch.18 jargon, a non-dev ch.14 beginner analogy.
- **I-16**: `first_step` badge copy vs unlock trigger.
- **I-17**: resume to the last section via `#/ch/N/<section>`.
- **I-18**: two reading counters side by side (`อ่านจบแล้ว … จาก 19 บท` and track `อ่านแล้ว n/8`).
- **I-19**: verdict word in role-round feedback.
- **I-20**: quiz result lost after leaving the Quiz tab (unconfirmed; trace first).
- **I-21**: dark default on a fresh profile (by design; revisit only with evidence).
- **I-07**: covered by D5 and D7 (neither role track starts at ch.1); the level tracks still do, which is unchanged.
