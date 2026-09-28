# Section Consolidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cut every chapter from 11–13 sections to 6–9. The primer becomes an always-visible chapter intro. Workflow and checklist merge into `practice`, and the dialogue merges into `examples`. Friction shows only in chapters that have a playbook, and the role-mindset card moves to the landing area. Old hash keys keep working.

**Architecture:** The rules stay in pure, unit-tested modules. `sectionLayers.ts` holds the keys, layers, meta and presence rules. `chapterRoute.ts` handles hash parsing, the legacy-key alias table, popstate canonicalisation, and `planRequest`, which decides what a section request does. `GuideTab.tsx` only wires those rules together. Each task retires one group of keys end to end (type, config, component, alias, tests), so `tsc` and `npm test` pass after every commit.

**Tech Stack:** React 19, Vite 8.3, TypeScript 7 (`tsc --noEmit`), Tailwind 4, Vitest 5.0.1 (node environment, no DOM library), knip 6.

**Spec:** `docs/specs/2026-09-28-section-consolidation-and-ux-run1.md`, **Part A only** (A.0–A.8). Part B is a separate plan. Executors read the spec section each task cites. Line references to the spec are to HEAD `4524b12`.

## Global Constraints

- **Chips/minutes (A.3):** `examples` → chip `ตัวอย่างจริง`, 5 minutes. `practice` → chip `ลงมือทำ`, 3 minutes. Removed keys: `primer`, `dialogue`, `workflow`, `checklist`, `mindset`. All other `SECTION_META` rows stay unchanged.
- **Final `SectionKey` (11 keys, in this order):** `otherSide, friction, jargon, diagram, faq, examples, coreConcepts, reference, glossary, practice, pitfalls`.
- **Final `LAYER_CONFIG`:** beginner core `['jargon', 'otherSide', 'coreConcepts', 'diagram']`, apply `['examples', 'practice', 'pitfalls', 'faq', 'friction']`, deep `['reference', 'glossary']`. Experienced core `['otherSide', 'coreConcepts', 'pitfalls', 'diagram']`, apply `['friction', 'examples', 'practice', 'faq']`, deep `['jargon', 'reference', 'glossary']`.
- **Section counts (both levels):** 6 = s16, s17, s18, s19 · 7 = s3, s9, s10, s14 · 8 = s1, s4, s5, s7, s13, s15 · 9 = s2, s6, s8, s11, s12.
- **Friction chapters:** `friction` is present exactly in s1, s2, s4, s6, s7, s8, s11, s12 (the `FRICTION_PLAYBOOKS` keys). `sectionHasTool(…, 'friction')` stays s1, s2, s6.
- **Alias table (A7):** `dialogue→examples`, `workflow→practice`, `checklist→practice`, `primer→top` (chapter top), `mindset→mindset` (landing card, opened and scrolled to). Any absent section falls back to the chapter top. The hash is always canonicalised to the new form.
- Checklist item keys stay `${chapter.id}_cl_${idx}`.
- UI copy is Thai. Every quoted Thai string in this plan or the spec ships character for character. Code and comments are in English.
- Out of scope, do not change: chapter text, `CHAPTER_CORE_OVERRIDES`, `SectionOutline.tsx`, `LayerGroup.tsx`, `InlineSections.tsx`, `readingTracks.ts`, `chapterContext.ts`, `server/knowledge-base.ts`. Do not redesign `RoleMindsetCard` or `FrictionPlaybookCard` (the only allowed edits are the ones listed in their tasks). F-06 chip-row clipping belongs to Part B.
- **Tests:** `npm test` runs the full suite and `npx vitest run <path>` runs one file. Tests are colocated as `*.test.ts(x)` and import from `vitest` explicitly. They use the default node environment. Render components with `renderToStaticMarkup` from `react-dom/server`, and add no DOM library.
- **`GuideTab.tsx` (~950 lines):** never read it whole. Find each edit by the exact anchor text quoted in the task, using `grep -n` and then `sed -n 'A,Bp'`, or Serena `find_symbol`.
- **Gate after every task:** `npx tsc --noEmit` and `npm test` pass. Before each commit, run `npm run lint` (tsc + knip) as well. Tasks 6 and 7 also run `npm run build`. Baseline at `4524b12`: 52 test files and 520 tests pass, lint is clean, and the build has 0 warnings. Treat every new warning from build, tsc, knip, vitest or the browser console as a failure: fix it, or suppress it at the narrowest scope with a comment giving the reason.
- **Commits:** conventional (`feat(guide): …`, `test(guide): …`, `fix(guide): …`), ending with the line `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- **Browser verification procedure:**
  1. Start or reuse the dev server with the Claude Browser `preview_start`, `name: "dev"` (`.claude/launch.json`: `bun run dev`, port 3000, autoPort). Use the port the preview reports.
  2. Prefer `javascript_tool`, `find` and `get_page_text` over screenshots. Use `resize_window` at 360×640 and 1440×900.
  3. For a returning-reader profile, run `localStorage.clear(); localStorage.setItem('be_guide_exp_level','beginner'); history.replaceState(null,'','/'); location.reload()`. The level key hides the first-visit card. For a fresh profile, run `localStorage.clear()` and do not set the level key.
  4. `read_console_messages` with `onlyErrors: true` must return nothing.
  5. Record the evidence in `work/browser-evidence.md` (gitignored), overwriting stale notes.

## Review Focus

1. **A hash word that names an `Object.prototype` member** (`#/ch/3/constructor`, `#/ch/3/toString`) must behave like any unknown word: chapter 3, canonical `#/ch/3`. It must not resolve through the alias object. The test is in Task 1 (`resolveSectionParam`).
2. **Pressing Back to the untouched bare first entry** must leave the URL bare. The new popstate canonicalisation must never write `#/ch/1` there. The test is in Task 1 (`popstateCanonicalHash('', …) === null`), and Task 7 step 5 checks it in the browser.
3. **A chapter with only one half of a merged section** (steps without a checklist, a checklist without steps, a dialogue without cases, cases without a dialogue) must render the present half only, with no `0 ขั้น`, `0 ข้อ` or `0 เคส` in the subtitle. It returns nothing only when both halves are empty. The tests are in Task 3 (`PracticeSection.test.tsx`) and Task 4 (`ExamplesSection.test.tsx`).
4. **A tick made before the change** (`s1_cl_0`) stays ticked, and ticking still reports the same key. The test is in Task 3 (the `line-through` count and the direct `onClick` call).
5. **`#/ch/N/mindset` for a fresh visitor** (first-visit card showing) and for a returning reader (welcome banner). In both cases the landing card must exist exactly once, open, and be scrolled into view. The test is Task 6 step 7 in the browser; `GuideTab` has no static render harness.

---

## File map

| Path | Task | Responsibility |
|---|---|---|
| `src/lib/chapterRoute.ts` (+ `.test.ts`) | 1, 2, 3, 4, 6 | `RouteFocus`, `RequestTarget`, `SECTION_ALIASES`, `resolveSectionParam`, `popstateCanonicalHash`, `planRequest` |
| `src/hooks/useChapterRoute.ts` | 1 | initial focus request, popstate canonicalisation |
| `src/components/GuideTab.tsx` | 1, 2, 5, 6 | request effect, `ChapterIntro` mount, lens hint, landing mindset card |
| `src/data/sectionLayers.ts` (+ `.test.ts`) | 2–6 | keys, layer config, meta, presence |
| `src/components/guide/ChapterIntro.tsx` (+ test) | 2 | always-visible primer paragraph |
| `src/data/chapterContentBlocks.ts`, `src/data/businessChapters.test.ts` | 2 | s16 table re-anchor |
| `src/components/guide/sections/{termMarkerPurity,autoTermSnapshot}.test.tsx` | 2 | render `ChapterIntro` in place of `PrimerSection` |
| `src/components/guide/sections/{WorkflowSteps,ChecklistItems,PracticeSection}.tsx` (+ `PracticeSection.test.tsx`) | 3 | practice merge |
| `src/components/guide/sections/{DialogueCompare,ExamplesSection}.tsx` (+ `ExamplesSection.test.tsx`) | 4 | examples merge |
| `src/components/guide/sections/registry.tsx` | 2–6 | section component map |
| `src/components/FrictionPrinciples.tsx`, `FrictionPlaybookCard.tsx`, `RoleMindsetCard.tsx` (+ tests) | 5, 6 | fallback removed, principles moved |
| `src/components/guide/lensHint.ts` (+ test) | 5 | lens banner hint copy (A8) |
| `src/data/frictionFaqs.test.ts` | 5 | FAQ playbook links target playbook chapters |

---

### Task 1: Route focus targets and the chapter-top fallback

Spec: A.4 `chapterRoute.ts`, `useChapterRoute.ts` and the `GuideTab.tsx` request effect; A.5; A.8 risk 3.

This task builds the routing plumbing. `SECTION_ALIASES` starts empty on purpose: every retired key is still a live `SectionKey` here, and `isSectionKey` wins over aliases. Tasks 2, 3, 4 and 6 each add their alias in the same commit that retires the key. The behaviour you can see after this task: an absent section (`#/ch/3/reference`) now scrolls to the chapter top as well as clearing the hash, and a hand-edited or popped non-canonical hash (`#/ch/3/bogus`) is rewritten to `#/ch/3`.

**Files:**
- Modify: `src/lib/chapterRoute.ts:1-34`
- Modify: `src/lib/chapterRoute.test.ts`
- Modify: `src/hooks/useChapterRoute.ts:1-13, 43-45, 80-96`
- Modify: `src/components/GuideTab.tsx` (import at `:25`; request effect at `:243-257`)

**Interfaces:**
- Consumes: `isSectionKey`, `isSectionPresent`, `SectionKey` from `src/data/sectionLayers.ts`.
- Produces (exports of `src/lib/chapterRoute.ts`):
  - `type RouteFocus = 'top'` (Task 6 widens it to `'top' | 'mindset'`)
  - `type RequestTarget = SectionKey | RouteFocus`
  - `interface ChapterRoute { chapterId: string; section?: SectionKey; focus?: RouteFocus }`
  - `interface RequestedSection { key: RequestTarget; nonce: number }`
  - `resolveSectionParam(raw: string): { section?: SectionKey; focus?: RouteFocus }`
  - `popstateCanonicalHash(hash: string, route: ChapterRoute, num: number): string | null`
  - `type RequestAction = { kind: 'section'; key: SectionKey } | { kind: 'top' }` (Task 6 adds `{ kind: 'mindset' }`)
  - `planRequest(chapter: Chapter, key: RequestTarget): RequestAction`
  - Internal `SECTION_ALIASES: Readonly<Record<string, RequestTarget>>`, which later tasks extend.

- [ ] **Step 1: Branch, commit the spec and plan, and confirm the baseline**

```bash
cd /Users/Pathompong/Sites/Personal/biz-dev-guide
git switch -c feat/section-consolidation main
git add docs/specs/2026-09-28-section-consolidation-and-ux-run1.md docs/plans/2026-09-28-section-consolidation.md
git commit -m "docs(guide): add the section consolidation spec and plan

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
npm run lint && npm test 2>&1 | grep -E "Test Files|Tests " && npm run build 2>&1 | grep -ciE "warn"
```

Expected: lint is silent, `52 passed` / `520 passed`, and the build warning count is `0`. If the counts differ, record the new baseline in `work/checkpoint.md` before you continue.

- [ ] **Step 2: Write the failing tests** in `src/lib/chapterRoute.test.ts`

Replace the import on line 3:

```ts
import {
  formatChapterHash, initRouteSession, parseChapterHash, planRequest, popstateCanonicalHash,
  reduceRouteSession, resolveInitialChapter, resolveSectionParam,
} from './chapterRoute';
```

Below `const parse = …` (line 5), add:

```ts
const ch = (id: string) => {
  const c = CHAPTERS.find(x => x.id === id);
  if (!c) throw new Error(`missing ${id}`);
  return c;
};
```

Append at the end of the file:

```ts
describe('resolveSectionParam', () => {
  it('a current key resolves to itself', () => {
    expect(resolveSectionParam('examples')).toEqual({ section: 'examples' });
    expect(resolveSectionParam('diagram')).toEqual({ section: 'diagram' });
  });
  it('an unknown word resolves to nothing', () => {
    expect(resolveSectionParam('bogus')).toEqual({});
  });
  it('Object.prototype member names are unknown words, not aliases', () => {
    for (const raw of ['constructor', 'toString', 'hasOwnProperty', 'valueOf']) {
      expect(resolveSectionParam(raw), raw).toEqual({});
    }
    expect(parse('#/ch/3/constructor')).toEqual({ chapterId: 's3' });
  });
});

describe('popstateCanonicalHash', () => {
  const pop = (hash: string) => {
    const route = parse(hash);
    if (!route) throw new Error(`unparseable ${hash}`);
    return popstateCanonicalHash(hash, route, ch(route.chapterId).num);
  };
  it('rewrites a non-canonical hash', () => {
    expect(pop('#/ch/3/bogus')).toBe('#/ch/3');
    expect(pop('#/ch/3/')).toBe('#/ch/3');
    expect(pop('#s3')).toBe('#/ch/3');
  });
  it('leaves a canonical hash alone', () => {
    expect(pop('#/ch/1/friction')).toBeNull();
    expect(pop('#/ch/3')).toBeNull();
  });
  it('never writes a hash onto the bare initial entry', () => {
    expect(popstateCanonicalHash('', { chapterId: 's1' }, 1)).toBeNull();
    expect(popstateCanonicalHash('#', { chapterId: 's1' }, 1)).toBeNull();
  });
});

describe('planRequest', () => {
  it('a present section opens', () => {
    expect(planRequest(ch('s1'), 'reference')).toEqual({ kind: 'section', key: 'reference' });
  });
  it('an absent section falls back to the chapter top (spec A7, A.8)', () => {
    expect(planRequest(ch('s3'), 'reference')).toEqual({ kind: 'top' });
  });
  it('the top focus goes to the chapter top', () => {
    expect(planRequest(ch('s1'), 'top')).toEqual({ kind: 'top' });
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/lib/chapterRoute.test.ts`
Expected: FAIL. `resolveSectionParam`, `popstateCanonicalHash` and `planRequest` are not exported (TypeError: not a function).

- [ ] **Step 4: Implement** in `src/lib/chapterRoute.ts`

Replace lines 1–34 (imports through the end of `parseChapterHash`) with:

```ts
import type { Chapter } from '../types';
import { isSectionKey, isSectionPresent, type SectionKey } from '../data/sectionLayers.js';

/** A route target that is not a section: `top` is the chapter start (spec A7). */
export type RouteFocus = 'top';
export type RequestTarget = SectionKey | RouteFocus;

export interface ChapterRoute { chapterId: string; section?: SectionKey; focus?: RouteFocus }
export interface RequestedSection { key: RequestTarget; nonce: number }

type ChapterRef = Pick<Chapter, 'id' | 'num'>;

const ROUTE_RE = /^#\/ch\/(\d{1,2})(?:\/([A-Za-z]+))?\/?$/;
const LEGACY_RE = /^#s(\d{1,2})$/;

/**
 * Retired section keys that old links, bookmarks and history entries still carry (spec A7).
 * Each key is added in the change that retires it.
 */
const SECTION_ALIASES: Readonly<Record<string, RequestTarget>> = {};

/** A hash section word: a current key, a retired key's new target, or nothing. */
export function resolveSectionParam(raw: string): { section?: SectionKey; focus?: RouteFocus } {
  if (isSectionKey(raw)) return { section: raw };
  // Own keys only: `constructor` or `toString` in a hash must not resolve through Object.prototype.
  if (!Object.hasOwn(SECTION_ALIASES, raw)) return {};
  const target = SECTION_ALIASES[raw];
  return isSectionKey(target) ? { section: target } : { focus: target };
}

export function formatChapterHash(num: number, section?: SectionKey): string {
  return section ? `#/ch/${num}/${section}` : `#/ch/${num}`;
}

export function parseChapterHash(hash: string, chapters: ChapterRef[]): ChapterRoute | null {
  if (hash === '' || hash === '#') return null;
  const byNum = (raw: string) => chapters.find(c => c.num === Number(raw));

  const route = ROUTE_RE.exec(hash);
  if (route) {
    const chapter = byNum(route[1]);
    if (!chapter) return null;
    const raw = route[2];
    return raw ? { chapterId: chapter.id, ...resolveSectionParam(raw) } : { chapterId: chapter.id };
  }

  const legacy = LEGACY_RE.exec(hash);
  if (legacy) {
    const chapter = byNum(legacy[1]);
    return chapter ? { chapterId: chapter.id } : null;
  }
  return null;
}
```

Directly after `export const isBareHash = …;`, add:

```ts
/**
 * The hash a popstate should write back in place, or null when the URL is already canonical.
 * A bare entry (the untouched first page) never gets a hash written onto it.
 */
export function popstateCanonicalHash(hash: string, route: ChapterRoute, num: number): string | null {
  if (isBareHash(hash)) return null;
  const canonical = formatChapterHash(num, route.section);
  return canonical === hash ? null : canonical;
}

/** What a section request does once its chapter is shown (spec A.4 GuideTab, A.5). */
export type RequestAction = { kind: 'section'; key: SectionKey } | { kind: 'top' };

export function planRequest(chapter: Chapter, key: RequestTarget): RequestAction {
  if (key === 'top' || !isSectionPresent(chapter, key)) return { kind: 'top' };
  return { kind: 'section', key };
}
```

- [ ] **Step 5: Wire the hook** in `src/hooks/useChapterRoute.ts`

Add `popstateCanonicalHash,` to the import list from `'../lib/chapterRoute'` (alphabetical, after `parseChapterHash,`).

Replace lines 43–45:

```ts
  const [requestedSection, setRequestedSection] = useState<RequestedSection | null>(() => {
    const key = init.route?.section ?? init.route?.focus;
    return key ? { key, nonce: 1 } : null;
  });
```

In `onPopState`, replace everything from `navigatedRef.current = true;` through `setRequestedSection(route.section ? … : null);` with:

```ts
      navigatedRef.current = true;
      setHasNavigated(true);
      dispatch({ type: 'pop', hash });
      // Legacy or malformed hashes (#/ch/3/bogus, later #/ch/3/dialogue) are rewritten in place, as on load (spec A.5).
      const num = numOf(route.chapterId);
      const canonical = num === undefined ? null : popstateCanonicalHash(hash, route, num);
      if (canonical) window.history.replaceState(null, '', canonical);
      const target = route.section ?? route.focus;
      // A chapter change with no section target starts at the chapter title, like handleSelectChapter.
      // Deferred a frame: the browser restores the entry's saved scroll after popstate fires.
      if (!target && route.chapterId !== activeRef.current) {
        window.requestAnimationFrame(() => scrollToChapterStart());
      }
      setActiveChapterId(route.chapterId);
      setRequestedSection(target ? { key: target, nonce: ++nonceRef.current } : null);
```

(`onRouteRef.current();` stays as the last line of the handler.) Leave `navigate` and `replaceSection` unchanged: they keep `SectionKey` parameters.

- [ ] **Step 6: Use `planRequest` in the GuideTab request effect**

In `src/components/GuideTab.tsx`, replace `import type { RequestedSection } from '../lib/chapterRoute';` with:

```ts
import { planRequest, type RequestedSection } from '../lib/chapterRoute';
```

Find the effect with `grep -n "requestedSection?.nonce" src/components/GuideTab.tsx`. Replace its body, from `if (!requestedSection) return;` to the line before `}, [requestedSection?.nonce]);`, with:

```tsx
    if (!requestedSection) return;
    // Consume the request so a remount (Quiz -> Guide) never re-opens and re-scrolls to it.
    onRequestedSectionApplied();
    const action = planRequest(activeChapter, requestedSection.key);
    if (action.kind === 'top') {
      // A retired key that maps to the chapter top, or a section this chapter lacks (spec A.5).
      onReplaceSection(null);
      scrollToChapterStart('smooth');
      return;
    }
    setOpenState(openSection(deriveOpenState(layout, activeChapter.id), layout, action.key));
    setPendingScrollId(`sec-${action.key}`);
```

`scrollToChapterStart` is already imported (line 3).

- [ ] **Step 7: Run tests and typecheck**

Run: `npx vitest run src/lib/chapterRoute.test.ts && npx tsc --noEmit && npm test 2>&1 | grep -E "Test Files|Tests "`
Expected: PASS, and the full suite is green.

- [ ] **Step 8: Browser smoke**, using the Global Constraints procedure with a returning-reader profile at 1440×900:
  1. Load `/#/ch/3/reference` (`history.replaceState(null,'','/#/ch/3/reference'); location.reload()`). Afterwards `location.hash === '#/ch/3'`, and `document.getElementById('chapter-start').getBoundingClientRect().top` is between 0 and 120.
  2. Run `location.hash = '#/ch/5/bogus'`. After a frame, `location.hash === '#/ch/5'`, and chapter 5 is shown.
  3. The console has no errors.

- [ ] **Step 9: Lint and commit**

```bash
npm run lint
git add src/lib/chapterRoute.ts src/lib/chapterRoute.test.ts src/hooks/useChapterRoute.ts src/components/GuideTab.tsx
git commit -m "feat(guide): route focus targets and a chapter-top fallback for absent sections

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Chapter intro replaces the primer section

Spec: A1, A6, A.3 term-definitions rule, A.4 (`sectionLayers.ts`, `ChapterIntro`, `PrimerSection`, `chapterContentBlocks.ts`), A.6 changed tests.

The s16 re-anchor (A6) lands here, not later: `after: 'primer'` stops type-checking as soon as `primer` leaves `SectionKey`.

**Files:**
- Create: `src/components/guide/ChapterIntro.tsx`, `src/components/guide/ChapterIntro.test.tsx`
- Delete: `src/components/guide/sections/PrimerSection.tsx`
- Modify: `src/data/sectionLayers.ts:7-14, 17-18, 25, 36, 120, 164-168`
- Modify: `src/data/sectionLayers.test.ts` (lines listed in Step 6)
- Modify: `src/lib/chapterRoute.ts` (`SECTION_ALIASES`), `src/lib/chapterRoute.test.ts`
- Modify: `src/data/chapterContentBlocks.ts:650-654`, `src/data/businessChapters.test.ts:58-61`
- Modify: `src/components/guide/sections/registry.tsx:10, 62`
- Modify: `src/components/guide/sections/termMarkerPurity.test.tsx:48, 106`, `src/components/guide/sections/autoTermSnapshot.test.tsx:1-86`
- Modify: `src/components/GuideTab.tsx` (import + mount after `<ChapterHero … />`)

**Interfaces:**
- Consumes: `primerTerms(chapter): PrimerTerms | null` from `src/lib/sectionTerms.ts` (unchanged). `RichText` from `src/components/content/RichText.tsx`.
- Produces: `ChapterIntro: React.FC<{ chapter: Chapter; onNavigateChapter?: (chapterId: string) => void; onSearchGlossary?: (query: string) => void }>`. `SectionKey` without `'primer'`. `SECTION_ALIASES.primer = 'top'`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/guide/ChapterIntro.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../data/chaptersData';
import { ChapterIntro } from './ChapterIntro';

const s1 = CHAPTERS.find(c => c.id === 's1')!;

describe('ChapterIntro (spec A1)', () => {
  const html = renderToStaticMarkup(<ChapterIntro chapter={s1} />);

  it('renders the three primer strings, in order, in one paragraph', () => {
    expect(html).toContain('id="chapter-intro"');
    expect(html).toContain('data-chapter-intro');
    const what = html.indexOf('Leaky Pipeline คืออาการที่โจทย์ธุรกิจ');
    const why = html.indexOf('ความผิดพลาดที่แพงที่สุดไม่ใช่บั๊ก');
    const scenario = html.indexOf('ลูกค้าอยากส่งของให้เพื่อนเร็วขึ้น');
    expect(what).toBeGreaterThan(0);
    expect(why).toBeGreaterThan(what);
    expect(scenario).toBeGreaterThan(why);
    expect(html.match(/<p[ >]/g)).toHaveLength(1);
  });

  it('has no heading and no toggle: the only buttons are inline term markers', () => {
    expect(html).not.toMatch(/<h[1-6][ >]/);
    const buttons = html.match(/<button[^>]*>/g) ?? [];
    expect(buttons.every(b => b.includes('data-inline-term'))).toBe(true);
  });

  it('renders nothing for a chapter without a primer', () => {
    expect(renderToStaticMarkup(<ChapterIntro chapter={{ ...s1, beginnerPrimer: undefined }} />)).toBe('');
  });
});
```

In `src/lib/chapterRoute.test.ts`, append:

```ts
describe('retired section keys (spec A7)', () => {
  it('primer goes to the chapter top and canonicalises to the bare chapter', () => {
    expect(parse('#/ch/3/primer')).toEqual({ chapterId: 's3', focus: 'top' });
    expect(formatChapterHash(3, parse('#/ch/3/primer')!.section)).toBe('#/ch/3');
  });
});
```

