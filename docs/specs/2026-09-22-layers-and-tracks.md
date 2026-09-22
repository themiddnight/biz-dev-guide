# Spec: Reading layers, in-chapter outline, tracks, onboarding and deep links

- Date: 2026-09-22
- Status: Ready for implementation (design approved; owner decisions recorded in §10)
- Evidence: `work/ux-test/synthesis.md` §2 (G-1…G-10), §4, §5 (I-01, I-02, I-12, I-15, I-25), §6c, §6e
- Target app: `/Users/Pathompong/Sites/Personal/biz-dev-guide/src`
- UI copy is **Thai-first**. English appears only in parentheses after the Thai label, for example `แก่น (Core)`. Every string quoted in this spec is the literal copy to ship.

## 0. Background and verified facts

The UX test found that chapters show every layer at once, in a fixed order, to every reader (I-01, synthesis §4 "Why" 1–2). The Beginner level does not reorder anything useful (I-02). There is no reading path, no resume and no deep link (G-3, G-4, G-10, I-12, I-25). "Collapse all" alone moved one beginner's overwhelm from 4 to 3 and exposed the Jargon Buster (G-1, §6e).

**Verified code facts** (line numbers are on branch `fix/ux-test-quick-fixes`, commit `5b5a41a`):

| Fact | Where |
|---|---|
| `activeChapterId` is local state in GuideTab, default `'s1'`. GuideTab is conditionally rendered per tab, so switching tabs and back resets it to ch.1. | `GuideTab.tsx:85`, `App.tsx:272-287` |
| `openSections` is one hard-coded record. It opens mindset, friction, dialogue, diagram, faq, examples, coreConcepts, reference and glossary for everyone. | `GuideTab.tsx:156-171` |
| A level effect only ever sets keys to `true`, so it never closes anything. | `GuideTab.tsx:174-190` |
| `expandAllSections` omits `reference`/`glossary`. `collapseAllSections` omits `mindset`/`friction`/`reference`/`glossary`, so "ย่อทั้งหมด" leaves those open. | `GuideTab.tsx:259-274`, `276-289` |
| Mindset and friction are the first two sections, and their order swaps by level. Both render before the analogy, Primer and Jargon. | `GuideTab.tsx:723-764` |
| Section render blocks in DOM order: glossary 683 (s15 only), mindset/friction 723, hero analogy + perspective notes 766 (always, not collapsible), primer 807, jargon 866, dialogue 928, diagram 998 (unconditional), faq 1243 (s11 only), examples 1280, coreConcepts 1359, reference 1410, workflow 1446, pitfalls 1492, checklist 1537, footer 1589 | `GuideTab.tsx` |
| The diagram section hosts illustrations (1023), the s5 family grid + diagram-placement blocks (1114), `ChapterDiagram` or the s15 `GlossaryCategoryMap` (1128), diagram-placement `ContentBlocks` for chapters other than s5 (1139), the s5 C4 explorer (1148) and `SwimlaneVsSequence` (1235) | `GuideTab.tsx` |
| The reference section renders `contentSections` whose `placement !== 'diagram'` | `GuideTab.tsx:198`, `1410` |
| Section-local state: checklist ticks (89), C4 level (90), glossary filter/query (93-94). `mindsetSubTab` (91) and `dilemmaAnswers` (92) are declared and never read. | `GuideTab.tsx:89-94` |
| Chapter navigation call sites (all set `activeChapterId`): 214, 233, 246, 356, 444, 501, 567, 1605, 1620, 1635, 1727 | `GuideTab.tsx` |
| The footer "อ่านจบแล้ว! ไปบทถัดไป" marks the chapter read and then goes to the sequential next chapter. The pagination cards are sequential. | `GuideTab.tsx:1600-1612`, `1616-1650` |
| The index exists twice: a desktop sticky sidebar (383-491, list at 436) and a drawer (1654, list at 1719). Both render `filteredChapters`. | `GuideTab.tsx` |
| `--header-h` is measured by a ResizeObserver in GuideTab. `[id], .anchor-target` get `scroll-margin-top: calc(var(--header-h) + 16px)`. | `GuideTab.tsx:126-138`, `index.css:56-66` |
| Deferred scroll after render uses `pendingScrollId` (two rAFs) | `GuideTab.tsx:140-153` |
| `keyTakeaway` is a required `Chapter` field, but the reader never renders it. Only index search reads it. | `types.ts:189`, `GuideTab.tsx:303` |
| Experience level initialises from `localStorage.be_guide_exp_level`, else `'beginner'`, **without writing the key**. The key is written only in `handleExperienceLevelChange`, which returns early when the level is unchanged and awards XP. | `App.tsx:16-19`, `App.tsx:147-156` |
| `activeTab` defaults to `'guide'` | `App.tsx:14` |
| No code reads or writes `location.hash` or `history`. RichText chapter links use `href="#sN"` with `preventDefault`. | grep; `content/RichText.tsx:44` |
| `CHAPTERS` has 15 chapters, ids `s1…s15`, with `num` equal to the id suffix, in order. `readTime` is a string such as `'10 นาที'`. | `data/chaptersData.ts:9-26`; `data/chapters/*.ts` |
| `FrictionPlaybookCard` renders a generic template when `playbook` is undefined, so the friction section always renders. Real playbooks exist for s1, s2, s4, s6, s7, s8, s11 and s12. Dilemmas exist in s1, s2 and s6. | `FrictionPlaybookCard.tsx:36-40`; `data/frictionPlaybooks.ts:4-240`, dilemmas at `:34, :83, :147` |
| `RoleMindsetCard` is global (not per chapter). Its root id is `role-mindset-card`. | `RoleMindsetCard.tsx:38`; `data/roleMindsets.ts:3` |
| `ChapterDiagram` has an interactive block for each of s1–s14. The s5 block includes `ProtocolSimulator`. | `ChapterDiagram.tsx`, `:513` |
| `data/chaptersData.tsx` is a one-line `export * from './chaptersData'`. Vite resolves `.ts` before `.tsx`; Bun resolves it to itself (confirmed: `bun` reports "Export named 'CHAPTERS' not found"). | `data/chaptersData.tsx:1` |
| No test runner. `lint` = `tsc --noEmit`. `tsconfig.json` has no `include`, so it typechecks every `.ts`/`.tsx` in the repo, including test files. Vite is `^8.3.0`. | `package.json`, `tsconfig.json` |

