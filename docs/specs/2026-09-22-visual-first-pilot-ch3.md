# Spec: Visual-first chapter pilot on ch.3 (UX/UI ไม่ใช่แค่ความสวย)

- Date: 2026-09-22
- Status: Ready for implementation (scope and goals agreed with the owner; decisions made while specifying are in §10)
- Target app: `/Users/Pathompong/Sites/Personal/biz-dev-guide/src`
- Pilot chapter: `s3`. Roll out to other chapters only after §9 passes (see §11).
- UI copy is **Thai-first**. English appears only in parentheses after the Thai label. Every string quoted in this spec is the literal copy to ship.
- Branching: `GuideTab.tsx` and `RoleMindsetCard.tsx` have uncommitted edits on `fix/stale-perspective-copy`. Start from `main` after that branch lands.

## 0. Background and verified facts

Chapters read as walls of text. On desktop (viewport 964px high), ch.3 shows about 4,100 Thai characters and about 2,485px (about 2.6 screens) between the chapter title and the diagram section. Ch.1, ch.4 and ch.7 are similar. Mobile was not measured. The "diagram" readers finally reach in ch.3 is also text.

**Verified code facts** (branch `fix/stale-perspective-copy`, commit `e5f604d`):

| Fact | Where |
|---|---|
| Every chapter gets a text-only "illustration" card. It has a `🎨 Visual Architecture` chip, a `Type: {svgType}` badge, the `visualMetaphor` box, a "📐 … (Visual Blueprint Scene)" block that prints `svgDescription`, an element grid and a takeaway. Nothing draws these cards. | `DiagramSection.tsx:38-127`, `chapterIllustrations.ts` |
| The s3 `svgDescription` still says `Paper Sketch ($10) ➔ … ➔ Live Production Code ($100,000)`, which contradicts commit `07c85fd` (Boehm multipliers removed). The s9 entry has the same problem (`$100 ➔ … ➔ $50,000+`). | `chapterIllustrations.ts:41`, `:130` |
| `svgType` and `svgDescription` are read only by `DiagramSection.tsx` (lines 62 and 83). | grep across `src` |
| Illustrations are merged into `Chapter.illustrations` in `chaptersData.ts`, primary card first, then `EXTRA_CHAPTER_ILLUSTRATIONS` (s5 only). | `chaptersData.ts:14-22` |
| Real SVG figures live in `src/components/figures/`. The registry is `FIGURES: Record<FigureKey, …>` in `index.ts`, and its header comment holds the porting rules. Theme tokens are `.fig-scope` / `.dark .fig-scope` in `index.css:160-200`. | `figures/index.ts`, `types.ts:14-34` |
| Figures exist only for ch.1, 5, 8 and 12. Ch.1's figures sit inside the collapsed "เนื้อหาอ้างอิง (Reference)" section (Deep layer). | `chapterContentBlocks.ts` |
| The Refund domain already exists: `RefundSwimlane` (lanes ลูกค้า / ทีม support / ระบบคืนเงิน, start event "แจ้งของไม่ถึง") and `RefundSequence`. | `figures/Refund*.tsx` |
| `ChapterHero` renders the header (num, role tag, read time, `h1` title, `enTerm`, subtitle, `data-key-takeaway`), then the analogy box (open box for beginners, `<details>` for experienced readers), then the Business/Engineer notes. After it, GuideTab renders the lens banner, `SectionOutline` and the layer groups. | `ChapterHero.tsx`, `GuideTab.tsx:583-660` |
| Core order is beginner `primer → jargon → diagram` and experienced `coreConcepts → pitfalls → diagram`. `deriveOpenState(layout)` opens every Core section. It has no chapter parameter. | `sectionLayers.ts:15-26`, `:117-119`; GuideTab call sites `165`, `169`, `183` |
| The s3 `ChapterDiagram` branch is 4 text cards: time to make, relative cost, time to change. Card 1 is labelled `1. Wireframe / Sketch` and card 2 `2. Low-Fi Wireframe`. | `ChapterDiagram.tsx:254-281` |
| s3 `diagramDescription` mentions "Low-Fi Wireframe, Mid-Fi, High-Fi Prototype", which does not match the 4 levels used everywhere else. | `chapters1_5.ts` (s3 block, from line 288) |
| Copy budgets: `plainAnalogy` ≤ 120, `realWorldScenario` ≤ 220, jargon fields ≤ 120/140/160. | `copyBudgets.test.ts` |
| Tailwind is v4 (`^4.3.3`), so container queries (`@container`, `@min-[…]:`) work without a plugin. Vitest `5.0.1` runs in the `node` environment with no DOM library. | `package.json` |

