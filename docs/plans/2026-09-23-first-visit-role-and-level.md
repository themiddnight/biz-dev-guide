# First-visit card: role and level in one tap — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The first-visit card sets role and level together with one tap, and drops the confusing `ไม่ระบุสาย:` row (I-15).

**Architecture:** `FirstVisitCard` renders one button per level inside each role panel, driven by an exported
`FIRST_VISIT_LEVELS` array, and reports `onChoose(role, mode)`. `GuideTab` turns that into the existing
`onChooseRole` plus a new optional `onLevelModeChange`, then jumps to the role's track start. `App` passes its
existing `handleLevelModeChange`. Storage keys and `resolveChapterLevel` do not change.

**Tech Stack:** React 19 + TypeScript, Tailwind, Vitest (node env, `renderToStaticMarkup`), bun.

**Spec:** `docs/specs/2026-09-23-first-visit-role-and-level.md` (owner-approved 2026-09-23, both copy lines included).

## Global Constraints

- Copy, verbatim. Subline: `เลือกสายงานและระดับของคุณ กดครั้งเดียวก็เริ่มอ่าน`. Level buttons: `🌱 มือใหม่` and `⚡ คุ้นงานสายตัวเอง`.
  Explanation: `มือใหม่: ทุกบทเปิดแบบละเอียด · คุ้นงานสายตัวเอง: บทฝั่งคุณเปิดแบบกระชับ บทอีกฝั่งเปิดแบบละเอียด`.
  Skip link: `ยังไม่เลือกสาย อ่านแบบมือใหม่ไปก่อน`.
