# Spec: Restore reference content from the static guide

- Date: 2026-09-22
- Status: Ready for implementation (open questions at the end)
- Source of truth for content: `/Users/Pathompong/Sites/Personal/biz-dev-guide-static/index.html` (2156 lines; read by line range only)
- Target app: `/Users/Pathompong/Sites/Personal/biz-dev-guide/src`

## 0. Background and verified facts

The React app was derived from the static guide. The derivation kept the chapter skeleton but dropped reference material. Every count below was checked by reading or grepping the static file.

| Static section | Lines | SVG | `<table>` | `<details>` | Other |
|---|---|---|---|---|---|
| s1 | 347–426 | 1 | 0 | 0 | PM vs PjM note (423) |
| s2 | 428–477 | 0 | 1 | 1 | |
| s5 | 631–1105 | 14 | 4 | 4 | 6 diagram-family cards |
| s6 | 1107–1173 | 0 | 0 | 1 | ADR/RFC cards, pair programming |
| s8 | 1241–1351 | 1 | 0 | 1 | fig 6, environment flow |
| s9 | 1353–1435 | 1 | 0 | 0 | fig 7, gates |
| s11 | 1492–1715 | 2 | 0 | 12 | 12 FAQ items |
| s12 | 1717–1788 | 1 | 1 | 0 | |
| s13 | 1790–1824 | 0 | 1 | 1 | sources/caveats `<details>` |
| s14 | 1826–1876 | 0 | 2 | 0 | 8 career-path cards |
| s15 | 1878–1986 | 0 | 0 | 0 | 94 `.gcard` entries, source list |
| footer | 1990 | | | | footer text |

**Chapter topics drift between the two versions.** The implementer needs to know this before placing content:

| id | Static topic | React topic (`src/data/chapters/*.ts`) |
|---|---|---|
| s9 | Full pipeline: gates and handoff | Technical debt and refactoring |
| s12 | Mindset spectrum by role | Discovery vs Delivery (dual-track) |
| s14 | Confusing term pairs and cross-side career paths | Specification hierarchy (BRD/PRD/ADR) |
| others | aligned closely enough | |

Content is therefore placed by **topic**, not by static section number, wherever the two differ (see §3.4 and the open questions).

**Relevant React facts:**
- `Chapter` (`src/types.ts`) has no generic content-block field. `contentHtml?: string` exists but nothing renders it (grep finds no consumers). It must not be used.
- `CHAPTERS` (`src/data/chaptersData.ts`) merges per-chapter extras (`CHAPTER_ILLUSTRATIONS`, `FRICTION_PLAYBOOKS`) keyed by chapter id. New data follows the same merge pattern.
- `GuideTab.tsx` (1552 lines) renders fixed accordion sections gated by `openSections` state (lines 89–101). The sections are Diagram (833–1077), Case studies (1079), Core Concepts (1158–1208), Workflow (1209), Pitfalls (1255) and Checklist (1300). Chapter-specific blocks are hard-coded inline: the s5 C4 explorer (952–1012) and the s11 4-item FAQ (1014–1076, local `expandedFaqId` state).
- `ChapterDiagram.tsx` has one `if (chapterId === 'sN')` block per chapter. s5 (373–541) is the monolith-vs-microservices "Kitchen" simulator. s15 (1066–end) is a REST/Webhook/WebSocket protocol simulator (state at lines 66–72) that is unrelated to a glossary.
- There are **8** friction playbooks, not 7, in `src/data/frictionPlaybooks.ts`: s1, s2, s4, s6, s7, s8, s11, s12.
- Dark mode is the `.dark` class on `<html>` (`App.tsx` 25–45) and the Tailwind `dark:` variant (`index.css` line 9). The palette is neutral: `bg-white dark:bg-[#141414]`, `border-neutral-200 dark:border-[#262626]`, token strings in `src/styles/tokens.ts`. `ChapterDiagram.tsx` still uses the older `slate`/`indigo` classes.
- Static SVGs use **no hard-coded hex colors**. Every fill and stroke is a CSS variable: `--text`, `--text-2`, `--text-muted`, `--border`, `--surface-2`, `--accent`, `--accent-bg`, `--accent-border`, `--warn`, `--warn-bg`, `--warn-border`, `--ok`, `--ok-bg`, `--ok-border`. Light values are at static lines 28–32 and dark values at 50–54. Several SVGs use `<marker id=…>` (`c4p1`, `c4b1–3`, `pw-a`, `pq-a`, `pq-r`, `v3-a`, `env-a`, `gate-a`) and `aria-labelledby` ids.
- The repo has no test runner. `npm run lint` runs `tsc --noEmit` and `npm run build` runs a Vite build. Acceptance criteria use those checks, count assertions (a throwaway `node`/`tsx` one-liner or a dev-only `console.assert`) and manual UI checks.

## 1. Shared foundations (used by workstreams 1–4)

### 1.1 Rich text subset
Static content uses `<b>`, `<br>`, bullets `•` and in-page `<a href="#sN">`. The following apply everywhere:

- Store text as plain strings using a tiny subset: `**bold**`, `\n` for a line break, and `[[sN|label]]` for a chapter link.
- Add `src/components/content/RichText.tsx`. It parses that subset into React nodes. **Do not use `dangerouslySetInnerHTML`.** A chapter link calls an `onNavigateChapter(id)` callback supplied by GuideTab, which sets `activeChapterId` and scrolls to the top.
- Type: `export type RichText = string;` (documentary alias in `src/types.ts`).

### 1.2 Static figure port (SVG → JSX)
The static SVG markup is ported, not redrawn.

- Location: `src/components/figures/`, one file per figure, e.g. `FamilyStructureSig.tsx` and `RefundSwimlane.tsx`. There is also a registry `src/components/figures/index.ts` that exports `FIGURES: Record<FigureKey, React.FC<FigureProps>>`, with `FigureProps = { className?: string }`.
- Mechanical conversion rules:
  - Convert attributes to JSX: `text-anchor`→`textAnchor`, `font-size`→`fontSize`, `stroke-width`→`strokeWidth`, `stroke-dasharray`→`strokeDasharray`, `marker-end`→`markerEnd`, `font-family`→`fontFamily`, `class`→`className`, and `style="…"`→style object.
  - Keep `viewBox`, `role="img"`, `<title>`/`<desc>`.
  - Replace every `var(--X)` with `var(--fig-X)`. The prefix avoids shadowing the app's own `--text-muted` and `--border-color` in `index.css`.
  - Make every `id` unique per instance with React `useId()`. This covers marker ids, `url(#…)` references and `aria-labelledby` targets. Two figures on one page must not share `#pw-a` and similar ids.
