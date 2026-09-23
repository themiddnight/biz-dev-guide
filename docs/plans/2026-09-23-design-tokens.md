# Design tokens and UI components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every colour, radius and layout spacing in the app comes from CSS variables in `src/index.css`, typed
components in `src/components/ui/` carry the button/selection hierarchy (one primary solid per view), and a
guardrail test keeps raw colours out.

**Architecture:** Phase 1 declares the tokens with `@theme static` and overrides their values under `.dark` and per
breakpoint in `@layer base`, then rewrites every raw colour class to a token, area by area, with a one-off script
(`work/design-tokens/map-colors.mjs`, not committed) plus a short list of hand edits; a ratchet test
(`colorTokens.test.ts`) shrinks its per-file baseline to `{}`. Phase 2 adds the `ui/` components with unit tests and no
call-site changes. Phase 3 migrates each area to the components (spec §10 targets) and to the radius/spacing tokens,
guarded by `hierarchy.test.ts`, and finally deletes `src/styles/tokens.ts` and the baseline mechanism.

**Tech Stack:** React 19 + TypeScript, Tailwind CSS 4.3 (`@tailwindcss/vite`), Vitest 5 (node env, `renderToStaticMarkup`), npm scripts.

**Spec:** `docs/specs/2026-09-23-design-tokens.md` (owner decisions 2026-09-23 in its header). Line numbers in the spec
and in this plan refer to `b9e688c`; `src/` at the plan's base commit is identical. The mapping script never adds or
removes lines, so Phase 1 line numbers stay valid through Phase 1. In Phase 3, find sites by the landmark given (handler,
data attribute or comment), not by line number.

**PR cut points (spec §11):** Phase 1 = Tasks 1–7 (the spec's 1a and 1b land together per area, so each file leaves the
baseline in one step), Phase 2 = Tasks 8–12, Phase 3 = Tasks 13–19, Task 20 verifies.

## Global Constraints

- Tokens are declared in `@theme static { … }`. Never `@theme inline` (it bakes values in; the `.dark`/media overrides stop working). `@theme` is never nested in a selector or media query; only values are overridden, in `@layer base`.
- `.dark` sits on `<html>` (App.tsx:112); dark values are set with `.dark { --color-…: … }` inside `@layer base`.
- Colour values, verbatim from spec §4 (light / dark): `base-100` `#ffffff`/`#141414`; `base-200` `#fafafa`/`#0a0a0a`; `base-300` `oklch(97% 0 0)`/`#1a1a1a`; `base-content` `oklch(20.5% 0 0)`/`#fafafa`; `base-content-body` `oklch(37.1% 0 0)`/`#d4d4d4`; `base-content-secondary` `oklch(43.9% 0 0)`/`#a3a3a3`; `base-content-muted` `oklch(55.6% 0 0)`/`#8e8e8e`; `base-content-subtle` `oklch(70.8% 0 0)`/`#525252`; `base-border` `oklch(92.2% 0 0)`/`#262626`; `base-border-strong` `oklch(87% 0 0)`/`#333333`; `primary` `oklch(20.5% 0 0)`/`#ffffff`; `primary-content` `#ffffff`/`#0a0a0a`; `secondary` `oklch(37.1% 0 0)`/`#d4d4d4`; `secondary-content` `#ffffff`/`#0a0a0a`; `accent`/`accent-content` = `var(--color-primary)`/`var(--color-primary-content)`; `neutral` `oklch(26.9% 0 0)`/`#262626`; `neutral-content` `#fafafa`/`#e5e5e5`; `info` `oklch(50% 0.134 242.749)`/`oklch(74.6% 0.16 232.661)`; `success` `oklch(50.8% 0.118 165.612)`/`oklch(76.5% 0.177 163.223)`; `warning` `oklch(55.5% 0.163 48.998)`/`oklch(82.8% 0.189 84.429)`; `error` `oklch(51.4% 0.222 16.935)`/`oklch(71.2% 0.194 13.428)`; `business` = warning values; `engineer` `oklch(45.7% 0.24 277.023)`/`oklch(67.3% 0.182 276.935)`; `{info…engineer}-content` `#ffffff`/`#0a0a0a`; `data-1` `oklch(48.8% 0.243 264.376)`/`oklch(70.7% 0.165 254.624)`; `data-2` `oklch(49.6% 0.265 301.924)`/`oklch(71.4% 0.203 305.504)`; `data-3` `oklch(52.5% 0.223 3.958)`/`oklch(71.8% 0.202 349.761)`; `data-4` = info values; `data-5` = error values; `data-content` `#ffffff`/`#0a0a0a`.
- `--body-text` is a plain variable (not in `@theme`): light `var(--color-base-content)`, dark `#e5e5e5`. `body` uses it; the App root drops its text classes.
- Radius (mobile / sm ≥ 640): `field` 8px/12px, `box` 12px/16px, `selector` 6px/8px. `rounded-full` stays for pills, circles, progress bars, bullets.
- Spacing (mobile / sm / lg): `page` 12/24/32, `box` 12/16/20, `box-dense` 8/12/14, `box-spacious` 16/24/32, `section` 16/24/32, `stack` 8/12/12 (px).
- `base-content-subtle` is below 3:1 by design: disabled text, placeholders, separators, decoration only, never text a reader needs. Captions on a `base-300` surface use `secondary`, not `muted`.
- Variant maps contain complete literal class strings (`'bg-success text-success-content'`), never `` `bg-${color}` ``.
- No new dependencies (no daisyUI, no cva). Content, data, behaviour and ARIA roles are unchanged; `aria-pressed` toggles stay toggles (never `role="tab"`).
- Hierarchy (spec §9): at most one `color="primary" variant="solid"` Button visible per view; selected tabs/chips/filters/segments/rows are soft (`bg-base-300` + bold + `base-border-strong`); a chosen quiz answer may stay solid; `IconBadge` is soft; progress bars stay `bg-primary`.
- A nested box inside a card uses `box-dense`, never `box` in `box`. Button/input padding lives in the component `size`, not in spacing tokens.
- Every `<button>`, `<a>`, `<summary>` under `src/components/` keeps a tap ring (`src/components/ui/tapTarget.ts`, enforced by `tapTargets.test.ts`). Do not change `tapTarget.ts`.
- `work/` is git-ignored: the migration scripts live there and are not committed.
- Completion gate for every task: `npm run lint` (tsc) and `npm test` (vitest) both pass.

## Review Focus

1. **Dark mode silently stays light.** If the `.dark` overrides end up outside `@layer base` or the theme becomes `inline`, the text test still passes but a dark-mode reader sees light tokens. Pinned by the compiled-CSS check in Task 1 Step 6 (and again in Task 7 and Task 20).
2. **Iron-triangle tint breaks when hex becomes `var()`.** ChapterDiagram builds `` fill={`${level.stroke}26`} `` (hex + alpha); with `var(--color-…)` that string is invalid and the triangle loses its tint with no error. Pinned by `ChapterDiagram.test.tsx` in Task 7.
3. **A list row that uses `aria-current` must not gain `aria-pressed`.** TrackPanel's active row becomes a `ToggleChip`; a reader's screen reader must still hear "current", not "pressed". Pinned by the TrackPanel test added in Task 14.
4. **The AI send button must still submit the form.** `Button` defaults to `type="button"`; if the send button loses `type="submit"`, Enter and click stop sending. Pinned by `AIAssistantTab.test.tsx` in Task 18.
5. **`IconBadge` is `aria-hidden` by default and must not hide a number the reader needs** (chapter number, level). Pinned by the ChapterHero test in Task 15 and the Gamification test in Task 19.

---

## File map

| File | Responsibility | Task |
|---|---|---|
| `src/index.css` | tokens, dark/breakpoint overrides, body colours; dead utilities removed | 1, 7 |
| `src/components/ui/themeTokens.test.ts` | CSS declares every token and override | 1 |
| `src/components/ui/colorTokens.test.ts` | guardrail: no raw colours (ratchet baseline, later removed) | 2–7, 19 |
| `work/design-tokens/map-colors.mjs` | one-off Phase 1 colour rewrite (not committed) | 3 |
| `src/components/ui/types.ts`, `cn.ts`, `tapClass.ts`, `colors.ts` | shared types, class join, tap ring lookup, literal colour maps | 8 |
| `src/components/ui/Button.tsx` (+ test) | `Button`, `buttonClass` | 8 |
| `src/components/ui/Badge.tsx`, `IconBadge.tsx` (+ test) | labels and decorative squares | 9 |
| `src/components/ui/Card.tsx` (+ test) | card surfaces | 10 |
| `src/components/ui/ToggleChip.tsx`, `Tabs.tsx` (+ test) | selection controls | 11 |
| `src/components/ui/Input.tsx`, `Textarea.tsx`, `Alert.tsx` (+ test) | fields and callouts | 12 |
| `src/components/ui/tapTargets.test.ts` | counts `buttonClass(`/`chipClass(`/`tapClass(` as covered | 8 |
| `src/components/ui/hierarchy.test.ts` | Phase 3 guard: layout tokens, primary count, progress-only `bg-primary` | 13–19 |
| `work/design-tokens/map-layout.mjs` | one-off Phase 3 radius/padding/gap rewrite (not committed) | 13 |
| `src/styles/tokens.ts` | deleted | 19 |

---

### Task 1: Tokens in `src/index.css`

**Files:**
- Modify: `src/index.css` (lines 1–57 replaced; `.token-card*`, `.token-label-mono`, `.accent-box` deleted; `.label` and scrollbar colours changed)
- Test: `src/components/ui/themeTokens.test.ts` (new)

**Interfaces:**
- Consumes: nothing.
- Produces: CSS variables `--color-{base-100, base-200, base-300, base-content, base-content-body, base-content-secondary, base-content-muted, base-content-subtle, base-border, base-border-strong, primary, primary-content, secondary, secondary-content, accent, accent-content, neutral, neutral-content, info, info-content, success, success-content, warning, warning-content, error, error-content, business, business-content, engineer, engineer-content, data-1…data-5, data-content}`, `--radius-{field, box, selector}`, `--spacing-{page, box, box-dense, box-spacious, section, stack}`, and therefore utilities such as `bg-base-100`, `text-base-content-muted`, `border-base-border`, `bg-success/10`, `fill-data-1`, `rounded-box`, `p-box`, `px-page`, `gap-stack`. `--color-slate-850` stays until Task 7.

- [ ] **Step 0: Capture "before" screenshots (browser, not Bash)**

Start the dev server (`npm run dev`, i.e. `tsx server.ts`) with the preview tools and save 20 screenshots to
`work/design-tokens/before/`: 5 views (Guide reader with the first-visit card dismissed — sidebar on desktop, index
drawer open on mobile; Guide ch. 15 glossary; Quiz in progress and the result screen; AI; Gamification) × light/dark ×
375px/1280px. File names `<view>-<theme>-<width>.png`. Task 20 compares against these.

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/themeTokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guard: src/index.css declares every design token of docs/specs/2026-09-23-design-tokens.md §4-6,
 * overrides the colour values under `.dark` and the spacing/radius values per breakpoint, and no
 * longer carries the dead token layer. Reads the CSS text; Tailwind itself is not run.
 */

