# Spec: Hero-figure briefs for chapters s1–s15

- Date: 2026-09-22
- Status: **Approved** — the owner accepted all six recommendations in §6 (2026-09-22). The s9 `keyTakeaway` rewrite (Q5) is already applied; the other decisions land with their rollout wave.
- Parent spec: [`2026-09-22-visual-first-pilot-ch3.md`](./2026-09-22-visual-first-pilot-ch3.md) (pilot, hero slot, rollout rules). Its §1 non-goals, §2.2–§2.4 porting/responsive/a11y rules, §3 hero slot, §4 (inline placement deferred) and §11 rollout order apply to every brief below unless a brief says otherwise.
- UI copy is **Thai-first**; English appears only in parentheses after the Thai. Every string in `code` inside a panel table is the literal copy to ship.
- Rule change since the pilot: the owner relaxed "≤ 6 text strings per panel". Text count is not capped, but **every string must fit its box at `fontSize` ≥ 10** in the smallest rendered size of its layout mode.
- Scope: this document only specifies figures and the text they replace. Each rollout step still follows pilot §11 (criteria, `visualFirst.test.ts` guard update, §8 re-measure).

---

## 1. Verified facts this document relies on

| Fact | Where |
|---|---|
| s3 hero shipped: `RefundFidelity` (`'refund-fidelity'`), 4 separate `<svg>` panels (`viewBox 0 0 150 240`), HTML labels/notes/scale/tabs, container breakpoint 640px, CSS-only tab switching, `nextTabIndex` roving tabindex. | `figures/RefundFidelity.tsx`, `lib/tabKeys.ts` |
| Existing hero-free figures are **legacy ports**: single wide SVGs (`viewBox` 520–620 wide) with text at `fontSize` 8.5–9.5 (`TranslationLayers`, `GateTimeline`, `EnvFlow`, `UncertaintySpectrum`, `ThreeLenses`, `C4L1Hero`, `C4L2`, `RefundSwimlane`, `RefundSequence`). At a 375px viewport they render around 0.5× scale, so their text falls far below 10px. None meets the hero bar without a redraw. `TechDebtQuadrant` is the exception (min `fontSize` 10). | `figures/*.tsx` |
| Figures in the collapsed Reference section: s1 `translation-layers`, `gate-timeline`; s5 `three-lenses` (5.2), `c4-l1-hero` (5.3); s8 `env-flow`; s12 `uncertainty-spectrum`. | `chapterContentBlocks.ts` (sections without `placement` render in Reference) |
| s5 Diagram section already renders: diagram-family grid (`family-*` signatures), `SwimlaneVsSequence` (`refund-swimlane` + `refund-sequence`), the C4 zoom widget with `c4-l1`…`c4-l4`. | `DiagramSection.tsx:116-180`, `diagramFamilies.ts` |
| s11 FAQ uses `tech-debt-quadrant` and `cone-of-uncertainty`. | `frictionFaqs.ts:145,176` |
| `ChapterContentSection.placement` is `'reference' \| 'diagram'` only. | `types.ts:74` |
| Illustration cards remain for s1, s2, s4–s14 (s5 has two); s3 was deleted by the pilot, s15 never had one. All are metaphor cards (train, backpack, Titanic, kitchen, immigration, ice-cream cone, canary, rolling stone, ER, rubber band, bicycle, autopilot, skyscraper, parcel tracking). | `chapterIllustrations.ts` |
| The C4 domain in s5 figures and `TranslationLayers` is a **food-delivery app** (ลูกค้า / ร้านค้า / ไรเดอร์); the Refund figures use an **online shop**. | `C4L1Hero.tsx`, `C4L2.tsx`, `TranslationLayers.tsx`, `Refund*.tsx` |
| The s1 `ChapterDiagram` widget is a **code release train** (Local Branch → PR → CI → Staging → Production), i.e. s8 material, not requirement drift. | `ChapterDiagram.tsx:67-193` |
| s9 `keyTakeaway` ("ยิ่งเจอบั๊กช้า ยิ่งแก้แพง…") and its widget (Requirement → Production cost cards) restate the s3 point; the chapter title/subtitle are about tech debt. | `chapters6_10.ts:433`, `ChapterDiagram.tsx:659-699` |
| Section keys and layers: beginner Core `primer, jargon, diagram`; experienced Core `coreConcepts, pitfalls, diagram`; overrides `s11: faq`, `s15: glossary`. | `sectionLayers.ts:6-33` |

---

## 2. Shared rules for all hero figures

1. **Artefact, not metaphor.** Every panel draws something a team really produces or looks at: a screen, a ticket, a document, a checklist, a board, a dashboard, a CI/deploy report, a PR diff, a C4 diagram. No trains, icebergs, kitchens, orbits, ships, pyramids-of-Giza. No screenshots or logos of real products; draw generic UI.
2. **One recurring fictional domain: the online shop's "ขอคืนเงิน" feature** (order `#A1024 หูฟังไร้สาย ฿1,290`, refund for an item that did not arrive). **Recommendation: reuse it in every chapter.** Reasons:
   - `RefundFidelity`, `RefundSwimlane` and `RefundSequence` already use it; readers meet it on s3.
   - One feature followed through requirements (s1), priority (s2), design (s3), NFR (s4), architecture (s5), sprint gates (s6), tests (s7), deploy (s8), debt (s9), incidents (s10), negotiation (s11), discovery (s12), AI (s13), specs (s14) and vocabulary (s15) makes the guide read as one lifecycle, which is its thesis.
   - Readers learn the domain once, so every figure's attention goes to the chapter's point.
   - Mitigation for the risk (monotony / needs prior chapters): every figure must stand alone; it never assumes the reader saw another chapter's figure. Only shared constants: shop order `#A1024`, product `หูฟังไร้สาย`, price `฿1,290`, reasons `ไม่ได้รับสินค้า`, team names `ลูกค้า`, `ทีม support`, `ระบบคืนเงิน`.
3. **HTML vs SVG.** Panel labels, per-panel notes, tabs, scale arrows, "fix" rows and anything that must wrap are **HTML**. SVG holds the artefact drawing and only short, fixed strings inside boxes. SVG text: `fontFamily="inherit"`, `fontSize` ≥ 10 user units.
4. **Size rule that makes "≥ 10 px" true.** A panel's `viewBox` width must be ≤ its smallest rendered width in CSS px for that layout mode, so 10 units never render under 10px:
   - 4-up at container ≥ 640px → panel ≈ 150px → `viewBox` width **150**.
   - 2-up at container ≥ 640px → panel ≈ 310px → `viewBox` width **300**.
   - Single figure, or any panel in stacked/tab mode at 375px viewport (reader column ≈ 320px) → `viewBox` width **≤ 320**.
   - Fit budget for implementers: estimate **6.5 units per non-combining character** at `fontSize` 10 (Thai and Latin), then verify in the preview with `getComputedTextLength()`. Where a brief string would not fit, shorten the string, not the font.
5. **Tokens.** Colours only from `var(--fig-*)`: `bg`, `surface-2`, `border`, `text`, `text-2`, `text-muted`, `accent`, `accent-bg`, `accent-border`, `ok`, `ok-bg`, `ok-border`, `warn`, `warn-bg`, `warn-border`, role colours `c-pm`, `c-ba`, `c-sa`, `c-ux`, `c-eng`, `c-qa`, `c-devops`. No new tokens. Every status uses glyph + text (✓ drawn as a path with `--fig-ok`, "!" drawn as shapes with `--fig-warn`), never colour alone.
6. **Container pattern.** Root `<div className={`fig-scope @container ${className ?? ''}`}>`. Multi-panel figures reuse the `RefundFidelity` shell, extracted once into a shared component (see §5, batch 0):
   - `columns: 4` → 4-up ≥ 640px, **tabs** below (as `RefundFidelity`).
   - `columns: 2` → 2-up ≥ 640px, **stacked** below (both panels visible; before/after contrast is the point). Use tabs for 2 panels only when a panel is taller than ≈ 320px rendered.
   - Single figures: one `<svg>`, `width: 100%; height: auto`, static `max-width` (per brief).