**Per-chapter section data presence** (computed from `CHAPTERS`): every chapter has primer, dialogue, examples (2), coreConcepts (3), workflow (4), pitfalls (4) and checklist (5). Jargon (5 terms) is present in s1–s14 and absent in s15. Reference is present in s1, s2, s5, s6, s8, s12, s13 and s14. FAQ is s11 only. Glossary is s15 only. Mindset, friction and diagram render in all 15 chapters. Section sizes are uniform across chapters, so a fixed per-section time estimate is accurate enough (§1.4).

## 1. Section model — `src/data/sectionLayers.ts`

### 1.1 Types and config (pure, no React imports)

```ts
import type { Chapter, ExperienceLevel } from '../types';

export type Layer = 'core' | 'apply' | 'deep';
export const LAYERS: readonly Layer[] = ['core', 'apply', 'deep'];

export type SectionKey =
  | 'mindset' | 'friction' | 'primer' | 'jargon' | 'dialogue' | 'diagram' | 'faq'
  | 'examples' | 'coreConcepts' | 'reference' | 'glossary' | 'workflow' | 'pitfalls' | 'checklist';
export const SECTION_KEYS: readonly SectionKey[]; // the 14 keys above, in this order

export const LAYER_CONFIG: Record<ExperienceLevel, Record<Layer, readonly SectionKey[]>> = {
  beginner: {
    core:  ['primer', 'jargon', 'diagram'],
    apply: ['dialogue', 'examples', 'workflow', 'checklist', 'faq', 'friction'],
    deep:  ['coreConcepts', 'pitfalls', 'reference', 'glossary', 'mindset'],
  },
  experienced: {
    core:  ['coreConcepts', 'pitfalls', 'diagram'],
    apply: ['friction', 'dialogue', 'workflow', 'checklist', 'faq', 'examples'],
    deep:  ['primer', 'jargon', 'reference', 'glossary', 'mindset'],
  },
};
```

Array order is render order within a layer. Layers render in `LAYERS` order. Each level's three arrays together contain each of the 14 keys exactly once (enforced by a test).

```ts
/** Chapter-signature sections promoted to Core for BOTH levels (owner decision, §10 D10). */
export const CHAPTER_CORE_OVERRIDES: Readonly<Record<string, readonly SectionKey[]>> = {
  s11: ['faq'],
  s15: ['glossary'],
};
```

For a chapter with an override, each listed key is removed from its configured layer and **prepended** to Core, in override order. Examples: s11 beginner Core = `['faq','primer','jargon','diagram']`; s15 experienced Core = `['glossary','coreConcepts','pitfalls','diagram']`. Overrides apply only to keys present in that chapter.

### 1.2 Section metadata (labels are the existing headings, Thai-first)

| key | `label` (section heading, unchanged) | `chip` (outline chip) | `minutes` | `hasTool(chapter)` |
|---|---|---|---|---|
| primer | ปฐมบทสำหรับมือใหม่ (ปูพื้นฐานจาก 0) | ปฐมบท | 2 | false |
| jargon | พจนานุกรมคำศัพท์จำเป็น (Jargon Buster) | ศัพท์จำเป็น | 2 | false |
| diagram | `chapter.diagramTitle` or the existing fallback | แผนภาพ | 3 | true |
| dialogue | บทสนทนาจริงในที่ทำงาน (วิธีพูดที่พัง vs วิธีพูดที่ปัง) | บทสนทนา | 2 | false |
| examples | กรณีศึกษาจริงในอุตสาหกรรม (Real-World Case Studies) | กรณีศึกษา | 3 | false |
| workflow | ขั้นตอนการทำงานจริงในองค์กร (Real-World Workflow) | ขั้นตอนงาน | 2 | false |
| checklist | Pre-flight Checklist ก่อนเข้าประชุมหรือส่งต่องาน | เช็กลิสต์ | 1 | false |
| faq | คำถามที่แต่ละฝั่งบ่นกันจริงๆ (12 ข้อ) | คำถามที่เจอบ่อย | 6 | false |
| friction | คัมภีร์รับมือ Friction & เทคนิคเจรจา (Friction Playbook) | รับมือ Friction | 4 | `!!chapter.frictionPlaybook?.dilemma` |
| coreConcepts | ความรู้เชิงลึกและหลักการสำคัญ (Core Deep-Dive Concepts) | แนวคิดหลัก | 3 | false |
| pitfalls | กับดักที่เจอบ่อยและทางออกที่แนะนำ (Pitfalls & Solutions) | กับดัก | 2 | false |
| reference | เนื้อหาอ้างอิง (Reference) | อ้างอิง | 3 | false |
| glossary | คลังคำศัพท์ (Glossary) | คลังคำศัพท์ | 5 | false |
| mindset | เข้าใจวิธีคิดของแต่ละบทบาท (Role Mindset & Empathy) | วิธีคิดแต่ละบทบาท | 2 | false |

`SECTION_META: Record<SectionKey, { chip: string; minutes: number }>` holds the chip label and minutes. Section components keep their existing headings; `label` is listed only for traceability. `hasTool` marks sections that contain an interactive tool. The outline shows a `ลองเล่น` tag on those chips (§2.2). This addresses G-5, G-6 and I-15 without moving any tool out of its section.

### 1.3 Presence predicate

`isSectionPresent(chapter: Chapter, key: SectionKey): boolean` mirrors today's render guards exactly:

| key | present when | current guard |
|---|---|---|
| mindset | always | `GuideTab.tsx:736-751` (unconditional) |
| friction | always (template fallback; removing templates is round C) | `FrictionPlaybookCard.tsx:36-37` |
| primer | `!!chapter.beginnerPrimer` | `:808` |
| jargon | `(chapter.jargonList?.length ?? 0) > 0` | `:867` |
| dialogue | `!!chapter.dialogueExample` | `:929` |
| diagram | always | `:999` (unconditional) |
| faq | `chapter.id === 's11'` | `:1244` |
| examples | `realWorldExamples?.length > 0` | `:1281` |
| coreConcepts | `coreConcepts?.length > 0` | `:1360` |
| reference | `getReferenceSections(chapter).length > 0` | `:198`, `:1411` |
| glossary | `chapter.id === 's15'` | `:684` |
| workflow | `realWorldWorkflow?.length > 0` | `:1447` |
| pitfalls | `commonPitfalls?.length > 0` | `:1493` |
| checklist | `checklist?.length > 0` | `:1538` |