In `src/data/businessChapters.test.ts`, replace lines 58–61 (the `it(` title line through the `filter` predicate):

```ts
  it('s16 carries the #A1024 refund P&L table inline after the core concepts (spec A6)', () => {
    const inline = (chapter('s16').contentSections ?? []).filter(
      (s) => s.placement === 'inline' && s.after === 'coreConcepts' && s.conceptIndex === undefined,
    );
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/guide/ChapterIntro.test.tsx src/lib/chapterRoute.test.ts src/data/businessChapters.test.ts`
Expected: FAIL. `./ChapterIntro` cannot be resolved; `#/ch/3/primer` parses to `{ section: 'primer' }`; the s16 inline filter finds 0 tables.

- [ ] **Step 3: Create `src/components/guide/ChapterIntro.tsx`**

```tsx
import React, { useMemo } from 'react';
import type { Chapter } from '../../types';
import { RichText } from '../content/RichText';
import { primerTerms } from '../../lib/sectionTerms';

interface ChapterIntroProps {
  chapter: Chapter;
  onNavigateChapter?: (chapterId: string) => void;
  onSearchGlossary?: (query: string) => void;
}

/**
 * The chapter primer as plain intro prose under the hero: always visible, both levels,
 * no heading and no toggle (spec A1). Each glossary term is marked once (primerTerms).
 */
export const ChapterIntro: React.FC<ChapterIntroProps> = ({ chapter, onNavigateChapter, onSearchGlossary }) => {
  const marked = useMemo(() => primerTerms(chapter), [chapter]);
  if (!marked) return null;
  const prose = (text: string) => (
    <RichText text={text} onNavigateChapter={onNavigateChapter} onSearchGlossary={onSearchGlossary} />
  );
  return (
    <p id="chapter-intro" data-chapter-intro className="text-sm text-base-content-secondary leading-relaxed">
      {prose(marked.whatIsIt)}{' '}{prose(marked.whyItMatters)}{' '}{prose(marked.realWorldScenario)}
    </p>
  );
};
```

- [ ] **Step 4: Retire the `primer` key**

In `src/data/sectionLayers.ts`:

```ts
export type SectionKey =
  | 'mindset' | 'otherSide' | 'friction' | 'jargon' | 'dialogue' | 'diagram' | 'faq'
  | 'examples' | 'coreConcepts' | 'reference' | 'glossary' | 'workflow' | 'pitfalls' | 'checklist';

export const SECTION_KEYS: readonly SectionKey[] = [
  'mindset', 'otherSide', 'friction', 'jargon', 'dialogue', 'diagram', 'faq',
  'examples', 'coreConcepts', 'reference', 'glossary', 'workflow', 'pitfalls', 'checklist',
];
```

- `LAYER_CONFIG.beginner.core` → `['jargon', 'otherSide', 'coreConcepts', 'diagram']`.
- `LAYER_CONFIG.experienced.deep` → `['jargon', 'reference', 'glossary', 'mindset']`.
- Delete the `primer: { chip: 'จุดเริ่มต้น', minutes: 2 },` row from `SECTION_META`.
- Delete `case 'primer': return !!chapter.beginnerPrimer;` from `isSectionPresent`.
- Replace the `CHAPTER_CORE_COLLAPSED` doc comment (lines 164–168) with:

```ts
/**
 * Core sections that start closed for a chapter (visual-first pilot). Layer stays expanded.
 * Empty since the jargon block leads beginner Core (term-definitions spec D4, section consolidation A.3):
 * s3's title uses `UX/UI`, so the block that resolves it must be open. The mechanism stays.
 */
```

In `src/lib/chapterRoute.ts`, give the alias table its first entry:

```ts
const SECTION_ALIASES: Readonly<Record<string, RequestTarget>> = {
  primer: 'top',
};
```

In `src/data/chapterContentBlocks.ts`, replace the comment on line 650 and `after` on line 654:

```ts
  // Role-perspective spec P4.1: the #A1024 refund as a P&L, right after the s16 core concepts
  s16: [
    {
      placement: 'inline',
      after: 'coreConcepts',
```

In `src/components/guide/sections/registry.tsx`, delete `import { PrimerSection } from './PrimerSection';` and the `primer: PrimerSection,` row. Then:

```bash
git rm src/components/guide/sections/PrimerSection.tsx
```

- [ ] **Step 5: Mount the intro in GuideTab**

Add `import { ChapterIntro } from './guide/ChapterIntro';` after `import { ChapterHero } from './guide/ChapterHero';`. Then replace:

```tsx
              onSearchGlossary={handleSearchGlossary}
            />

            {/* ADAPTIVE LENS CONTROLLER BANNER */}
```

with:

```tsx
              onSearchGlossary={handleSearchGlossary}
            />

            <ChapterIntro chapter={activeChapter} onNavigateChapter={handleSelectChapter} onSearchGlossary={handleSearchGlossary} />

            {/* ADAPTIVE LENS CONTROLLER BANNER */}
```

- [ ] **Step 6: Update the tests that named `primer`**

`src/data/sectionLayers.test.ts`:
- Lines 23–27. Make the key count follow `SECTION_KEYS`, so later tasks do not touch it:

```ts
  it.each(LEVELS)('%s contains every key exactly once', level => {
    const all = LAYERS.flatMap(l => LAYER_CONFIG[level][l]);
    expect(all).toHaveLength(SECTION_KEYS.length);
    expect([...all].sort()).toEqual([...SECTION_KEYS].sort());
  });
```

- Lines 32–33:

```ts
  it('core leads with jargon for beginners and otherSide for experienced (A.3, term-definitions P1)', () => {
    expect(LAYER_CONFIG.beginner.core).toEqual(['jargon', 'otherSide', 'coreConcepts', 'diagram']);
```

- Line 44: replace `expect(at('primer')).toBeLessThan(at('jargon'));` with `expect(LAYER_CONFIG.beginner.core[0]).toBe('jargon');`
- Line 59: `expect(coreFor('biz', 's6')).toEqual(['jargon', 'otherSide', 'coreConcepts', 'diagram']);`
- Line 74: replace the `primer` lookup with `expect(getLayerOf('experienced', 'jargon', 's1')).toBe('deep');`
- Line 85: `expect(core('beginner', 's1')).toEqual(['jargon', 'otherSide', 'coreConcepts']);`
- Line 96: `expect(core('beginner', 's15')).toEqual(['glossary', 'jargon', 'otherSide', 'coreConcepts', 'diagram']);`
- Line 108: `expect(core('beginner', 's11')).toEqual(['faq', 'jargon', 'otherSide', 'coreConcepts', 'diagram']);`
- Line 114: `expect(getChapterLayout('beginner', ch('s1'))[0].minutes).toBe(5); // jargon + otherSide + coreConcepts (1); s1 has no Diagram section after Q4`
- Line 119: `expect(sectionMinutes('beginner', 'jargon')).toBe(SECTION_META.jargon.minutes);`
- Line 149: `expect(sectionHasTool(ch('s1'), 'jargon')).toBe(false);`
- Line 166: delete `expect(s.sections.primer).toBe(true);`
- Line 197: `expect(toggleSection(base, 'jargon').sections.jargon).toBe(false);`

`src/components/guide/sections/termMarkerPurity.test.tsx`: replace line 48 with `import { ChapterIntro } from '../ChapterIntro';`. Replace line 106 with the following line; the bucket name stays `primer`:

```tsx
        primer: [renderToStaticMarkup(<ChapterIntro chapter={chapter} />),
```

`src/components/guide/sections/autoTermSnapshot.test.tsx`: add `import { ChapterIntro } from '../ChapterIntro';` after the `ChapterHero` import. Replace `beginnerCoreMarkers` to follow the new DOM order (hero, intro, Core):

```tsx
function beginnerCoreMarkers(chapterId: string): string[] {
  const chapter = CHAPTERS.find(c => c.id === chapterId)!;
  const hero = renderToStaticMarkup(<ChapterHero chapter={chapter} experienceLevel="beginner" isRead={false} />);
  const intro = renderToStaticMarkup(<ChapterIntro chapter={chapter} />);
  const core = getChapterLayout('beginner', chapter).find(g => g.layer === 'core')!.sections;
  return [
    ...markersOf(hero).map(m => `hero: ${m}`),
    ...markersOf(intro).map(m => `intro: ${m}`),
    ...core.flatMap(key => {
      const Section = SECTION_COMPONENTS[key];
      const html = renderToStaticMarkup(<Section chapter={chapter} isOpen onToggle={noop} ctx={ctx} />);
      return markersOf(html).map(m => `${key}: ${m}`);
    }),
  ];
}
```

In the three expected lists, rename every `'primer: …'` entry to `'intro: …'` and leave the markers and their order unchanged. Examples: `'intro: pm-vs-pjm (PM)'`, `'intro: slo (SLO)'`, `'intro: api (API)'`. For s15 the order still holds: the glossary renders no markers, and the intro now precedes it.

- [ ] **Step 7: Run tests and typecheck**

Run: `npx tsc --noEmit && npm test 2>&1 | grep -E "Test Files|Tests |FAIL"`
Expected: PASS and no FAIL lines. `inlinePlacement.test.ts`, `termCoverage.test.ts` and `copyBudgets.test.ts` pass unchanged. `inlinePlacement` now validates the s16 `coreConcepts` anchor.

- [ ] **Step 8: Browser smoke** (returning-reader profile, 360×640 then 1440×900):
  1. `#/ch/3`, beginner: `[data-chapter-intro]` exists, is visible without a click, and sits above `[data-section-outline]`. Check that `intro.getBoundingClientRect().top < outline.getBoundingClientRect().top`.
  2. Switch the lens to `⚡ ทำงานข้ามทีมมาแล้ว`: the intro is still there.
  3. Load `/#/ch/3/primer`: the hash becomes `#/ch/3`, and the page sits at the chapter start.
  4. `#/ch/16`: the table `หูฟัง #A1024 หนึ่งออเดอร์ ร้านเหลือเงินเท่าไร` renders after the core concepts, inside the open Core layer.
  5. No chip reads `จุดเริ่มต้น`, and the console has no errors.

- [ ] **Step 9: Lint and commit**