## 1. Goals and non-goals

**Goals**

- G1. In s3, the first thing after the title block is a real figure. The figure and its caption explain the chapter's point without the body text.
- G2. The s3 page is shorter overall, with fewer visible characters and less height than before, even with the figure added.
- G3. Author notes stop leaking to readers in **all** chapters: the Blueprint block, the `Type:` badge and the `$` figures.
- G4. Build a reusable "hero figure" slot. Chapters without one render exactly as today.

**Non-goals**

- No new figures for other chapters in this pilot.
- No metaphor drawings (trains, icebergs, kitchens, orbits). Figures show the real artefact: screens, flows, documents.
- No screenshots of real products.
- No change to the lens banner, `SectionOutline`, layer model, tracks or other chapters' copy (beyond §5.2).
- No generic "figure next to paragraph" placement API yet (see §4).

## 2. New figure — `RefundFidelity` (`'refund-fidelity'`)

### 2.1 Content

One fictional mobile screen, **"ขอคืนเงิน"** (refund request for an item that did not arrive, the same story as `RefundSwimlane`), drawn at 4 fidelity levels. Every level uses the **same layout** (same element positions), so the reader sees one screen maturing:

1. header bar with the screen title
2. order card (thumbnail, product name, price)
3. reason picker
4. photo upload
5. primary button

| # | Label (HTML, above the panel) | What the SVG shows | Cost line (HTML, below the panel) |
|---|---|---|---|
| 1 | `ร่างมือ (Sketch)` | Hand-drawn look: slightly wobbly `<path>` strokes, `strokeLinecap="round"`, `--fig-text-2` on `--fig-bg`, no fill. The title reads "ขอคืนเงิน" and the button reads "ส่ง". Other text is scribble lines. The thumbnail is a box with an X. | `แก้: ลบแล้ววาดใหม่` |
| 2 | `โครงร่าง (Lo-fi Wireframe)` | Straight grey boxes (`--fig-surface-2` / `--fig-border`) and grey text bars. Bracketed placeholders in `--fig-text-muted`: "[รายการสั่งซื้อ]", "[เหตุผล ▾]", "[แนบรูป]", "[ปุ่มส่ง]". | `แก้: ย้ายกล่อง` |
| 3 | `ภาพเสมือนจริง (Hi-fi Mockup)` | Colour and real copy. Accent header (`--fig-accent` / `--fig-accent-bg`). Text: "ขอคืนเงิน", "#A1024 หูฟังไร้สาย", "฿1,290", "ไม่ได้รับสินค้า ▾", "แนบรูป (ไม่บังคับ)", and a filled accent button "ส่งคำขอ". | `แก้: ทำแบบใหม่บางส่วน` |
| 4 | `ของจริง (Production)` | Same as 3, plus what only real data reveals. The long name is truncated ("หูฟังไร้สาย รุ่น Pro Max…"). An inline error under the upload, in `--fig-warn*` with a "!" glyph, reads "อัปโหลดไม่สำเร็จ ลองใหม่". The button is disabled (muted fill). A small inset card at the bottom reads "จอว่าง: ยังไม่มีคำสั่งซื้อที่ขอคืนได้". | `แก้: แบบ + โค้ด + ทดสอบใหม่` |

Below the 4 panels (4-up mode only) sits one relative scale: a thin arrow spanning the grid, labelled `แก้ง่าย` at the left and `แก้ยาก` at the right. There are **no `$` amounts, multipliers or numbers of any kind** on cost.

Hi-fi and Production need not be pixel perfect. Colour, real Thai copy and visible states are enough.

### 2.2 Structure and porting rules