`getReferenceSections(chapter)` moves from `GuideTab.tsx:198` into this module (same filter: `placement !== 'diagram'`) so the predicate and the Reference section share one definition.

### 1.4 Derivation functions (all pure, all unit-tested)

```ts
export interface LayerGroup { layer: Layer; sections: SectionKey[]; minutes: number }
export interface OpenState { layers: Record<Layer, boolean>; sections: Partial<Record<SectionKey, boolean>> }

export function isSectionKey(value: string): value is SectionKey;
/** Applies CHAPTER_CORE_OVERRIDES for chapterId, then LAYER_CONFIG. */
export function getLayerOf(level: ExperienceLevel, key: SectionKey, chapterId: string): Layer;
/** Always returns 3 groups in LAYERS order; overrides applied; absent sections removed; minutes = sum of SECTION_META minutes. */
export function getChapterLayout(level: ExperienceLevel, chapter: Chapter): LayerGroup[];
/** Default: core layer + its sections open; apply/deep layers collapsed, their sections closed. */
export function deriveOpenState(layout: LayerGroup[]): OpenState;
/** Every layer expanded, every present section open. */
export function expandAll(layout: LayerGroup[]): OpenState;
/** Every layer expanded, every section closed: the chapter becomes a menu of headings (G-1 evidence). */
export function collapseAll(layout: LayerGroup[]): OpenState;
/** Opens the section AND expands its layer. No-op for a key absent from the layout. */
export function openSection(state: OpenState, layout: LayerGroup[], key: SectionKey): OpenState;
export function toggleSection(state: OpenState, key: SectionKey): OpenState;
export function toggleLayer(state: OpenState, layer: Layer): OpenState;
```

Rules:
- Layer groups whose `sections` is empty are not rendered and have no outline group. In practice all three layers are non-empty for every chapter, because each layer holds at least one always-present key or one key present in every chapter.
- The open state is **re-derived** with `deriveOpenState(getChapterLayout(level, chapter))` whenever `experienceLevel` **or** `activeChapterId` changes. Today the state carries across chapters (`GuideTab.tsx:156`). The new behaviour is deliberate: section presence differs per chapter, and each chapter should open at its Core.
- Re-deriving happens before a requested section is applied (§5), so a deep link to a Deep section opens that section on top of the defaults.
- The layer-header time label shows `≈ {minutes} นาที`. The minutes are estimates. `Chapter.readTime` stays unchanged as the whole-chapter figure in the chapter header.

### 1.5 Placement of blocks that are not one of the 14 keys

| Block | Decision | Justification |
|---|---|---|
| Hero: chapter header (`:584-610`), `keyTakeaway` (new render), analogy + business/engineer notes (`:766-805`) | **Not a section.** It always renders above the outline. | The approved design puts "hero summary (+analogy)" outside the layers. See §1.6. |
| Adaptive lens banner (`:635-681`) | Stays between the hero and the outline, not a section | It holds the level switch that drives the layers. Only its copy changes (§4.4). |
| `illustrations` (`:1023`) | Inside **diagram** | Already rendered inside the diagram section. Internals do not change. |
| `contentSections` with `placement: 'diagram'` (`:1114`, `:1139`) | Inside **diagram** | Same as above. |
| `contentSections` with `placement !== 'diagram'` | **reference** | Already the reference section's content (`:198`) |
| `ChapterDiagram` simulators s1–s14, incl. s5 `ProtocolSimulator` (`ChapterDiagram.tsx:513`) | Inside **diagram** (Core in both levels) | Keeps every simulator in the default-open layer. The `ลองเล่น` chip tag makes them findable (I-15). |
| s5 `DiagramFamilyGrid`, C4 explorer, `SwimlaneVsSequence` (`:1114`, `:1148`, `:1235`) | Inside **diagram** | Same host, no change |
| s15 `GlossaryCategoryMap` (`:1128`) | Inside **diagram** (Core); it filters the glossary (Core for s15 via D10) via `handleSelectGlossaryCategory`, which now calls `openSection(…, 'glossary')` | Tile click must still reveal the panel, including after the reader closes it |
| Negotiation dilemma | Inside **friction** | Part of `FrictionPlaybookCard` |
| Footer (AI button, mark read, pagination) | Not a section, always renders | Navigation, not content. The track footer is in §3.4. |

### 1.6 Hero per level

| Part | Beginner | Experienced |
|---|---|---|
| Chapter header: num, roleTag, readTime, read badge, title, subtitle (`:584-610`) | shown | shown |
| Key takeaway line (new): `<p>` with label `สาระสำคัญของบทนี้:` + `chapter.keyTakeaway` | shown | shown |
| Analogy box `เปรียบแบบบ้านๆ (Real-World Analogy)` (`:767-777`) | shown open | shown as a closed `<details>` with the same heading as its `<summary>` |
| Business/Engineer perspective notes (`:779-804`) | shown (by audience mode, unchanged) | shown (unchanged) |

The expand/collapse-all controls move from the header (`:612-632`) to the outline bar (§2). The helper line `คลิกที่หัวข้อเพื่อเปิด/ปิดเนื้อหาย่อย หรือดูทีละส่วน` is removed.

### 1.7 GuideTab refactor (in scope; section internals must not change)

- Each section's JSX moves **verbatim** into its own component under `src/components/guide/sections/`. The only substitutions are:
  - `openSections.X` → `isOpen`
  - `toggleSection('X')` → `onToggle`
  - `activeChapter` → `chapter`
  - Closure handlers/state → props from `ctx`
- No class, heading, markup or behaviour change inside a section.
- Shared props:
  ```ts
  export interface GuideSectionContext {
    audienceMode: AudienceMode;
    onAudienceChange?: (m: AudienceMode) => void;
    onEarnXp?: (amount: number, reason: string) => void;
    onNavigateChapter: (chapterId: string) => void;          // replaces handleSelectChapter for RichText/ContentBlocks
    onDiagramJump: (t: DiagramJumpTarget) => void;           // GuideTab.tsx:204
    onScrollToPlaybook: (chapterId: string) => void;         // GuideTab.tsx:243
    onSearchGlossary: (q: string) => void;                   // GuideTab.tsx:230
    onSelectGlossaryCategory: (c: GlossaryCategory) => void; // GuideTab.tsx:220
    glossaryCategory: GlossaryFilter; setGlossaryCategory: (c: GlossaryFilter) => void;
    glossaryQuery: string; setGlossaryQuery: (q: string) => void;
    c4Level: number; setC4Level: (n: number) => void;
    checkedChecklist: Record<string, boolean>; onToggleChecklistItem: (key: string) => void;
  }
  export interface SectionProps { chapter: Chapter; isOpen: boolean; onToggle: () => void; ctx: GuideSectionContext }
  ```
