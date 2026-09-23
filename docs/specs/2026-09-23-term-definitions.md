# Spec: Term definitions where the beginner meets them

- Date: 2026-09-23
- Status: Ready for implementation. Every open choice is decided in §8 with its rationale; the owner asked for no further questions.
- Branch: `feat/role-perspective` @ `2cc730d`
- Target app: `/Users/Pathompong/Sites/Personal/biz-dev-guide/src`
- Evidence: `work/audit-term-definitions.md` (read-only audit of the same branch). Every problem below cites that audit's `file:line`.
- Behavioural evidence (added 2026-09-23): `work/ux-test-roles-r3/synthesis.md` §3–§4, `work/ux-test-roles-r3/results-eng-crossover.md` §6, `work/ux-test-roles-r3/results-biz-experienced.md` §6. Recorded in §0.1; folded into Phase 2 (P2.5, acceptance 6–7), §4's priority note and D19.
- Reader-facing language is Thai. Code, tests and this spec are English. Phase 4's Thai copy is drafted during implementation and merged for owner review (§8 D18).
- House format follows `docs/specs/2026-09-23-role-ux-fixes.md`.

## 0. The problem, and the numbers behind it

Beginners meet technical terms and abbreviations before any definition. The only per-chapter definition block (Jargon Buster) sits **fourth of five** in the beginner Core layer (`src/data/sectionLayers.ts:18`). Definitions cannot be relied on to arrive earlier, because each role's reading track visits chapters in its own order (`src/data/readingTracks.ts:7-10`). And looking a term up costs a trip to chapter 15 that loses the reader's place (`src/components/GuideTab.tsx:386-390` → `handleSelectChapter('s15')` → `scrollToChapterStart`, audit §6).

Headline measurements from the audit, so this spec stands alone:

| Measure | Value | Audit |
|---|---|---|
| Abbreviation × chapter pairs visible to a beginner | 89 | §2 table |
| Of those, **no definition anywhere a beginner sees** | **40 pairs / 28 distinct terms** | §2.1 |
| Bare first, defined 1–3 sections later in the same chapter | 25 pairs | §2.2 |
| Chapter openings containing at least one English technical term | **19 / 19** | §5 totals |
| Openings with an abbreviation in `title` / `subtitle` / `enTerm` | 12 (s2, s3, s4, s5, s6, s7, s8, s10, s13, s14, s18, s19) | §5 totals |
| Openings that link to the previous chapter or restate the guide's promise | **0 / 19** | §5 totals |
| In-place definition mechanisms in the app today | **0** (90 jargon cards + 113 glossary entries, none reachable in prose) | §1, §2 |
| Terms never defined anywhere in the track | `beginner` 11 · `experienced` 9 · `biz` 10 · `eng` 10 | §2.3 |
| General lookup cost | 2 clicks + scroll + typing out, 1 Back in; reading position lost both ways | §6 Path A |

The regression this spec must make impossible: **Sprint** has 41 beginner-visible hits across 10 chapters, is defined in exactly one (s6 primer, `src/data/chapters/chapters6_10.ts:20`), has **no glossary entry** (audit §2.4), and `s6 is not in the eng track at all` (`src/data/readingTracks.ts:10`).

### 0.1 Behavioural evidence — round 3 personas (added 2026-09-23)

The audit above is static. A 4-persona usability round has since tested the same branch and measured what
readers actually do when they meet a bare term. Sources: `work/ux-test-roles-r3/synthesis.md` §4 and §3
(I-10, I-11), and the two persona reports that logged unknown terms,
`work/ux-test-roles-r3/results-eng-crossover.md` §6 and `work/ux-test-roles-r3/results-biz-experienced.md` §6.

| Persona | Unfamiliar terms logged | Resolved | How | Entry path into chapters |
|---|---|---|---|---|
| Tee, `eng-crossover` | 16 business/finance terms | **16 / 16** | every one from the chapter's own **Jargon Buster** (ch.16 ×5, ch.17 ×3, ch.18 ×4, ch.19 ×4); `Runway` also via sidebar search, because it was his task | read ch.16–19 **linearly, Core top to bottom** |
| Nok, `biz-experienced` | 5 | 4 / 5 | 2 inline in prose (`DoR`/`DoD`, `NFR`), 1 via the header glossary (`Canary`), 1 guessed-then-confirmed (`ADR`), **1 never verified: `KR`** — "Guessed it means Key Result … did not verify in-app" | sideways — task, search hit, glossary chapter tag |
| Mint, `biz-beginner` | — (not logged) | — | `ไม่รู้ว่า UML หรือ โปรโตคอล คืออะไร` in ch.5, ease 3 / fit 2; `UML` **does** have an entry (`glossary.ts:248`) and she would not leave the chapter to get it | sideways |
| Bank, `eng-beginner` | — (not logged) | — | searched `SLO` in the glossary box that had just found `runway`: `แสดง 0 จาก 113 คำ · ไม่พบคำที่ค้นหา` | sideways |

The decisive result is Tee's 16/16. He resolved every unfamiliar business term without leaving the chapter,
for one reason: reading Core in order means passing the jargon block every time. The personas who entered
chapters sideways — from the index, the sidebar search, a glossary chapter tag or a resumed position — met
terms out of the order the chapter assumes, and guessed instead. The synthesis' own conclusion (§4):

> **The problem is overwhelmingly reach at the moment of need, not missing definitions.** […] A reader will
> guess rather than pay that, and three of four did. There is a smaller, real coverage hole layered
> underneath it — the abbreviations with no entry anywhere (`SLO`, `SRE`, `Sprint`, `KR`, `QA`, `BA`,
> `โปรโตคอล`, and the `FURPS/KISS/ERD` tail) — and that is where guessing turns into a dead end rather than
> a detour.

The consequence for this spec, stated plainly: the dominant problem is **reach**, not absent definitions.
That raises the value of **Phase 1** (the jargon block is what Tee's 16/16 ran on — put it where a sideways
arrival meets it too) and of **Phase 3** (in-place definitions are the only fix for an arrival that never
passes the block at all), and it narrows **Phase 2** from "add everything the audit lists" to "close the
genuine gaps" — of which two were paid for by a real reader in this round, folded into Phase 2 below as
acceptance items 6 and 7. `KR`, the audit's #3 worst offender (9 occurrences in s18, first seen at
`src/data/chapterPerspectives.ts:488`, zero expansions, no entry), is exactly the one term Nok never
verified — the audit predicted the failure and the round observed it.

The phase order in §4 does not change; §4's priority note is updated to cite this evidence.

## 1. Verified code facts

| Fact | Where |
|---|---|
| Beginner Core order is `['primer', 'otherSide', 'coreConcepts', 'jargon', 'diagram']`; experienced Core is `['otherSide', 'coreConcepts', 'pitfalls', 'diagram']`. | `src/data/sectionLayers.ts:17-27` |
| Core sections open by default; `CHAPTER_CORE_COLLAPSED = { s3: ['jargon'] }` forces s3's jargon block closed. | `sectionLayers.ts:164-172` |
| `CHAPTER_CORE_OVERRIDES` promotes `faq` (s11) and `glossary` (s15) to the front of Core. | `sectionLayers.ts:30-33` |
| `GlossaryTerm` **already has** an optional `aliases?: string[]`. No schema change is needed for aliases. | `src/data/glossary.ts:27-40` |
| Glossary search is a case-insensitive substring over `term + aliases + plainText(definition) + plainText(plain)`; `plainText` strips `[[…]]` and `**`. | `src/components/glossary/GlossaryPanel.tsx:38, 98-103` |
| Existing alias shape to copy: `term: 'OKR (Objectives and Key Results) / KPI (Key Performance Indicator)'`, `aliases: ['OKR', 'KPI']`. | `glossary.ts:311-319` |
| `RichText` supports exactly `**bold**`, `\n`, `[[sN\|label]]`; one regex `TOKEN_RE` and one `LINK_RE`. | `src/components/content/RichText.tsx:15-16` |
| `RichText` consumers today: `ContentBlocks.tsx:50`, `ContentTable.tsx:30`, `FrictionFaqSection.tsx:100,111,116,127,249,256`, `GlossaryPanel.tsx:200,207`, `SwimlaneVsSequence.tsx:27,44`. | grep |
| The prose a beginner actually reads does **not** go through `RichText` today: primer fields render as bare `{…}` (`PrimerSection.tsx:36,47,58`), core-concept `detail` (`CoreConceptsSection.tsx:54`), `keyTakeaway` (`ChapterHero.tsx:68`). Phase 3 must route them through it. | those lines |
| `GuideSectionContext` already carries `role` and the resolved `chapterLevel`. | `src/components/guide/sections/registry.tsx:39-40` |
| The 44px mobile tap-target pattern in use: `className="ml-3 -my-3.5 py-3.5 sm:my-0 sm:py-0 …"` with `aria-expanded`. | `src/components/guide/sections/CoreConceptsSection.tsx:58-63` |
| Tracks: `beginner [1,2,3,4,6,7,11,14]`, `experienced [11,1,6,9,12,13,14]`, `biz [2,1,14,4,6,9,10,11]`, `eng [16,1,2,17,18,4,11,19,9]`. Test pins all four. | `readingTracks.ts:6-11`; `readingTracks.test.ts:5-8` |
| Layer tests pin the beginner Core order and the s1/s11/s15 Core lists. | `sectionLayers.test.ts:32-34, and the s1/s11/s15 blocks` |
| s15 has **no** `jargonList` (18 of 19 chapters have exactly 5 entries, 90 total). | audit §1; `src/data/chapters/chapters11_15.ts:549-` |
| The only in-chapter glossary link is s11's FAQ chips, gated on a locally built `GLOSSARY_KEYS` set. | `src/components/FrictionFaqSection.tsx:33, 131-141` |
| Test runner: vitest, node env; components via `renderToStaticMarkup`; `lint` = `tsc --noEmit`. | `package.json` |

