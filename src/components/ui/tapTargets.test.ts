import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { TAP, TAP_GAP, TAP_POSITIONED, TAP_Y } from './tapTarget';

/**
 * Guard: every `<button>`, `<a>` and `role="button"` element under src/components carries a mobile
 * tap target (see tapTarget.ts). Reads the source, not a render, so it needs no DOM.
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
function interactiveTags(src: string): { line: number; text: string }[] {
  const out: { line: number; text: string }[] = [];
  const re = /<(button|a)(?=[\s>])|<[a-z]+(?=[^<>]*role="button")/g;
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
    out.push({ line: src.slice(0, m.index).split('\n').length, text: src.slice(m.index, i + 1) });
  }
  return out;
}

const TAP_REF = /\$\{(TAP|TAP_Y|TAP_POSITIONED|TAP_GAP\[\d+\])\}/;
// The text-only padding pattern (CoreConceptsSection, InlineTerm) and a control already 44px tall.
const LITERAL_OK = /-my-3\.5 py-3\.5 sm:my-0 sm:py-0|min-h-\[44px\]/;

/** A tag is covered directly, or through a class helper (`segmentClass(…)`) defined in the file with a ring. */
function covered(tag: string, src: string): boolean {
  if (TAP_REF.test(tag) || LITERAL_OK.test(tag)) return true;
  const helpers = [...tag.matchAll(/className=\{(?:`\$\{)?([A-Za-z_]\w*)/g)].map(h => h[1]);
  return helpers.some(name => {
    const at = src.search(new RegExp(`const ${name}\\b`));
    return at >= 0 && TAP_REF.test(src.slice(at, at + 200));
  });
}

describe('mobile tap targets', () => {
  const files = sourceFiles(ROOT);
  const tags = files.flatMap(f => {
    const src = readFileSync(f, 'utf8');
    return interactiveTags(src).map(t => ({ ...t, file: relative(ROOT, f), src }));
  });

  it('finds the interactive elements it is guarding (not passing on an empty scan)', () => {
    expect(tags.length).toBeGreaterThan(100);
    expect(tags.filter(t => t.file === 'Header.tsx').length).toBeGreaterThanOrEqual(13);
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
