# Design tokens and UI components (daisyUI-style, own implementation)

- Status: **Implemented** on `feat/design-tokens` (owner approved 2026-09-23). Acceptance: `work/acceptance-design-tokens.md`.
- Owner decisions 2026-09-23: dark `base-content-muted` = `#8e8e8e`; text split into five tokens
  (`base-content`, `-body`, `-secondary`, `-muted`, `-subtle`); categorical `data-1…5` tokens for diagram series;
  `slate-*` → base tokens accepted (diagram cards become neutral, the one visible surface change).
- Evidence: grep over non-test `src/**/*.tsx` on `feat/role-perspective` @ `b9e688c` (line numbers below
  refer to that commit and will drift after the merge to `main`). A Tailwind 4.3.3 compile of a sample
  `@theme` block (§3) confirmed the token mechanism.
- Scope: `src/index.css`, new `src/components/ui/*` components and tests, every component under
  `src/components/` plus `src/App.tsx` (class names only). `src/styles/tokens.ts` is deleted at the end.
  Content, data, behaviour and ARIA semantics are unchanged. Branch: `feat/design-tokens` from `main`,
  after `feat/role-perspective` (117 commits ahead) is merged.

## 1. Problem

| Finding | Measured |
|---|---|
| Solid black (`bg-neutral-900`/`950` + `dark:bg-white`) is used for everything | 60 lines: 9 real CTAs, 22 selected states, 18 decorative icon squares, 8 progress bars/bullets, 3 emphasized surfaces (§10); one more CTA uses the inverse (`bg-white`) on a black card. A reader cannot tell the next step from a selected chip or a section icon. |
| Colors are written inline, twice | 3,180 raw color classes in 43 files; 1,460 of them are `dark:` color classes; 909 arbitrary hex (`[#…]`). ChapterDiagram.tsx alone has 656, GuideTab.tsx 379. |
| Near-duplicate dark shades | Dark text: 13 hex values (`#fafafa #f5f5f5 #e5e5e5 #d4d4d4 #c4c4c4 #b4b4b4 #a3a3a3 #8e8e8e #737373 #666666 #444444 #333333 #0a0a0a`). Dark surfaces: 12 (`#0a0a0a #111111 #141414 #181818 #1a1a1a #1c1c1c #1f1f1f #202020 #222222 #262626 #333333`). Dark borders: 9 (`#1c1c1c #222222 #262626 #333333 #3a3a3a #404040 #525252 #555555 #737373`). |
| Headings disagree with themselves | `text-neutral-900` pairs with `dark:text-[#fafafa]` 79×, `[#e5e5e5]` 24×, `white` 10×. |
| Card padding is fragmented | 11 responsive combos, e.g. `p-3.5 sm:p-4` ×18, `p-3 sm:p-3.5` ×17, `p-3.5 sm:p-5` ×14, `p-3.5 sm:p-4.5` ×13, `p-4 sm:p-5` ×10 (§7.6). |
| The existing token layer is dead weight | `src/styles/tokens.ts` is imported by one file (`GlossaryPanel.tsx`, 3 keys). `.token-card*`, `.token-label-mono`, `.accent-box` in `index.css` have 0 uses. `:root` vars (`--canvas-bg`, `--surface-*`, `--text-*`) are read only by `body`. |
| Off-palette grays and hues | `slate-*` 323× (ChapterDiagram 269, ProtocolSimulator 42, App footer 8, QuizResultScreen 4); categorical `blue` 46, `purple` 23, `pink` 13 (ChapterDiagram, ProtocolSimulator, RoleMindsetCard). Error states use `rose` (136×); `red` has 0 uses. |

## 2. Goals and non-goals

| Goals | Non-goals |
|---|---|
| Readable importance order: one primary solid per view; selections and decoration never look like CTAs | New palette or retuned grays (tokens make that a one-place edit later) |
| All colors, radii and layout spacing come from CSS variables in `src/index.css`; `.dark` overrides values, components write no `dark:` color classes | Full-bleed mobile cards (possible later experiment) |
| Typed components in `src/components/ui/` with plain variant maps | daisyUI, cva or any new dependency |
| Consolidate near-duplicate shades to the nearest token | Changing ARIA roles (`aria-pressed` toggles stay toggles, not `role="tab"`) |
| A guardrail test that keeps raw colors out | Typography scale tokens (font sizes stay utility classes) |

## 3. Mechanism (Tailwind v4, verified)

1. Tokens are declared in `@theme static { … }` in `src/index.css`. Each `--color-X` generates `bg-X`,
   `text-X`, `border-X`, `ring-X`, `fill-X`, `stroke-X`, `divide-X`, `placeholder-X`, `decoration-X`; each
   `--spacing-X` generates `p-X`, `px-X`, `gap-X`, `space-y-X`, `m-X`, `-mx-X`, `w-X`…; each `--radius-X`
   generates `rounded-X`.
2. The generated utilities **reference** the variable (compiled output: `.p-box{padding:var(--spacing-box)}`,
   `.bg-base-100{background-color:var(--color-base-100)}`). Overriding the variable at runtime therefore
   restyles every utility:
   - dark: `@layer base { .dark { --color-base-100: #141414; … } }` (`.dark` sits on `<html>`, App.tsx:112);
   - responsive spacing/radius: `@layer base { @media (width >= 40rem) { :root { --spacing-box: 1rem; } } }`.
   The base layer comes after Tailwind's theme layer, so these overrides win without `!important`.
3. `@theme` blocks themselves cannot be nested in selectors or media queries (Tailwind docs). Only the
   *values* are overridden, as above. Do **not** use `@theme inline`: it bakes values into utilities and
   the `.dark`/media overrides would stop working.
4. `static` makes Tailwind emit every token variable even if no utility uses it, so SVG attributes and
   inline styles can use `var(--color-…)` safely. Without it, unused theme variables are dropped.
