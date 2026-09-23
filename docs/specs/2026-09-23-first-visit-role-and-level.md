# First-visit card: choose role and level in one tap (I-15)

- Status: **Draft**, awaiting owner review. The design was approved in chat on 2026-09-23.
- Evidence: `work/ux-test-roles-r3/synthesis.md` I-15 (L-M, 1 of 4; 3 of 4 in round 2). Mint asked
  whether the level row was a third choice or whether she needed a role *and* a level.
  `2026-09-23-role-ux-fixes.md` §10 I-06 and `2026-09-23-round3-ux-fixes.md` §10 I-15.
- Scope: `src/components/guide/FirstVisitCard.tsx`, its caller in `src/components/GuideTab.tsx`, one
  prop in `src/App.tsx`, and tests. Storage keys, `resolveChapterLevel` and the tracks stay as they are.

## 1. Problem

The card (`FirstVisitCard.tsx`) offers two separate paths. The first is two role cards; each one is a
single button that sets the role and jumps to that track. The second is a row labelled `ไม่ระบุสาย:`
with two level buttons (`🌱 ใหม่กับเรื่องนี้`, `⚡ ทำงานข้ามทีมมาแล้ว`), each setting the no-role base
level. A skip link follows (`ข้ามไปก่อน (ใช้โหมดมือใหม่)`). Because the card asks for role and level
side by side, a reader can take it as a two-part form. It never says that picking a role already
sets the level for each chapter. With a role, the level comes from `resolveChapterLevel`
(`src/data/rolePerspective.ts:30-39`): the reader's own side opens experienced, the other side opens
beginner, and a global `levelMode` overrides that.

## 2. Design

### 2.1 Card layout

1. Heading `เริ่มจากตรงไหนดี?` (unchanged), followed by a new subline:
   `เลือกสายงานและระดับของคุณ กดครั้งเดียวก็เริ่มอ่าน` (**copy, owner to approve**).
2. Two role panels, Business and Engineering, in the existing `grid gap-3 sm:grid-cols-2`. Each keeps
   its origin title, its `line` and its route line (`เส้นทาง: บท … · ≈ N นาที`). **A panel is no longer a
   button.** It is a plain container (`data-first-visit-role={role}`) that holds two buttons:
   - `🌱 มือใหม่` (`data-first-visit-choice="{role}-beginner"`) → `onChoose(role, 'beginner')`
   - `⚡ คุ้นงานสายตัวเอง` (`data-first-visit-choice="{role}-auto"`) → `onChoose(role, 'auto')`
3. One explanation line, shown once under the grid rather than repeated in each panel
   (**copy, owner to approve**):
   `มือใหม่: ทุกบทเปิดแบบละเอียด · คุ้นงานสายตัวเอง: บทฝั่งคุณเปิดแบบกระชับ บทอีกฝั่งเปิดแบบละเอียด`
4. The `ไม่ระบุสาย:` row is removed and so is the old skip link. One link replaces both:
   `ยังไม่เลือกสาย อ่านแบบมือใหม่ไปก่อน` (`data-first-visit-skip`) → `onSkip()`.

### 2.2 Behaviour

| Action | Role | `levelMode` | Base level | Navigation |
|---|---|---|---|---|
| `🌱 มือใหม่` in a role panel | that role | `'beginner'` | unchanged | first chapter of the role track (as today's role choice) |
| `⚡ คุ้นงานสายตัวเอง` in a role panel | that role | `'auto'` | unchanged | same |
| `ยังไม่เลือกสาย …` | none | unchanged | `'beginner'` (dismisses the card) | **none**: a reader who arrived on a deep link stays on that chapter |

`levelMode` is written explicitly in both cases, even though `'auto'` is the default, so that the
choice holds no matter what an earlier session stored. The no-role experienced track
(`TRACK_CHAPTER_NUMS.experienced`) is no longer offered on the card. It stays reachable from the
Header controls (`ไม่ระบุ` + `Experienced`).

### 2.3 Interfaces

- `FirstVisitCard` props become
  `{ chapters; onChoose: (role: Role, mode: 'beginner' | 'auto') => void; onSkip: () => void }`.
  `onChooseRole` and `LEVEL_OPTIONS` are removed.
- `GuideTab` takes a new optional `onLevelModeChange?: (mode: LevelMode) => void`. Its handler calls
  `onChooseRole(role)`, then `onLevelModeChange(mode)`, then `jumpToTrackStart(role)`.
  `handleFirstVisitChoice` (the no-role level path) is removed. `handleFirstVisitSkip` stays as it is.
- `App` passes its existing `handleLevelModeChange` to `GuideTab`. No other change is needed there:
  the card hides once `role !== null` (`showFirstVisit={!levelChosen && role === null}`).

### 2.4 Tap targets

The two buttons in a panel sit in a `flex flex-wrap gap-2` row, so they use `TAP_GAP[8]`. The skip
link uses `TAP`. The guard `src/components/ui/tapTargets.test.ts` must pass unchanged.

## 3. Verification

- `rolePerspectiveUi.test.tsx`, `FirstVisitCard` block, rewritten:
  - both panels render with their route lines;
  - each panel has exactly the two `data-first-visit-choice` buttons;
  - the markup no longer contains `ไม่ระบุสาย` or `data-first-visit-option`;
  - the skip link text is the new one.
- Choice mapping: the card renders its buttons from an exported `FIRST_VISIT_LEVELS` array
  (`[{ mode: 'beginner', label }, { mode: 'auto', label }]`). The tests run in a node environment
  with `renderToStaticMarkup`, which cannot click, so a test asserts the array's modes and that
  each `data-first-visit-choice` in the markup is `{role}-{mode}` for both roles.
- `bun run test` and `bun run lint` pass.
- Browser, with a fresh profile (clear `be_guide_*`), at 375px and at 1440px:
  - each button lands on its track's first chapter;
  - the Header lens shows `ตามสายงาน` after `⚡` and `Beginner` after `🌱`;
  - the skip link on a deep link (`#/ch/7`) stays on ch.7;
  - no horizontal overflow at 375px.

## 4. Decisions

| # | Decision | Why |
|---|---|---|
| D1 | Two levels per role: `beginner` and `auto`. There is no "experienced on both sides". | That reader is not the target audience and can pick it in the Header. Three levels per panel would bring back the choice overload that caused I-15. |
| D2 | One tap sets both values. There is no separate "start" button. | Keeps today's one-tap start. The pairing in the button itself answers "do I need both?". |
| D3 | The no-role row and skip merge into one link that does not navigate. | The row was the source of the confusion. Skip already meant "beginner, no role", and navigating would override a deep link (round-3 D4 applies only to explicit track choices). |

## 5. Risks

- Rewording the level labels (`คุ้นงานสายตัวเอง`) changes vocabulary the Header does not use
  (`Experienced`, `ตามสายงาน`). The explanation line bridges that gap, and a later header pass could align
  the two.
- I-15 was a finding from 1 of 4 personas in round 3. Re-test it in the next persona round.