- Add a scoped token block to `src/index.css`:
  - `.fig-scope { --fig-text: …; --fig-text-2: …; --fig-text-muted: …; --fig-border: …; --fig-surface-2: …; --fig-bg: …; --fig-accent: …; --fig-accent-bg: …; --fig-accent-border: …; --fig-warn…; --fig-ok… }`
  - `.dark .fig-scope { … }`
  - Light values: static lines 28–32, with `--fig-bg` set to `#ffffff`.
  - Dark values: use the static dark set (50–54) but align the neutrals with the app. `--fig-text #e5e5e5`, `--fig-text-2 #a3a3a3`, `--fig-text-muted #737373`, `--fig-border #333333`, `--fig-surface-2 #1f1f1f`, `--fig-bg #141414`. Keep the static accent/warn/ok hues.
  - Every figure root is wrapped in `<div className="fig-scope">`.
- Figures scale fluidly with `width: 100%` and `height: auto`, capped by the static per-figure `max-width` (e.g. C4 L1 480px, L4 220px, family signatures 150px).

### 1.3 Chapter content blocks (the data-model extension, workstream 3)
Workstream 3 defines this model. Workstreams 2 and 4 reuse it. See §4.

## 2. Workstream 1 — Glossary (94 terms)

### 2.1 Goal
Restore the complete static glossary as structured data with a searchable, filterable UI in chapter 15. Replace the unrelated protocol simulator shown for s15.

### 2.2 Source
- Static lines 1881–1976: `#glossary-grid` with 94 × `<div class="gcard"><div class="gterm">…</div><div class="gdef">…</div></div>` (one card per line, 1882–1975).
- 1977: "no results" text `ไม่พบคำที่ค้นหา`.
- 1979–1985: `.src-list`, 4 source links for chapter-11 concepts (Fowler Technical Debt Quadrant, Construx Cone of Uncertainty, Mountain Goat "Cost of Change Curve Is Outdated", Fowler Yagni). These move to workstream 4.
- The static file has **no plain-language ("บ้านๆ") field, no category and no chapter id** per term. Only term 7 (SLA → `#s4`, `#s10`) and term 41 (Cost of change curve → `#s11`) contain chapter links.
- Therefore `category` and `relatedChapterIds` are **derived** from the static ordering, which is grouped by topic, and from where each term appears in the chapters. Proposed values are below. `plain` is optional and empty in phase 1.

### 2.3 Inventory (94) with proposed category and related React chapter