7. **Accessibility.** Each `<svg>`: `role="img"`, `aria-labelledby` → own `<title>` + `<desc>` (Thai), ids from one `useId()` with suffixes. Tabs as pilot §2.4. Each brief gives the `<title>`; write `<desc>` as one sentence listing what is visible, in the pattern of pilot §2.2.
8. **No `$`, no multipliers, no cost numbers.** Counts, times, percentages of traffic/uptime and prices of the fictional product are allowed; "x เท่า", "×10", `$`/`฿` cost of change are not. The `visualFirst.test.ts` regex `/\$\s?\d/` must still pass.
9. **Caption and analogy.** `caption` ≤ 60 chars, one line, no banned opener (`ทำความเข้าใจ`, `หัวใจของ`, `กฎเหล็ก`, `ศิลปะการ`, `ทำการ`), no direction words (`ทางขวา`, `ทางซ้าย`, `ด้านบน`, `ด้านล่าง`) because the layout changes by width. `plainAnalogy` ≤ 80 on hero chapters (pilot §7). All lengths below were counted with Python `len()` (UTF-16 length is identical for Thai).
10. **What lands with each figure** (same as pilot §5.1): register the `FigureKey`, add the `CHAPTER_HERO_FIGURES` entry, delete the chapter's `CHAPTER_ILLUSTRATIONS` card(s), shorten `plainAnalogy`, update the pilot guard. Widget (`ChapterDiagram`) content stays unless a brief says otherwise.

---

## 3. Summary

| Ch | Figure (component / `FigureKey`) | Artefact shown | New / reuse | Layout | Size | Wave |
|---|---|---|---|---|---|---|
| s1 | `RefundHandoffDrift` / `'refund-handoff-drift'` | the same request in 4 real documents: customer chat → meeting note → ticket → shipped screen | **new** (existing `translation-layers` moves inline, `gate-timeline` stays in Reference) | 4-up / tabs + HTML fix row | M | 3 |
| s2 | `RefundBacklogCut` / `'refund-backlog-cut'` | sprint backlog with a team-capacity line, before/after ranking | new | before/after (2-up / stack) | M | 2 |
| s3 | `RefundFidelity` / `'refund-fidelity'` | one refund screen at 4 fidelity levels | **done** | 4-up / tabs | — | pilot |
| s4 | `RefundNfrSpec` / `'refund-nfr-spec'` | spec sheet + launch-day screen, without vs with NFR lines | new | before/after rows (2-up / tabs) | M | 2 |
| s5 | `RefundC4Impact` / `'refund-c4-impact'` | C4 Level 2 container diagram with one container down and affected users marked | **new (recommended)**; alternative A = reuse `refund-swimlane` + `refund-sequence` per pilot §11 | single | M | 1 |
| s6 | `RefundStoryGates` / `'refund-story-gates'` | one ticket with its DoR and DoD checklists, skipped vs passed | new | before/after (2-up / stack) | M | 2 |
| s7 | `RefundTestReport` / `'refund-test-report'` | CI test-run report grouped by layer, cone vs pyramid | new | before/after (2-up / stack) | S | 2 |
| s8 | `RefundDeployLog` / `'refund-deploy-log'` | deployment history page: one big release vs daily small releases with auto-rollback | **new** (`env-flow` stays in Reference) | before/after (2-up / stack) | M | 3 |
| s9 | `RefundDebtDiff` / `'refund-debt-diff'` | PR "files changed" list for the same small change, before/after refactor | new | before/after (2-up / stack) | S | 2 |
| s10 | `RefundSloDashboard` / `'refund-slo-dashboard'` | monitoring chart of the refund API with SLA-only vs SLO + SLA lines and an alert | new | before/after (2-up / stack) | M | 2 |
| s11 | `RefundKpiSplit` / `'refund-kpi-split'` | one change request read by two KPI dashboards + a "ได้ ถ้า..." reply | new | 2-up / stack + HTML request and reply rows | M | 2 |
| s12 | `RefundDualTrackBoard` / `'refund-dual-track-board'` | two-lane team board: Discovery experiments feeding Delivery stories | **new** (`uncertainty-spectrum` stays in Reference) | single | M | 3 |
| s13 | `RefundAiReview` / `'refund-ai-review'` | effort timeline before/with AI + an AI-written PR with a flagged line | new | 2 panels (2-up / stack) | M | 2 |
| s14 | `RefundSpecStack` / `'refund-spec-stack'` | 4 document excerpts (BRD, PRD, User Story, ADR) with "ทำไม" back-links | new | 4-up / tabs | M | 2 |
| s15 | `RefundGlossaryFix` / `'refund-glossary-fix'` | team chat with 3 names for one thing vs a glossary entry and aligned chat | new | before/after (2-up / stack) | S | 2 |

Key decisions:
- **Domain:** reuse the online-shop refund feature everywhere (§2.2).
- **No existing figure becomes a hero.** All legacy figures fail the ≥ 10px rule at 375px (§1) and show role-level concepts rather than an artefact. s1/s5/s8/s12 get new heroes; their existing figures either move inline (needs the §4-style mechanism, sketched under s5) or stay in Reference.
- **s5 deviates from pilot §11** (which proposed the Refund swimlane/sequence set as hero) because that set carries "same flow, two notations", not the s5 key takeaway. The owner decides (Q2).

---

## 4. Chapter briefs

Panel tables use: **Label** (HTML above the panel), **SVG content** (literal strings in `code`), **Note** (HTML below the panel). "Fits" notes give the box width the string must fit.

### s1 — โจทย์เพี้ยนระหว่างทาง (Leaky Pipeline)

- **Point to carry** (`keyTakeaway`): meaning leaks at every hand-off; the fix is letting Dev hear the original problem early, not writing more documents.
- **Artefact and why:** the same customer request as it appears in 4 real documents in sequence. The reader sees the condition "ของยังไม่ถึง" disappear at hop 2 and the shipped screen offering refunds on delivered orders. The fix row names the remedy. No body text needed.
- **Component / key:** `RefundHandoffDrift` / `'refund-handoff-drift'`. 4 panels, `viewBox 0 0 150 240`, shared panel shell (`columns: 4`, tabs below 640px).
- **Tablist label:** `เลือกเอกสารแต่ละทอด`. Tabs: `ลูกค้า`, `ประชุม`, `ใบงาน`, `ของจริง`.

| # | Label | SVG content | Note |
|---|---|---|---|
| 1 | `ข้อความลูกค้า (Chat)` | Chat screen: header `แชทกับร้าน`; one incoming bubble in 3 lines: `สั่งหูฟังไป 10 วัน`, `ของยังไม่ถึงเลย`, `ขอเงินคืนได้ไหม`. The phrase `ของยังไม่ถึงเลย` is underlined with `--fig-accent`. Timestamp `09:12`. | `ความหมายครบ` |
| 2 | `สรุปประชุม (Meeting note)` | Document: title `สรุปประชุม 12 ก.ย.`; bullets `• ลูกค้าบ่นเรื่องคืนเงิน`, `• ทำปุ่มขอคืนเงิน`, `• ส่งทีม Dev`. A warn chip at the bottom: "!" + `ไม่มีเงื่อนไข "ของไม่ถึง"`. | `เงื่อนไขสำคัญหาย` |
| 3 | `ใบงาน (Ticket)` | Ticket card: id `REF-112`, title `เพิ่มปุ่มคืนเงิน`, field rows `ที่: หน้าออเดอร์`, `ใคร: ทุกออเดอร์` (the value `ทุกออเดอร์` in `--fig-warn`), status pill `พร้อมทำ`. | `กลายเป็น "ทุกออเดอร์"` |
| 4 | `ของที่ส่ง (Production)` | Phone screen `ออเดอร์ของฉัน`: two order rows. Row 1 `#A1024 หูฟังไร้สาย`, status `ส่งถึงแล้ว`, button `คืนเงิน` (warn border + "!"). Row 2 `#A1031 สายชาร์จ`, status `กำลังส่ง`, button `คืนเงิน`. | `กดคืนได้แม้ของถึงแล้ว` |