- File: `src/components/figures/RefundFidelity.tsx`, exported as `RefundFidelity: React.FC<FigureProps>`.
- The 4 levels are **4 separate `<svg>` panels**, not one wide SVG, so they can reflow. Each panel has `viewBox="0 0 150 240"`, `role="img"`, `aria-labelledby` pointing to its own `<title>` and `<desc>`, and ids made with `useId()` (one `uid`, suffixed `-t1`, `-d1`, …). Each panel scales with `width: 100%; height: auto`.
- Labels, cost lines, the scale and the tabs are **HTML**, not SVG text, for Thai shaping, wrapping and screen readers.
- Colours come only from `var(--fig-*)`. No new tokens. The Production error uses the `--fig-warn*` tokens and a "!" glyph plus text, so colour is never the only cue.
- SVG text: `fontFamily="inherit"`, `fontSize` ≥ 10 user units. The number of text strings per panel is not capped, but every string must fit inside its box at `fontSize` ≥ 10 (no overflow past the 150-wide panel). At the smallest 4-up panel width (about 150px) this renders at ≥ 10px.
- Root: `<div className={`fig-scope @container ${className ?? ''}`}>`.
- This is the first figure with local state (the selected tab). Add one line to the registry header comment: "Figures may hold view-only UI state (e.g. mobile tabs); content stays static."

Suggested `<title>` / `<desc>` per panel (Thai), for example panel 4: title "ขั้นที่ 4 ของจริง (Production)", desc "หน้าจอขอคืนเงินที่ใช้ข้อมูลจริง ชื่อสินค้ายาวถูกตัด มีข้อความแจ้งอัปโหลดรูปไม่สำเร็จ ปุ่มส่งกดไม่ได้ และมีตัวอย่างจอว่างเมื่อไม่มีคำสั่งซื้อ". Write the other three in the same pattern.

### 2.3 Responsive behaviour (container-based)

The switch depends on the **reader column width**, not the viewport, because the desktop sidebar narrows the column. Breakpoint: container ≥ 640px.

| Container width | Layout |
|---|---|
| ≥ 640px (`@min-[640px]:`) | 4-up grid (`grid-cols-4 gap-3`). All panels visible. Tablist hidden (`@min-[640px]:hidden`). Scale arrow shown. |
| < 640px | Segmented tabs above one panel. Panel width `max-w-[260px] mx-auto` (about 416px tall). Below the panel: its cost line and `ขั้น {n} จาก 4`. Scale arrow hidden. |

Tab mode details:

- Tab labels are short: `Sketch`, `Lo-fi`, `Hi-fi`, `ของจริง`. Each tab is at least 44px tall, and the 4 tabs share the width equally.
- Default selection is panel 1 (`Sketch`). Selection is not persisted.
- **No swipe gesture.** Tabs plus arrow keys are enough. Swipe conflicts with page scrolling and cannot be discovered.
- Implementation is CSS-only switching. All 4 panels stay rendered. Non-selected panels get `hidden @min-[640px]:block`, so 4-up mode shows everything no matter which tab is selected, and no resize listener is needed.

### 2.4 Accessibility

- Tablist: `role="tablist"`, `aria-label="เลือกขั้นความละเอียดของงานดีไซน์"`. Each tab is a `<button role="tab" aria-selected aria-controls={panelId} tabIndex={selected ? 0 : -1}>` (roving tabindex).
- Keys: ArrowLeft/ArrowRight move and wrap, Home/End jump to the ends. Focus follows selection. The key logic lives in the pure helper `nextTabIndex` (§3.4).
- Each panel wrapper: `role="tabpanel"`, `id={panelId}`, `aria-labelledby={labelId}`, where `labelId` is the panel's own HTML label, not the tab. This stays valid in 4-up mode, where the tablist is `display:none`.
- There is no motion. Focus rings use the existing `focus-visible:` utilities.
- Contrast relies on the `.fig-scope` tokens. Verify light and dark in the preview.

## 3. Hero figure slot

### 3.1 Data shape

`src/types.ts`:

```ts
export type FigureKey = /* … existing … */ | 'refund-fidelity';

export interface ChapterHeroFigure {
  figureKey: FigureKey;
  /** One line, plain text (no RichText/links). Must make sense without the chapter body. */
  caption: string;
}

export interface Chapter {
  // … existing …
  heroFigure?: ChapterHeroFigure;
}
```

