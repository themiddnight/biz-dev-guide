# Spec: Role perspective — role origin, the other side's view, two seats, business chapters, role quiz

- Date: 2026-09-22
- Status: Ready for implementation. The owner asked for no further questions; every open choice is decided in §8 with its rationale.
- Branch: `feat/role-perspective` @ `8d66f4c`
- Target app: `/Users/Pathompong/Sites/Personal/biz-dev-guide/src`
- UI copy is **Thai-first** and follows `2026-09-22-concise-copy.md` (R1–R9). Every Thai string quoted in this spec is the literal copy to ship. Spec prose is English.

## 0. Background and verified facts

Commit `a212913` removed a Biz/Eng/Both toggle (`AudienceMode`). It was removed because it changed almost nothing. `ChapterHero` showed or hid `businessNote`/`engineerNote`, `FrictionPlaybookCard` hid one golden script, and `FrictionFaqSection` reversed the group order and swapped a subtitle. The notes are advice to the reader's *own* role ("ส่งปัญหาและเป้าหมายธุรกิจให้ทีม…"). They do not explain the other side. Also, 13 of the 15 chapters are about engineering process, so an engineer finds almost no business content.

**Design rule (applies to every phase).** Switching role must change **what** is explained or the **reading order**. It must never just swap one sentence. Each phase states how it meets this rule.

**Verified code facts** (branch `feat/role-perspective`, commit `8d66f4c`):

| Fact | Where |
|---|---|
| `ExperienceLevel = 'beginner' \| 'experienced'` is the only reader dimension. There is no role type since `a212913`. | `types.ts:3`; `git show a212913` |
| Level state initialises from `be_guide_exp_level`, else `'beginner'`. `levelChosen` is true iff that key exists, and it gates the first-visit card. | `App.tsx:37-41` |
| `handleChooseInitialLevel` writes the key with no XP. `handleExperienceLevelChange` writes the key and pays mode XP once per level (`xpKey.mode`). | `App.tsx:44-48`, `168-180`; `lib/xp.ts:8` |
| Storage keys: `be_guide_exp_level` and `be_guide_last_chapter` go through the guarded `readStorage`/`writeStorage`. `be_guide_stats`, `be_guide_badges` and `be_guide_theme` use raw `localStorage`. | `lib/storage.ts:1-16`; `hooks/useChapterRoute.ts:33`; `App.tsx` |
| `getChapterLayout(level, chapter)` takes one global level. GuideTab calls it with the global `experienceLevel`. | `sectionLayers.ts:139-144`; `GuideTab.tsx:167` |
| `LAYER_CONFIG` has exactly 14 keys per level. A test asserts the 14. | `sectionLayers.ts:16-27`; `sectionLayers.test.ts:23` |
| Lens banner: "Active Mode", with two buttons that call `onExperienceLevelChange` (global) and a one-line hint per level. | `GuideTab.tsx:588-631` |
| Header level switcher: `Beginner`/`Experienced` buttons, the same global handler. It shows on desktop and mobile (one flex-wrap row). | `Header.tsx:192-224` |
| Tracks are keyed by `ExperienceLevel` only: beginner `[1,2,3,4,6,7,11,14]` (92 min), experienced `[11,1,6,9,12,13,14]` (83 min). | `readingTracks.ts:3-11`; `readingTracks.test.ts:5-6,24-27` |
| `resolveTrack(level, …)` is used by GuideTab (track footer 209, first visit 221), `TrackPanel` (16, 22, 24), `TrackEndCard` (34) and `FirstVisitCard` (31). | as listed |
| First visit card: title `เริ่มจากตรงไหนดี?`, two level options, skip = beginner. A chosen level jumps to its track's first chapter unless the page loaded from a hash. | `FirstVisitCard.tsx:5-38`; `GuideTab.tsx:218-225` |
| `ChapterHero` always renders a two-column grid `มุมมองฝั่ง Business` / `มุมมองฝั่ง Engineer` holding `businessNote` / `engineerNote`. | `ChapterHero.tsx:81-102` |
| `Chapter` required fields: `id, num, title, subtitle, roleTag, businessNote, engineerNote, keyTakeaway, plainAnalogy, readTime`. `roleTag` union: `all pm ux ba sa eng qa devops support friction ai`. | `types.ts:193-219` |
| `CHAPTERS` = `chapters1_5 + chapters6_10 + chapters11_15`. `frictionPlaybook`, `contentSections` and `heroFigure` are merged in from side maps. | `chaptersData.ts:9-22` |
| Chapter homes by `roleTag`: s2 `pm`, s3 `ux`, s4 `ba`, s5 `sa`, s6 `eng`, s7 `qa`, s8 `devops`, s9 `eng`, s10 `support`, s11 `friction`, s13 `ai`; s1, s12, s14 and s15 are `all`. | `data/chapters/*.ts` |
| Every chapter s1–s15 has a refund hero figure with one neutral `caption`. The s5 Diagram section also renders `refund-swimlane` + `refund-sequence`. | `chapterHeroFigures.ts:3-64`; `visualFirst.test.ts:6-22`; `diagramFamilies.ts` |
| `HeroFigure` renders the figure, the caption and a `💡 analogy` line. It has no state. | `HeroFigure.tsx:11-26` |
| Refund figures that are engineering artefacts: s7 test run (`RefundTestReport`), s8 deploy log (`RefundDeployLog`), s9 PR diff (`RefundDebtDiff`), s13 AI PR review (`RefundAiReview`). The others are shared artefacts (chat, backlog, screen, spec, C4, board, dashboards, docs). | doc comments in `figures/Refund*.tsx` |
| Global role content already exists: `ROLE_MINDSETS` (`whatTheyCareAboutMost`, `howTheyMeasureSuccess`…). It is generic (not per chapter) and renders as the `mindset` section in Deep. | `roleMindsets.ts:3,17,34`; `sectionLayers.ts:20,25` |
| Friction playbooks have `businessFrustration`/`engineerFrustration` and golden scripts, but real playbooks exist for only 8 chapters. | `frictionPlaybooks.ts`; `types.ts:172-181` |
| Quiz: 8 questions, ids 1–8, `role` ∈ PM, BA, Dev, SA, QA, DevOps, Bridge ×2. Every reader gets all 8 in a fixed order. Options are shuffled once in `useState`. | `quizQuestions.ts`; `QuizTab.tsx:24-45` |
| `quiz_master` unlocks at `score >= QUIZ_QUESTIONS.length * 0.8`, which is the full bank size, not the round played. XP is claimed per question id (`quiz:<id>`). | `App.tsx:249-266` |
| `deep_scholar` unlocks at `readChapters.length >= CHAPTERS.length`. Its description lists PM…Support. | `App.tsx:216-219`; `badgesData.ts:37-43` |
| Hard-coded chapter count "15": `Header.tsx:152` (`Guide [15]`), `GamificationTab.tsx:111` (`/15`), `GuideTab.tsx:318, 332, 379, 521, 758`. | grep |
| Index role filter chips: all, pm, ux, ba, sa, eng, qa, friction. A chapter with `roleTag: 'all'` matches every filter. | `GuideTab.tsx:405-412, 791-798, 294-297` |
| Glossary: 99 terms (6 with `origin: 'app'`), 13 categories, all SDLC topics. Each term has one `definition`; only 5 have `plain`. There is no audience field. Business terms present: BRD, SOW, SLA, Stakeholder, RACI, OKR/KPI, MVP, Roadmap, Retention, Churn, Adoption rate. **No money terms**: revenue, margin, CAC, LTV, runway, P&L, ROI and budget all return 0 hits. | `glossary.ts:9-51`, grep |
| `ChapterDiagram` returns `null` for ids without a widget, so new chapters pass `diagramWidgets.test.tsx` automatically. | `ChapterDiagram.tsx:1119-1121` |
| Tests that hard-code the chapter set: `sectionLayers.test.ts:98` (`toHaveLength(15)`), `:101-102` (diagram 13, not s1), `:109` (no diagram tool: `['s1','s14']`); `visualFirst.test.ts` (hero map of 15, "limits hero figures"). | as listed |
| Test runner: vitest, node environment. Component tests use `renderToStaticMarkup` (see `diagramWidgets.test.tsx`). `lint` = `tsc --noEmit`. | `package.json:12-13` |