- **HTML fix row** under the grid (both modes, full width, `--fig-ok*` left border): `ทางแก้: ให้ Dev อ่านข้อความแรกพร้อมกัน (Three Amigos) ไม่ใช่เขียนเอกสารเพิ่ม`.
- Fits: bubble lines ≤ 17 chars in a 120-unit bubble; `ไม่มีเงื่อนไข "ของไม่ถึง"` needs ≈ 140 units → chip spans x 6–144 (text starts after the "!" glyph at x 22; shorten to `เงื่อนไข "ของไม่ถึง" หาย` if it overflows).
- `<title>` per panel: `ทอดที่ {n} {label}`.
- **Caption (56):** `ข้อความลูกค้าประโยคเดียว ส่งต่อ 4 มือ เงื่อนไขสำคัญหายไป`
- **plainAnalogy:** current 120 → proposed (70): `เหมือนเกมกระซิบ: สั่ง "ต้มยำไม่ใส่ผักชี" ต่อกัน 5 คน ครัวยกแกงจืดมาแทน`
- **Cuts when it lands:** `CHAPTER_ILLUSTRATIONS.s1` ("The Subway Release Train") deleted. Primer scenario (ส่งด่วน → จำที่อยู่) may stay; it is a second example of the same drift.
- **Existing figures (follow-up item of pilot §11):**
  - `translation-layers` → inline after `coreConcepts` (concept 2 "งานรั่วตรงไหนบ้างตอนเปลี่ยนมือ") once the inline mechanism exists (see s5). Before moving: raise its 4 `fontSize="9.5"` strings to ≥ 10 and check mobile scale; it is role-level (PM → BA → SA → Engineer) and complements the hero, so it is not a duplicate.
  - `gate-timeline` stays in Reference. It restates the s3 cost-of-change idea; promoting it would compete with the s3 hero.
- **Overlap check:** widget = code release train (CI/CD stations). No visual duplication with the hero, but it is s8 material and teaches the wrong thing for s1 (Q4). Hero's ticket and chat artefacts overlap nothing else.
- **Open question:** Q4 (see §6).

### s2 — PM กับการตัดสินใจ (Product Management)

- **Point:** "everything is equally important" means nothing is; a PM's skill is choosing what not to do.
- **Artefact and why:** the same sprint backlog of 6 requests with one fixed "team capacity" line. Before: all 6 tagged `ด่วน`, 4 spill below the line. After: ranked, 2 above the line, 4 below with an explicit reason each. The contrast (same items, same line) shows that saying no is the work.
- **Component / key:** `RefundBacklogCut` / `'refund-backlog-cut'`. 2 panels, `viewBox 0 0 300 280`, shell `columns: 2` (stacked below 640px).

| # | Label | SVG content | Note |
|---|---|---|---|
| 1 | `ก่อน: ทุกอย่างด่วน` | Backlog list, 6 rows (row = request + requester, each with a warn pill `ด่วน`): `รายงาน Excel · ฝ่ายขาย`, `ปุ่มแชท · ฝ่ายบริการ`, `แดชบอร์ด AI · ผู้บริหาร`, `ขอคืนเงินเมื่อของไม่ถึง · ลูกค้า`, `แนบรูปหลักฐาน · support`, `Dark mode · ทีมดีไซน์`. After row 2: dashed line labelled `กำลังทีม Sprint นี้`. Rows 3–6 in `--fig-warn-bg` with "!" and a right-aligned tag `ล้น`. | `งานล้น ไม่มีอะไรเสร็จจริง` |
| 2 | `หลัง: เลือกแล้ว` | Same 6 items re-ordered. Above the same dashed line: `ขอคืนเงินเมื่อของไม่ถึง`, `แนบรูปหลักฐาน`, each with an ok ✓ and tag `ทำรอบนี้`. Below, muted text, one reason each: `รายงาน Excel → ใช้ export เดิมไปก่อน`, `ปุ่มแชท → รอบหน้า`, `แดชบอร์ด AI → รอข้อมูลก่อน`, `Dark mode → ไม่ทำ`. Group label `ไม่ทำรอบนี้ (บอกเหตุผลแล้ว)`. | `2 อย่างเสร็จ อีก 4 อย่างมีคำตอบ` |

- Fits: longest row `รายงาน Excel → ใช้ export เดิมไปก่อน` ≈ 33 chars ≈ 215 units in a 280-unit row. Pills are right-aligned at x ≥ 240.
- `<title>`: `แบ็กล็อกก่อนจัดลำดับ` / `แบ็กล็อกหลังจัดลำดับ`.
- **Caption (57):** `งาน 6 อย่าง ทีมทำได้ 2 ฝีมือ PM คือบอกว่าอีก 4 อย่างไม่ทำ`
- **plainAnalogy:** current 117 → proposed (75): `PM เหมือนกัปตันเรือระวางจำกัด: ขนทุกอย่างเรือจม ต้องเลือกว่าเที่ยวนี้ขนอะไร`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s2` (backpack MoSCoW card) deleted.
- **Overlap check:** widget = MoSCoW category definitions + RICE formula. The hero deliberately does **not** use MoSCoW labels or scores (it uses `ทำรอบนี้` / `ไม่ทำรอบนี้`), so the widget stays the place that names the framework. The Reference table "PM ส่งอะไรต่อให้ใคร" is unaffected.
- **Open questions:** none.

### s3 — UX/UI ไม่ใช่แค่ความสวย (done — reference)

- Shipped in the pilot: `RefundFidelity` / `'refund-fidelity'`, caption `หน้าจอขอคืนเงินหน้าเดียว 4 ขั้น ยิ่งใกล้ของจริง ยิ่งแก้ยาก`, analogy 65 chars, illustration card deleted, jargon collapsed.
- It is the format bar and the source of the shared panel shell (§5 batch 0). If the shell is extracted, migrate `RefundFidelity` onto it in the same PR with no visual change.

### s4 — BA และ NFR ที่คนมักลืม (Business Analysis & NFR)

- **Point:** launch-day failures come from NFRs nobody discussed, not from wrong calculations.
- **Artefact and why:** a spec sheet and the screen it produced on campaign day, twice. Without NFR lines the spec looks complete (all ✓) and the screen shows an overload error; with 4 NFR lines the same screen succeeds. The reader sees that the missing piece is a few lines of spec.
- **Component / key:** `RefundNfrSpec` / `'refund-nfr-spec'`. 2 panels, each panel = one row holding **two** SVGs side by side (spec `viewBox 0 0 150 240` + phone `viewBox 0 0 150 240`, joined by an HTML arrow). Shell `columns: 2`; below 640px use **tabs** (a stacked pair would be ≈ 560px tall). Tabs: `ไม่คุย NFR`, `คุย NFR ก่อน`. Tablist label: `เลือกสเปกที่จะเทียบ`. At < 640px the pair stays side by side (2 × 150 = 300 ≤ 320).

| # | Label | SVG content (spec) | SVG content (phone) | Note |
|---|---|---|---|---|
| 1 | `สเปกที่ไม่มี NFR` | Doc header `สเปก: ขอคืนเงิน`; section `ต้องทำได้ (FR)` with 4 ✓ rows `เลือกออเดอร์`, `เลือกเหตุผล`, `แนบรูป`, `ส่งคำขอ`; section `ต้องรับได้ (NFR)` with one empty dashed box `(ไม่มี)`. | Header `ขอคืนเงิน`; top chip `11.11 · คนเข้า 50,000 คน`; centred warn card with "!" : `ระบบไม่ว่าง`, `กรุณาลองใหม่`; disabled button `ส่งคำขอ`. | `ทุกข้อ ✓ แต่ล่มวันแคมเปญ` |
| 2 | `สเปกที่มี NFR` | Same header and FR ✓ rows; NFR section filled with 4 rows, each with an accent bullet: `รับ 50,000 คนพร้อมกัน`, `ตอบภายใน 2 วินาที`, `รูปหลักฐานเก็บตาม PDPA`, `บันทึกทุกการคืนเงิน`. | Same chip `11.11 · คนเข้า 50,000 คน`; ok card with ✓ : `ส่งคำขอแล้ว`, `เลขที่ RF-2291`; enabled button `ดูสถานะ`. | `เพิ่ม 4 บรรทัด ระบบรอดวันแคมเปญ` |

- Fits: `รูปหลักฐานเก็บตาม PDPA` ≈ 20 chars ≈ 130 units in a 138-unit row (bullet at x 8, text from x 16). If tight, use `เก็บรูปตาม PDPA`. The chip string ≈ 23 chars ≈ 150 units: split into two lines `11.11` / `คนเข้า 50,000 คน`.
- `<title>`: `สเปกและหน้าจอวันแคมเปญ เมื่อไม่มี NFR` / `… เมื่อมี NFR`.
- **Caption (52):** `สเปกเดียวกัน ขาด NFR ล่มวันแคมเปญ เติม 4 บรรทัดก็รอด`
- **plainAnalogy:** current 117 → proposed (75): `เหมือนสั่งทำรถ: วิ่งได้มีเบรกคือสิ่งที่เห็น ถุงลมกับโครงรถคือสิ่งที่ชี้ชะตา`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s4` (Titanic iceberg) deleted.
- **Overlap check:** widget = "Requirement Iceberg" text cards naming Performance / Security / Availability / Audit Log with example targets. The hero shows the same four concerns as spec lines for one feature; the widget adds numbers and categories. Acceptable overlap (widget is the "try it"/detail step). The widget's iceberg framing is a metaphor, but widgets are out of this document's scope.
- **Open questions:** none.