- State stays in GuideTab: checklist ticks, C4 level and glossary filter/query. Collapsing a section or layer unmounts its body, and today's state must survive that. `mindsetSubTab` and `dilemmaAnswers` (`:91-92`) are dead and are deleted.
- `src/components/guide/sections/registry.tsx` exports `SECTION_COMPONENTS: Record<SectionKey, React.FC<SectionProps>>`. `mindset` and `friction` are thin adapters around the existing `RoleMindsetCard` and `FrictionPlaybookCard`, which do not change.
- The renderer wraps every section in `<section id={\`sec-${key}\`} className="anchor-target" data-layer={layer}>`. Existing inner ids (`friction-playbook-card`, `role-mindset-card`, `glossary-panel`, FAQ ids, s5 jump ids) are kept.
- GuideTab no longer contains `openSections` literals, `expandAllSections`, `collapseAllSections` or the level-order branch (`:723-764`). All open state comes from §1.4 functions.

## 2. In-chapter outline — `src/components/guide/SectionOutline.tsx`

### 2.1 Placement and behaviour
- Renders directly below the lens banner, inside the chapter card.
- `position: sticky; top: var(--header-h); z-index: 30` (the app header is `z-40`, `Header.tsx:53`). Opaque background in both themes; bottom border.
- One horizontal row: `overflow-x-auto`, no wrap on mobile, wraps on `sm:` and up.
- Content, left to right:
  1. For each non-empty layer group: a small layer label (`แก่น`, `นำไปใช้`, `เจาะลึก`), then one chip per present section in layer order.
  2. At the end, the control pair `ขยายทั้งหมด` | `ย่อทั้งหมด`, which calls `expandAll` / `collapseAll`.
- A chip is a `<button>` with `aria-controls="sec-<key>"`. When its section is open, the chip has a filled style and `aria-pressed="true"`.
- A chip with `hasTool` shows a trailing tag `ลองเล่น`.
- Chip click, in order:
  1. `setOpen(openSection(state, layout, key))`
  2. `setPendingScrollId('sec-' + key)`, reusing the effect at `:140-153`
  3. `route.replaceSection(key)` (§5)
  Clicking the chip of an already open section scrolls to it and does not close it. This avoids the accordion toggle trap in I-19.

### 2.2 Offset
- The sticky bar would cover section headings. A ResizeObserver on the bar writes `--outline-h` on `<html>`, using the same pattern as `:126-138`.
- It writes `0px` on unmount (for example, other tabs).
- `index.css` changes the anchor rule to `scroll-margin-top: calc(var(--header-h) + var(--outline-h, 0px) + 16px)`, with `--outline-h: 0px` in `:root`.

### 2.3 Layer headers — `src/components/guide/LayerGroup.tsx`
- Each non-empty layer renders a header `<button aria-expanded>` followed by its section components. The body is rendered only when the layer is expanded.
- Header text: `{name}` · `{n} หัวข้อ` · `≈ {minutes} นาที`, where the names are `แก่น (Core)`, `นำไปใช้ (Apply)` and `เจาะลึก (Deep)`.
- When a layer is collapsed, one muted line under the header lists its chips' labels joined by ` · ` as a preview.
- The Core layer header renders too and is collapsible, so the three layers behave consistently.

## 3. Tracks — `src/data/readingTracks.ts`

### 3.1 Config and functions (pure, unit-tested)

```ts
export const TRACK_CHAPTER_NUMS: Record<ExperienceLevel, readonly number[]> = {
  beginner:    [1, 2, 3, 4, 6, 7, 11, 14],
  experienced: [11, 1, 6, 9, 12, 13, 14],
};
export const TRACK_META: Record<ExperienceLevel, { title: string; description: string }> = {
  beginner:    { title: 'เส้นทางมือใหม่', description: 'ปูพื้นจากต้นน้ำถึงการทดสอบ แล้วปิดด้วยความขัดแย้งที่เจอบ่อย' },
  experienced: { title: 'เส้นทางคนทำงานข้ามทีม', description: 'เริ่มจากความขัดแย้งจริง แล้วลงลึกเรื่องประตูงาน หนี้เทคนิค และยุค AI' },
};

type ChapterRef = Pick<Chapter, 'id' | 'num' | 'readTime'>;
export function resolveTrack(level: ExperienceLevel, chapters: ChapterRef[]): string[];  // nums → ids, config order; unknown num skipped
export function parseReadMinutes(readTime: string): number;                              // '10 นาที' → 10; no digits → 0
export function getTrackMinutes(trackIds: string[], chapters: ChapterRef[]): number;
export type TrackNext = { kind: 'next'; chapterId: string } | { kind: 'end' } | { kind: 'not-in-track' };
export function getTrackNext(trackIds: string[], chapterId: string): TrackNext;
export function getTrackProgress(trackIds: string[], readChapters: string[]):
  { read: number; total: number; firstUnreadId: string | null };                           // read counts only track ids
```

Current data resolves to beginner `['s1','s2','s3','s4','s6','s7','s11','s14']` (≈ 92 นาที) and experienced `['s11','s1','s6','s9','s12','s13','s14']` (≈ 83 นาที).

### 3.2 Index: `src/components/guide/TrackPanel.tsx`
- Renders at the top of **both** index surfaces: the drawer (above the search and list at `:1719`) and the desktop sidebar (above the search at `:396`). The approved design names the drawer. The desktop sidebar is the same index at `lg`, and leaving it without the track would make the track invisible on desktop unless the reader opens the drawer.
- Content:
  - Title `{TRACK_META[level].title}` and `≈ {minutes} นาที`.
  - `อ่านแล้ว {read}/{total}` and a thin progress bar.
  - An ordered list of the track's chapters: step number, `บทที่ {num}: {title}` and a read check. The active chapter is highlighted.
  - A primary button that jumps to `firstUnreadId`: `เริ่มอ่าน` when `read === 0`, `อ่านต่อ` otherwise. When `firstUnreadId === null` it becomes `จบเส้นทางแล้ว — ทำแบบทดสอบ`, which calls `onStartQuiz`.