New file `src/data/chapterHeroFigures.ts`:

```ts
import type { ChapterHeroFigure } from '../types';

export const CHAPTER_HERO_FIGURES: Readonly<Record<string, ChapterHeroFigure>> = {
  s3: {
    figureKey: 'refund-fidelity',
    caption: 'หน้าจอขอคืนเงินหน้าเดียว 4 ขั้น ยิ่งใกล้ของจริง ยิ่งแก้ยาก',
  },
};
```

The caption works for both the 4-up and tab layouts, so it avoids words like "ทางขวา".

`chaptersData.ts` merges it like the other maps: `heroFigure: CHAPTER_HERO_FIGURES[chapter.id]`.

The hero gets its own field, not a `chapterContentBlocks` placement, because it is exactly one slot per chapter with a plain-text caption. A `ContentBlock` would bring RichText, an optional title and section headings, none of which apply, and it would need a new `placement` value that the reference filter must learn to skip.

### 3.2 Component — `src/components/guide/HeroFigure.tsx`

```ts
interface HeroFigureProps {
  figure: ChapterHeroFigure;
  analogy?: string; // chapter.plainAnalogy, rendered as one plain line
}
```

Markup:

```tsx
<figure data-hero-figure className="space-y-2">
  <Figure />  {/* FIGURES[figure.figureKey] */}
  <figcaption className="text-xs sm:text-sm font-semibold text-neutral-800 dark:text-[#e5e5e5]">…</figcaption>
  {analogy && <p data-analogy className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3]">💡 {analogy}</p>}
</figure>
```

If `FIGURES[key]` is missing (impossible under the type, but guard it), render nothing.

### 3.3 Placement — `ChapterHero.tsx`

- Render `<HeroFigure>` **inside the header block, right after the subtitle `<p>` and before `data-key-takeaway`**, for both experience levels. The key takeaway then reads as the conclusion of the figure.
- When `chapter.heroFigure` is set, the analogy box (the open box or `<details>`) is **not rendered**. The analogy appears only as the one line inside `HeroFigure`, for both levels.
- The Business/Engineer notes, lens banner and outline stay unchanged.
- When `heroFigure` is undefined, the output is identical to today.

Resulting s3 order: title block → **hero figure + caption + analogy line** → key takeaway → Business/Engineer notes → lens banner → outline → Core: primer (shorter) → jargon (collapsed, chips) → diagram (widget).

### 3.4 Tab key helper — `src/lib/tabKeys.ts` (pure)

```ts
export function nextTabIndex(current: number, key: string, count: number): number | null;
// ArrowRight → (current+1) % count; ArrowLeft → (current-1+count) % count;
// Home → 0; End → count-1; any other key → null (caller ignores).
```

## 4. Secondary figures next to their paragraph (s3 decision)

**Nothing moves in s3.** s3 has no secondary static figure. Its only other visual is the interactive `ChapterDiagram` widget, which stays in the diagram section as the "try it" step after the reader understands the idea (owner decision 6). Adding an inline-placement mechanism now would have no s3 consumer, so it is deferred to rollout (§11). The expected shape then is a new `ChapterContentSection.placement` value that anchors blocks after a named section, but that is not specified here.

## 5. Text cuts (net shorter page)

### 5.1 s3 only — `chapters1_5.ts` and `chapterIllustrations.ts`