### s5 — อ่าน Architecture ด้วย C4 (System Architecture)

- **Point:** a good diagram lets someone outside the team point at a failing box and say which customers are hit.
- **Recommended artefact (option B):** a C4 Level 2 container diagram of the shop with the `ระบบคืนเงิน` container marked down, the two affected people marked, and an unaffected path marked ok. It literally performs the key takeaway.
- **Alternative (option A, pilot §11):** make the existing `SwimlaneVsSequence` pair the hero. Against it: it carries "same story, two notations" (a Diagram-section point), not the key takeaway; both SVGs use `fontSize` 8.5–9.5 in a 300-wide `viewBox` and need a redraw anyway; and it would duplicate what the Diagram section already renders. **Recommendation: B.** (Q2)
- **Component / key (B):** `RefundC4Impact` / `'refund-c4-impact'`. Single SVG, `viewBox 0 0 320 300`, `max-width: 520px`.

| Element | SVG content |
|---|---|
| Title strip (HTML, above) | `ถ้ากล่องนี้ล่ม ใครโดนบ้าง` |
| People (top row, C4 person shape) | `ลูกค้า` (left), `ทีม support` (right) |
| Containers (rounded rects, C4 labels in 2 lines: name + tech in `--fig-text-muted`) | `แอปลูกค้า` / `[มือถือ]`; `หลังบ้าน support` / `[เว็บ]`; `ระบบคำสั่งซื้อ` / `[API]`; `ระบบคืนเงิน` / `[API]`; `ฐานข้อมูล` / `[SQL]` |
| External system (grey, dashed) | `ธนาคาร` / `[ภายนอก]` |
| Relationships (arrows, labels ≤ 10 chars) | `สั่งซื้อ`, `ขอคืนเงิน`, `อนุมัติ`, `โอนคืน` |
| Failure | `ระบบคืนเงิน` box in `--fig-warn-bg`/`--fig-warn-border` with "!" badge and text `ล่ม` |
| Blast radius | arrows into `ระบบคืนเงิน` drawn dashed warn; person badges `ขอคืนไม่ได้` under `ลูกค้า` and `อนุมัติไม่ได้` under `ทีม support`, each with "!" |
| Still working | ok ✓ badge on the `สั่งซื้อ` arrow: `สั่งซื้อได้ปกติ` |
| Legend (HTML, below) | `กล่องสีส้ม = ล่ม · เส้นประ = ใช้งานไม่ได้ · ✓ = ยังใช้ได้` |

- Fits: container boxes 92 units wide; longest name `หลังบ้าน support` ≈ 16 chars ≈ 104 units → box 110 wide for that one, or 2 lines `หลังบ้าน` / `support`.
- `<title>`: `แผนผัง C4 ระดับ 2 ของร้านออนไลน์ เมื่อระบบคืนเงินล่ม`.
- **Caption (52):** `ระบบคืนเงินล่มตัวเดียว ดูแผนผังก็ชี้ได้ว่าใครโดนบ้าง`
- **plainAnalogy:** current 109 → proposed (72): `เหมือนซูม Google Maps: L1 ทั้งประเทศ, L2 ถนนหลัก, L3 ตึก, L4 สายไฟในบ้าน`
- **Cuts:** both illustration cards: `CHAPTER_ILLUSTRATIONS.s5` (kitchen Monolith/Microservices) and `EXTRA_CHAPTER_ILLUSTRATIONS.s5` (REST/Webhook/WebSocket "parcel" matrix). s5 `illustrations` becomes `[]`; delete the `EXTRA_CHAPTER_ILLUSTRATIONS` export if it ends empty (check readers with `bun run lint`).
- **What moves out of Reference / where existing figures go:**

| Figure | Today | Proposed |
|---|---|---|
| `three-lenses` (5.2) | Reference | inline after `coreConcepts` (concept 1 "C4 Model ทั้ง 4 ระดับ"); redraw text to ≥ 10 first |
| `c4-l1-hero` (5.3) | Reference | **remove from s5 content** (the hero plus the L1–L4 widget cover it); keep the component registered for now |
| 5.3 standards table + note | Reference | stays |
| `SwimlaneVsSequence`, family grid, C4 L1–L4 | Diagram section | stay |

- **Overlap check:** the widget's Monolith vs Microservices simulator also shows "one service down, the rest fine" (Payment). Different lesson (architecture style vs reading a diagram) but visually close. Mitigation: the hero uses the refund container, C4 notation and the "who is hit" question; the simulator keeps its kitchen/station wording. C4 zoom figures use the food-delivery domain (Q3).
- **Dependency — inline placement (pilot §4).** s5 is the first consumer. What the mechanism needs, not fully specified here:
  - Data: extend `ChapterContentSection` with `placement: 'inline'` and an anchor, e.g. `after: SectionKey` plus optional `conceptIndex` for a specific core concept.
  - Rendering: `GuideTab` renders inline sections right after the anchor section's body, inside the anchor's open/closed state (collapsed anchor ⇒ figure hidden with it).
  - Level differences: `coreConcepts` is Core for experienced readers but Deep for beginners; the anchor follows the section wherever its layer puts it, so the figure never appears before its paragraph.
  - Filters: `ReferenceSection` and `DiagramSection` must skip `'inline'` sections (today they filter on `'reference'`/`'diagram'`).
  - Tests: every inline anchor exists and `isSectionPresent` for that chapter; no chapter renders the same `figureKey` in both hero and inline.
  - Consumers after s5: s1 `translation-layers`, s9 `tech-debt-quadrant` (optional), s12 `uncertainty-spectrum` (optional).
- **Open questions:** Q2, Q3.

### s6 — Sprint และด่าน DoR/DoD (Agile & Quality Gates)

- **Point:** skipping DoR or DoD does not make work faster; it moves the problem later.
- **Artefact and why:** the same ticket passing two checklists. Skipped: unchecked boxes, the ticket still moves, and a bug ticket appears after release, tagged for next sprint. Passed: all boxes ticked, release has no follow-up. The reader sees the problem reappear, which is the point.
- **Component / key:** `RefundStoryGates` / `'refund-story-gates'`. 2 panels, `viewBox 0 0 300 300`, shell `columns: 2` (stacked below 640px). Each panel flows top to bottom: ticket → DoR gate → `กำลังทำ` → DoD gate → `หลังปล่อย`.

| # | Label | SVG content | Note |
|---|---|---|---|
| 1 | `ข้ามด่าน` | Ticket `REF-118 ขอคืนเงินเมื่อของไม่ถึง`. Gate box `ด่าน DoR (พร้อมทำ?)` with checklist: `☐ เงื่อนไขรับคืนชัด`, `☐ มีดีไซน์จอ error`, `☑ มี Acceptance Criteria`, `☐ ทีมประเมินขนาดแล้ว`; arrow passes anyway with warn label `ข้ามไปก่อน`. Box `กำลังทำ`. Gate box `ด่าน DoD (เสร็จจริง?)`: `☑ โค้ดเสร็จ`, `☐ ผ่านเทสต์อัตโนมัติ`, `☐ มีคนรีวิวโค้ด`, `☐ PO ตรวจรับ`. Result card (warn, "!"): `BUG-131 คืนเงินซ้ำ 2 ครั้ง`, sub-line `ย้ายไป Sprint หน้า`. | `เร็วขึ้นแค่ในวันนี้` |
| 2 | `ผ่านด่าน` | Same ticket and gates, every box `☑`; arrows ok. Result card (ok ✓): `ปล่อยแล้ว`, sub-line `ไม่มีงานย้อนกลับ`. | `ไม่มีงานไหลย้อน` |