5. Opacity modifiers work on tokens: `bg-success/10` compiles to
   `color-mix(in oklab, var(--color-success) 10%, transparent)`, with a pre-`color-mix` fallback that bakes
   the light value (affects only browsers older than 2023; acceptable).
6. Name collisions are safe but must be known: `text-base` (font size) and `text-base-content` (color)
   coexist; `bg-neutral` (token) and `bg-neutral-900` (palette) coexist. The guardrail (§12) therefore bans
   `neutral-\d+`, not `neutral`.
7. Tailwind finds classes by scanning source text. Variant maps must contain complete literal class
   strings (`'bg-success text-success-content'`), never `` `bg-${color}` ``.

## 4. Color tokens

Light values are Tailwind v4 palette values (oklch) so light mode stays pixel-identical; dark values are the
current hex values.

| Token | Use | Light | Dark |
|---|---|---|---|
| `base-100` | card surface | `#ffffff` | `#141414` |
| `base-200` | page canvas | `#fafafa` | `#0a0a0a` |
| `base-300` | raised/inset surface, soft fill, selected chip | neutral-100 `oklch(97% 0 0)` | `#1a1a1a` |
| `base-content` | headings, strong text | neutral-900 `oklch(20.5% 0 0)` | `#fafafa` |
| `base-content-body` | body text | neutral-700 `oklch(37.1% 0 0)` | `#d4d4d4` |
| `base-content-secondary` | secondary text, descriptions | neutral-600 `oklch(43.9% 0 0)` | `#a3a3a3` |
| `base-content-muted` | captions, meta | neutral-500 `oklch(55.6% 0 0)` | `#8e8e8e` |
| `base-content-subtle` | disabled, placeholders, separators, decoration (never readable text) | neutral-400 `oklch(70.8% 0 0)` | `#525252` |
| `base-border` | default border, divider | neutral-200 `oklch(92.2% 0 0)` | `#262626` |
| `base-border-strong` | hover border, selected border | neutral-300 `oklch(87% 0 0)` | `#333333` |
| `primary` | the one CTA, progress bars, focus ring | neutral-900 `oklch(20.5% 0 0)` | `#ffffff` |
| `primary-content` | text on primary | `#ffffff` | `#0a0a0a` |
| `secondary` | step-down solid | neutral-700 `oklch(37.1% 0 0)` | neutral-300 `#d4d4d4` |
| `secondary-content` | text on secondary | `#ffffff` | `#0a0a0a` |
| `accent` / `accent-content` | reserved | `var(--color-primary)` / `var(--color-primary-content)` | same |
| `neutral` / `neutral-content` | dark chrome: toast, overlay | neutral-800 `oklch(26.9% 0 0)` / `#fafafa` | `#262626` / `#e5e5e5` |
| `info` | sky | sky-700 `oklch(50% 0.134 242.749)` | sky-400 `oklch(74.6% 0.16 232.661)` |
| `success` | emerald | emerald-700 `oklch(50.8% 0.118 165.612)` | emerald-400 `oklch(76.5% 0.177 163.223)` |
| `warning` | amber | amber-700 `oklch(55.5% 0.163 48.998)` | amber-400 `oklch(82.8% 0.189 84.429)` |
| `error` | **rose** (current error hue; `red` is unused) | rose-700 `oklch(51.4% 0.222 16.935)` | rose-400 `oklch(71.2% 0.194 13.428)` |
| `business` | role, amber | = warning values | = warning values |
| `engineer` | role, indigo | indigo-700 `oklch(45.7% 0.24 277.023)` | indigo-400 `oklch(67.3% 0.182 276.935)` |
| `{info…engineer}-content` | text on the solid fill | `#ffffff` | `#0a0a0a` |
| `data-1` | series: blue | blue-700 `oklch(48.8% 0.243 264.376)` | blue-400 `oklch(70.7% 0.165 254.624)` |
| `data-2` | series: purple | purple-700 `oklch(49.6% 0.265 301.924)` | purple-400 `oklch(71.4% 0.203 305.504)` |
| `data-3` | series: pink | pink-700 `oklch(52.5% 0.223 3.958)` | pink-400 `oklch(71.8% 0.202 349.761)` |
| `data-4` | series: sky | = info values | = info values |
| `data-5` | series: rose | = error values | = error values |
| `data-content` | text on any `data-N` fill | `#ffffff` | `#0a0a0a` |

Chromatic tokens use step 700 (light) / 400 (dark) because the same token serves as text, border tint
and solid fill. Step 700 is the lightest that passes 4.5:1 on white for amber and emerald (amber-600 and
emerald-600 fail); 400 passes on `#141414`. This matches `tokens.accent.*.text` today. `data-4`/`data-5` repeat the `info`/`error` values under their own
names, so retuning a status color later does not recolor charts.

Contrast (WCAG ratio, text token on surface; computed from the values above):

| Token | light base-100 | light base-200 | light base-300 | dark base-100 | dark base-200 | dark base-300 |
|---|---|---|---|---|---|---|
| `base-content` | 17.9 | 17.2 | 16.4 | 17.7 | 19.0 | 16.7 |
| `base-content-body` | 10.4 | 10.0 | 9.5 | 12.4 | 13.4 | 11.7 |
| `base-content-secondary` | 7.8 | 7.5 | 7.2 | 7.3 | 7.9 | 6.9 |
| `base-content-muted` | 4.7 | 4.5 | **4.3** | 5.6 | 6.0 | 5.3 |
| `base-content-subtle` | **2.6** | **2.5** | **2.4** | **2.4** | **2.5** | **2.2** |
| `info` / `data-4` | 5.9 | 5.6 | 5.4 | 8.4 | 9.1 | 8.0 |
| `success` | 5.4 | 5.1 | 4.9 | 9.5 | 10.2 | 9.0 |
| `warning` / `business` | 5.1 | 4.8 | 4.6 | 10.7 | 11.5 | 10.1 |
| `error` / `data-5` | 6.1 | 5.8 | 5.6 | 6.4 | 6.9 | 6.1 |
| `engineer` | 8.1 | 7.7 | 7.4 | 5.9 | 6.4 | 5.6 |
| `data-1` | 6.8 | 6.5 | 6.3 | 7.0 | 7.5 | 6.6 |
| `data-2` | 7.1 | 6.8 | 6.5 | 6.6 | 7.1 | 6.2 |
| `data-3` | 5.9 | 5.7 | 5.4 | 6.7 | 7.2 | 6.3 |
| `*-content` on its own solid fill | primary 17.9, info 5.9, success 5.4, warning 5.1, error 6.1, engineer 8.1, data-1…3 ≥ 5.9 | | | primary 19.8, info 9.1, success 10.2, warning 11.5, error 6.9, engineer 6.4, data-1…3 ≥ 7.1 | | |