## 1. Shared model — `src/data/rolePerspective.ts` (pure, no React)

```ts
import type { Chapter, ExperienceLevel } from '../types';

export type Role = 'biz' | 'eng';
export type ChapterHome = Role | 'shared';
export type LevelMode = 'auto' | ExperienceLevel;

export const ROLES: readonly Role[] = ['biz', 'eng'];
export const otherRole = (r: Role): Role => (r === 'biz' ? 'eng' : 'biz');

/** Thai-first labels. `person` follows R8 (Dev for the person). */
export const ROLE_META: Record<Role, { origin: string; side: string; person: string; icon: string }> = {
  biz: { origin: 'ฉันมาจากสาย Business', side: 'ฝั่ง Business', person: 'Business', icon: '💼' },
  eng: { origin: 'ฉันมาจากสาย Engineering', side: 'ฝั่ง Engineering', person: 'Dev', icon: '💻' },
};

export interface LevelInputs {
  role: Role | null;
  baseLevel: ExperienceLevel;                         // existing be_guide_exp_level
  levelMode: LevelMode;                               // global override when role is set
  chapterLevels: Readonly<Record<string, ExperienceLevel>>; // per-chapter overrides
}

export type LevelSource = 'base' | 'chapter' | 'global' | 'role';

export function resolveChapterLevel(i: LevelInputs, chapter: Pick<Chapter, 'id' | 'home'>):
  { level: ExperienceLevel; source: LevelSource };
```

Resolution order (first match wins):

1. `role === null` → `{ baseLevel, 'base' }`. This is today's behaviour, and per-chapter overrides are ignored.
2. `chapterLevels[chapter.id]` → `'chapter'`.
3. `levelMode !== 'auto'` → `{ levelMode, 'global' }`.
4. `home === role` → `experienced`; `home === 'shared'` → `beginner`; otherwise `beginner`. Source `'role'`.

Also export `getActiveTrackKey(role, baseLevel): TrackKey` (= `role ?? baseLevel`).

---

## Phase 1 — Role origin drives per-chapter level and track order

**Design-rule check:** a Business reader opening s6 gets primer → jargon → diagram. A Dev opening s6 gets core concepts → pitfalls → diagram. The track order differs too.

### P1.1 Data

- `types.ts`: `Chapter` gains **required** `home: ChapterHome`. Write it inline in each chapter literal, next to `roleTag`.

| home | chapters | why |
|---|---|---|
| `biz` | s2 (PM), s3 (UX) | Product decisions made before code. An engineer is the outsider here. |
| `eng` | s5, s6, s7, s8, s9, s10, s13, s15 | Engineering process and artefacts. s15 translates tech jargon, so business readers are the outsiders. |
| `shared` | s1, s4, s11, s12, s14 | These are about the hand-off itself. s4 mixes a business role (BA) with engineering NFR. |

Phase 4 adds s16–s19 as `biz`.

### P1.2 State, persistence, handlers — `App.tsx`