---

## Phase 1 — Jargon Buster first for beginners

**Size: small.** 2 source files + 1 test file. Ship immediately.

### Problem

For a beginner the jargon block is the 4th of 5 Core sections: `core: ['primer', 'otherSide', 'coreConcepts', 'jargon', 'diagram']` (`src/data/sectionLayers.ts:18`). Everything before it may use terms bare — the audit's §2.2 lists 25 pairs where the term is in the title or subtitle and the expansion waits in the jargon card three sections down (`NFR` s4: title `src/data/chapters/chapters1_5.ts:436` → jargon `:460`; `BRD`/`PRD` s14: subtitle `chapters11_15.ts:419` → jargon `:434,:440`; `SLA`/`SLO` s10: subtitle `chapters6_10.ts:568` → jargon `:586`). s3 is worse: its jargon block is the one Core section forced closed (`sectionLayers.ts:165`) while the title is `'UX/UI ไม่ใช่แค่ความสวย'` (`chapters1_5.ts:292`).

### Change

1. `src/data/sectionLayers.ts` — beginner Core becomes:

```ts
beginner: {
  core:  ['primer', 'jargon', 'otherSide', 'coreConcepts', 'diagram'],
  apply: [/* unchanged */],
  deep:  [/* unchanged */],
},
experienced: { /* unchanged — D2 */ },
```

`jargon` moves from position 4 to position 2, directly after `primer`. The primer stays first because it is the guide's strongest definition-first surface (audit §4.1: `'QA (Quality Assurance) คือ…'`, `chapters6_10.ts:161`) and it is where a chapter's own term is introduced; the jargon block then covers everything the primer does not, before `otherSide`, `coreConcepts` and `diagram` — the three sections that hold most of §2.1's undefined first uses (`chapterPerspectives.ts:488` KR, `chapters11_15.ts:375` JSON, `chapters1_5.ts:18` UX/BA).

2. Remove `s3` from `CHAPTER_CORE_COLLAPSED` (`sectionLayers.ts:165`), so the block that resolves `UX/UI` is open for the chapter whose title uses it. The constant stays exported (empty object) so the visual-first mechanism survives.

3. Layer minutes are a sum over the section list, so total Core minutes are unchanged. No `sectionMinutes` change.

### Acceptance

1. Role null, level Beginner, s4: Core lists `จุดเริ่มต้น` then `ศัพท์จำเป็น` then `อีกฝั่งมองยังไง`, `แนวคิดหลัก`, `แผนภาพ`. `NFR (Non-Functional Requirements)` is on screen before `แนวคิดหลัก`.
2. s3 as a beginner: the jargon block is open on load.
3. s10 as a beginner: `SLA`/`SLO` are resolved above `แนวคิดหลัก`.
4. Experienced layout is byte-identical on every chapter (no `jargon` in experienced Core; it stays in Deep).
5. The Core header minutes are unchanged from today on s1 and s9.

### Files

`src/data/sectionLayers.ts` · `src/data/sectionLayers.test.ts`.

### Tests — `src/data/sectionLayers.test.ts`

- The 15-keys-once test stays.
- `:32-34` → `expect(LAYER_CONFIG.beginner.core).toEqual(['primer', 'jargon', 'otherSide', 'coreConcepts', 'diagram'])`; the experienced assertion is unchanged.
- The role-resolved `coreFor('biz', 's6')` expectation updates to the new order.
- The s1 / s11 / s15 Core-list expectations update to the new order (s11 → `['faq', 'primer', 'jargon', 'otherSide', 'coreConcepts', 'diagram']`; s15 → `['glossary', 'primer', 'jargon', 'otherSide', 'coreConcepts', 'diagram']` once Phase 2 gives s15 a `jargonList`; before Phase 2, s15 has no jargon section to render).
- New: `expect(LAYER_CONFIG.beginner.core.indexOf('jargon')).toBeLessThan(LAYER_CONFIG.beginner.core.indexOf('coreConcepts'))` — the ordering invariant, stated as an invariant so a future reorder fails here.
- New: `expect(CHAPTER_CORE_COLLAPSED.s3).toBeUndefined()`.
- Minutes test unchanged (order-independent).

---

## Phase 2 — Glossary gaps and search

**Size: small–medium.** 1 data file (≈24 new entries + aliases on existing ones), 1 new data file for s15's jargon list, 2 test files. Ship immediately after Phase 1.

### Problem

The glossary is the fallback path, and for the audit's worst offenders it dead-ends at `ไม่พบคำที่ค้นหา` (`src/components/glossary/GlossaryPanel.tsx:180`). Audit §6 verified **zero occurrences** in `src/data/glossary.ts` for `SLO`, `SRE`, `Agile`, `Waterfall`, `Pyramid`, `Microservices`, `Monolith`, `Refactor`, `UX/UI`, `FURPS`, `KISS`, `ERD`, `QR`, `SMS`, `OTP`, `JSON`, `FAQ`. `Sprint` returns one *misleading* hit — an example sentence under `Opportunity Cost` (`glossary.ts:1019`) — because there is no `Sprint` entry. `QA` has no entry (audit §3 row 4), nor does `BA` (§3 row 9), nor `KR` (§3 row 3, 9 occurrences in s18 and zero expansions, `src/data/chapterPerspectives.ts:488`). And s15 — the chapter *about* jargon, whose primer names six abbreviations in one sentence (`src/data/chapters/chapters11_15.ts:565`) — has no `jargonList` at all.

### Change

**P2.1 New glossary entries.** Add an entry for every term the audit names as unfindable. The required set, each traced to the audit:

| Entry | `aliases` must include | Audit |
|---|---|---|
| SLO (Service Level Objective) | `SLO`, `Service Level Objective`, `เป้าภายใน` | §3 row 5, §6 — **and observed**: round-3 I-11, see acceptance 7 |
| SRE (Site Reliability Engineering) | `SRE`, `Site Reliability Engineering` | §3 row 5, §6 |
| QA (Quality Assurance) | `QA`, `Quality Assurance`, `ประกันคุณภาพ` | §2.1 (s5, s14, s15), §3 row 4 |
| BA (Business Analyst / Business Analysis) | `BA`, `Business Analyst`, `Business Analysis` | §2.1 (s1, s5), §3 row 9 |
| KR (Key Results) | `KR`, `Key Results` | §2.1 (s18), §3 row 3 |
| Sprint | `Sprint`, `สปรินต์` | §2.4, §3 row 6 |
| Agile | `Agile` | §2.4 |
| Waterfall | `Waterfall`, `น้ำตก` | §2.4 |
| Quality Gate (DoR / DoD) | `Quality Gate`, `Gate`, `ด่านตรวจ` | §2.4 |
| Test Pyramid | `Test Pyramid`, `Testing Pyramid`, `Pyramid`, `พีระมิด` | §2.4, §3 row 4 |
| Refactoring | `Refactor`, `Refactoring` | §2.4 |
| Microservices | `Microservices`, `Microservice` | §2.4 |
| Monolith | `Monolith`, `Monolithic` | §2.4 |
| UX/UI | `UX/UI`, `UX`, `UI`, `User Experience`, `User Interface` | §2.1 (s3, s15), §3 row 7 |
| FURPS+ | `FURPS`, `FURPS+` | §2.1 (s4), §3 row 11 |
| KISS (Keep It Simple, Stupid) | `KISS` | §2.1 (s5), §3 row 11 |
| ERD (Entity Relationship Diagram) | `ERD` | §2.1 (s5), §3 row 11 |
| JSON | `JSON` | §2.1 (s13), §3 row 11 |
| FAQ (Frequently Asked Questions) | `FAQ` | §2.1 (s11), §3 row 11 |
| OTP (One-Time Password) | `OTP`, `รหัสใช้ครั้งเดียว` | §2.1 (s4), §3 row 11 |
| SMS | `SMS`, `ข้อความ` | §2.1 (s2, s4), §3 row 11 |
| QR (QR Code) | `QR`, `QR Code` | §2.1 (s6), §3 row 11 |
| AZ (Availability Zone) | `AZ`, `Availability Zone` | §2.1 (s5), §3 row 11 |
| Sketch | `Sketch`, `สเก็ตช์` | §2.4 |