- Below the panel, a heading `ทุกบท (15)` precedes the existing full list. The search and role filter apply to the full list only.
- The track list is not filtered.
- Clicking a track item or the primary button calls the same navigation as a list item (`route.navigate`, push) and closes the drawer.

### 3.3 Level switch
`TrackPanel` reads `experienceLevel`, so switching level swaps the track immediately. Progress is recomputed from `readChapters` (`types.ts:238`). No new storage is needed.

### 3.4 Chapter footer — `src/components/guide/TrackFooter.tsx`
The component replaces the next-chapter card and the next target of "อ่านจบแล้ว!" in `:1589-1650`. Let `t = getTrackNext(resolveTrack(level, chapters), activeChapterId)`:

| `t.kind` | Next card (right) | "อ่านจบแล้ว! …" button |
|---|---|---|
| `next` | label `บทถัดไปใน track`, text `บทที่ {num}: {title}` → navigate to `t.chapterId` | label `อ่านจบแล้ว! ไปบทถัดไปใน track (+30 XP)`, marks read then navigates to `t.chapterId` |
| `end` | an end card: `จบเส้นทาง{TRACK_META.title}แล้ว` with two buttons, `ทำแบบทดสอบ` (`onStartQuiz`) and `ดูสารบัญทั้งหมด` (opens the index drawer) | label `อ่านจบแล้ว! (+30 XP)`, marks read and does not navigate |
| `not-in-track` | unchanged sequential `บทถัดไป` card (`:1633-1647`) | unchanged (`:1600-1612`) |

The previous-chapter card stays sequential. The AI button (`:1592-1598`) does not change.

## 4. First-visit card — `src/components/guide/FirstVisitCard.tsx`

### 4.1 Trigger and App changes
- The level key is absent on a first visit, and today's code never writes it until a toggle (`App.tsx:16-19`, `:148`).
- `App.tsx` adds `const [levelChosen, setLevelChosen] = useState(() => readStorage('be_guide_exp_level') !== null)`. The level initialiser keeps its `'beginner'` default.
- New `handleChooseInitialLevel(level: ExperienceLevel)`:
  - `setExperienceLevel(level)`
  - `writeStorage('be_guide_exp_level', level)`
  - `setLevelChosen(true)`
  - **No XP** (I-17, I-22)
  - It does not route through `handleExperienceLevelChange`, which early-returns when choosing the already-default `'beginner'` and would then never write the key.
- `handleExperienceLevelChange` also calls `setLevelChosen(true)`. A reader who toggles the level from the header or the lens banner before answering the card has made the choice, so the card must disappear.
- GuideTab receives `showFirstVisit={!levelChosen}` and `onChooseInitialLevel`.

### 4.2 Content (Thai-first)
- Renders in place of the welcome banner (`GuideTab.tsx:320-378`) while `showFirstVisit` is true.
- Heading: `เริ่มจากตรงไหนดี?`
- Option 1 (button): `🌱 ใหม่กับเรื่องนี้`, with the line `ยังไม่คุ้นศัพท์และขั้นตอนระหว่าง Business กับ Engineering เริ่มจากปฐมบท ศัพท์ และแผนภาพ`
- Option 2 (button): `⚡ ทำงานข้ามทีมมาแล้ว`, with the line `เคยคุยงานกับอีกฝั่งมาแล้ว อยากได้แนวคิดหลัก กับดัก และวิธีรับมือความขัดแย้ง`
- Under each option: `เส้นทาง: บท {nums joined by ' → '} · ≈ {minutes} นาที`, computed from §3.1.
- Text button: `ข้ามไปก่อน (ใช้โหมดมือใหม่)`.

### 4.3 Behaviour
- **Choosing an option:** calls `onChooseInitialLevel(level)`. If the page did **not** load with a chapter hash, it navigates (push) to the track's first chapter (beginner `s1`, experienced `s11`) and, below the `lg` breakpoint, opens the index drawer so the track panel is visible. At `lg` and up the sidebar already shows it. If the page loaded with a valid chapter hash, it only sets the level and stays on the linked chapter. A shared link must win over onboarding. This is a decision beyond the approved design; see §10.
- **Skip:** `onChooseInitialLevel('beginner')`, then no navigation and no drawer.
- **Precedence:** the first-visit card suppresses the resume banner (§5.4).

### 4.4 Lens banner copy (G-9)
The level buttons at `:652-673` use the same labels as the card: `🌱 ใหม่กับเรื่องนี้` and `⚡ ทำงานข้ามทีมมาแล้ว`. The explanation line at `:676-680` says what the level now changes:
- beginner: `💡 โหมดมือใหม่: เปิด ปฐมบท · ศัพท์จำเป็น · แผนภาพ ไว้ก่อน ส่วนอื่นพับไว้ในชั้น "นำไปใช้" และ "เจาะลึก"`
- experienced: `⚡ โหมดทำงานข้ามทีม: เปิด แนวคิดหลัก · กับดัก · แผนภาพ ไว้ก่อน วิธีรับมือ Friction อยู่ในชั้น "นำไปใช้"`

Button behaviour (XP, early return) is unchanged.

## 5. Deep links and resume

### 5.1 Pure routing — `src/lib/chapterRoute.ts` (unit-tested)

```ts
export interface ChapterRoute { chapterId: string; section?: SectionKey }
type ChapterRef = Pick<Chapter, 'id' | 'num'>;
export function formatChapterHash(num: number, section?: SectionKey): string;   // '#/ch/5' | '#/ch/5/diagram'
export function parseChapterHash(hash: string, chapters: ChapterRef[]): ChapterRoute | null;
```

`parseChapterHash` rules:
1. `''` or `'#'` → `null`.
2. `/^#\/ch\/(\d{1,2})(?:\/([A-Za-z]+))?\/?$/`: find the chapter by `num`. An unknown num → `null`. A section that fails `isSectionKey` is dropped and the chapter is kept.
3. Legacy `/^#s(\d{1,2})$/` (the RichText href form) → chapter only.
4. Anything else → `null`.

Section presence in that chapter is **not** checked here. It is checked at apply time (§5.2), which needs the level-independent `isSectionPresent`. The canonical hash for a route is `formatChapterHash(num, section)`.

