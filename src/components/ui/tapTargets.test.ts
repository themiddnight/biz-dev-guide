import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { TAP, TAP_GAP, TAP_POSITIONED, TAP_Y } from './tapTarget';

/**
 * Guard: every `<button>`, `<a>`, `<summary>` and `role="button"` element under src/components
 * carries a mobile tap target (see tapTarget.ts), and every `TAP_GAP[n]` ring matches the gap its
 * row really has. Reads the source, not a render, so it needs no DOM.
 */

const ROOT = join(process.cwd(), 'src/components');

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return sourceFiles(p);
    return p.endsWith('.tsx') && !p.includes('.test.') ? [p] : [];
  });
}

/**
 * Opening tags of interactive elements. Walks the tag honouring strings, `{…}` and template
 * literals with `${…}`, so a `>` inside `onClick={() => …}` or a class expression does not end it.
 */
const INTERACTIVE = /<(button|a|summary)(?=[\s>])|<[a-z]+(?=[^<>]*role="button")/g;

function interactiveTags(src: string, pattern: RegExp = INTERACTIVE): { line: number; index: number; text: string }[] {
  const out: { line: number; index: number; text: string }[] = [];
  const re = new RegExp(pattern.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const stack: ('tag' | 'code' | 'tpl')[] = ['tag'];
    let quote: string | null = null;
    let i = m.index + 1;
    for (; i < src.length; i++) {
      const c = src[i];
      if (quote) {
        if (c === '\\') i++;
        else if (c === quote) quote = null;
        continue;
      }
      const top = stack[stack.length - 1];
      if (top === 'tpl') {
        if (c === '\\') i++;
        else if (c === '`') stack.pop();
        else if (c === '$' && src[i + 1] === '{') { stack.push('code'); i++; }
        continue;
      }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (top === 'tag') {
        if (c === '{') stack.push('code');
        else if (c === '>') break;
        continue;
      }
      if (c === '`') stack.push('tpl');
      else if (c === '{') stack.push('code');
      else if (c === '}') stack.pop();
    }
    out.push({ line: src.slice(0, m.index).split('\n').length, index: m.index, text: src.slice(m.index, i + 1) });
  }
  return out;
}