/** The stylesheet without comments, so prose that names a token does not count. */
const CSS = readFileSync(join(process.cwd(), 'src/index.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** The body of the first `{…}` block that follows `header`, braces balanced. */
function block(css: string, header: string): string {
  const at = css.indexOf(header);
  if (at < 0) throw new Error(`no block ${header}`);
  const open = css.indexOf('{', at + header.length - 1);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unclosed block ${header}`);
}

/** `--name: value;` declarations of a block, as a map. */
function vars(body: string): Record<string, string> {
  return Object.fromEntries([...body.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
}

export const COLOR_TOKENS = [
  'base-100', 'base-200', 'base-300',
  'base-content', 'base-content-body', 'base-content-secondary', 'base-content-muted', 'base-content-subtle',
  'base-border', 'base-border-strong',
  'primary', 'primary-content', 'secondary', 'secondary-content', 'accent', 'accent-content', 'neutral', 'neutral-content',
  'info', 'info-content', 'success', 'success-content', 'warning', 'warning-content', 'error', 'error-content',
  'business', 'business-content', 'engineer', 'engineer-content',
  'data-1', 'data-2', 'data-3', 'data-4', 'data-5', 'data-content',
] as const;
export const SPACING_TOKENS = ['page', 'box', 'box-dense', 'box-spacious', 'section', 'stack'] as const;
export const RADIUS_TOKENS = ['field', 'box', 'selector'] as const;

const theme = vars(block(CSS, '@theme static {'));
const layerBase = block(CSS, '@layer base {');
const dark = vars(block(layerBase, '.dark {'));
const sm = vars(block(block(layerBase, '@media (width >= 40rem) {'), ':root {'));
const lg = vars(block(block(layerBase, '@media (width >= 64rem) {'), ':root {'));

describe('design tokens in index.css', () => {
  it('uses a static theme, never an inline one', () => {
    expect(CSS).toContain('@theme static {');
    expect(CSS).not.toMatch(/@theme\s+inline/);
  });

  it('declares every colour, radius and spacing token', () => {
    for (const t of COLOR_TOKENS) expect(theme[`--color-${t}`], t).toBeDefined();
    for (const t of RADIUS_TOKENS) expect(theme[`--radius-${t}`], t).toBeDefined();
    for (const t of SPACING_TOKENS) expect(theme[`--spacing-${t}`], t).toBeDefined();
  });

  it('overrides every colour under .dark except accent, which follows primary', () => {
    for (const t of COLOR_TOKENS.filter(t => !t.startsWith('accent'))) expect(dark[`--color-${t}`], t).toBeDefined();
    expect(theme['--color-accent']).toBe('var(--color-primary)');
    expect(theme['--color-accent-content']).toBe('var(--color-primary-content)');
  });

  it('keeps the owner-decided values (spec header and §4)', () => {
    expect(theme['--color-base-content-muted']).toBe('oklch(55.6% 0 0)');
    expect(dark['--color-base-content-muted']).toBe('#8e8e8e');
    expect(theme['--color-error']).toBe('oklch(51.4% 0.222 16.935)');
    expect(theme['--color-data-4']).toBe(theme['--color-info']);
    expect(theme['--color-data-5']).toBe(theme['--color-error']);
    expect(dark['--color-business']).toBe(dark['--color-warning']);
    expect(dark['--body-text']).toBe('#e5e5e5');
  });

  it('grows spacing at sm and lg, and radii at sm (§5, §6)', () => {
    expect([theme['--spacing-page'], sm['--spacing-page'], lg['--spacing-page']]).toEqual(['0.75rem', '1.5rem', '2rem']);
    expect([theme['--spacing-box'], sm['--spacing-box'], lg['--spacing-box']]).toEqual(['0.75rem', '1rem', '1.25rem']);
    expect([theme['--spacing-box-dense'], sm['--spacing-box-dense'], lg['--spacing-box-dense']]).toEqual(['0.5rem', '0.75rem', '0.875rem']);
    expect([theme['--spacing-box-spacious'], sm['--spacing-box-spacious'], lg['--spacing-box-spacious']]).toEqual(['1rem', '1.5rem', '2rem']);
    expect([theme['--spacing-section'], sm['--spacing-section'], lg['--spacing-section']]).toEqual(['1rem', '1.5rem', '2rem']);
    expect([theme['--spacing-stack'], sm['--spacing-stack']]).toEqual(['0.5rem', '0.75rem']);
    expect([theme['--radius-field'], sm['--radius-field']]).toEqual(['0.5rem', '0.75rem']);
    expect([theme['--radius-box'], sm['--radius-box']]).toEqual(['0.75rem', '1rem']);
    expect([theme['--radius-selector'], sm['--radius-selector']]).toEqual(['0.375rem', '0.5rem']);
  });

  it('drops the dead token layer and paints body from the tokens', () => {
    for (const dead of ['.token-card', '.token-label-mono', '.accent-box', '--canvas-bg', '--surface-', '--border-color', '--text-primary', '--text-muted'])
      expect(CSS, dead).not.toContain(dead);
    const body = block(layerBase, 'body {');
    expect(body).toContain('background-color: var(--color-base-200)');
    expect(body).toContain('color: var(--body-text)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/themeTokens.test.ts`
Expected: FAIL with `Error: no block @theme static {`

- [ ] **Step 3: Replace the top of `src/index.css`**

Replace everything from line 1 (`@import "tailwindcss";`) through the end of the `@layer base { … }` block (line 57,
the `}` after `body { … }`) with:

```css
@import "tailwindcss";

/*
 * Design tokens (docs/specs/2026-09-23-design-tokens.md §4-6). `static` emits every variable even when
 * no utility uses it, so SVG attributes and inline styles can read `var(--color-…)`. Never make this theme
 * inline: that bakes values into utilities and the `.dark` / media overrides below would stop working.
 */
@theme static {
  --font-sans: 'Geist', 'Prompt', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --color-slate-850: #172033;

  --color-base-100: #ffffff;
  --color-base-200: #fafafa;
  --color-base-300: oklch(97% 0 0);
  --color-base-content: oklch(20.5% 0 0);
  --color-base-content-body: oklch(37.1% 0 0);
  --color-base-content-secondary: oklch(43.9% 0 0);
  --color-base-content-muted: oklch(55.6% 0 0);
  --color-base-content-subtle: oklch(70.8% 0 0);
  --color-base-border: oklch(92.2% 0 0);
  --color-base-border-strong: oklch(87% 0 0);

  --color-primary: oklch(20.5% 0 0);
  --color-primary-content: #ffffff;
  --color-secondary: oklch(37.1% 0 0);
  --color-secondary-content: #ffffff;
  --color-accent: var(--color-primary);
  --color-accent-content: var(--color-primary-content);
  --color-neutral: oklch(26.9% 0 0);
  --color-neutral-content: #fafafa;

  --color-info: oklch(50% 0.134 242.749);
  --color-info-content: #ffffff;
  --color-success: oklch(50.8% 0.118 165.612);
  --color-success-content: #ffffff;
  --color-warning: oklch(55.5% 0.163 48.998);
  --color-warning-content: #ffffff;
  --color-error: oklch(51.4% 0.222 16.935);
  --color-error-content: #ffffff;
  --color-business: oklch(55.5% 0.163 48.998);
  --color-business-content: #ffffff;
  --color-engineer: oklch(45.7% 0.24 277.023);
  --color-engineer-content: #ffffff;

  --color-data-1: oklch(48.8% 0.243 264.376);
  --color-data-2: oklch(49.6% 0.265 301.924);
  --color-data-3: oklch(52.5% 0.223 3.958);
  --color-data-4: oklch(50% 0.134 242.749);
  --color-data-5: oklch(51.4% 0.222 16.935);
  --color-data-content: #ffffff;

  --radius-field: 0.5rem;
  --radius-box: 0.75rem;
  --radius-selector: 0.375rem;

  --spacing-page: 0.75rem;
  --spacing-box: 0.75rem;
  --spacing-box-dense: 0.5rem;
  --spacing-box-spacious: 1rem;
  --spacing-section: 1rem;
  --spacing-stack: 0.5rem;
}

@custom-variant dark (&:where(.dark, .dark *));

/* No monospace in content: code-like elements use the body font (kbd keeps the preflight monospace). */
code, samp, pre {
  font-family: inherit;
}

::selection {
  background: #ffffff;
  color: #0a0a0a;
}

@layer base {
  /* Default text colour: light = base-content, dark = #e5e5e5 (today's App root). Not a utility. */
  :root {
    --body-text: var(--color-base-content);
    color-scheme: light;
  }

  .dark {
    --color-base-100: #141414;
    --color-base-200: #0a0a0a;
    --color-base-300: #1a1a1a;
    --color-base-content: #fafafa;
    --color-base-content-body: #d4d4d4;
    --color-base-content-secondary: #a3a3a3;
    --color-base-content-muted: #8e8e8e;
    --color-base-content-subtle: #525252;
    --color-base-border: #262626;
    --color-base-border-strong: #333333;

    --color-primary: #ffffff;
    --color-primary-content: #0a0a0a;
    --color-secondary: #d4d4d4;
    --color-secondary-content: #0a0a0a;
    --color-neutral: #262626;
    --color-neutral-content: #e5e5e5;

    --color-info: oklch(74.6% 0.16 232.661);
    --color-info-content: #0a0a0a;
    --color-success: oklch(76.5% 0.177 163.223);
    --color-success-content: #0a0a0a;
    --color-warning: oklch(82.8% 0.189 84.429);
    --color-warning-content: #0a0a0a;
    --color-error: oklch(71.2% 0.194 13.428);
    --color-error-content: #0a0a0a;
    --color-business: oklch(82.8% 0.189 84.429);
    --color-business-content: #0a0a0a;
    --color-engineer: oklch(67.3% 0.182 276.935);
    --color-engineer-content: #0a0a0a;

    --color-data-1: oklch(70.7% 0.165 254.624);
    --color-data-2: oklch(71.4% 0.203 305.504);
    --color-data-3: oklch(71.8% 0.202 349.761);
    --color-data-4: oklch(74.6% 0.16 232.661);
    --color-data-5: oklch(71.2% 0.194 13.428);
    --color-data-content: #0a0a0a;

    --body-text: #e5e5e5;
    color-scheme: dark;
  }

  @media (width >= 40rem) {
    :root {
      --spacing-page: 1.5rem;
      --spacing-box: 1rem;
      --spacing-box-dense: 0.75rem;
      --spacing-box-spacious: 1.5rem;
      --spacing-section: 1.5rem;
      --spacing-stack: 0.75rem;
      --radius-field: 0.75rem;
      --radius-box: 1rem;
      --radius-selector: 0.5rem;
    }
  }

  @media (width >= 64rem) {
    :root {
      --spacing-page: 2rem;
      --spacing-box: 1.25rem;
      --spacing-box-dense: 0.875rem;
      --spacing-box-spacious: 2rem;
      --spacing-section: 2rem;
    }
  }

  body {
    font-family: var(--font-sans);
    background-color: var(--color-base-200);
    color: var(--body-text);
    transition: background-color 0.2s ease, color 0.2s ease;
    -webkit-font-smoothing: antialiased;
  }
}
```

The `:root` block must stay **before** `.dark` (same specificity; the later one wins on `<html>`).

- [ ] **Step 4: Delete the dead utilities and retarget `.label` and the scrollbars**

In the rest of `src/index.css`:
1. Delete from the comment `/* Design Token Utility Classes */` down to (not including) `.label {` — this removes
   `.token-card`, its media query, `.token-card-elevated`, its media query, `.token-card-interactive`, its `:hover`, and
   `.token-label-mono`.
2. In `.label { … }` replace `color: var(--text-muted);` with `color: var(--color-base-content-muted);`.
3. Delete the whole `.accent-box { … }` rule.
4. Replace the four scrollbar thumb rules (`::-webkit-scrollbar-thumb`, `.dark ::-webkit-scrollbar-thumb`,
   `::-webkit-scrollbar-thumb:hover`, `.dark ::-webkit-scrollbar-thumb:hover`) with:

```css
::-webkit-scrollbar-thumb {
  background: var(--color-base-border-strong);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-base-content-subtle);
}
```

Keep the anchor-offset block, `::-webkit-scrollbar`, `::-webkit-scrollbar-track`, `.fig-scope` and `.dark .fig-scope` unchanged.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ui/themeTokens.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 6: Check the compiled CSS (Review Focus 1)**

Run:
```bash
printf '%s\n' 'export const Probe = () => <div className="p-box bg-base-100 bg-success/10" />;' > src/tokenProbe.tsx
npm run build >/dev/null && CSS=$(ls dist/assets/*.css) && \
grep -o '\.p-box{padding:var(--spacing-box)}' $CSS && \
grep -o '\.dark{--color-base-100:#141414' $CSS && \
grep -o '@media (width>=40rem){:root{--spacing-page:1.5rem;--spacing-box:1rem' $CSS
rm src/tokenProbe.tsx
```
Expected: three matching lines printed, in that order. No output for one of them means the override is not reaching the
utilities — fix `index.css` before continuing.

- [ ] **Step 7: Run the completion gate**

Run: `npm run lint && npm test`
Expected: tsc clean; all test files pass.

- [ ] **Step 8: Commit**

```bash
git add src/index.css src/components/ui/themeTokens.test.ts
git commit -m "feat: design tokens in index.css with dark and breakpoint overrides"
```

---

### Task 2: Guardrail test with a ratchet baseline

**Files:**
- Test: `src/components/ui/colorTokens.test.ts` (new)

**Interfaces:**
- Consumes: nothing.
- Produces: `export const RULES: Record<string, RegExp>`, `export function violations(src: string): { line: number; text: string }[]`, and a `const BASELINE: Record<string, number>` keyed by path relative to `src/` (`'components/GuideTab.tsx'`, `'App.tsx'`). Tasks 3–7 delete keys; Task 19 deletes the mechanism.

- [ ] **Step 1: Write the test with an empty baseline**

Create `src/components/ui/colorTokens.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Guard (spec §12): components take every colour from the design tokens in src/index.css. Scans the
 * non-test .tsx under src/components/ (except ui/) and src/App.tsx for arbitrary hex classes, hex in
 * SVG attributes / styles / data strings, `dark:` colour classes, and raw Tailwind palette colours.
 * Reads the source, not a render, so it needs no DOM.
 */

const SRC = join(process.cwd(), 'src');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === 'ui' ? [] : sourceFiles(p);
    return p.endsWith('.tsx') && !p.includes('.test.') ? [p] : [];
  });
}

const HUES = 'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';
const UTIL = 'bg|text|border(?:-[trblxyse])?|ring(?:-offset)?|divide|placeholder|fill|stroke|from|via|to|outline|decoration|caret|shadow|accent';
const TOKEN = 'base-|primary|secondary|accent|neutral|info|success|warning|error|business|engineer|data-';

export const RULES: Record<string, RegExp> = {
  hexClass: /-\[#[0-9a-fA-F]{3,8}\]/g,
  hexAttr: /(?<![\w-])(?:fill|stroke|stopColor|color)=["{]*#[0-9a-fA-F]{3,8}/g,
  hexString: /['"]#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?(?:[0-9a-fA-F]{2})?['"]/g,
  darkColor: new RegExp(`dark:(?:[\\w-]+:)*(?:${UTIL})-(?:\\[#|white\\b|black\\b|(?:${HUES})-\\d|${TOKEN})`, 'g'),
  palette: new RegExp(`(?<![\\w-])(?:${UTIL})-(?:${HUES})-\\d{2,3}\\b`, 'g'),
  whiteBlack: new RegExp(`(?<![\\w-])(?:${UTIL})-(?:white|black)\\b`, 'g'),
};

/** Offending class tokens in `src`: every rule match, counted once per whitespace/quote-delimited token. */
export function violations(src: string): { line: number; text: string }[] {
  const starts = new Map<number, string>();
  for (const re of Object.values(RULES)) {
    for (const m of src.matchAll(new RegExp(re.source, 'g'))) {
      let s = m.index;
      while (s > 0 && !/[\s"'`{}]/.test(src[s - 1])) s--;
      let e = m.index + m[0].length;
      while (e < src.length && !/[\s"'`{}]/.test(src[e])) e++;
      if (!starts.has(s)) starts.set(s, src.slice(s, e));
    }
  }
  return [...starts].sort((a, b) => a[0] - b[0]).map(([s, text]) => ({ line: src.slice(0, s).split('\n').length, text }));
}

/**
 * Ratchet (spec §12): files not yet migrated, with their exact violation count. A migration task
 * fixes a file and deletes its line here in the same commit; a count that drifts either way fails.
 */
const BASELINE: Record<string, number> = {
};

describe('colour tokens only', () => {
  const files = [...sourceFiles(join(SRC, 'components')), join(SRC, 'App.tsx')].map(f => {
    const src = readFileSync(f, 'utf8');
    return { file: relative(SRC, f), src, found: violations(src) };
  });

  it('finds what it guards (not passing on an empty scan)', () => {
    expect(files.length).toBeGreaterThan(60);
    expect(files.some(f => f.file === 'App.tsx')).toBe(true);
    expect(files.some(f => f.file.startsWith('components/ui/'))).toBe(false);
  });

  it('each rule catches its fixture, and tokens pass', () => {
    const hit = (s: string) => violations(s).map(v => v.text);
    expect(hit('"text-neutral-900 dark:text-[#fafafa]"')).toEqual(['text-neutral-900', 'dark:text-[#fafafa]']);
    expect(hit('<text fill="#ffffff">')).toEqual(['fill="#ffffff']);
    expect(hit("{ stroke: '#10b981' }")).toEqual(["'#10b981'"]);
    expect(hit('"dark:bg-base-100"')).toEqual(['dark:bg-base-100']);
    expect(hit('"hover:bg-rose-500/10 border-slate-200"')).toEqual(['hover:bg-rose-500/10', 'border-slate-200']);
    expect(hit('"bg-black/60 text-white"')).toEqual(['bg-black/60', 'text-white']);
    expect(hit('"bg-neutral text-neutral-content bg-base-100 text-error dark:hidden dark:text-sm fill-data-1"')).toEqual([]);
    expect(hit('บทที่ #A1024 และ href="#faq"')).toEqual([]);
  });

  it('a file outside the baseline has no raw colour', () => {
    const bad = files.filter(f => !(f.file in BASELINE) && f.found.length)
      .flatMap(f => f.found.slice(0, 5).map(v => `${f.file}:${v.line} ${v.text}`));
    expect(bad).toEqual([]);
  });

  it('a baselined file still has exactly its recorded count (lower the baseline when you fix one)', () => {
    const drift = files.filter(f => f.file in BASELINE && f.found.length !== BASELINE[f.file])
      .map(f => `${f.file}: baseline ${BASELINE[f.file]}, found ${f.found.length}`);
    expect(drift).toEqual([]);
    const gone = Object.keys(BASELINE).filter(k => !files.some(f => f.file === k));
    expect(gone).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/colorTokens.test.ts`
Expected: FAIL in "a file outside the baseline has no raw colour", listing e.g. `components/AIAssistantTab.tsx:…`
(42 files). The two fixture tests pass, which proves the scan is not empty.

- [ ] **Step 3: Fill the baseline with today's counts**

Replace `const BASELINE: Record<string, number> = {\n};` with:

```ts
const BASELINE: Record<string, number> = {
  'components/AIAssistantTab.tsx': 149,
  'components/ChapterDiagram.tsx': 669,
  'components/FrictionFaqSection.tsx': 120,
  'components/FrictionPlaybookCard.tsx': 204,
  'components/GamificationTab.tsx': 120,
  'components/GuideTab.tsx': 379,
  'components/Header.tsx': 136,
  'components/ProtocolSimulator.tsx': 103,
  'components/QuizTab.tsx': 107,
  'components/RoleMindsetCard.tsx': 106,
  'components/content/ContentBlocks.tsx': 54,
  'components/content/ContentTable.tsx': 48,
  'components/content/InlineTerm.tsx': 20,
  'components/content/RichText.tsx': 8,
  'components/diagrams/DiagramFamilyGrid.tsx': 20,
  'components/diagrams/SwimlaneVsSequence.tsx': 26,
  'components/figures/shared/FigurePanels.tsx': 2,
  'components/glossary/GlossaryCategoryMap.tsx': 24,
  'components/glossary/GlossaryPanel.tsx': 48,
  'components/guide/ChapterHero.tsx': 43,
  'components/guide/FirstVisitCard.tsx': 26,
  'components/guide/HeroFigure.tsx': 12,
  'components/guide/IndexEmptyState.tsx': 8,
  'components/guide/LayerGroup.tsx': 8,
  'components/guide/SectionOutline.tsx': 26,
  'components/guide/TrackFooter.tsx': 18,
  'components/guide/TrackPanel.tsx': 26,
  'components/guide/sections/ChecklistSection.tsx': 36,
  'components/guide/sections/CoreConceptsSection.tsx': 40,
  'components/guide/sections/DiagramSection.tsx': 72,
  'components/guide/sections/DialogueSection.tsx': 66,
  'components/guide/sections/ExamplesSection.tsx': 65,
  'components/guide/sections/FaqSection.tsx': 24,
  'components/guide/sections/GlossarySection.tsx': 24,
  'components/guide/sections/JargonSection.tsx': 50,
  'components/guide/sections/OtherSideSection.tsx': 72,
  'components/guide/sections/PitfallsSection.tsx': 35,
  'components/guide/sections/PrimerSection.tsx': 45,
  'components/guide/sections/ReferenceSection.tsx': 24,
  'components/guide/sections/WorkflowSection.tsx': 36,
  'components/quiz/QuizResultScreen.tsx': 71,
  'App.tsx': 23,
};
```

(Total 3,193 — spec §1 measured 3,180 with a coarser count.) If a count differs by a few because a file changed after
`b9e688c`, use the number the drift message reports; the ratchet only needs today's truth.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/colorTokens.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/colorTokens.test.ts
git commit -m "test: colour-token guardrail with a per-file ratchet baseline"
```

---

### Task 3: Phase 1 — mapping script, App shell and Header

**Files:**
- Create (not committed): `work/design-tokens/map-colors.mjs`
- Modify: `src/App.tsx` (classes only), `src/components/Header.tsx` (classes only)
- Test: `src/components/ui/colorTokens.test.ts` (baseline keys removed)

**Interfaces:**
- Consumes: tokens from Task 1; `BASELINE` from Task 2.
- Produces: `node work/design-tokens/map-colors.mjs [--<hue>=<token>]… <file>…` — rewrites files in place, prints each class it could not map as `file:line class`, and prints `N unmapped` on stderr. Default hue map: `emerald→success, indigo→engineer, sky→info, amber→warning, orange→warning, rose→error, blue→data-1, purple→data-2, pink→data-3`; slate is treated as neutral. Tasks 4–7 run it.

- [ ] **Step 1: Make the test fail for these two files**

In `src/components/ui/colorTokens.test.ts` delete the `BASELINE` lines for `'components/Header.tsx'` and `'App.tsx'`.

Run: `npx vitest run src/components/ui/colorTokens.test.ts`
Expected: FAIL in "a file outside the baseline has no raw colour" with `App.tsx:322 bg-[#fafafa]` and `components/Header.tsx:30 bg-neutral-900` among the first entries.

- [ ] **Step 2: Create the mapping script**

Create `work/design-tokens/map-colors.mjs` (git-ignored, spec §11):

```js
#!/usr/bin/env node
// One-off Phase 1 migration (spec §7.1–7.5). Rewrites raw color classes to design tokens in place.
// Usage: node work/design-tokens/map-colors.mjs [--sky=data-4] [--rose=data-5] <file>...
// Pairs a light class with its `dark:` twin inside one string segment (text between quotes), maps
// the pair by §7, and deletes the `dark:` twin. Prints every class it could not map as file:line.
import { readFileSync, writeFileSync } from 'node:fs';

const NEUTRAL_HEX = { 50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4', 400: '#a3a3a3', 500: '#737373',
  600: '#525252', 700: '#404040', 800: '#262626', 900: '#171717', 950: '#0a0a0a' };
const HUE_TOKEN = { emerald: 'success', indigo: 'engineer', sky: 'info', amber: 'warning', orange: 'warning',
  rose: 'error', blue: 'data-1', purple: 'data-2', pink: 'data-3' };
for (const arg of process.argv.slice(2).filter(a => a.startsWith('--'))) {
  const [hue, token] = arg.slice(2).split('=');
  HUE_TOKEN[hue] = token;
}
const files = process.argv.slice(2).filter(a => !a.startsWith('--'));

const KIND = '(bg|text|border(?:-[trblxy])?|divide|ring-offset|ring|placeholder|decoration|fill|stroke|from|via|to|accent|shadow)';
// variants, optional dark:, kind, value (palette step, white/black, or arbitrary hex), optional alpha
const CLASS = new RegExp(`^((?:[\\w-]+:)*?)(dark:)?((?:[\\w-]+:)*)${KIND}-((?:slate|neutral|${Object.keys(HUE_TOKEN).join('|')})-\\d{2,3}|white|black|\\[#[0-9a-fA-F]{3,8}\\])(?:/(\\d+))?$`);

function parse(cls) {
  const m = cls.match(CLASS);
  if (!m) return null;
  const variants = (m[1] + m[3]);
  let value = m[5].replace(/^slate-850$/, 'neutral-800').replace(/^slate-/, 'neutral-');
  return { cls, variants, dark: !!m[2], kind: m[4], value, alpha: m[6] ?? null };
}
/** A dark value as lowercase 6-digit hex, so `dark:text-neutral-400` and `dark:text-[#a3a3a3]` look the same. */
function hex(value) {
  if (value === 'white') return '#ffffff';
  if (value === 'black') return '#000000';
  const n = value.match(/^neutral-(\d+)$/);
  if (n) return NEUTRAL_HEX[n[1]];
  const h = value.match(/^\[(#[0-9a-fA-F]+)\]$/);
  if (!h) return null;
  const s = h[1].toLowerCase();
  return s.length === 4 ? `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}` : s;
}
const step = value => Number(value.match(/-(\d+)$/)?.[1] ?? NaN);
const hueOf = value => value.match(/^([a-z]+)-\d+$/)?.[1];
const LIGHT_TEXT = ['#fafafa', '#ffffff', '#f5f5f5', '#e5e5e5'];

/** §7.1–7.3: a neutral light value (+ its dark twin's hex) to a token name, or null when §7 has no row. */
function neutralToken(kind, light, dark, alpha) {
  const base = kind.replace(/^border-[trblxy]$/, 'border').replace(/^divide$/, 'border');
  const s = light === 'white' ? 'white' : light === 'black' ? 'black'
    : light.startsWith('[') ? (hex(light) === '#fafafa' ? 'canvas' : Number(Object.keys(NEUTRAL_HEX).find(k => NEUTRAL_HEX[k] === hex(light))))
    : step(light);
  // A dark-only panel (no `dark:` twin, e.g. a terminal strip) is dark chrome in both themes.
  if (!dark && base === 'bg' && s >= 900) return 'neutral';
  if (!dark && base === 'border' && s >= 800) return 'neutral';
  if (!dark && base === 'text' && s <= 200) return 'neutral-content';
  if (base === 'text' || base === 'fill' || base === 'stroke' || base === 'decoration') {
    if (s === 'white') return dark === '#0a0a0a' ? 'primary-content' : null;
    if (base === 'decoration') return s >= 800 ? 'base-content' : 'base-content-subtle';
    if (s >= 900) return 'base-content';
    if (s === 800) return dark && !LIGHT_TEXT.includes(dark) ? 'base-content-body' : 'base-content';
    if (s === 700) return dark === '#a3a3a3' ? 'base-content-secondary' : 'base-content-body';
    if (s === 600) return 'base-content-secondary';
    if (s === 500 || s === 400) return 'base-content-muted';
    if (s === 300) return 'base-content-subtle';
    return null;
  }
  if (base === 'placeholder') return 'base-content-subtle';
  if (base === 'bg' || base === 'from' || base === 'via' || base === 'to') {
    if (s === 'canvas') return 'base-200';
    if (s === 'white') return alpha ? 'base-100/90' : 'base-100';
    if (s === 'black') return 'neutral/60';
    if (s === 50) return dark === '#111111' || dark === '#141414' ? 'base-100' : 'base-300';
    if (s === 100) return dark === '#202020' ? 'base-100' : 'base-300';
    if (s === 200) return 'base-border';
    if (s === 300) return 'base-border-strong';
    if (s >= 900) return 'primary';
    if (s === 800) return 'primary/90';
    if (s === 700) return 'secondary';
    return null;
  }
  if (base === 'border' || base === 'divide') {
    if (s === 100 || s === 200) return 'base-border';
    if (s >= 300 && s <= 500) return 'base-border-strong';
    if (s >= 900) return 'primary';
    return null;
  }
  if (base === 'ring') return s >= 900 ? 'primary' : 'base-border-strong';
  if (base === 'ring-offset') return s === 'white' ? 'base-100' : null;
  return null;
}

/** §7.4/7.5: a chromatic light class to its token class body (without variants), or null. */
function chromaticToken(kind, value, alpha) {
  const t = HUE_TOKEN[hueOf(value)];
  const s = step(value);
  const a = alpha ? Number(alpha) : null;
  const base = kind.replace(/^border-[trblxy]$/, 'border');
  if (base === 'text' || base === 'fill' || base === 'stroke' || base === 'ring' || base === 'accent') return `${kind}-${t}`;
  if (base === 'shadow') return `${kind}-${t}/10`;
  if (base === 'bg' || base === 'from' || base === 'via' || base === 'to') {
    if (s <= 100 || (a !== null && a <= 20)) return `${kind}-${t}/10`;
    if (s === 200 || (a !== null && a <= 30)) return `${kind}-${t}/15`;
    if (s >= 900 && a !== null) return `${kind}-${t}/10`;
    return `${kind}-${t}`;
  }
  if (base === 'border' || base === 'divide') {
    if (a !== null && a >= 40) return `${kind}-${t}/40`;
    if (a !== null || s <= 300) return `${kind}-${t}/25`;
    return `${kind}-${t}`;
  }
  return null;
}

const unmapped = [];
function mapSegment(seg, where) {
  const tokens = seg.split(/(\s+)/);
  const parsed = tokens.map(t => (/\s/.test(t) || !t ? null : parse(t)));
  const drop = new Set();
  // A chromatic solid fill in this segment: its `text-white` becomes `text-{t}-content`.
  const solids = parsed.filter(p => p && !p.dark && !p.variants && p.kind === 'bg' && HUE_TOKEN[hueOf(p.value)] !== undefined
    && !(chromaticToken(p.kind, p.value, p.alpha) ?? '/').includes('/'));
  const solid = solids.length === 1 ? HUE_TOKEN[hueOf(solids[0].value)] : null;
  parsed.forEach((p, i) => {
    if (!p || p.dark) return;
    const twinIdx = parsed.findIndex(q => q && q.dark && q.kind === p.kind && q.variants === p.variants && !drop.has(parsed.indexOf(q)));
    const twin = twinIdx >= 0 ? parsed[twinIdx] : null;
    if (twin) drop.add(twinIdx);
    const chromatic = HUE_TOKEN[hueOf(p.value)] !== undefined;
    let out = null;
    if (chromatic) {
      out = chromaticToken(p.kind, p.value, p.alpha);
      // A hover on a solid fill darkens today (600 → 700); keep a visible change with the token.
      if (out && p.kind === 'bg' && p.variants.includes('hover:') && !out.includes('/')) out += '/90';
    } else if (p.cls === 'text-white' && solid) {
      out = `text-${solid.startsWith('data-') ? 'data' : solid}-content`;
    } else {
      const tok = neutralToken(p.kind, p.value, twin ? hex(twin.value) : null, p.alpha);
      out = tok ? `${p.kind}-${tok}` : null;
    }
    if (!out) { unmapped.push(`${where} ${p.cls}${twin ? ` + ${twin.cls}` : ''}`); return; }
    tokens[i] = p.variants + out;
    if (twin) {
      // Delete the twin and one space next to it (the following one, so indentation survives).
      tokens[twinIdx] = '';
      if (/^\s+$/.test(tokens[twinIdx + 1] ?? '')) tokens[twinIdx + 1] = '';
      else if (/^\s+$/.test(tokens[twinIdx - 1] ?? '')) tokens[twinIdx - 1] = '';
    }
  });
  parsed.forEach((p, i) => {
    if (p && p.dark && !drop.has(i)) unmapped.push(`${where} ${p.cls} (no light twin)`);
  });
  let out = tokens.join('');
  if (!/\s$/.test(seg)) out = out.trimEnd();
  if (!/^\s/.test(seg)) out = out.trimStart();
  return out;
}

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const next = lines.map((line, n) =>
    line.split(/(['"`])/).map((seg, i) => (i % 2 === 1 ? seg : mapSegment(seg, `${file}:${n + 1}`))).join(''));
  writeFileSync(file, next.join('\n'));
}
for (const u of unmapped) console.log(u);
console.error(`${unmapped.length} unmapped`);
```

- [ ] **Step 3: Run the script on the shell files**

Run: `node work/design-tokens/map-colors.mjs src/App.tsx src/components/Header.tsx`
Expected output (6 lines, then `6 unmapped` on stderr):
```
src/App.tsx:325 text-white
src/App.tsx:325 border-neutral-800 + dark:border-[#262626]
src/App.tsx:330 text-white
src/App.tsx:339 hover:text-white
src/components/Header.tsx:236 text-white
src/components/Header.tsx:248 text-white
```
Review `git diff --stat`: only these two files change, and the line count of each is unchanged.

- [ ] **Step 4: Hand edits the script cannot decide**

Amber in these files (§7.4): Header.tsx:198 (`Zap`, XP) and :296 (`Sparkles`, Quiz tab icon) → `warning` — the script
already wrote `text-warning fill-warning` / `text-warning`; leave them.

`src/App.tsx`:
- Line 322 (App root, spec §4 "Default text colour"): the class becomes exactly
  `className="min-h-screen bg-base-200 font-sans antialiased transition-colors duration-200"` (drop `text-base-content`).
- Toast (spec §7.2, §10.5 → `bg-neutral text-neutral-content`). Replace the classes on these lines exactly:
  - 325: `className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-neutral text-neutral-content rounded-[4px] shadow-2xl border border-neutral animate-slideUp"`
  - 326: `className="w-7 h-7 rounded-[3px] bg-neutral-content text-neutral flex items-center justify-center font-bold shrink-0 text-xs"`
  - 330: `className="font-bold text-xs sm:text-sm text-neutral-content"`
  - 333: `className="text-[11px] text-neutral-content/70 font-normal"`
  - 339: `className="text-neutral-content/60 hover:text-neutral-content cursor-pointer p-1"`
- Footer (slate, lines ~423–429): the script mapped it to `border-base-border`, `text-base-content-muted`, `text-base-content-body`, `text-base-content-secondary`; leave as mapped.

`src/components/Header.tsx` lines 236 and 248: replace `'bg-primary text-white shadow-2xs font-bold'` with
`'bg-primary text-primary-content shadow-2xs font-bold'` (Phase 3 turns these into soft segments).

- [ ] **Step 5: Run the guardrail to verify it passes**

Run: `npx vitest run src/components/ui/colorTokens.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass (`tapTargets.test.ts` included: the script never touches `TAP*` references).

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/components/Header.tsx src/components/ui/colorTokens.test.ts
git commit -m "refactor: App shell and Header colours come from design tokens"
```

---

### Task 4: Phase 1 — Guide reader, guide parts and sections

**Files:**
- Modify (classes only): `src/components/GuideTab.tsx`; `src/components/guide/{ChapterHero,FirstVisitCard,HeroFigure,IndexEmptyState,LayerGroup,SectionOutline,TrackFooter,TrackPanel}.tsx`; `src/components/guide/sections/{Checklist,CoreConcepts,Diagram,Dialogue,Examples,Faq,Glossary,Jargon,OtherSide,Pitfalls,Primer,Reference,Workflow}Section.tsx`
- Test: `src/components/ui/colorTokens.test.ts` (baseline keys removed)

**Interfaces:**
- Consumes: `work/design-tokens/map-colors.mjs` (Task 3), tokens (Task 1).
- Produces: no new symbols.

- [ ] **Step 1: Make the test fail for these files**

Delete these 22 `BASELINE` lines: `components/GuideTab.tsx`, `components/guide/ChapterHero.tsx`, `FirstVisitCard`,
`HeroFigure`, `IndexEmptyState`, `LayerGroup`, `SectionOutline`, `TrackFooter`, `TrackPanel` (all under
`components/guide/`), and the 13 `components/guide/sections/*Section.tsx` lines.

Run: `npx vitest run src/components/ui/colorTokens.test.ts`
Expected: FAIL listing `components/GuideTab.tsx:…` and `components/guide/…` violations.

- [ ] **Step 2: Run the script**

Run: `node work/design-tokens/map-colors.mjs src/components/GuideTab.tsx src/components/guide/*.tsx src/components/guide/sections/*.tsx`
Expected: stderr `0 unmapped`. (`guide/*.tsx` includes the `*.test.tsx` files; they hold no colour classes and stay byte-identical — confirm with `git diff --stat`.)

- [ ] **Step 3: Confirm the hue judgements (spec §7.4)**

All defaults are correct here; check each site in the diff reads as below and change nothing:

| Site | Old | Token | Why |
|---|---|---|---|
| GuideTab.tsx:353, 378, 506, 953 | `text-amber-500` icons (Sparkles, GraduationCap, BookmarkCheck) | `text-warning` | decoration/bookmark, not a role |
| GuideTab.tsx:597 | bookmarked button `amber-50/300/600` | `bg-warning/10 border-warning/25 text-warning` | bookmark state |
| ChapterHero.tsx:34 | `text-amber-500` Sparkles | `text-warning` | decoration |
| ExamplesSection.tsx:56, 57, 60 | rose box/heading/text | `error` | "bad example" = failure |
| ExamplesSection.tsx:76, PrimerSection.tsx:61 | `text-amber-500` Lightbulb | `text-warning` | decoration |
| DialogueSection.tsx:39, 40, 41, 44, 50 | rose | `error` | the misunderstanding line = risk |
| OtherSideSection.tsx:65 | `text-amber-700 dark:text-amber-300` "…ได้ยินว่า" | `text-warning` | what the other side mishears, either role |
| PitfallsSection.tsx:36, 38, 39 | rose | `error` | pitfalls = risk |

- [ ] **Step 4: Run the guardrail to verify it passes**

Run: `npx vitest run src/components/ui/colorTokens.test.ts`
Expected: PASS

- [ ] **Step 5: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/GuideTab.tsx src/components/guide src/components/ui/colorTokens.test.ts
git commit -m "refactor: Guide reader and sections colours come from design tokens"
```

---

### Task 5: Phase 1 — Quiz, AI and Gamification

**Files:**
- Modify (classes only): `src/components/QuizTab.tsx`, `src/components/quiz/QuizResultScreen.tsx`, `src/components/AIAssistantTab.tsx`, `src/components/GamificationTab.tsx`, `src/data/badgesData.ts:55-59`
- Test: `src/components/ui/colorTokens.test.ts`

**Interfaces:**
- Consumes: `map-colors.mjs` (Task 3).
- Produces: `LEVEL_TIERS[n].color` values are token classes (`text-base-content-secondary`, `text-data-1`, `text-engineer`, `text-success`, `text-warning`).

- [ ] **Step 1: Make the test fail for these files**

Delete the `BASELINE` lines for `components/QuizTab.tsx`, `components/quiz/QuizResultScreen.tsx`,
`components/AIAssistantTab.tsx`, `components/GamificationTab.tsx`.

Run: `npx vitest run src/components/ui/colorTokens.test.ts`
Expected: FAIL listing violations in those four files.

- [ ] **Step 2: Run the script**

Run: `node work/design-tokens/map-colors.mjs src/components/QuizTab.tsx src/components/quiz/QuizResultScreen.tsx src/components/AIAssistantTab.tsx src/components/GamificationTab.tsx`
Expected unmapped lines (plus the count on stderr):
```
src/components/AIAssistantTab.tsx:199 text-white
src/components/AIAssistantTab.tsx:200 dark:text-[#0a0a0a] (no light twin)
src/components/GamificationTab.tsx:229 border-neutral-700 + dark:border-neutral-300
src/components/GamificationTab.tsx:229 text-neutral-200 + dark:text-neutral-800
```
`QuizResultScreen.tsx` slate classes are mapped as neutral (§7.5).

- [ ] **Step 3: Hand edits**

`src/components/AIAssistantTab.tsx` lines 199–200 (avatar; Phase 3 makes it an IconBadge). Replace
```tsx
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  isAi ? 'bg-primary dark:text-[#0a0a0a]' : 'bg-secondary'
```
with
```tsx
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isAi ? 'bg-primary text-primary-content' : 'bg-secondary text-secondary-content'
```

`src/components/GamificationTab.tsx` (the inverse CTA card on a `bg-primary` surface, Phase 3 replaces it):
- Line 216: `className="text-xs sm:text-sm text-base-content-subtle"` → `className="text-xs sm:text-sm text-primary-content/70"`.
- Line 229: the whole `className` becomes
  ``className={`${TAP} px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-primary-content/30 text-primary-content text-xs sm:text-sm font-semibold hover:bg-primary-content/10 transition-all cursor-pointer`}``

`src/data/badgesData.ts` `LEVEL_TIERS` `color` values (lines 55–59), in order:
`'text-base-content-secondary'`, `'text-data-1'`, `'text-engineer'`, `'text-success'`, `'text-warning'`.

Hue judgements (defaults, confirm in the diff): QuizTab.tsx:212–213 amber XP → `warning`; QuizTab.tsx:251, 269, 282
rose wrong answer → `error`; AIAssistantTab.tsx:127 (fallback notice), 140, 173 (icons), 268 ("Gemini Model") →
`warning`; GamificationTab.tsx:82–83 (XP), 95, 133 (Trophy) → `warning`; QuizResultScreen.tsx:36, 63, 64 → `warning`.

- [ ] **Step 4: Run the guardrail to verify it passes**

Run: `npx vitest run src/components/ui/colorTokens.test.ts`
Expected: PASS

- [ ] **Step 5: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass (QuizTab/QuizResultScreen tests assert text and `aria-pressed`, not classes).

- [ ] **Step 6: Commit**

```bash
git add src/components/QuizTab.tsx src/components/quiz/QuizResultScreen.tsx src/components/AIAssistantTab.tsx src/components/GamificationTab.tsx src/data/badgesData.ts src/components/ui/colorTokens.test.ts
git commit -m "refactor: Quiz, AI and Gamification colours come from design tokens"
```

---

### Task 6: Phase 1 — Glossary, content blocks, friction and mindset cards, diagram helpers

**Files:**
- Modify (classes only): `src/components/glossary/{GlossaryPanel,GlossaryCategoryMap}.tsx`, `src/components/content/{ContentBlocks,ContentTable,InlineTerm,RichText}.tsx`, `src/components/{FrictionFaqSection,FrictionPlaybookCard,RoleMindsetCard}.tsx`, `src/components/diagrams/{DiagramFamilyGrid,SwimlaneVsSequence}.tsx`, `src/components/figures/shared/FigurePanels.tsx`
- Test: `src/components/ui/colorTokens.test.ts`

**Interfaces:**
- Consumes: `map-colors.mjs` (Task 3).
- Produces: nothing new. (`GlossaryPanel` keeps importing `tokens` from `styles/tokens.ts` until Task 17; those classes live in a `.ts` file the guardrail does not scan.)

- [ ] **Step 1: Make the test fail for these files**

Delete the 12 `BASELINE` lines for the files listed above.

Run: `npx vitest run src/components/ui/colorTokens.test.ts`
Expected: FAIL listing violations in those files.

- [ ] **Step 2: Run the script**

Run: `node work/design-tokens/map-colors.mjs src/components/glossary/GlossaryPanel.tsx src/components/glossary/GlossaryCategoryMap.tsx src/components/content/ContentBlocks.tsx src/components/content/ContentTable.tsx src/components/content/InlineTerm.tsx src/components/content/RichText.tsx src/components/FrictionFaqSection.tsx src/components/FrictionPlaybookCard.tsx src/components/RoleMindsetCard.tsx src/components/diagrams/DiagramFamilyGrid.tsx src/components/diagrams/SwimlaneVsSequence.tsx src/components/figures/shared/FigurePanels.tsx`
Expected: stderr `0 unmapped`.

- [ ] **Step 3: Hue judgements**

The Business-role amber in RoleMindsetCard (the Business tab label and its Briefcase icon) must be `business`, not the
default `warning`:

Run: `sed -i '' '77s/text-warning/text-business/;81s/text-warning/text-business/' src/components/RoleMindsetCard.tsx`
Then check: `sed -n '77p;81p' src/components/RoleMindsetCard.tsx` shows `text-business` on both lines.

Defaults to confirm in the diff (change nothing): RoleMindsetCard.tsx:133–141 "สิ่งที่เขากังวลหรือกลัว" → `warning`;
RoleMindsetCard purple → `data-2`, indigo → `engineer`; FrictionPlaybookCard.tsx amber (47, 55, 64, 71–86, 116, 124,
133, 149–151, 210, 242, 271, 274) → `warning` (friction); FrictionPlaybookCard.tsx:143 `text-orange-500` → `text-warning`;
FrictionPlaybookCard.tsx:306, 331, 342 rose (non-optimal option) → `error`; FrictionFaqSection.tsx:256 and
ContentBlocks.tsx:19 amber callouts → `warning`; InlineTerm `[#f5f5f5]` → `text-base-content`.

- [ ] **Step 4: Run the guardrail to verify it passes**

Run: `npx vitest run src/components/ui/colorTokens.test.ts`
Expected: PASS

- [ ] **Step 5: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/glossary src/components/content src/components/FrictionFaqSection.tsx src/components/FrictionPlaybookCard.tsx src/components/RoleMindsetCard.tsx src/components/diagrams src/components/figures/shared/FigurePanels.tsx src/components/ui/colorTokens.test.ts
git commit -m "refactor: glossary, content and card colours come from design tokens"
```

---

### Task 7: Phase 1 — ChapterDiagram and ProtocolSimulator (slate, series hues, SVG hex); baseline empty

**Files:**
- Modify: `src/components/ChapterDiagram.tsx` (classes, lines 831–834, 935, 958, 971–977), `src/components/ProtocolSimulator.tsx` (classes), `src/index.css` (remove `--color-slate-850`)
- Test: `src/components/ChapterDiagram.test.tsx` (new), `src/components/ui/colorTokens.test.ts` (`BASELINE` becomes `{}`)

**Interfaces:**
- Consumes: `map-colors.mjs` (Task 3).
- Produces: `PRESSURE_LEVELS[n].stroke`/`.core` are `var(--color-…)` strings. After this task `BASELINE` is `{}`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/ChapterDiagram.test.tsx` (Review Focus 2):

```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChapterDiagram } from './ChapterDiagram';

describe('ChapterDiagram iron triangle (s11)', () => {
  const html = renderToStaticMarkup(<ChapterDiagram chapterId="s11" />);
  const svg = html.slice(html.indexOf('<svg viewBox="0 0 100 90"'), html.indexOf('</svg>', html.indexOf('<svg viewBox="0 0 100 90"')));

  it('tints the triangle with a colour-mix of the token, not hex + alpha', () => {
    expect(svg).toMatch(/<polygon[^>]*fill="color-mix\(in oklab, var\(--color-(success|engineer|warning|error)\) 15%, transparent\)"/);
    expect(svg).toMatch(/<polygon[^>]*stroke="var\(--color-(success|engineer|warning|error)\)"/);
  });

  it('labels use token fill classes and no hex remains in the figure', () => {
    for (const cls of ['fill-primary-content', 'fill-warning', 'fill-data-1', 'fill-data-2']) expect(svg).toContain(`class="${cls}"`);
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });
});
```

Delete the `BASELINE` lines for `components/ChapterDiagram.tsx` and `components/ProtocolSimulator.tsx`, leaving
`const BASELINE: Record<string, number> = {};`.

Run: `npx vitest run src/components/ChapterDiagram.test.tsx src/components/ui/colorTokens.test.ts`
Expected: FAIL — the polygon fill is `#10b98126`-style hex, and the guardrail lists `components/ChapterDiagram.tsx:…`.

- [ ] **Step 2: Run the script with sky as a series**

Run: `node work/design-tokens/map-colors.mjs --sky=data-4 src/components/ChapterDiagram.tsx src/components/ProtocolSimulator.tsx`
Expected: stderr `0 unmapped`. Terminal-style strips with no `dark:` twin (ChapterDiagram.tsx:215, 777, 925:
`bg-slate-900/950 text-slate-100/200 border-slate-800`) become `bg-neutral text-neutral-content border-neutral`.

- [ ] **Step 3: Series and SVG hand edits**

Rose used as a series (the fourth item next to blue/purple, spec §7.5 "case by case") → `data-5`:

Run: `sed -i '' '283s/text-error/text-data-5/;306s/border-error\/40/border-data-5\/40/' src/components/ChapterDiagram.tsx`
(283 = RICE "Effort:" label beside Reach/Impact/Confidence; 306 = fidelity step 4 beside blue/purple steps.)

SVG and data-string hex (spec §7.5):

Run:
```bash
sed -i '' \
  -e "831,834s/'#10b981'/'var(--color-success)'/g" \
  -e "831,834s/'#6366f1'/'var(--color-engineer)'/g" \
  -e "831,834s/'#f59e0b'/'var(--color-warning)'/g" \
  -e "831,834s/'#f43f5e'/'var(--color-error)'/g" \
  -e "935s/'#334155'/'var(--color-base-border-strong)'/" \
  -e '958s/fill={`${level.stroke}26`}/fill={`color-mix(in oklab, ${level.stroke} 15%, transparent)`}/' \
  -e '971s/fill="#ffffff"/className="fill-primary-content"/' \
  -e '975s/fill="#f59e0b"/className="fill-warning"/' \
  -e '976s/fill="#3b82f6"/className="fill-data-1"/' \
  -e '977s/fill="#a855f7"/className="fill-data-2"/' \
  src/components/ChapterDiagram.tsx
```
Check: `sed -n '958p;971p;975,977p' src/components/ChapterDiagram.tsx` shows the new `fill`/`className`s.
(`0x26` = 15% alpha, the same tint as before.)

Hue judgements left at their defaults (confirm in the diff): every other ChapterDiagram rose (119, 140, 157, 185–190,
245–246 "Must Have", 312, 354, 425, 438, 446, 461–470, 533, 539, 622–627, 685, 696, 722–733, 768–778) → `error`
(failure, risk, cost); every ChapterDiagram amber (142, 159, 195–200, 249–250 "Should Have", 467, 488, 519, 525,
587–588, 679, 833, 866, 876 `accent-warning`, 946) → `warning`; blue → `data-1` (incl. `accent-data-1` at 896),
purple → `data-2` (incl. 916), pink → `data-3`, sky 328/332/336 → `data-4`, indigo → `engineer`, emerald → `success`.
ProtocolSimulator: blue (polling) → `data-1`; amber (websocket: 79, 160–204) → `warning`; emerald (webhook) →
`success`; rose (98, 169 active "stop" state) → `error`.

- [ ] **Step 4: Remove the slate-850 token**

In `src/index.css` delete the line `  --color-slate-850: #172033;` from `@theme static`. (The script turned
`slate-850` into the `neutral-800` role, so nothing uses it; `grep -rn slate-850 src` prints nothing.)

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/ChapterDiagram.test.tsx src/components/ui/colorTokens.test.ts src/components/ui/themeTokens.test.ts`
Expected: PASS

- [ ] **Step 6: Phase 1 build check (spec §13.2)**

Run:
```bash
npm run build >/dev/null && CSS=$(ls dist/assets/*.css) && \
grep -o '\.dark{--color-base-100:#141414' $CSS && \
grep -o '@media (width>=40rem){:root{--spacing-page:1.5rem;--spacing-box:1rem' $CSS && \
grep -c 'slate' $CSS
```
Expected: the two matches, then `0`.

- [ ] **Step 7: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/ChapterDiagram.tsx src/components/ChapterDiagram.test.tsx src/components/ProtocolSimulator.tsx src/index.css src/components/ui/colorTokens.test.ts
git commit -m "refactor: diagram series and SVG colours come from tokens; colour baseline empty"
```

---

### Task 8: UI foundation and `Button`

**Files:**
- Create: `src/components/ui/types.ts`, `src/components/ui/cn.ts`, `src/components/ui/tapClass.ts`, `src/components/ui/colors.ts`, `src/components/ui/Button.tsx`
- Test: `src/components/ui/Button.test.tsx` (new); Modify: `src/components/ui/tapTargets.test.ts` (covered builders)

**Interfaces:**
- Consumes: `TAP`, `TAP_Y`, `TAP_POSITIONED`, `TAP_GAP` from `./tapTarget` (unchanged).
- Produces:
  - `types.ts`: `type Color = 'primary' | 'secondary' | 'accent' | 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'business' | 'engineer'`; `type Chromatic = Exclude<Color, 'primary' | 'secondary' | 'accent' | 'neutral'>`; `function isChromatic(c: Color): c is Chromatic`; `type Tap = 'full' | 'y' | 'positioned' | 'gap-4' | 'gap-6' | 'gap-8' | 'gap-16'`.
  - `cn.ts`: `function cn(...classes: (string | undefined | null | false)[]): string`.
  - `tapClass.ts`: `function tapClass(tap: Tap): string`.
  - `colors.ts`: `SOLID: Record<Color, string>`, `SOLID_HOVER: Record<Color, string>`, `TINT: Record<Chromatic, { soft; softHover; outline; tintHover; text; link: string }>`, `MONO_SOFT: string`.
  - `Button.tsx`: `interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> { color?: Color; variant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'link'; size?: 'xs' | 'sm' | 'md' | 'lg'; shape?: 'default' | 'square' | 'circle'; tap?: Tap; block?: boolean }` (defaults `neutral`, `outline`, `md`, `default`, `full`, `type="button"`); `function buttonClass(o: Pick<ButtonProps, 'color' | 'variant' | 'size' | 'shape' | 'tap' | 'block'>): string`; `const Button: React.FC<ButtonProps>`.

- [ ] **Step 1: Write the failing tests**

Create `src/components/ui/Button.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, buttonClass, type ButtonProps } from './Button';
import { TAP_GAP } from './tapTarget';
import type { Color, Tap } from './types';

const COLORS: Color[] = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error', 'business', 'engineer'];
const VARIANTS: NonNullable<ButtonProps['variant']>[] = ['solid', 'outline', 'soft', 'ghost', 'link'];
const SIZES: NonNullable<ButtonProps['size']>[] = ['xs', 'sm', 'md', 'lg'];
const SHAPES: NonNullable<ButtonProps['shape']>[] = ['default', 'square', 'circle'];
const TAPS: Tap[] = ['full', 'y', 'positioned', 'gap-4', 'gap-6', 'gap-8', 'gap-16'];

/** A tap ring: the 44px one, or a TAP_GAP ring. */
const hasRing = (cls: string) => cls.includes('max-sm:before:min-h-11') || Object.values(TAP_GAP).some(g => cls.includes(g));

describe('Button', () => {
  it('defaults to a neutral outline md button with a full tap ring and type="button"', () => {
    const html = renderToStaticMarkup(<Button>Go</Button>);
    expect(html).toContain('type="button"');
    expect(html).toContain('border-base-border-strong text-base-content hover:bg-base-300');
    expect(html).toContain('px-4 py-2 text-xs sm:text-sm');
    expect(html).toContain('max-sm:before:min-w-11');
  });

  it('the primary solid is the only fill that uses bg-primary', () => {
    expect(buttonClass({ color: 'primary', variant: 'solid' })).toContain('bg-primary text-primary-content border-primary hover:bg-primary/90');
    for (const c of COLORS) for (const v of VARIANTS) {
      if (c === 'primary' && v === 'solid') continue;
      expect(buttonClass({ color: c, variant: v }).split(' '), `${c} ${v}`).not.toContain('bg-primary');
    }
  });

  it('maps chromatic variants to their own hue and monochrome ones to base tokens', () => {
    expect(buttonClass({ color: 'error', variant: 'soft' })).toContain('bg-error/10 text-error border-error/25 hover:bg-error/15');
    expect(buttonClass({ color: 'success', variant: 'outline' })).toContain('border-success/40 text-success hover:bg-success/10');
    expect(buttonClass({ color: 'engineer', variant: 'ghost' })).toContain('text-engineer hover:bg-engineer/10');
    expect(buttonClass({ color: 'neutral', variant: 'soft' })).toContain('bg-base-300 text-base-content border-transparent hover:bg-base-border');
    expect(buttonClass({ color: 'neutral', variant: 'ghost' })).toContain('text-base-content-secondary hover:text-base-content hover:bg-base-300');
    expect(buttonClass({ variant: 'link' })).toContain('underline underline-offset-2 decoration-base-border-strong');
  });

  it('every colour/variant writes only token colours (no palette, hex or dark:)', () => {
    for (const c of COLORS) for (const v of VARIANTS) {
      const cls = buttonClass({ color: c, variant: v });
      expect(cls, `${c} ${v}`).not.toMatch(/dark:|-\[#|-(?:neutral|slate|amber|rose|emerald|indigo|sky)-\d/);
    }
  });

  it('every size, shape and tap combination carries a tap ring', () => {
    for (const size of SIZES) for (const shape of SHAPES) for (const tap of TAPS) {
      expect(hasRing(buttonClass({ size, shape, tap })), `${size} ${shape} ${tap}`).toBe(true);
    }
  });

  it('square and circle use icon padding; circle is round; block is full width', () => {
    expect(buttonClass({ size: 'sm', shape: 'square' })).toContain('p-1.5');
    expect(buttonClass({ size: 'sm', shape: 'square' })).not.toContain('px-3');
    expect(buttonClass({ shape: 'circle' })).toContain('rounded-full');
    expect(buttonClass({ block: true }).split(' ')).toContain('w-full');
  });

  it('passes native props through (submit type, disabled, aria, data)', () => {
    const html = renderToStaticMarkup(<Button type="submit" disabled aria-label="send" data-x="1" className="absolute">x</Button>);
    expect(html).toMatch(/^<button type="submit"[^>]* disabled=""/);
    expect(html).toContain('aria-label="send"');
    expect(html).toContain('data-x="1"');
    expect(html).toContain(' absolute"');
  });
});
```

In `src/components/ui/tapTargets.test.ts`, insert before `it('the rings only exist below sm…`:

```ts
  it('counts a tag built by a ui/ class builder as covered, and nothing else by name alone', () => {
    expect(covered('<button className={cn(buttonClass({ size }), className)}>', '')).toBe(true);
    expect(covered('<button className={chipClass({ selected, tap })}>', '')).toBe(true);
    expect(covered('<a className={`${tapClass(tap)} x`}>', '')).toBe(true);
    expect(covered('<button className={myButtonClass}>', '')).toBe(false);
    expect(covered('<button className="px-3 py-1">', '')).toBe(false);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/ui/Button.test.tsx src/components/ui/tapTargets.test.ts`
Expected: FAIL — `Failed to resolve import "./Button"`, and the new tapTargets case fails on `buttonClass`.

- [ ] **Step 3: Write the foundation**

`src/components/ui/types.ts`:
```ts
/** Design-token colour names (spec §4). Monochrome: primary, secondary, accent, neutral. */
export type Color = 'primary' | 'secondary' | 'accent' | 'neutral'
  | 'info' | 'success' | 'warning' | 'error' | 'business' | 'engineer';

/** Colours with a hue: they tint soft/outline/ghost/link variants with their own colour. */
export type Chromatic = Exclude<Color, 'primary' | 'secondary' | 'accent' | 'neutral'>;

export const isChromatic = (c: Color): c is Chromatic =>
  c !== 'primary' && c !== 'secondary' && c !== 'accent' && c !== 'neutral';

/** Mobile tap ring (see tapTarget.ts): full → TAP, y → TAP_Y, positioned → TAP_POSITIONED, gap-n → TAP_GAP[n]. */
export type Tap = 'full' | 'y' | 'positioned' | 'gap-4' | 'gap-6' | 'gap-8' | 'gap-16';
```

`src/components/ui/cn.ts`:
```ts
/** Joins class names, skipping empty values. */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
```

`src/components/ui/tapClass.ts`:
```ts
import { TAP, TAP_GAP, TAP_POSITIONED, TAP_Y } from './tapTarget';
import type { Tap } from './types';

const TAP_CLASS: Record<Tap, string> = {
  full: TAP,
  y: TAP_Y,
  positioned: TAP_POSITIONED,
  'gap-4': TAP_GAP[4],
  'gap-6': TAP_GAP[6],
  'gap-8': TAP_GAP[8],
  'gap-16': TAP_GAP[16],
};

/** The tap-ring classes for a `tap` prop. */
export function tapClass(tap: Tap): string {
  return TAP_CLASS[tap];
}
```

`src/components/ui/colors.ts`:
```ts
import type { Chromatic, Color } from './types';

/**
 * Literal class strings per colour (Tailwind finds classes by scanning source text, so no
 * `bg-${c}` templates). Shared by Button, Badge, IconBadge and Alert.
 */

/** Solid fill with its content colour and a same-colour border. */
export const SOLID: Record<Color, string> = {
  primary: 'bg-primary text-primary-content border-primary',
  secondary: 'bg-secondary text-secondary-content border-secondary',
  accent: 'bg-accent text-accent-content border-accent',
  neutral: 'bg-neutral text-neutral-content border-neutral',
  info: 'bg-info text-info-content border-info',
  success: 'bg-success text-success-content border-success',
  warning: 'bg-warning text-warning-content border-warning',
  error: 'bg-error text-error-content border-error',
  business: 'bg-business text-business-content border-business',
  engineer: 'bg-engineer text-engineer-content border-engineer',
};

/** Hover for a solid fill. */
export const SOLID_HOVER: Record<Color, string> = {
  primary: 'hover:bg-primary/90',
  secondary: 'hover:bg-secondary/90',
  accent: 'hover:bg-accent/90',
  neutral: 'hover:bg-neutral/90',
  info: 'hover:bg-info/90',
  success: 'hover:bg-success/90',
  warning: 'hover:bg-warning/90',
  error: 'hover:bg-error/90',
  business: 'hover:bg-business/90',
  engineer: 'hover:bg-engineer/90',
};

/** Per-hue tints for the soft/outline/ghost/link variants and plain coloured text. */
export const TINT: Record<Chromatic, { soft: string; softHover: string; outline: string; tintHover: string; text: string; link: string }> = {
  info: { soft: 'bg-info/10 text-info border-info/25', softHover: 'hover:bg-info/15', outline: 'border-info/40 text-info', tintHover: 'hover:bg-info/10', text: 'text-info', link: 'decoration-info/40' },
  success: { soft: 'bg-success/10 text-success border-success/25', softHover: 'hover:bg-success/15', outline: 'border-success/40 text-success', tintHover: 'hover:bg-success/10', text: 'text-success', link: 'decoration-success/40' },
  warning: { soft: 'bg-warning/10 text-warning border-warning/25', softHover: 'hover:bg-warning/15', outline: 'border-warning/40 text-warning', tintHover: 'hover:bg-warning/10', text: 'text-warning', link: 'decoration-warning/40' },
  error: { soft: 'bg-error/10 text-error border-error/25', softHover: 'hover:bg-error/15', outline: 'border-error/40 text-error', tintHover: 'hover:bg-error/10', text: 'text-error', link: 'decoration-error/40' },
  business: { soft: 'bg-business/10 text-business border-business/25', softHover: 'hover:bg-business/15', outline: 'border-business/40 text-business', tintHover: 'hover:bg-business/10', text: 'text-business', link: 'decoration-business/40' },
  engineer: { soft: 'bg-engineer/10 text-engineer border-engineer/25', softHover: 'hover:bg-engineer/15', outline: 'border-engineer/40 text-engineer', tintHover: 'hover:bg-engineer/10', text: 'text-engineer', link: 'decoration-engineer/40' },
};

/** Monochrome soft surface (selected chip, soft button, icon badge). */
export const MONO_SOFT = 'bg-base-300 text-base-content border-transparent';
```

- [ ] **Step 4: Write `Button`**

`src/components/ui/Button.tsx`:
```tsx
import React from 'react';
import { cn } from './cn';
import { MONO_SOFT, SOLID, SOLID_HOVER, TINT } from './colors';
import { tapClass } from './tapClass';
import { isChromatic, type Color, type Tap } from './types';

/**
 * Button hierarchy (spec §9):
 * 1. The main next step, at most one per view: `color="primary" variant="solid"`.
 * 2. Secondary or alternative actions: `outline` or `soft`.
 * 3. Toolbar, icon buttons, close, back, menus: `ghost`.
 * 4. Inline text actions: `link`.
 * Selected tabs/chips/filters are ToggleChips (soft), never a primary fill.
 * Write the primary as `color="primary" variant="solid"` in that order: hierarchy.test.ts counts that string.
 */
export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  color?: Color;
  variant?: 'solid' | 'outline' | 'soft' | 'ghost' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  shape?: 'default' | 'square' | 'circle';
  tap?: Tap;
  block?: boolean;
}

type ButtonStyle = Pick<ButtonProps, 'color' | 'variant' | 'size' | 'shape' | 'tap' | 'block'>;

const BASE = 'inline-flex items-center justify-center gap-1.5 font-semibold rounded-field transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-base-100 disabled:opacity-40 disabled:cursor-not-allowed';

const SIZE: Record<NonNullable<ButtonProps['size']>, { text: string; icon: string }> = {
  xs: { text: 'px-2.5 py-1 text-xs', icon: 'p-1' },
  sm: { text: 'px-3 py-1.5 text-xs', icon: 'p-1.5' },
  md: { text: 'px-4 py-2 text-xs sm:text-sm', icon: 'p-2' },
  lg: { text: 'px-6 py-3 text-sm', icon: 'p-3' },
};

function variantClass(color: Color, variant: NonNullable<ButtonProps['variant']>): string {
  if (variant === 'solid') return cn('border', SOLID[color], SOLID_HOVER[color]);
  if (!isChromatic(color)) {
    if (variant === 'outline') return 'border border-base-border-strong text-base-content hover:bg-base-300';
    if (variant === 'soft') return cn('border', MONO_SOFT, 'hover:bg-base-border');
    if (variant === 'ghost') return 'text-base-content-secondary hover:text-base-content hover:bg-base-300';
    return 'text-base-content underline underline-offset-2 decoration-base-border-strong hover:decoration-current';
  }
  const t = TINT[color];
  if (variant === 'outline') return cn('border', t.outline, t.tintHover);
  if (variant === 'soft') return cn('border', t.soft, t.softHover);
  if (variant === 'ghost') return cn(t.text, t.tintHover);
  return cn(t.text, 'underline underline-offset-2', t.link, 'hover:decoration-current');
}

/** Button classes for an element that cannot be a button element: a link or a details summary. */
export function buttonClass({ color = 'neutral', variant = 'outline', size = 'md', shape = 'default', tap = 'full', block }: ButtonStyle): string {
  return cn(
    tapClass(tap),
    BASE,
    variantClass(color, variant),
    shape === 'default' ? SIZE[size].text : SIZE[size].icon,
    shape === 'circle' && 'rounded-full',
    block && 'w-full',
  );
}

export const Button: React.FC<ButtonProps> = ({ color, variant, size, shape, tap, block, className, type = 'button', ...rest }) => (
  <button type={type} className={cn(buttonClass({ color, variant, size, shape, tap, block }), className)} {...rest} />
);
```

Do not write `<a>`, `<button>` or `<summary>` inside comments in `ui/*.tsx`: `tapTargets.test.ts` reads comments as tags.

- [ ] **Step 5: Count the builders as covered in `tapTargets.test.ts`**

In `src/components/ui/tapTargets.test.ts`, after the `LITERAL_OK` constant add:
```ts
// The ui/ class builders: each always includes a ring (ui/*.test.tsx prove it for every combination).
const UI_BUILDER = /\b(?:buttonClass|chipClass|tapClass)\(/;
```
and in `covered()` change the first line to:
```ts
  if (TAP_REF.test(tag) || LITERAL_OK.test(tag) || UI_BUILDER.test(tag)) return true;
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/components/ui/Button.test.tsx src/components/ui/tapTargets.test.ts`
Expected: PASS (7 + 8 tests)

- [ ] **Step 7: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/types.ts src/components/ui/cn.ts src/components/ui/tapClass.ts src/components/ui/colors.ts src/components/ui/Button.tsx src/components/ui/Button.test.tsx src/components/ui/tapTargets.test.ts
git commit -m "feat: ui Button with token variants and a tap ring for every size"
```

---

### Task 9: `Badge` and `IconBadge`

**Files:**
- Create: `src/components/ui/Badge.tsx`, `src/components/ui/IconBadge.tsx`
- Test: `src/components/ui/Badge.test.tsx`

**Interfaces:**
- Consumes: `cn` (Task 8), `SOLID`, `TINT` from `./colors`, `isChromatic`, `Color` from `./types`.
- Produces:
  - `interface BadgeProps { color?: Color; variant?: 'solid' | 'soft' | 'outline'; size?: 'xs' | 'sm' | 'md'; className?: string; children: React.ReactNode }` (defaults `neutral`, `soft`, `sm`); `function badgeClass(o: Pick<BadgeProps, 'color' | 'variant' | 'size'>): string`; `const Badge: React.FC<BadgeProps>` (a `<span>`).
  - `interface IconBadgeProps { children: React.ReactNode; size?: 'sm' | 'md' | 'lg' | 'none'; color?: Color; variant?: 'soft' | 'outline'; label?: string; className?: string }` (defaults `md`, `neutral`, `soft`; `sm` 24px, `md` 28px, `lg` 56→64px, `none` = caller sizes it); `function iconBadgeClass(o: Pick<IconBadgeProps, 'size' | 'color' | 'variant'>): string`; `const IconBadge: React.FC<IconBadgeProps>` — `aria-hidden="true"` unless `label`, then `role="img" aria-label={label}`.

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/Badge.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge, badgeClass } from './Badge';
import { IconBadge, iconBadgeClass } from './IconBadge';

describe('Badge', () => {
  it('defaults to a neutral soft sm badge', () => {
    expect(renderToStaticMarkup(<Badge>new</Badge>)).toBe(
      '<span class="inline-flex items-center gap-1 rounded-selector border font-semibold whitespace-nowrap bg-base-300 text-base-content border-base-border px-2 py-0.5 text-[11px]">new</span>',
    );
  });

  it('tints chromatic colours and fills solids with their content colour', () => {
    expect(badgeClass({ color: 'business' })).toContain('bg-business/10 text-business border-business/25');
    expect(badgeClass({ color: 'engineer', variant: 'outline' })).toContain('bg-transparent border-engineer/40 text-engineer');
    expect(badgeClass({ color: 'success', variant: 'solid' })).toContain('bg-success text-success-content');
    expect(badgeClass({ variant: 'outline' })).toContain('text-base-content-secondary border-base-border-strong');
  });

  it('appends className (e.g. font-bold for the XP badge)', () => {
    expect(renderToStaticMarkup(<Badge color="warning" className="font-bold">+10 XP</Badge>)).toContain('text-[11px] font-bold"');
  });
});

describe('IconBadge', () => {
  it('is a soft square, hidden from screen readers by default', () => {
    const html = renderToStaticMarkup(<IconBadge>🗺️</IconBadge>);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('bg-base-300 text-base-content border-base-border w-7 h-7');
    expect(html).not.toContain('bg-primary');
  });

  it('is announced when labelled', () => {
    const html = renderToStaticMarkup(<IconBadge label="Level 3">3</IconBadge>);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Level 3"');
    expect(html).not.toContain('aria-hidden');
  });

  it('sizes sm/md/lg, none leaves the size to the caller, outline uses the strong border', () => {
    expect(iconBadgeClass({ size: 'sm' })).toContain('w-6 h-6');
    expect(iconBadgeClass({ size: 'lg' })).toContain('w-14 h-14 sm:w-16 sm:h-16');
    expect(iconBadgeClass({ size: 'none' })).not.toMatch(/\bw-\d/);
    expect(iconBadgeClass({ variant: 'outline' })).toContain('bg-transparent text-base-content border-base-border-strong');
    expect(iconBadgeClass({ color: 'success' })).toContain('bg-success/10 text-success border-success/25');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Badge.test.tsx`
Expected: FAIL with `Failed to resolve import "./Badge"`

- [ ] **Step 3: Write the components**

`src/components/ui/Badge.tsx`:
```tsx
import React from 'react';
import { cn } from './cn';
import { SOLID, TINT } from './colors';
import { isChromatic, type Color } from './types';

export interface BadgeProps {
  color?: Color;
  variant?: 'solid' | 'soft' | 'outline';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

const SIZE: Record<NonNullable<BadgeProps['size']>, string> = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

export function badgeClass({ color = 'neutral', variant = 'soft', size = 'sm' }: Pick<BadgeProps, 'color' | 'variant' | 'size'>): string {
  const tone = variant === 'solid' ? SOLID[color]
    : isChromatic(color) ? (variant === 'soft' ? TINT[color].soft : cn('bg-transparent', TINT[color].outline))
    : variant === 'soft' ? 'bg-base-300 text-base-content border-base-border'
    : 'bg-transparent text-base-content-secondary border-base-border-strong';
  return cn('inline-flex items-center gap-1 rounded-selector border font-semibold whitespace-nowrap', tone, SIZE[size]);
}

/** A label, not a control: never clickable. */
export const Badge: React.FC<BadgeProps> = ({ color, variant, size, className, children }) => (
  <span className={cn(badgeClass({ color, variant, size }), className)}>{children}</span>
);
```

`src/components/ui/IconBadge.tsx`:
```tsx
import React from 'react';
import { cn } from './cn';
import { TINT } from './colors';
import { isChromatic, type Color } from './types';

/**
 * A decorative square around an icon, emoji or number (spec §10.3). Soft on purpose: decoration
 * must not look like a button. Hidden from screen readers unless `label` is given — pass `label`
 * whenever the square holds text the reader needs (a chapter number, a level).
 * `size="none"` sets no box size, for a caller whose layout needs its own (the caller passes w-/h-).
 */
export interface IconBadgeProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'none';
  color?: Color;
  variant?: 'soft' | 'outline';
  label?: string;
  className?: string;
}

const SIZE: Record<NonNullable<IconBadgeProps['size']>, string> = {
  sm: 'w-6 h-6 text-xs font-bold',
  md: 'w-7 h-7 text-xs font-bold',
  lg: 'w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl font-extrabold',
  none: '',
};

export function iconBadgeClass({ size = 'md', color = 'neutral', variant = 'soft' }: Pick<IconBadgeProps, 'size' | 'color' | 'variant'>): string {
  const tone = isChromatic(color)
    ? (variant === 'soft' ? TINT[color].soft : cn('bg-transparent', TINT[color].outline))
    : variant === 'soft' ? 'bg-base-300 text-base-content border-base-border'
    : 'bg-transparent text-base-content border-base-border-strong';
  return cn('inline-flex items-center justify-center shrink-0 rounded-field border', tone, SIZE[size]);
}

export const IconBadge: React.FC<IconBadgeProps> = ({ children, size, color, variant, label, className }) => (
  <span
    className={cn(iconBadgeClass({ size, color, variant }), className)}
    {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
  >
    {children}
  </span>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Badge.test.tsx`
Expected: PASS (6 tests)

- [ ] **Step 5: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Badge.tsx src/components/ui/IconBadge.tsx src/components/ui/Badge.test.tsx
git commit -m "feat: ui Badge and soft IconBadge"
```

---

### Task 10: `Card`

**Files:**
- Create: `src/components/ui/Card.tsx`
- Test: `src/components/ui/Card.test.tsx`

**Interfaces:**
- Consumes: `cn` (Task 8).
- Produces: `interface CardProps extends React.HTMLAttributes<HTMLElement> { as?: 'div' | 'section' | 'article' | 'li' | 'details'; variant?: 'default' | 'elevated' | 'subtle' | 'interactive'; padding?: 'box' | 'dense' | 'spacious' | 'none'; open?: boolean }` (defaults `div`, `default`, `box`); `function cardClass(o: Pick<CardProps, 'variant' | 'padding'>): string`; `const Card: React.FC<CardProps>`.

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/Card.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card, cardClass } from './Card';

describe('Card', () => {
  it('defaults to a bordered base-100 div with box padding and box radius', () => {
    expect(renderToStaticMarkup(<Card>x</Card>)).toBe('<div class="rounded-box bg-base-100 border border-base-border p-box">x</div>');
  });

  it('renders the requested element and passes attributes through', () => {
    const html = renderToStaticMarkup(<Card as="details" padding="none" open data-card="1"><summary>s</summary></Card>);
    expect(html).toMatch(/^<details class="rounded-box bg-base-100 border border-base-border" open="" data-card="1">/);
  });

  it('maps variants and padding to tokens', () => {
    expect(cardClass({ variant: 'elevated' })).toContain('border-base-border-strong shadow-xs');
    expect(cardClass({ variant: 'subtle' })).toContain('bg-base-300 border border-base-border');
    expect(cardClass({ variant: 'interactive' })).toContain('hover:border-base-border-strong transition-colors');
    expect(cardClass({ padding: 'dense' })).toContain('p-box-dense');
    expect(cardClass({ padding: 'spacious' })).toContain('p-box-spacious');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Card.test.tsx`
Expected: FAIL with `Failed to resolve import "./Card"`

- [ ] **Step 3: Write `Card`**

`src/components/ui/Card.tsx`:
```tsx
import React from 'react';
import { cn } from './cn';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section' | 'article' | 'li' | 'details';
  variant?: 'default' | 'elevated' | 'subtle' | 'interactive';
  /** 'none' for cards with their own padded header/body (details/summary). */
  padding?: 'box' | 'dense' | 'spacious' | 'none';
  /** For `as="details"`. */
  open?: boolean;
}

const VARIANT: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-base-100 border border-base-border',
  elevated: 'bg-base-100 border border-base-border-strong shadow-xs',
  subtle: 'bg-base-300 border border-base-border',
  interactive: 'bg-base-100 border border-base-border hover:border-base-border-strong transition-colors',
};

const PADDING: Record<NonNullable<CardProps['padding']>, string> = {
  box: 'p-box',
  dense: 'p-box-dense',
  spacious: 'p-box-spacious',
  none: '',
};

export function cardClass({ variant = 'default', padding = 'box' }: Pick<CardProps, 'variant' | 'padding'>): string {
  return cn('rounded-box', VARIANT[variant], PADDING[padding]);
}

export const Card: React.FC<CardProps> = ({ as = 'div', variant, padding, className, ...rest }) =>
  React.createElement(as, { className: cn(cardClass({ variant, padding }), className), ...rest });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Card.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Card.tsx src/components/ui/Card.test.tsx
git commit -m "feat: ui Card with token surfaces and padding"
```

---

### Task 11: `ToggleChip` and `Tabs`

**Files:**
- Create: `src/components/ui/ToggleChip.tsx`, `src/components/ui/Tabs.tsx`
- Test: `src/components/ui/Tabs.test.tsx`

**Interfaces:**
- Consumes: `cn`, `tapClass`, `Tap` (Task 8); `SCROLL_ROOM`, `TAP_GAP` from `./tapTarget`.
- Produces:
  - `interface ToggleChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> { selected: boolean; shape?: 'chip' | 'pill' | 'segment' | 'tab' | 'card'; size?: 'xs' | 'sm'; selectedStyle?: 'soft' | 'solid'; tap?: Tap }` (defaults `chip`, `sm`, `soft`, `full`, `type="button"`); sets `aria-pressed={selected}` unless the caller passes `aria-current`; `function chipClass(o: Pick<ToggleChipProps, 'selected' | 'shape' | 'size' | 'selectedStyle' | 'tap'>): string`; `const ToggleChip: React.FC<ToggleChipProps>`.
  - `interface TabsProps<T extends string> { items: readonly { value: T; label: React.ReactNode; icon?: React.ReactNode; title?: string }[]; value: T; onChange: (value: T) => void; variant: 'segmented' | 'pills' | 'underline'; size?: 'xs' | 'sm'; 'aria-label': string; scroll?: boolean; className?: string }`; `function Tabs<T extends string>(p: TabsProps<T>): JSX.Element` — renders `<div role="group" aria-label>` of ToggleChips with `data-value={item.value}`; `const TABS_LAYOUT: Record<'segmented' | 'pills' | 'underline', { group: string; gapPx: number; shape: …; tap: Tap }>` (segmented: edge to edge, tap `y`; pills: `gap-1.5`, tap `gap-6`; underline: tap `y`).

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/Tabs.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tabs, TABS_LAYOUT } from './Tabs';
import { ToggleChip, chipClass } from './ToggleChip';
import { TAP_GAP } from './tapTarget';
import type { Tap } from './types';

const hasRing = (cls: string) => cls.includes('max-sm:before:min-h-11') || Object.values(TAP_GAP).some(g => cls.includes(g));
const SHAPES = ['chip', 'pill', 'segment', 'tab', 'card'] as const;
const TAPS: Tap[] = ['full', 'y', 'positioned', 'gap-4', 'gap-6', 'gap-8', 'gap-16'];

describe('ToggleChip', () => {
  it('selected is soft: base-300, bold, strong border, never a primary fill', () => {
    const cls = chipClass({ selected: true });
    expect(cls).toContain('border-base-border-strong bg-base-300 text-base-content font-bold');
    expect(cls.split(' ')).not.toContain('bg-primary');
  });

  it('unselected is quiet; underline tab selected is a base-content bottom border', () => {
    expect(chipClass({ selected: false })).toContain('border-transparent text-base-content-secondary hover:bg-base-300');
    expect(chipClass({ selected: true, shape: 'tab' })).toContain('border-b-2');
    expect(chipClass({ selected: true, shape: 'tab' })).toContain('border-base-content text-base-content font-bold');
  });

  it('solid selection exists only when asked for (a chosen quiz answer)', () => {
    expect(chipClass({ selected: true, selectedStyle: 'solid' })).toContain('bg-primary text-primary-content');
    expect(chipClass({ selected: false, selectedStyle: 'solid' })).not.toContain('bg-primary');
  });

  it('segments keep the 32px minimum height of the old header segments (P1.4)', () => {
    expect(chipClass({ selected: false, shape: 'segment' })).toContain('min-h-8');
  });

  it('every shape, size and tap carries a tap ring', () => {
    for (const shape of SHAPES) for (const size of ['xs', 'sm'] as const) for (const tap of TAPS)
      expect(hasRing(chipClass({ selected: false, shape, size, tap })), `${shape} ${size} ${tap}`).toBe(true);
  });

  it('sets aria-pressed, or leaves it to aria-current', () => {
    expect(renderToStaticMarkup(<ToggleChip selected>a</ToggleChip>)).toContain('aria-pressed="true"');
    expect(renderToStaticMarkup(<ToggleChip selected={false}>a</ToggleChip>)).toContain('aria-pressed="false"');
    const row = renderToStaticMarkup(<ToggleChip selected aria-current="true" data-track-item="s1">a</ToggleChip>);
    expect(row).not.toContain('aria-pressed');
    expect(row).toContain('aria-current="true"');
    expect(row).toContain('data-track-item="s1"');
  });

  it('keeps the label as direct text after aria-pressed (QuizTab/OtherSide tests match on it)', () => {
    expect(renderToStaticMarkup(<ToggleChip selected>สาย Engineering</ToggleChip>)).toMatch(/aria-pressed="true"[^>]*>สาย Engineering<\/button>/);
  });
});

describe('Tabs', () => {
  const items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', title: 'bee' }, { value: 'c', label: 'C' }] as const;
  const render = (variant: 'segmented' | 'pills' | 'underline', scroll?: boolean) =>
    renderToStaticMarkup(<Tabs items={items} value="b" onChange={() => {}} variant={variant} aria-label="pick" scroll={scroll} />);

  it('is a labelled group with exactly one pressed item', () => {
    const html = render('pills');
    expect(html).toMatch(/^<div role="group" aria-label="pick"/);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(2);
    expect(html).toContain('data-value="b"');
    expect(html).toContain('title="bee"');
  });

  it('pairs each variant gap with the matching tap ring', () => {
    expect(TABS_LAYOUT.pills.group).toContain('gap-1.5');
    expect(TABS_LAYOUT.pills.gapPx).toBe(6);
    expect(TABS_LAYOUT.pills.tap).toBe('gap-6');
    for (const v of ['segmented', 'underline'] as const) {
      expect(TABS_LAYOUT[v].group).not.toMatch(/\bgap-/);
      expect(TABS_LAYOUT[v].tap).toBe('y');
    }
    expect(render('pills')).toContain(TAP_GAP[6]);
    expect(render('segmented')).not.toContain('calc(100%+');
  });

  it('a scrolling strip gets room for the rings and chips that do not shrink', () => {
    const html = render('pills', true);
    expect(html).toContain('overflow-x-auto');
    expect(html).toContain('max-sm:-my-2.5 max-sm:py-2.5');
    expect(html).toContain('shrink-0');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Tabs.test.tsx`
Expected: FAIL with `Failed to resolve import "./Tabs"`

- [ ] **Step 3: Write `ToggleChip`**

`src/components/ui/ToggleChip.tsx`:
```tsx
import React from 'react';
import { cn } from './cn';
import { tapClass } from './tapClass';
import type { Tap } from './types';

/**
 * A toggle button for tabs, chips, filters, segments and list rows. Selected is soft (spec §9):
 * base-300 + bold + strong border, never a primary fill. `selectedStyle="solid"` exists only for a
 * chosen quiz answer. Sets aria-pressed={selected} unless the caller passes aria-current.
 */
export interface ToggleChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  selected: boolean;
  shape?: 'chip' | 'pill' | 'segment' | 'tab' | 'card';
  size?: 'xs' | 'sm';
  selectedStyle?: 'soft' | 'solid';
  tap?: Tap;
}

type ChipStyle = Pick<ToggleChipProps, 'selected' | 'shape' | 'size' | 'selectedStyle' | 'tap'>;

const SHAPE: Record<NonNullable<ToggleChipProps['shape']>, string> = {
  chip: 'rounded-selector whitespace-nowrap',
  pill: 'rounded-full whitespace-nowrap',
  segment: 'rounded-selector whitespace-nowrap min-h-8',
  tab: 'rounded-none border-x-0 border-t-0 border-b-2 -mb-px whitespace-nowrap',
  card: 'rounded-field w-full text-left',
};

const SIZE: Record<NonNullable<ToggleChipProps['size']>, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-xs',
};

function tone(selected: boolean, shape: NonNullable<ToggleChipProps['shape']>, selectedStyle: NonNullable<ToggleChipProps['selectedStyle']>): string {
  if (shape === 'tab') {
    return selected
      ? 'border-base-content text-base-content font-bold'
      : 'border-transparent text-base-content-secondary hover:text-base-content';
  }
  if (!selected) return 'border border-transparent text-base-content-secondary hover:bg-base-300 hover:text-base-content';
  return selectedStyle === 'solid'
    ? 'border border-primary bg-primary text-primary-content font-bold'
    : 'border border-base-border-strong bg-base-300 text-base-content font-bold';
}

/** ToggleChip classes, for a caller that renders its own element. */
export function chipClass({ selected, shape = 'chip', size = 'sm', selectedStyle = 'soft', tap = 'full' }: ChipStyle): string {
  return cn(
    tapClass(tap),
    'inline-flex items-center gap-1.5 font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:cursor-not-allowed',
    SHAPE[shape],
    shape !== 'card' && SIZE[size],
    tone(selected, shape, selectedStyle),
  );
}

export const ToggleChip: React.FC<ToggleChipProps> = ({ selected, shape, size, selectedStyle, tap, className, type = 'button', ...rest }) => (
  <button
    type={type}
    aria-pressed={rest['aria-current'] === undefined ? selected : undefined}
    className={cn(chipClass({ selected, shape, size, selectedStyle, tap }), className)}
    {...rest}
  />
);
```

- [ ] **Step 4: Write `Tabs`**

`src/components/ui/Tabs.tsx`:
```tsx
import React from 'react';
import { cn } from './cn';
import { SCROLL_ROOM } from './tapTarget';
import { ToggleChip, type ToggleChipProps } from './ToggleChip';
import type { Tap } from './types';

/**
 * A labelled group of ToggleChips. The variant picks the gap and the tap ring together, so they
 * cannot disagree (tapTarget.ts: packed rows use TAP_Y, gapped rows TAP_GAP[gap]).
 */
export interface TabsProps<T extends string> {
  items: readonly { value: T; label: React.ReactNode; icon?: React.ReactNode; title?: string }[];
  value: T;
  onChange: (value: T) => void;
  variant: 'segmented' | 'pills' | 'underline';
  size?: 'xs' | 'sm';
  'aria-label': string;
  scroll?: boolean;
  className?: string;
}

/** Group classes, chip shape and tap ring per variant. `gapPx` is the real gap between chips. */
export const TABS_LAYOUT: Record<TabsProps<string>['variant'], { group: string; gapPx: number; shape: NonNullable<ToggleChipProps['shape']>; tap: Tap }> = {
  segmented: { group: 'inline-flex items-center p-0.5 rounded-field bg-base-100 border border-base-border', gapPx: 0, shape: 'segment', tap: 'y' },
  pills: { group: 'flex items-center gap-1.5', gapPx: 6, shape: 'pill', tap: 'gap-6' },
  underline: { group: 'flex items-center border-b border-base-border', gapPx: 0, shape: 'tab', tap: 'y' },
};

export function Tabs<T extends string>({ items, value, onChange, variant, size = 'sm', scroll, className, ...aria }: TabsProps<T>) {
  const layout = TABS_LAYOUT[variant];
  return (
    <div
      role="group"
      aria-label={aria['aria-label']}
      className={cn(layout.group, scroll && `overflow-x-auto scrollbar-none ${SCROLL_ROOM}`, className)}
    >
      {items.map(item => (
        <ToggleChip
          key={item.value}
          data-value={item.value}
          selected={item.value === value}
          shape={layout.shape}
          size={size}
          tap={layout.tap}
          title={item.title}
          onClick={() => onChange(item.value)}
          className={scroll ? 'shrink-0' : undefined}
        >
          {item.icon}
          {item.label}
        </ToggleChip>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Tabs.test.tsx src/components/ui/tapTargets.test.ts`
Expected: PASS (10 + 8 tests)

- [ ] **Step 6: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/ToggleChip.tsx src/components/ui/Tabs.tsx src/components/ui/Tabs.test.tsx
git commit -m "feat: ui ToggleChip and Tabs with soft selection and matched tap rings"
```

---

### Task 12: `Input`, `Textarea` and `Alert`

**Files:**
- Create: `src/components/ui/Input.tsx`, `src/components/ui/Textarea.tsx`, `src/components/ui/Alert.tsx`
- Test: `src/components/ui/Input.test.tsx`

**Interfaces:**
- Consumes: `cn` (Task 8).
- Produces:
  - `interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> { size?: 'sm' | 'md'; invalid?: boolean }`; `function fieldClass(invalid?: boolean): string` (no padding/size — for raw fields with custom padding); `const Input: React.FC<InputProps>`.
  - `interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { invalid?: boolean }`; `const Textarea: React.FC<TextareaProps>`.
  - `interface AlertProps { color: 'info' | 'success' | 'warning' | 'error'; title?: React.ReactNode; icon?: React.ReactNode; live?: boolean; className?: string; children: React.ReactNode }`; `const Alert: React.FC<AlertProps>` (`role="status"` only when `live`).

- [ ] **Step 1: Write the failing test**

Create `src/components/ui/Input.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Alert } from './Alert';

describe('Input and Textarea', () => {
  it('render token surfaces with a subtle placeholder and a focus ring', () => {
    const html = renderToStaticMarkup(<Input placeholder="ค้นหา" />);
    expect(html).toContain('bg-base-100 border text-base-content placeholder-base-content-subtle');
    expect(html).toContain('focus-visible:ring-primary');
    expect(html).toContain('border-base-border focus:border-base-border-strong');
    expect(html).toContain('px-4 py-2.5 text-xs sm:text-sm');
    expect(html).not.toContain('aria-invalid');
  });

  it('size sm is compact; invalid sets aria-invalid and the error border', () => {
    expect(renderToStaticMarkup(<Input size="sm" />)).toContain('px-3 py-2 text-xs');
    const bad = renderToStaticMarkup(<Input invalid />);
    expect(bad).toContain('aria-invalid="true"');
    expect(bad).toContain('border-error');
    expect(bad).not.toContain('border-base-border');
    expect(renderToStaticMarkup(<Textarea invalid rows={3} />)).toMatch(/<textarea aria-invalid="true"[^>]*border-error[^>]*rows="3"/);
  });

  it('passes native props through', () => {
    const html = renderToStaticMarkup(<Input type="search" value="x" onChange={() => {}} disabled aria-label="q" />);
    expect(html).toContain('type="search"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-label="q"');
  });
});

describe('Alert', () => {
  it('is a soft tinted box, silent unless live', () => {
    const html = renderToStaticMarkup(<Alert color="warning" title="หมายเหตุ">ใช้คำตอบสำรอง</Alert>);
    expect(html).not.toContain('role=');
    expect(html).toContain('bg-warning/10 border-warning/25');
    expect(html).toContain('<div class="font-bold text-warning">หมายเหตุ</div>');
  });

  it('announces when live and hides the decorative icon', () => {
    const html = renderToStaticMarkup(<Alert color="error" live icon={<svg />}>x</Alert>);
    expect(html).toMatch(/^<div role="status"/);
    expect(html).toContain('aria-hidden="true"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/Input.test.tsx`
Expected: FAIL with `Failed to resolve import "./Input"`

- [ ] **Step 3: Write the components**

`src/components/ui/Input.tsx`:
```tsx
import React from 'react';
import { cn } from './cn';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md';
  invalid?: boolean;
}

/** Field surface without padding: shared by Input and Textarea, and by raw fields with custom padding. */
export function fieldClass(invalid?: boolean): string {
  return cn(
    'w-full rounded-field bg-base-100 border text-base-content placeholder-base-content-subtle transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed',
    invalid ? 'border-error' : 'border-base-border focus:border-base-border-strong',
  );
}

const SIZE: Record<NonNullable<InputProps['size']>, string> = {
  sm: 'px-3 py-2 text-xs',
  md: 'px-4 py-2.5 text-xs sm:text-sm',
};

export const Input: React.FC<InputProps> = ({ size = 'md', invalid, className, ...rest }) => (
  <input aria-invalid={invalid || undefined} className={cn(fieldClass(invalid), SIZE[size], className)} {...rest} />
);
```

`src/components/ui/Textarea.tsx`:
```tsx
import React from 'react';
import { cn } from './cn';
import { fieldClass } from './Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({ invalid, className, ...rest }) => (
  <textarea aria-invalid={invalid || undefined} className={cn(fieldClass(invalid), 'px-4 py-2.5 text-xs sm:text-sm', className)} {...rest} />
);
```

`src/components/ui/Alert.tsx`:
```tsx
import React from 'react';
import { cn } from './cn';

/** A soft callout. role="status" only when `live` (its text changes while the reader is on the page). */
export interface AlertProps {
  color: 'info' | 'success' | 'warning' | 'error';
  title?: React.ReactNode;
  icon?: React.ReactNode;
  live?: boolean;
  className?: string;
  children: React.ReactNode;
}

const TONE: Record<AlertProps['color'], { box: string; accent: string }> = {
  info: { box: 'bg-info/10 border-info/25', accent: 'text-info' },
  success: { box: 'bg-success/10 border-success/25', accent: 'text-success' },
  warning: { box: 'bg-warning/10 border-warning/25', accent: 'text-warning' },
  error: { box: 'bg-error/10 border-error/25', accent: 'text-error' },
};

export const Alert: React.FC<AlertProps> = ({ color, title, icon, live, className, children }) => (
  <div
    role={live ? 'status' : undefined}
    className={cn('flex items-start gap-2.5 p-box rounded-box border text-xs sm:text-sm text-base-content-body', TONE[color].box, className)}
  >
    {icon && <span className={cn('shrink-0 mt-0.5', TONE[color].accent)} aria-hidden="true">{icon}</span>}
    <div className="min-w-0 space-y-1">
      {title && <div className={cn('font-bold', TONE[color].accent)}>{title}</div>}
      <div>{children}</div>
    </div>
  </div>
);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/Input.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/Input.tsx src/components/ui/Textarea.tsx src/components/ui/Alert.tsx src/components/ui/Input.test.tsx
git commit -m "feat: ui Input, Textarea and Alert"
```

---

### Task 13: Phase 3 — Header and App shell

**Files:**
- Create (not committed): `work/design-tokens/map-layout.mjs`
- Create: `src/components/ui/hierarchy.test.ts`, `src/components/Header.test.tsx`
- Modify: `src/components/Header.tsx`, `src/App.tsx`, `src/components/ui/tapTargets.test.ts` (sanity thresholds)

**Interfaces:**
- Consumes: `Tabs` (Task 11), `IconBadge` (Task 9).
- Produces: `node work/design-tokens/map-layout.mjs <file>…` (rewrites §5/§7.6 combos, prints each `p-3 sm:p-3.5` it leaves for the nested/top-level call); `hierarchy.test.ts` with `const MIGRATED: string[]` (paths relative to `src/`) that Tasks 14–18 append to and Task 19 replaces with every file. Header's `data-header-role` / `data-header-level-mode` attributes are replaced by `Tabs`' `data-value` (nothing reads them).

- [ ] **Step 1: Write the failing tests**

Create `src/components/ui/hierarchy.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Guard (spec §5, §7.6, §9-10) for files already migrated in Phase 3: layout comes from the radius
 * and spacing tokens, a file holds at most its allowed primary solids, and `bg-primary` appears only
 * as a progress fill. Each Phase 3 task appends its files to MIGRATED.
 */
const SRC = join(process.cwd(), 'src');

const MIGRATED: string[] = [
  'App.tsx',
  'components/Header.tsx',
];

/** Responsive combos that §5/§7.6 replace with tokens. */
const LEGACY_LAYOUT = [
  'rounded-2xl sm:rounded-3xl', 'rounded-xl sm:rounded-2xl', 'rounded-lg sm:rounded-xl', 'rounded-md sm:rounded-lg',
  'rounded-[3px]', 'rounded-[4px]',
  'p-4 sm:p-6', 'p-5 sm:p-6', 'p-3.5 sm:p-4.5', 'p-3.5 sm:p-4', 'p-3.5 sm:p-5', 'p-4 sm:p-5', 'p-3 sm:p-4', 'p-3 sm:p-3.5',
  'p-2.5 sm:p-3', 'p-2 sm:p-2.5', 'p-2 sm:p-4',
  'px-3 sm:px-6 lg:px-8', 'px-4 sm:px-6', 'gap-4 sm:gap-6 lg:gap-8',
  'space-y-4 sm:space-y-6', 'space-y-5 sm:space-y-6', 'space-y-6 sm:space-y-8',
  'gap-2 sm:gap-3', 'gap-2.5 sm:gap-3', 'space-y-2 sm:space-y-3', 'space-y-2.5 sm:space-y-3',
];
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function legacyHits(src: string): string[] {
  return LEGACY_LAYOUT.filter(c => new RegExp(`(?<![\\w.:/-])${esc(c)}(?![\\w.:/\\]-])`).test(src));
}

/** §10.1: files that may hold a primary solid Button (one each). */
const PRIMARY_SOLID_MAX: Record<string, number> = {
  'components/QuizTab.tsx': 1,
  'components/quiz/QuizResultScreen.tsx': 1,
  'components/AIAssistantTab.tsx': 1,
  'components/GuideTab.tsx': 1,
  'components/guide/TrackFooter.tsx': 1,
  'components/GamificationTab.tsx': 1,
};

/** §10.4: the progress fills, the only unprefixed `bg-primary` left outside ui/. */
export const PROGRESS_FILL: Record<string, number> = {
  'components/Header.tsx': 1,
  'components/GuideTab.tsx': 1,
  'components/QuizTab.tsx': 1,
  'components/GamificationTab.tsx': 1,
};

const count = (src: string, re: RegExp) => (src.match(re) ?? []).length;
const BG_PRIMARY = /(?<![\w:/-])bg-primary(?![\w/-])/g;
const BORDER_PRIMARY = /(?<![\w:/-])border-primary(?![\w/-])/g;
const PRIMARY_SOLID = /color="primary" variant="solid"/g;

describe('Phase 3 hierarchy and layout tokens', () => {
  const files = MIGRATED.map(file => ({ file, src: readFileSync(join(SRC, file), 'utf8') }));

  it('finds the legacy combos it guards, whole classes only', () => {
    expect(legacyHits('<div className="p-3.5 sm:p-4.5 rounded-box">')).toEqual(['p-3.5 sm:p-4.5']);
    expect(legacyHits('<div className="p-box rounded-box gap-stack">')).toEqual([]);
    expect(count('bg-primary hover:bg-primary/90 bg-primary-content', BG_PRIMARY)).toBe(1);
  });

  it('migrated files use radius and spacing tokens', () => {
    const bad = files.flatMap(f => legacyHits(f.src).map(c => `${f.file}: ${c}`));
    expect(bad).toEqual([]);
  });

  it('bg-primary is only a progress fill; no selected state uses a primary border', () => {
    const bad = files.flatMap(f => {
      const fill = count(f.src, BG_PRIMARY);
      const border = count(f.src, BORDER_PRIMARY);
      return [
        ...(fill > (PROGRESS_FILL[f.file] ?? 0) ? [`${f.file}: ${fill} bg-primary`] : []),
        ...(border ? [`${f.file}: ${border} border-primary`] : []),
      ];
    });
    expect(bad).toEqual([]);
  });

  it('at most one primary solid per view (§10.1)', () => {
    const bad = files.filter(f => count(f.src, PRIMARY_SOLID) > (PRIMARY_SOLID_MAX[f.file] ?? 0))
      .map(f => `${f.file}: ${count(f.src, PRIMARY_SOLID)} primary solids`);
    expect(bad).toEqual([]);
  });
});
```

Create `src/components/Header.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Role } from '../data/rolePerspective';
import type { UserStats } from '../types';
import { Header } from './Header';

const noop = () => {};
const stats: UserStats = {
  xp: 120, level: 2, levelTitle: 'Bridge Apprentice', quizzesCompleted: 0, correctAnswers: 0,
  aiQuestionsAsked: 0, readChapters: [], bookmarks: [], xpClaims: [],
};
const render = (role: Role | null) => renderToStaticMarkup(
  <Header activeTab="quiz" setActiveTab={noop} experienceLevel="beginner" setExperienceLevel={noop}
    role={role} onChooseRole={noop} levelMode="auto" onLevelModeChange={noop}
    userStats={stats} chapterCount={19} theme="dark" setTheme={noop} />,
);

describe('Header hierarchy (spec §10.2)', () => {
  it('selections are soft: the only primary fill is the XP progress bar', () => {
    const html = render('eng');
    expect(html.match(/(?<![\w:/-])bg-primary(?![\w/-])/g)).toHaveLength(1);
    expect(html).not.toMatch(/(?<![\w:/-])border-primary(?![\w/-])/);
  });

  it('each control group presses exactly one item (nav 1, role and level twice for md/mobile, theme 1)', () => {
    const html = render('eng');
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(6);
    expect(html).toMatch(/aria-pressed="true"[^>]*data-value="eng"/);
    expect(html).toMatch(/aria-pressed="true"[^>]*data-value="quiz"/);
    expect(html).toMatch(/aria-pressed="true"[^>]*data-value="dark"/);
    expect(html).toContain('aria-label="สายงานของคุณ"');
    expect(html).toContain('aria-label="Theme mode switcher"');
  });

  it('no role selects the "none" segment and shows the two-level switch', () => {
    const html = render(null);
    expect(html).toMatch(/aria-pressed="true"[^>]*data-value="none"/);
    expect(html).toMatch(/aria-pressed="true"[^>]*data-value="beginner"/);
    expect(html).not.toContain('data-value="auto"');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/ui/hierarchy.test.ts src/components/Header.test.tsx`
Expected: FAIL — hierarchy lists `App.tsx: px-3 sm:px-6 lg:px-8`, `components/Header.tsx: rounded-[4px]` and a
`components/Header.tsx: N bg-primary` entry with N > 1; the Header test finds more than one `bg-primary` and no `data-value`.

- [ ] **Step 3: Create the layout script**

Create `work/design-tokens/map-layout.mjs`:
```js
#!/usr/bin/env node
// One-off Phase 3 layout migration (spec §5, §7.6). Rewrites responsive radius/padding/gap combos to
// tokens in place, and lists every `p-3 sm:p-3.5` for the nested/top-level call (not rewritten).
// Usage: node work/design-tokens/map-layout.mjs <file>...
import { readFileSync, writeFileSync } from 'node:fs';

// Longest first; each old value is matched as whole classes only.
const TABLE = [
  ['p-4 sm:p-6 lg:p-7', 'p-box-spacious'],
  ['px-3 sm:px-6 lg:px-8', 'px-page'], ['px-4 sm:px-6 lg:px-8', 'px-page'], ['px-4 sm:px-6', 'px-page'],
  ['gap-4 sm:gap-6 lg:gap-8', 'gap-section'],
  ['rounded-2xl sm:rounded-3xl', 'rounded-box'], ['rounded-xl sm:rounded-2xl', 'rounded-box'],
  ['rounded-lg sm:rounded-xl', 'rounded-field'], ['rounded-md sm:rounded-lg', 'rounded-selector'],
  ['rounded-[3px]', 'rounded-selector'], ['rounded-[4px]', 'rounded-selector'],
  ['p-4 sm:p-6', 'p-box-spacious'], ['p-5 sm:p-6', 'p-box-spacious'],
  ['p-3.5 sm:p-4.5', 'p-box'], ['p-3.5 sm:p-4', 'p-box'], ['p-3.5 sm:p-5', 'p-box'], ['p-4 sm:p-5', 'p-box'], ['p-3 sm:p-4', 'p-box'],
  ['p-2.5 sm:p-3', 'p-box-dense'], ['p-2 sm:p-2.5', 'p-box-dense'], ['p-2 sm:p-4', 'p-box-dense'],
  ['space-y-4 sm:space-y-6', 'space-y-section'], ['space-y-5 sm:space-y-6', 'space-y-section'], ['space-y-6 sm:space-y-8', 'space-y-section'],
  ['gap-2 sm:gap-3', 'gap-stack'], ['gap-2.5 sm:gap-3', 'gap-stack'],
  ['space-y-2 sm:space-y-3', 'space-y-stack'], ['space-y-2.5 sm:space-y-3', 'space-y-stack'],
];
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RULES = TABLE.map(([from, to]) => [new RegExp(`(?<![\\w.:/-])${esc(from)}(?![\\w.:/\\]-])`, 'g'), to]);
const JUDGE = /(?<![\w.:/-])p-3 sm:p-3\.5(?![\w.])/;

let changed = 0;
for (const file of process.argv.slice(2)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const next = lines.map((line, n) => {
    let out = line;
    for (const [re, to] of RULES) out = out.replace(re, () => { changed++; return to; });
    if (JUDGE.test(out)) console.log(`${file}:${n + 1} p-3 sm:p-3.5 → p-box (top-level card) or p-box-dense (inside a card)`);
    return out;
  });
  writeFileSync(file, next.join('\n'));
}
console.error(`${changed} replacements`);
```

- [ ] **Step 4: Replace the Header controls with `Tabs`**

In `src/components/Header.tsx`:

1. Imports: add `import { Tabs } from './ui/Tabs';` and `import { IconBadge } from './ui/IconBadge';`; add
   `TabType` and `ExperienceLevel` are already imported from `'../types'`. Remove `TAP`, `TAP_Y` from the
   `./ui/tapTarget` import (delete the import line if nothing else uses them).
2. Replace `ROLE_OPTIONS` and the `segmentClass` helper (lines 20–32) with:

```tsx
const ROLE_ITEMS = [
  { value: 'biz', label: `${ROLE_META.biz.icon} Business`, title: ROLE_META.biz.origin },
  { value: 'eng', label: `${ROLE_META.eng.icon} Engineering`, title: ROLE_META.eng.origin },
  { value: 'none', label: 'ไม่ระบุ' },
] as const;

const BEGINNER_TITLE = 'สำหรับมือใหม่: เน้นเข้าใจ Mindset, Mental Model และคำศัพท์พื้นฐาน';
const EXPERIENCED_TITLE = 'สำหรับคนทำงานจริง: เน้นคู่มือรับมือ Friction, ห้องเจรจา และสคริปต์คำพูดจริง';

const EXPERIENCE_ITEMS = [
  { value: 'beginner', label: 'Beginner', icon: <Sprout className="w-3.5 h-3.5" />, title: BEGINNER_TITLE },
  { value: 'experienced', label: 'Experienced', icon: <Handshake className="w-3.5 h-3.5" />, title: EXPERIENCED_TITLE },
] as const;

const LEVEL_MODE_ITEMS = [
  { value: 'auto', label: 'ตามสายงาน', title: 'บทฝั่งคุณเปิดแบบคุ้นงาน บทอื่นเปิดแบบมือใหม่' },
  ...EXPERIENCE_ITEMS,
] as const;

const THEME_ITEMS = [
  { value: 'light', label: null, icon: <Sun className="w-3.5 h-3.5" />, title: 'Light mode (สว่าง)' },
  { value: 'dark', label: null, icon: <Moon className="w-3.5 h-3.5" />, title: 'Dark mode (มืด)' },
  { value: 'system', label: null, icon: <Monitor className="w-3.5 h-3.5" />, title: 'System default (ตามระบบ)' },
] as const;

const navItems = (chapterCount: number) => [
  { value: 'guide', label: <span className="uppercase tracking-wider">Guide [{chapterCount}]</span>, icon: <BookOpen className="max-sm:hidden w-3.5 h-3.5" /> },
  { value: 'ai', label: <span className="uppercase tracking-wider">AI Bridge</span>, icon: <Bot className="max-sm:hidden w-3.5 h-3.5" /> },
  { value: 'quiz', label: <span className="uppercase tracking-wider">Quiz</span>, icon: <Sparkles className="max-sm:hidden w-3.5 h-3.5 text-warning" /> },
  { value: 'gamification', label: <span className="uppercase tracking-wider">Dashboard</span>, icon: <Trophy className="max-sm:hidden w-3.5 h-3.5" /> },
] as const;
```

3. Replace the whole `const controls = ( <> … </> );` block (role switcher `div` and experience level switcher `div`) with:

```tsx
  const controls = (
    <>
      <Tabs<'biz' | 'eng' | 'none'>
        variant="segmented"
        aria-label="สายงานของคุณ"
        items={ROLE_ITEMS}
        value={role ?? 'none'}
        onChange={v => onChooseRole(v === 'none' ? null : v)}
      />
      {role === null ? (
        <Tabs<ExperienceLevel>
          variant="segmented"
          aria-label="Experience Level Switcher"
          items={EXPERIENCE_ITEMS}
          value={experienceLevel}
          onChange={setExperienceLevel}
        />
      ) : (
        <Tabs<LevelMode>
          variant="segmented"
          aria-label="Experience Level Switcher"
          items={LEVEL_MODE_ITEMS}
          value={levelMode}
          onChange={onLevelModeChange}
        />
      )}
    </>
  );
```

4. Level mark (the `w-6 h-6 … bg-primary text-primary-content` square holding `Lv`, ~line 189): replace that `div` with
   `<IconBadge size="sm">Lv</IconBadge>` (decorative; the level title beside it is text).
5. Theme switcher: replace the whole `{setTheme && ( <div … role="group" aria-label="Theme mode switcher"> … </div> )}`
   block with:

```tsx
            {setTheme && (
              <Tabs<'light' | 'dark' | 'system'>
                variant="segmented"
                size="xs"
                aria-label="Theme mode switcher"
                items={THEME_ITEMS}
                value={theme}
                onChange={setTheme}
              />
            )}
```

6. Main navigation: replace the `<nav … aria-label="Main Navigation"> … </nav>` element and its four buttons with:

```tsx
          <nav aria-label="Main Navigation" className="min-w-0">
            <Tabs<TabType>
              variant="pills"
              scroll
              aria-label="แท็บหลัก"
              items={navItems(chapterCount)}
              value={activeTab}
              onChange={setActiveTab}
            />
          </nav>
```

The XP progress fill (`bg-primary h-full rounded-full`, ~line 205) stays.

- [ ] **Step 5: Re-aim the tap-target scan's sanity checks**

Header no longer has raw `<button>`s, and Phase 3 moves most gapped rows into `Tabs` (whose gap/ring agreement
`Tabs.test.tsx` asserts). In `src/components/ui/tapTargets.test.ts`:
- in "finds the interactive elements it is guarding", replace the two expectations with
```ts
    expect(tags.length).toBeGreaterThan(60);
    expect(tags.filter(t => t.file === 'ChapterDiagram.tsx').length).toBeGreaterThanOrEqual(10);
```
- in "every TAP_GAP ring matches the real gap of its row…", change `expect(gapped.length).toBeGreaterThanOrEqual(10);`
  to `expect(gapped.length).toBeGreaterThanOrEqual(5);` (after Phase 3 the raw gapped controls left are
  FrictionFaqSection ×2, FirstVisitCard, GuideTab's two sidebar links, AIAssistantTab's suggestions).

- [ ] **Step 6: Layout tokens for Header and App**

Run: `node work/design-tokens/map-layout.mjs src/components/Header.tsx src/App.tsx`
Expected: no `p-3 sm:p-3.5` lines; `App.tsx` main becomes `px-page`, Header rows `px-page`, `rounded-[3px]`/`[4px]`
become `rounded-selector` (the toast too).

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run src/components/ui/hierarchy.test.ts src/components/Header.test.tsx src/components/ui/tapTargets.test.ts src/components/ui/colorTokens.test.ts`
Expected: PASS

- [ ] **Step 8: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/Header.tsx src/components/Header.test.tsx src/App.tsx src/components/ui/hierarchy.test.ts src/components/ui/tapTargets.test.ts
git commit -m "feat: Header uses soft Tabs and layout tokens; hierarchy guard"
```

---

### Task 14: Phase 3 — Guide reader (GuideTab, TrackPanel, TrackFooter)

**Files:**
- Modify: `src/components/GuideTab.tsx`, `src/components/guide/TrackPanel.tsx`, `src/components/guide/TrackFooter.tsx`
- Test: `src/components/guide/TrackPanel.test.tsx` (new describe block), `src/components/ui/hierarchy.test.ts` (`MIGRATED`)

**Interfaces:**
- Consumes: `Button` (Task 8), `IconBadge` (Task 9), `ToggleChip`, `Tabs` (Task 11), `map-layout.mjs` (Task 13).
- Produces: nothing new. The per-chapter level buttons' `data-chapter-level` attribute is replaced by `data-value` (nothing reads it).

- [ ] **Step 1: Write the failing tests**

Append to `src/components/guide/TrackPanel.test.tsx` (Review Focus 3):
```tsx
describe('TrackPanel hierarchy (spec §10.1, §10.2)', () => {
  const html = render(['s2']);
  const activeRow = html.match(/<button[^>]*data-track-item="s2"[^>]*>/)![0];
  const primary = html.match(/<button[^>]*data-track-primary[^>]*>/)![0];

  it('the active row is soft and stays aria-current; no row becomes aria-pressed', () => {
    expect(activeRow).toContain('aria-current="true"');
    expect(html).not.toContain('aria-pressed');
    expect(activeRow).toContain('bg-base-300');
    expect(activeRow).not.toMatch(/(?<![\w:/-])bg-primary(?![\w/-])/);
  });

  it('the track button is a soft full-width button, not a primary fill', () => {
    expect(primary).toContain('bg-base-300');
    expect(primary).toContain('w-full');
    expect(primary).not.toMatch(/(?<![\w:/-])bg-primary(?![\w/-])/);
  });
});
```

In `src/components/ui/hierarchy.test.ts` append to `MIGRATED`: `'components/GuideTab.tsx'`, `'components/guide/TrackPanel.tsx'`, `'components/guide/TrackFooter.tsx'`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/guide/TrackPanel.test.tsx src/components/ui/hierarchy.test.ts`
Expected: FAIL — the active row has `bg-primary`; hierarchy lists `components/GuideTab.tsx: 11 bg-primary` and legacy combos.

- [ ] **Step 3: TrackPanel and TrackFooter**

`src/components/guide/TrackPanel.tsx` (add `import { Button } from '../ui/Button';` and `import { ToggleChip } from '../ui/ToggleChip';`):
- Replace the row `<button type="button" data-track-item={id} aria-current=… onClick=… className={…}>…</button>` with
```tsx
                <ToggleChip
                  selected={isActive}
                  shape="card"
                  tap="gap-4"
                  data-track-item={id}
                  aria-current={isActive ? 'true' : false}
                  onClick={() => onSelectChapter(id)}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs"
                >
```
  keeping the three children spans/icon unchanged and closing with `</ToggleChip>`. `aria-current` is passed on every
  row (`"false"` when inactive, which ARIA treats as absent), so no row gets `aria-pressed` (ToggleChip contract, spec §8):
  the list keeps its "current item" semantics.
  Keep `tap="gap-4"`: the `<ol>`'s gap is unchanged (was `TAP_GAP[4]`).
- Replace the `data-track-primary` button with
```tsx
      <Button
        color="primary"
        variant="soft"
        size="sm"
        block
        data-track-primary
        onClick={() => (firstUnreadId === null ? onStartQuiz() : onSelectChapter(firstUnreadId))}
      >
        {trackPrimaryLabel(read, firstUnreadId)}
      </Button>
```
- Remove `TAP`, `TAP_GAP` from the `../ui/tapTarget` import if unused.

`src/components/guide/TrackFooter.tsx` (`TrackEndCard`, add `import { Button } from '../ui/Button';`): replace the two
buttons with
```tsx
      <Button color="primary" variant="solid" size="sm" onClick={onStartQuiz}>ทำแบบทดสอบ</Button>
      <Button color="neutral" variant="outline" size="sm" onClick={onOpenIndex}>ดูสารบัญทั้งหมด</Button>
```
Leave `TrackNextCard`'s `data-track-next` card button as is (it is a card link, already soft).

- [ ] **Step 4: GuideTab sites (spec §10.1–10.4)**

In `src/components/GuideTab.tsx` add imports `Button`, `IconBadge`, `Tabs` from `./ui/…`. Then:

1. **Open index** (`onClick={openIndex}` button with the `List` icon, ~368) → `Button neutral outline md`, tap `gap-8`:
```tsx
            <Button color="neutral" variant="outline" size="md" tap="gap-8" onClick={openIndex}>
              <List className="w-4 h-4" />
              <span>สารบัญทั้ง {chapters.length} บท (Index)</span>
            </Button>
```
2. **Role filter chips** (both copies: sidebar ~459 and drawer ~907). Above the component add
```tsx
const ROLE_FILTERS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pm', label: 'PM' },
  { value: 'ux', label: 'UX' },
  { value: 'ba', label: 'BA' },
  { value: 'sa', label: 'SA' },
  { value: 'eng', label: 'Dev' },
  { value: 'qa', label: 'QA' },
  { value: 'friction', label: 'ขัดแย้ง' },
  { value: 'biz', label: 'ธุรกิจ' },
] as const;
```
   and replace each `{[ { id: 'all', … }, … ].map((tag) => ( <button …>{tag.label}</button> ))}` together with its
   wrapping row `div` by
```tsx
              <Tabs<string> variant="pills" size="xs" aria-label="กรองตามสายงาน" items={ROLE_FILTERS} value={selectedRole} onChange={setSelectedRole} className="flex-wrap" />
```
   (the drawer copy additionally keeps its outer spacing classes on a wrapping `div` if it had non-gap classes such as
   margins; the chip row itself is the `Tabs`).
3. **Index-row chapter numbers** (the `w-6 h-6` square in the sidebar row ~488 and the `w-7 h-7` square in the drawer
   row ~937): replace each `<div className={`… ${isActive ? … : isRead ? … : …}`}>…</div>` with
```tsx
                    <IconBadge
                      size="sm"
                      variant={isActive ? 'outline' : 'soft'}
                      color={isRead && !isActive ? 'success' : 'neutral'}
                      label={`บทที่ ${chapter.num}`}
                      className="mt-0.5"
                    >
                      {isRead && !isActive ? <Check className="w-3.5 h-3.5" /> : chapter.num}
                    </IconBadge>
```
   using `size="md"` for the drawer copy.
4. **Progress fill** (~401, `bg-primary h-full`): unchanged.
5. **Next chapter** (`{/* Next Chapter Button */}`, ~611). On a track's last chapter it must not compete with the
   TrackEndCard primary:
```tsx
                <Button
                  color={trackNext.kind === 'end' ? 'neutral' : 'primary'}
                  variant={trackNext.kind === 'end' ? 'outline' : 'solid'}
                  size="sm"
                  disabled={!nextChapter}
                  onClick={() => nextChapter && handleSelectChapter(nextChapter.id)}
                  title={nextChapter ? `บทถัดไป: ${nextChapter.title}` : 'นี่คือบทสุดท้าย'}
                >
```
   keeping the old button's children unchanged and closing with `</Button>`.
6. **Lens quick switch** (the two buttons calling `onExperienceLevelChange('beginner' | 'experienced')`, ~657/667,
   inside `<div className="flex items-center gap-1.5 self-start sm:self-auto">`): replace that `div` and both buttons with
```tsx
              <Tabs<ExperienceLevel>
                variant="segmented"
                aria-label="สลับเลนส์เนื้อหา"
                className="self-start sm:self-auto"
                items={[
                  { value: 'beginner', label: '🌱 ใหม่กับเรื่องนี้' },
                  { value: 'experienced', label: '⚡ ทำงานข้ามทีมมาแล้ว' },
                ]}
                value={chapterLevel}
                onChange={lvl => onExperienceLevelChange?.(lvl)}
              />
```
   (import `ExperienceLevel` from `'../types'` if not already imported.)
7. **Per-chapter level** (`role="group" aria-label="ระดับของบทนี้"`, ~701): replace the `div` and its mapped buttons with
```tsx
            <Tabs<ExperienceLevel>
              variant="segmented"
              aria-label="ระดับของบทนี้"
              className="self-start sm:self-auto"
              items={[
                { value: 'beginner', label: '🌱 มือใหม่' },
                { value: 'experienced', label: '⚡ คุ้นงานแล้ว' },
              ]}
              value={chapterLevel}
              onChange={handleChapterLevelPick}
            />
```
   Keep the `{levelSource === 'chapter' && (…)}` sibling that follows it.
8. **Chapter-end continue** (inside `{onToggleReadChapter && !isCurrentRead && (`, the
   `bg-success hover:bg-success/90 text-success-content` button, ~784–791): replace its opening tag with
```tsx
            <Button
              color="success"
              variant="solid"
              size="md"
              onClick={() => {
                onToggleReadChapter(activeChapter.id);
                if (trackNext.kind === 'next') handleSelectChapter(trackNext.chapterId);
                else if (trackNext.kind === 'not-in-track' && nextChapter) handleSelectChapter(nextChapter.id);
              }}
            >
```
   keeping its `CheckCircle2` icon and label `span`, and close it with `</Button>`. It is not in the spec §10 audit (it
   was emerald, not black); it stays a success solid.
9. **Close index drawer** (`onClick={closeIndex}`, ~979) → `<Button color="neutral" variant="ghost" size="md" onClick={closeIndex}>ปิดสารบัญ</Button>`.

Remove `TAP`/`TAP_GAP` from the `./ui/tapTarget` import only if no raw `<button>` in the file still uses them.

- [ ] **Step 5: Layout tokens**

Run: `node work/design-tokens/map-layout.mjs src/components/GuideTab.tsx src/components/guide/TrackPanel.tsx src/components/guide/TrackFooter.tsx`
For each printed `p-3 sm:p-3.5` line: use `p-box-dense` if the element sits inside a card (an ancestor in the same
component has `rounded-box` and a border), else `p-box`. Then list single-value card radii:
`grep -n 'rounded-2xl' src/components/GuideTab.tsx src/components/guide/TrackPanel.tsx src/components/guide/TrackFooter.tsx`
and change `rounded-2xl` → `rounded-box` on bordered card surfaces (not on buttons, which are now `Button`).

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/components/guide/TrackPanel.test.tsx src/components/ui/hierarchy.test.ts src/components/ui/tapTargets.test.ts src/components/ui/colorTokens.test.ts`
Expected: PASS. If tapTargets reports a `TAP_GAP` row "not found" after a `gap-2 sm:gap-3` → `gap-stack` rewrite, put
`gap-2 sm:gap-3` back on that one row and add it to nothing else (the ring needs a numeric gap); hierarchy then flags
it — in that case keep `gap-2 sm:gap-3` and note the file in the commit message.

- [ ] **Step 7: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/GuideTab.tsx src/components/guide/TrackPanel.tsx src/components/guide/TrackFooter.tsx src/components/guide/TrackPanel.test.tsx src/components/ui/hierarchy.test.ts
git commit -m "feat: Guide reader keeps one primary per view; soft selections and index badges"
```

---

### Task 15: Phase 3 — Guide sections and chapter widgets

**Files:**
- Modify: `src/components/guide/sections/*Section.tsx` (13), `src/components/guide/{SectionOutline,ChapterHero,FirstVisitCard,HeroFigure,IndexEmptyState,LayerGroup,InlineSections}.tsx`, `src/components/content/{ContentBlocks,ContentTable,InlineTerm,RichText}.tsx`, `src/components/{FrictionFaqSection,FrictionPlaybookCard,RoleMindsetCard,ChapterDiagram,ProtocolSimulator}.tsx`, `src/components/diagrams/*.tsx`, `src/components/figures/shared/FigurePanels.tsx`
- Test: `src/components/guide/ChapterHero.test.tsx` (new case), `src/components/ui/hierarchy.test.ts` (`MIGRATED`)

**Interfaces:**
- Consumes: `IconBadge` (Task 9), `ToggleChip`, `Tabs` (Task 11), `map-layout.mjs` (Task 13).
- Produces: nothing new.

- [ ] **Step 1: Write the failing tests**

Append inside `describe('ChapterHero', …)` in `src/components/guide/ChapterHero.test.tsx` (Review Focus 5):
```tsx
  it('the chapter number is a soft badge that still names the chapter to screen readers (§10.3)', () => {
    const s4 = CHAPTERS.find(c => c.id === 's4')!;
    const html = renderToStaticMarkup(<ChapterHero chapter={s4} experienceLevel="beginner" isRead={false} />);
    expect(html).toContain(`aria-label="บทที่ ${s4.num}"`);
    expect(html).not.toMatch(/(?<![\w:/-])bg-primary(?![\w/-])/);
  });
```

In `hierarchy.test.ts` append to `MIGRATED` every file in this task's **Files** list (paths relative to `src/`, e.g.
`'components/guide/sections/DiagramSection.tsx'`, `'components/ChapterDiagram.tsx'`).

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/guide/ChapterHero.test.tsx src/components/ui/hierarchy.test.ts`
Expected: FAIL — no `aria-label="บทที่ …"`; hierarchy lists `bg-primary` in 13 section files and legacy combos.

- [ ] **Step 3: Decorative squares → `IconBadge` (spec §10.3)**

In each of CoreConceptsSection:30, DiagramSection:22, DialogueSection:15, ExamplesSection:15, GlossarySection:18,
ReferenceSection:21, JargonSection:26, FaqSection:17, PitfallsSection:16, PrimerSection:22, ChecklistSection:16,
WorkflowSection:16, OtherSideSection:108 the header square is the `div` whose classes start
`w-7 h-7 rounded-xl bg-primary text-primary-content` and whose only child is an emoji (e.g. `🗺️`, `🔁`).
Replace each with `<IconBadge size="md">EMOJI</IconBadge>` (same emoji) and add
`import { IconBadge } from '../../ui/IconBadge';`.

ChapterHero.tsx:50 (chapter number `span`, `w-8 h-8 … bg-primary`): replace with
`<IconBadge size="md" label={`บทที่ ${chapter.num}`}>{chapter.num}</IconBadge>` and import from `'../ui/IconBadge'`.

- [ ] **Step 4: Bullets, selections (spec §10.2, §10.4)**

- Bullets → `bg-base-content`: CoreConceptsSection:58, PrimerSection:41 and :51, ContentBlocks:177 — in each, replace
  `bg-primary` with `bg-base-content` (these are the small `rounded-full` dots).
- SectionOutline:58 section chips → ToggleChip pill (import `ToggleChip` from `'../ui/ToggleChip'`):
```tsx
            <ToggleChip
              key={key}
              selected={open}
              shape="pill"
              size="xs"
              data-outline-chip={key}
              aria-controls={`sec-${key}`}
              onClick={() => onSelectSection(key)}
              className="shrink-0"
            >
              {SECTION_META[key].chip}
            </ToggleChip>
```
  (`aria-pressed={open}` now comes from ToggleChip.) The row keeps its `SCROLL_ROOM`.
- DiagramSection:94 C4 level → segmented Tabs (import `Tabs` from `'../../ui/Tabs'`), replacing the mapped buttons
  and their wrapper row:
```tsx
          <Tabs<string>
            variant="segmented"
            aria-label="ระดับ C4"
            items={[1, 2, 3, 4].map(lvl => ({ value: String(lvl), label: `L${lvl}` }))}
            value={String(ctx.c4Level)}
            onChange={v => ctx.setC4Level(Number(v))}
          />
```
- OtherSideSection:132 view switch → pills Tabs (spec: tap `gap-6`, which `pills` uses), replacing the
  `<div role="group" aria-label="เลือกฝั่งที่จะดู" … data-other-side-switch>` and its buttons:
```tsx
          <div data-other-side-switch>
            <Tabs<OtherSideView>
              variant="pills"
              aria-label="เลือกฝั่งที่จะดู"
              className="flex-wrap"
              items={SWITCH_OPTIONS}
              value={otherSideView}
              onChange={setOtherSideView}
            />
          </div>
```
  `SWITCH_OPTIONS` already has `{ value, label }` items; import `OtherSideView` from `'./registry'` if not imported.
  `OtherSideSection.test.tsx` expects exactly 1 `aria-pressed="true"` and 2 `"false"` — Tabs keeps that.

- [ ] **Step 5: Layout tokens**

Run: `node work/design-tokens/map-layout.mjs` with every file in **Files** (e.g. `src/components/guide/sections/*.tsx
src/components/guide/SectionOutline.tsx src/components/guide/ChapterHero.tsx src/components/guide/FirstVisitCard.tsx
src/components/guide/HeroFigure.tsx src/components/guide/IndexEmptyState.tsx src/components/guide/LayerGroup.tsx
src/components/guide/InlineSections.tsx src/components/content/*.tsx src/components/FrictionFaqSection.tsx
src/components/FrictionPlaybookCard.tsx src/components/RoleMindsetCard.tsx src/components/ChapterDiagram.tsx
src/components/ProtocolSimulator.tsx src/components/diagrams/*.tsx src/components/figures/shared/FigurePanels.tsx`).
Resolve each printed `p-3 sm:p-3.5` (known sites include ContentBlocks.tsx:58 and PrimerSection.tsx:59) by the rule:
inside a card → `p-box-dense`, else `p-box`. Then
`grep -n 'rounded-2xl' <same files>` and change `rounded-2xl` → `rounded-box` on bordered card surfaces.
`*.test.tsx` files matched by the globs are unaffected (no layout classes).

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/components/guide src/components/ui/hierarchy.test.ts src/components/ui/tapTargets.test.ts src/components/ui/colorTokens.test.ts src/components/ChapterDiagram.test.tsx`
Expected: PASS (including `OtherSideSection.test.tsx` and `rolePerspectiveUi.test.tsx`).

- [ ] **Step 7: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/guide src/components/content src/components/FrictionFaqSection.tsx src/components/FrictionPlaybookCard.tsx src/components/RoleMindsetCard.tsx src/components/ChapterDiagram.tsx src/components/ProtocolSimulator.tsx src/components/diagrams src/components/figures/shared/FigurePanels.tsx src/components/ui/hierarchy.test.ts
git commit -m "feat: guide sections use soft IconBadges and selections; layout tokens in chapter widgets"
```

---

### Task 16: Phase 3 — Quiz

**Files:**
- Modify: `src/components/QuizTab.tsx`, `src/components/quiz/QuizResultScreen.tsx`
- Test: `src/components/quiz/QuizResultScreen.test.tsx` (new case), `src/components/ui/hierarchy.test.ts` (`MIGRATED`)

**Interfaces:**
- Consumes: `Button` (Task 8), `ToggleChip` (Task 11), `map-layout.mjs`.
- Produces: nothing new.

- [ ] **Step 1: Write the failing tests**

Append inside `describe('QuizResultScreen', …)`:
```tsx
  it('retake is the one primary solid; asking AI is a soft button (§10.1)', () => {
    const html = render(3);
    expect(html.match(/bg-primary text-primary-content border-primary/g)).toHaveLength(1);
    expect(html).toMatch(/bg-primary text-primary-content[^>]*>(?:(?!<\/button>).)*ทำแบบทดสอบอีกครั้ง/s);
    expect(html).toMatch(/bg-base-300 text-base-content border-transparent[^>]*>(?:(?!<\/button>).)*ถาม AI ทบทวนข้อที่ยังไม่แม่น/s);
  });
```
Append `'components/QuizTab.tsx'`, `'components/quiz/QuizResultScreen.tsx'` to `MIGRATED`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/quiz/QuizResultScreen.test.tsx src/components/ui/hierarchy.test.ts`
Expected: FAIL — no `border-primary` triplet in the result screen; hierarchy lists `components/QuizTab.tsx: 3 bg-primary`.

- [ ] **Step 3: Replace the sites**

`src/components/quiz/QuizResultScreen.tsx` (import `Button` from `'../ui/Button'`): the `onRestart` button →
```tsx
        <Button color="primary" variant="solid" size="lg" onClick={onRestart} className="w-full sm:w-auto">
          <RotateCcw className="w-4 h-4" />
          <span>ทำแบบทดสอบอีกครั้ง</span>
        </Button>
```
and the `onAskAI` button →
```tsx
        <Button color="neutral" variant="soft" size="lg" onClick={onAskAI} className="w-full sm:w-auto">
          <Bot className="w-4 h-4" />
          <span>ถาม AI ทบทวนข้อที่ยังไม่แม่น</span>
        </Button>
```

`src/components/QuizTab.tsx` (import `Button` from `'./ui/Button'`, `ToggleChip` from `'./ui/ToggleChip'`):
- Round chips (`data-quiz-round={r}`, ~105) →
```tsx
              <ToggleChip
                key={r}
                selected={selected}
                shape="pill"
                tap="gap-8"
                data-quiz-round={r}
                onClick={() => chooseRound(r)}
              >
                {QUIZ_ROUND_META[r].label}{r === role ? ' (สายคุณ)' : ''} · {count} ข้อ
              </ToggleChip>
```
  (their row is `gap-2`, so `gap-8` matches; `QuizTab.test.tsx` matches `aria-pressed="true"[^>]*>สาย Engineering (สายคุณ)` — the label stays the first text.)
- "Read related chapter" (`data-quiz-chapter`, ~312) → `<Button color="neutral" variant="soft" size="lg" data-quiz-chapter={currentQ.chapterId} onClick={() => onOpenChapter(currentQ.chapterId!)}>` with the same `BookOpen` icon and text.
- Next / see result (`onClick={handleNext}`, ~320) → `<Button color="primary" variant="solid" size="lg" onClick={handleNext}>` with the same children.
- Progress fill (~221) stays `bg-primary`. Answer option styles (success/error after answering) stay as mapped in Phase 1.

- [ ] **Step 4: Layout tokens**

Run: `node work/design-tokens/map-layout.mjs src/components/QuizTab.tsx src/components/quiz/QuizResultScreen.tsx`
Resolve printed `p-3 sm:p-3.5` lines by the nested rule; `grep -n 'rounded-2xl'` in both files and change card
surfaces to `rounded-box`.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/QuizTab.test.tsx src/components/quiz src/components/ui/hierarchy.test.ts src/components/ui/tapTargets.test.ts`
Expected: PASS

- [ ] **Step 6: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/QuizTab.tsx src/components/quiz/QuizResultScreen.tsx src/components/quiz/QuizResultScreen.test.tsx src/components/ui/hierarchy.test.ts
git commit -m "feat: Quiz has one primary per view and soft round chips"
```

---

### Task 17: Phase 3 — Glossary (and the last `tokens.*` use)

**Files:**
- Modify: `src/components/glossary/GlossaryPanel.tsx`, `src/components/glossary/GlossaryCategoryMap.tsx`
- Test: `src/components/glossary/GlossaryPanel.test.tsx` (new), `src/components/ui/hierarchy.test.ts` (`MIGRATED`)

**Interfaces:**
- Consumes: `Button` (Task 8), `ToggleChip` (Task 11), `fieldClass` (Task 12), `cn` (Task 8).
- Produces: `GlossaryPanel` no longer imports `src/styles/tokens.ts` (nothing does after this task).

- [ ] **Step 1: Write the failing tests**

Create `src/components/glossary/GlossaryPanel.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../data/chaptersData';
import { GLOSSARY } from '../../data/glossary';
import { GlossaryPanel } from './GlossaryPanel';
import { GlossaryCategoryMap } from './GlossaryCategoryMap';

const noop = () => {};

describe('Glossary hierarchy (spec §10.1, §10.2)', () => {
  it('filter chips are soft toggles with one pressed per row', () => {
    const html = renderToStaticMarkup(<GlossaryPanel terms={GLOSSARY} chapters={CHAPTERS} onNavigateChapter={noop} />);
    expect(html).not.toMatch(/(?<![\w:/-])bg-primary(?![\w/-])/);
    expect(html).toContain('border-base-border-strong bg-base-300 text-base-content font-bold');
  });

  it('an empty search offers a soft clear-filters button, not a primary', () => {
    const html = renderToStaticMarkup(<GlossaryPanel terms={GLOSSARY} chapters={CHAPTERS} onNavigateChapter={noop} query="zzzz-no-match" onQueryChange={noop} />);
    expect(html).toContain('ล้างตัวกรอง');
    expect(html).not.toContain('bg-primary text-primary-content');
  });

  it('category cards are soft toggles', () => {
    const html = renderToStaticMarkup(<GlossaryCategoryMap terms={GLOSSARY} activeCategory="all" onSelectCategory={noop} />);
    expect(html).toContain('aria-pressed');
    expect(html).not.toMatch(/(?<![\w:/-])bg-primary(?![\w/-])/);
  });

  it('no longer reads the old tokens module', () => {
    const src = readFileSync(join(process.cwd(), 'src/components/glossary/GlossaryPanel.tsx'), 'utf8');
    expect(src).not.toContain('styles/tokens');
  });
});
```
Append `'components/glossary/GlossaryPanel.tsx'`, `'components/glossary/GlossaryCategoryMap.tsx'` to `MIGRATED`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/glossary src/components/ui/hierarchy.test.ts`
Expected: FAIL — `bg-primary` in the chips, `styles/tokens` import present.

- [ ] **Step 3: Replace the sites**

`src/components/glossary/GlossaryPanel.tsx`:
- Delete `import { tokens } from '../../styles/tokens';`; add `import { Button } from '../ui/Button';`,
  `import { ToggleChip } from '../ui/ToggleChip';`, `import { cn } from '../ui/cn';`, `import { fieldClass } from '../ui/Input';`.
- Delete the local `chipClass` helper and its comment (~33–40). Each `<button … className={chipClass(active)} …>`
  becomes `<ToggleChip selected={active} shape="chip" tap="gap-6" …same props…>` (drop any `aria-pressed` the caller
  passed; ToggleChip sets it). The rows keep their `gap-1.5`.
- Search input (~117): `className={`${tokens.colors.input} w-full rounded-xl pl-9 pr-9 py-2.5 text-xs sm:text-sm`}` →
  `className={cn(fieldClass(), 'pl-9 pr-9 py-2.5 text-xs sm:text-sm')}`.
- Clear filters (~176, `onClick={clearFilters}`) → `<Button color="neutral" variant="soft" size="sm" onClick={clearFilters}>ล้างตัวกรอง</Button>`.
- Plain-speak box (~196–197): `${tokens.colors.accent.business.bg} ${tokens.colors.accent.business.border}` →
  `bg-business/10 border-business/25`; `${tokens.colors.accent.business.text}` → `text-business`.

`src/components/glossary/GlossaryCategoryMap.tsx` (import `ToggleChip` from `'../ui/ToggleChip'`): the category
`<button … aria-pressed={active} className={…}>` → `<ToggleChip selected={active} shape="card" key={cat.key} onClick={() => onSelectCategory(cat.key)} className="p-3 min-w-0">`
with the same children; in the child heading drop the `active ? '' : 'text-base-content'` conditional and use
`text-base-content` always (the chip is soft now, so text stays dark-on-light).

- [ ] **Step 4: Layout tokens**

Run: `node work/design-tokens/map-layout.mjs src/components/glossary/GlossaryPanel.tsx src/components/glossary/GlossaryCategoryMap.tsx`
Resolve printed lines by the nested rule; card `rounded-2xl` → `rounded-box`.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/glossary src/components/ui/hierarchy.test.ts src/components/ui/tapTargets.test.ts`
Expected: PASS

- [ ] **Step 6: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/glossary src/components/ui/hierarchy.test.ts
git commit -m "feat: Glossary uses soft chips and cards; drops the old tokens module"
```

---

### Task 18: Phase 3 — AI assistant

**Files:**
- Modify: `src/components/AIAssistantTab.tsx`
- Test: `src/components/AIAssistantTab.test.tsx` (new), `src/components/ui/hierarchy.test.ts` (`MIGRATED`)

**Interfaces:**
- Consumes: `Button` (Task 8), `IconBadge` (Task 9), `Alert` (Task 12).
- Produces: nothing new.

- [ ] **Step 1: Write the failing test**

Create `src/components/AIAssistantTab.test.tsx` (Review Focus 4):
```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { AIAssistantTab } from './AIAssistantTab';

describe('AIAssistantTab hierarchy (spec §10.1, §10.3, §10.5)', () => {
  const html = renderToStaticMarkup(<AIAssistantTab onQuestionAsked={() => {}} />);
  const send = html.match(/<button[^>]*type="submit"[^>]*>/)?.[0] ?? '';

  it('send is the one primary solid and still submits the form', () => {
    expect(send).toContain('bg-primary text-primary-content border-primary');
    expect(send).toContain('absolute');
    expect(html.match(/bg-primary text-primary-content border-primary/g)).toHaveLength(1);
  });

  it('avatars are soft decorative badges; the send button is the only primary fill', () => {
    expect(html.match(/(?<![\w:/-])bg-primary(?![\w/-])/g)).toHaveLength(1);
    expect(html).toContain('aria-hidden="true"');
  });
});
```
Append `'components/AIAssistantTab.tsx'` to `MIGRATED`.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/AIAssistantTab.test.tsx src/components/ui/hierarchy.test.ts`
Expected: FAIL — send has `bg-primary hover:bg-primary/90` without the `border-primary` triplet; avatars use `bg-primary`.

- [ ] **Step 3: Replace the sites**

In `src/components/AIAssistantTab.tsx` import `Button`, `IconBadge`, `Alert` from `'./ui/…'`.
- Avatars (the `w-8 h-8 rounded-xl …` div at ~198 and the loading avatar at ~299):
  `<IconBadge size="md">{isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}</IconBadge>` and
  `<IconBadge size="md"><Bot className="w-4 h-4" /></IconBadge>`.
- User bubble (~210): the `isAi ? … : …` user branch `'bg-primary text-primary-content shadow-xs'` →
  `'bg-base-300 text-base-content border border-base-border'`.
- Offline notice (`{isOffline && (` → `<div role="status" …>`, ~124–134): replace the opening
  `<div role="status" className="…">` with `<Alert color="warning" live icon={<WifiOff className="w-4 h-4" />}>`, its
  closing `</div>` with `</Alert>`, and delete the old `<WifiOff className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />`
  line (Alert renders the icon, hidden). The `<p>` with `<strong>โหมดออฟไลน์:</strong>` stays unchanged.
- Send (`type="submit"`, ~329):
```tsx
            <Button
              type="submit"
              color="primary"
              variant="solid"
              size="sm"
              tap="positioned"
              disabled={!inputQuestion.trim() || isLoading}
              className="absolute right-2"
            >
```
  with the same `isLoading ? <Loader2 …/> : <>…</>` children.
- The text input keeps its raw `<input>`; only its radius changes in Step 4.

- [ ] **Step 4: Layout tokens**

Run: `node work/design-tokens/map-layout.mjs src/components/AIAssistantTab.tsx`
Resolve printed lines; card surfaces `rounded-2xl` → `rounded-box`.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/AIAssistantTab.test.tsx src/components/ui/hierarchy.test.ts src/components/ui/tapTargets.test.ts`
Expected: PASS

- [ ] **Step 6: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/AIAssistantTab.tsx src/components/AIAssistantTab.test.tsx src/components/ui/hierarchy.test.ts
git commit -m "feat: AI tab has one primary send and soft avatars and bubbles"
```

---

### Task 19: Phase 3 — Gamification, final guardrail, delete `tokens.ts`

**Files:**
- Modify: `src/components/GamificationTab.tsx`, `src/components/ui/colorTokens.test.ts`, `src/components/ui/hierarchy.test.ts`
- Delete: `src/styles/tokens.ts`
- Test: `src/components/GamificationTab.test.tsx` (new)

**Interfaces:**
- Consumes: `Button`, `IconBadge`, `Card` (Tasks 8–10); the §10.4 progress-fill map (same values as `PROGRESS_FILL` in `hierarchy.test.ts`).
- Produces: final guards — `colorTokens.test.ts` without `BASELINE`, plus "`bg-primary` outside `ui/` only at the §10.4 progress sites"; `hierarchy.test.ts` over every file.

- [ ] **Step 1: Write the failing tests**

Create `src/components/GamificationTab.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { INITIAL_BADGES } from '../data/badgesData';
import type { UserStats } from '../types';
import { GamificationTab } from './GamificationTab';

const noop = () => {};
const stats: UserStats = {
  xp: 120, level: 2, levelTitle: 'Bridge Apprentice', quizzesCompleted: 0, correctAnswers: 0,
  aiQuestionsAsked: 0, readChapters: [], bookmarks: [], xpClaims: [],
};

describe('GamificationTab hierarchy (spec §10.1, §10.2, §10.5)', () => {
  const html = renderToStaticMarkup(
    <GamificationTab badges={INITIAL_BADGES} userStats={stats} chapterCount={19} onStartQuiz={noop} onGoToGuide={noop} />,
  );

  it('the level square is a soft badge that still announces the level', () => {
    expect(html).toContain('aria-label="Lv.2"');
  });

  it('go to quiz is the one primary solid; progress is the only other primary fill', () => {
    expect(html.match(/bg-primary text-primary-content border-primary/g)).toHaveLength(1);
    expect(html.match(/(?<![\w:/-])bg-primary(?![\w/-])/g)).toHaveLength(2);
  });
});
```

In `src/components/ui/colorTokens.test.ts`:
- Delete the `BASELINE` constant, its comment, and the test "a baselined file still has exactly its recorded count…".
- Change the test "a file outside the baseline has no raw colour" to
```ts
  it('no file has a raw colour', () => {
    const bad = files.filter(f => f.found.length)
      .flatMap(f => f.found.slice(0, 5).map(v => `${f.file}:${v.line} ${v.text}`));
    expect(bad).toEqual([]);
  });
```
- Add this test (the map repeats `PROGRESS_FILL` from `hierarchy.test.ts`; do not import one test file from another,
  vitest would run the imported suite twice):
```ts
  it('bg-primary outside ui/ appears only at the §10.4 progress fills', () => {
    const PROGRESS_FILL = {
      'components/GamificationTab.tsx': 1,
      'components/GuideTab.tsx': 1,
      'components/Header.tsx': 1,
      'components/QuizTab.tsx': 1,
    };
    const fills = Object.fromEntries(files
      .map(f => [f.file, (f.src.match(/(?<![\w:/-])bg-primary(?![\w/-])/g) ?? []).length] as const)
      .filter(([, n]) => n > 0));
    expect(fills).toEqual(PROGRESS_FILL);
  });
```

In `src/components/ui/hierarchy.test.ts` replace the `MIGRATED` array with every non-test `.tsx` under
`src/components/` (except `ui/`) plus `App.tsx`:
```ts
import { readdirSync } from 'node:fs';

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === 'ui' ? [] : sourceFiles(p);
    return p.endsWith('.tsx') && !p.includes('.test.') ? [p.slice(SRC.length + 1)] : [];
  });
}

const MIGRATED: string[] = [...sourceFiles(join(SRC, 'components')), 'App.tsx'];
```
(merge the `readdirSync` import into the existing `node:fs` import).

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/GamificationTab.test.tsx src/components/ui/colorTokens.test.ts src/components/ui/hierarchy.test.ts`
Expected: FAIL — no `aria-label="Lv.2"`; `bg-primary` count in GamificationTab is 4; hierarchy lists GamificationTab
legacy combos.

- [ ] **Step 3: Replace the Gamification sites**

In `src/components/GamificationTab.tsx` import `Button`, `IconBadge`, `Card` from `'./ui/…'`.
- Level square (~67, `w-14 h-14 sm:w-16 sm:h-16 … bg-primary`) →
  `<IconBadge size="lg" label={`Lv.${currentTier.level}`}>Lv.{currentTier.level}</IconBadge>`.
- Progress fill (~100) stays `bg-primary`.
- Badge icon (~179): unlocked →
  `<IconBadge size="none" className="w-9 h-9 sm:w-10 sm:h-10">{getIcon(badge.icon)}</IconBadge>`; locked →
  `<IconBadge size="none" className="w-9 h-9 sm:w-10 sm:h-10 opacity-50 text-base-content-subtle"><Lock className="w-4 h-4 sm:w-5 sm:h-5" /></IconBadge>`
  (write it as `badge.unlocked ? <IconBadge …unlocked…> : <IconBadge …locked…>`; spec §10.2 — a state, not a selection).
- CTA card (~213, `bg-primary text-primary-content … rounded-2xl sm:rounded-3xl`) →
  `<Card variant="subtle" padding="spacious" className="flex flex-col sm:flex-row items-center justify-between gap-4">`
  closing with `</Card>`; its paragraph (~216) `text-primary-content/70` → `text-base-content-secondary`.
- "ไปทำควิซ (+XP)" (~221) → `<Button color="primary" variant="solid" size="md" onClick={onStartQuiz}>ไปทำควิซ (+XP)</Button>`.
- "keep reading" (~227, `onClick={onGoToGuide}`) → `<Button color="neutral" variant="outline" size="md" onClick={onGoToGuide}>` with the same text.

- [ ] **Step 4: Layout tokens and delete the old module**

Run: `node work/design-tokens/map-layout.mjs src/components/GamificationTab.tsx`
Resolve printed lines; card `rounded-2xl` → `rounded-box`.

Run: `grep -rn "styles/tokens" src` → expect no output. Then `git rm src/styles/tokens.ts` (and the empty
`src/styles/` directory disappears with it).

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run src/components/GamificationTab.test.tsx src/components/ui`
Expected: PASS — including `hierarchy.test.ts` over every file (a failure here names a file an earlier Phase 3 task
missed; migrate it with `map-layout.mjs` and the nested rule, and move any stray `bg-primary` to its §10 target).

- [ ] **Step 6: Run the completion gate**

Run: `npm run lint && npm test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/GamificationTab.tsx src/components/GamificationTab.test.tsx src/components/ui/colorTokens.test.ts src/components/ui/hierarchy.test.ts
git commit -m "feat: Gamification hierarchy; final colour guard; remove styles/tokens.ts"
```

---

### Task 20: Verification and browser acceptance

**Files:**
- Create (not committed): `work/acceptance-design-tokens.md`, screenshots under `work/design-tokens/after/`

**Interfaces:**
- Consumes: everything above; "before" screenshots from Task 1 Step 0.
- Produces: the acceptance record.

- [ ] **Step 1: Static gates (spec §13.1–13.2)**

Run: `npm run lint && npm test`
Expected: tsc clean; every test file passes.

Run:
```bash
npm run build >/dev/null && CSS=$(ls dist/assets/*.css) && \
grep -o '\.p-box{padding:var(--spacing-box)}' $CSS && \
grep -o '\.dark{--color-base-100:#141414' $CSS && \
grep -o '@media (width>=40rem){:root{--spacing-page:1.5rem;--spacing-box:1rem' $CSS
```
Expected: three matches.

- [ ] **Step 2: Primary count per view (spec §13.4)**

Run: `grep -rn 'color="primary" variant="solid"' src/components --include='*.tsx' | grep -v '/ui/' | grep -v '\.test\.'`
Expected: exactly QuizTab.tsx (next), QuizResultScreen.tsx (retake), AIAssistantTab.tsx (send), TrackFooter.tsx (start
quiz), GamificationTab.tsx (go to quiz); GuideTab's next-chapter primary is conditional (`color={… 'primary'}`) and
turns `neutral outline` on a track's last chapter.

- [ ] **Step 3: Browser acceptance (preview tools; do not start servers from Bash)**

Start `npm run dev` with the preview tools. For each of the 5 views × light/dark × 375px/1280px (20 captures, same
names as `work/design-tokens/before/`, saved to `work/design-tokens/after/`):
1. Guide reader — first-visit card dismissed; desktop shows the sidebar, mobile has the index drawer open.
2. Guide ch. 15 glossary.
3. Quiz — one capture in progress (after answering, so "next" shows) and the result screen.
4. AI.
5. Gamification.

For each pair check: (a) at most one solid primary button visible (§13.4; on the Guide reader at a track's last
chapter, only the TrackEndCard "ทำแบบทดสอบ" is solid); (b) selected tabs/chips/segments are soft grey with a bold
label, never a black/white fill; (c) decorative squares are soft; progress bars stay solid; (d) dark mode shows dark
surfaces everywhere, including ChapterDiagram cards (slate → neutral, the accepted change) and the iron triangle
tint on ch. 11; (e) at 375px no horizontal page scroll, the header nav scrolls inside itself, Thai labels do not
clip; (f) any other difference is one of the §7 "Shift" rows.

- [ ] **Step 4: Write the acceptance record**

Write `work/acceptance-design-tokens.md` with: date, commit hash (`git rev-parse --short HEAD`), the gate results
from Steps 1–2, and a table of the 20 captures (view, theme, width, before/after file, checks a–f pass/fail, note).
List every failure with the file to fix; fix it in a follow-up commit on this branch and re-run Steps 1–3 for the
affected view.

- [ ] **Step 5: Final gate**

Run: `npm run lint && npm test`
Expected: all pass. (Nothing to commit: `work/` is git-ignored.)