### 5.2 Sync hook — `src/hooks/useChapterRoute.ts` (used in `App.tsx`)
- `activeChapterId` is **lifted from GuideTab (`:85`) into this hook**. It fixes the reset to ch.1 when switching tabs, and it lets App force the guide tab for a chapter hash.
- API:
  ```ts
  function useChapterRoute(chapters: Chapter[], opts: { onChapterRoute: () => void }): {
    activeChapterId: string;
    requestedSection: { key: SectionKey; nonce: number } | null;
    loadedFromHash: boolean;                 // true if the initial hash parsed to a chapter
    navigate(chapterId: string, section?: SectionKey): void;   // history.pushState
    replaceSection(section: SectionKey | null): void;          // history.replaceState, same chapter
  }
  ```
- **Init:** `route = parseChapterHash(location.hash, chapters)`.
  - `activeChapterId = route?.chapterId ?? 's1'` (not the stored last chapter; resume is a banner, §5.4).
  - If `route?.section`, set `requestedSection`.
  - If `location.hash` is non-empty and differs from the canonical hash of the resulting route (or `route` is `null`), `replaceState` to the canonical hash of the chapter shown. This covers `#/ch/99`, `#/ch/abc`, `#/ch/5/xyz` and `#s11`.
- **navigate:** sets state. Pushes `formatChapterHash(num, section)` unless it equals the current hash. It never pushes a duplicate entry.
- **replaceSection:** `replaceState` to `#/ch/{num}` or `#/ch/{num}/{key}`. Outline clicks do not add history entries.
- **popstate:** parse `location.hash`.
  - Valid → set `activeChapterId`, set `requestedSection` (new nonce) if a section is present, and call `opts.onChapterRoute()`. App passes `() => setActiveTab('guide')`.
  - `null` → keep the state and `replaceState` the canonical hash.
  - This handler never pushes.
  - Browser back/forward therefore walks chapter visits. Manual hash edits also arrive as `popstate`.
- **Tabs:** tabs are not routes (out of scope). When `activeTab !== 'guide'`, App calls `history.replaceState(null, '', location.pathname + location.search)`. When the guide tab becomes active again **after another tab**, it `replaceState`s `#/ch/{num}`. The hook never writes a hash on initial load without one, and never writes one before the first navigation. A plain visit keeps a bare URL, so a later visit is not mistaken for a deep link.
- **GuideTab contract:**
  - It receives `activeChapterId`, `requestedSection`, `onNavigateChapter = navigate` and `onReplaceSection = replaceSection`.
  - All 11 call sites listed in §0 call `onNavigateChapter`. `handleSelectChapter` keeps closing the drawer and scrolling to the top.
  - When `requestedSection` changes, GuideTab first applies the re-derived defaults for the chapter (§1.4). Then, if `isSectionPresent(chapter, key)`, it applies `openSection(…, key)` and sets `pendingScrollId('sec-' + key)`. If the section is not present, it calls `replaceSection(null)` and the reader stays at the chapter top.
  - `handleScrollToPlaybook` (`:243-250`) becomes `onNavigateChapter(id, 'friction')` when changing chapter, or `openSection(…,'friction')` plus the scroll when on the same chapter. It still scrolls to `friction-playbook-card`.
- `RichText.tsx:44`: `href` becomes `formatChapterHash(num)` (open-in-new-tab then deep-links correctly). The click still `preventDefault`s and calls `onNavigateChapter`.

### 5.3 Last-chapter persistence
- Key `be_guide_last_chapter` holds a chapter id.
- The hook writes it on every `activeChapterId` change **after** the first navigation or when loaded from a hash. The untouched initial default `'s1'` must never overwrite a stored value before the resume banner can use it.
- The hook captures the stored value once at init as `resumeCandidate`.

### 5.4 Resume banner — `src/components/guide/ResumeBanner.tsx`
- **Shows when all of these hold:**
  - `!loadedFromHash`
  - `resumeCandidate` is a valid chapter id
  - `resumeCandidate !== activeChapterId`
  - the first-visit card is not showing
  - it has not been dismissed in this page session
- **Placement:** above the chapter top navigation bar (`:495`).
- **Copy:** `อ่านต่อจากครั้งก่อน? บทที่ {num}: {title}`, with a button `อ่านต่อบทที่ {num}` (navigate, push) and an icon button `ปิด` (`aria-label="ปิดแถบอ่านต่อ"`).
- **Hides after** either button or any other navigation. Dismissal is session-only (component state); a later visit can show it again.

## 6. State and storage keys

| Key / state | Owner | Type | Written when | New? |
|---|---|---|---|---|
| `be_guide_exp_level` | App | `'beginner' \| 'experienced'` | level toggle (`App.tsx:150`), first-visit choice or skip | existing; new write path |
| `be_guide_last_chapter` | `useChapterRoute` | chapter id (`'s1'`…`'s15'`) | active chapter changes after the first navigation | **new** |
| `be_guide_stats` (`readChapters`, `bookmarks`) | App | JSON | unchanged; track progress reads `readChapters` | existing |
| `be_guide_theme`, `be_guide_badges` | App | — | unchanged | existing |
| URL hash `#/ch/<num>[/<sectionKey>]` | `useChapterRoute` | string | push on chapter navigation, replace on outline click, invalid-hash fix and tab change | **new** |
| `levelChosen` | App state | boolean | init from storage presence; set on choice, skip or toggle | **new** |
| `activeChapterId` | `useChapterRoute` (moved from `GuideTab.tsx:85`) | string | navigate / popstate | moved |
| `requestedSection` | `useChapterRoute` | `{ key, nonce } \| null` | hash with a section at init or popstate | **new** |
| `openState` (`OpenState`) | GuideTab | §1.4 | derived on chapter/level change; chips, headers, expand/collapse | replaces `openSections` |
| `resumeDismissed` | ResumeBanner / GuideTab | boolean | dismiss or navigation | **new**, not persisted |
| `--outline-h` CSS var | SectionOutline | px | ResizeObserver | **new** |

New storage access goes through `src/lib/storage.ts` (`readStorage(key): string | null`, `writeStorage(key, value): void`), each wrapped in `try/catch`, so private mode or blocked storage degrades to defaults. Existing calls are not migrated in this round.

## 7. Component and file map