Bold = below 4.5:1. `subtle` is below 3:1 everywhere by design: it is for disabled text, placeholders,
separators and decoration only, never for text a reader needs. `muted` in light on `base-300` is 4.3:1
(same as today's `neutral-500` on `neutral-100`); captions on a `base-300` surface use `secondary` instead.

`src/index.css` shape (values as in the table; one line per token in the real file):

```css
@theme static {
  --font-sans: 'Geist', 'Prompt', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --color-base-100: #ffffff;   --color-base-200: #fafafa;   --color-base-300: oklch(97% 0 0);
  --color-base-content: oklch(20.5% 0 0);   /* … every token in §4 … */
  --radius-field: 0.5rem;  --radius-box: 0.75rem;  --radius-selector: 0.375rem;
  --spacing-page: 0.75rem; --spacing-box: 0.75rem; --spacing-box-dense: 0.5rem;
  --spacing-box-spacious: 1rem; --spacing-section: 1rem; --spacing-stack: 0.5rem;
}
@layer base {
  .dark { --color-base-100: #141414; /* … dark column … */ color-scheme: dark; }
  @media (width >= 40rem) { :root { --spacing-page: 1.5rem; /* … sm column of §6, radii of §5 … */ } }
  @media (width >= 64rem) { :root { --spacing-page: 2rem; /* … lg column of §6 … */ } }
  :root { --body-text: var(--color-base-content); }   .dark { --body-text: #e5e5e5; }
  body { background-color: var(--color-base-200); color: var(--body-text); }
}
```

Folded or removed in `index.css`: `--canvas-bg`→`base-200`, `--surface-card`→`base-100`,
`--surface-elevated`/`--surface-input`→`base-300`, `--surface-muted`→`base-border`, `--border-color`→`base-border`,
`--border-strong`→`base-border-strong`, `--text-primary`→`--body-text` (below), `--text-secondary`/`--text-muted`→`base-content-secondary`/`-muted`; `--color-slate-850`
removed with the slate mapping; `.token-card*`, `.token-label-mono`, `.accent-box` deleted (0 uses); `.label`
(1 use, Header.tsx:179) kept but colored with `var(--color-base-content-muted)`; scrollbar thumbs →
`base-border-strong` (light `#cbd5e1` slate-300 → neutral-300: shift); `::selection` and `.fig-scope --fig-*`
unchanged.

Default text color: today `body` and the App root (`App.tsx:322`, `text-neutral-900 dark:text-[#e5e5e5]`)
render neutral-900 / `#e5e5e5`, which is none of the five text tokens in dark. To keep that rendered value,
`--body-text` is a plain CSS variable (not in `@theme`, so it generates no utility): light
`var(--color-base-content)`, dark `#e5e5e5`. `body` uses it and the App root drops its text classes and
inherits it. Text that sets no color of its own therefore does not change.

## 5. Radius tokens

From `tokens.shapes`; responsive like spacing.

| Token | Class | Mobile | sm ≥ 640 | Replaces |
|---|---|---|---|---|
| `field` | `rounded-field` | 8px | 12px | buttons, inputs: `rounded-lg sm:rounded-xl`, `rounded-xl` (buttons), `rounded-xl sm:rounded-2xl` (large CTAs: shift 12/16 → 8/12) |
| `box` | `rounded-box` | 12px | 16px | cards: `rounded-xl sm:rounded-2xl` ×24, `rounded-2xl` ×41 (shift 16 → 12 on mobile), `rounded-2xl sm:rounded-3xl` ×10 (shift 16/24 → 12/16) |
| `selector` | `rounded-selector` | 6px | 8px | badges, chips: `rounded-md sm:rounded-lg`, `rounded-md`, Header `rounded-[3px]`/`[4px]` ×16 (shift 3–4 → 6/8) |

`rounded-full` stays for pills, circles, progress bars and bullets.

## 6. Spacing tokens

| Token | Classes | Use | Mobile | sm ≥ 640 | lg ≥ 1024 |
|---|---|---|---|---|---|
| `page` | `px-page` | page side gutter | 12 | 24 | 32 |
| `box` | `p-box` | card padding | 12 | 16 | 20 |
| `box-dense` | `p-box-dense` | box nested in a card | 8 | 12 | 14 |
| `box-spacious` | `p-box-spacious` | hero / feature card | 16 | 24 | 32 |
| `section` | `gap-section`, `space-y-section` | between sections | 16 | 24 | 32 |
| `stack` | `gap-stack`, `space-y-stack` | between list items | 8 | 12 | 12 |

Rules: a box nested in a card uses `box-dense`, never `box` in `box`. Button and input padding lives in the
component `size` (§8), not in these tokens. Axis-only uses (`px-box`, `pt-box-dense`) are allowed.

## 7. Mapping tables (Phase 1)

Counts are light/dark pairs found together in one class string. "Shift" marks a value that changes.

### 7.1 Text

| Old (light / dark) | Count | Token | Shift |
|---|---|---|---|
| `neutral-900` / `[#fafafa]` | 79 | `text-base-content` | — |
| `neutral-900` / `[#e5e5e5]` | 24 | `text-base-content` | dark `#e5e5e5`→`#fafafa` |
| `neutral-900` / `white` (+ `hover:` 14) | 24 | `text-base-content` | dark `#fff`→`#fafafa` |
| `neutral-800` / `[#e5e5e5]`, `neutral-200` | 12 | `text-base-content` (strong labels) | light 800→900; dark `#e5e5e5`→`#fafafa` |
| `[#f5f5f5]` (InlineTerm) | 1 | `text-base-content` | dark `#f5f5f5`→`#fafafa` |
| `neutral-700` / `[#d4d4d4]` | 24 | `text-base-content-body` | — |
| `neutral-700` / `[#c4c4c4]` | 28 | `text-base-content-body` | dark `#c4c4c4`→`#d4d4d4` |
| `neutral-800` / `[#d4d4d4]` | 17 | `text-base-content-body` | light 800→700 |
| `neutral-700` / `[#a3a3a3]` | 11 | `text-base-content-secondary` | light 700→600 |
| `neutral-600` / `[#a3a3a3]` | 66 | `text-base-content-secondary` | — |
| `neutral-600` / `[#737373]` | 4 | `text-base-content-secondary` | dark `#737373`→`#a3a3a3` |
| `[#b4b4b4]` | 1 | `text-base-content-secondary` | dark `#b4b4b4`→`#a3a3a3` |
| `neutral-500` / `[#8e8e8e]` | 73 | `text-base-content-muted` | — |
| `neutral-500` / `[#737373]` | 9 | `text-base-content-muted` | dark `#737373`→`#8e8e8e` (brighter, now AA) |
| `neutral-500` / `neutral-400` | 3 | `text-base-content-muted` | dark `#a3a3a3`→`#8e8e8e` |
| `neutral-400` / `[#737373]` | 26 | `text-base-content-muted` | light 400→500; dark `#737373`→`#8e8e8e` (readable captions; `subtle` would fall to 2.4:1) |
| `neutral-400` / `[#666666]` | 7 | `text-base-content-muted` | light 400→500; dark `#666`→`#8e8e8e` (Gamification stat labels, quiz score denominator: readable text) |
| `neutral-300` / `[#444444]` (disabled) | 2 | `text-base-content-subtle` | light 300→400; dark `#444`→`#525252` |
| `neutral-300` / `[#333333]` (SectionOutline:75 `\|` separator) | 1 | `text-base-content-subtle` | light 300→400; dark `#333`→`#525252` |
| `white` / `[#0a0a0a]`, `white` / `neutral-950` | 25 | `text-primary-content` | — |
| `placeholder-neutral-400` / `[#555555]`, `[#666666]` | 3 | `placeholder-base-content-subtle` | dark `#555`/`#666`→`#525252` |
| `decoration-neutral-400` / `[#525252]`; `neutral-900` / `white` | 10 | `decoration-base-content-subtle`; `decoration-base-content` | dark `#fff`→`#fafafa` |

### 7.2 Surfaces

| Old (light / dark) | Count | Token | Shift |
|---|---|---|---|
| `white` / `[#141414]` | 76 | `bg-base-100` | — |
| `white` / `[#262626]`, `[#1f1f1f]`, `[#0a0a0a]` | 8 | `bg-base-100` | dark → `#141414` |
| `neutral-50/50` / `[#111111]`; `neutral-50/70` / `[#141414]/60`; `neutral-100/60` / `[#202020]` | 5 | `bg-base-100` | alpha dropped; dark → `#141414` |
| `[#fafafa]` / `[#0a0a0a]` (App shell) | 1 | `bg-base-200` | — |
| `neutral-50` / `[#181818]` (+ `/70`, `/80`, `hover:`) | 51 | `bg-base-300` | light 50→100; dark `#181818`→`#1a1a1a` |
| `neutral-50` / `[#1a1a1a]` | 8 | `bg-base-300` | light 50→100 |
| `neutral-100` / `[#1a1a1a]` (+ `hover:`) | 12 | `bg-base-300` | — |
| `neutral-100` / `[#1f1f1f]` (+ `/70`, `/80`, `hover:`) | 44 | `bg-base-300` | light alpha dropped; dark `#1f1f1f`→`#1a1a1a` |
| `neutral-100` / `[#262626]`, `[#141414]`, `[#222222]` | 11 | `bg-base-300` | dark → `#1a1a1a` |
| `neutral-200` / `[#262626]` (+ `hover:`) | 16 | `bg-base-border` (hover/pressed fill on `base-300`, locked chips) | — |
| `neutral-200/70` / `[#222222]` (hover) | 5 | `hover:bg-base-border` | light alpha dropped; dark `#222`→`#262626` |
| `neutral-900` / `white`; `neutral-950` / `white` | 57 | `bg-primary` (Phase 3 reclassifies, §10) | light 950→900 on 4 sites |
| `neutral-900` / `[#262626]` (Header theme toggle) | 2 | `bg-primary` (Phase 3 → soft) | dark `#262626`→`#fff` until Phase 3 lands; do Header in the same PR or keep until 3 |
| `neutral-700` / `[#333333]` (AI user avatar) | 1 | `bg-secondary` | dark `#333`→`#d4d4d4` (Phase 3 → IconBadge soft) |
| `bg-white/80,90,95` / `[#0a0a0a]/95`, `[#181818]` (sticky bars) | 13 | `bg-base-100/90` | alpha normalised to 90 |
| `bg-black/60` (drawer overlay) | 1 | `bg-neutral/60` | `#000`→`#262626` at 60% |
| App toast `neutral-950` / `[#141414]` | 1 | `bg-neutral text-neutral-content` | light 950→800; dark `#141414`→`#262626` |

### 7.3 Borders, dividers, rings

| Old (light / dark) | Count | Token | Shift |
|---|---|---|---|
| `neutral-200` / `[#262626]` (+ `/60`, `/80`, `divide-`) | 134 | `border-base-border` | alpha dropped |
| `neutral-100` / `[#262626]` (+ `divide-`) | 27 | `border-base-border` | light 100→200 |
| `neutral-100` / `[#1c1c1c]` (disabled) | 2 | `border-base-border` | light 100→200; dark `#1c1c1c`→`#262626` |
| `neutral-200` / `[#333333]` | 20 | `border-base-border` | dark `#333`→`#262626` |
| `neutral-300` / `[#333333]` | 4 | `border-base-border-strong` | — |
| `neutral-300` / `[#404040]`, `[#3a3a3a]`; `hover:neutral-400` / `[#404040]`; `neutral-400` / `[#555555]`, `[#525252]` | 14 | `border-base-border-strong` | light 400→300; dark `#3a3a3a`–`#555`→`#333` |
| `neutral-900`/`950` / `white` (selected) | 8 | `border-primary` (Phase 3 → `base-border-strong`) | — |
| `focus-visible:ring-neutral-900` / `white` | 2 | `ring-primary` | — |
| `focus:ring-neutral-400` / `neutral-600`; `ring-[#666666]` | 3 | `ring-base-border-strong` | small |

### 7.4 Chromatic families (rule-based)

Hue → token by meaning: `amber` → `business` where it marks the Business role, otherwise `warning`
(friction, XP); `indigo` → `engineer`; `emerald` → `success`; `rose` → `error` where it means failure/risk/must-have; `sky` → `info` in callouts.
Diagram series hues go to `data-N` (§7.5).

| Old pattern | Count (all hues) | Token | Shift |
|---|---|---|---|
| `text-{h}-500…900` + `dark:text-{h}-200…400` | ~330 | `text-{t}` | light → 700; dark → 400 (e.g. `emerald-800/900` on soft bg becomes 700) |
| `bg-{h}-50`/`100` + `dark:bg-{h}-950/20…40` | ~45 | `bg-{t}/10` | tint via color-mix instead of palette step |
| `bg-{h}-500/10` | ~20 | `bg-{t}/10` | base hue 500 → 700/400 |
| `border-{h}-500/20…30`; `border-{h}-200/300` + `dark:border-{h}-800` | ~40 | `border-{t}/25` | tint |
| `bg-{h}-500`/`600` (solid fills) | 53 | `bg-{t} text-{t}-content` | light 500/600 → 700; dark → 400 |
| `fill-amber-500 text-amber-500` (XP star) | 4 | `fill-warning text-warning` | 500 → 700/400 |
| `text-{h}-500` icons | ~40 | `text-{t}` | 500 → 700/400 |
| `tokens.accent.*.badge` | 7 keys | `<Badge color=… variant="soft">`: business, engineer, bridge→`neutral`, friction→`warning`, mindset→`success`, xp→`warning` + bold, success | as above |

### 7.5 Off-palette colors

| Old | Where | Target | Shift |
|---|---|---|---|
| `slate-*` grays (base surfaces/text/borders) | ChapterDiagram 269, ProtocolSimulator 42, App footer 8, QuizResultScreen 4 | base tokens by the same role rules as 7.1–7.3 | **accepted, the one visible surface change**: blue-gray → neutral; dark diagram cards `slate-900 #0f172a` → `#141414` |
| `blue-*` (46) | ChapterDiagram 31, ProtocolSimulator 15 | `data-1` | text 600/700 → 700, dark 300/400 → 400; fills 600 → 700/400 |
| `purple-*` (23) | ChapterDiagram 16, RoleMindsetCard 7 | `data-2` | same rule |
| `pink-*` (13) | ChapterDiagram | `data-3` | same rule |
| `sky-*` (8) | ChapterDiagram (series) | `data-4` | same rule |
| `rose-*` used as a series (not as failure/risk) | ChapterDiagram, case by case | `data-5` | none in light text 700; others by rule |
| `orange-500` (1) | FrictionPlaybookCard | `warning` | orange → amber |
| SVG/inline hex: `fill="#ffffff"`, `"#f59e0b"`, `"#3b82f6"`, `"#a855f7"`, data `stroke`/`core` `'#10b981' '#6366f1' '#f59e0b' '#f43f5e'`, `'#334155'` | ChapterDiagram.tsx:831-834, 935, 971-977 | `'#10b981'`→`var(--color-success)`, `'#6366f1'`→`var(--color-engineer)`, `'#f59e0b'`→`var(--color-warning)`, `'#f43f5e'`→`var(--color-error)`; Scope/Time/Cost labels `fill-warning`/`fill-data-1`/`fill-data-2`; `fill="#ffffff"`→`fill-primary-content`; `'#334155'`→`var(--color-base-border-strong)` | 500 → 700/400 |

The brief said two `diagrams/`/`figures/` files hold SVG hex. Measured: `diagrams/DiagramFamilyGrid.tsx`
and `diagrams/SwimlaneVsSequence.tsx` hold hex only in Tailwind classes (covered by 7.1–7.3); `figures/*`
already use theme-aware `var(--fig-*)` (kept). The only SVG hex is in `ChapterDiagram.tsx`.

Series classes follow the §7.4 pattern: `text-data-N`, `bg-data-N/10`, `border-data-N/25`, solid
`bg-data-N text-data-content`. About 90 sites (blue 46, purple 23, pink 13, sky 8) plus the rose series sites.

### 7.6 Padding

| Old | Count | Target | Shift (mobile / sm / lg) |
|---|---|---|---|
| `p-3.5 sm:p-4` | 18 | `p-box` | 14→12 / 16 / 16→20 |
| `p-3 sm:p-3.5` | 17 | `p-box` top-level; `p-box-dense` nested | box: 12 / 14→16 / →20 · dense: 12→8 / 14→12 / 14 |
| `p-3.5 sm:p-5` | 14 | `p-box` | 14→12 / 20→16 / 20 |
| `p-3.5 sm:p-4.5` | 13 | `p-box` | 14→12 / 18→16 / 18→20 |
| `p-4 sm:p-5` | 10 | `p-box` | 16→12 / 20→16 / 20 |
| `p-3 sm:p-4` | 9 | `p-box` | 12 / 16 / 16→20 |
| `p-4 sm:p-6`, `p-5 sm:p-6`, `p-4 sm:p-6 lg:p-7`, Gamification `p-5 sm:p-6` | 8 | `p-box-spacious` | 16–20→16 / 24 / 24–28→32 |
| `p-2.5 sm:p-3`, `p-2 sm:p-2.5`, `p-2 sm:p-4` | 7 | `p-box-dense` | ±2px |
| single `p-4` (card) | 23 | `p-box` | 16→12 / 16 / 16→20 |
| single `p-3`, `p-3.5` (nested box) | 66 | `p-box-dense` if nested, else `p-box` | nested: 12–14→8 / 12 / 14 |
| single `p-2.5`, `p-2`, `p-1.5`, `p-1` | 46 | component `size` (buttons/chips) or unchanged (icon insets) | — |
| `px-3 sm:px-6 lg:px-8` (App main) | 1 | `px-page` | — |
| `px-4 sm:px-6 lg:px-8` (Header rows) | 2 | `px-page` | 16→12 mobile |
| `gap-4 sm:gap-6 lg:gap-8`, `space-y-4 sm:space-y-6`, `space-y-5 sm:space-y-6`, `space-y-6 sm:space-y-8` | 7 | `gap-section` / `space-y-section` | ±4–8px |
| `gap-2 sm:gap-3`, `space-y-2 sm:space-y-3`, `gap-2.5 sm:gap-3`, `space-y-2.5 sm:space-y-3` | ~9 | `gap-stack` / `space-y-stack` | ±2px |

Padding moves in Phase 3 with each area (it needs the nested/top-level judgement), not in Phase 1.

## 8. Components (`src/components/ui/`)

Shared types in `ui/types.ts`; `cn()` moves from `styles/tokens.ts` to `ui/cn.ts`.

```ts
export type Color = 'primary' | 'secondary' | 'accent' | 'neutral'
  | 'info' | 'success' | 'warning' | 'error' | 'business' | 'engineer';
export type Tap = 'full' | 'y' | 'positioned' | 'gap-4' | 'gap-6' | 'gap-8' | 'gap-16'; // → TAP, TAP_Y, TAP_POSITIONED, TAP_GAP[n]

// Button.tsx — `color` is omitted from the HTML attributes because HTMLAttributes already declares it.
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  color?: Color;                                         // default 'neutral'
  variant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'link'; // default 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg';                      // default 'md'
  shape?: 'default' | 'square' | 'circle';
  tap?: Tap;                                             // default 'full'
  block?: boolean;                                       // w-full
}
export function buttonClass(o: Pick<ButtonProps, 'color' | 'variant' | 'size' | 'shape' | 'tap' | 'block'>): string; // for <a>/<summary>

// Badge.tsx
export interface BadgeProps { color?: Color; variant?: 'solid' | 'soft' | 'outline'; size?: 'xs' | 'sm' | 'md';
  className?: string; children: React.ReactNode }

// Card.tsx
export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li' | 'details';
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
  padding?: 'box' | 'dense' | 'spacious' | 'none'; // 'none' for cards with their own padded header/body (details/summary)
}

// ToggleChip.tsx — a toggle button; sets aria-pressed={selected} unless the caller passes aria-current.
export interface ToggleChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  selected: boolean;
  shape?: 'chip' | 'pill' | 'segment' | 'tab' | 'card';
  size?: 'xs' | 'sm';
  selectedStyle?: 'soft' | 'solid'; // 'solid' only for a chosen quiz answer (§9)
  tap?: Tap;
}

// Tabs.tsx — a labelled group of ToggleChips; picks gap and tap ring together so they cannot disagree.
export interface TabsProps<T extends string> {
  items: readonly { value: T; label: React.ReactNode; icon?: React.ReactNode; title?: string }[];
  value: T;
  onChange: (value: T) => void;
  variant: 'segmented' | 'pills' | 'underline'; // segmented: edge to edge + tap 'y'; pills: gap-1.5 + 'gap-6'; underline: tap 'y'
  size?: 'xs' | 'sm';
  'aria-label': string;
  scroll?: boolean; // overflow-x-auto + SCROLL_ROOM
}

// IconBadge.tsx — decorative square; aria-hidden unless `label` is given.
export interface IconBadgeProps { children: React.ReactNode; size?: 'sm' | 'md' | 'lg'; // 24 / 28 / 56→64
  color?: Color; variant?: 'soft' | 'outline'; label?: string; className?: string }

// Input.tsx / Textarea.tsx
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> { size?: 'sm' | 'md'; invalid?: boolean }
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { invalid?: boolean }

// Alert.tsx — soft callout; role="status" only when `live`.
export interface AlertProps { color: 'info' | 'success' | 'warning' | 'error'; title?: React.ReactNode;
  icon?: React.ReactNode; live?: boolean; children: React.ReactNode }
```

Variant → classes (full literal strings per color in the real map; `{c}` here is shorthand):

| Variant | Monochrome colors (primary, secondary, accent, neutral) | Chromatic colors |
|---|---|---|
| `solid` | `bg-{c} text-{c}-content border border-{c} hover:bg-{c}/90` | same |
| `outline` | `border border-base-border-strong text-base-content hover:bg-base-300` | `border border-{c}/40 text-{c} hover:bg-{c}/10` |
| `soft` | `bg-base-300 text-base-content border border-transparent hover:bg-base-border` | `bg-{c}/10 text-{c} border border-{c}/25 hover:bg-{c}/15` |
| `ghost` | `text-base-content-secondary hover:text-base-content hover:bg-base-300` | `text-{c} hover:bg-{c}/10` |
| `link` | `text-base-content underline underline-offset-2 decoration-base-border-strong hover:decoration-current` | `text-{c} underline …` |

All buttons: `inline-flex items-center justify-center gap-1.5 font-semibold rounded-field transition-colors
cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
focus-visible:ring-offset-base-100 disabled:opacity-40 disabled:cursor-not-allowed` + the tap ring.

| Size | default shape | square / circle |
|---|---|---|
| `xs` | `px-2.5 py-1 text-xs` | `p-1` |
| `sm` | `px-3 py-1.5 text-xs` | `p-1.5` |
| `md` | `px-4 py-2 text-xs sm:text-sm` | `p-2` |
| `lg` | `px-6 py-3 text-sm` | `p-3` |

`circle` adds `rounded-full`. Selected ToggleChip (soft): `bg-base-300 font-bold text-base-content border
border-base-border-strong`; unselected: `border border-transparent text-base-content-secondary hover:bg-base-300
hover:text-base-content`; `tab` shape selected: `border-b-2 border-base-content font-bold`. Card: default
`bg-base-100 border border-base-border rounded-box`; elevated adds `border-base-border-strong shadow-xs`;
subtle `bg-base-300 border border-base-border`; interactive = default + `hover:border-base-border-strong
transition-colors`. IconBadge soft: `bg-base-300 text-base-content border border-base-border rounded-field`.

`tapTargets.test.ts` scans lowercase `<button`/`<a`/`<summary>` only, so `<Button>`/`<ToggleChip>` call sites
are not scanned; the components' own `<button className={…}>` tags would fail it. Phase 2 extends the test:
a tag whose class expression calls `buttonClass(`, `chipClass(` or `tapClass(` counts as covered, and
`ui/*.test.ts` asserts every size/shape/tap combination contains a `max-sm:before:min-h-11` or `TAP_GAP` ring.

## 9. Hierarchy rules (also the `Button` doc comment)

| Rank | Use | Variant |
|---|---|---|
| 1 | The main next step. **At most one per view.** | `primary` `solid` |
| 2 | Secondary or alternative actions | `outline` or `soft` |
| 3 | Toolbar, icon buttons, close, back, menus | `ghost` |
| 4 | Inline text actions | `link` |

- Selected tabs, chips, filters, segments and list rows are **soft**: `bg-base-300` + bold + `base-border-strong`
  border (underline tabs: `border-b-2 border-base-content`). Never a primary fill.
- Exception: a chosen quiz answer option may stay `solid` (`selectedStyle="solid"`).
- `IconBadge` is soft (`bg-base-300`): decoration must not look like a button.
- Progress bars stay `bg-primary`.

## 10. Audit of `bg-neutral-900` / `bg-neutral-950`

### 10.1 CTAs, one primary per view

| Site | Action | View | Target | Note |
|---|---|---|---|---|
| QuizTab.tsx:320 | next question / see result | Quiz | `Button primary solid lg` | "read related chapter" (QuizTab:312) is already soft → `neutral soft lg` |
| QuizResultScreen.tsx:121 | retake quiz | Quiz result | `Button primary solid lg` | "ask AI" (:128) → `neutral soft lg` |
| AIAssistantTab.tsx:329 | send | AI | `Button primary solid sm`, tap `positioned` | only CTA in view |
| GuideTab.tsx:611 | next chapter | Guide reader | `Button primary solid sm` | **competes** with :368, TrackPanel:63 (lg sidebar) and TrackFooter:37. Stays primary except on a track's last chapter, where it renders `neutral outline` |
| TrackFooter.tsx:37 | start quiz (TrackEndCard) | Guide reader, track end | `Button primary solid sm` | the one primary while shown |
| GuideTab.tsx:368 | open index | Guide | `Button neutral outline md`, tap `gap-8` | demoted |
| TrackPanel.tsx:63 | continue track / start quiz | Guide sidebar & drawer | `Button primary soft sm block` | demoted; sidebar is visible beside the reader on lg |
| GuideTab.tsx:979 | close index drawer | Guide drawer | `Button neutral ghost md` | close = ghost |
| GlossaryPanel.tsx:176 | clear filters (empty result) | Guide ch. 15 | `Button neutral soft sm` | reader's :611 is the primary |
| GamificationTab.tsx:221 (inverse `bg-white`) | go to quiz (+XP) | Gamification | `Button primary solid md` | :227 "keep reading" (inverse outline) → `neutral outline md` |

### 10.2 Selected states → soft

| Site | Control | Target |
|---|---|---|
| Header.tsx:268, :280, :292, :304 (`950`) | main nav tabs | `Tabs variant="pills"` (`scroll`) |
| Header.tsx:30 (`segmentClass`) | role / level segments | `Tabs variant="segmented"` |
| Header.tsx:236, :248 | theme toggle | `Tabs variant="segmented"`, icon items |
| QuizTab.tsx:105 | round chips | `ToggleChip shape="pill"`, tap `gap-8` |
| GuideTab.tsx:459, :907 | role filter chips (sidebar, drawer) | `Tabs variant="pills"` |
| GuideTab.tsx:657, :667 | lens quick switch | `Tabs variant="segmented"` |
| GuideTab.tsx:701 | per-chapter level | `Tabs variant="segmented"` |
| GuideTab.tsx:488, :937 | chapter number in the active index row | `IconBadge` soft with `border-base-border-strong` (the row itself is already soft) |
| TrackPanel.tsx:48 | active chapter row | `ToggleChip shape="card"` soft |
| SectionOutline.tsx:58 | section chips | `ToggleChip shape="pill"` |
| DiagramSection.tsx:94 | C4 level | `Tabs variant="segmented"` |
| OtherSideSection.tsx:132 | view switch | `Tabs variant="pills"`, tap `gap-6` |
| GlossaryCategoryMap.tsx:37 | category cards | `ToggleChip shape="card"` |
| GlossaryPanel.tsx:36 (`chipClass`) | side / category chips | `ToggleChip shape="chip"`, tap `gap-6` |
| GamificationTab.tsx:179 | unlocked badge icon (state, not selection) | `IconBadge` soft; locked → `IconBadge` with `opacity-50 text-base-content-subtle` |

### 10.3 Decorative squares → `IconBadge` soft

`guide/sections/`: CoreConceptsSection:30, DiagramSection:22, DialogueSection:15, ExamplesSection:15,
GlossarySection:18, ReferenceSection:21, JargonSection:26, FaqSection:17, PitfallsSection:16, PrimerSection:22,
ChecklistSection:16, WorkflowSection:16, OtherSideSection:108 (13 sites, `size="md"`); ChapterHero:50
(chapter number, `md`); Header:189 (level mark, `sm`); AIAssistantTab:200 and :299 (AI/user avatars, `md`);
GamificationTab:67 (level, `lg`). 18 sites.

### 10.4 Progress and bullets

| Site | Target |
|---|---|
| QuizTab:221, GamificationTab:100, Header:205, GuideTab:401 (progress fills) | `bg-primary` |
| CoreConceptsSection:58, PrimerSection:41, :51, ContentBlocks:177 (bullets) | `bg-base-content` |

### 10.5 Emphasized surfaces

| Site | Target |
|---|---|
| AIAssistantTab:210 (user chat bubble) | `bg-base-300 text-base-content border border-base-border` |
| GamificationTab:213 (CTA card) | `Card variant="subtle" padding="spacious"`; its buttons per 10.1 |
| App.tsx:325 (toast) | `bg-neutral text-neutral-content` |

## 11. Phases

Each phase is its own PR to `main`; the site works after each.

| Phase | Content | Visible change |
|---|---|---|
| 1a | `index.css` tokens (§4–6), fold old vars, delete dead utilities. Mechanical replace per §7.1–7.3 in every file except ChapterDiagram.tsx and ProtocolSimulator.tsx, via a one-off script kept in `work/` (not committed). Guardrail test lands with a baseline (§12). | only the "Shift" rows |
| 1b | §7.4 chromatic mapping everywhere; §7.5 slate, series hues → `data-N` and SVG hex in ChapterDiagram / ProtocolSimulator / RoleMindsetCard / App footer / QuizResultScreen. Baseline becomes `{}`. | chromatic step changes; slate → neutral diagram cards (accepted) |
| 2 | `ui/` components (§8) + unit tests (variant → class, tap ring per size/shape/tap, `Tabs` gap ↔ tap agreement); extend `tapTargets.test.ts`. No call sites change. | none |
| 3 | Migrate by area, one PR each: Header → Guide & sections → Quiz → Glossary → AI → Gamification. Apply §10 targets, §7.6 padding, §5 radii; replace `tokens.*` in GlossaryPanel; delete `src/styles/tokens.ts` in the last PR. | button/selection hierarchy, padding, radii |

## 12. Guardrail test (`src/components/ui/colorTokens.test.ts`)

Scans non-test `.tsx` under `src/components/` (excluding `ui/`) **and `src/App.tsx`** (it holds the shell
canvas, footer and toast). Same file walker as `tapTargets.test.ts`.

| Rule | Pattern (sketch) |
|---|---|
| No arbitrary hex classes | `-\[#[0-9a-fA-F]{3,8}\]` |
| No hex in SVG attributes, styles or data strings | `(fill\|stroke\|stopColor\|color)=["{]*#[0-9a-fA-F]{3,8}` and `['"]#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?([0-9a-fA-F]{2})?['"]` (text like `#A1024` is not quote-bounded) |
| No `dark:` color classes | `dark:(?:[\w-]+:)*(bg\|text\|border\|ring\|divide\|placeholder\|fill\|stroke\|from\|via\|to\|outline\|decoration\|caret)-` followed by a color value (palette, hex, `white`, `black`, or a token); `dark:` for non-color utilities stays allowed |
| No raw palette | `(bg\|text\|border(-[trblxy])?\|…)-(slate\|gray\|zinc\|neutral\|stone\|red\|orange\|amber\|yellow\|lime\|green\|emerald\|teal\|cyan\|sky\|blue\|indigo\|violet\|purple\|fuchsia\|pink\|rose)-\d{2,3}` and `-(white\|black)\b`; `bg-neutral` (token) passes |

Staging is a ratchet: `const BASELINE: Record<string, number>` maps file → allowed violation count.

| Stage | Baseline | Assertions |
|---|---|---|
| after 1a | ChapterDiagram.tsx, ProtocolSimulator.tsx and every file still holding chromatic classes, with their counts | a file not listed has 0; a listed file must equal its count exactly (so a fix forces the baseline down in the same PR) |
| after 1b | `{}` (series hues are mapped to `data-N` in 1b) | a file not listed has 0 |
| end of 3 | `{}`, and the `BASELINE` mechanism is deleted | + an extra assertion: `bg-primary` outside `ui/` appears only at the §10.4 progress sites |

A self-test proves the scan finds violations (a fixture string per rule) so it cannot pass on an empty scan.

## 13. Verification (every phase)

1. `npm run lint` (tsc) and `npm test` (vitest) pass.
2. `npm run build`; the built CSS contains `.p-box{padding:var(--spacing-box)}`, a `.dark{` block setting
   `--color-base-100`, and `@media (width>=40rem)` overriding `--spacing-box`.
3. Browser before/after screenshots, 5 views × light/dark × 375px/1280px = 20 pairs, saved under
   `work/design-tokens/phase-N/`: Guide reader (with first-visit card dismissed, sidebar on desktop, drawer
   open on mobile), Guide ch. 15 glossary, Quiz (in progress and result), AI, Gamification. Phase 1 and 2
   pairs must differ only where §7 says "Shift"; Phase 3 pairs are reviewed against §9–10.
4. Phase 3: count `Button variant="solid" color="primary"` per view — at most one visible at a time.

## 14. Open questions

None. Q1–Q4 of the first draft were answered by the owner on 2026-09-23 (see the header).
