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