| Field | Before | After |
|---|---|---|
| `CHAPTER_ILLUSTRATIONS.s3` | whole card, including `$10 … $100,000` | **deleted**. s3 `illustrations` becomes `[]`, and the existing `length > 0` guard hides the block. This also fixes owner item 5. |
| `plainAnalogy` | `เหมือนสร้างบ้าน: ย้ายห้องน้ำบนพิมพ์เขียวแค่ลบแล้ววาดใหม่ แต่ถ้าเทปูนวางท่อเสร็จแล้วค่อยย้าย ต้องทุบทิ้ง` | `เหมือนสร้างบ้าน: ย้ายห้องน้ำบนพิมพ์เขียวแค่ลบ แต่เทปูนแล้วต้องทุบ` |
| `beginnerPrimer.realWorldScenario` (about 160 chars, door example) | push/pull door story | `ทีมเห็นจอขอคืนเงินครั้งแรกตอนเป็นโค้ด -> เพิ่งพบว่าไม่มีจอตอนอัปโหลดรูปไม่สำเร็จ -> ต้องแก้ทั้งแบบและโค้ด -> ถ้าเจอตั้งแต่ Lo-fi แค่เพิ่มกล่องเดียว` (ties the primer to the hero figure) |
| `diagramTitle` | `Design Fidelity Ladder (บันได 4 ขั้นความละเอียดของงานดีไซน์)` | `ลองเทียบ 4 ขั้นของงานดีไซน์ (Design Fidelity)` |
| `diagramDescription` | mentions Mid-Fi and cost | `เวลาทำและความยากในการแก้ ตั้งแต่ Sketch ถึงโค้ดจริง` |
| `ChapterDiagram.tsx` s3 card 1 `step` | `1. Wireframe / Sketch` | `1. Sketch` (so the names match the figure; nothing else in the widget changes) |

`whatIsIt` and `whyItMatters` stay unchanged. They define UX/UI, which the figure does not.

### 5.2 All chapters — `DiagramSection.tsx`, `types.ts`, `chapterIllustrations.ts`

Remove from the illustration card:

- the "📐 … (Visual Blueprint Scene)" block (`DiagramSection.tsx:76-85`)
- the `Type: {ill.svgType}` badge (`:61-63`)
- the `🎨 Visual Architecture` chip (`:47-50`). It promises a drawing that does not exist (§10 D3).

Keep the title/subtitle, `visualMetaphor` box, elements grid and takeaway.

`svgType` and `svgDescription` then become **dead fields**. Delete them from `ChapterIllustration` in `types.ts` and from all 15 entries in `CHAPTER_ILLUSTRATIONS` plus the s5 entry in `EXTRA_CHAPTER_ILLUSTRATIONS`. `bun run lint` catches any reader that is missed. This also removes the s9 `$100 … $50,000+` text from the source. Do not keep the fields "for future drawing". The hero-figure slot replaces that intent, and a figure spec will be written per chapter at rollout.

### 5.3 s3 jargon collapsed by default, with chips

- `sectionLayers.ts`: add

  ```ts
  /** Core sections that start closed for a chapter (visual-first pilot). Layer stays expanded. */
  export const CHAPTER_CORE_COLLAPSED: Readonly<Record<string, readonly SectionKey[]>> = { s3: ['jargon'] };
  export function deriveOpenState(layout: LayerGroup[], chapterId?: string): OpenState
  ```

  Open Core sections except those listed for `chapterId`. When `chapterId` is omitted, behaviour is unchanged. `expandAll`, `collapseAll` and `openSection` are unchanged. Jargon stays in the beginner Core layer (no layer move). The outline chip still jumps to it, and `openSection` opens it.
- `GuideTab.tsx`: pass `activeChapter.id` at the 3 `deriveOpenState` call sites (currently lines 165, 169, 183). Make no other change.
- `JargonSection.tsx`: when `!isOpen`, render the term names as non-interactive chips (`<span>`) inside the existing header button, under the subtitle. Show at most 5, then `+{n}`. The whole header still toggles, so there are no nested interactive elements. This applies to every chapter whenever the section is closed (§10 D4). The open state is unchanged.

## 6. Component and file map

| Path | Kind | Change |
|---|---|---|
| `src/components/figures/RefundFidelity.tsx` | new | §2 |
| `src/components/figures/index.ts` | modified | register `'refund-fidelity'`; add one line to the header comment |
| `src/components/guide/HeroFigure.tsx` | new | §3.2 |
| `src/components/guide/ChapterHero.tsx` | modified | §3.3 |
| `src/lib/tabKeys.ts` | new, pure | §3.4 |
| `src/data/chapterHeroFigures.ts` | new | §3.1 |
| `src/data/chaptersData.ts` | modified | merge `heroFigure` |
| `src/types.ts` | modified | `FigureKey`, `ChapterHeroFigure`, `Chapter.heroFigure`; drop `svgType`/`svgDescription` |
| `src/data/chapterIllustrations.ts` | modified | delete s3 entry; drop the two fields everywhere |
| `src/components/guide/sections/DiagramSection.tsx` | modified | §5.2 removals only |
| `src/data/chapters/chapters1_5.ts` | modified | s3 copy per §5.1 |
| `src/components/ChapterDiagram.tsx` | modified | s3 card 1 label only |
| `src/data/sectionLayers.ts` | modified | §5.3 |
| `src/components/GuideTab.tsx` | modified | 3 call sites |
| `src/components/guide/sections/JargonSection.tsx` | modified | closed-state chips |
| tests | new/modified | §7 |