Each entry follows the existing shape (`glossary.ts:27-40`): `id` (kebab-case), `term` with the expansion in parentheses, `definition` (Thai, one line), `plain` (Thai, the "explain it to a newcomer" line — required for new entries, matching the app-origin convention tested at `glossary.test.ts:41-51`), `category` from the existing 14, `relatedChapterIds` with the audit's owning chapter first, `aliases`, `side`, `origin: 'app'`.

The writer must re-verify the "missing" list with a script before adding (`GLOSSARY` may already cover a term under a different label); the Phase 2 test below is the authority, not this table.

**P2.2 Aliases on existing entries.** Where an entry exists but the chapter writes the term differently, add the written form to `aliases` — not to `term`. Audit §2.1's `Gloss. entry / findable` column marks these as findable only by substring luck: `PjM`, `BPMN`, `NFR`, `SDK`, `CI/CD`, `MVP`, `SLA`, `KPI`, `PM`, `API`, `SA`, `CI`, `CTO`, `AI`, `ADR`, `BRD`, `PRD`, `DORA`, `RICE`, `SDLC`, `RTO`, `SLI`, `Tech Debt` (entry is `Technical Debt`). The rule, stated once: **every abbreviation that appears in chapter content is reachable by typing that exact abbreviation, its English expansion, or the Thai label the chapters use.** Aliases carry the abbreviation and the expansion; the Thai label goes in `definition` or `plain`, which the filter already reads (`GlossaryPanel.tsx:100`). The visible `term` label is not extended.

**P2.3 s15 gets a `jargonList`.** Five entries covering exactly the six abbreviations in its own primer sentence (`chapters11_15.ts:565` — `API`, `CI/CD`, `SLA`, `MVP`, `NFR`, `SDK`), in the existing three-part shape (`term` + `humanTranslation` + `meetingExample`, `src/components/guide/sections/JargonSection.tsx:65-74`). This is what makes Phase 1's ordering meaningful on the densest undefined line in the guide (audit §3 row 8).

**P2.4 No search-code change.** `GlossaryPanel.tsx:98-103` already searches `term + aliases + definition + plain`, and `GlossaryPanel.tsx:38` already strips markup. Phase 2 is data only. This is a correction to the framing of the decision: the alias *field* already exists (`glossary.ts:36`); what is missing is its content.

**P2.5 Correct `User story`'s chapter attribution (round-3 I-10, added 2026-09-23).** `src/data/glossary.ts:114-120`
has `term: 'User story'` with `relatedChapterIds: ['s4']`, and chapter 4 (`src/data/chapters/chapters1_5.ts:433-575`)
carries no user-story content. The template is in **chapter 2**'s jargon list
(`src/data/chapters/chapters1_5.ts:187-189`, `User Story & Acceptance Criteria`) and the worked
Role-Action-Value example plus the value rule are in **chapter 14** (`src/data/chapters/chapters11_15.ts:504`,
`:519`, `:537`). Change to `['s14']`, or `['s14','s2']`. Nok followed the `บทที่ 4` chip, expanded chapter 4
fully, found nothing, and lost ~5 minutes and one full wrong turn in R-8
(`work/ux-test-roles-r3/synthesis.md` I-10). The general rule this establishes is D19: a chapter attribution
is part of an entry's correctness, and acceptance 6 below makes it a test, not a one-off data fix.

### Acceptance

1. In the glossary panel, each of `SLO`, `SRE`, `QA`, `BA`, `KR`, `Sprint`, `Agile`, `Waterfall`, `FURPS`, `KISS`, `ERD`, `JSON`, `FAQ`, `OTP`, `SMS`, `QR`, `AZ`, `Sketch`, `UX/UI`, `Refactor`, `Monolith`, `Microservices`, `Test Pyramid`, `Quality Gate` returns at least one entry, and the first hit is the entry for that term.
2. Searching `Sprint` no longer returns the `Opportunity Cost` example as its only hit.
3. Typing the Thai label (`ประกันคุณภาพ`, `ด่านตรวจ`, `สปรินต์`) finds the same entry as the English abbreviation.
4. s15 as a beginner shows `รวมคำศัพท์ที่จำเป็น (Jargon Buster)` with 5 entries, above `แนวคิดหลัก` (Phase 1 ordering).
5. The glossary count shown at `GlossarySection.tsx:25` updates from 113 to the new total, with no duplicate ids.
6. **Chapter attribution is correct (round-3 I-10).** `User story` cites `['s14']` (or `['s14','s2']`), not `['s4']` (`src/data/glossary.ts:114-120`; template `src/data/chapters/chapters1_5.ts:187-189`, worked example `src/data/chapters/chapters11_15.ts:504`). Generalised as a test: **every** glossary entry's `relatedChapterIds` name chapters whose beginner-visible content actually contains the entry's `term` or one of its `aliases` — the entry may not point at a chapter that does not teach it (D19). Following the `บทที่ 4` chip cost Nok ~5 minutes and a full wrong turn in R-8.
7. **`SLO` is findable (round-3 I-11).** Typing `SLO` in the in-chapter glossary box returns the `SLO (Service Level Objective)` entry as the first hit, not `แสดง 0 จาก 113 คำ · ไม่พบคำที่ค้นหา` (`GlossaryPanel.tsx:180`). This is the named case of acceptance 1: Bank searched `SLO` in the same box that had just found `runway` and `canary` and got nothing, while ch.10 (`src/data/chapters/chapters6_10.ts:566,568,573`) and ch.19 (`src/data/chapters/chapters16_19.ts:537`) both teach it. It is the one gap a real reader was observed paying for and getting nothing back.

The reader-observed gaps cluster at the **abbreviation** level — `SLO`, `KR`, `Sprint`, and the Thai
`โปรโตคอล`, which has no entry at all — while the full-word terms readers met (`Gross Margin`, `Burn Rate`,
`Runway`, `Vanity Metric`) all resolved. That matches the audit's §2.1/§2.4 split and is why P2.1's list is
abbreviation-heavy (`work/ux-test-roles-r3/synthesis.md` §4).

### Files

`src/data/glossary.ts` · `src/data/chapters/chapters11_15.ts` (s15 `jargonList`) · `src/data/glossary.test.ts` · **new** `src/data/termCoverage.test.ts`.

### Tests