const TAP_REF = /\$\{(TAP|TAP_Y|TAP_POSITIONED|TAP_GAP\[\d+\])\}/;
// The text-only padding pattern (CoreConceptsSection, InlineTerm) and a control already 44px tall.
const LITERAL_OK = /-my-3\.5 py-3\.5 sm:my-0 sm:py-0|min-h-\[44px\]/;
// The ui/ class builders: each always includes a ring (ui/*.test.tsx prove it for every combination).
const UI_BUILDER = /\b(?:buttonClass|chipClass|tapClass)\(/;

/** The class helpers (`segmentClass(…)`) a tag uses, as the source right after their definition. */
function helperBodies(tag: string, src: string): string[] {
  const helpers = [...tag.matchAll(/className=\{(?:`\$\{)?([A-Za-z_]\w*)/g)].map(h => h[1]);
  return helpers.flatMap(name => {
    const at = src.search(new RegExp(`const ${name}\\b`));
    return at >= 0 ? [src.slice(at, at + 200)] : [];
  });
}

/** A tag is covered directly, or through a class helper defined in the file with a ring. */
function covered(tag: string, src: string): boolean {
  if (TAP_REF.test(tag) || LITERAL_OK.test(tag) || UI_BUILDER.test(tag)) return true;
  return helperBodies(tag, src).some(body => TAP_REF.test(body));
}

/** The `TAP_GAP[n]` key a tag uses, directly or through a helper; null when it uses none. */
function gapKey(tag: string, src: string): number | null {
  for (const text of [tag, ...helperBodies(tag, src)]) {
    const m = text.match(/\$\{TAP_GAP\[(\d+)\]\}/);
    if (m) return Number(m[1]);
  }
  return null;
}

/** Tailwind spacing scale: 1 unit = 4px. */
const px = (unit: string) => Number(unit) * 4;

/** The mobile gaps (unprefixed `gap-*`, `gap-x/y-*`, `space-x/y-*`) a tag's classes declare, in px. */
function declaredGaps(tag: string): number[] {
  return [...tag.matchAll(/(?<![\w:-])(?:gap(?:-[xy])?|space-[xy])-(\d+(?:\.5)?)(?![\w.])/g)].map(m => px(m[1]));
}

/**
 * The row a `TAP_GAP` control sits in: the nearest earlier opening tag that declares a gap, skipping
 * the control's own siblings (other `TAP_GAP` controls). Returns its smallest gap in px.
 */
function rowGap(control: { index: number }, src: string): { gap: number; line: number } | null {
  const earlier = interactiveTags(src, /<[a-z]+(?=[\s>])/g).filter(t => t.index < control.index).reverse();
  for (const t of earlier) {
    if (gapKey(t.text, src) !== null) continue;
    const gaps = declaredGaps(t.text);
    if (gaps.length) return { gap: Math.min(...gaps), line: t.line };
  }
  return null;
}

describe('mobile tap targets', () => {
  const files = sourceFiles(ROOT);
  const tags = files.flatMap(f => {
    const src = readFileSync(f, 'utf8');
    return interactiveTags(src).map(t => ({ ...t, file: relative(ROOT, f), src }));
  });

  it('finds the interactive elements it is guarding (not passing on an empty scan)', () => {
    expect(tags.length).toBeGreaterThan(60);
    expect(tags.filter(t => t.file === 'ChapterDiagram.tsx').length).toBeGreaterThanOrEqual(10);
  });

  it('reads a tag whole even when its attributes contain > and nested templates', () => {
    const src = '<button onClick={() => go(a > b)} className={`${TAP} x ${on ? `y` : \'z\'}`}>hi</button><a href="#">x</a>';
    const found = interactiveTags(src);
    expect(found.map(t => t.text)).toEqual([
      '<button onClick={() => go(a > b)} className={`${TAP} x ${on ? `y` : \'z\'}`}>',
      '<a href="#">',
    ]);
  });

  it('every button, link and role=button element has a tap target', () => {
    const missing = tags.filter(t => !covered(t.text, t.src)).map(t => `${t.file}:${t.line}`);
    expect(missing).toEqual([]);
  });

  it('every TAP_GAP ring matches the real gap of its row, so neighbouring rings never overlap', () => {
    const gapped = tags.filter(t => gapKey(t.text, t.src) !== null);
    expect(gapped.length).toBeGreaterThanOrEqual(5);
    const wrong = gapped.flatMap(t => {
      const key = gapKey(t.text, t.src);
      const row = rowGap(t, t.src);
      return row && row.gap === key ? [] : [`${t.file}:${t.line} TAP_GAP[${key}] in a row with gap ${row ? `${row.gap}px (line ${row.line})` : 'not found'}`];
    });
    expect(wrong).toEqual([]);
  });

  it('reads a row gap from the parent, not from a sibling control or a prefixed class', () => {
    const src = [
      '<ol className="sm:gap-4 space-y-1">',
      '<li><button className={`${TAP_GAP[4]} flex gap-2`}>a</button></li>',
      '<li><button className={`${TAP_GAP[4]} flex gap-2`}>b</button></li>',
      '</ol>',
    ].join('\n');
    const second = interactiveTags(src).filter(t => t.text.startsWith('<button'))[1];
    expect(rowGap(second, src)).toEqual({ gap: 4, line: 1 });
    expect(declaredGaps('<div className="gap-1.5 max-sm:gap-4 gap-x-2">')).toEqual([6, 8]);
  });

  it('counts a tag built by a ui/ class builder as covered, and nothing else by name alone', () => {
    expect(covered('<button className={cn(buttonClass({ size }), className)}>', '')).toBe(true);
    expect(covered('<button className={chipClass({ selected, tap })}>', '')).toBe(true);
    expect(covered('<a className={`${tapClass(tap)} x`}>', '')).toBe(true);
    expect(covered('<button className={myButtonClass}>', '')).toBe(false);
    expect(covered('<button className="px-3 py-1">', '')).toBe(false);
  });

  it('the rings only exist below sm, so the desktop layout is untouched', () => {
    for (const cls of [TAP, TAP_Y, TAP_POSITIONED, ...Object.values(TAP_GAP)]) {
      for (const c of cls.split(' ')) expect(c.startsWith('max-sm:'), c).toBe(true);
    }
  });

  it('the full rings reach 44px; the positioned one does not reposition its control', () => {
    for (const cls of [TAP, TAP_Y, TAP_POSITIONED]) expect(cls).toContain('max-sm:before:min-h-11');
    expect(TAP).toContain('max-sm:before:min-w-11');
    expect(TAP_POSITIONED).not.toContain('relative');
  });
});