## 7. Test plan

Scripts present in `package.json`: `bun run lint` (`tsc --noEmit`, which is also the typecheck), `bun run test` (`vitest run`; not `bun test`), and `bun run build`. There is no separate `typecheck` script. Tests import from `vitest` explicitly and run in the `node` environment, so no component rendering tests.

| File | Cases |
|---|---|
| `src/data/copyBudgets.test.ts` (update) | for every chapter with `heroFigure`: `caption` ≤ 60 chars, contains no `\n`, and does not start with a banned opener; `plainAnalogy` ≤ 80 chars (one line under the figure). Existing budgets stay unchanged. |
| `src/data/visualFirst.test.ts` (new) | s3 has `heroFigure.figureKey === 'refund-fidelity'`; every `heroFigure.figureKey` is a key of `FIGURES`; the set of chapters with `heroFigure` equals `['s3']` (pilot guard; update at rollout); s3 `illustrations` is `[]`; no `/\$\s?\d/` in `JSON.stringify` of the s3 chapter or of `CHAPTER_ILLUSTRATIONS`/`EXTRA_CHAPTER_ILLUSTRATIONS`; no illustration object has an `svgType` or `svgDescription` key (runtime guard mirroring the type change) |
| `src/data/sectionLayers.test.ts` (update) | `deriveOpenState(layout(beginner, s3), 's3')`: `jargon` false, `primer` and `diagram` true, core layer expanded; the same call for s1 equals `deriveOpenState(layout)`; the no-argument call is unchanged (existing case stays); experienced s3 is unaffected (jargon is Deep, closed anyway) |
| `src/lib/tabKeys.test.ts` (new) | ArrowRight 3→0 wraps, ArrowLeft 0→3 wraps, Home→0, End→3, `'a'`→null, count 4 |

Browser check (preview, light and dark, desktop and 375×812):

- 4-up grid at desktop width, tabs at 375, and the switch at a container width near 640px (resize or toggle the sidebar)
- keyboard through the tabs: arrows, Home/End, visible focus
- a VoiceOver spot check that each panel reads its title and description
- s1, s4 and s5 unchanged apart from the §5.2 card removals
- s3 experienced level: hero figure present, analogy `<details>` gone, Core unchanged

## 8. Measurement method

Run this in the DevTools console on the chapter, right after opening it from the index (scroll position as the app sets it). The target is the first visual: `[data-hero-figure]` after the change, `#sec-diagram` for the baseline. The script counts visible, non-whitespace text characters after the chapter `h1` and before the target, and the pixel gap between them.

```js
(() => {
  const h1 = document.querySelector('[data-key-takeaway]').parentElement.querySelector('h1');
  const target = document.querySelector('[data-hero-figure]') ?? document.querySelector('#sec-diagram');
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let chars = 0;
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const el = n.parentElement;
    if (!el?.checkVisibility() || h1.contains(n)) continue;
    const after = h1.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_FOLLOWING;
    const before = target.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING;
    if (after && before) chars += n.data.replace(/\s+/g, '').length;
  }
  const t = target.getBoundingClientRect(), h = h1.getBoundingClientRect();
  return { chars, gapPx: Math.round(t.top - h.bottom), targetTop: Math.round(t.top), vh: innerHeight };
})();
```

Also record the reader card height (`document.querySelector('[data-key-takeaway]').closest('.rounded-2xl').offsetHeight`, the reader card) and its total visible characters, both in the default open state, to prove G2.