| Path | Kind | Purpose |
|---|---|---|
| `src/data/sectionLayers.ts` | new, pure | §1.1–1.4 config, `CHAPTER_CORE_OVERRIDES`, presence, derivation, `getReferenceSections` |
| `src/data/readingTracks.ts` | new, pure | §3.1 |
| `src/lib/chapterRoute.ts` | new, pure | §5.1 |
| `src/lib/storage.ts` | new | guarded localStorage helpers |
| `src/hooks/useChapterRoute.ts` | new | §5.2–5.3 |
| `src/components/guide/sections/{Primer,Jargon,Dialogue,Diagram,Faq,Examples,CoreConcepts,Reference,Workflow,Pitfalls,Checklist,Glossary}Section.tsx` | new | JSX moved verbatim from `GuideTab.tsx` at the lines in §0 |
| `src/components/guide/sections/registry.tsx` | new | `SECTION_COMPONENTS` + mindset/friction adapters + `GuideSectionContext`/`SectionProps` types |
| `src/components/guide/ChapterHero.tsx` | new | §1.6 (header, key takeaway, analogy, notes) |
| `src/components/guide/SectionOutline.tsx` | new | §2.1–2.2 |
| `src/components/guide/LayerGroup.tsx` | new | §2.3 |
| `src/components/guide/TrackPanel.tsx` | new | §3.2 (used in the sidebar and the drawer) |
| `src/components/guide/TrackFooter.tsx` | new | §3.4 |
| `src/components/guide/FirstVisitCard.tsx` | new | §4 |
| `src/components/guide/ResumeBanner.tsx` | new | §5.4 |
| `src/components/GuideTab.tsx` | modified | orchestration only: index, nav bar, lens banner, hero, outline, layers, footer; controlled `activeChapterId` |
| `src/App.tsx` | modified | `useChapterRoute`, `levelChosen`, `handleChooseInitialLevel`, tab ↔ hash rule, new GuideTab props |
| `src/components/content/RichText.tsx` | modified | href only (§5.2) |
| `src/index.css` | modified | `--outline-h` and the anchor rule (§2.2) |
| `src/data/sectionLayers.test.ts`, `src/data/readingTracks.test.ts`, `src/lib/chapterRoute.test.ts` | new | §8 |
| `package.json` | modified | `vitest` dev dep; `"test": "vitest run"` |

`RoleMindsetCard.tsx`, `FrictionPlaybookCard.tsx`, `FrictionFaqSection.tsx`, `ChapterDiagram.tsx`, `ProtocolSimulator.tsx`, `glossary/*`, `diagrams/*`, `content/ContentBlocks.tsx` and all chapter data files **do not change**.

## 8. Testing

- Add `vitest` as a dev dependency. Pick the newest release whose `peerDependencies.vite` range includes `^8`; check with `bun pm view vitest peerDependencies` before installing.
- Add the script `"test": "vitest run"`, run as **`bun run test`**. Plain `bun test` starts Bun's own runner instead; it cannot load `CHAPTERS` because Bun resolves `chaptersData.tsx` to itself (§0).
- Vitest reuses `vite.config.ts`. Use the default `node` environment and add no DOM library.
- Test files import from `vitest` explicitly (`import { describe, it, expect } from 'vitest'`) so `tsc --noEmit` (which typechecks them, `tsconfig.json` has no `include`) passes without global types.
- Tests import `CHAPTERS` from `../data/chaptersData` wherever real data is needed.

Required cases:

| File | Cases |
|---|---|
| `sectionLayers.test.ts` | each level's config contains all 14 keys exactly once; `getLayerOf` matches the table for 3 sampled keys per level; `getChapterLayout('beginner', s1)` core = `['primer','jargon','diagram']`; s15 has no `jargon` (beginner core = `['glossary','primer','diagram']`); overrides: s11 core starts with `faq` and s15 core starts with `glossary` for both levels, neither key appears in apply/deep for that chapter, and `getLayerOf(level,'faq','s1')` is still `apply`; `faq` present only in s11; `reference` present exactly in s1, s2, s5, s6, s8, s12, s13, s14; layer minutes = sum of metas; `deriveOpenState` opens core layer + core sections only; `collapseAll` expands all layers and closes all sections; `expandAll` opens everything present; `openSection` on a deep key expands deep and opens only that key; `openSection` for an absent key returns the same state |
| `readingTracks.test.ts` | `resolveTrack` returns the two id lists in §3.1; `parseReadMinutes('10 นาที') === 10`, `('') === 0`; track minutes 92 / 83; `getTrackNext` beginner s4 → s6, s14 → end, s5 → not-in-track; experienced s11 → s1, s1 → s6; `getTrackProgress` counts only track ids (`['s1','s5']` → read 1) and `firstUnreadId` skips read ids; all read → `null` |
| `chapterRoute.test.ts` | format round-trips for num 1 and 15 with and without a section; `#/ch/5` → s5; `#/ch/5/diagram` → s5 + diagram; `#/ch/5/` → s5; `#/ch/5/xyz` → s5, no section; `#/ch/16`, `#/ch/0`, `#/ch/abc`, `#/foo`, `''` → null; `#s11` → s11 |

UI is verified in the browser preview against §9 (light and dark, 375px and desktop). `bun run lint` and `bun run build` must pass.

## 9. Acceptance criteria

**Layers (§1)**
1. With a fresh profile and level beginner, ch.1 shows the hero (with the key takeaway and an open analogy box), then Core: Primer, Jargon, Diagram, all open. Apply and Deep are collapsed and show `n หัวข้อ · ≈ m นาที` plus a preview line.
2. On ch.1 as beginner, the Jargon Buster is reachable with **0** clicks by scrolling past the Primer, or with **1** chip click. This meets the ≤ 2 actions target in synthesis §6e.5.
3. Switching to experienced on ch.1 re-renders Core as Core Concepts, Pitfalls and Diagram, all open. Every other section is collapsed. The analogy box is a closed `<details>`.
4. Role Mindset is inside Deep for both levels and never renders above Core.
5. On s15, Jargon is absent from the outline and the layers, and the Glossary is the first Core section, open, in both levels. On s11, the FAQ is the first Core section, open, in both levels. On s3, Reference is absent.
6. `ขยายทั้งหมด` opens every present section. `ย่อทั้งหมด` leaves all layer headers expanded with every section closed, including mindset, friction, reference and glossary.
7. Section internals match the pre-refactor build: checklist ticks survive a collapse and re-open, the C4 level persists, s11 FAQ playbook links still land on `friction-playbook-card`, and s15 category tiles still filter and reveal the glossary panel.
8. `GuideTab.tsx` contains no `openSections` literal and no level-specific section ordering.