- Checkboxes are drawn (rect + ✓ path), not `☐/☑` glyphs, so they render the same in every font; the listed glyphs mark state only.
- Fits: longest checklist row `ทีมประเมินขนาดแล้ว` ≈ 17 chars ≈ 110 units; gate boxes are two columns of 140 units (DoR left, DoD right) if vertical height runs short.
- `<title>`: `ใบงานที่ข้ามด่าน DoR และ DoD` / `ใบงานที่ผ่านด่าน DoR และ DoD`.
- **Caption (57):** `ข้าม DoR/DoD ไม่ได้เร็วขึ้น บั๊กแค่ย้ายไปโผล่ Sprint หน้า`
- **plainAnalogy:** current 118 → proposed (80): `เหมือนสั่งอาหาร: DoR คือใบสั่งที่เมนูชัด DoD คืออาหารพร้อมเสิร์ฟ ไม่ใช่ยกกระทะมา`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s6` (immigration tollbooth) deleted.
- **Overlap check:** widget = two text cards defining DoR and DoD. The hero shows concrete items; the widget keeps the definitions. Reference cards (engineer docs, branching, pair programming) unaffected.
- **Open questions:** none.

### s7 — QA และ Test Pyramid (Quality Assurance)

- **Point:** most tests should be fast, cheap unit tests; slow E2E tests sit at the tip (about 70/20/10).
- **Artefact and why:** two CI test-run reports for the same refund feature. Rows per layer are bars whose widths form the shape: an inverted cone (mostly E2E, slow, flaky failures) versus a pyramid (mostly unit, fast, green). The shape emerges from a real report, not a drawn pyramid.
- **Component / key:** `RefundTestReport` / `'refund-test-report'`. 2 panels, `viewBox 0 0 300 230`, shell `columns: 2` (stacked below 640px).

| # | Label | SVG content | Note |
|---|---|---|---|
| 1 | `ทีม A: เทสต์กองบนยอด` | Report header `ผลรันเทสต์ · ขอคืนเงิน`. Three rows top to bottom, bar centred, width ∝ count: `E2E  60 ข้อ` (wide bar, warn), `Integration  15 ข้อ`, `Unit  5 ข้อ` (narrow). Right column times `18 นาที`, `4 นาที`, `5 วินาที`. Footer: "!" `ล้ม 3 ข้อแบบสุ่ม (Flaky)` and `รวม 22 นาที`. | `รันช้า ล้มมั่ว ไม่มีใครกล้าปล่อย` |
| 2 | `ทีม B: พีระมิด` | Same header and row order: `E2E  20 ข้อ` (narrow), `Integration  40 ข้อ`, `Unit  140 ข้อ` (wide, ok). Times `3 นาที`, `1 นาที`, `20 วินาที`. Footer ✓ `ผ่านทั้งหมด` and `รวม 4 นาที`. Under each bar a sample test in `--fig-text-muted`: `ลูกค้ากดขอคืนเงินจนจบ`, `API คืนเงินบันทึกลงฐานข้อมูล`, `คำนวณยอดคืนเงิน`. | `ส่วนใหญ่เป็น Unit (70/20/10)` |

- Counts are chosen so panel 2 is exactly 70/20/10 (140/40/20). Times are illustrative, not cost.
- Fits: sample-test strings ≤ 27 chars ≈ 175 units, centred in 280 units.
- `<title>`: `รายงานผลเทสต์แบบกรวยกลับหัว` / `รายงานผลเทสต์แบบพีระมิด`.
- **Caption (59):** `เทสต์ชุดเดียวกัน จัดเป็นพีระมิด รันเร็วกว่าและล้มมั่วน้อยลง`
- **plainAnalogy:** current 119 → proposed (80): `เหมือนสร้างรถ: Unit ตรวจน็อต Integration ต่อเครื่องกับเกียร์ E2E ขับทั้งคันบนถนน`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s7` (Egyptian pyramid vs ice-cream cone) deleted.
- **Overlap check:** widget = pyramid text cards with 70/20/10 and an "Ice-Cream Cone Anti-pattern" note. Real overlap in content: the hero shows what the widget describes. Accept; the widget remains the definitions step. Severity/Priority (concept 2) is not touched by the hero.
- **Open questions:** none.

### s8 — CI/CD และการปล่อยของ (DevOps)

- **Point:** small, frequent releases through an automated pipeline are safer than big, rare ones.
- **Artefact and why:** a deployment-history page. Before: one quarterly release bundling 48 changes fails, nobody can tell which change broke, everything is rolled back. After: one change per day, each row shows the pipeline checks; the one bad change rolls back automatically and is re-released fixed the next day.
- **Component / key:** `RefundDeployLog` / `'refund-deploy-log'`. 2 panels, `viewBox 0 0 300 240`, shell `columns: 2` (stacked below 640px).

| # | Label | SVG content | Note |
|---|---|---|---|
| 1 | `ปล่อยก้อนใหญ่ (ไตรมาสละครั้ง)` | Page header `ประวัติการปล่อย`. One large row: `v3.0 · 1 ต.ค.`, `48 การเปลี่ยนแปลง`, status warn "!" `ล้ม`. Below, 3 muted lines: `ตัวไหนพัง? ยังหาไม่เจอ`, `ย้อนทั้งก้อน`, `ของดี 47 อย่างถูกถอยตาม`. | `พังแล้วหาต้นเหตุไม่เจอ` |
| 2 | `ปล่อยชิ้นเล็ก (ทุกวัน)` | Same header. Four rows, each: day, change, three pipeline chips `Build ✓ Test ✓ 5%` and a status: `จ. ปุ่มขอคืนเงิน` ✓; `อ. แนบรูปหลักฐาน` ✓; `พ. ตัวเลือกเหตุผล` warn "!" `ย้อนอัตโนมัติ`; `พฤ. ตัวเลือกเหตุผล (แก้แล้ว)` ✓. | `พังชิ้นเดียว ย้อนชิ้นเดียว` |

- Chip `5%` = canary share (traffic, allowed). The ✓ inside chips is a drawn glyph.
- Fits: row = day 22 units + change ≤ 120 units + chips 3 × 34 units + status 50 units. `ตัวเลือกเหตุผล (แก้แล้ว)` ≈ 23 chars ≈ 150 units → put `(แก้แล้ว)` as a second muted line.
- `<title>`: `ประวัติการปล่อยแบบก้อนใหญ่` / `ประวัติการปล่อยแบบชิ้นเล็กทุกวัน`.
- **Caption (56):** `ก้อนใหญ่พังแล้วหาต้นเหตุไม่เจอ ชิ้นเล็กพังก็ย้อนได้ทันที`
- **plainAnalogy:** current 119 → proposed (78): `เหมือนโรงงานรถยุคใหม่: ตรวจชิ้นส่วนตลอดสายพาน (CI) เสร็จแล้วส่งโชว์รูมเลย (CD)`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s8` (canary in a coal mine) deleted.
- **Existing figure:** `env-flow` (dev → staging → UAT → production) stays in Reference. It explains environments, not batch size, and has 9.5-unit text. Optional later inline consumer after concept 1.
- **Overlap check:** widget = canary traffic slider with auto-rollback. The hero's `5%` chip and `ย้อนอัตโนมัติ` status preview the widget without duplicating it. The s1 release-train widget overlaps s8 heavily (Q4).
- **Open questions:** Q4 (shared with s1).

### s9 — Tech Debt และ Refactor (Technical Debt)

- **Point (as briefed):** debt charges interest on every later change: the same small request touches more and more code. This follows the chapter title and subtitle ("…คิดดอกเบี้ยทบต้นเป็นงานที่ช้าลงทุก Sprint"), **not** the current `keyTakeaway`, which restates s3 (Q5).
- **`keyTakeaway`** (approved, applied): `หนี้ทางเทคนิคคิดดอกเบี้ยทุกครั้งที่แก้โค้ด กันเวลาจ่ายหนี้ทุก Sprint ก่อนงานจะช้าลงเรื่อยๆ`
- **Artefact and why:** a pull request's "files changed" list for the same tiny request, "add refund reason สินค้าชำรุด". With debt the reason list is copy-pasted in 6 places and one is missed, causing a bug. After refactoring it is one file. A developer's real view makes "interest" concrete.
- **Component / key:** `RefundDebtDiff` / `'refund-debt-diff'`. 2 panels, `viewBox 0 0 300 240`, shell `columns: 2` (stacked below 640px).

| # | Label | SVG content | Note |
|---|---|---|---|
| 1 | `โค้ดที่มีหนี้` | PR header `PR #212 เพิ่มเหตุผล "สินค้าชำรุด"`; sub `แก้ 6 ไฟล์`. File rows with `+1` in `--fig-ok`: `app/refund-form.ts`, `backoffice/refund.ts`, `email/refund.html`, `report/export.ts`, `api/v1/refund.ts`. Sixth row warn "!": `api/v2/refund.ts  ลืมแก้`. Footer warn: `อีเมลแจ้งลูกค้าแสดงเหตุผลว่าง`. | `งานเล็ก แต่ต้องตามแก้ทุกที่` |
| 2 | `หลัง Refactor` | PR header `PR #245 เพิ่มเหตุผล "สินค้าชำรุด"`; sub `แก้ 1 ไฟล์`. One row `refund/reasons.ts  +1`. Muted line `ทุกหน้าจออ่านรายการจากไฟล์นี้`. Footer ✓ `ครบทุกหน้าจอ`. | `งานเล็ก ก็แก้ที่เดียว` |