```bash
npm run lint
git add -A src/components/guide/ChapterIntro.tsx src/components/guide/ChapterIntro.test.tsx src/components/guide/sections src/data/sectionLayers.ts src/data/sectionLayers.test.ts src/lib/chapterRoute.ts src/lib/chapterRoute.test.ts src/data/chapterContentBlocks.ts src/data/businessChapters.test.ts src/components/GuideTab.tsx
git commit -m "feat(guide): show the primer as an always-visible chapter intro

Retire the primer section; #/ch/N/primer now lands on the chapter top.
Re-anchor the s16 refund table after the core concepts.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: `practice` merges workflow steps and the checklist

Spec: A2, A.3 (`practice` meta), A.4 (`isSectionPresent`, `WorkflowSection`, `ChecklistSection`, `PracticeSection`, registry), A.6 new tests 4 and 8.

The body components are renamed to match their new export (`WorkflowSection.tsx` → `WorkflowSteps.tsx`, `ChecklistSection.tsx` → `ChecklistItems.tsx`), so that no file name describes a section that no longer exists.

**Files:**
- Rename + rewrite: `src/components/guide/sections/WorkflowSection.tsx` → `WorkflowSteps.tsx`
- Rename + rewrite: `src/components/guide/sections/ChecklistSection.tsx` → `ChecklistItems.tsx`
- Create: `src/components/guide/sections/PracticeSection.tsx`, `src/components/guide/sections/PracticeSection.test.tsx`
- Modify: `src/data/sectionLayers.ts`, `src/data/sectionLayers.test.ts`, `src/components/guide/sections/registry.tsx`, `src/lib/chapterRoute.ts`, `src/lib/chapterRoute.test.ts:14`

**Interfaces:**
- Consumes: `SectionProps`, `GuideSectionContext` from `registry.tsx`.
- Produces:
  - `WorkflowSteps: React.FC<{ chapter: Chapter }>`
  - `ChecklistItems: React.FC<{ chapter: Chapter; ctx: Pick<GuideSectionContext, 'checkedChecklist' | 'onToggleChecklistItem'> }>`
  - `PracticeSection: React.FC<SectionProps>`
  - `SectionKey` gains `'practice'` and loses `'workflow'` and `'checklist'`.
  - `SECTION_META.practice = { chip: 'ลงมือทำ', minutes: 3 }`
  - Aliases `workflow`/`checklist` → `'practice'`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/guide/sections/PracticeSection.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import type { Chapter } from '../../../types';
import type { GuideSectionContext } from './registry';
import { PracticeSection } from './PracticeSection';
import { ChecklistItems } from './ChecklistItems';

const noop = () => {};
const ctxFor = (over: Partial<GuideSectionContext> = {}): GuideSectionContext => ({
  chapters: CHAPTERS,
  onNavigateChapter: noop, onDiagramJump: noop, onScrollToPlaybook: noop,
  onSearchGlossary: noop, onSelectGlossaryCategory: noop,
  glossaryCategory: 'all', setGlossaryCategory: noop,
  glossaryQuery: '', setGlossaryQuery: noop,
  c4Level: 1, setC4Level: noop,
  checkedChecklist: {}, onToggleChecklistItem: noop,
  role: null, chapterLevel: 'beginner', otherSideView: 'both', setOtherSideView: noop,
  ...over,
});
const s1 = CHAPTERS.find(c => c.id === 's1')!;
const render = (chapter: Chapter, over: Partial<GuideSectionContext> = {}, isOpen = true) =>
  renderToStaticMarkup(<PracticeSection chapter={chapter} isOpen={isOpen} onToggle={noop} ctx={ctxFor(over)} />);

describe('PracticeSection (spec A2)', () => {
  it('header: title and both counts; closed shows no body', () => {
    const html = render(s1, {}, false);
    expect(html).toContain('🛠️');
    expect(html).toContain('ลงมือทำ: ขั้นตอนงานและเช็กลิสต์');
    expect(html).toContain('ส่งต่องานทีละขั้น แล้วเช็กให้ครบก่อนส่ง (4 ขั้น · 5 ข้อ)');
    expect(html).not.toContain('data-practice-steps');
  });

  it('open: workflow steps first, then the checklist', () => {
    const html = render(s1);
    const steps = html.indexOf('data-practice-steps');
    const list = html.indexOf('data-practice-checklist');
    expect(steps).toBeGreaterThan(0);
    expect(list).toBeGreaterThan(steps);
    expect(html.indexOf('ขั้นตอนงาน</h4>')).toBeLessThan(html.indexOf('เช็กลิสต์ก่อนส่งต่องาน</h4>'));
  });

  it('a tick made before the change still shows: key s1_cl_0 is unchanged', () => {
    expect(render(s1, { checkedChecklist: { s1_cl_0: true } }).match(/line-through/g)).toHaveLength(1);
  });

  it('ticking the first item reports key s1_cl_0', () => {
    const toggled: string[] = [];
    const tree = ChecklistItems({
      chapter: s1,
      ctx: { checkedChecklist: {}, onToggleChecklistItem: key => { toggled.push(key); } },
    }) as ReactElement<{ children: ReactElement<{ onClick: () => void }>[] }>;
    tree.props.children[0].props.onClick();
    expect(toggled).toEqual(['s1_cl_0']);
  });

  it('drops an empty half and its count', () => {
    const noList = render({ ...s1, checklist: [] });
    expect(noList).toContain('ส่งต่องานทีละขั้น แล้วเช็กให้ครบก่อนส่ง (4 ขั้น)');
    expect(noList).not.toContain('data-practice-checklist');
    const noSteps = render({ ...s1, realWorldWorkflow: [] });
    expect(noSteps).toContain('ส่งต่องานทีละขั้น แล้วเช็กให้ครบก่อนส่ง (5 ข้อ)');
    expect(noSteps).not.toContain('data-practice-steps');
  });

  it('renders nothing when both halves are empty', () => {
    expect(render({ ...s1, realWorldWorkflow: [], checklist: [] })).toBe('');
  });
});
```

In `src/lib/chapterRoute.test.ts`, change line 14 to use `'practice'`:

```ts
      expect(parse(formatChapterHash(num, 'practice'))).toEqual({ chapterId: id, section: 'practice' });
```

and add inside `describe('retired section keys (spec A7)', …)`:

```ts
  it('workflow and checklist land on practice', () => {
    expect(parse('#/ch/3/workflow')).toEqual({ chapterId: 's3', section: 'practice' });
    expect(parse('#/ch/3/checklist')).toEqual({ chapterId: 's3', section: 'practice' });
    expect(formatChapterHash(3, parse('#/ch/3/workflow')!.section)).toBe('#/ch/3/practice');
    expect(popstateCanonicalHash('#/ch/3/checklist', parse('#/ch/3/checklist')!, 3)).toBe('#/ch/3/practice');
  });
```

In `src/data/sectionLayers.test.ts`, change line 149 to `expect(sectionHasTool(ch('s1'), 'practice')).toBe(false);` and add inside `describe('isSectionPresent', …)`:

```ts
  it('practice in every chapter; meta is ลงมือทำ, 3 minutes (spec A.3)', () => {
    expect(idsWith('practice')).toHaveLength(CHAPTERS.length);
    expect(SECTION_META.practice).toEqual({ chip: 'ลงมือทำ', minutes: 3 });
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/guide/sections/PracticeSection.test.tsx src/lib/chapterRoute.test.ts src/data/sectionLayers.test.ts`
Expected: FAIL. `./PracticeSection` cannot be resolved; `'practice'` is not a key, so `parse` drops it; `SECTION_META.practice` is undefined.

- [ ] **Step 3: Split the bodies out**

```bash
cd /Users/Pathompong/Sites/Personal/biz-dev-guide/src/components/guide/sections
git mv WorkflowSection.tsx WorkflowSteps.tsx
git mv ChecklistSection.tsx ChecklistItems.tsx
```

Overwrite `WorkflowSteps.tsx`. The step markup is `WorkflowSection.tsx:32-47` unchanged:

```tsx
import React from 'react';
import type { Chapter } from '../../../types';

/** Workflow steps, body only; hosted by PracticeSection (spec A2). */
export const WorkflowSteps: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  if (!chapter.realWorldWorkflow || chapter.realWorldWorkflow.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {chapter.realWorldWorkflow.map((wf, wIdx) => (
        <div
          key={wIdx}
          className="p-3.5 rounded-xl bg-base-300 border border-base-border space-y-1.5 text-xs"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="font-bold text-base-content text-xs sm:text-sm">{wf.step}</span>
            <span className="px-2 py-0.5 rounded-md bg-base-border text-base-content-body font-semibold text-[10px] sm:text-[11px]">
              {wf.role}
            </span>
          </div>
          <p className="text-base-content-secondary leading-relaxed font-normal">
            {wf.description}
          </p>
        </div>
      ))}
    </div>
  );
};
```

Overwrite `ChecklistItems.tsx`. The item markup is `ChecklistSection.tsx:32-53` unchanged:

```tsx
import React from 'react';
import { CheckSquare, Square } from 'lucide-react';
import type { Chapter } from '../../../types';
import type { GuideSectionContext } from './registry';

type ChecklistCtx = Pick<GuideSectionContext, 'checkedChecklist' | 'onToggleChecklistItem'>;

/** Checklist items, body only; hosted by PracticeSection. Item keys stay `${chapter.id}_cl_${idx}` (spec A2). */
export const ChecklistItems: React.FC<{ chapter: Chapter; ctx: ChecklistCtx }> = ({ chapter, ctx }) => {
  if (!chapter.checklist || chapter.checklist.length === 0) return null;
  return (
    <div className="space-y-1.5 text-xs">
      {chapter.checklist.map((item, idx) => {
        const itemKey = `${chapter.id}_cl_${idx}`;
        const isChecked = !!ctx.checkedChecklist[itemKey];
        return (
          <div
            key={idx}
            onClick={() => ctx.onToggleChecklistItem(itemKey)}
            className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
              isChecked
                ? 'bg-base-300 text-base-content-muted line-through opacity-80'
                : 'hover:bg-base-300 text-base-content-body'
            }`}
          >
            {isChecked ? (
              <CheckSquare className="w-4 h-4 text-success shrink-0 mt-0.5" />
            ) : (
              <Square className="w-4 h-4 text-base-content-muted shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed font-normal">{item}</span>
          </div>
        );
      })}
    </div>
  );
};
```

- [ ] **Step 4: Create `src/components/guide/sections/PracticeSection.tsx`**

```tsx
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';
import { IconBadge } from '../../ui/IconBadge';
import { WorkflowSteps } from './WorkflowSteps';
import { ChecklistItems } from './ChecklistItems';