**Outline (§2)**
9. The chip bar stays under the app header while scrolling (mobile and desktop) and scrolls horizontally on 375px without widening the page.
10. Clicking a Deep chip expands Deep, opens that section and scrolls so its heading sits fully below the header and the chip bar. The URL becomes `#/ch/<num>/<key>` without a new history entry.
11. The Diagram chip shows `ลองเล่น` in all chapters. The friction chip shows it in s1, s2 and s6 only.

**Tracks (§3)**
12. The index (drawer and desktop sidebar) shows the current level's track above `ทุกบท (15)`, with `อ่านแล้ว n/total` counting only track chapters.
13. As beginner on ch.4, the footer card reads `บทถัดไปใน track` → บทที่ 6. On ch.14 it shows the end card with `ทำแบบทดสอบ` and `ดูสารบัญทั้งหมด`. On ch.5 it shows the sequential `บทถัดไป` → บทที่ 6.
14. "อ่านจบแล้ว!" on ch.14 (beginner) marks it read and stays on ch.14.
15. Switching level swaps the track panel and footer target without reload.

**First visit (§4)**
16. With `be_guide_exp_level` absent and no hash, the card replaces the welcome banner. Choosing `⚡ ทำงานข้ามทีมมาแล้ว` sets experienced, writes the key, awards no XP, opens ch.11 and (at 375px) opens the drawer showing the experienced track.
17. `ข้ามไปก่อน` writes `beginner`, keeps ch.1 and awards no XP. After a reload the card does not reappear.
18. Toggling the level in the lens banner before answering hides the card permanently.
19. With the key absent and `#/ch/8` in the URL, choosing a level keeps ch.8.

**Deep links and resume (§5)**
20. Loading `#/ch/6/checklist` opens ch.6 on the guide tab with the Checklist open and scrolled into view.
21. Loading `#/ch/99` shows ch.1 and the URL becomes `#/ch/1`. Loading `#/ch/6/xyz` shows ch.6 at the top and the URL becomes `#/ch/6`. There are no console errors.
22. Navigating ch.1 → ch.2 → ch.3 and pressing Back twice returns to ch.1, updating the chapter each time.
23. Switching to the Quiz tab clears the hash. Returning to the guide keeps the same chapter (no reset to ch.1) and restores `#/ch/<num>`.
24. After viewing ch.7, opening the app URL with no hash (a new visit) shows the banner `อ่านต่อบทที่ 7` appears. Its button opens ch.7. `ปิด` hides it until the next page load. The stored value is still `s7` after a reload that only shows ch.1.
25. `bun run test` passes all §8 cases. `bun run lint` and `bun run build` pass.

## 10. Decisions made while specifying (beyond the approved design)

| # | Decision | Reason |
|---|---|---|
| D1 | The hero adds a `keyTakeaway` line. For experienced readers the analogy stays reachable as a closed `<details>`. | "Hero summary" needs a summary. `keyTakeaway` exists (`types.ts:189`) but is never rendered, and synthesis §6d asks for it. The experienced hero must not silently drop the analogy. |
| D2 | `ย่อทั้งหมด` = all layers expanded with all sections closed | The G-1 evidence is that collapse-all turned the chapter into a menu. Collapsing layers too would hide the menu. |
| D3 | Open state is re-derived on chapter change, not only on level change | Presence differs per chapter, and the Core default is the point of the design |
| D4 | Track panel also in the desktop sidebar | Otherwise the track is invisible on desktop unless the drawer is opened |
| D5 | A deep link wins over the first-visit navigation | A shared link is explicit intent (I-25) |
| D6 | `activeChapterId` lifted to App via `useChapterRoute` | Required for tab ↔ hash sync. It also fixes the ch.1 reset on tab switch. |
| D7 | `ลองเล่น` tag on outline chips | Covers I-15/G-5/G-6 without moving tools |
| D8 | Level button labels unified with the first-visit card | One vocabulary for the level (G-9) |
| D9 | Outline clicks use `replaceState`, chapter changes use `pushState` | Back walks chapters, not scroll positions |
| D10 | **Owner decision:** `CHAPTER_CORE_OVERRIDES` promotes s11 `faq` and s15 `glossary` to the front of Core for both levels (§1.1) | They are those chapters' main content, and s11 is the experienced track's first stop |
| D11 | **Owner decision:** track completion awards no XP or badge | XP stays on the learning actions already in place |

## 11. Risks

| Risk | Mitigation |
|---|---|
| s11 and s15 Core get longer because the FAQ (12 items) and the glossary (99 terms) are promoted | Accepted (D10). Both keep their internal accordions and filters. |
| The s5 Core is long (diagram hosts the family grid, C4 explorer and swimlane blocks) | Accepted for this round. Content dedupe is round C. |
| The verbatim JSX move breaks a closure (for example `handleSelectChapter`) or loses state | State stays in GuideTab and is passed through `ctx`. AC 7 checks each interactive internal. The diff of each moved block must be whitespace + identifier substitutions only. |
| Sticky outline covers anchor targets | `--outline-h` in the shared anchor rule (§2.2). AC 10. `GlossaryPanel.tsx:92` uses `scroll-mt-24`, but the unlayered rule overrides it (`index.css` comment at `:53-58`). |
| Push/pop loops or duplicate history entries | Pop handlers never push. `navigate` skips identical hashes. AC 22. |
| The initial default overwrites the resume value | Write only after the first navigation (§5.3). AC 24. |
| `bun test` is used instead of `bun run test` | The script name and §8 say it explicitly |
| Vitest peer range vs Vite 8 | Version check step in §8 |
| Existing users with no level key see the card once | Acceptable: one click or skip. It is never shown again. |

## 12. Out of scope

- Index search (I-03) and quiz results that teach (I-05, I-08): round B.
- Mobile shell (I-07, I-20, I-24) and content dedupe, including templated playbooks and the global Role Mindset (I-09): round C. This round only moves Role Mindset to Deep.
- Per-section open-rate analytics (§6e.5), persisting checklist ticks (I-27) and tab routes.