| key | values | default when absent | written by |
|---|---|---|---|
| `be_guide_role` | `biz` \| `eng` | no role (today's behaviour) | first-visit role choice, header role control |
| `be_guide_level_mode` | `auto` \| `beginner` \| `experienced` | `auto` | header level control while a role is set |
| `be_guide_chapter_levels` | JSON `Record<chapterId, ExperienceLevel>` | `{}` | lens-banner per-chapter buttons |
| `be_guide_exp_level` | unchanged | `beginner` | unchanged (used when role is null) |

- All four go through `readStorage`/`writeStorage`. Add a pure parser in `src/lib/rolePrefs.ts`: `parseRole`, `parseLevelMode`, `parseChapterLevels(raw, validIds)`. Each returns its default on garbage. `parseChapterLevels` drops unknown ids and non-level values.
- `showFirstVisit = !levelChosen && role === null`. A returning user with `be_guide_exp_level` set never sees onboarding again.
- `handleChooseRole(role: Role | null)`: set the role, write the key (`null` removes it: add `removeStorage` to `storage.ts`) and clear `chapterLevels` (see D4). No XP; a setting is not a learning action (same policy as bookmarks).
- `handleLevelModeChange(mode)`: set and persist. No XP.
- `handleChapterLevelChange(chapterId, level | null)`: `null` deletes the override. Persist. No XP.
- `handleExperienceLevelChange` is unchanged and still pays mode XP. It is reachable only while role is null.

### P1.3 GuideTab

- Props: replace `experienceLevel` with `levelInputs: LevelInputs` plus `onChooseRole`, `onLevelModeChange`, `onChapterLevelChange`. Keep `onExperienceLevelChange`.
- `const { level: chapterLevel, source } = resolveChapterLevel(levelInputs, activeChapter)`. Use `chapterLevel` in `getChapterLayout` (167) and `ChapterHero` (586). The re-derive effect already fires on `layout` change, so a per-chapter switch re-opens Core.
- `trackKey = getActiveTrackKey(role, baseLevel)`. Use it for `resolveTrack` (209), `TrackPanel` (386, 774), `TrackEndCard` (724).

**Lens banner (588-631).** When role is null it is unchanged. When a role is set, it is replaced by:

- Line 1, the chapter's status:
  - `home === role`: `"บทนี้เป็นงาน{ROLE_META[role].side} · เปิดแบบคนคุ้นงาน"`
  - `home === 'shared'`: `"บทนี้เป็นงานที่สองฝั่งทำร่วมกัน · เปิดแบบมือใหม่"`
  - otherwise: `"บทนี้เป็นงาน{ROLE_META[otherRole(role)].side} · เปิดแบบมือใหม่"`
  - When `source === 'global'`, replace the part after `·` with `"ใช้ระดับเดียวกันทุกบท"`.
- Two buttons for this chapter only: `🌱 มือใหม่` / `⚡ คุ้นงานแล้ว`. The active one is `chapterLevel`. They call `onChapterLevelChange(id, level)`.
- When `source === 'chapter'`, show a text button `กลับไปใช้ค่าตามสายงาน`, which calls `onChapterLevelChange(id, null)`.
- The existing per-level hint line stays, keyed on `chapterLevel`.

### P1.4 Header — `Header.tsx:192-224`

- New props: `role`, `onChooseRole`, `levelMode`, `onLevelModeChange`.
- **Role group** (always shown, left of the level group). Segmented control, `aria-label="สายงานของคุณ"`, three buttons: `💼 Business` · `💻 Engineering` · `ไม่ระบุ`. The `title` attributes use the `ROLE_META.origin` strings.
- **Level group:**
  - role null: the existing `Beginner`/`Experienced` buttons, unchanged.
  - role set: three buttons `ตามสายงาน` · `Beginner` · `Experienced`, bound to `levelMode`. The `title` of `ตามสายงาน` is `"บทฝั่งคุณเปิดแบบคุ้นงาน บทอีกฝั่งเปิดแบบมือใหม่"`.
- At 375px both groups wrap onto their own row. Button text stays `text-xs`. Each button is at least 32px tall (existing `py-1` + icon).

### P1.5 First-visit card — `FirstVisitCard.tsx`

- Title unchanged: `เริ่มจากตรงไหนดี?`
- Primary row, two role cards (`data-first-visit-role`):
  - `💼 ฉันมาจากสาย Business` — line `"บทฝั่ง Engineering จะเริ่มจากพื้นฐาน บทฝั่งคุณเริ่มจากแนวคิดหลัก"`.
  - `💻 ฉันมาจากสาย Engineering` — line `"บทฝั่ง Business จะเริ่มจากพื้นฐาน และขึ้นมาอยู่ต้นเส้นทาง"`.
  - Each card keeps its track line: `เส้นทาง: บท … · ≈ N นาที` (from `resolveTrack(role)`).
- Secondary row, label `ไม่ระบุสาย:`, then the two existing level buttons as compact buttons (the labels are unchanged; drop their description lines).
- Skip link unchanged: `ข้ามไปก่อน (ใช้โหมดมือใหม่)`.
- A role choice calls `onChooseRole(role)` and then the same jump logic as `handleFirstVisitChoice` (hash wins; open the index drawer below 1024px). It jumps to the first chapter of `resolveTrack(role)`.

### P1.6 Tracks — `readingTracks.ts`

```ts
export type TrackKey = ExperienceLevel | Role;
export const TRACK_CHAPTER_NUMS: Record<TrackKey, readonly number[]> = {
  beginner:    [1, 2, 3, 4, 6, 7, 11, 14],
  experienced: [11, 1, 6, 9, 12, 13, 14],
  biz:         [1, 4, 5, 6, 9, 10, 11, 13],   // 98 min: how software gets built, broken and fixed
  eng:         [1, 2, 3, 4, 12, 11, 14, 9],   // 92 min: business-side chapters first
};
TRACK_META.biz = { title: 'เส้นทางคนสาย Business', description: 'เข้าใจว่าทีม Engineering ทำงานยังไง ตั้งแต่สเปกถึงวันที่ระบบล่ม' };
TRACK_META.eng = { title: 'เส้นทางคนสาย Engineering', description: 'เริ่มจากฝั่ง Business: ใครตัดสินใจ ทำไมต้องรีบ แล้วค่อยคุยเรื่องหนี้เทคนิค' };
```

`resolveTrack`, `TrackPanel`, `TrackEndCard` and `FirstVisitCard` take a `TrackKey`. `data-track-panel` carries the key. Phase 4 changes `eng` (P4.3).

### P1.7 Phase 1 files

`types.ts` · `data/chapters/chapters1_5.ts`, `chapters6_10.ts`, `chapters11_15.ts` (`home`) · **new** `data/rolePerspective.ts` · **new** `lib/rolePrefs.ts` · `lib/storage.ts` (`removeStorage`) · `data/readingTracks.ts` · `App.tsx` · `components/Header.tsx` · `components/GuideTab.tsx` · `components/guide/FirstVisitCard.tsx`, `TrackPanel.tsx`, `TrackFooter.tsx` · tests below.

### P1.8 Phase 1 tests

- **new** `data/rolePerspective.test.ts`:
  - Every chapter has a valid `home`, and the table in P1.1 matches exactly.
  - `resolveChapterLevel`:
    - role null ignores `chapterLevels` and `levelMode` → `baseLevel`/`'base'`.
    - eng + s6 → experienced/role; eng + s2 → beginner/role; biz + s6 → beginner; biz + s2 → experienced; any role + s11 → beginner.
    - A chapter override beats `levelMode`; `levelMode` beats home.
  - `otherRole` is an involution.
  - `getActiveTrackKey`.
- **new** `lib/rolePrefs.test.ts`: valid values round-trip; garbage, `null` and non-JSON give defaults; unknown chapter ids and bad levels are dropped.
- `readingTracks.test.ts`:
  - `resolveTrack('biz')` = `['s1','s4','s5','s6','s9','s10','s11','s13']`, 98 min.
  - `resolveTrack('eng')` = `['s1','s2','s3','s4','s12','s11','s14','s9']`, 92 min.
  - Every eng-track chapter with `home: 'biz'` comes before every eng-track chapter with `home: 'eng'`.
  - Level tracks unchanged.
- `sectionLayers.test.ts`: `getChapterLayout(resolveChapterLevel({role:'eng',…}, s6).level, s6)` core = `['coreConcepts','pitfalls','diagram']`, and for `role:'biz'` it is `['primer','jargon','diagram']`.

### P1.9 Phase 1 acceptance

1. Fresh profile: the first-visit card shows two role cards, the "ไม่ระบุสาย" level row and skip. Choosing Engineering opens s1 and the track panel titled `เส้นทางคนสาย Engineering`.
2. With role eng: s6 opens with Core = แนวคิดหลัก, กับดัก, แผนภาพ; s2 opens with จุดเริ่มต้น, ศัพท์จำเป็น. The banner states the side.
3. In the banner on s2, `⚡ คุ้นงานแล้ว` re-lays s2 only; s3 is unaffected. It persists across reloads, and `กลับไปใช้ค่าตามสายงาน` restores it.
4. Header `Beginner` with role set: every chapter uses beginner; the banner says `ใช้ระดับเดียวกันทุกบท`.
5. Header `ไม่ระบุ`: behaviour is identical to today (layout, track, banner, XP on level switch).
6. A legacy profile with only `be_guide_exp_level=experienced` sees no onboarding and today's experience.

---

## Phase 2 — "The other side's view" per chapter

**Design-rule check:** a Dev on s9 reads what Business is judged on, what it fears and how the Dev's own words land with Business. A Business reader on s9 reads the Engineering equivalents. These are different content, not a swapped sentence.

### P2.1 Data type — `types.ts`

```ts
/** How one side sees this chapter's topic, written for a reader from the other side. */
export interface SideView {
  measuredBy: string;                 // what this side is judged on, for this topic
  fears: [string, string];            // two concrete fears, topic-specific
  saysVsHears: [SaysVsHears, SaysVsHears];
  askThem: string[];                  // 2–3 questions the reader should ask this side
}
export interface SaysVsHears {
  youSay: string;       // what the READER's side typically says
  theyHear: string;     // how this side hears it
  sayInstead: string;   // a rewrite that lands
}
/** Key = the side being explained. A Dev reads `perspectives.biz`. */
export type ChapterPerspectives = Record<Role, SideView>;
// Chapter gains: perspectives?: ChapterPerspectives;  (optional in the type, required by a test)
```

Data lives in a **new** `src/data/chapterPerspectives.ts` (`CHAPTER_PERSPECTIVES: Record<string, ChapterPerspectives>`). It is merged in `chaptersData.ts` like `CHAPTER_HERO_FIGURES`.

### P2.2 Where it renders

- New `SectionKey` `'otherSide'`. Insert it in `SECTION_KEYS` right after `'mindset'` (this order only affects iteration, not rendering). `SECTION_META.otherSide = { chip: 'อีกฝั่งมองยังไง', minutes: 2 }`. `isSectionPresent`: `!!chapter.perspectives`.
- `LAYER_CONFIG` (15 keys per level):
  - beginner core `['primer', 'otherSide', 'jargon', 'diagram']`
  - experienced core `['otherSide', 'coreConcepts', 'pitfalls', 'diagram']`
  - Every other array is unchanged.
  - Rationale (D6): it is the one section whose content depends on role, so it goes in Core. A beginner needs the definition first (primer); an experienced reader needs the other side first.
- `CHAPTER_CORE_OVERRIDES` still prepends (s11 `faq`, s15 `glossary`).
- **new** `components/guide/sections/OtherSideSection.tsx`, registered in `registry.tsx`. `GuideSectionContext` gains `role: Role | null` and `otherSideView: 'biz' | 'eng' | 'both'` + setter. That state lives in GuideTab; it resets to the default when the role changes and is not persisted.
- **Heading:**
  - role set: `"{ROLE_META[otherRole(role)].side}มองเรื่องนี้ยังไง"`
  - role null: `"สองฝั่งมองเรื่องนี้ยังไง"`
- **View switch** (segmented, `aria-label="เลือกฝั่งที่จะดู"`): `ฝั่ง Business` · `ฝั่ง Engineering` · `ทั้งสองฝั่ง`. The default is `otherRole(role)`, or `both` when role is null. `both` stacks the two views (2 columns at `md` and up, stacked below).
- **One view of side S** (the reader side `O = otherRole(S)`). Labels name the roles explicitly and use no pronouns, so they read correctly in `both` mode:
  - `"{person(S)} ถูกวัดผลด้วย"` → `measuredBy`
  - `"{person(S)} กลัวอะไร"` → `fears` as a list
  - `"พูดยังไงให้ไม่พลาด"` → per row, three stacked lines: `"{person(O)} พูด:"` youSay, `"{person(S)} ได้ยินว่า:"` theyHear, `"พูดแบบนี้แทน:"` sayInstead. It must not be a table (375px).
  - `"ถาม {person(S)} แบบนี้"` → `askThem` as a list
  - Footer: `"{person(O)} ควรทำ:"` + the existing note for O (`engineerNote` when O = eng, `businessNote` when O = biz). This is where the old notes move.
- **`ChapterHero`:** delete the notes grid (81-102). The notes now appear once, beside the view they belong to. This also removes a repeat that the concise-copy spec flagged (§1.2).

### P2.3 Content rules (for all 15 chapters × 2 sides, written during implementation)

- Budgets (characters, `[...s].length`):
  - `measuredBy` ≤ 90
  - each `fears` item ≤ 70
  - `youSay` ≤ 60, `theyHear` ≤ 70, `sayInstead` ≤ 80
  - `askThem` 2–3 items, each ≤ 70
- Topic-specific: the fields must be about this chapter's topic. Do not restate the generic `ROLE_MINDSETS` lines (revenue, uptime). A test rejects exact copies of `howTheyMeasureSuccess`.
- `youSay` is something the reader's side really says in meetings (R7d). `theyHear` is the plausible misreading, not an insult. `sayInstead` is concrete: a scope, a number, a date or a trade-off.
- Prefer the refund thread (order `#A1024`, refund feature) when it fits. Numbers follow R6. No `$` amounts (the visual-first test bans them in hero chapters, and `perspectives` are part of the chapter JSON).
- `askThem` items are questions and end with a question-like phrase, never a lecture. Budgets and a non-empty check go in `copyBudgets.test.ts`.
- R8 terms: `Dev` for the person, `ทีม Engineering` for the function.

### P2.4 Worked example — s9 (Tech Debt)

```ts
s9: {
  biz: { // the business side, read by a Dev
    measuredBy: 'ส่งฟีเจอร์ทันรอบที่สัญญากับลูกค้าและผู้บริหาร และยอดขายที่ฟีเจอร์นั้นพาเข้ามา',
    fears: ['หยุดทำฟีเจอร์ไป 1 Sprint แล้วคู่แข่งปล่อยของก่อน', 'ยอมให้เวลาไปแล้ว แต่ไม่มีอะไรไปรายงานผู้บริหาร'],
    saysVsHears: [
      { youSay: 'ขอ 2 Sprint ไป Refactor โค้ดหน่อย',
        theyHear: 'ทีมจะหยุดส่งงานเกือบเดือน เพื่อทำให้โค้ดสวยขึ้น',
        sayInstead: 'ขอ 20% ของ Sprint แก้ระบบคืนเงิน งานโปรโมชันรอบหน้าจะแก้ไฟล์เดียวแทน 6 ไฟล์' },
      { youSay: 'โค้ดส่วนนี้เละมาก',
        theyHear: 'ทีมก่อนทำงานไม่ดี หรือทีมนี้กำลังหาข้ออ้าง',
        sayInstead: 'ทุกครั้งที่แก้เงื่อนไขคืนเงิน เราเสียเวลาเพิ่มราว 2 วัน และบั๊กหลุดบ่อยขึ้น' },
    ],
    askThem: ['งานไหนในไตรมาสหน้าที่ช้าไม่ได้เด็ดขาด', 'ถ้าต้องเลือก ยอมเลื่อนงานไหน เพื่อแลกกับระบบที่แก้ได้เร็วขึ้น'],
  },
  eng: { // the engineering side, read by Business
    measuredBy: 'ระบบไม่ล่ม บั๊กไม่หลุดถึงลูกค้า และแก้งานใหม่ได้โดยไม่ทำของเดิมพัง',
    fears: ['แก้เงื่อนไขข้อเดียว แล้วส่วนอื่นของระบบคืนเงินพังโดยไม่มีใครรู้', 'โดนว่าช้า ทั้งที่ช้าเพราะหนี้ที่ไม่เคยได้เวลาไปจ่าย'],
    saysVsHears: [
      { youSay: 'ทำแบบเร็วๆ ไปก่อน เดี๋ยวค่อยกลับมาแก้',
        theyHear: 'จะไม่มีวันได้กลับมาแก้ แล้วพอพังก็เป็นความผิดของ Dev',
        sayInstead: 'รอบนี้ทำแบบเร็วได้ แล้วจองเวลาแก้ไว้ใน Sprint ถัดไปเลย' },
      { youSay: 'เพิ่มเงื่อนไขข้อเดียว ทำไมใช้ตั้ง 5 วัน',
        theyHear: 'Business คิดว่าเราอู้ หรือประเมินเวลาไม่เป็น',
        sayInstead: 'อะไรทำให้งานนี้ใช้ 5 วัน ถ้าแก้ตรงไหนก่อน งานแบบนี้จะเร็วขึ้น' },
    ],
    askThem: ['ส่วนไหนของระบบที่แก้แล้วกลัวพังที่สุด', 'ถ้าได้ 1 Sprint แก้หนี้ จะแก้ตรงไหนก่อน และจะวัดผลยังไง'],
  },
},
```

The "6 ไฟล์ → ไฟล์เดียว" figure matches the s9 hero caption (`chapterHeroFigures.ts:36`), so the box and the figure tell one story.

### P2.5 Phase 2 files

`types.ts` · **new** `data/chapterPerspectives.ts` · `data/chaptersData.ts` · `data/sectionLayers.ts` · **new** `components/guide/sections/OtherSideSection.tsx` · `components/guide/sections/registry.tsx` · `components/GuideTab.tsx` (state + ctx) · `components/guide/ChapterHero.tsx` · tests.

### P2.6 Phase 2 tests

- `sectionLayers.test.ts`:
  - 14 → 15 keys per level.
  - Beginner and experienced core as in P2.2.
  - s11 beginner core = `['faq','primer','otherSide','jargon','diagram']`.
  - s15 experienced core = `['glossary','otherSide','coreConcepts','pitfalls','diagram']`.
  - Update the minute assertions (s1 beginner core 4 → 6).
- **new** `data/chapterPerspectives.test.ts`:
  - Every chapter in `CHAPTERS` has both `biz` and `eng`.
  - Every field is non-empty and within budget; `askThem` length is 2–3.
  - No field equals a `ROLE_MINDSETS` string.
  - `biz` and `eng` views of the same chapter share no identical string.
- **new** `components/guide/sections/OtherSideSection.test.tsx` (`renderToStaticMarkup`):
  - role eng → heading `ฝั่ง Business มองเรื่องนี้ยังไง`, contains `perspectives.biz.measuredBy`, does not contain `perspectives.eng.measuredBy`, and the footer contains `engineerNote`.
  - role null → both views and both notes.
- `ChapterHero` render test: no `มุมมองฝั่ง Business` text.

### P2.7 Phase 2 acceptance

1. Role eng, s9: Core shows `ฝั่ง Business มองเรื่องนี้ยังไง` with the business view and `Dev ควรทำ:` + the s9 `engineerNote`. The hero no longer shows the two notes.
2. `ทั้งสองฝั่ง` shows both views side by side on desktop and stacked at 375px, with no horizontal scroll.
3. Role null: the section defaults to `ทั้งสองฝั่ง`.
4. Deep link `#/ch/9/otherSide` opens and scrolls to the section.

---

## Phase 3 — The refund case from two seats

**Design-rule check:** the same figure is narrated as what the Business person sees and decides versus what the Dev sees and risks. These are two different accounts of one event.

### P3.1 Inventory (unchanged by this phase)

15 hero figures, one per chapter: `refund-handoff-drift` s1, `refund-backlog-cut` s2, `refund-fidelity` s3, `refund-nfr-spec` s4, `refund-c4-impact` s5, `refund-story-gates` s6, `refund-test-report` s7, `refund-deploy-log` s8, `refund-debt-diff` s9, `refund-slo-dashboard` s10, `refund-kpi-split` s11, `refund-dual-track-board` s12, `refund-ai-review` s13, `refund-spec-stack` s14, `refund-glossary-fix` s15. Plus `refund-swimlane` / `refund-sequence` in the s5 Diagram section. That pair is not a hero figure and is out of scope.

### P3.2 Data

```ts
export interface ChapterHeroFigure {
  figureKey: FigureKey;
  caption: string;
  seats: Record<Role, string>;   // NEW, required: the refund moment narrated from each seat
}
```

Written in `chapterHeroFigures.ts` for all 15. Rules:
- ≤ 100 characters each, a single line.
- Each seat must name one thing visible in the figure (a label, number or step). Check against the component's actual text, not the caption.
- `biz` is written to a Business reader and `eng` to a Dev (second person is allowed: `คุณ…`).
- A seat must not restate `caption` (R2). The two seats must differ in what they see or decide, not only in wording.
- For the four engineering-artefact figures (s7, s8, s9, s13), the `biz` seat translates the artefact into what Business actually experiences, such as a date, a customer impact or a question to ask.

Worked example (s9):
- `biz`: `'คุณขอเพิ่มเงื่อนไขคืนเงินข้อเดียว แต่ได้คำตอบว่า 5 วัน เพราะโค้ดเดียวกันมีอยู่ 6 ที่'`
- `eng`: `'งานข้อเดียวต้องแก้ 6 ไฟล์ พลาดไฟล์เดียว ลูกค้าก็ได้เงินคืนผิดยอด จึงต้องเผื่อเวลาเทสต์ทุกไฟล์'`

### P3.3 UI — `HeroFigure.tsx`

- New props: `role: Role | null`, `seat: Role`, `onFlipSeat: () => void`, `onShowSeat: (r: Role) => void`.
- Under the caption, before the analogy, render `<div data-seat>`:
  - role set: label `"{ROLE_META[seat].icon} เก้าอี้{ROLE_META[seat].side}"`, then the seat line, then a text button.
    - When `seat === role`, the button reads `นั่งเก้าอี้อีกฝั่ง`.
    - When `seat !== role`, it reads `กลับเก้าอี้ตัวเอง`.
  - role null: both seat lines stacked, each with its label. No button.
- Seat state lives in GuideTab: `seatFlipped: boolean`, reset to `false` on chapter change and role change, not persisted. `seat = flipped ? otherRole(role) : role`.
- Copy budget: when `seats` is present, the hero budget stays as today (`caption` ≤ 60, `plainAnalogy` ≤ 80). The seat line adds one more line; that is accepted.

**No figure is redrawn (D8).** The four engineering-artefact figures are what an engineer really looks at, so the `biz` seat narrates their consequence rather than changing the picture.

### P3.4 Phase 3 files

`types.ts` · `data/chapterHeroFigures.ts` · `components/guide/HeroFigure.tsx` · `components/guide/ChapterHero.tsx` (pass-through) · `components/GuideTab.tsx` (state) · `data/copyBudgets.test.ts` · tests.

### P3.5 Phase 3 tests

- `copyBudgets.test.ts`: for every hero chapter, `heroFigure.seats.biz`/`.eng` ≤ 100, no newline, no banned opener, `biz !== eng`, neither equals `caption`.
- `visualFirst.test.ts`: every hero figure has both seats.
- **new** `components/guide/HeroFigure.test.tsx`:
  - role eng, seat eng → contains the eng line and `นั่งเก้าอี้อีกฝั่ง`, not the biz line.
  - seat biz with role eng → biz line and `กลับเก้าอี้ตัวเอง`.
  - role null → both lines and no button.

### P3.6 Phase 3 acceptance

1. Role biz, s9: the hero shows `💼 เก้าอี้ฝั่ง Business` and the biz line. `นั่งเก้าอี้อีกฝั่ง` switches to the eng line; moving to s10 resets to the biz seat.
2. Role null: both lines, no switch. At 375px the seat block wraps with no overflow.

---

## Phase 4 — Business-side content for engineers

### P4.1 Decision: four new chapters (not a new layer)

A "business layer" inside the 15 engineering chapters would force off-topic money content into chapters about testing or deploys. It would also double the length of every chapter. New chapters get the index, search, deep links, tracks, the quiz, the other-side box and read XP for free. They are appended as **s16–s19** so that `#/ch/1…15` deep links and `be_guide_last_chapter` stay valid (D10).

| id | `title` (≤ 25) | `enTerm` | covers | `readTime` |
|---|---|---|---|---|
| s16 | `เงินเข้าออกทางไหน` | `Unit Economics` | revenue vs profit, gross margin, CAC, LTV, burn rate, runway; what one refund costs the shop | `10 นาที` |
| s17 | `เดดไลน์ที่เลื่อนไม่ได้` | `Fixed Deadlines` | contract dates, campaign launches, budget cycles and fiscal year, regulatory dates; which dates move and which don't | `10 นาที` |
| s18 | `OKR, KPI และค่าเสียโอกาส` | `Opportunity Cost` | how goals cascade, why "just one small feature" costs another goal, reading a KPI dashboard | `10 นาที` |
| s19 | `วงจรการขายและค่าปรับ SLA` | `Sales Cycle & SLA` | pipeline stages, what sales promised before Dev heard of it, SLA penalties and service credits | `10 นาที` |

- All four: `home: 'biz'` and `roleTag: 'biz'`. Add `'biz'` to the `roleTag` union and the index chip `{ id: 'biz', label: 'ธุรกิจ' }` in both chip lists.
- Each chapter must have every field the other chapters have, because the tests read them:
  - `subtitle`, `businessNote`, `engineerNote`, `keyTakeaway`, `plainAnalogy`
  - `beginnerPrimer`, `jargonList` (5), `realWorldExamples` (2), `dialogueExample`, `coreConcepts` (3), `realWorldWorkflow` (4), `checklist` (5), `commonPitfalls` (4)
  - `perspectives` (Phase 2)
  - All budgets in `copyBudgets.test.ts` apply.
- No hero figure and no diagram widget in this phase, so Phase 3 seats do not apply and the Diagram section is absent (like s1). Friction uses the existing template fallback. s16 gets one inline `table` block in `chapterContentBlocks.ts` (`placement: 'inline', after: 'primer'`): the #A1024 refund's P&L with illustrative ฿ numbers labelled `ตัวเลขสมมติ`.
- Money amounts use `฿`. Never use `$`: the visual-first `MONEY` regex covers hero chapters only, but keep it consistent.

### P4.2 Every place that must change

| # | Place | Change |
|---|---|---|
| 1 | **new** `data/chapters/chapters16_19.ts` | four chapter literals |
| 2 | `data/chaptersData.ts:1-12` | import and spread `chapters16_19` |
| 3 | `types.ts:199` | `roleTag` gains `'biz'` |
| 4 | `GuideTab.tsx:405-412`, `791-798` | add the `ธุรกิจ` chip |
| 5 | `GuideTab.tsx:318, 332, 379, 521, 758` | `15` → `chapters.length` |
| 6 | `Header.tsx:152` | `Guide [15]` → `Guide [{chapterCount}]` (new prop) |
| 7 | `GamificationTab.tsx:111` | `/15` → `/{CHAPTERS.length}` (prop or import) |
| 8 | `data/chapterPerspectives.ts` | s16–s19 in both directions |
| 9 | `data/chapterContentBlocks.ts` | s16 inline table |
| 10 | `data/readingTracks.ts` | `eng` track (P4.3) |
| 11 | `data/badgesData.ts:39` | `deep_scholar.description` → `'อ่านครบทุกบท ทั้งฝั่ง Business และ Engineering'`. Users who already unlocked it keep it. Users who read the 15 old chapters get it only after the 4 new ones (intended). |
| 12 | `data/glossary.ts` | business terms (P4.4); `relatedChapterIds` point to s16–s19 |
| 13 | `data/quizQuestions.ts` | covered by Phase 5 |
| 14 | `sectionLayers.test.ts:98` | `toHaveLength(15)` → `CHAPTERS.length` |
| 15 | `sectionLayers.test.ts:101-102, 109` | diagram count stays 13; the no-tool list becomes `['s1','s14','s16','s17','s18','s19']` |
| 16 | `sectionLayers.test.ts` presence list (reference) | unchanged: s16 uses inline, not reference |
| 17 | `chapterRoute.test.ts:11` | add `19` to the round-trip nums |

Nothing else hard-codes the count. `ChapterDiagram` returns `null` for new ids, and `diagramWidgets.test.tsx` iterates `CHAPTERS`.

### P4.3 Track update

`eng: [1, 16, 2, 17, 18, 4, 11, 19, 9]` (100 min). s16 and s17 now come before any engineering chapter. `biz`, `beginner` and `experienced` are unchanged; new chapters are not forced on business readers.

### P4.4 Reverse glossary direction

- **Today (fact):** the glossary explains SDLC and engineering terms, written for whoever is new to software work. It has no audience field, and it has no money or commercial terms (§0).
- Add `side?: Role` to `GlossaryTerm`, the term's home side, plus `termSide(t) = t.side ?? CATEGORY_SIDE[t.category]`:
  - `CATEGORY_SIDE`: `product` and the new `business` → `biz`; every other category → `eng`.
  - Explicit `side: 'biz'` on BRD, SOW, SLA, Stakeholder, OKR/KPI, Retention, Churn, Adoption rate.
- New category `{ key: 'business', label: 'Business & money', labelTh: 'ธุรกิจและตัวเงิน' }`, with 14 terms (`origin: 'app'`, `side: 'biz'`): Revenue, Gross margin, CAC, LTV, Burn rate, Runway, P&L, ROI, Opportunity cost, Fiscal year / Budget cycle, Sales pipeline, Quota, Service credit (SLA penalty), Go-to-market.
  - Each term needs a `definition` and a `plain` line that says why a Dev should care. For example, CAC: `ถ้า CAC สูง ทุกบั๊กที่ทำให้ลูกค้าหลุดคือเงินค่าหาลูกค้าที่เสียไปฟรี`.
- `GlossaryPanel` gets side chips `ศัพท์ฝั่ง Business` / `ศัพท์ฝั่ง Engineering`, in addition to the category chips. With a role set, the default order lists the other side's terms first (a stable sort by `termSide !== role`). Role null keeps the current order.

### P4.5 Phase 4 tests

- `copyBudgets.test.ts` covers the new chapters automatically. It must pass.
- **new** `data/businessChapters.test.ts`:
  - s16–s19 exist with nums 16–19 and `home: 'biz'`.
  - Each has the full section set (primer, jargon 5, examples 2, coreConcepts 3, workflow 4, checklist 5, pitfalls 4) and `perspectives`.
  - No `$`.
- `readingTracks.test.ts`: eng track as P4.3, 100 min; biz-home-before-eng-home still holds.
- **new** `data/glossary.test.ts`:
  - Every `relatedChapterIds` id exists.
  - The 14 business terms have `termSide === 'biz'` and a `plain` line.
  - Term ids are unique.
  - A sort with role eng puts all biz terms first.
- The updates in P4.2 #14–17.

### P4.6 Phase 4 acceptance

1. The index lists 19 chapters. The header shows `Guide [19]`, the dashboard `/19`, and the `ธุรกิจ` filter shows s16–s19 plus the `all` chapters.
2. Role eng: the track shows `บท 1 → 16 → 2 → 17 …`; s16 opens as beginner with the other-side box showing the business view.
3. `#/ch/16` deep-links. Old `#/ch/9` links are unchanged.
4. Glossary with role eng lists business terms first; the `ศัพท์ฝั่ง Business` chip filters them.

---

## Phase 5 — Role-specific scenario quiz

**Design-rule check:** a Dev gets Dev-seat scenarios whose right answer needs business understanding; Business gets the mirror. The questions are different, not relabelled.

### P5.1 Data — `types.ts`, `quizQuestions.ts`

- `QuizQuestion` gains **required** `forRole: Role | 'both'`. The 8 existing questions get `'both'` (they test role literacy, not a seat).
- Add 12 scenario questions, ids 9–20:
  - 6 × `forRole: 'eng'`: the reader is the Dev (`role: 'Dev'`); PM, sales or finance pushes; the correct option shows business understanding.
  - 6 × `forRole: 'biz'`: the reader is PM, BA or a business owner; a Dev pushes back; the correct option shows engineering understanding.
  - Each question: `scenario` uses the refund thread where natural; 4 options, exactly one correct; each `explanation` ≤ 160; `xp: 25`.
  - Each question maps to one chapter: `chapterId?: string` (new optional field), used for a `อ่านบทที่เกี่ยวข้อง` link after answering.
  - Coverage: the eng set must touch s16, s17, s18 and s19 (at least one each) plus s2 and s11. The biz set must touch s6, s8, s9, s10 and s13 (at least one each) plus s4.

Worked example (id 9, `forRole: 'eng'`, `role: 'Dev'`, `category: 'Deadlines'`, `chapterId: 's17'`):
- `scenario`: `'PM บอกว่าฟีเจอร์คืนเงินต้องขึ้นก่อนแคมเปญ 11.11 ซึ่งจองสื่อไว้แล้ว แต่คุณประเมินว่างานครบทุกข้อต้องใช้อีก 2 สัปดาห์หลังวันนั้น'`
- `question`: `'ควรตอบ PM ว่ายังไง'`
- Options:
  - correct: `'เสนอตัดขอบเขต: ขึ้นเฉพาะคืนเงินกรณีของไม่ถึงให้ทันแคมเปญ ส่วนที่เหลือตามมาใน 2 สัปดาห์'` — explanation `'วันแคมเปญผูกกับเงินค่าสื่อที่จ่ายไปแล้ว เลื่อนวันยาก แต่ตัดขอบเขตได้'`
  - `'ขอเลื่อนแคมเปญออกไป 2 สัปดาห์'` — `'สื่อจองแล้ว การเลื่อนแคมเปญมักแพงกว่าการตัดขอบเขตมาก'`
  - `'รับปากว่าทันครบทุกข้อ แล้วทำโอที'` — `'เสี่ยงบั๊กวันที่คนใช้มากที่สุด และทีมไม่ได้บอกความจริงเรื่องความเสี่ยง'`
  - `'บอกว่าทำไม่ได้ เพราะประเมินไว้แล้ว'` — `'ปิดทางคุย ไม่ได้เสนอทางเลือกให้ธุรกิจตัดสินใจ'`

### P5.2 Rounds — **new** `src/data/quizRounds.ts` (pure)

```ts
export type QuizRound = 'basics' | Role | 'all';
export const QUIZ_ROUND_META: Record<QuizRound, { label: string }> = {
  basics: { label: 'พื้นฐาน' }, biz: { label: 'สาย Business' }, eng: { label: 'สาย Engineering' }, all: { label: 'ทั้งหมด' },
};
export function getQuizRound(qs: QuizQuestion[], round: QuizRound): QuizQuestion[];
// basics → forRole 'both'; biz/eng → forRole === round; all → role-specific rounds first, then basics
export function defaultQuizRound(role: Role | null): QuizRound; // role ?? 'basics'
```

### P5.3 UI — `QuizTab.tsx`, `App.tsx`

- `QuizTab` props: `questions` (the full bank) and `role: Role | null`.
- Above the question card, round chips (`aria-label="เลือกชุดคำถาม"`). The reader's own role chip gets the suffix ` (สายคุณ)`. Each chip shows its count, e.g. `สาย Engineering (สายคุณ) · 6 ข้อ`.
- The current quiz body moves into an inner `QuizRun` rendered with `key={round}`, so switching rounds resets index, score and shuffled options.
- The round is chosen on the tab. Switching mid-round restarts it with no confirmation (D12).
- After an answer, when `chapterId` is set, show the `อ่านบทที่เกี่ยวข้อง` button. It calls a new `onOpenChapter(chapterId)` → App sets the tab to guide and navigates.
- `onCompleteQuiz(score, correctIds, roundSize)`. In `App.tsx`, `quiz_master` requires `roundSize >= 6 && score >= roundSize * 0.8`. This fixes the bank-size threshold. XP stays per question id, so replaying pays nothing twice.

### P5.4 Phase 5 files

`types.ts` · `data/quizQuestions.ts` · **new** `data/quizRounds.ts` · `components/QuizTab.tsx` · `App.tsx` · tests.

### P5.5 Phase 5 tests

- **new** `data/quizRounds.test.ts`:
  - basics = ids 1–8.
  - `eng` has 6 questions, all with `forRole: 'eng'`; the same for `biz`.
  - `all` = 20 questions with no duplicates, role-specific first.
  - `defaultQuizRound`.
- **new** `data/quizQuestions.test.ts`:
  - ids are unique.
  - Exactly one correct option and 4 options each.
  - `chapterId`, when set, exists in `CHAPTERS`.
  - Coverage rules from P5.1.
  - Explanations ≤ 160.
- **new** `components/QuizTab.test.tsx` (`renderToStaticMarkup`): role eng renders `สาย Engineering (สายคุณ)` and the first eng question's scenario first.
- The `quiz_master` threshold as a pure helper `qualifiesQuizMaster(score, roundSize)` in `lib/xp.ts`, with a test.

### P5.6 Phase 5 acceptance

1. Role eng: the quiz opens on `สาย Engineering (สายคุณ) · 6 ข้อ`. After finishing with 5/6, `quiz_master` unlocks; 4/6 does not.
2. Switching to `พื้นฐาน` restarts with the original 8. A replayed correct answer pays no XP.
3. `อ่านบทที่เกี่ยวข้อง` opens the mapped chapter in the guide.

---

## 6. Verification (every phase)

1. `bun run lint` passes (tsc typechecks the test files too).
2. `bun run test` passes.
3. `bun run build` passes.
4. Browser check with `bun run dev`, at desktop (1440px) and 375px, with a clean profile and the console open:
   - Run that phase's acceptance steps.
   - No horizontal scroll at 375px (header groups, lens banner, other-side box, seat block, quiz chips).
   - No console errors.
   - Reload persists role, level mode and chapter overrides.
   - A legacy profile (only `be_guide_exp_level`, stats and badges) loads with no onboarding and today's behaviour.
5. Keyboard: every new segmented control is reachable by Tab and toggles with Enter/Space. The selected state is exposed with `aria-pressed`.

## 7. Storage keys (all phases)

| key | phase | format | notes |
|---|---|---|---|
| `be_guide_role` | 1 | `biz` \| `eng` | absent = no role |
| `be_guide_level_mode` | 1 | `auto` \| `beginner` \| `experienced` | read only while a role is set |
| `be_guide_chapter_levels` | 1 | JSON object | legacy; migrated to be_guide_chapter_levels_by_role |
| `be_guide_exp_level` | — | unchanged | base level; used when role is null |

Other-side view, seat and quiz round are session state only.

## 8. Owner decisions (made while specifying)

| # | Decision | Rationale |
|---|---|---|
| D1 | Role is primary; level becomes a derived default with explicit overrides (per chapter, then global). | The owner's recommendation. It matches the design rule: role changes the order of each chapter. |
| D2 | No role = today's behaviour exactly, including XP on level switch. | This keeps legacy profiles and "skip" stable, and each phase ships without a migration. |
| D3 | Shared chapters default to **beginner** under a role. | Role says nothing about collaboration experience, and beginner is the site-wide default. The alternative, reusing `be_guide_exp_level`, would add hidden state that the header cannot show. The per-chapter switch is one tap. |
| D4 | Changing role clears per-chapter overrides but keeps `levelMode`. | Overrides were relative to the old role's defaults. `levelMode` is shown in the header, so keeping it is not surprising. Superseded by 2026-09-23-role-ux-fixes.md Phase 3. |
| D5 | No XP for choosing a role, a level mode or a chapter override. | This is the same policy as bookmarks. Settings are not learning actions, and toggling must not be farmable. |
| D6 | `otherSide` is a new SectionKey in Core for both levels. | It is the only role-dependent content, so it must be seen without expanding anything. Chapter-signature overrides still lead. |
| D7 | `businessNote`/`engineerNote` move from the hero into the other-side box footer. They are not deleted. | Advice to the reader belongs next to the other side's view that motivates it. This also removes a hero repeat flagged by the concise-copy spec. |
| D8 | Phase 3 redraws no figure. The biz seat narrates the consequence of the engineering-artefact figures. | Minimal scope. Those artefacts are what an engineer really sees; a Business version would be a different figure, not a second seat. |
| D9 | New chapters (s16–s19), not a layer. | See P4.1. A layer would put off-topic content in 15 chapters. Chapters reuse every existing mechanism. |
| D10 | New chapters are appended (nums 16–19); reading order comes from tracks. | This keeps every existing deep link and the saved last-chapter valid. |
| D11 | Chapter titles in P4.1 are final. The concise-copy "owner picks from 2–3 options" process is waived. | The owner asked for no further questions. The titles meet R4/R5 and the 25-character budget. |
| D12 | Quiz round switch restarts silently. | A round is at most about 20 questions and XP is per id, so nothing is lost that matters. A confirm dialog costs more than it saves. |
| D13 | `quiz_master` needs at least 6 questions in the round and at least 80%. | The current check uses the bank size, which becomes wrong once rounds exist. The 6-question floor stops a trivially small round from qualifying. |
| D14 | No new badge for the role features. | YAGNI. The existing badges already cover reading and quiz. |
| D15 | Header labels stay `Beginner`/`Experienced` (English) to match today. The banner uses Thai `มือใหม่`/`คุ้นงานแล้ว`. | This keeps the header compact at 375px. The banner is where the per-chapter decision is explained. |

## 9. Risks

- **Content volume.** Phase 2 needs 30 side views. Phase 3 needs 30 seat lines. Phase 4 needs four full chapters and 14 glossary terms. Phase 5 needs 12 questions. Each phase's tests fail until its content is complete, so a phase cannot ship half-written. Write content in chapter batches, and run `copyBudgets` after each batch.
- **Header crowding at 375px.** Two segmented groups plus the tab row. Mitigation: each group wraps to its own row; verify in §6.
- **The Phase 2 layout change** shifts minutes and Core membership, and existing tests assert them. Update those tests in the same commit.
- **Seat lines must match figure text** (P3.2), and figures contain HTML labels. The writer must read each `Refund*.tsx` label set, not just the caption.

## 10. Out of scope

Redrawing refund figures; a business-seat version of `refund-swimlane`/`refund-sequence`; role-aware friction playbooks and the s11 FAQ (they already show both sides, since `a212913`); AI assistant role context; persisting the other-side view, the seat or the quiz round; analytics.