- Every `<button>` under `src/components/` carries a tap-target class (`TAP`, `TAP_Y`, `TAP_POSITIONED`, `TAP_GAP[n]` where n equals the
  row's real gap in px). `src/components/ui/tapTargets.test.ts` enforces this.
- The skip path does not navigate. Only a role choice jumps to the track start.
- No new storage keys, and no changes to `src/data/rolePerspective.ts` or `src/lib/rolePrefs.ts`.
- Completion gate: `bun run test` and `bun run lint` (tsc) both pass.

## Review Focus

1. **Deep link plus skip:** a reader who lands on `#/ch/7` and taps the skip link must stay on ch.7. Pinned by keeping `handleFirstVisitSkip` unchanged and by the browser check in Task 2.
2. **Stale stored `levelMode`:** a previous session stored `beginner`, and the reader now picks `⚡`. The mode must become `auto`, so the handler always calls `onLevelModeChange`. Pinned by the Task 1 handler code and the Task 2 browser check.
3. **Tap-target guard:** the new buttons sit in a `gap-2` row and must use `TAP_GAP[8]`. A wrong key fails `tapTargets.test.ts`. Run in Task 1.
4. **375px overflow:** four level buttons plus the long explanation line must not scroll the page sideways. Checked in the Task 2 browser check.
5. **Card must not reappear:** after a role choice the card hides because `role !== null`. After skip it hides because `levelChosen` is set. Checked in the Task 2 browser check.

---

### Task 1: Card, wiring and tests

**Files:**
- Modify: `src/components/guide/FirstVisitCard.tsx` (whole file, 60 lines)
- Modify: `src/components/GuideTab.tsx`, the props interface (~line 58-66), the destructure (~line 87-90), the first-visit handlers (~line 264-272) and the `<FirstVisitCard …/>` render (~line 347)
- Modify: `src/App.tsx:365-374` (the `<GuideTab` props)
- Test: `src/components/guide/rolePerspectiveUi.test.tsx` (the `FirstVisitCard` describe block, lines 10-28)

**Interfaces:**
- Produces: `export const FIRST_VISIT_LEVELS: readonly { mode: FirstVisitMode; label: string }[]`,
  `export type FirstVisitMode = 'beginner' | 'auto'`, and
  `FirstVisitCard` props `{ chapters: Chapter[]; onChoose: (role: Role, mode: FirstVisitMode) => void; onSkip: () => void }`.
- Consumes: `LevelMode` from `src/data/rolePerspective.ts` (`'auto' | ExperienceLevel`). `FirstVisitMode` is assignable to it.

- [ ] **Step 1: Rewrite the failing test**

Replace the `describe('FirstVisitCard', …)` block in `src/components/guide/rolePerspectiveUi.test.tsx`, and change its import to `import { FirstVisitCard, FIRST_VISIT_LEVELS } from './FirstVisitCard';`:

```tsx
describe('FirstVisitCard', () => {
  const html = renderToStaticMarkup(<FirstVisitCard chapters={CHAPTERS} onChoose={noop} onSkip={noop} />);
  it('shows two role panels with their tracks', () => {
    expect(html).toContain('data-first-visit-role="biz"');
    expect(html).toContain('data-first-visit-role="eng"');
    expect(html).toContain('💼 ฉันมาจากสาย Business');
    expect(html).toContain('💻 ฉันมาจากสาย Engineering');
    expect(html).toContain('เส้นทาง: บท 2 → 1 → 14 → 4 → 6 → 9 → 10 → 11 · ≈ 94 นาที');
    expect(html).toContain('เส้นทาง: บท 16 → 1 → 2 → 17 → 18 → 4 → 11 → 19 → 9 · ≈ 100 นาที');
    expect(html).toContain('เริ่มจากบท PM ที่คุณคุ้น');
    expect(html).toContain('เลือกสายงานและระดับของคุณ กดครั้งเดียวก็เริ่มอ่าน');
  });
  it('offers each role with both levels, one tap each', () => {
    expect(FIRST_VISIT_LEVELS.map(l => l.mode)).toEqual(['beginner', 'auto']);
    const choices = [...html.matchAll(/data-first-visit-choice="([^"]+)"/g)].map(m => m[1]);
    expect(choices).toEqual(['biz-beginner', 'biz-auto', 'eng-beginner', 'eng-auto']);
    expect(html).toContain('🌱 มือใหม่');
    expect(html).toContain('⚡ คุ้นงานสายตัวเอง');
    expect(html).toContain('มือใหม่: ทุกบทเปิดแบบละเอียด · คุ้นงานสายตัวเอง: บทฝั่งคุณเปิดแบบกระชับ บทอีกฝั่งเปิดแบบละเอียด');
  });
  it('drops the no-role level row and keeps one skip link', () => {
    expect(html).not.toContain('ไม่ระบุสาย');
    expect(html).not.toContain('data-first-visit-option');
    expect(html).toContain('ยังไม่เลือกสาย อ่านแบบมือใหม่ไปก่อน');
    expect(html.match(/data-first-visit-skip/g)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run it and confirm it fails**

Run: `bun run test src/components/guide/rolePerspectiveUi.test.tsx`
Expected: FAIL, because `FIRST_VISIT_LEVELS` is not exported and the new copy is missing.

- [ ] **Step 3: Rewrite `FirstVisitCard.tsx`**

```tsx
import React from 'react';
import type { Chapter } from '../../types';
import { TRACK_CHAPTER_NUMS, getTrackMinutes, resolveTrack } from '../../data/readingTracks';
import { ROLE_META, ROLES, type Role } from '../../data/rolePerspective';
import { TAP, TAP_GAP } from '../ui/tapTarget';

const ROLE_LINE: Record<Role, string> = {
  biz: 'เริ่มจากบท PM ที่คุณคุ้น แล้วไปดูว่าทีม Engineering รับงานต่อยังไง',
  eng: 'บทฝั่ง Business จะเริ่มจากพื้นฐาน และขึ้นมาอยู่ต้นเส้นทาง',
};

/** The level a first-visit choice sets: every chapter beginner, or the role default (own side experienced). */
export type FirstVisitMode = 'beginner' | 'auto';

export const FIRST_VISIT_LEVELS: readonly { mode: FirstVisitMode; label: string }[] = [
  { mode: 'beginner', label: '🌱 มือใหม่' },
  { mode: 'auto', label: '⚡ คุ้นงานสายตัวเอง' },
];

export const FirstVisitCard: React.FC<{
  chapters: Chapter[];
  onChoose: (role: Role, mode: FirstVisitMode) => void;
  onSkip: () => void;
}> = ({ chapters, onChoose, onSkip }) => (
  <div data-first-visit className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
    <div className="space-y-1">
      <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-[#fafafa]">เริ่มจากตรงไหนดี?</h2>
      <p className="text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3]">เลือกสายงานและระดับของคุณ กดครั้งเดียวก็เริ่มอ่าน</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2">
      {ROLES.map(role => (
        <div key={role} data-first-visit-role={role} className="p-4 rounded-xl border border-neutral-200 dark:border-[#333333] space-y-1.5">
          <div className="font-bold text-sm text-neutral-900 dark:text-[#fafafa]">{ROLE_META[role].icon} {ROLE_META[role].origin}</div>
          <div className="text-xs text-neutral-600 dark:text-[#a3a3a3] leading-relaxed">{ROLE_LINE[role]}</div>
          <div className="text-[11px] text-neutral-500 dark:text-[#8e8e8e]">
            เส้นทาง: บท {TRACK_CHAPTER_NUMS[role].join(' → ')} · ≈ {getTrackMinutes(resolveTrack(role, chapters), chapters)} นาที
          </div>
          <div className="flex flex-wrap gap-2 pt-1.5">
            {FIRST_VISIT_LEVELS.map(level => (
              <button
                key={level.mode}
                type="button"
                data-first-visit-choice={`${role}-${level.mode}`}
                onClick={() => onChoose(role, level.mode)}
                className={`${TAP_GAP[8]} px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-[#404040] hover:border-neutral-500 dark:hover:border-[#737373] text-xs font-semibold text-neutral-800 dark:text-[#e5e5e5] cursor-pointer`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
    <p className="text-[11px] text-neutral-500 dark:text-[#8e8e8e] leading-relaxed">
      มือใหม่: ทุกบทเปิดแบบละเอียด · คุ้นงานสายตัวเอง: บทฝั่งคุณเปิดแบบกระชับ บทอีกฝั่งเปิดแบบละเอียด
    </p>
    <button type="button" data-first-visit-skip onClick={onSkip} className={`${TAP} text-xs font-semibold text-neutral-500 dark:text-[#8e8e8e] hover:underline cursor-pointer`}>
      ยังไม่เลือกสาย อ่านแบบมือใหม่ไปก่อน
    </button>
  </div>
);
```

Check first that `ROLES` is `['biz', 'eng']` in `src/data/rolePerspective.ts:8`, which gives the test's expected choice order.

- [ ] **Step 4: Wire `GuideTab.tsx`**

In `interface GuideTabProps`, after `onChooseInitialLevel`, add:

```ts
  /** First-visit card: the level that goes with the chosen role (spec 2026-09-23-first-visit-role-and-level). */
  onLevelModeChange?: (mode: LevelMode) => void;
```

Add `type LevelMode` to the existing `rolePerspective` import (line 34). Destructure `onLevelModeChange` next to `onChooseInitialLevel`. Import `type FirstVisitMode` from `./guide/FirstVisitCard`. Replace `handleFirstVisitChoice` and `handleFirstVisitRole` with:

```ts
  const handleFirstVisitChoice = (chosen: Role, mode: FirstVisitMode) => {
    onChooseRole?.(chosen);
    onLevelModeChange?.(mode); // always written, so a stale stored mode never survives the choice
    jumpToTrackStart(chosen);
  };
```

Keep `handleFirstVisitSkip` as it is. Change the render to
`<FirstVisitCard chapters={chapters} onChoose={handleFirstVisitChoice} onSkip={handleFirstVisitSkip} />`.
If `ExperienceLevel` or `TrackKey` imports are now unused, remove them (tsc/lint will say).

- [ ] **Step 5: Wire `App.tsx`**

In the `<GuideTab` props (around line 373), after `onChooseInitialLevel={handleChooseInitialLevel}`, add
`onLevelModeChange={handleLevelModeChange}`.

- [ ] **Step 6: Run the gate**

Run: `bun run test && bun run lint`
Expected: all test files pass, 410 tests (was 408; the describe block goes from one `it` to three). tsc reports no errors. `tapTargets.test.ts` passes.

- [ ] **Step 7: Commit**

```bash
git add src/components/guide/FirstVisitCard.tsx src/components/guide/rolePerspectiveUi.test.tsx src/components/GuideTab.tsx src/App.tsx
git commit -m "feat: first-visit card sets role and level in one tap (I-15)"
```
The commit message ends with the `Co-Authored-By` line from the session.

### Task 2: Browser acceptance (controller, not a subagent)

- [ ] Fresh state: in the dev tab, clear every `localStorage` key that starts with `be_guide_`, then reload `http://localhost:3000/`.
- [ ] At 375px: the card shows 4 level buttons. `document.documentElement.scrollWidth === 375`. Tap `eng-beginner`. The URL becomes `#/ch/16` (the first chapter of the eng track), `localStorage.be_guide_level_mode === 'beginner'`, and the card is gone.
- [ ] Clear again and store `be_guide_level_mode = 'beginner'` first. Tap `biz-auto`. The mode becomes `auto`, the URL becomes `#/ch/2`, and the Header lens reads `ตามสายงาน`.
- [ ] Clear again and open `#/ch/7`. Tap the skip link. The page stays on `#/ch/7`, the card is gone, and it does not return after a reload.
- [ ] At 1440px: take a screenshot of the card for the record. Write the results to `work/acceptance-first-visit.md`.
- [ ] Mark the spec's status `Implemented` with the commit hash, and commit.
