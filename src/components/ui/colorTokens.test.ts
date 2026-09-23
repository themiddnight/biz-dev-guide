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

  it('no file has a raw colour', () => {
    const bad = files.filter(f => f.found.length)
      .flatMap(f => f.found.slice(0, 5).map(v => `${f.file}:${v.line} ${v.text}`));
    expect(bad).toEqual([]);
  });

  it('bg-primary outside ui/ appears only at the §10.4 progress fills', () => {
    const PROGRESS_FILL = {
      'components/QuizTab.tsx': 1,
    };
    const fills = Object.fromEntries(files
      .map(f => [f.file, (f.src.match(/(?<![\w:/-])bg-primary(?![\w/-])/g) ?? []).length] as const)
      .filter(([, n]) => n > 0));
    expect(fills).toEqual(PROGRESS_FILL);
  });
});