- `src/data/glossary.test.ts`: keep every existing test. Add — **every entry's `relatedChapterIds` cite chapters whose beginner-visible content contains the entry's `term` or an alias (D19, acceptance 6); the failure message names `entry → cited chapter`, so `User story → s4` is the first thing it prints**; new entries have a non-empty `plain` and at least one alias; `aliases` never repeats the entry's own `term`; no two entries share a lower-cased alias (an ambiguous alias would make Phase 3's resolution ambiguous).
- **New** `src/data/termCoverage.test.ts`, placed **beside `src/data/readingTracks.test.ts` and `src/data/glossary.test.ts`** in `src/data/`. Phase 2 lands **v1** of this file, the weaker "a definition exists at all" form:
  - Extract abbreviations from every beginner-visible field of every chapter (the field list is §3's `TERM_FIELDS`), using `src/data/termInventory.ts` (below).
  - Assert: every extracted abbreviation resolves to exactly one glossary entry by `term` or `aliases`, case-insensitively. The failure message lists `term → first chapter:field`, so the diff names the entry to add.
  - Assert the audit's own list explicitly: a literal array of the 28 terms from §2.1 plus the §2.4 words, each resolving. This pins the audit's findings as regressions.
- **New** `src/data/termInventory.ts` (data, not test, so the app can reuse it in Phase 3):
  - `TERM_FIELDS`: the beginner-visible field extractor, exactly the audit's §20 "what a beginner sees" set — hero `title`/`enTerm`/`subtitle`/`keyTakeaway`/`plainAnalogy`, `beginnerPrimer.*`, `businessNote`/`engineerNote`/`perspectives.*`, `coreConcepts[].heading`/`detail`, `jargonList[].*`, `diagramTitle`/`diagramDescription`, and `placement: 'diagram'` content blocks.
  - `extractAbbreviations(text: string): string[]` — ALL-CAPS tokens of 2–6 characters, plus the curated compound list (`CI/CD`, `UX/UI`, `DoR`, `DoD`, `SLO`, `SLI`, `PjM`, `FURPS+`, `Tech Debt`, …), minus `KNOWN_NON_TERMS` (`Business`, `Engineering`, `Dev`, `Designer`, `Sales`, `Admin`, `Google`, … — an explicit, reviewed ignore list, not a heuristic).
  - `TRACKED_TERMS`: the non-abbreviation long tail from audit §2.4 (`Sprint`, `Agile`, `Waterfall`, `Refactor`, `Monolith`, `Microservices`, `Sketch`, `Gate`, `Pyramid`), matched as whole words.

---

## Phase 3 — Inline term definitions at point of use

**Size: medium.** 1 new component, 1 new lib, `RichText` extension, 5 section components rewired, 4 new test files. The largest phase, and the only one with no content-writing dependency (markers are applied automatically — D16).

### Problem

There is no in-place definition mechanism at all (audit §1: `RichText` supports only `**bold**`, `\n` and `[[sN|label]]`, `src/components/content/RichText.tsx:15`; `JargonTerm` has no tie to an occurrence in prose, `src/types.ts:126-131`). The fallback is a chapter switch to s15 that costs 2 clicks + a scroll + typing, replaces the whole chapter, rewrites the hash, forces the viewport to the chapter start, and discards every section open/close choice and every per-concept `ดูรายละเอียด` toggle on return (audit §6 Path A, citing `src/hooks/useChapterRoute.ts:98-107`, `src/lib/chapterScroll.ts:14-25`, `src/components/GuideTab.tsx:211-213`, `CoreConceptsSection.tsx:10-11`). The guide even narrates the lookup flow it does not provide (`src/data/chapters/chapters11_15.ts:566`, audit §4.7).

### Change

**P3.1 Marker syntax in `RichText`.** Extend `TOKEN_RE` with a term marker `[[g:<glossary-id>|label]]`, parallel to the existing chapter link:

```ts
const TOKEN_RE = /(\*\*[^*]+?\*\*|\[\[g:[a-z0-9-]+\|[^\]]+?\]\]|\[\[s\d+\|[^\]]+?\]\]|\n)/g;
const TERM_RE  = /^\[\[g:([a-z0-9-]+)\|([^\]]+)\]\]$/;
```

An unresolvable id renders as the bare label (never as raw markup), the same fallback `RichText` already takes when `onNavigateChapter` is absent (`RichText.tsx:39-41`). `plainText` in `GlossaryPanel.tsx:38` gains the same strip, so a marker inside a glossary definition never breaks glossary search.

**P3.2 Resolution — `src/data/glossary.ts`.** Add `export const GLOSSARY_BY_ID: ReadonlyMap<string, GlossaryTerm>` and `export function lookupTerm(key: string): GlossaryTerm | undefined` (by id, then by lower-cased `term`, then by lower-cased alias). **The glossary is the single source of truth.** No definition text is copied into chapter data; the marker carries an id and a display label only. A definition edited in `glossary.ts` changes everywhere it is used.

**P3.3 New component — `src/components/content/InlineTerm.tsx`.** A disclosure, not a tooltip, because it must work on touch, by keyboard and for a screen reader:

- Trigger: `<button type="button">` wrapping the label, with a dotted underline (`border-b border-dotted`), `aria-expanded`, `aria-controls={panelId}`, and `data-inline-term={termId}`.
- Tap target: the project's existing pattern, copied from `CoreConceptsSection.tsx:61` — `-my-3.5 py-3.5 sm:my-0 sm:py-0` — so the touch box is 44px tall at mobile width without changing the line box.
- Panel: rendered inline immediately after the sentence's containing block when open, `id={panelId}`, `role="region"`, `aria-label={term.term}`, containing `term.term`, `RichText(term.definition)` and `RichText(term.plain)` when present. Open/close is local `useState`; no scroll, no navigation, no hash change, no section-state reset — this is the whole point of the phase.
- The panel also carries one small `ดูในหน้ารวมคำศัพท์` link (`ctx.onSearchGlossary(term.term)`), which reuses the working s11 path (`FrictionFaqSection.tsx:131-141`) for readers who want the full entry. The definition itself never requires it.
- Only one panel open at a time is **not** enforced; independent disclosures are simpler and match `CoreConceptsSection`'s per-concept toggles.
- **No level or role gate (D17).** The marker renders for `beginner` and `experienced`, for `biz`, `eng` and no role. `ctx.chapterLevel` and `ctx.role` are not read by `InlineTerm` or by `markTerms`, so no call site needs threading and there is one rendering path to test.

**P3.4 Route beginner prose through `RichText`.** Today the fields that hold the audit's undefined first uses render as bare interpolations. Change each to `<RichText text={…} onNavigateChapter={…} />`:

| File:line | Field |
|---|---|
| `src/components/guide/sections/PrimerSection.tsx:36, 47, 58` | `whatIsIt`, `whyItMatters`, `realWorldScenario` |
| `src/components/guide/sections/CoreConceptsSection.tsx:54` | `coreConcepts[].detail` |
| `src/components/guide/sections/JargonSection.tsx` (`:65-74` block) | `humanTranslation`, `meetingExample` |
| `src/components/guide/ChapterHero.tsx:68` | `keyTakeaway` |
| `src/components/guide/sections/OtherSideSection.tsx:22` region | `perspectives.*`, `businessNote`, `engineerNote` |

These are plain strings today, so routing them through `RichText` is behaviour-preserving for text with no markers (verified by a test that a marker-free string renders identically).

**P3.5 Where markers come from — automatic matching with guardrails (D16).** Markers are **not** hand-authored across 19 chapters. Add `src/lib/autoTerms.ts`:

```ts
export type FieldKind = 'prose' | 'heading'; // 'quote' removed by D21
/** Insert `[[g:id|label]]` markers for glossary terms found in `text`. Pure string → string. */
export function markTerms(text: string, kind: FieldKind, seen: Set<string>): string;
```

Applied at render, immediately before `RichText` parses the string. Guardrails, each pinned by a test in `autoTerms.test.ts`:

1. **Prose fields only.** In scope (`kind: 'prose'`): `beginnerPrimer.whatIsIt` / `whyItMatters` / `realWorldScenario`, `coreConcepts[].detail`, `coreConcepts[].bulletPoints[]`, `jargonList[].humanTranslation`, `jargonList[].meetingExample`, `keyTakeaway`, `plainAnalogy`, `businessNote`, `engineerNote`, `perspectives.*` including the `saysVsHears` lines (D21), `diagramDescription`, and `ContentBlock` body/table-cell text. (`diagramDescription` and `ContentBlock` text are not wired yet; see *Deferred* below.) Excluded, never matched (`kind: 'heading'`, returned unchanged): `title`, `subtitle`, `enTerm`, `diagramTitle`, `coreConcepts[].heading`, `jargonList[].term`, `checklist[]`, `realWorldWorkflow[].step`, `commonPitfalls[].pitfall`, every section header string in the components, and every glossary `term` label.
2. **Code-like text is skipped.** Backtick runs, `**bold**` runs (the `RichText` bold token cannot hold a nested marker) and existing markers and chapter links are never scanned. Arrow chains are **prose** (D20): `ผู้บริหาร → PM → Designer → SA → Dev` is marked like any sentence. Dialogue and quoted speech are **prose** (D21): `saysVsHears` lines (`youSay` / `theyHear` / `sayInstead`), `jargonList[].meetingExample` and runs inside `"…"`, `'…'`, `“…”`, `「…」` are marked, still first occurrence per section only (guardrail 3). *(Amended after the Phase 3 review: the original rule skipped both, which contradicted acceptance 1 and left `Sprint` undefined on the eng track until s18.)*
3. **First occurrence per section only.** One term is marked once in `แนวคิดหลัก` and once in `จุดเริ่มต้น`, not once per paragraph. The copy stays prose, not a field of buttons. Each section's marking is a **pure function of the chapter** (`src/lib/sectionTerms.ts`: `heroTerms`, `primerTerms`, `jargonTerms`, `otherSideTerms`, `coreConceptTerms`), which creates its own `seen` set; the component memoises the result and renders strings. No `seen` set is held across renders or passed to a child: a child that fills a shared set during render marks nothing on React StrictMode's second render (the shipped Phase 3 other-side cards had zero markers in dev in all 19 chapters). Core concepts mark every `detail` first, then every bullet, so the markers do not depend on which concepts are unfolded. An open definition is keyed by term id and occurrence (`sprint#0`), not by position, so unfolding content elsewhere cannot move it.
4. **Longest match wins.** Candidate keys are sorted by length descending before scanning, so `CI/CD` beats `CI`, `UX/UI` beats `UX`, `SLO` is never matched inside `SLOW`, and `Test Pyramid` beats `Pyramid`.
5. **Case-sensitive for abbreviations, case-insensitive for words.** A candidate whose key is all-caps (or an all-caps compound such as `CI/CD`, `DoR`, `PjM`) must match with exact case and at a word boundary, so `PM` never fires inside an unrelated token and `IT` never fires inside English prose. Mixed-case words (`Sprint`, `Refactoring`, `Monolith`) match case-insensitively at a word boundary.
6. **Already-expanded text is skipped.** If the 40 characters after a match contain the term's expansion in parentheses, the match is dropped — so `'QA (Quality Assurance) คือ…'` (`src/data/chapters/chapters6_10.ts:161`) is left exactly as the audit praised it (§4.1).
7. **Explicit author opt-out.** This is also how a glossary key that means something else in one string is handled — `[[!g:sales-pipeline]]` on s1's "Leaky Pipeline" and on s8's CI/CD-pipeline dialogue, `[[!g:support-ticket-support-tier]]` on s5's C4 `L1`–`L3` — never a code-level exclusion list, so `Pipeline` is still marked where it does mean the sales pipeline. `[[!g:sprint]]` placed anywhere in a string suppresses automatic marking of that term id in that string; `[[!g:*]]` suppresses all automatic marking in that string. The marker is stripped from the output and never rendered. A hand-authored `[[g:id|label]]` always wins over automatic marking, and suppresses automatic marking of the same id in that string.
8. **Text already inside a marker is never re-scanned.**

### Deferred (recorded after the Phase 3 review and browser acceptance)

- **Not wired yet:** `ContentBlock` body and table-cell text (`ContentBlocks.tsx`), `jargonList[].formalDefinition`, `dialogueExample` lines and `frictionPlaybook` script lines render without `markTerms`. The D11 guard lists every gap this leaves (`KNOWN_GAPS_V2.guardrailLimited`).
- **`diagramDescription` cannot carry markers where it is today:** it renders inside the diagram section's toggle `<button>` (`src/components/guide/sections/DiagramSection.tsx:16-30`), and a term button cannot nest inside another button. Wiring it means moving the description out of the toggle first.
- **Two pre-existing duplicate definitions** sit in Deep-layer ContentBlock table cells: `src/data/chapterContentBlocks.ts:520` (use case vs user story row) and `:574` (TOGAF row). `glossary.test.ts` pins them by equality; rewording them is a content call, and they cannot carry markers until ContentBlocks are wired.
- **The other-side switch** re-walks the shown cards: switching `eng` → `both` puts the biz card first, so a term marked in the eng card may move to the biz card. That is a visible content change, not an unfold, and is accepted.
- **Done in the fix, not deferred:** the review's suggestion to handle `Pipeline` and `L1`–`L3` with the in-content opt-out instead of the code-level `AUTO_MATCH_EXCLUDED_KEYS` list (guardrail 7).

### Acceptance

1. s1 as a beginner: `PM` in `'…ผู้บริหาร → PM → Designer → SA → Dev…'` (`src/data/chapters/chapters1_5.ts:20`) is marked. Tapping it opens the definition below that paragraph. The primer stays open, the page does not scroll, the URL hash does not change, and closing it restores the paragraph exactly.
2. s18 as an `eng`-track reader: `KR` in the other-side box (`src/data/chapterPerspectives.ts:488`) is marked and resolves to `KR (Key Results)`. This is audit §3 row 3, the worst zero-recourse term.
3. s11 as an `experienced`-track reader (s11 is that track's first chapter): `KPI` in the `keyTakeaway` (`src/data/chapters/chapters11_15.ts:14`) is marked, though s18 is not in that track. This is audit §3 row 2.
4. Keyboard: Tab reaches the marker; Enter and Space toggle it; `aria-expanded` flips; the panel is announced (`role="region"` with the term as its label). Escape is not required (no overlay, nothing to trap).
5. At 375px the trigger's touch box is ≥ 44px tall (measure in DevTools) and the line spacing of the paragraph is unchanged from Phase 2.
6. A marker with an unknown id renders the label as plain text with no console error.
7. No definition string appears in both `glossary.ts` and a chapter file (enforced by the test below).

### Files

**new** `src/components/content/InlineTerm.tsx` · **new** `src/lib/autoTerms.ts` · `src/components/content/RichText.tsx` · `src/data/glossary.ts` (`GLOSSARY_BY_ID`, `lookupTerm`) · `src/components/glossary/GlossaryPanel.tsx` (`plainText`) · `src/components/guide/sections/PrimerSection.tsx` · `.../CoreConceptsSection.tsx` · `.../JargonSection.tsx` · `.../OtherSideSection.tsx` · `src/components/guide/ChapterHero.tsx` · tests below.

### Tests

- **new** `src/components/content/RichText.test.tsx` (`renderToStaticMarkup`): a marker-free string renders identically before and after the change; `[[g:sprint|Sprint]]` renders a `button` with `aria-expanded="false"` and `data-inline-term="sprint"`; `[[g:no-such-id|Sprint]]` renders the bare label and no button; a string mixing `**bold**`, `[[s6|…]]` and a term marker renders all three.
- **new** `src/components/content/InlineTerm.test.tsx`: closed state has `aria-expanded="false"` and no panel id in the markup; the trigger className contains `-my-3.5` and `py-3.5` (the 44px pattern, pinned so a restyle cannot silently drop it); the open state contains the glossary `definition` text and `role="region"`.
- **new** `src/lib/autoTerms.test.ts` — one test per guardrail in P3.5: first occurrence per `seen` set only; `kind: 'heading'` returns the input unchanged; a backtick run is untouched while quoted speech and arrow chains are marked (D20, D21); longest match wins (`CI/CD` not `CI`, `Test Pyramid` not `Pyramid`); `PM` does not match inside a longer token and `SLO` does not match inside `SLOW`; `Sprint` matches `sprint`; the already-expanded skip on the literal `chapters6_10.ts:161` string; `[[!g:sprint]]` suppresses one term and is stripped from the output; `[[!g:*]]` suppresses all; a hand-authored marker wins and is not duplicated.
- **new** `src/components/guide/sections/autoTermSnapshot.test.tsx` — the honesty check on real data (D16). For three representative chapters — **s1** (plain register, the `PM → Designer → SA → Dev` arrow chain, `chapters1_5.ts:20`), **s10** (formal register, three abbreviations in the opening, `chapters6_10.ts:566-573`) and **s15** (academic register, the six-abbreviation primer sentence, `chapters11_15.ts:565`) — render the beginner Core sections with `renderToStaticMarkup` and snapshot the list of `data-inline-term` ids in document order. A reviewer reads the snapshot diff, so a glossary entry or a guardrail change that starts marking the wrong thing shows up as a reviewable list, not a silent behaviour change.
- `src/data/termCoverage.test.ts` is **upgraded to v2** here — the owner's guard, in its full form:
  - For each track in `TRACK_CHAPTER_NUMS` (`src/data/readingTracks.ts:6-11`), walk the chapters **in track order**, and within each chapter walk `TERM_FIELDS` in the beginner Core render order that Phase 1 established (hero → primer → jargon → otherSide → coreConcepts → diagram).
  - For every abbreviation, record its first appearance in that track. Assert a definition is available **at or before** that point: a resolvable term marker on that occurrence, or an expansion in the same string, or an earlier beginner-visible definition in the same or an earlier chapter of that track.
  - Failure message: `track eng: "Sprint" first seen at s17/perspectives.measuredBy, defined only in s6 (not in this track)` — the exact regression the audit found.
  - The four tracks are asserted independently with `it.each`, so one track's gap does not mask another's.
  - *(After review S3–S5.)* The markers the guard credits come from the same pure section walks the components render (`src/lib/sectionTerms.ts`), not a hand-kept field mirror. It models a beginner's default view: core-concept bullets are folded, so they are neither a first use nor a definition. The pinned gaps are split into `guardrailLimited` (a glossary entry exists, but the first use is in a heading or an unwired field) and `missingFromGlossary` (no entry resolves the term). The per-track "never defined" count is a headline number of this guard, not a re-measurement of audit §2.3.
  - A StrictMode regression test (`termMarkerPurity.test.tsx`) runs every function component body twice per render, as React does in development, and asserts each section renders exactly the markers its walk computes.
- Add to `src/data/glossary.test.ts`: no chapter file contains a glossary entry's `definition` string verbatim (the no-duplication rule, D8).

---

## Phase 4 — Chapter-intro rewrite

**Size: content-heavy, code-light.** 1 type change, 1 component change, 19 chapters of drafted Thai copy, 1 test. The copy is drafted in this phase and merged for owner review, not treated as final (D18).

### Problem

Audit §5: **19 / 19** chapter openings contain at least one English technical term, 12 put an abbreviation in `title`/`subtitle`/`enTerm`, and **0 openings link to the previous chapter or restate the guide's promise**. The structural causes the audit names: the promise is stated once per page and never per chapter (`src/components/GuideTab.tsx:359-363`); continuity lives in chrome, not copy (`บทก่อนหน้า`/`บทถัดไป` are label-only, `GuideTab.tsx:553,613`; the only track-aware pointer is the footer, `src/components/guide/TrackFooter.tsx:16-25`); no chapter has a "why you are here" field — `keyTakeaway` renders as `สรุปบทนี้:` (`ChapterHero.tsx:68`), a conclusion, not an origin; and the only per-chapter orientation line is identical for all 19 chapters (`GuideTab.tsx:723-725`).

### Change

**P4.1 New required field.** `Chapter` (`src/types.ts:214-242`) gains:

```ts
/** One Thai line under the subtitle: where this chapter sits in the arc, and what every
 *  abbreviation in title/subtitle/enTerm/keyTakeaway stands for. Required for all 19 chapters. */
chapterOpening: string;
```

Required, not optional, so `tsc --noEmit` lists every unfilled chapter. It is a single `RichText` string (Phase 3's markers work inside it).

**P4.2 Required shape of the copy** (this spec defines the shape and the test; the Thai itself is drafted during implementation and reviewed by the owner — D18):

1. **Connection** — one clause naming either the previous chapter on the reader's arc or the guide's promise (`'คู่มือสองโลก Business ↔ Engineering'`, `GuideTab.tsx:359`). Track-aware wording is out of scope: the line must be true for a reader arriving from *any* direction, including a cold deep link (audit §2.5 lists the four cold-entry paths: index `GuideTab.tsx:482`, hash `useChapterRoute.ts:37`, resume banner `GuideTab.tsx:534`, quiz `chapterId`).
2. **Expansion** — every abbreviation used in `title`, `subtitle`, `enTerm` or `keyTakeaway` is expanded here, in the pattern that already works (audit §4.1–§4.4): `X (Expansion) คือ …`. The 12 chapters in §5's list are the priority.
3. **Register** — plain Thai. The audit flags s4, s5, s7, s10, s13, s14 as formal and s15 as academic (§5 totals); their opening line is the place to set a plain register before the formal `enTerm` lands.
4. Length: ≤ 160 characters, consistent with the existing copy budget tests (`src/data/copyBudgets.test.ts`).

**P4.3 Render.** `ChapterHero.tsx` renders `chapterOpening` through `RichText` directly under `{chapter.subtitle}` (`ChapterHero.tsx:61-63`) and above `heroFigure`, with `data-chapter-opening`. Styling matches the subtitle's muted class. It renders for both levels (it is orientation, not remediation).

### Acceptance

1. Every chapter s1–s19 has a non-empty `chapterOpening`; `bun run lint` fails while any is missing.
2. s4 as a beginner: the opening line expands both `BA` and `NFR`, on screen above the hero figure, before `keyTakeaway`'s `Non-Functional Requirements` (`src/data/chapters/chapters1_5.ts:436,443`).
3. s10: `SRE`, `SLA` and `SLO` are all expanded in the opening (audit §3 row 5 — three abbreviations carried the whole opening screen).
4. s13: the line is plain Thai despite the `enTerm` `'AI-Augmented SDLC'` (`chapters11_15.ts:278`).
5. Each line names the previous chapter or the guide's promise; a cold deep link to any chapter reads correctly with no prior chapter loaded.
6. No horizontal scroll at 375px; the hero gains one line, not a block.
7. **The phase is not done on merge (D18).** The 19 drafted lines are presented to the owner for review as a list (chapter, `title`/`subtitle` abbreviations, drafted line), with the 12 openings that carry a title/subtitle abbreviation first (audit §5 totals: s2, s3, s4, s5, s6, s7, s8, s10, s13, s14, s18, s19) and the remaining 7 after. The owner's edits land as a follow-up commit to the same phase; the Phase 4 tests below pass throughout, so an edit can never break the structure. **Done:** the owner approved all 19 lines as drafted on 2026-09-23 (D18); no follow-up edit commit.

### Files

`src/types.ts` · `src/components/guide/ChapterHero.tsx` · `src/data/chapters/chapters1_5.ts` · `chapters6_10.ts` · `chapters11_15.ts` · `chapters16_19.ts` · `src/data/copyBudgets.test.ts` · `src/data/termCoverage.test.ts`.

### Tests

- `src/data/copyBudgets.test.ts`: every chapter's `chapterOpening` is non-empty and ≤ 160 characters (`[...s].length`).
- New in `src/data/termCoverage.test.ts`: for each chapter, every abbreviation appearing in `title`, `subtitle`, `enTerm` or `keyTakeaway` appears **expanded** in `chapterOpening` — expanded meaning the string contains the abbreviation followed by its glossary expansion in parentheses, or a resolvable `[[g:…]]` marker on it. This is the mechanical half of P4.2 and the reason Phase 4 needs no copy review to be *checked*.
- New: every `chapterOpening` contains at least one of the continuity markers — a `[[sN|…]]` chapter link, or one of a small reviewed list of promise phrases (`'สองโลก'`, `'Business'`, `'Engineering'`). Weak by construction; it catches an empty or boilerplate line, not a bad one. The copy review is human.

---

## 4. Order, size and what ships first

| Phase | Files touched | Effort | Ship now? |
|---|---|---|---|
| 1 — Jargon first | 2 (1 data + 1 test) | ~1 hour | **Yes.** The audit's own reading is that phases 1 and 2 are small. Pure reordering, no new surface. |
| 2 — Glossary gaps and search | 4 (+2 new test/data files) | ~half a day, mostly writing 24 Thai entries | **Yes.** Data only; `GlossaryPanel` needs no change. |
| 3 — Inline definitions | ~11 | 1–2 days | After 1 and 2. Nothing blocks it; it depends on Phase 2's entries existing. |
| 4 — Chapter openings | ~8, of which 4 are chapter data | ~1 day of code + 19 drafted lines | Last. Reads best once Phase 3's markers exist, and it merges for review (D18). |

Each phase is independently shippable and separately committed, in this order. Phase 2's glossary entries are what Phase 3's markers resolve against, and Phase 3's markers are what Phase 4's openings use for any abbreviation too long to expand inline — so the order is a dependency order, not just a priority order.

**Priority note, updated with round-3 evidence (§0.1).** Phase 1 was originally justified by layout reasoning
— the jargon block is 4th of 5 for beginners (`src/data/sectionLayers.ts:18`). It is now justified by
behaviour: the one persona who resolved **16 of 16** unfamiliar terms did so entirely from chapter jargon
blocks he reached by reading Core in order (`work/ux-test-roles-r3/results-eng-crossover.md` §6), which is
direct evidence that this block works when the reader reaches it, and that its position is the variable.
Phase 3 is what serves the sideways arrival that never reaches it at all
(`work/ux-test-roles-r3/synthesis.md` §4: readers "guess rather than pay" the lookup cost, and three of four
did). Phase 2 keeps its slot but is now narrower — close the genuine gaps, with `SLO` and `User story`'s
attribution as observed, named cases (acceptance 6 and 7). The order below is unchanged, because it is a
dependency order: Phase 2's entries are what Phase 3's markers resolve against.

## 5. Verification (every phase)

1. `bun run lint`, `bun run test`, `bun run build` pass.
2. `bun run dev` at 1440px and 375px on a clean profile with the console open: run the phase's acceptance steps; no console errors, no horizontal scroll at 375px.
3. Keyboard pass for Phase 3: Tab to a marker, Enter and Space toggle, `aria-expanded` flips, VoiceOver announces the term and reads the definition region.
4. Track pass after Phase 3: pick the `eng` track and read it in order; `Sprint`, `KR`, `PM` and `KPI` each resolve at first contact without leaving the chapter. *(After D20/D21, `Sprint` (s16 dialogue) and `PM` (s1 arrow chain) do. `KPI`, `OKR` and `KR` first appear in s18's `title` and a meetingExample before the primer; the title is a heading and stays unmarked until Phase 4's openings — pinned in `KNOWN_GAPS_V2.eng`.)*
5. One commit per phase.

## 6. Storage keys

None. Inline-term open state and per-chapter disclosure state are component state, not persisted.

## 7. Data shape changes

| Shape | Phase | Change |
|---|---|---|
| `GlossaryTerm` | 2 | none — `aliases?: string[]` already exists (`glossary.ts:36`); Phase 2 fills it |
| `GLOSSARY` | 2 | ~24 new entries, `origin: 'app'`, each with `plain` |
| s15 `jargonList` | 2 | new, 5 entries |
| `RichText` subset | 3 | `[[g:<id>\|label]]` term marker added |
| `glossary.ts` exports | 3 | `GLOSSARY_BY_ID`, `lookupTerm` |
| `Chapter` | 4 | `chapterOpening: string`, required |

## 8. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | Four phases in this order — (1) Jargon Buster first, (2) glossary gaps and search, (3) inline definitions, (4) chapter-intro rewrite — each independently shippable and separately committed. | Each phase is a complete improvement on its own, and each is a dependency of the next (D9's glossary is Phase 3's source of truth; Phase 3's markers are what Phase 4's openings lean on). Small and certain first: phases 1 and 2 are hours, not days, and they cut the audit's two cheapest classes of failure (late placement, dead-end lookup). |
| D2 | Phase 1 reorders the **beginner** Core layer only; the experienced layer is untouched. | The failure is a beginner failure: the jargon block is 4th of 5 for beginners (`sectionLayers.ts:18`) and sits in Deep for experienced readers by design (`:26`), where it is not claimed to serve prose. Changing the experienced layer would reopen a settled layout decision with no evidence behind it. |
| D3 | Within beginner Core, the order is `primer, jargon, otherSide, coreConcepts, diagram` — jargon second, not first. | The primer is the guide's best definition-first surface (audit §4.1) and introduces the chapter's own subject; putting the vocabulary list before it would strand the reader in a glossary with no context. Jargon second still precedes every section the audit flags for undefined first uses: `otherSide` (`chapterPerspectives.ts:488`), `coreConcepts` (`chapters11_15.ts:375`) and `diagram` (`chapters1_5.ts:18`). |
| D4 | Phase 1 also removes `s3` from `CHAPTER_CORE_COLLAPSED` (`sectionLayers.ts:165`). | s3's title is `'UX/UI ไม่ใช่แค่ความสวย'` (`chapters1_5.ts:292`) and the one Core section that resolves it is the one forced closed. Promoting the block and leaving it collapsed would be a no-op for exactly the worst case. |
| D5 | Every abbreviation the audit lists as missing gets a glossary entry — §2.1's unfindable rows, §2.4's long tail, and `SLO`, `SRE`, `QA`, `BA`, `KR` from §3. | The glossary is the app's only global definition surface and its dead ends are measured, not suspected: audit §6 verified zero occurrences for 17 terms and a single misleading hit for `Sprint` (`glossary.ts:1019`). An entry costs three Thai lines; a dead end costs the reader the sentence. |
| D6 | Search must match the term as written in chapter content — English abbreviation, English expansion, and the Thai label — and the written forms go in `aliases`, never in the visible `term` label. | `GlossaryPanel.tsx:98-103` already searches `term + aliases + definition + plain`, so this is achievable with data alone. Stuffing forms into `term` would wreck the card headings (`glossary.ts:311` is already at the limit of a readable label) and the alphabetical order. `aliases` already exists (`glossary.ts:36`) — a correction to the framing: the field is not new, its content is. |
| D7 | Phase 3 defines terms **in place**: tap the term, the definition appears inline. No navigation, no hash change, no scroll, no loss of reading position. | The measured cost of the alternative is audit §6: 2 clicks + a scroll + typing out, 1 Back in, the viewport forced to the chapter start (`chapterScroll.ts:14-25`), and every section and per-concept toggle reset (`GuideTab.tsx:211-213`, `CoreConceptsSection.tsx:10-11`). The guide itself narrates this flow as the failure mode it is (`chapters11_15.ts:566`). |
| D8 | The marker carries a glossary **id** and a display label; the definition is authored once in `glossary.ts` and never copied into chapter data. Enforced by a test. | 89 term×chapter pairs (audit §2) means a duplicated definition is a guaranteed divergence. One source of truth also makes D5's new entries pay off twice: they fix search *and* every inline marker at once. |
| D9 | The mechanism extends the existing rich-text pipeline (`RichText.tsx:15`) with `[[g:<id>\|label]]`, parallel to the existing `[[sN\|label]]`. | The pipeline, its escape-free parsing and its unresolvable-target fallback already exist and are already trusted with chapter links (`RichText.tsx:39-41`). A second markup system would need its own parser, its own tests and its own `plainText` stripping in glossary search (`GlossaryPanel.tsx:38`). |
| D10 | The inline definition is a **disclosure** (button + inline region), not a hover tooltip: keyboard-reachable, `aria-expanded` + `aria-controls`, `role="region"` labelled by the term, and a ≥ 44px touch box at mobile width using the project's existing `-my-3.5 py-3.5 sm:my-0 sm:py-0` pattern (`CoreConceptsSection.tsx:61`). | Thai readers on phones are the primary audience; hover does not exist there. Reusing the project's own tap-target pattern keeps the line box unchanged and means the accessibility review has one pattern to check, not two. |
| D11 | A guard test walks every reading track in `src/data/readingTracks.ts` in order and requires, for every abbreviation, a definition available **at or before** its first appearance in that track. It lives in **new** `src/data/termCoverage.test.ts`, beside `src/data/readingTracks.test.ts` and `src/data/glossary.test.ts`. | This is the test that makes the audit's core finding unrepeatable: `Sprint` is defined only in s6 (`chapters6_10.ts:20`), and the `eng` track never visits s6 (`readingTracks.ts:10`). Chapter order ≠ reading order, so a per-chapter check cannot catch it; only a per-track walk can. It lands in two steps — a glossary-coverage v1 with Phase 2, upgraded to the full track-order form with Phase 3 — because the at-or-before form is unsatisfiable until markers exist. |
| D12 | Phase 4 is content work. This spec fixes the field (`chapterOpening`), its required shape, its render position and its acceptance test, not the final wording. | The audit measured the gap (19/19 openings with bare terms, 0/19 with a connection, §5) but the register judgement is the owner's — the audit itself found register drift in 7 chapters. A mechanical test can check the expansion half; only a human can check the connection half. |
| D13 | `chapterOpening` is required, not optional, and is one ≤ 160-character `RichText` line under the subtitle. | Required means `tsc --noEmit` enumerates the unwritten chapters, which is a better work queue than a spreadsheet. One line keeps the hero a hero — the audit's §5 render order already fits five elements above the fold (`ChapterHero.tsx:54-68`). **Length unit (recorded after the Phase 4 review):** 160 is counted in code points (`[...s].length`), not visible characters. For Thai that is roughly 110–150 visible characters, because combining vowels and tone marks each count as one. Kept for consistency with every other budget in `copyBudgets.test.ts`; code points are also the stricter measure. The drafted openings run 120–160 code points and 11 of 19 sit within 5 of the ceiling (s9, s10, s11, s13 and s18 at exactly 160; s3, s5, s6, s7, s14, s19 at 155–159), so an edit that adds words has almost no room. |
| D14 | The opening line must read correctly for a cold arrival and must not be track-aware. | A chapter can be opened from the index, a deep link, the resume banner or a quiz result (audit §2.5), so "the chapter you just read" is unknown at render. Track-aware continuity already exists in the footer (`TrackFooter.tsx:16-25`) and is the wrong place to duplicate. |
| D15 | Thai is the reader-facing language; code, tests, field names and this spec are English. | Unchanged project convention. |
| D16 | Phase 3 markers are applied **automatically** by `markTerms` (P3.5), not hand-authored across 19 chapters, under eight guardrails: prose fields only with a named exclusion list; code-like text skipped (quoted speech and arrow chains are prose: D20, D21); first occurrence per section only; longest match wins; case-sensitive for abbreviations and case-insensitive for words; already-expanded matches skipped; an explicit `[[!g:id]]` / `[[!g:*]]` author opt-out; and no re-scanning inside a marker. | Hand-authoring 90–150 markers over 19 chapters would gate the mechanism behind a multi-hour Thai editing pass and a large data diff, and the audit's 89 term×chapter pairs would still be covered unevenly. Automatic matching covers all of them in one commit; the guardrails are what keep it from marking headings, dialogue and defining sentences. Honesty comes from tests, not from care: the eight guardrail tests in `autoTerms.test.ts`, the marker snapshot over s1 (plain), s10 (formal) and s15 (academic), and the D11 track guard. The opt-out marker means a wrong match is a one-line content fix, never a code change. |
| D17 | Both **roles** and both **levels** see the inline markers. No gate on `chapterLevel` or `role`. | An experienced reader crossing to the other side's chapters is exactly the case the guide exists for: an experienced engineer opening the business chapters meets `KPI` (`chapters11_15.ts:14`) and `KR` (`chapterPerspectives.ts:488`) cold, and the `experienced` track has 9 terms never defined anywhere in it (audit §2.3) — the same count as the role tracks. The marker costs nothing until it is tapped (a dotted underline, no layout shift, no network), so there is nothing to save by hiding it. One rendering path also means `RichText`'s call sites (`ContentBlocks.tsx:50`, `ContentTable.tsx:30`, `FrictionFaqSection.tsx:100`, `GlossaryPanel.tsx:200`) need no context threading. |
| D18 | Phase 4's deliverable is **drafted** Thai copy in the chapter data plus the acceptance test, merged and presented for owner review — not treated as done on merge. | The mechanical half of P4.2 (every title/subtitle abbreviation expanded, ≤ 160 characters, a continuity marker present) is test-enforced, so a draft cannot be structurally wrong. The judgement half — register, and whether the connection line is true and worth reading — is the owner's, and the audit found register already drifting in 7 chapters (§5 totals). Drafting first means the owner reviews 19 concrete lines instead of writing them from a blank field; the required field (D13) keeps the queue visible until all 19 exist. **Approved 2026-09-23:** the owner reviewed all 19 openings and approved them as drafted, with no edits; Phase 4 is done. |
| D19 | A glossary entry's **chapter attribution** is part of its correctness, and the guard test covers it: an entry may not cite a chapter whose beginner-visible content does not contain the entry's `term` or one of its `aliases`. Landed with Phase 2 (P2.5, acceptance 6). | A wrong pointer is worse than a missing entry. A missing entry ends in `ไม่พบคำที่ค้นหา` and the reader knows to look elsewhere; a wrong pointer is trusted, and the reader spends a navigation on it — Nok followed `User story → บทที่ 4` (`src/data/glossary.ts:114-120`), expanded all of chapter 4 (`src/data/chapters/chapters1_5.ts:433-575`, no user-story content), and lost ~5 minutes and a full wrong turn, while the template sat in ch.2 (`chapters1_5.ts:187-189`) and the worked example in ch.14 (`chapters11_15.ts:504`). `relatedChapterIds` is the app's only advertised table of contents into the chapters, so its accuracy is testable and must be tested (round-3 I-10). |
| D20 | **Arrow chains are prose.** Text like `ผู้บริหาร → PM → Designer → SA → Dev` gets markers under the normal first-occurrence rule. Every other code-like exclusion (backticks, bold runs, existing markers and links) stays. Decided by the owner after the Phase 3 review. | It is ordinary Thai prose listing role names, not code, and it is where the audit's #1 worst offender sits: `PM` in chapter 1's first sentence (`src/data/chapters/chapters1_5.ts:20`). The original arrow rule was a code-like-text heuristic that over-reached, and it made acceptance 1 fail by design. |
| D21 | **Dialogue lines may carry markers** — `saysVsHears` (`youSay` / `theyHear` / `sayInstead`), `jargonList[].meetingExample` and similar quoted speech inside prose — still first occurrence per section only. Decided by the owner after the Phase 3 review. | On the engineering track every early `Sprint` is inside dialogue: s16 `Dev พูด: บั๊กนี้ Severity ต่ำ ไว้ Sprint หน้าได้`, then s1 and s2. The no-quotes rule left it undefined until s18, five sightings across three chapters. A reader who does not know the word needs the definition exactly where someone says it. |
| D22 | A title, subtitle or `enTerm` term counts as defined by the chapter opening only through the strict Phase 4 check (`openingExpands` in `termCoverage.test.ts`): the term followed by its glossary expansion in parentheses, the Thai-name-first `ชื่อไทย (TERM)` pattern, or a resolvable term marker on it — including an **auto-marker** on a bare term. The looser `TERM (anything)` match no longer closes a heading gap. | P4.2.2 asks for `X (Expansion) คือ …`; a marker is a tap-to-define in the same line, which serves the same reader. Five heading terms pass today only through an auto-marker: C4 (s5), Sprint and Agile (s6), Test Pyramid (s7), Refactor (s9). This goes beyond the letter of P4.2.2, accepted because the owner approved those openings as drafted (D18). Tightening to expansion-only would need copy edits to those five. |

## 9. Risks

- **Auto-matching noise.** The field allowlist and the first-occurrence rule (the quote rule was dropped by D21) are the only things standing between a marked term and a marked heading or a marked line of dialogue. The eight guardrail tests plus the s1/s10/s15 marker snapshot are the defence (P3.5, D16); also read those three chapters in the browser before committing, because a snapshot can be wrong and still pass.
- **Alias collisions.** `CI` vs `CI/CD`, `PM` vs `PjM`, `UX` vs `UX/UI`, `SLA` vs `SLI` vs `SLO`. Longest-match resolution plus the "no two entries share a lower-cased alias" test in `glossary.test.ts` covers this; the `PM`/`PjM` ambiguity is itself a documented content problem (`chapterContentBlocks.ts:34`, parked in the Deep layer) and the `PM` entry's definition should keep that disambiguation.
- **Phase 1 test churn.** Four pinned Core lists in `sectionLayers.test.ts` change in one commit. The new ordering-invariant assertion is the durable one; the literal lists will keep churning with every layer change.
- **s15 double coverage.** s15 gets both a `jargonList` (P2.3) and the glossary panel in Core (`sectionLayers.ts:32`). Watch its beginner Core length in the next persona round — the role-UX spec already flags s11 at 16 minutes for the same reason.
- **`termCoverage` extraction accuracy.** An ALL-CAPS regex over Thai prose plus a curated ignore list will both over- and under-report. The explicit literal assertion of the audit's 28 terms is the backstop: if extraction regresses, that assertion still fails.

## 10. Follow-ups (out of scope)

- **Jargon chip preview.** The closed jargon block previews at most 5 chips then `+n` (`JargonSection.tsx:6,33-46`). With the block second in Core, a closed-state preview that shows the terms used in *this chapter's opening* first would resolve the title abbreviations without any expansion.
- **Glossary drawer.** An in-page drawer or modal for the full entry, so even the `ดูในหน้ารวมคำศัพท์` link stops costing a chapter switch (audit §6 Path A steps 3 and 5).
- **Return-to-position.** `useChapterRoute.ts:88-89` force-scrolls to the chapter start on `popstate`; restoring the paragraph would fix the lookup round trip for the cases Phase 3 does not cover.
- **`PM` vs `PjM` promotion.** Move the disambiguation from s1's Reference block (`chapterContentBlocks.ts:34`, Deep layer, invisible to beginners) into a beginner-visible surface.
- **Prerequisite line.** Audit §2.5: nothing states a chapter's prerequisites. Distinct from D14's cold-safe opening line.
- **Per-chapter jargon coverage.** A test that each chapter's `jargonList` covers the abbreviations in its own title/subtitle, which is stronger than D11's track walk for the 12 chapters in audit §5's list.
- **Basics-round and quiz term coverage.** Quiz questions use abbreviations too (`src/data/quizQuestions.ts`); they are outside `TERM_FIELDS` and outside every track walk.
- **s18's opening has no connection clause (owner, copy).** Browser acceptance 2026-09-23: it names neither the previous chapter nor the guide's promise, as P4.2.1 asks (s10's connection, "ระบบล่มกระทบสองโลก", is weak). Approved as drafted (D18); recorded for the owner's next copy pass, not fixed here. **Done 2026-09-23:** owner approved the new line, which opens with `สองโลกต้องตกลงเป้าร่วมกัน` (156 code points).
- **s1's keyTakeaway uses "Dev" unexpanded (owner, copy).** s1's opening expands BA, UX and QA but not Dev. The Phase 4 test does not flag it, because `extractAbbreviations` does not report "Dev". For the owner's next copy pass. **Done 2026-09-23:** the s1 opening now ends `กว่าจะถึงคนเขียนโค้ด (Dev) ก็เพี้ยนแล้ว` (158 code points), owner-approved.