| # | Category key (label) | Primary chapter | Terms |
|---|---|---|---|
| 1–14 | `requirements` (Requirements) | s4 | Elicitation; BRD (Business Requirements Document); SOW (Statement of Work) / Scope agreement; User story; Functional requirement; Non-functional requirement (NFR); SLA (Service Level Agreement) [s4, s10]; Acceptance criteria; Stakeholder; RACI (Responsible, Accountable, Consulted, Informed); Scope creep; Change request; Traceability matrix; Requirements volatility |
| 15–22 | `architecture` (Architecture & diagrams) | s5 | High-level solution / System context; Module + function mapping; Use case diagram; Sequence diagram; Swimlane diagram; UML (Unified Modeling Language); C4 Model; BPMN (Business Process Model and Notation) |
| 23–31 | `product` (Product) | s2 | PRD (Product Requirements Document); Roadmap; Backlog; Epic; MVP (Minimum Viable Product); OKR (Objectives and Key Results) / KPI (Key Performance Indicator); MoSCoW (Must have, Should have, Could have, Won't have); RICE (Reach, Impact, Confidence, Effort); PM (Product Manager) vs PjM (Project Manager) |
| 32–34 | `pipeline` (Pipeline & process) | s1 | Fast-tracking; Escalation; SDLC (Software/System Development Life Cycle) |
| 35–38 | `tech-debt` (Tech debt & design trade-offs) | s9 (s11 secondary) | Technical debt; Technical debt quadrant; YAGNI (You Aren't Gonna Need It); Over-engineering |
| 39–42 | `estimation` (Estimation & uncertainty) | s11 | Cone of uncertainty; Planning fallacy; Cost of change curve [s11]; Edge case |
| 43–45 | `frameworks` (Frameworks & certifications) | s14 | BABOK (Business Analysis Body of Knowledge); PMBOK (Project Management Body of Knowledge) / PMP (Project Management Professional); TOGAF (The Open Group Architecture Framework) |
| 46–53 | `engineering` (Engineering practice) | s6 | ADR (Architecture Decision Record) [s6, s14]; RFC (Request for Comments); Definition of Done (DoD); Definition of Ready (DoR); Trunk-based development; Story point; Velocity; Pull Request (PR) |
| 54–64 | `qa` (QA & testing) | s7 | Test plan; Test case; Unit test; Integration test; E2E test (End-to-End Test); Regression test; UAT (User Acceptance Testing); Bug severity; Bug priority; Test coverage; Flaky test |
| 65–70 | `devops` (Delivery & DevOps) | s8 | Environment (dev/staging/UAT/prod); CI/CD (Continuous Integration / Continuous Deployment); Rollback; Feature flag; Canary release; Blue-green deployment |
| 71–81 | `operations` (Operations, support & product signals) | s10 | Incident; Hotfix; Post-mortem / RCA (Root Cause Analysis); Observability; Logging / Monitoring / Alerting; Support ticket / support tier (L1/L2/L3); Maintenance / patch; Feedback loop; Retention; Churn; Adoption rate |
| 82–86 | `metrics` (Delivery metrics) | s8 | DORA metrics; Deployment frequency; Lead time for changes; Change failure rate; MTTR (Mean Time To Recovery) |
| 87–94 | `ux` (UX/UI) | s3 | Wireframe; Mockup; Prototype; Design system; Design handoff; IA (Information Architecture); a11y (Accessibility); Usability testing |

Total: 14+8+9+3+4+4+3+8+11+6+11+5+8 = **94**. The implementer should spot-check category boundaries while transcribing. They are a proposal, not static data.

**React s15 `jargonList`** (`chapters11_15.ts` 593–624) holds 5 terms that do not appear in the 94: Ubiquitous Language, SDK, Webhook, Idempotency, Backward Compatibility. **Decision:** fold them into the glossary as entries 95–99 with `origin: 'app'`. They keep their `formalDefinition` as `definition`, `humanTranslation` as `plain` and `meetingExample` as `example`, with category `architecture` or `engineering` as appropriate. Then remove `jargonList` from s15 so the page does not show two glossaries. The glossary then has 99 entries: 94 `origin: 'static'` + 5 `origin: 'app'`. (Open question Q1.)

### 2.4 Data and types
New file `src/data/glossary.ts`:

```ts
export type GlossaryCategory =
  | 'requirements' | 'architecture' | 'product' | 'pipeline' | 'tech-debt'
  | 'estimation' | 'frameworks' | 'engineering' | 'qa' | 'devops'
  | 'operations' | 'metrics' | 'ux';

export interface GlossaryTerm {
  id: string;                 // kebab slug, unique, e.g. 'sla', 'pm-vs-pjm'
  term: string;               // exact static .gterm text
  definition: RichText;       // static .gdef text; chapter-link parentheticals removed (see below)
  plain?: RichText;           // "บ้านๆ" explanation; empty for static entries in phase 1
  example?: string;           // meeting example (only app-origin entries)
  category: GlossaryCategory;
  relatedChapterIds: string[];// first = primary; all must exist in CHAPTERS
  aliases?: string[];         // search helpers, e.g. ['NFR'], ['PjM', 'Project Manager']
  origin: 'static' | 'app';
}
export const GLOSSARY_CATEGORIES: { key: GlossaryCategory; label: string; labelTh: string }[];
export const GLOSSARY: GlossaryTerm[];
```

Transcription rules:
- Copy `term` and `definition` verbatim in Thai and English as in the static file. Keep array order equal to static order.
- For term 7, drop `(ดูบทที่ 4, ใช้ต่อใน บทที่ 10)` from the text and set `relatedChapterIds: ['s4','s10']`.
- For term 41, keep the caveat sense by rewriting the parenthetical as `[[s11|ดูข้อควรระวังท้ายบทที่ 11]]`.
- Add `aliases` for acronyms inside parentheses so a search for "NFR", "RACI" or "PjM" matches.

### 2.5 Components
- `src/components/glossary/GlossaryPanel.tsx`, props `{ terms: GlossaryTerm[]; chapters: Chapter[]; onNavigateChapter(id): void; initialCategory?: GlossaryCategory | 'all' }`:
  - The search input uses `tokens` input styling. It does a case-insensitive substring match over `term`, `aliases`, `definition` and `plain`. Thai text is matched as-is, without normalization beyond `toLowerCase()`.
  - Category chips: "ทั้งหมด (99)" plus one chip per category showing its count. Selection is single, and choosing a chip again returns to "all".
  - A result count line reads `แสดง N จาก 99 คำ`.
  - The grid has 1 column below `sm` and 2 columns from `sm` (the static layout at line 270 switches at 700px). Each card shows the term (bold), definition, optional `plain` box labelled `พูดแบบบ้านๆ`, optional example, and chapter chips such as `บทที่ 4`. Clicking a chip calls `onNavigateChapter`.
  - The empty state reuses the static string `ไม่พบคำที่ค้นหา` and offers a "clear filters" button.
  - Search is debounced by about 150ms, or left undebounced (99 items is cheap). Do not add a dependency.
- `src/components/glossary/GlossaryCategoryMap.tsx` replaces the s15 protocol simulator in the Diagram section. It is a tile grid of the 13 categories, each tile showing its label and count. Clicking a tile sets the panel's category filter and scrolls to the panel. The panel's category state is lifted to GuideTab, or shared through a small `useState` passed to both.

### 2.6 Placement (decision)
**Recommendation: replace the s15 body. Do not add a new tab.**

Reasons:
- s15 is already titled "พจนานุกรมคำศัพท์…".
- The 15-chapter model (progress bar, read/bookmark state, "Guide [15]" label, badges) stays intact.
- A new tab would add routing and state to `App.tsx`/`Header.tsx` for no content gain.

The unused `'simulator'` member of `TabType` is left alone.

Implementation in GuideTab:
- Add section key `glossary` to `openSections`, defaulting to `true`. For `activeChapter.id === 's15'`, render a new "คลังคำศัพท์ (Glossary)" accordion section directly after the adaptive lens banner (before the playbook/mindset cards).
- s15 Diagram section: render `GlossaryCategoryMap` instead of `<ChapterDiagram chapterId="s15">`. Update `diagramTitle`/`diagramDescription` in the s15 data to describe the category map.
- Remove the `jargonList` of s15 (folded in, see §2.3). Keep s15 `beginnerPrimer`, `realWorldExamples`, `coreConcepts`, `checklist` and `commonPitfalls`.
- Add a small "📖 Glossary" quick-jump button to the GuideTab top banner (around line 204). It sets `activeChapterId` to `'s15'`.
- **Protocol simulator:** move the whole s15 block from `ChapterDiagram.tsx` (1066–end, plus its state at lines 66–72) into the s5 branch as a collapsible "Sync vs Async: REST / Webhook / WebSocket" panel that is closed by default. React s5 core concept #2 is "Synchronous vs Asynchronous Communication" (`chapters1_5.ts` 682), so the simulator belongs there. The alternative is deletion (Q2).

### 2.7 Dark mode and responsive behavior
- Cards use `bg-white dark:bg-[#141414] border-neutral-200 dark:border-[#262626]`.
- Chips use the same active/inactive styles as the GuideTab C4 level buttons (lines 963–970).
- The `plain` box uses `tokens` amber accent or neutral subtle.
- The search input sits full-width on mobile. Chips scroll horizontally (`overflow-x-auto`, no wrap) below `sm` and wrap from `sm`.

### 2.8 Acceptance criteria
1. `GLOSSARY.filter(t => t.origin === 'static').length === 94`, with order and `term` strings identical to static lines 1882–1975 (script diff of the `term` list against `grep -o 'gterm">[^<]*'`).
2. Every `id` is unique. Every `relatedChapterIds` entry exists in `CHAPTERS`. Every category has ≥1 term.
3. Searching "NFR", "PjM", "ย้อนหลัง" and "canary" each returns ≥1 result. Searching "zzz" shows `ไม่พบคำที่ค้นหา`.
4. A category chip combined with a search filters by both (AND logic). The count line is correct.
5. The chapter chip on SLA navigates to s4 and scrolls to the top.
6. s15 no longer renders the REST/Webhook simulator. s5 renders it collapsed (or it is deleted, per Q2).
7. s15 shows exactly one glossary: the old 5-term Jargon section is gone.
8. Light and dark mode both have readable contrast. At a 360px width the page has no horizontal scroll.
9. `npm run lint` and `npm run build` pass.

### 2.9 Out of scope / do not change
- Other chapters' `jargonList` data and the Jargon Buster section for s1–s14.
- The quiz, the AI tab and badges.
- **Phase 2 (not now):** inline term links from chapter text, i.e. auto-detecting glossary terms in `detail`/`bulletPoints` and showing a popover. Filling `plain` for the 94 static terms is also phase 2.

## 3. Workstream 2 — Chapter 5 diagrams

### 3.1 Goal
Restore the static s5 "diagram literacy" content: the 6 diagram-family cards, 2 standalone figures, the C4 4-level SVGs, the refund-flow swimlane and sequence worked example, the 4 tables and 2 notes. The existing Kitchen simulator stays.

### 3.2 Source inventory (14 SVG, 4 tables, 4 `<details>`)

| Item | Lines | Notes |
|---|---|---|
| Intro + 3-part outline | 633–651 | business/engineer notes and outline 5.1/5.2/5.3; React s5 has its own notes, so do not port the intro prose |
| Family grid | 652–755 | 6 cards; CSS at static 180–193 |
| Card 1 โครงสร้าง | 653–668 (SVG 654–663) | q "มีอะไรอยู่ข้างใน…", e "C4 · component · module map · ERD", jump → C4 detail |
| Card 2 พฤติกรรม | 670–686 (SVG 671–681) | "เกิดอะไรก่อนหลัง ใครคุยกับใคร", jump → swimlane vs sequence |
| Card 3 กระบวนการ | 688–702 (SVG 689–697) | "งานส่งต่อจากใครไปใคร…", jump → swimlane vs sequence |
| Card 4 หน้าจอ | 704–718 (SVG 705–713) | wireframe · mockup · prototype + extra note line 717 |
| Card 5 จัดระเบียบความคิด | 720–738 (SVG 721–733) | mind map · affinity · impact map + note 737 |
| Card 6 แผนและเวลา | 740–754 (SVG 741–749) | gantt · roadmap · dependency graph + note 753 |
| Table T1 (in `<details>` 757–781) | 760–778 | "ตารางอ้างอิง — ไดอะแกรมแต่ละชนิดใช้ตอนไหน อ่านโดยใคร"; cols ชนิด/หมวด/ตอบคำถามอะไร/คนอ่านหลัก; **14 rows**; footnote 779–780 |
| Fig 4 "ระบบเดียวกัน มองด้วยเลนส์สามแบบ" | 785–845 (SVG 787–843) | caption 844 |
| Table T2 | 847–854 | cols เอกสาร/ตอบคำถามว่า/ผู้อ่านหลัก; **3 rows** (first cell has a `<br>` sub-label); prose 855–859 |
| `<details>` NFR → sequence | 860–872 | 5-step connection example |
| Table T3 (5.3 standards) | 875–882 | cols มาตรฐาน/ดูแลโดย/ใช้ทำอะไร/ตัวอย่างไดอะแกรม; **3 rows** (UML, C4, BPMN); note 883–884 |
| Fig 5 "C4 level 1" | 885–925 (SVG 887–923) | caption 924 |
| `<details id="dg-structure">` C4 detail | 927–1000 | L1 SVG 934–946, L2 950–966, L3 970–984, L4 988–997, plus per-level text and closing note 998–999 |
| `<details id="dg-behavior">` swimlane vs sequence | 1002–1104 | intro 1004; swimlane SVG 1011–1041; sequence SVG 1048–1086; caption text 1042–1047 |
| Table T4 | 1091–1100 | cols (blank)/Swimlane/Sequence; **5 rows** (จัดตาม, เน้น, เหมาะกับ, คนอ่านหลัก, มาตรฐาน); tip 1101–1103 |

SVG count: 6 + fig4 + fig5 + 4 (C4) + 2 (refund) = **14**.

### 3.3 Figure keys (registry, §1.2)
`family-structure`, `family-behavior`, `family-process`, `family-screen`, `family-thinking`, `family-plan`, `three-lenses`, `c4-l1-hero` (fig 5), `c4-l1`, `c4-l2`, `c4-l3`, `c4-l4`, `refund-swimlane`, `refund-sequence`.

### 3.4 Components and data
- `src/components/diagrams/DiagramFamilyGrid.tsx` renders the 6 cards from a small data array in `src/data/diagramFamilies.ts`:
  ```ts
  interface DiagramFamily { id: string; figureKey: FigureKey; name: string; question: string; examples: string; note?: string; jumpTo?: 'c4' | 'behavior'; jumpLabel?: string }
  ```
  - The grid has 1 column below 560px, 2 columns up to 900px and 3 columns beyond (static 180–182). In Tailwind: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
  - Jump cards are `<button>`s. Activating one opens the target block and scrolls it into view.
- The C4 detail **merges into the existing GuideTab C4 explorer** (952–1012) instead of adding a second C4 widget. Each level button (L1–L4) shows the ported SVG (`c4-l1…c4-l4`) above the existing level text. Where the static per-level text (932–997) differs, keep the React text and add the static text as a second paragraph only if it adds information. The implementer compares the two by reading.
- `src/components/diagrams/SwimlaneVsSequence.tsx`: a two-column pair (`grid-cols-1 md:grid-cols-2`; static breakpoint 760px). Each column shows a box title (Swimlane (BPMN) / Sequence (UML)), a sub-label, the SVG and its caption, followed by table T4 (a content block) and the tip.
- Tables T1–T4, fig 4, fig 5, the NFR details and the notes are expressed as **content blocks** (§4) in `src/data/chapterContentBlocks.ts` under `s5`.
- **Coexistence with the Kitchen simulator.** The s5 Diagram section renders these in order:
  1. Illustration card (existing).
  2. **Diagram families** (new, `DiagramFamilyGrid`) with T1 as a collapsed block below it.
  3. Kitchen simulator (existing, unchanged).
  4. Sync/Async protocol simulator (moved from s15, collapsed; §2.6).
  5. C4 explorer (existing, upgraded with SVGs).
  6. Swimlane vs sequence (new).

  Fig 4 + T2 + NFR details and T3 + fig 5 render in the Reference section (§4.4) under the headings "5.2 สามมุมมองที่ใช้ในงาน solution design" and "5.3 มาตรฐานการวาดไดอะแกรมที่เจอบ่อย".

  The Kitchen stays because it teaches a different concept (monolith vs microservices) that the static guide lacks.

### 3.5 Dark mode and responsive behavior
- All figures are wrapped in `.fig-scope` and use `--fig-*` tokens. Nothing is hard-coded, and dark mode is verified by toggling.
- Refund SVGs have a 300×356 viewBox and stack on mobile. The large figures (620 wide) scale down to 100% width. On screens under 400px, text inside fig 4/fig 5 may get small: wrap them in `overflow-x-auto` with `min-w-[520px]` so labels stay legible and horizontal scroll is allowed inside the figure only.

### 3.6 Acceptance criteria
1. The figure registry has 14 s5 keys. Each renders without React warnings, and no duplicate DOM ids appear on the s5 page (`document.querySelectorAll('[id]')` has no duplicates).
2. 6 family cards render with the exact static names, questions and example lines. The 3 jump cards open and scroll to their targets and are keyboard-activatable (Enter/Space).
3. T1 has 14 rows, T2 3, T3 3 and T4 5. Header labels match the static file.
4. The C4 explorer shows an SVG for each of L1–L4.
5. In dark mode no SVG shows white boxes or black text on a dark background (manual check of all 14).
6. The Kitchen simulator behaves exactly as before.
7. At 360px the page has no horizontal scroll outside designated figure/table scrollers.
8. `npm run lint` and `npm run build` pass.

### 3.7 Do not change
- Kitchen simulator logic and state.
- `CHAPTER_ILLUSTRATIONS` for s5.
- s5 `coreConcepts`, `jargonList` and the other chapter data fields.
- Do not port static JS behavior (e.g. `data-jump` script). Re-implement it in React.

## 4. Workstream 3 — Generic table/content block

### 4.1 Goal
Add a typed, data-driven content-block model and one renderer, then restore the tables for s2, s12, s13 and s14 (plus the s14 career-path cards). The model also carries s5's tables and figures and s11's notes.

### 4.2 Types (`src/types.ts`)
```ts
export type FigureKey = /* union of registry keys, see §3.3 and §5.3 */;

export interface TableColumn { key: string; label: string; widthHint?: 'narrow' | 'wide' }
export interface TableRow { cells: Record<string, RichText>; }

export type ContentBlock =
  | { kind: 'table'; id: string; title?: string; intro?: RichText; columns: TableColumn[];
      rows: TableRow[]; footnote?: RichText; mobile?: 'stack' | 'scroll'; collapsed?: boolean }
  | { kind: 'note'; id: string; tone: 'info' | 'warn' | 'ok'; title?: string; body: RichText }
  | { kind: 'figure'; id: string; figureKey: FigureKey; title?: string; caption?: RichText }
  | { kind: 'cards'; id: string; title?: string; intro?: RichText; cards: { term: string; def: RichText }[] }
  | { kind: 'details'; id: string; summary: string; body: ContentBlock[] }
  | { kind: 'sources'; id: string; title?: string; items: { label: string; url?: string }[]; caveat?: RichText };

export interface ChapterContentSection { heading?: string; placement?: 'reference' | 'diagram'; blocks: ContentBlock[] }
// Chapter gains:
contentSections?: ChapterContentSection[];
```

Data file: `src/data/chapterContentBlocks.ts` exports `CHAPTER_CONTENT: Record<string, ChapterContentSection[]>`. `chaptersData.ts` merges it the same way as `FRICTION_PLAYBOOKS`. `contentHtml` stays unused and is not removed (not part of this scope).

### 4.3 Renderer
- `src/components/content/ContentBlocks.tsx` takes `{ sections, placement, onNavigateChapter }` and switches on `kind`. It includes `ContentTable.tsx`.
- **Table, desktop (≥640px):** a real `<table>` with `<caption>` = title, `<th scope="col">`, zebra-free rows, `border-b border-neutral-200 dark:border-[#262626]`, text `text-xs sm:text-sm`, `align-top`. Cells render with `RichText`.
- **Table, mobile (<640px), `mobile: 'stack'` (default):**
  - The `<table>` is replaced by a list of cards, one per row.
  - The first column's value is the card title.
  - The other columns render as `label: value` pairs.
  - Implementation option A: render both variants and toggle with `hidden sm:table` and `sm:hidden`. Option B: a CSS-only approach. **Use option A.** It keeps semantics clean and needs no resize listener. Screen readers see only the visible variant.
- **`mobile: 'scroll'`:** `overflow-x-auto` wrapper with `min-w-[560px]`, a sticky first column (`sticky left-0 bg-…`) and a visible edge-fade hint. Use it for tables where row-to-row comparison matters, such as s5 T4.
- `collapsed: true` renders as a disclosure. The same applies to `details` blocks, using `<details>/<summary>` or the accordion pattern from GuideTab with `aria-expanded`.
- Notes: `info` is neutral, `warn` amber and `ok` emerald, using `tokens` status colors and matching the static `.note.warn` and `.faq-fix` intent.
- Cards: 1 column on mobile and 2 from `sm`.

### 4.4 GuideTab integration
- New accordion section **"เนื้อหาอ้างอิง (Reference)"**, key `reference`, default open. It is placed after Core Concepts (SECTION 5, ends line 1208) and before Workflow, and renders only sections with `placement !== 'diagram'`.
- Inside the Diagram section, render `placement === 'diagram'` sections after `ChapterDiagram`. s5 uses this for T1 under the family grid.
- The section is hidden when a chapter has no content sections.

### 4.5 Content inventory to restore

| Chapter (React) | Block | Static lines | Content |
|---|---|---|---|
| s2 | table "PM ส่งอะไรต่อให้ใคร — สะพานไปบทถัดไป" + intro + footnote | intro 457–458, table 459–466, footnote 467 | cols **PM ส่งมอบ / ผู้รับ / คำถามที่ผู้รับจะถามกลับ**; 3 rows (→ UX/UI บทที่ 3, BA บทที่ 4, SA บทที่ 5). Convert "(บทที่ N)" to `[[sN|บทที่ N]]` |
| s12 | table "ตารางเทียบมุมมองแต่ละบทบาท" | 1773–1785 | cols **บทบาท / โฟกัสหลัก / นิยาม "เสร็จ" / ถ้าคิดผิด จะเกิดอะไร**; 7 rows: PM, UX/UI, BA, SA, Engineer, QA, DevOps; closing note 1787 as `note` |
| s13 | table "เทียบงานเดิม vs แนวโน้ม AI ต่อบทบาท" + caveat intro | caveat 1798, table 1799–1811 | cols **บทบาท / งานเดิม (ก่อน AI) / แนวโน้ม AI (2026 เป็นต้นไป)**; 8 rows: PM, UX/UI, BA, SA, Engineer, QA, DevOps, Support |
| s13 | `sources` block "สรุปแหล่งอ้างอิงและข้อจำกัดของบทนี้" | details 1816–1821 | Gartner (Software Engineering 2030, Predicts 2026), McKinsey, PwC (Agentic SDLC), with the caveat paragraph verbatim; no URLs in the static file, so items have `url` undefined |
| s14 | table "คู่คำที่ฟังคล้ายกันแต่คนละเรื่อง" + intro | 1829–1843 | cols **คู่ที่มักสับสน / ต่างกันตรงไหน / เทียบแบบบ้านๆ**; 8 rows: PM vs PjM; PRD vs BRD vs SOW; Functional vs Non-functional; User story vs Use case; Use case vs Sequence; Estimate vs Commitment; Scope creep vs Change request; Tech debt vs Over-engineering |
| s14 | table "Framework/certification อ้างอิงต่อ layer" | 1845–1857 | cols **Layer / Framework / คำอธิบายสั้น**; 7 rows: BA–BABOK; PjM–PMBOK/PMP; PjM (agile)–Scrum CSM/PSM; SA/EA–TOGAF; SA–C4 Model; SA–UML; PM–Jobs-to-be-Done, Lean Startup |
| s14 | cards "เส้นทางข้ามฝั่ง — engineer อยากเข้าใจ business" | 1859–1864 | 3 cards: Engineer → Solution Architect; Engineer → Business Analyst; Engineer → Product Manager |
| s14 | cards "เส้นทางข้ามฝั่ง — business อยากเข้าใจ technical (ไม่ใช่การเรียน programming)" + intro | 1866–1874 | intro 1867; 5 cards: อ่านไดอะแกรม level 1-2 ของ C4 ออก; รู้จักคำว่า API, database, schema แบบ conceptual; เข้าใจว่า estimate ไม่ใช่คำมั่นสัญญาตายตัว; นั่งฟัง sprint planning/stand-up บ้าง; เขียน user story ร่วมกับ engineer สักครั้ง |
| s5 | T1–T4, fig 4, fig 5, NFR details, notes | §3.2 | see workstream 2 |

Topic fit notes:
- React s12 is "Discovery vs Delivery". The role table is still about mindset and fits there.
- React s14 is "Specification hierarchy". The confusing-pairs table fits well (PRD vs BRD vs SOW); the frameworks table and career cards fit loosely. Default: place all s14 blocks in React s14 under a heading "คู่คำสับสนและเส้นทางข้ามฝั่ง". See Q3.
- s13 "คอขวดใหม่" prose (1813–1815) is already covered by React s13 concept #1 and is **not** restored.

Mobile modes:
- s2, s13, s14 pairs and s14 frameworks: `stack`.
- s12 (4 wide text columns): `stack`.
- s5 T4: `scroll`.
- s5 T1: `stack`, collapsed.

### 4.6 Acceptance criteria
1. `ContentBlock` is a discriminated union. The renderer's `switch` has an exhaustive `never` check.
2. Row counts: s2=3, s12=7, s13=8, s14 pairs=8, s14 frameworks=7. Card counts: s14 = 3 + 5. Column labels match the static headers verbatim.
3. The s13 sources/caveat renders as a collapsed disclosure containing the verbatim caveat text.
4. At ≥640px tables render as `<table>` with `<th scope="col">`. Below 640px `stack` tables render as cards with the column labels visible, and the page does not scroll horizontally at 360px.
5. `[[sN|…]]` links navigate between chapters.
6. Chapters without `contentSections` render exactly as before (visual diff of s1, s3).
7. `npm run lint` and `npm run build` pass.

### 4.7 Do not change
- Existing `coreConcepts` that describe tables as bullets, e.g. React s12 "ตารางเปรียบเทียบวิธีคิด 2 ขั้ว" and s9 tech-debt quadrant bullets. Leave them unless the owner decides otherwise.
- Accordion styling of the existing sections.
- `contentHtml`.

## 5. Workstream 4 — Chapter 11 FAQ

### 5.1 Goal
Restore all 12 static FAQ items as an accordion on s11. Replace the hard-coded 4-item block in GuideTab. Add the 2 static figures. Cross-link overlapping friction playbooks instead of duplicating them.

### 5.2 Source inventory
- Intro and audience notes: 1493–1500. Quick-jump list "คำถามในบทนี้ (12 ข้อ) — คลิกเพื่อข้ามไป": about 1501–1518.
- Each item is `<details id="s11-qN">` with `summary.faq-q`, `p.faq-real` (the real explanation), `div.faq-fix` ("ทางออกที่ใช้ได้" + `•` bullets) and `span.concept-tag` ("แนวคิดที่เกี่ยวข้อง: …").
- Group A **"คำถามที่คนสาย engineering มักถาม"** (q1–q6) and group B **"คำถามที่คนสาย business มักถาม"** (q7–q12, group header about 1575–1578).

| # | Lines | Group | Question | Concept tags |
|---|---|---|---|---|
| q1 | 1520–1527 | A | ทำไม requirement ถึงเปลี่ยนบ่อย ไม่มีวิธีรับมือเลยเหรอ | requirements volatility |
| q2 | 1529–1536 | A | ทำไม timeline ถึงกระชั้นชิดขนาดนั้น ทำไมไม่ถามก่อนรับปาก | planning fallacy, cone of uncertainty |
| q3 | 1538–1545 | A | ทำไมถามว่าอยากได้อะไร แล้วตอบไม่ได้ซะที | elicitation, acceptance criteria |
| q4 | 1547–1554 | A | ทำไมงาน tech debt ไม่เคยได้เข้า sprint เลย | technical debt quadrant |
| q5 | 1556–1563 | A | ทำไมต้องประชุมเยอะขนาดนี้ ตัดออกไม่ได้เหรอ | decision log, async communication |
| q6 | 1565–1572 | A | ทำไม deploy ทีต้องผ่านการอนุมัติหลายขั้น ทำไมไม่ปล่อยเลยทันทีที่โค้ดเสร็จ | Definition of Done, gate, feature flag |
| q7 | 1579–1586 | B | ทำไม dev ถึงจู้จี้จุกจิก ถามเยอะจัง | edge case, elicitation |
| q8 | 1588–1635 | B | ตอนนี้อยากได้แค่นี้ ทำไมต้องห่วง tech debt หรือออกแบบเผื่ออนาคตขนาดนั้น | YAGNI, technical debt quadrant, over-engineering. **Contains fig 8 (tech-debt quadrant, 1593–1629)** + note 1630 |
| q9 | 1637–1644 | B | ทำไม "แค่เพิ่มปุ่มเดียว" ถึงใช้เวลาเป็นสัปดาห์ | hidden complexity, MVP |
| q10 | 1646–1684 | B | ทำไม estimate ไม่เคยตรง แล้วจะวางแผนธุรกิจยังไง | cone of uncertainty, planning fallacy. **Contains fig 9 (cone of uncertainty, 1651–1678)** + caption 1679 |
| q11 | 1686–1693 | B | ทำไม dev บอกว่า "ทำได้" แต่พอเอาจริงกลับมีเงื่อนไขเต็มไปหมด | trade-off, assumption |
| q12 | 1695–1702 | B | ทำไม bug ที่แจ้งไปนานแล้วยังไม่ถูกแก้สักที | bug severity, bug priority |

Closing material:
- "สังเกตไหมว่าทุกคำตอบวนกลับไปที่หลักการเดียวกัน", 3 numbered principles (1707–1713).
- Caveat note about the "bug in production costs 100×" statistic (1714).
- Sources: static s15 `.src-list` (1979–1985), 4 links, which belong to chapter 11.

### 5.3 SVG check
- **Fig 8, tech-debt quadrant:** React has the Fowler quadrant only as text bullets (`chapters6_10.ts` 524, s9) and in a quiz question (`quizQuestions.ts` 189). There is **no visual equivalent**, so port it. Figure key `tech-debt-quadrant`, viewBox 560×330.
- **Fig 9, cone of uncertainty:** React has only text (s11 jargon term, the GuideTab FAQ line 1044, quiz 219). There is **no visual equivalent**, so port it. Figure key `cone-of-uncertainty`.
- React's s11 `ChapterDiagram` (746–898) is the Iron Triangle simulator. It is a different concept and stays.

### 5.4 Overlap map: 12 FAQs vs existing React content
The existing hard-coded GuideTab FAQ (4 items, 1021–1046) is a strict subset: its items 1, 2, 3 and 4 are static q9, q1, q4 and q10. **Delete it** and replace it with the 12 items.

Playbooks (8, `frictionPlaybooks.ts`) mapped to FAQs. Strong means the same conflict; partial means an adjacent one.

| Playbook (chapter) | FAQ overlap | Treatment |
|---|---|---|
| s1 Scope Creep vs Over-engineering | q8 strong; q1, q3, q7 partial | q8 gets a "ดู playbook เต็ม: บทที่ 1" link |
| s2 Hidden Iceberg ("ปุ่มนิดเดียว…3 วัน") | q9 strong; q7 partial | q9 → link to s2 |
| s4 Direct DB hotfix | none | none |
| s6 Technical Debt War | q4 strong; q8 partial | q4 → link to s6 |
| s7 Testing Under Pressure | q6 partial | none (optional link) |
| s8 Friday Deployment | q6 partial | q6 → link to s8 |
| s11 Iron Triangle (shown on the same page) | q2 strong; q10, q11 partial | q2 → "ดู Iron Triangle ด้านบน" (in-page) |
| s12 Blame vs Blameless | none | none |
| none | q5 (meetings), q12 (bug priority) | FAQ-only content |

Rule: FAQ text stays the static short answer. **Never copy playbook scripts or trade-off matrices into FAQ items.** Overlap is expressed only through the `relatedPlaybookChapterId` link.

Also: React s11 core concept #1 "สรุป 4 ความขัดแย้งยอดนิยมตลอดกาล" (`chapters11_15.ts` 87) will duplicate the FAQ. Recommendation: retitle it and reduce it to a one-line pointer to the FAQ section (Q4). React s11's title already says "12 ความขัดแย้ง", which the restoration now makes true.

### 5.5 Data and types
New file `src/data/frictionFaqs.ts`:
```ts
export interface FrictionFaq {
  id: string;                         // 's11-q1' … 's11-q12' (stable anchors)
  group: 'engineering-asks' | 'business-asks';
  question: string;
  real: RichText;                     // .faq-real verbatim (keep <b> as **…**)
  fixes: RichText[];                  // each "•" bullet of .faq-fix, without the bullet glyph
  concepts: string[];                 // concept-tag items, split on ", "
  figure?: { key: FigureKey; title: string; caption?: RichText; note?: RichText };
  relatedPlaybookChapterId?: string;  // per §5.4
}
export const FRICTION_FAQS: FrictionFaq[];       // 12, static order
export const FAQ_GROUPS: { key: FrictionFaq['group']; title: string; subtitle: string }[];
export const FAQ_PRINCIPLES: { title: string; body: RichText }[]; // 3 items, 1707–1713
export const FAQ_CAVEAT: RichText;               // 1714
export const FAQ_SOURCES: { label: string; url: string }[];       // 4, from 1979–1985
```

### 5.6 Components and UX
- `src/components/FrictionFaqSection.tsx`, props `{ audienceMode, onNavigateChapter, onScrollToPlaybook }`.
- It renders in the s11 Diagram section, replacing GuideTab 1014–1076, after `ChapterDiagram`. Alternatively it gets its own accordion section `faq`, placed before Case studies. **Use its own section `faq`, open by default.** It is the core of the chapter and should not hide inside "diagram".
- A quick-jump list of the 12 questions shows at the top as a compact chip row, collapsible on mobile. Clicking a chip opens the item and scrolls to it.
- Group order follows the static behavior: `audienceMode === 'engineer'` shows group A first, `'business'` shows group B first, and `'both'` keeps the static order (A then B). Each group header shows the static subtitle.
- Accordion: multiple items may be open at once. The static page uses native `<details>`, which allows that, so the single `expandedFaqId` pattern is dropped. State is `Set<string>`, with none open by default. Each header is a `<button aria-expanded aria-controls>`.
- Item body order: `real`, then an optional figure (inside `.fig-scope`, max-width 560px), then the fixes box (emerald/ok tone, title `ทางออกที่ใช้ได้`), then concept chips, then an optional "ดู playbook เต็ม: บทที่ N" link. Concept chips that match a `GLOSSARY` term (case-insensitive on `term`/`aliases`) link to s15 with the search prefilled; this is small and uses workstream 1 data. Unmatched concepts render as plain chips.
- Footer: the 3 principles as a numbered list, the caveat as a `warn` note and the sources list with external links (`target="_blank" rel="noopener noreferrer"`).
- Remove the `expandedFaqId` state from GuideTab (line 85) once unused.

### 5.7 Dark mode and responsive behavior
- Use the same card styles as the existing FAQ block: `bg-white dark:bg-[#141414]`, `border-neutral-200 dark:border-[#262626]`.
- The fixes box uses `bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/20`.
- Figures sit at 100% width. The quadrant labels at font-size 9–10.5 can get tiny under 400px, so use `overflow-x-auto` + `min-w-[480px]` for fig 8 and fig 9.

### 5.8 Acceptance criteria
1. `FRICTION_FAQS.length === 12`, with questions verbatim and in static order. Every item has non-empty `real`, ≥1 `fixes` and ≥1 `concepts`.
2. q8 renders fig 8 and q10 renders fig 9, correct in light and dark.
3. Switching the audience lens to Business moves group B to the top. Engineer and Both put group A first.
4. The old 4-item block and `expandedFaqId` are gone. No FAQ text appears twice on the s11 page.
5. q2, q4, q6, q8 and q9 show playbook links, and the links navigate correctly (q2 scrolls in-page).
6. Keyboard: Tab reaches each question, and Enter/Space toggles it with correct `aria-expanded`.
7. `npm run lint` and `npm run build` pass.

### 5.9 Do not change
- `FrictionPlaybookCard.tsx` and `frictionPlaybooks.ts` content.
- The Iron Triangle simulator.
- s11 `jargonList` and `realWorldExamples`.

## 6. Appendix — also missing (each verified against React)

| Item | Static | React status | Suggested action |
|---|---|---|---|
| s1 "PM vs PjM" warn note | 423 | **Missing.** No "PjM" string anywhere in `src/data/chapters/` | `note` block (tone warn) in s1 or s2 Reference; it also appears as a glossary term (#31) and an s14 pair row |
| s6 ADR / RFC / Technical design doc cards | 1138–1143 | ADR **present** in React s14 (jargon, concept, diagram). RFC and "Technical design doc" **missing** everywhere | `cards` block in s6: "เอกสารที่ engineer เขียนก่อนลงมือ" (3 cards), ADR card with `[[s14|…]]` link |
| s6 branching: Trunk-based / Git-flow / PR | 1146–1152 | Trunk-based appears only in one s8 pitfall line; Git-flow **missing** | optional `cards` block in s6 |
| s6 Pair programming | 1162–1164 | **Missing** (no match in `src`) | `note` or `cards` block in s6 |
| s8 fig 6 environment flow (dev → staging → UAT → prod) | 1264–1296 | **Partial.** The s1 Subway simulator has Local → PR → CI → Staging → Production stations (`ChapterDiagram.tsx` 100–106) but no UAT environment and no s8 visual | `figure` block `env-flow` in s8 Reference (markers `env-a`) |
| s9 fig 7 gates + cost-of-change line | 1363–1423 | **Partial.** React s9 (a different topic: tech debt) has a Boehm cost-curve simulator; s6 has DoR/DoD gates. No timeline-with-gates visual | `figure` block `gate-timeline`, placed in s1 (pipeline chapter in React) or s6; low priority |
| Footer text | 1990 `คู่มือกลาง แชร์ต่อได้ — ปรับปรุงเพิ่มเองได้ตามงานที่เจอจริง` | **Missing.** The React footer (`App.tsx` 312–321) has different copy | add as a second line in the footer |
| Figs 1, 2, 3, 10 (s1, s3, s4, s12) | 359, 489, 566, 1725 | Not audited in depth. React s4 has an FR/NFR iceberg (likely equivalent to fig 3); s12 fig 10 "spectrum" has no obvious equivalent | audit in a follow-up |

## 7. Implementation order and size

| Order | Workstream | Why this order | Rough size |
|---|---|---|---|
| 1 | §1 foundations (RichText, `.fig-scope` tokens, figure registry skeleton) + WS3 block model/renderer + s2/s12/s13/s14 data | unblocks WS2 and WS4; lowest risk | M (≈ 400–600 LOC incl. data) |
| 2 | WS1 Glossary | independent, highest reader value, mostly data transcription | M (≈ 99 entries ≈ 500 LOC data + ≈ 250 LOC UI) |
| 3 | WS4 s11 FAQ (+ 2 figures) | reuses blocks, figures and glossary links | M (≈ 350 LOC data + 200 UI + 2 SVG ports) |
| 4 | WS2 s5 diagrams (14 SVG ports) | largest mechanical port; benefits from proven figure pipeline | L (≈ 14 SVG files, ≈ 900–1200 LOC) |
| 5 | Appendix items | small, optional | S each |

Each workstream is independently shippable: one branch/PR, or one commit per workstream. SVG porting can be scripted: a Node script that extracts line ranges, rewrites attributes to camelCase and `var(--` → `var(--fig-`, and emits a TSX skeleton. Ids still need a manual `useId` pass.

## 8. Open questions for the owner

- **Q1.** Fold React s15's 5 extra jargon terms into the glossary (99 total) and drop s15's Jargon section? The spec assumes yes.
- **Q2.** Move the REST/Webhook/WebSocket simulator from s15 to s5 (collapsed), or delete it? The spec assumes moving it.
- **Q3.** Static s14 content (confusing pairs, frameworks, career paths) lands in React s14, which is now about the specification hierarchy. Accept, or retitle React s14 to cover both?
- **Q4.** Trim React s11 core concept "สรุป 4 ความขัดแย้งยอดนิยมตลอดกาล" to a pointer, now that the 12 FAQs exist?
- **Q5.** Glossary categories and chapter mapping are derived, not in the source. Are the 13 categories in §2.3 acceptable?
- **Q6.** Should the glossary `plain` ("บ้านๆ") field be filled for the 94 static terms (new writing, phase 2), or stay empty?

### Owner decisions (2026-09-22)

- **Q1:** Yes — fold the 5 terms in (dedupe), 99 total; drop s15's Jargon section.
- **Q2:** Move the simulator to s5, collapsed.
- **Q3:** Accept for now; restructuring chapter topics is a separate task.
- **Q4:** Yes — trim to a pointer to the FAQ.
- **Q5:** Accept the §2.3 categories as proposed; revisit after the owner reviews the glossary UI.
- **Q6:** Keep `plain` optional and empty for now (phase 2).