/** Hands-on practice: the workflow steps, then the pre-handoff checklist (spec A2). */
export const PracticeSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  const steps = chapter.realWorldWorkflow?.length ?? 0;
  const items = chapter.checklist?.length ?? 0;
  if (steps === 0 && items === 0) return null;
  // A count part is dropped when its list is empty.
  const counts = [steps > 0 ? `${steps} ขั้น` : null, items > 0 ? `${items} ข้อ` : null].filter(Boolean).join(' · ');
  return (
    <div className="border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-box flex items-center justify-between bg-base-300 hover:bg-base-border text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <IconBadge size="md">🛠️</IconBadge>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              ลงมือทำ: ขั้นตอนงานและเช็กลิสต์
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              {`ส่งต่องานทีละขั้น แล้วเช็กให้ครบก่อนส่ง (${counts})`}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-box space-y-5 border-t border-base-border bg-base-100">
          {steps > 0 && (
            <div className="space-y-2.5" data-practice-steps>
              <h4 className="text-xs sm:text-sm font-bold text-base-content">ขั้นตอนงาน</h4>
              <WorkflowSteps chapter={chapter} />
            </div>
          )}
          {items > 0 && (
            <div className="space-y-2.5" data-practice-checklist>
              <h4 className="text-xs sm:text-sm font-bold text-base-content">เช็กลิสต์ก่อนส่งต่องาน</h4>
              <ChecklistItems chapter={chapter} ctx={ctx} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 5: Retire `workflow`/`checklist` and add `practice`**

In `src/data/sectionLayers.ts`:

```ts
export type SectionKey =
  | 'mindset' | 'otherSide' | 'friction' | 'jargon' | 'dialogue' | 'diagram' | 'faq'
  | 'examples' | 'coreConcepts' | 'reference' | 'glossary' | 'practice' | 'pitfalls';

export const SECTION_KEYS: readonly SectionKey[] = [
  'mindset', 'otherSide', 'friction', 'jargon', 'dialogue', 'diagram', 'faq',
  'examples', 'coreConcepts', 'reference', 'glossary', 'practice', 'pitfalls',
];
```

- `LAYER_CONFIG.beginner.apply` → `['dialogue', 'examples', 'practice', 'pitfalls', 'faq', 'friction']`.
- `LAYER_CONFIG.experienced.apply` → `['friction', 'dialogue', 'practice', 'faq', 'examples']`.
- In `SECTION_META`, delete the `workflow` and `checklist` rows and add `practice: { chip: 'ลงมือทำ', minutes: 3 },` where `workflow` was.
- In `isSectionPresent`, delete the `workflow` and `checklist` cases and add:

```ts
    case 'practice': return (chapter.realWorldWorkflow?.length ?? 0) > 0 || (chapter.checklist?.length ?? 0) > 0;
```

- Replace its doc comment `/** Mirrors the pre-refactor render guards in GuideTab exactly (spec §1.3). */` with `/** A section renders iff this returns true. */`.

In `src/lib/chapterRoute.ts`, extend the table:

```ts
const SECTION_ALIASES: Readonly<Record<string, RequestTarget>> = {
  primer: 'top',
  workflow: 'practice',
  checklist: 'practice',
};
```

In `registry.tsx`, delete the `WorkflowSection` and `ChecklistSection` imports and rows. Add `import { PracticeSection } from './PracticeSection';` and the row `practice: PracticeSection,` where `workflow` was.

- [ ] **Step 6: Run tests and typecheck**

Run: `npx tsc --noEmit && npm test 2>&1 | grep -E "Test Files|Tests |FAIL"`
Expected: PASS and no FAIL lines.

- [ ] **Step 7: Browser smoke** (returning-reader profile, 360×640):
  1. `#/ch/1`: open the Apply layer and tap chip `ลงมือทำ`. Steps show under `ขั้นตอนงาน`, then the checklist under `เช็กลิสต์ก่อนส่งต่องาน`.
  2. Tick item 1. Switch the lens level and back: the item is still ticked.
  3. Run `location.hash = '#/ch/1/checklist'`. The hash becomes `#/ch/1/practice`, and `#sec-practice` sits under the sticky header.
  4. The console has no errors.

- [ ] **Step 8: Lint and commit**

```bash
npm run lint
git add -A src/components/guide/sections src/data/sectionLayers.ts src/data/sectionLayers.test.ts src/lib/chapterRoute.ts src/lib/chapterRoute.test.ts
git commit -m "feat(guide): merge workflow steps and checklist into one practice section

Old #/ch/N/workflow and #/ch/N/checklist links land on #/ch/N/practice.
Checklist item keys are unchanged, so earlier ticks stay ticked.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: `examples` absorbs the dialogue

Spec: A3, A.3 (`examples` meta, experienced Apply order), A.4 (`isSectionPresent`, `DialogueSection`, `ExamplesSection`, registry), A.6 new tests 4 and 8.

**Files:**
- Rename + rewrite: `src/components/guide/sections/DialogueSection.tsx` → `DialogueCompare.tsx`
- Rewrite: `src/components/guide/sections/ExamplesSection.tsx`
- Create: `src/components/guide/sections/ExamplesSection.test.tsx`
- Modify: `src/data/sectionLayers.ts`, `src/data/sectionLayers.test.ts`, `src/components/guide/sections/registry.tsx`, `src/lib/chapterRoute.ts`, `src/lib/chapterRoute.test.ts`

**Interfaces:**
- Consumes: `SectionProps` from `registry.tsx`.
- Produces:
  - `DialogueCompare: React.FC<{ chapter: Chapter }>`
  - `ExamplesSection: React.FC<SectionProps>` (dialogue first, then cases)
  - `SectionKey` loses `'dialogue'`.
  - `SECTION_META.examples = { chip: 'ตัวอย่างจริง', minutes: 5 }`
  - Alias `dialogue` → `'examples'`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/guide/sections/ExamplesSection.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import type { Chapter } from '../../../types';
import type { GuideSectionContext } from './registry';
import { ExamplesSection } from './ExamplesSection';

const noop = () => {};
const ctx: GuideSectionContext = {
  chapters: CHAPTERS,
  onNavigateChapter: noop, onDiagramJump: noop, onScrollToPlaybook: noop,
  onSearchGlossary: noop, onSelectGlossaryCategory: noop,
  glossaryCategory: 'all', setGlossaryCategory: noop,
  glossaryQuery: '', setGlossaryQuery: noop,
  c4Level: 1, setC4Level: noop,
  checkedChecklist: {}, onToggleChecklistItem: noop,
  role: null, chapterLevel: 'beginner', otherSideView: 'both', setOtherSideView: noop,
};
const s1 = CHAPTERS.find(c => c.id === 's1')!;
const render = (chapter: Chapter, isOpen = true) =>
  renderToStaticMarkup(<ExamplesSection chapter={chapter} isOpen={isOpen} onToggle={noop} ctx={ctx} />);

describe('ExamplesSection (spec A3)', () => {
  it('header: merged title and the case count; closed shows no body', () => {
    const html = render(s1, false);
    expect(html).toContain('ตัวอย่างจริง: บทสนทนาและเคสจากบริษัท');
    expect(html).toContain('พูดแบบไหนพัง แบบไหนได้ผล และบทเรียนจากบริษัทจริง (2 เคส)');
    expect(html).not.toContain('data-examples-dialogue');
  });

  it('open: the dialogue comes before the first case', () => {
    const html = render(s1);
    const dialogue = html.indexOf('data-examples-dialogue');
    const cases = html.indexOf('data-examples-cases');
    expect(dialogue).toBeGreaterThan(0);
    expect(cases).toBeGreaterThan(dialogue);
    expect(html.indexOf('บทสนทนาในที่ทำงาน</h4>')).toBeLessThan(html.indexOf('เคสจริงจากบริษัท</h4>'));
    expect(html.indexOf('สถานการณ์: ')).toBeLessThan(cases);
  });

  it('a dialogue without cases: dialogue only, no count', () => {
    const html = render({ ...s1, realWorldExamples: [] });
    expect(html).toContain('data-examples-dialogue');
    expect(html).not.toContain('data-examples-cases');
    expect(html).toContain('พูดแบบไหนพัง แบบไหนได้ผล และบทเรียนจากบริษัทจริง</p>');
  });

  it('cases without a dialogue: cases only', () => {
    const html = render({ ...s1, dialogueExample: undefined });
    expect(html).not.toContain('data-examples-dialogue');
    expect(html).toContain('data-examples-cases');
  });

  it('renders nothing when both are absent', () => {
    expect(render({ ...s1, realWorldExamples: [], dialogueExample: undefined })).toBe('');
  });
});
```

In `src/lib/chapterRoute.test.ts`, add inside `describe('retired section keys (spec A7)', …)`:

```ts
  it('dialogue lands on examples', () => {
    expect(parse('#/ch/3/dialogue')).toEqual({ chapterId: 's3', section: 'examples' });
    expect(formatChapterHash(3, parse('#/ch/3/dialogue')!.section)).toBe('#/ch/3/examples');
  });
```

In `src/data/sectionLayers.test.ts`, add inside `describe('isSectionPresent', …)`:

```ts
  it('examples in every chapter; meta is ตัวอย่างจริง, 5 minutes (spec A.3)', () => {
    expect(idsWith('examples')).toHaveLength(CHAPTERS.length);
    expect(SECTION_META.examples).toEqual({ chip: 'ตัวอย่างจริง', minutes: 5 });
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/guide/sections/ExamplesSection.test.tsx src/lib/chapterRoute.test.ts src/data/sectionLayers.test.ts`
Expected: FAIL. The old title is rendered and there is no `data-examples-dialogue`; `#/ch/3/dialogue` still parses as section `dialogue`; examples minutes are 3.

- [ ] **Step 3: Split the dialogue body out**

```bash
cd /Users/Pathompong/Sites/Personal/biz-dev-guide/src/components/guide/sections
git mv DialogueSection.tsx DialogueCompare.tsx
```

Overwrite `DialogueCompare.tsx`. The markup is `DialogueSection.tsx:31-70` unchanged:

```tsx
import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { Chapter } from '../../../types';

/** The wrong-way / right-way workplace dialogue, body only; hosted by ExamplesSection (spec A3). */
export const DialogueCompare: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
  if (!chapter.dialogueExample) return null;
  return (
    <div className="space-y-3.5">
      <div className="p-3 rounded-xl bg-base-300 border border-base-border text-xs text-base-content-secondary font-normal">
        <span className="font-bold text-base-content">สถานการณ์: </span>
        {chapter.dialogueExample.context}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Wrong Way */}
        <div className="p-3.5 rounded-xl bg-error/10 border border-error/40 space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 font-bold text-error text-xs">
            <ShieldAlert className="w-4 h-4 text-error" />
            <span>❌ วิธีพูดที่สร้างปัญหา (Wrong Way)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-base-100/90 border border-error/25 text-error italic font-medium text-xs">
            {chapter.dialogueExample.wrongWay.speaker}
          </div>
          <p className="text-base-content-secondary text-xs leading-relaxed font-normal">
            {chapter.dialogueExample.wrongWay.text}
          </p>
          <div className="text-[11px] text-error font-semibold pt-0.5">
            ⚠️ ผลเสีย: {chapter.dialogueExample.wrongWay.issue}
          </div>
        </div>

        {/* Right Way */}
        <div className="p-3.5 rounded-xl bg-success/10 border border-success/40 space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 font-bold text-success text-xs">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>✅ วิธีพูดที่ได้ผล (Right Way)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-base-100/90 border border-success/25 text-success italic font-medium text-xs">
            {chapter.dialogueExample.rightWay.speaker}
          </div>
          <p className="text-base-content-secondary text-xs leading-relaxed font-normal">
            {chapter.dialogueExample.rightWay.text}
          </p>
          <div className="text-[11px] text-success font-semibold pt-0.5">
            💡 ผลลัพธ์: {chapter.dialogueExample.rightWay.benefit}
          </div>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Rewrite `src/components/guide/sections/ExamplesSection.tsx`**

The case-card markup (`ExamplesSection.tsx:32-78`) is unchanged.

```tsx
import React from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';
import { IconBadge } from '../../ui/IconBadge';
import { DialogueCompare } from './DialogueCompare';

/** Real examples: the workplace dialogue first, then the company cases (spec A3). */
export const ExamplesSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  const cases = chapter.realWorldExamples ?? [];
  if (cases.length === 0 && !chapter.dialogueExample) return null;
  // The case count is dropped when there are no cases, like the practice counts.
  const subtitle = `พูดแบบไหนพัง แบบไหนได้ผล และบทเรียนจากบริษัทจริง${cases.length > 0 ? ` (${cases.length} เคส)` : ''}`;
  return (
    <div className="border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-box flex items-center justify-between bg-base-300 hover:bg-base-border text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <IconBadge size="md">🏢</IconBadge>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              ตัวอย่างจริง: บทสนทนาและเคสจากบริษัท
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">{subtitle}</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-box space-y-5 border-t border-base-border bg-base-100">
          {chapter.dialogueExample && (
            <div className="space-y-2.5" data-examples-dialogue>
              <h4 className="text-xs sm:text-sm font-bold text-base-content">บทสนทนาในที่ทำงาน</h4>
              <DialogueCompare chapter={chapter} />
            </div>
          )}
          {cases.length > 0 && (
            <div className="space-y-2.5" data-examples-cases>
              <h4 className="text-xs sm:text-sm font-bold text-base-content">เคสจริงจากบริษัท</h4>
              <div className="space-y-3.5">
                {cases.map((ex, eIdx) => (
                  <div
                    key={eIdx}
                    className="p-box-dense rounded-box bg-base-300 border border-base-border space-y-3"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="font-bold text-xs sm:text-sm text-base-content flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-base-border text-base-content-body text-[10px] font-bold">
                          {ex.companyOrIndustry}
                        </span>
                        <span>{ex.title}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="p-3 rounded-xl bg-base-100 border border-base-border space-y-1">
                        <span className="font-bold text-base-content text-xs flex items-center gap-1.5">
                          📌 โจทย์ตั้งต้น:
                        </span>
                        <p className="text-base-content-secondary leading-relaxed text-xs">
                          {ex.situation}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-error/10 border border-error/40 space-y-1">
                        <span className="font-bold text-error text-xs flex items-center gap-1.5">
                          ⚠️ สิ่งที่เกิดขึ้น / จุดสะดุด:
                        </span>
                        <p className="text-error leading-relaxed text-xs">
                          {ex.whatHappened}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-success/10 border border-success/40 space-y-1 text-xs sm:text-sm">
                      <span className="font-bold text-success text-xs flex items-center gap-1.5">
                        ✅ แก้ยังไง:
                      </span>
                      <p className="text-base-content-body leading-relaxed text-xs font-normal">
                        {ex.resolution}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-base-300 border border-base-border text-xs text-base-content-body flex items-center gap-2 font-medium">
                      <Lightbulb className="w-4 h-4 text-warning shrink-0" />
                      <span><b>บทเรียนสำคัญ:</b> {ex.keyLesson}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 5: Retire `dialogue`**

In `src/data/sectionLayers.ts`:

```ts
export type SectionKey =
  | 'mindset' | 'otherSide' | 'friction' | 'jargon' | 'diagram' | 'faq'
  | 'examples' | 'coreConcepts' | 'reference' | 'glossary' | 'practice' | 'pitfalls';

export const SECTION_KEYS: readonly SectionKey[] = [
  'mindset', 'otherSide', 'friction', 'jargon', 'diagram', 'faq',
  'examples', 'coreConcepts', 'reference', 'glossary', 'practice', 'pitfalls',
];
```

- `LAYER_CONFIG.beginner.apply` → `['examples', 'practice', 'pitfalls', 'faq', 'friction']`.
- `LAYER_CONFIG.experienced.apply` → `['friction', 'examples', 'practice', 'faq']`. The merged `examples` takes the second slot, which `dialogue` held.
- In `SECTION_META`, delete the `dialogue` row and set `examples: { chip: 'ตัวอย่างจริง', minutes: 5 },`.
- In `isSectionPresent`, delete `case 'dialogue'` and set:

```ts
    case 'examples': return (chapter.realWorldExamples?.length ?? 0) > 0 || !!chapter.dialogueExample;
```

In `src/lib/chapterRoute.ts`, add `dialogue: 'examples',` to `SECTION_ALIASES`.

In `registry.tsx`, delete `import { DialogueSection } from './DialogueSection';` and the `dialogue: DialogueSection,` row.

- [ ] **Step 6: Run tests and typecheck**

Run: `npx tsc --noEmit && npm test 2>&1 | grep -E "Test Files|Tests |FAIL"`
Expected: PASS and no FAIL lines.

- [ ] **Step 7: Browser smoke** (returning-reader profile, 360×640):
  1. Load `/#/ch/3/dialogue`. The hash becomes `#/ch/3/examples`, the Apply layer is open, and `#sec-examples` shows `บทสนทนาในที่ทำงาน` above `เคสจริงจากบริษัท`.
  2. At 360px the wrong-way/right-way cards stack in one column.
  3. The console has no errors.

- [ ] **Step 8: Lint and commit**

```bash
npm run lint
git add -A src/components/guide/sections src/data/sectionLayers.ts src/data/sectionLayers.test.ts src/lib/chapterRoute.ts src/lib/chapterRoute.test.ts
git commit -m "feat(guide): fold the workplace dialogue into the real-examples section

Old #/ch/N/dialogue links land on #/ch/N/examples.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Friction only where a playbook exists

Spec: A4, A8, A.4 (`FrictionPlaybookCard.tsx`, `FrictionPrinciples.tsx`, `RoleMindsetCard.tsx` body, registry `FrictionSection`, GuideTab `:708` hint), A.6 new tests 2, 6 and 8.

The principles move into `RoleMindsetCard` here, while that card is still a Deep section in every chapter. Task 6 then moves the card itself.

**Files:**
- Create: `src/components/FrictionPrinciples.tsx`, `src/components/FrictionPlaybookCard.test.tsx`, `src/components/RoleMindsetCard.test.tsx`, `src/components/guide/lensHint.ts`, `src/components/guide/lensHint.test.ts`, `src/data/frictionFaqs.test.ts`
- Modify: `src/components/FrictionPlaybookCard.tsx:17-89`, `src/components/RoleMindsetCard.tsx` (end of expanded body)
- Modify: `src/data/sectionLayers.ts` (`isSectionPresent`), `src/data/sectionLayers.test.ts:135-137`
- Modify: `src/components/guide/sections/registry.tsx:49-56`
- Modify: `src/components/GuideTab.tsx` (import list; `coreHint` at `:229-230`; hint `<p>` at `:705-709`)

**Interfaces:**
- Consumes: `FRICTION_PLAYBOOKS` (`src/data/frictionPlaybooks.ts`), `FRICTION_FAQS` (`src/data/frictionFaqs.ts`), `SECTION_META`, `Layer`, `LayerGroup` (`sectionLayers.ts`).
- Produces:
  - `FrictionPrinciples: React.FC`
  - `FrictionPlaybookCard` props `{ playbook: FrictionPlaybook; isOpen: boolean; onToggle: () => void }`, where `playbook` is required and `chapterTitle` is removed
  - `lensHint(level: ExperienceLevel, layout: readonly LayerGroup[]): string`

- [ ] **Step 1: Write the failing tests**

Create `src/components/guide/lensHint.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../../data/chaptersData';
import { getChapterLayout } from '../../data/sectionLayers';
import type { ExperienceLevel } from '../../types';
import { lensHint } from './lensHint';

const ch = (id: string) => CHAPTERS.find(c => c.id === id)!;
const hint = (level: ExperienceLevel, id: string) => lensHint(level, getChapterLayout(level, ch(id)));
const FRICTION = ['s1', 's2', 's4', 's6', 's7', 's8', 's11', 's12'];
const FOLDED = ' ส่วนอื่นพับไว้ในชั้น "นำไปใช้" และ "เจาะลึก"';

describe('lensHint (spec A8)', () => {
  it('beginner names the open Core sections', () => {
    expect(hint('beginner', 's1')).toBe(`💡 โหมดมือใหม่: เปิด ศัพท์จำเป็น · อีกฝั่งมองยังไง · แนวคิดหลัก ไว้ก่อน${FOLDED}`);
  });
  it('experienced points at Friction in a playbook chapter', () => {
    expect(hint('experienced', 's1')).toBe('⚡ โหมดทำงานข้ามทีม: เปิด อีกฝั่งมองยังไง · แนวคิดหลัก · กับดัก ไว้ก่อน วิธีรับมือ Friction อยู่ในชั้น "นำไปใช้"');
  });
  it('experienced mentions Friction only in s1, s2, s4, s6, s7, s8, s11, s12 (spec A.7 #3)', () => {
    for (const c of CHAPTERS) {
      const text = hint('experienced', c.id);
      expect(text.includes('Friction'), c.id).toBe(FRICTION.includes(c.id));
      if (!FRICTION.includes(c.id)) expect(text.endsWith(FOLDED), c.id).toBe(true);
    }
  });
});
```

Create `src/components/FrictionPlaybookCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { FRICTION_PLAYBOOKS } from '../data/frictionPlaybooks';
import { FrictionPlaybookCard } from './FrictionPlaybookCard';

describe('FrictionPlaybookCard (spec A4)', () => {
  it('renders the playbook, never the removed generic fallback', () => {
    const html = renderToStaticMarkup(<FrictionPlaybookCard playbook={FRICTION_PLAYBOOKS.s1} isOpen onToggle={() => {}} />);
    expect(html).toContain('id="friction-playbook-card"');
    expect(html).not.toContain('3 ข้อที่ควรจำเมื่อคุยเรื่อง');
  });
});
```

Create `src/components/RoleMindsetCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RoleMindsetCard } from './RoleMindsetCard';

const noop = () => {};

describe('RoleMindsetCard (spec A5)', () => {
  it('open: the friction principles close the card, below the role content', () => {
    const html = renderToStaticMarkup(<RoleMindsetCard isOpen onToggle={noop} />);
    const bridge = html.indexOf('วิธีคุยกับฝั่งนี้ (Bridge Advice)');
    const principles = html.indexOf('3 ข้อที่ควรจำเมื่อทีมเห็นไม่ตรงกัน');
    expect(bridge).toBeGreaterThan(0);
    expect(principles).toBeGreaterThan(bridge);
    expect(html).toContain('อย่าสั่งเป็นวิธีแก้ ให้บอกปัญหาและ Impact:');
    expect(html).toContain('ห้ามพูดเดี่ยวๆ:');
    expect(html).toContain('Technical Debt คือเรื่องการเงิน:');
  });
  it('closed: no principles', () => {
    expect(renderToStaticMarkup(<RoleMindsetCard isOpen={false} onToggle={noop} />)).not.toContain('3 ข้อที่ควรจำ');
  });
});
```

Create `src/data/frictionFaqs.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { FRICTION_FAQS } from './frictionFaqs';
import { FRICTION_PLAYBOOKS } from './frictionPlaybooks';

describe('FRICTION_FAQS', () => {
  it('every playbook link targets a chapter that has a playbook (spec A4: no fallback left to land on)', () => {
    const targets = FRICTION_FAQS.flatMap(f => (f.relatedPlaybookChapterId ? [f.relatedPlaybookChapterId] : []));
    expect(targets.length).toBeGreaterThan(0);
    for (const id of targets) expect(Object.keys(FRICTION_PLAYBOOKS), id).toContain(id);
  });
});
```

In `src/data/sectionLayers.test.ts`, add `import { FRICTION_PLAYBOOKS } from './frictionPlaybooks';` after the `./chaptersData` import. Replace lines 135–137 with:

```ts
  it('mindset and otherSide in every chapter', () => {
    for (const key of ['mindset', 'otherSide'] as SectionKey[]) expect(idsWith(key)).toHaveLength(CHAPTERS.length);
  });
  it('friction exactly where a playbook exists: s1, s2, s4, s6, s7, s8, s11, s12 (spec A4)', () => {
    expect(idsWith('friction')).toEqual(['s1', 's2', 's4', 's6', 's7', 's8', 's11', 's12']);
    expect(idsWith('friction')).toEqual(Object.keys(FRICTION_PLAYBOOKS));
  });
```

In `src/lib/chapterRoute.test.ts`, add inside `describe('planRequest', …)`:

```ts
  it('friction in a chapter without a playbook falls back to the chapter top (spec A.5)', () => {
    expect(planRequest(ch('s3'), 'friction')).toEqual({ kind: 'top' });
    expect(planRequest(ch('s1'), 'friction')).toEqual({ kind: 'section', key: 'friction' });
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/guide/lensHint.test.ts src/components/FrictionPlaybookCard.test.tsx src/components/RoleMindsetCard.test.tsx src/data/frictionFaqs.test.ts src/data/sectionLayers.test.ts src/lib/chapterRoute.test.ts`
Expected: FAIL. `./lensHint` cannot be resolved; the principles heading is absent; friction is present in all 19 chapters. `frictionFaqs.test.ts` already passes: it is a guard. `FrictionPlaybookCard.test.tsx` also passes at runtime, but `tsc` flags the missing `chapterTitle` prop until Step 3.

- [ ] **Step 3: Remove the fallback and add the principles component**

Create `src/components/FrictionPrinciples.tsx`. The three items are `FrictionPlaybookCard.tsx:74-85` verbatim; the heading loses `{chapterTitle}`:

```tsx
import React from 'react';
import { Scale } from 'lucide-react';

/** The universal friction principles, shown once, at the end of the role-mindset card (spec A5). */
export const FrictionPrinciples: React.FC = () => (
  <div className="p-box-dense rounded-xl bg-warning/10 border border-warning/25 space-y-2" data-friction-principles>
    <div className="flex items-center gap-1.5 font-bold text-warning text-xs sm:text-sm">
      <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
      <span>3 ข้อที่ควรจำเมื่อทีมเห็นไม่ตรงกัน</span>
    </div>
    <ul className="space-y-1.5 text-base-content-body text-xs">
      <li className="flex items-start gap-1.5">
        <span className="font-bold text-warning shrink-0">1.</span>
        <span><strong>อย่าสั่งเป็นวิธีแก้ ให้บอกปัญหาและ Impact:</strong> Business ควรอธิบายว่า User เจอปัญหาอะไรและกระทบยอดขายแค่ไหน ส่วน Engineer ควรเสนอ 2 ทางเลือก (Fast vs Solid) พร้อม Trade-off</span>
      </li>
      <li className="flex items-start gap-1.5">
        <span className="font-bold text-warning shrink-0">2.</span>
        <span><strong>คำว่า "ทำไม่ได้" ห้ามพูดเดี่ยวๆ:</strong> ให้เปลี่ยนเป็น &ldquo;ทำได้ 2 แบบ: แบบเสร็จสัปดาห์นี้แต่รองรับได้แค่ 100 คน กับแบบทำ 3 สัปดาห์แต่รองรับได้ 10,000 คน อยากเลือกแบบไหน?&rdquo;</span>
      </li>
      <li className="flex items-start gap-1.5">
        <span className="font-bold text-warning shrink-0">3.</span>
        <span><strong>Technical Debt คือเรื่องการเงิน:</strong> หนี้เทคโนโลยีเหมือนบัตรเครดิต รูดใช้ก่อนได้ (เพื่อส่งงานเร็ว) แต่ถ้าไม่เคยจ่ายเงินต้น ดอกเบี้ยจะทบจนแอปพัง</span>
      </li>
    </ul>
  </div>
);
```

In `src/components/FrictionPlaybookCard.tsx`, change the props interface and destructure:

```tsx
interface FrictionPlaybookCardProps {
  playbook: FrictionPlaybook;
  isOpen: boolean;
  onToggle: () => void;
}

export const FrictionPlaybookCard: React.FC<FrictionPlaybookCardProps> = ({
  playbook,
  isOpen,
  onToggle,
}) => {
```

Then delete the fallback branch. It runs from the comment `// If no specific playbook exists for this chapter, show a universal friction principle` through the closing `}` of `if (!playbook) { … }` (old lines 32–89), just before `const handleSelectDilemma`. Every lucide import is still used by the playbook branch; `tsc` and knip confirm this.

In `src/components/RoleMindsetCard.tsx`, add `import { FrictionPrinciples } from './FrictionPrinciples';` after the `TAP` import. Insert `<FrictionPrinciples />` as the last child of the expanded body, directly after the Bridge Advice block:

```tsx
            <p className="text-base-content-body leading-relaxed text-xs sm:text-sm">
              {guide.bridgeAdvice}
            </p>
          </div>

          <FrictionPrinciples />
        </div>
      )}
```

- [ ] **Step 4: Friction presence, the registry adapter and the lens hint**

In `src/data/sectionLayers.ts` `isSectionPresent`, split the first case:

```ts
    case 'mindset': return true;
    case 'friction': return !!chapter.frictionPlaybook;
```

In `registry.tsx`, replace `FrictionSection`:

```tsx
const FrictionSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle }) => {
  // Present only with a playbook (spec A4); the guard narrows the type without a non-null assertion.
  if (!chapter.frictionPlaybook) return null;
  return <FrictionPlaybookCard playbook={chapter.frictionPlaybook} isOpen={isOpen} onToggle={onToggle} />;
};
```

Create `src/components/guide/lensHint.ts`:

```ts
import type { ExperienceLevel } from '../../types';
import { SECTION_META, type Layer, type LayerGroup } from '../../data/sectionLayers';

const FOLDED = ' ส่วนอื่นพับไว้ในชั้น "นำไปใช้" และ "เจาะลึก"';

/**
 * Lens banner hint: names the Core sections the chapter opens with. For experienced readers it
 * points at Friction only when this chapter has it in Apply (spec A8).
 */
export function lensHint(level: ExperienceLevel, layout: readonly LayerGroup[]): string {
  const keysIn = (layer: Layer) => layout.find(g => g.layer === layer)?.sections ?? [];
  const coreHint = keysIn('core').map(k => SECTION_META[k].chip).join(' · ');
  if (level === 'beginner') return `💡 โหมดมือใหม่: เปิด ${coreHint} ไว้ก่อน${FOLDED}`;
  const rest = keysIn('apply').includes('friction') ? ' วิธีรับมือ Friction อยู่ในชั้น "นำไปใช้"' : FOLDED;
  return `⚡ โหมดทำงานข้ามทีม: เปิด ${coreHint} ไว้ก่อน${rest}`;
}
```

In `src/components/GuideTab.tsx`:
- Add `import { lensHint } from './guide/lensHint';` after the `SectionOutline` import.
- Delete `SECTION_META,` from the `'../data/sectionLayers'` import list. Its only use is the line removed below.
- Delete the two lines `// Lens hint names the Core sections …` and `const coreHint = …;`.
- Replace the hint paragraph body:

```tsx
              <p className="text-[11px] sm:text-xs text-base-content-muted leading-relaxed">
                {lensHint(chapterLevel, layout)}
              </p>
```

(The old body is the `{chapterLevel === 'beginner' ? … : …}` ternary; find it with `grep -n "โหมดทำงานข้ามทีม" src/components/GuideTab.tsx`.)

- [ ] **Step 5: Run tests and typecheck**

Run: `npx tsc --noEmit && npm test 2>&1 | grep -E "Test Files|Tests |FAIL"`
Expected: PASS and no FAIL lines.

- [ ] **Step 6: Browser smoke** (returning-reader profile, 1440×900, lens `⚡ ทำงานข้ามทีมมาแล้ว`):
  1. `#/ch/3`: no `[data-outline-chip="friction"]`, and the hint ends with `ส่วนอื่นพับไว้ในชั้น "นำไปใช้" และ "เจาะลึก"`.
  2. `#/ch/4`: the friction chip is present, and the hint ends with `วิธีรับมือ Friction อยู่ในชั้น "นำไปใช้"`.
  3. `#/ch/11`: open the FAQ, click a playbook link to s6. Chapter 6 opens with `#friction-playbook-card` in view.
  4. The console has no errors.

- [ ] **Step 7: Lint and commit**

```bash
npm run lint
git add src/components/FrictionPrinciples.tsx src/components/FrictionPlaybookCard.tsx src/components/FrictionPlaybookCard.test.tsx src/components/RoleMindsetCard.tsx src/components/RoleMindsetCard.test.tsx src/components/guide/lensHint.ts src/components/guide/lensHint.test.ts src/components/guide/sections/registry.tsx src/components/GuideTab.tsx src/data/sectionLayers.ts src/data/sectionLayers.test.ts src/data/frictionFaqs.test.ts src/lib/chapterRoute.test.ts
git commit -m "feat(guide): show the friction section only where a playbook exists

Move the three universal principles into the role-mindset card and name
Friction in the experienced lens hint only when the chapter has it.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Role-mindset card moves to the landing area; final config pinned

Spec: A5, A7 (`mindset`), A.3 (final keys, config, counts), A.4 (`chapterRoute.ts` `RouteFocus`, GuideTab request effect and landing mount, registry), A.5 (full table), A.6 new tests 1, 3 and 5, A.7 #1 and #4.

**Files:**
- Modify: `src/data/sectionLayers.ts`, `src/data/sectionLayers.test.ts`
- Modify: `src/lib/chapterRoute.ts`, `src/lib/chapterRoute.test.ts`
- Modify: `src/components/guide/sections/registry.tsx:6, 45-47, 59`
- Modify: `src/components/RoleMindsetCard.tsx:33-35` (root class), `src/components/RoleMindsetCard.test.tsx`
- Modify: `src/components/GuideTab.tsx` (import, state, landing mount, request effect)

**Interfaces:**
- Consumes: `RoleMindsetCard` (`isOpen`, `onToggle`), which renders `id="role-mindset-card"`.
- Produces:
  - `RouteFocus = 'top' | 'mindset'`
  - `RequestAction` gains `{ kind: 'mindset' }`
  - `SECTION_ALIASES.mindset = 'mindset'`
  - `SectionKey` is the final 11 keys.

- [ ] **Step 1: Write the failing tests**

`src/data/sectionLayers.test.ts`:
- Replace the whole `it('core leads with jargon …', …)` test (Task 2 title) with the full A.3 literal:

```ts
  it('matches spec A.3: jargon leads beginner Core, otherSide leads experienced Core', () => {
    expect(LAYER_CONFIG).toEqual({
      beginner: {
        core: ['jargon', 'otherSide', 'coreConcepts', 'diagram'],
        apply: ['examples', 'practice', 'pitfalls', 'faq', 'friction'],
        deep: ['reference', 'glossary'],
      },
      experienced: {
        core: ['otherSide', 'coreConcepts', 'pitfalls', 'diagram'],
        apply: ['friction', 'examples', 'practice', 'faq'],
        deep: ['jargon', 'reference', 'glossary'],
      },
    });
    expect(SECTION_META.otherSide).toEqual({ chip: 'อีกฝั่งมองยังไง', minutes: 2 });
  });
```

- Replace `expect(getLayerOf('beginner', 'mindset', 's1')).toBe('deep');` with `expect(getLayerOf('beginner', 'reference', 's1')).toBe('deep');`
- Replace the Task 5 `it('mindset and otherSide in every chapter', …)` with:

```ts
  it('otherSide in every chapter', () => {
    expect(idsWith('otherSide')).toHaveLength(CHAPTERS.length);
  });
```

- Replace the `openSection on a deep key` test with:

```ts
  it('openSection on a deep key expands deep and opens only that key', () => {
    const base = deriveOpenState(layout);
    const s = openSection(base, layout, 'reference');
    expect(s.layers.deep).toBe(true);
    expect(s.sections.reference).toBe(true);
    const deepOthers = layout[2].sections.filter(k => k !== 'reference');
    for (const k of deepOthers) expect(!!s.sections[k]).toBe(false);
  });
```

- Append a new block at the end of the file:

```ts
describe('consolidated sections (spec A.3, A.6 new 1 and 3, A.7 #1)', () => {
  const RETIRED = ['mindset', 'primer', 'dialogue', 'workflow', 'checklist'];
  const COUNTS: Record<number, string[]> = {
    6: ['s16', 's17', 's18', 's19'],
    7: ['s3', 's9', 's10', 's14'],
    8: ['s1', 's4', 's5', 's7', 's13', 's15'],
    9: ['s2', 's6', 's8', 's11', 's12'],
  };

  it('SECTION_KEYS is the 11 keys, in spec order', () => {
    expect(SECTION_KEYS).toEqual([
      'otherSide', 'friction', 'jargon', 'diagram', 'faq', 'examples',
      'coreConcepts', 'reference', 'glossary', 'practice', 'pitfalls',
    ]);
  });

  it('no retired key is a key or appears in any layout, at either level', () => {
    for (const key of RETIRED) {
      expect(isSectionKey(key), key).toBe(false);
      for (const level of LEVELS) for (const c of CHAPTERS) {
        expect(getChapterLayout(level, c).flatMap(g => g.sections), `${level} ${c.id}`).not.toContain(key);
      }
    }
  });

  it('no chip reads a retired label', () => {
    const chips = Object.values(SECTION_META).map(m => m.chip);
    for (const label of ['จุดเริ่มต้น', 'บทสนทนา', 'ขั้นตอนงาน', 'เช็กลิสต์', 'วิธีคิดแต่ละบทบาท']) expect(chips).not.toContain(label);
  });

  it.each(LEVELS)('%s: every chapter shows 6-9 sections, exactly as spec A.3 pins them', level => {
    const got = Object.fromEntries(CHAPTERS.map(c => [c.id, getChapterLayout(level, c).flatMap(g => g.sections).length]));
    const want = Object.fromEntries(Object.entries(COUNTS).flatMap(([n, ids]) => ids.map(id => [id, Number(n)])));
    expect(got).toEqual(want);
  });
});
```

`src/lib/chapterRoute.test.ts`, add inside `describe('retired section keys (spec A7)', …)`:

```ts
  it('mindset focuses the landing card and canonicalises to the bare chapter', () => {
    expect(parse('#/ch/3/mindset')).toEqual({ chapterId: 's3', focus: 'mindset' });
    expect(planRequest(ch('s3'), 'mindset')).toEqual({ kind: 'mindset' });
  });

  it('every spec A.5 hash parses and canonicalises as specified', () => {
    const cases: [hash: string, route: object, canonical: string][] = [
      ['#/ch/3/dialogue', { chapterId: 's3', section: 'examples' }, '#/ch/3/examples'],
      ['#/ch/3/workflow', { chapterId: 's3', section: 'practice' }, '#/ch/3/practice'],
      ['#/ch/3/checklist', { chapterId: 's3', section: 'practice' }, '#/ch/3/practice'],
      ['#/ch/3/primer', { chapterId: 's3', focus: 'top' }, '#/ch/3'],
      ['#/ch/3/mindset', { chapterId: 's3', focus: 'mindset' }, '#/ch/3'],
      // Canonical on load; the request effect then clears it to #/ch/3 (planRequest -> top).
      ['#/ch/3/friction', { chapterId: 's3', section: 'friction' }, '#/ch/3/friction'],
      ['#/ch/1/friction', { chapterId: 's1', section: 'friction' }, '#/ch/1/friction'],
      ['#/ch/3/bogus', { chapterId: 's3' }, '#/ch/3'],
    ];
    for (const [hash, route, canonical] of cases) {
      const parsed = parse(hash);
      expect(parsed, hash).toEqual(route);
      expect(formatChapterHash(ch(parsed!.chapterId).num, parsed!.section), hash).toBe(canonical);
    }
    expect(planRequest(ch('s3'), 'friction')).toEqual({ kind: 'top' });
  });
```

`src/components/RoleMindsetCard.test.tsx`, add inside the describe:

```tsx
  it('is a scroll target clear of the sticky header', () => {
    const html = renderToStaticMarkup(<RoleMindsetCard isOpen={false} onToggle={noop} />);
    expect(html).toContain('id="role-mindset-card"');
    expect(html).toContain('scroll-mt-[calc(var(--header-h)+8px)]');
  });
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/data/sectionLayers.test.ts src/lib/chapterRoute.test.ts src/components/RoleMindsetCard.test.tsx`
Expected: FAIL. `mindset` is still a key: it appears in `SECTION_KEYS`, in the deep config and in the counts (+1 each), `#/ch/3/mindset` parses as a section, and the scroll-margin class is absent.

- [ ] **Step 3: Retire `mindset` from chapters**

In `src/data/sectionLayers.ts`:

```ts
export type SectionKey =
  | 'otherSide' | 'friction' | 'jargon' | 'diagram' | 'faq'
  | 'examples' | 'coreConcepts' | 'reference' | 'glossary' | 'practice' | 'pitfalls';

export const SECTION_KEYS: readonly SectionKey[] = [
  'otherSide', 'friction', 'jargon', 'diagram', 'faq',
  'examples', 'coreConcepts', 'reference', 'glossary', 'practice', 'pitfalls',
];
```

- `LAYER_CONFIG.beginner.deep` → `['reference', 'glossary']`.
- `LAYER_CONFIG.experienced.deep` → `['jargon', 'reference', 'glossary']`.
- Delete the `mindset` row from `SECTION_META` and `case 'mindset': return true;` from `isSectionPresent`.

In `src/lib/chapterRoute.ts`:

```ts
/** A route target that is not a section: `top` is the chapter start, `mindset` the landing card (spec A7). */
export type RouteFocus = 'top' | 'mindset';
```

```ts
const SECTION_ALIASES: Readonly<Record<string, RequestTarget>> = {
  primer: 'top',
  workflow: 'practice',
  checklist: 'practice',
  dialogue: 'examples',
  mindset: 'mindset',
};
```

```ts
export type RequestAction = { kind: 'section'; key: SectionKey } | { kind: 'top' } | { kind: 'mindset' };

export function planRequest(chapter: Chapter, key: RequestTarget): RequestAction {
  if (key === 'mindset') return { kind: 'mindset' };
  if (key === 'top' || !isSectionPresent(chapter, key)) return { kind: 'top' };
  return { kind: 'section', key };
}
```

In `registry.tsx`, delete `import { RoleMindsetCard } from '../../RoleMindsetCard';`, the `MindsetSection` adapter (lines 45–47) and the `mindset: MindsetSection,` row.

In `src/components/RoleMindsetCard.tsx`, add the scroll margin to the root `div` (`id="role-mindset-card"`). The deep link scrolls to it, and the header is sticky:

```tsx
      id="role-mindset-card"
      className="scroll-mt-[calc(var(--header-h)+8px)] border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs transition-all"
```

- [ ] **Step 4: Mount the card on the landing area and handle the focus**

In `src/components/GuideTab.tsx`:
- Add `import { RoleMindsetCard } from './RoleMindsetCard';` after the `FirstVisitCard` import.
- After `const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);`, add:

```tsx
  // Landing role-mindset card: collapsed by default, not persisted; #/ch/N/mindset opens it (spec A5, A7).
  const [mindsetOpen, setMindsetOpen] = useState(false);
```

- In the request effect, directly after `const action = planRequest(activeChapter, requestedSection.key);`, add:

```tsx
    if (action.kind === 'mindset') {
      setMindsetOpen(true);
      setPendingScrollId('role-mindset-card');
      onReplaceSection(null);
      return;
    }
```

- Directly before `{/* Main Layout: Desktop Sidebar Index + Chapter Reader Card */}`, which comes right after the `)}` that closes the `showFirstVisit ? … : …` ternary, insert:

```tsx
      {/* Role mindset: once per page, below the landing banner in both branches (spec A5). */}
      <RoleMindsetCard isOpen={mindsetOpen} onToggle={() => setMindsetOpen(o => !o)} />

```

- [ ] **Step 5: Run the gate**

Run: `npx tsc --noEmit && npm test 2>&1 | grep -E "Test Files|Tests |FAIL" && npm run lint && npm run build 2>&1 | grep -ciE "warn"`
Expected: no FAIL lines. Lint is clean, including knip: there are no unused exports from the deleted wrappers. The build warning count is `0`.

- [ ] **Step 6: Commit**

```bash
git add src/data/sectionLayers.ts src/data/sectionLayers.test.ts src/lib/chapterRoute.ts src/lib/chapterRoute.test.ts src/components/guide/sections/registry.tsx src/components/RoleMindsetCard.tsx src/components/RoleMindsetCard.test.tsx src/components/GuideTab.tsx
git commit -m "feat(guide): move the role-mindset card to the landing area

The card renders once, collapsed, under the welcome banner or first-visit
card; #/ch/N/mindset opens it and scrolls to it. Chapters now show 6-9
sections, pinned per chapter in tests.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 7: Browser check of Review Focus 5** (both profiles, 360×640):
  1. Fresh profile (no level key): load `/#/ch/3/mindset`. The first-visit card shows. `document.querySelectorAll('#role-mindset-card').length === 1`, the card is open (its text contains `3 ข้อที่ควรจำเมื่อทีมเห็นไม่ตรงกัน`), `getBoundingClientRect().top` is between 0 and 120, `location.hash === '#/ch/3'`, and chapter 3 is below.
  2. Returning-reader profile: same load, same result with the welcome banner above.
  3. Returning-reader profile at `#/ch/3`: the card is collapsed. It sits below the banner and above `#chapter-start`: compare the `getBoundingClientRect().top` values.
  4. If any check fails, fix it, re-run Step 5, and commit with `fix(guide): …`.

---

### Task 7: End-to-end browser verification

Spec: A.7 acceptance 1–7, A.5 on load and on back/forward, spec completion gate (360×640 and 1440px).

**Files:**
- Write (gitignored): `work/browser-evidence.md`
- Modify only if a check fails: the file that owns the failing behaviour, with a `fix(guide): …` commit.

**Interfaces:**
- Consumes: everything above. Selectors: `[data-outline-chip]`, `[data-chapter-intro]`, `[data-section-outline]`, `#role-mindset-card`, `#chapter-start`, `#sec-<key>`.

- [ ] **Step 1: Chip and intro sweep, both levels, both widths**

Use a returning-reader profile at 360×640. Run the following in `javascript_tool`, then switch the lens to `⚡ ทำงานข้ามทีมมาแล้ว` and run it again. Repeat both runs at 1440×900.

```js
(async () => {
  const out = {};
  for (let n = 1; n <= 19; n++) {
    location.hash = `#/ch/${n}`;
    await new Promise(r => setTimeout(r, 400));
    const chips = [...document.querySelectorAll('[data-outline-chip]')].map(e => e.dataset.outlineChip);
    const intro = document.querySelector('[data-chapter-intro]');
    const outline = document.querySelector('[data-section-outline]');
    out[`s${n}`] = {
      count: chips.length,
      friction: chips.includes('friction'),
      introAboveOutline: !!intro && intro.getBoundingClientRect().top < outline.getBoundingClientRect().top,
      mindsetCards: document.querySelectorAll('#role-mindset-card').length,
    };
  }
  return JSON.stringify(out);
})()
```

Expected, identical at both levels and widths:
- `count` is 6 for s16–s19; 7 for s3, s9, s10, s14; 8 for s1, s4, s5, s7, s13, s15; 9 for s2, s6, s8, s11, s12.
- `friction` is true exactly for s1, s2, s4, s6, s7, s8, s11, s12.
- `introAboveOutline` is true everywhere.
- `mindsetCards` is 1 everywhere.

Also confirm, on every chapter, that no chip's text (`[...document.querySelectorAll('[data-outline-chip]')].map(e => e.textContent)`) contains `จุดเริ่มต้น`, `บทสนทนา`, `ขั้นตอนงาน`, `เช็กลิสต์` or `วิธีคิดแต่ละบทบาท`. Check chip text only. Body text legitimately contains some of these words: the welcome banner says `จุดเริ่มต้น`, and the practice sub-heading is `ขั้นตอนงาน`.

- [ ] **Step 2: Spec A.5 table on load**, at 360×640 with a returning-reader profile

For each hash, run `history.replaceState(null,'','/' + HASH); location.reload()`. Wait for the load, then read `location.hash` and the target's `getBoundingClientRect().top`:

| Load | Expect `location.hash` | Expect in view (top between 0 and 160) | Also |
|---|---|---|---|
| `#/ch/3/dialogue` | `#/ch/3/examples` | `#sec-examples` | `[data-examples-dialogue]` exists |
| `#/ch/3/workflow` | `#/ch/3/practice` | `#sec-practice` | `[data-practice-steps]` exists |
| `#/ch/3/checklist` | `#/ch/3/practice` | `#sec-practice` | |
| `#/ch/3/primer` | `#/ch/3` | `#chapter-start` | intro visible |
| `#/ch/3/mindset` | `#/ch/3` | `#role-mindset-card` | card open |
| `#/ch/3/friction` | `#/ch/3` | `#chapter-start` | no friction chip |
| `#/ch/1/friction` | `#/ch/1/friction` | `#sec-friction` | Apply open |
| `#/ch/3/bogus` | `#/ch/3` | (as today) | |
| `#/ch/3/constructor` | `#/ch/3` | (as today) | Review Focus 1 |

- [ ] **Step 3: Same table on back/forward**

Start at `#/ch/1` after a reload. For each legacy hash H above, set `location.hash = H`: this pushes an entry and fires popstate. Wait 400 ms, then check the same `location.hash` and in-view expectations. Next run `history.back()`: the hash is `#/ch/1`. Then `history.forward()`: the hash is the canonical form from the table, not H, because the entry was rewritten in place. The same target is in view.

- [ ] **Step 4: Checklist continuity (A.7 #5)**

At `#/ch/1/practice`, tick item 1. Switch the level, go to `#/ch/2` and back to `#/ch/1`, and open `ลงมือทำ`. Item 1 is still ticked (`line-through`).

- [ ] **Step 5: Bare first entry (Review Focus 2)**

Start with `localStorage.setItem('be_guide_exp_level','beginner'); history.replaceState(null,'','/'); location.reload()`. Open the index and pick chapter 3, then run `history.back()`. `location.hash === ''`: no hash is written onto the bare entry.

- [ ] **Step 6: Console and evidence**

`read_console_messages` with `onlyErrors: true` returns nothing. Also check the non-error console output for React warnings (for example `validateDOMNesting`) and treat any as a failure. Overwrite `work/browser-evidence.md` with the objective, the sweep JSON summary, the A.5 on-load and back/forward results, the Review Focus 1, 2 and 5 results, and the conclusion.

- [ ] **Step 7: Final gate**

```bash
cd /Users/Pathompong/Sites/Personal/biz-dev-guide
npm run lint && npm test 2>&1 | grep -E "Test Files|Tests " && npm run build 2>&1 | grep -ciE "warn"
git status --short
```

Expected: lint is clean, all tests pass, the build warning count is `0`, and the working tree holds only the pre-existing untracked `.ux-assessment*/` directories. If any step above needed a fix, commit it:

```bash
git add <fixed files>
git commit -m "fix(guide): <what the browser check caught>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Self-review

**Spec coverage (Part A):**
- A1 intro: Task 2.
- A2 practice: Task 3.
- A3 examples: Task 4.
- A4 friction presence and fallback deletion: Task 5.
- A5 landing card plus principles: principles in Task 5, card move in Task 6.
- A6 s16 re-anchor: Task 2. It lands with the primer removal, because `after: 'primer'` stops type-checking.
- A7 aliases: primer in Task 2, workflow/checklist in Task 3, dialogue in Task 4, mindset in Task 6. The absent-section fallback is Task 1.
- A8 lens hint: Task 5.
- A.3 config, meta and counts are pinned in Task 6. The term-definitions comment is updated in Task 2.
- A.4 `isSectionPresent` doc comment: Task 3.
- A.5: unit-tested in Task 6 and browser-verified on load and on back/forward in Task 7.
- A.6 changed tests: `sectionLayers.test` (Tasks 2–6), `chapterRoute.test:14` (Task 3), `businessChapters.test` (Task 2), `termMarkerPurity` and `autoTermSnapshot` (Task 2).
- A.6 new tests: 1 and 3 (Task 6), 2 (Task 5), 4 (Tasks 3 and 4), 5 (Tasks 2, 3, 4 and 6), 6 (Task 5), 7 (Task 2), 8 (Tasks 3, 4 and 5).
- A.7 criteria 1–7: Task 7. Criterion 7 is also covered in each task's gate.

**Resolved spec gaps and corrections:**
- The spec's `ChapterIntro` test says "has no `<button>`". But `RichText` renders inline term markers as buttons, and s1's primer has three. The test asserts that every button is a term marker instead (no toggle).
- `SECTION_ALIASES` is a plain object, so its lookups use `Object.hasOwn`. Without that, `#/ch/3/constructor` would resolve through `Object.prototype`.
- The spec's popstate `replaceState` is guarded against the bare entry, via `popstateCanonicalHash`.
- The spec gives count-dropping only for `practice`; the `examples` subtitle drops `(0 เคส)` the same way.
- `FrictionSection` uses a guard instead of the spec's `chapter.frictionPlaybook!`. The behaviour is the same, with no non-null assertion.
- The body files are renamed to their new exports (`WorkflowSteps.tsx`, `ChecklistItems.tsx`, `DialogueCompare.tsx`).
- `RoleMindsetCard` gets a scroll margin so that the `mindset` deep link is not hidden under the sticky header.
- Ref drift at `4524b12`: `registry.tsx` Workflow and Checklist imports are on `:19` and `:21`, not `:20` and `:22`, and the map spans `:58-74`. The s16 comment is on `chapterContentBlocks.ts:650`. All other refs check out.

**Placeholder scan:** every code step carries the code. The only `<…>` placeholder is the conditional `fix(guide)` commit in Task 7, which depends on a failure that has not happened yet.

**Type consistency:**
- `RouteFocus`, `RequestTarget`, `RequestAction`, `planRequest`, `resolveSectionParam` and `popstateCanonicalHash` are defined in Task 1. Tasks 2, 3, 4 and 6 extend them without renaming.
- `WorkflowSteps`, `ChecklistItems`, `DialogueCompare`, `PracticeSection`, `FrictionPrinciples` and `lensHint(level, layout)` match every consumer.
- Each task's `SectionKey` union equals its `SECTION_KEYS` array and its `LAYER_CONFIG` members, and the key-count test follows `SECTION_KEYS.length` from Task 2 on.