**Baseline first:** the 4,100 / 2,485px figures in §0 were a quick probe (trimmed text-node characters outside `aside`/`nav`/`header`, between the chapter-title `h2` and `#sec-diagram`), not this script, so they are not directly comparable. Run this script on `main` before any change, in beginner and experienced modes, on desktop (viewport 964px high) and at 375×812. Store the results in `work/visual-first-measure.md` next to the after-numbers. Measure ch.1, ch.4 and ch.7 as well for the rollout baseline.

## 9. Acceptance criteria

1. s3, both levels: `[data-hero-figure]` is the first element after the subtitle, and `chars` before it is ≤ 250 (title block only).
2. Desktop (964px viewport): `targetTop` ≤ `vh − 300`, so at least 300px of the figure is visible without scrolling.
3. 375×812: `targetTop` ≤ `vh − 200`, and the tabs plus the top of panel 1 are visible without scrolling.
4. G2: in the default beginner state, the s3 reader card height and its visible character count are both lower than baseline on desktop and at 375×812.
5. No `$` amount or cost multiplier appears anywhere in s3, and no "Visual Blueprint Scene" block, `Type:` badge or `Visual Architecture` chip appears in any chapter.
6. Chapters without `heroFigure` render identically to baseline except for the §5.2 removals and the closed jargon chips.
7. Figure: correct in light and dark; 4-up at container ≥ 640px, tabs below; keyboard and screen-reader behaviour per §2.4; SVG text ≥ 10px rendered in 4-up mode.
8. `bun run lint`, `bun run test` and `bun run build` pass.

## 10. Decisions made while specifying

- **D1. Hero slot is a dedicated `Chapter.heroFigure` field** fed by `chapterHeroFigures.ts`, not a content-block placement (§3.1).
- **D2. The figure sits between the subtitle and the key takeaway**, and on hero chapters the analogy becomes one plain line under the caption for both levels (§3.3). This keeps the first visual in the first screen on mobile, which it would not be after the analogy box and the notes.
- **D3. The `🎨 Visual Architecture` chip is removed too.** It advertises a visual that does not exist, just like the Blueprint block.
- **D4. Jargon chips show for every chapter whenever the section is closed.** Only s3 starts closed. A per-chapter chip rule would make the same closed section look different across chapters for no benefit.
- **D5. Tabs, no swipe, CSS-only switching, container breakpoint at 640px** (§2.3).
- **D6. Delete `svgType`/`svgDescription` rather than hide them** (§5.2).
- **D7. The s3 primer scenario is rewritten around the Refund screen** so primer and figure tell one story. The door example goes, since the figure now carries the concrete case.

## 11. Rollout

**Criteria to roll out** (all required):

- §9 passes.
- A caption-only check: 2 people who have not read ch.3 see only the hero figure and caption, and can say in their own words "fix early, it gets harder later".
- The owner reviews s3 in the preview and accepts the look.
- There is no measurable regression in the other chapters.

**Next chapters, in order:**

1. **ch.5**: use the existing Refund diagram set (`RefundSwimlane`, `RefundSequence` and the diagram families) as the hero and move it next to its paragraphs. The inline-placement mechanism from §4 gets specified here.
2. Chapters with no figures: **2, 4, 6, 7, 9, 10, 11, 13, 14, 15**. Each gets its own short figure brief (a real artefact, not a metaphor) plus the same text cuts, and its `CHAPTER_ILLUSTRATIONS` card is deleted once a real figure replaces it.
3. **Follow-up:** move ch.1's figures out of the collapsed "เนื้อหาอ้างอิง (Reference)" section into a hero or inline position, and audit ch.8 and ch.12 for the same problem.

With each rollout step, update the pilot guard in `visualFirst.test.ts` and re-run §8.

## 12. Risks

| Risk | Mitigation |
|---|---|
| 4-up panels too small to read on a narrow desktop column | container breakpoint at 640px; ≥ 10-unit text; every string fits its box at that size |
| Tab mode makes the figure tall on mobile (about 500px) | panel capped at 260px wide; criterion 3 checks visibility, not full fit |
| The key takeaway moves below the fold on mobile | it restates the caption; accepted for the pilot, re-check in §8 |
| Reusing the Refund domain could confuse readers who have not reached ch.5 | the screen stands alone; no ch.5 knowledge is needed |