- File paths are Latin monospace-looking but use `fontFamily="inherit"`; longest `backoffice/refund.ts` ≈ 20 chars ≈ 130 units.
- `<title>`: `รายการไฟล์ที่ต้องแก้ในโค้ดที่มีหนี้` / `… หลังปรับโครงสร้างโค้ด`.
- **Caption (59):** `งานเท่ากัน: โค้ดมีหนี้แก้ 6 ไฟล์ หลัง Refactor แก้ไฟล์เดียว` (6 vs 1 is a file count, not a cost multiplier.)
- **plainAnalogy:** current 118 → proposed (79): `เหมือนไม่ล้างกระทะ: วันแรกเร็ว วันที่สิบคราบเต็มครัว Refactoring คือการล้างครัว`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s9` (rolling stone) deleted.
- **Overlap check:** widget = Boehm cost-of-change cards (Requirement → Production), which duplicates the s3 hero and s3 widget. The hero does not repeat it. `tech-debt-quadrant` (s11 FAQ, text already ≥ 10) is an optional inline figure after concept 1 (Fowler quadrant) once inline placement exists.
- **Open question:** Q5.

### s10 — SRE และการรับมือระบบล่ม (Incident Management)

- **Point:** set the SLO tighter than the SLA so you know before you break the customer contract.
- **Artefact and why:** a monitoring dashboard panel of the refund API's success rate over one day. Without an SLO the first signal is the SLA breach. With an SLO line above it, an alert fires early, the team fixes it, and the curve never touches the SLA. Same curve shape; only the line and outcome differ.
- **Component / key:** `RefundSloDashboard` / `'refund-slo-dashboard'`. 2 panels, `viewBox 0 0 300 220`, shell `columns: 2` (stacked below 640px).

| # | Label | SVG content | Note |
|---|---|---|---|
| 1 | `มีแค่ SLA` | Panel header `API คืนเงิน · อัตราสำเร็จ`. Y-axis ticks `100%`, `99.5%`, `99%`; x-axis `09:00`, `10:00`, `11:00`. Line dips from 99.95% to below 99.5% at 10:30. Dashed warn line `SLA 99.5% (สัญญากับลูกค้า)`. Breach marker "!" at the crossing: `ผิดสัญญา 10:30`. Note box: `ลูกค้าแจ้งเข้ามาก่อนทีมรู้`. | `รู้ตัวตอนผิดสัญญาแล้ว` |
| 2 | `มี SLO เหนือ SLA` | Same axes and SLA line. Extra accent line `SLO 99.9% (เป้าของทีม)`. The dip crosses the SLO at 10:05: marker `แจ้งเตือน 10:05`; recovery at 10:20: ✓ `แก้แล้ว 10:20`. The curve bottoms out above SLA. | `เตือนก่อน แก้ทันก่อนผิดสัญญา` |

- Fits: line labels right-aligned inside the plot, ≤ 26 chars ≈ 170 units; place `(สัญญากับลูกค้า)` on its own line if needed.
- Percentages are availability targets, not cost; keep them.
- `<title>`: `กราฟอัตราสำเร็จที่มีแค่เส้น SLA` / `กราฟอัตราสำเร็จที่มีเส้น SLO เหนือ SLA`.
- **Caption (56):** `เส้น SLO อยู่เหนือ SLA ระบบจึงเตือนก่อนผิดสัญญากับลูกค้า`
- **plainAnalogy:** current 114 → proposed (78): `เหมือนโรงพยาบาล: Monitoring คือเครื่องวัดชีพจร Incident Response คือทีมฉุกเฉิน`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s10` (ER triage funnel) deleted.
- **Overlap check:** widget = support tiers L1 → L2 → L3 text cards. No overlap. Error Budget (concept 3) is implied by the SLO gap but not labelled, to keep one idea.
- **Open questions:** none.

### s11 — จุดปะทะที่เจอบ่อย 12 ข้อ (Cross-Team Friction)

- **Point:** friction comes from different KPIs, not personalities: Business is measured on speed and revenue, Dev on stability.
- **Artefact and why:** one change request read by two KPI dashboards. The Business dashboard shows the upside metrics moving up; the Dev dashboard shows the risk metrics the same request touches. Both are right given what they watch. A reply row shows the chapter's tool, "ได้ ถ้า...".
- **Component / key:** `RefundKpiSplit` / `'refund-kpi-split'`. HTML request row → 2 panels (`viewBox 0 0 300 200`, shell `columns: 2`, stacked below 640px) → HTML reply row.

| Part | Content |
|---|---|
| Request row (HTML, above panels) | `คำขอ: "เพิ่มปุ่ม 'คืนเงินทันที' ให้เสร็จภายในศุกร์นี้"` |
| Panel 1 label | `แดชบอร์ดฝั่ง Business` |
| Panel 1 SVG | 3 KPI tiles: `ยอดขาย` with up arrow and ok `คาดว่าเพิ่ม`; `เรื่องร้องเรียน` with down arrow ok `คาดว่าลด`; `ออกทันแคมเปญ` ✓. Header `KPI: เร็ว · รายได้` |
| Panel 1 note | `เห็นโอกาส` |
| Panel 2 label | `แดชบอร์ดฝั่ง Dev` |
| Panel 2 SVG | Header `KPI: เสถียร · ปลอดภัย`. Dependency strip: the button box with 3 lines to `ระบบบัญชี`, `ระบบสต็อก`, `ระบบตัดบัตร`. 2 KPI tiles with "!": `Error rate` `เสี่ยงเพิ่ม`; `เวลาทดสอบ` `ไม่พอภายในศุกร์` |
| Panel 2 note | `เห็นความเสี่ยง` |
| Reply row (HTML, below, ok left border) | `ตอบว่า "ได้ ถ้า...": ได้ภายในศุกร์ ถ้ารอบแรกคืนเป็นเครดิตร้านก่อน` |

- Fits: tile 90 units wide × 3; `ไม่พอภายในศุกร์` ≈ 15 chars ≈ 98 units → tiles on panel 2 are 2 × 135 units.
- `<title>`: `แดชบอร์ด KPI ฝั่ง Business ต่อคำขอเดียวกัน` / `… ฝั่ง Dev …`.
- **Caption (59):** `คำขอเดียวกัน ดูหน้าปัด KPI คนละตัว จึงเห็นความเสี่ยงคนละแบบ`
- **plainAnalogy:** current 119 → proposed (77): `เหมือนคนขับกับช่างเครื่อง: คนขับดูความเร็ว ช่างดูความร้อน แค่ดูหน้าปัดคนละตัว`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s11` (rubber-band Iron Triangle) deleted; it duplicates the widget anyway.
- **Overlap check:** widget = Iron Triangle simulator; FAQ (Core for s11) holds `tech-debt-quadrant` and `cone-of-uncertainty`. The hero introduces no triangle, quadrant or cone. The primer scenario ("แค่เพิ่มปุ่มเดียว" → 3 systems) matches the Dev panel's dependency strip; keep it.
- **Open questions:** none.

### s12 — Discovery กับ Delivery (Dual-Track Agile)

- **Point:** Business finds what to build (Discovery), Dev builds it solidly (Delivery); the two tracks run together.
- **Artefact and why:** a two-lane team board. The Discovery lane (next sprint) holds cheap experiments with results; validated ones cross into the Delivery lane (this sprint) as stories; a failed one is discarded before any code. The board is what dual-track teams actually look at.
- **Component / key:** `RefundDualTrackBoard` / `'refund-dual-track-board'`. Single SVG, `viewBox 0 0 320 340`, `max-width: 560px`. Lanes stacked vertically (Discovery top) so it works at 320 units without tabs.

| Element | SVG content |
|---|---|
| Lane 1 header | `Discovery · สำรวจ (Sprint หน้า)` in `--fig-accent` |
| Lane 1 cards (3) | `สัมภาษณ์ลูกค้า 5 คน` → ✓ `ผ่าน: ของไม่ถึงคือปัญหาอันดับ 1`; `ต้นแบบ "คืนเป็นเครดิต"` → "!" `คนเลือกแค่ส่วนน้อย`; `หน้าเว็บจำลอง "ประกันของหาย"` → muted `รอผล` |
| Lane 2 header | `Delivery · สร้างจริง (Sprint นี้)` |
| Lane 2 cards (2) | `ขอคืนเงินเมื่อของไม่ถึง` (tag `ผ่านการสำรวจแล้ว`), `แนบรูปหลักฐาน` |
| Flows | ok arrow from card 1 of lane 1 down into lane 2 labelled `ส่งต่อ`; card 2 of lane 1 has a grey arrow to a small bin box `ทิ้ง ก่อนเขียนโค้ด` |

- Fits: card width 150 units, 2 lines each; `ผ่าน: ของไม่ถึงคือปัญหาอันดับ 1` ≈ 29 chars ≈ 190 units → use 2 lines (`ผ่าน:` / `ของไม่ถึงคือปัญหาอันดับ 1`) or widen the first card to 300 units (full lane).
- `<title>`: `บอร์ดทีมสองแถว Discovery และ Delivery ของฟีเจอร์คืนเงิน`.
- **Caption (56):** `บอร์ดสองแถว: ฝั่งสำรวจทดลองก่อน ฝั่งสร้างรับเฉพาะที่ผ่าน`
- **plainAnalogy:** current 113 → proposed (75): `เหมือนหน่วยสำรวจกับช่างทำถนน: ไม่มีคนสำรวจ ถนนชนหน้าผา ไม่มีช่าง ก็ไม่มีถนน`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s12` (bicycle wheels) deleted.
- **Existing figure (follow-up item of pilot §11):** `uncertainty-spectrum` stays in Reference; optional inline consumer after concept 2 "สองขั้วคิดต่างกันตรงไหน" once its 14 `fontSize="9"` strings are raised. The role-comparison table in Reference is unaffected.
- **Overlap check:** widget = two "orbits" (Discovery N+1 / Delivery N) plus the "อย่าส่งงานที่ยังไม่ผ่าน Discovery…" rule. Same structure, different form: the hero is the concrete board, the widget the abstract loop. Accept; if the owner finds it redundant after review, the widget, not the hero, is the one to trim.
- **Open questions:** none.

