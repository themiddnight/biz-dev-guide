import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

// Vercel compiles each api/ file and everything it imports file by file, then runs them as native
// ESM ("type": "module"), which never guesses an extension: `from "./knowledge-base"` crashes the
// function with ERR_MODULE_NOT_FOUND. Vite and Vitest resolve it fine, so only this walk notices.
const ROOT = join(__dirname, '..');
const RUNTIME_IMPORT = /^\s*(?:import|export)\s+(?!type\b)(?:[\s\S]*?\sfrom\s+)?['"](\.{1,2}\/[^'"]+)['"]/gm;

function extensionlessImports(entry: string): string[] {
  const seen = new Set<string>();
  const missing: string[] = [];
  const visit = (file: string) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const [, spec] of readFileSync(file, 'utf8').matchAll(RUNTIME_IMPORT)) {
      if (!spec.endsWith('.js')) {
        missing.push(`${relative(ROOT, file)}: "${spec}"`);
        continue;
      }
      visit(join(dirname(file), spec.replace(/\.js$/, '.ts')));
    }
  };
  visit(entry);
  return missing;
}

describe('api functions run as native ESM', () => {
  const entries = readdirSync(__dirname).filter((f) => f.endsWith('.ts') && !f.endsWith('.test.ts'));

  it.each(entries)('%s imports every local module with its .js extension', (entry) => {
    expect(extensionlessImports(join(__dirname, entry))).toEqual([]);
  });
});
