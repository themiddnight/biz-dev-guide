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