### s13 — AI กับคอขวดใหม่ (AI-Augmented SDLC)

- **Point:** the bottleneck moves from writing code to framing the problem, reviewing, and verifying.
- **Artefact and why:** panel 1 is an effort timeline (Gantt-style strip) for one feature, before AI and with AI; the "เขียนโค้ด" block shrinks and the framing/review/verify blocks become the bulk. Panel 2 is the AI-written PR that shows why review is the bottleneck: one plausible line leaks card numbers into logs.
- **Component / key:** `RefundAiReview` / `'refund-ai-review'`. 2 panels, `viewBox 0 0 300 220`, shell `columns: 2` (stacked below 640px).

| # | Label | SVG content | Note |
|---|---|---|---|
| 1 | `เวลาทำฟีเจอร์คืนเงิน 1 ชิ้น` | Two horizontal strips with row labels `ก่อนมี AI` and `มี AI`. Segments with in-box labels: `ตั้งโจทย์`, `เขียนโค้ด`, `รีวิว`, `ตรวจว่าถูก`. Before: `เขียนโค้ด` is the longest segment. With AI: `เขียนโค้ด` is a thin sliver labelled outside `AI เขียน`, and `ตั้งโจทย์`, `รีวิว`, `ตรวจว่าถูก` widen (accent). No numbers or percentages. | `งานเขียนหด งานคิดและตรวจโต` |
| 2 | `PR ที่ AI เขียน` | PR header `PR #301 เพิ่ม API คืนเงิน`, chip `เขียนโดย AI · 1 นาที`. Diff with 4 green lines as grey bars, one readable line highlighted warn: `log(card_number)`. Review comment bubble with "!": `ส่งเลขบัตรลง log ห้ามผ่าน`. Footer `รีวิวโดยคน · 3 วัน`. | `คนตรวจเป็นด่านสุดท้าย` |

- Rationale for no percentages: the `diagramDescription` 60% → 15% figures have no source in the chapter; a relative strip carries the point without an unsourced number.
- Fits: segment labels need ≥ 50-unit segments; in the "มี AI" row put `AI เขียน` outside the sliver with a leader line.
- `<title>`: `แถบเวลาทำงานก่อนและหลังมี AI` / `PR ที่ AI เขียนพร้อมคอมเมนต์รีวิว`.
- **Caption (58):** `AI เขียนโค้ดเสร็จในนาที แต่ตั้งโจทย์กับตรวจงานยังเป็นของคน`
- **plainAnalogy:** current 109 → proposed (79): `เหมือนเครื่องพิมพ์ 3 มิติความเร็วสูง: ถ้าพิมพ์เขียวผิด บ้านก็พังเร็วขึ้นเท่ากัน`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s13` (autopilot cockpit) deleted.
- **Overlap check:** widget = 3 text cards (what AI does fast / new human bottleneck / most expensive skill). The hero shows the shift; the widget lists skills. The Reference role table and sources are unaffected. The primer scenario (payment code written in 1 minute, 3 days to review) matches panel 2 exactly; keep it.
- **Open questions:** none.

### s14 — เอกสารสเปก 4 ชั้น (Specification Hierarchy)

- **Point:** split documents into layers; each reader reads only their layer, and every layer can trace back to "why".
- **Artefact and why:** 4 real document excerpts for the refund feature, one per layer, each with a reader tag and a back-link line to the layer above. The back-links make traceability visible without prose.
- **Component / key:** `RefundSpecStack` / `'refund-spec-stack'`. 4 panels, `viewBox 0 0 150 240`, shell `columns: 4` (tabs below 640px). Tabs: `BRD`, `PRD`, `Story`, `ADR`. Tablist label: `เลือกชั้นเอกสาร`.

| # | Label | SVG content | Note |
|---|---|---|---|
| 1 | `BRD (ผู้บริหาร)` | Doc id `BRD-3`; heading `เป้าหมาย`; lines `ลดเรื่องร้องเรียน`, `"ของไม่ถึง" 30%`, `ภายในไตรมาสนี้`. Tag `ผู้อ่าน: ผู้บริหาร`. | `ทำไมต้องทำ` |
| 2 | `PRD (ทีมผลิตภัณฑ์)` | Doc id `PRD-12`; lines `ลูกค้าขอคืนเงินเอง`, `เมื่อของไม่ถึง 7 วัน`, `ไม่ต้องรอ support`. Back-link accent chip `↑ เพื่อ BRD-3`. Tag `ผู้อ่าน: PM · UX`. | `ทำอะไร ให้ใคร` |
| 3 | `User Story (ทีม Sprint)` | Card `REF-118`; `ในฐานะ ลูกค้า`, `ฉันอยากขอคืนเงินเอง`, `เพื่อ ไม่ต้องรอ`; divider; `Given ของไม่ถึง 7 วัน`, `When กดขอคืนเงิน`, `Then ได้เลขคำขอ`. Back-link `↑ จาก PRD-12`. | `ตรวจรับอย่างไร` |
| 4 | `ADR (Dev)` | Doc id `ADR-007`; title `ใช้คิวสั่งคืนเงิน`; rows `บริบท: ธนาคารตอบช้า`, `ตัดสินใจ: ส่งผ่านคิว`, `ผลที่ยอม: รอผลไม่กี่นาที`. Back-link `↑ รองรับ REF-118`. Tag `ผู้อ่าน: Dev`. | `ทำไมสร้างแบบนี้` |

- Fits: panel inner width 134 units ≈ 20 chars per line; `ผลที่ยอม: รอผลไม่กี่นาที` ≈ 22 chars → split after `ผลที่ยอม:`.
- `30%` is a business target, not a cost figure; allowed.
- HTML strip under the grid (4-up only, like the s3 scale): `ทุกชั้นชี้กลับไปหาชั้นก่อนหน้าได้ (↑)`.
- `<title>`: `เอกสารชั้นที่ {n} {label}`.
- **Caption (55):** `ฟีเจอร์ขอคืนเงินใน 4 เอกสาร ทุกชั้นชี้กลับไปหาเหตุผลได้`
- **plainAnalogy:** current 119 → proposed (75): `เหมือนสร้างสะพาน: BRD บอกว่าทำไมต้องข้าม PRD บอกกี่เลน ADR บอกว่าทำไมแบบนี้`
- **Cuts:** `CHAPTER_ILLUSTRATIONS.s14` (skyscraper) deleted.
- **Overlap check:** widget = 4 static text cards naming the same 4 layers and the question each answers. With the hero, the widget adds nothing and is not interactive (Q6). The Reference tables (confusable pairs, frameworks per layer, cross-over paths) are unaffected.
- **Open question:** Q6.

### s15 — ศัพท์เทคนิคฉบับภาษาคน (Jargon Buster)

- **Point:** a team that calls one thing by one name (Ubiquitous Language) works faster because nobody re-translates.
- **Artefact and why:** a team chat thread where three people use three names for the refund (one of them a different concept, chargeback), leading to the wrong build; then the glossary entry the team agreed on and the same thread using one term.
- **Component / key:** `RefundGlossaryFix` / `'refund-glossary-fix'`. 2 panels, `viewBox 0 0 300 240`, shell `columns: 2` (stacked below 640px).

| # | Label | SVG content | Note |
|---|---|---|---|
| 1 | `ต่างคนต่างเรียก` | Chat header `#ทีมคืนเงิน`. Bubbles with role initials (role colour tokens): PM `ทำ Refund ให้ทันศุกร์`; Support `ลูกค้ารอ "ยกเลิกออเดอร์" อยู่`; Dev `โอเค ทำ Chargeback นะ`. Each term highlighted in a different muted box. Result card "!" : `Dev ทำระบบให้ธนาคารดึงเงินคืน`, `ไม่ใช่ร้านโอนคืน`. | `3 คำ 3 ความหมาย` |
| 2 | `ตกลงคำเดียว` | Glossary card: term `คืนเงิน (Refund)`, definition `ร้านโอนเงินคืนลูกค้าเอง`, contrast line `ไม่ใช่: Chargeback (ธนาคารดึงคืน)`. Below, the same three bubbles rewritten, all using `คืนเงิน` in the same accent box. ✓ `ทุกคนหมายถึงสิ่งเดียวกัน`. | `คำเดียว ความหมายเดียว` |

- Fits: `ไม่ใช่: Chargeback (ธนาคารดึงคืน)` ≈ 31 chars ≈ 200 units inside a 280-unit card.
- `<title>`: `แชททีมที่เรียกเรื่องเดียวกันต่างกัน` / `อภิธานศัพท์กลางและแชทที่ใช้คำเดียวกัน`.
- **Caption (54):** `เรียกเรื่องเดียวกัน 3 ชื่อ ทีมสร้างผิด ตกลงคำเดียวก็จบ`
- **plainAnalogy:** current 120 → proposed (77): `เหมือนคนไทยคุยกับคนญี่ปุ่น: ต่างคนต่างพูดไม่รู้เรื่อง มีพจนานุกรมกลางก็คุยได้`
- **Cuts:** none. s15 has no illustration card. Hero height is recovered by the analogy box collapsing into one line (pilot §3.3).
- **Overlap check:** Diagram section = glossary category map (filters the glossary, Core via override). The hero shows why a glossary exists; the map is the tool. Check that `Chargeback` is either in `glossary.ts` or add nothing: the figure does not depend on it.
- **Open questions:** none.

---

## 5. Implementation order and batching

### 5.1 Shared building blocks (batch 0, before any new figure)

| Block | Extract from / new | Used by |
|---|---|---|
| `figures/shared/FigurePanels.tsx`: panel shell. Props: `panels: { label; tab?; note?; title; desc; viewBox; Screen }[]`, `columns: 2 \| 4`, `narrow: 'tabs' \| 'stack'`, `tablistLabel?`, `footer?: ReactNode` (4-up-only strip such as the s3 scale). Owns `useId`, roving tabindex via `nextTabIndex`, CSS-only switching. | `RefundFidelity` shell (lines ≈ 200–307) | s1, s2, s4, s6–s11, s13–s15 (and s3 migrated) |
| `figures/shared/glyphs.tsx`: `OkTick`, `WarnBang` (drawn "!"), `Checkbox`, `Chip` | patterns in `RefundFidelity` | all |
| `figures/shared/PhoneFrame.tsx`: 150×240 rounded frame + header bar (`HEADER_PATH`) | `RefundFidelity` `HifiChrome` | s1 panel 4, s4 |
| `figures/shared/DocCard.tsx`: document/ticket card (id, title, rows, tag, back-link chip) | new | s1, s2, s4, s6, s9, s14, s15 |

Batch 0 includes migrating `RefundFidelity` onto `FigurePanels` with no visual change; §9 checks of the pilot must still pass.

### 5.2 Waves and batches

| Order | Batch | Chapters | Why together |
|---|---|---|---|
| 1 | Wave 1 | **s5** (`RefundC4Impact`) + inline-placement mechanism | pilot §11 order; first inline consumer (`three-lenses`) |
| 2 | Wave 2a, document family | **s14, s6, s2** | all `DocCard`/checklist; s14 reuses the 4-up tab shell exactly like s3 |
| 3 | Wave 2b, screen/report family | **s4, s7, s9** | `PhoneFrame`, report rows, file lists; s7 and s9 are the smallest |
| 4 | Wave 2c, chart/board family | **s10, s11, s13, s15** | line chart (s10), KPI tiles (s11), strips (s13), chat bubbles (s11/s15 share a bubble primitive) |
| 5 | Wave 3, follow-up | **s1, s8, s12** + move `translation-layers` inline; Q4 decision on the release-train widget | pilot §11 step 3; s1 reuses `DocCard` and `PhoneFrame`, s8 reuses report rows from s7 |

Each batch: one PR, one `visualFirst.test.ts` guard update, copyBudgets pass for every new hero, preview check light/dark at desktop and 375×812, §8 re-measure on the batch's chapters.

### 5.3 Risks

| Risk | Mitigation |
|---|---|
| Refund domain everywhere feels repetitive | every figure uses a different artefact type (chat, board, spec, C4, checklist, report, deploy log, diff, dashboard, doc, glossary); shared constants limited to §2.2 |
| Thai strings overflow at `fontSize` 10 | §2.4 width rule and 6.5-unit budget; verify with `getComputedTextLength()`; shorten copy, never shrink font |
| Before/after stacked on mobile makes the hero tall (2 × ≈ 250px) | `viewBox` heights ≤ 300; s4 uses tabs; acceptance still checks only that the top of panel 1 is visible (pilot §9.3) |
| Heroes restate widgets (s4, s7, s12, s14) | briefs keep definitions and frameworks in widgets; s14 widget removal is Q6 |
| s9 figure contradicts the current s9 `keyTakeaway` | Resolved: Q5 accepted and applied; otherwise brief s9 around cost-of-late-fix and accept duplication with s3 |
| Legacy figures moved inline still have sub-10 text | redraw text sizes as part of the move; do not move a figure without it |
| s5 option choice delays wave 1 | option B needs no mechanism to ship the hero itself; the inline mechanism can land in the same wave independently |
| Fictional numbers read as claims (50,000 users, 70/20/10, 99.9%) | all taken from the chapter's own copy (scenario, keyTakeaway, widget) or clearly illustrative; no cost numbers anywhere |

---

## 6. Owner decisions (all recommendations accepted, 2026-09-22)

| # | Chapter | Question | Recommendation (**accepted**) |
|---|---|---|---|
| Q1 | all | Reuse the online-shop "ขอคืนเงิน" feature as the single domain for every hero? | Yes (§2.2) |
| Q2 | s5 | Hero option B (new `RefundC4Impact`, carries the key takeaway) or option A (existing swimlane/sequence pair, per pilot §11)? | B |
| Q3 | s5 | The C4 zoom figures (`c4-l1`…`c4-l4`, `c4-l1-hero`) and `translation-layers` use a food-delivery app. Migrate them to the shop domain later, or leave them? | Leave for now; revisit when they are redrawn for ≥ 10 text |
| Q4 | s1 / s8 | The s1 widget is a code release train (s8 material). Move it to s8 (next to the canary slider) and leave s1 with the hero only? | Move it; s1's widget slot stays empty until a requirement-drift widget exists |
| Q5 | s9 | Approve rewriting the s9 `keyTakeaway` to the tech-debt point (proposed text in the s9 brief)? | Yes; the current one duplicates s3 |
| Q6 | s14 | Delete the s14 `ChapterDiagram` text-card branch once the hero lands (it lists the same 4 layers, non-interactive)? | Yes |

## 7. Not determined here

- Reader column width at 375px was assumed ≈ 320px from the pilot's 260px tab panel; measure it in batch 0 before fixing single-figure `viewBox` widths.
- Whether the s12 and s4 widgets are interactive enough to keep next to their heroes was judged from their strings, not from a preview.
- String fits are estimates (§2.4); each implementer verifies in the preview.
