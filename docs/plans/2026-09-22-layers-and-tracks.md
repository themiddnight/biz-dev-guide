# Layers, Outline, Tracks, Onboarding and Deep Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the one-size chapter reader with level-driven reading layers (Core / Apply / Deep), a sticky in-chapter outline, reading tracks, a first-visit level card, and hash deep links with resume.

**Architecture:** Pure, unit-tested modules (`sectionLayers`, `readingTracks`, `chapterRoute`) hold every rule. `GuideTab.tsx` (1789 lines) is first split into one component per section (verbatim JSX moves). Then it renders sections from the layer config, and small components (`LayerGroup`, `SectionOutline`, `TrackPanel`, `TrackFooter`, `FirstVisitCard`, `ResumeBanner`) plug in. `activeChapterId` is lifted into a `useChapterRoute` hook in `App.tsx` that syncs `location.hash`.

**Tech Stack:** React 19, Vite 8.3, TypeScript (`bun run lint` = `tsc --noEmit`), Tailwind 4, bun. Adds Vitest 5.0.1 (node environment, no DOM library).

**Spec:** `docs/specs/2026-09-22-layers-and-tracks.md`. Executors read the spec section each task cites. Section numbers below (§x.y) and acceptance criteria (AC n) refer to it.

## Global Constraints

- UI copy is Thai-first. Every quoted string in this plan or the spec is literal copy to ship, character for character.
- Tests run with **`bun run test`** (script `"test": "vitest run"`). Never use `bun test`: Bun's runner resolves `data/chaptersData.tsx` to itself and cannot load `CHAPTERS`.
- Test files import from `vitest` explicitly: `import { describe, it, expect } from 'vitest'`. `tsc` typechecks test files (`tsconfig.json` has no `include`).
- Use the default `node` Vitest environment. Add no DOM library (no jsdom, no happy-dom, no testing-library).
- These files do not change: `RoleMindsetCard.tsx`, `FrictionPlaybookCard.tsx`, `FrictionFaqSection.tsx`, `ChapterDiagram.tsx`, `ProtocolSimulator.tsx`, `src/components/glossary/*`, `src/components/diagrams/*`, `src/components/content/ContentBlocks.tsx`, and all chapter data files.
- Section internals do not change. Extracted JSX differs from the original only by whitespace and these substitutions: `activeChapter`→`chapter`, `openSections.X`→`isOpen`, `toggleSection('X')`→`onToggle()`, and closure handlers/state→`ctx.<name>`.
- **Line numbers** for `src/components/GuideTab.tsx` refer to base commit `06df5e5`. Line positions shift as tasks land, so find each block in the current file by its JSX comment marker (quoted in each task). Read the original with `git show 06df5e5:src/components/GuideTab.tsx | sed -n 'A,Bp'`. Never read GuideTab whole: use Serena `get_symbols_overview`/`find_symbol` or ranged `sed -n`.
- Every task finishes with `bun run lint` and `bun run build` passing. Once Task 1 lands, `bun run test` must pass too.
- Commit messages end with the line `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.
- **Browser verification procedure** (UI tasks):
  1. Start or reuse the dev server with the Claude Browser tool `preview_start` using `name: "dev"`. The app is at `http://localhost:53479`; if the preview reports a different port, use that one.
  2. Use `navigate`, then prefer `javascript_tool` / `find` / `get_page_text` over screenshots. Use `resize_window` with `preset: "mobile"` (375px) and `preset: "desktop"`, and `colorScheme: "dark"` / `"light"` for the theme checks.
  3. For a fresh profile, run `localStorage.clear(); location.hash=''; location.reload()`.
  4. Run `read_console_messages` with `onlyErrors: true`; the result must be empty.
  5. Record evidence in `work/browser-evidence.md`, overwriting stale notes.

---

## File map

| Path | Task | Responsibility |
|---|---|---|
| `package.json`, `bun.lock` | 1 | `vitest@5.0.1` dev dep, `"test": "vitest run"` |
| `src/data/sectionLayers.ts` (+ `.test.ts`) | 1 | layer config, overrides, meta, presence, derivation, `getReferenceSections`, `sectionHasTool`, `LAYER_META` |
| `src/data/readingTracks.ts` (+ `.test.ts`) | 2 | track config and functions |
| `src/lib/chapterRoute.ts` (+ `.test.ts`) | 3 | hash format/parse, `RequestedSection` type |
| `src/components/guide/sections/registry.tsx` | 4 (types), 6 (registry) | `GuideSectionContext`, `SectionProps`, `SECTION_COMPONENTS`, mindset/friction adapters |
| `src/components/guide/sections/{Primer,Jargon,Dialogue,Diagram}Section.tsx` | 4 | verbatim moves |
| `src/components/guide/sections/{Faq,Examples,CoreConcepts,Reference,Glossary}Section.tsx` | 5 | verbatim moves |
| `src/components/guide/sections/{Workflow,Pitfalls,Checklist}Section.tsx` | 6 | verbatim moves |
| `src/components/guide/ChapterHero.tsx`, `src/components/guide/LayerGroup.tsx` | 7 | hero per level; layer header + body |
| `src/components/guide/SectionOutline.tsx`, `src/index.css` | 8 | sticky chip bar, `--outline-h` |
| `src/components/guide/TrackPanel.tsx`, `src/components/guide/TrackFooter.tsx` | 9 | tracks in index and footer |
| `src/lib/storage.ts`, `src/components/guide/FirstVisitCard.tsx`, `src/App.tsx` | 10 | first visit |
| `src/hooks/useChapterRoute.ts`, `src/App.tsx`, `src/components/content/RichText.tsx` | 11 | deep links, lifted `activeChapterId` |
| `src/components/guide/ResumeBanner.tsx`, `src/hooks/useChapterRoute.ts` | 12 | last chapter + resume |
| `src/components/GuideTab.tsx` | 4–12 | orchestration only by the end |

---

### Task 1: Vitest setup and `sectionLayers` module

**Files:**
- Modify: `package.json` (scripts + devDependencies), `bun.lock`
- Create: `src/data/sectionLayers.ts`
- Test: `src/data/sectionLayers.test.ts`

**Interfaces:**
- Consumes: `Chapter`, `ExperienceLevel`, `ChapterContentSection` from `src/types.ts`. `CHAPTERS` from `src/data/chaptersData` (tests only).
- Produces (exact exports of `src/data/sectionLayers.ts`):
  - `type Layer = 'core' | 'apply' | 'deep'`
  - `const LAYERS: readonly Layer[]`
  - `type SectionKey`, the 14 keys
  - `const SECTION_KEYS: readonly SectionKey[]`
  - `const LAYER_CONFIG: Record<ExperienceLevel, Record<Layer, readonly SectionKey[]>>`
  - `const CHAPTER_CORE_OVERRIDES: Readonly<Record<string, readonly SectionKey[]>>`
  - `const SECTION_META: Record<SectionKey, { chip: string; minutes: number }>`
  - `const LAYER_META: Record<Layer, { name: string; short: string }>`
  - `interface LayerGroup { layer: Layer; sections: SectionKey[]; minutes: number }`
  - `interface OpenState { layers: Record<Layer, boolean>; sections: Partial<Record<SectionKey, boolean>> }`
  - `isSectionKey(value: string): value is SectionKey`
  - `getReferenceSections(chapter: Chapter): ChapterContentSection[]`
  - `isSectionPresent(chapter: Chapter, key: SectionKey): boolean`
  - `sectionHasTool(chapter: Chapter, key: SectionKey): boolean`
  - `getLayerOf(level: ExperienceLevel, key: SectionKey, chapterId: string): Layer`
  - `getChapterLayout(level: ExperienceLevel, chapter: Chapter): LayerGroup[]`
  - `deriveOpenState(layout: LayerGroup[]): OpenState`
  - `expandAll(layout: LayerGroup[]): OpenState`
  - `collapseAll(layout: LayerGroup[]): OpenState`
  - `openSection(state: OpenState, layout: LayerGroup[], key: SectionKey): OpenState`
  - `toggleSection(state: OpenState, key: SectionKey): OpenState`
  - `toggleLayer(state: OpenState, layer: Layer): OpenState`

- [ ] **Step 1: Install Vitest and add the script**

Run `bun pm view vitest@5.0.1 peerDependencies`. Expected: `"vite": "^6.4.0 || ^7.0.0 || ^8.0.0"`. If a newer vitest exists whose `vite` peer range includes `^8`, use it instead. Then run:

```bash
cd /Users/Pathompong/Sites/Personal/biz-dev-guide && bun add -d vitest@5.0.1
```

In `package.json` `scripts`, add after `"lint"`:

```json
    "test": "vitest run"
```

Vitest reuses `vite.config.ts`. Create no separate vitest config.

- [ ] **Step 2: Write the failing test** — `src/data/sectionLayers.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import {
  LAYERS, SECTION_KEYS, LAYER_CONFIG, SECTION_META,
  getLayerOf, getChapterLayout, deriveOpenState, expandAll, collapseAll,
  openSection, toggleSection, toggleLayer, isSectionPresent, isSectionKey, sectionHasTool,
  type SectionKey,
} from './sectionLayers';
import type { ExperienceLevel } from '../types';

const ch = (id: string) => {
  const c = CHAPTERS.find(x => x.id === id);
  if (!c) throw new Error(`missing ${id}`);
  return c;
};
const LEVELS: ExperienceLevel[] = ['beginner', 'experienced'];
const core = (level: ExperienceLevel, id: string) =>
  getChapterLayout(level, ch(id)).find(g => g.layer === 'core')!.sections;

describe('LAYER_CONFIG', () => {
  it.each(LEVELS)('%s contains all 14 keys exactly once', level => {
    const all = LAYERS.flatMap(l => LAYER_CONFIG[level][l]);
    expect(all).toHaveLength(14);
    expect([...all].sort()).toEqual([...SECTION_KEYS].sort());
  });
  it('isSectionKey accepts keys and rejects others', () => {
    expect(isSectionKey('diagram')).toBe(true);
    expect(isSectionKey('xyz')).toBe(false);
  });
});

describe('getLayerOf', () => {
  it('beginner samples', () => {
    expect(getLayerOf('beginner', 'jargon', 's1')).toBe('core');
    expect(getLayerOf('beginner', 'friction', 's1')).toBe('apply');
    expect(getLayerOf('beginner', 'mindset', 's1')).toBe('deep');
  });
  it('experienced samples', () => {
    expect(getLayerOf('experienced', 'pitfalls', 's1')).toBe('core');
    expect(getLayerOf('experienced', 'examples', 's1')).toBe('apply');
    expect(getLayerOf('experienced', 'primer', 's1')).toBe('deep');
  });
  it('overrides are chapter-scoped', () => {
    expect(getLayerOf('beginner', 'faq', 's11')).toBe('core');
    expect(getLayerOf('beginner', 'faq', 's1')).toBe('apply');
    expect(getLayerOf('experienced', 'faq', 's1')).toBe('apply');
  });
});

describe('getChapterLayout', () => {
  it('beginner s1 core', () => {
    expect(core('beginner', 's1')).toEqual(['primer', 'jargon', 'diagram']);
  });
  it('experienced s1 core', () => {
    expect(core('experienced', 's1')).toEqual(['coreConcepts', 'pitfalls', 'diagram']);
  });
  it('always returns 3 groups in LAYERS order', () => {
    for (const level of LEVELS) for (const c of CHAPTERS) {
      expect(getChapterLayout(level, c).map(g => g.layer)).toEqual(['core', 'apply', 'deep']);
    }
  });
  it('s15 has no jargon; glossary leads core for both levels', () => {
    expect(core('beginner', 's15')).toEqual(['glossary', 'primer', 'diagram']);
    expect(core('experienced', 's15')).toEqual(['glossary', 'coreConcepts', 'pitfalls', 'diagram']);
    for (const level of LEVELS) {
      const keys = getChapterLayout(level, ch('s15')).flatMap(g => g.sections);
      expect(keys).not.toContain('jargon');
    }
  });
  it('override keys appear only in core for s11/s15', () => {
    for (const level of LEVELS) {
      expect(core(level, 's11')[0]).toBe('faq');
      expect(core(level, 's15')[0]).toBe('glossary');
      const rest = (id: string) => getChapterLayout(level, ch(id)).filter(g => g.layer !== 'core').flatMap(g => g.sections);
      expect(rest('s11')).not.toContain('faq');
      expect(rest('s15')).not.toContain('glossary');
    }
    expect(core('beginner', 's11')).toEqual(['faq', 'primer', 'jargon', 'diagram']);
  });
  it('layer minutes = sum of SECTION_META minutes', () => {
    for (const g of getChapterLayout('beginner', ch('s1'))) {
      expect(g.minutes).toBe(g.sections.reduce((s, k) => s + SECTION_META[k].minutes, 0));
    }
    expect(getChapterLayout('beginner', ch('s1'))[0].minutes).toBe(7);
  });
});

describe('isSectionPresent', () => {
  const idsWith = (key: SectionKey) => CHAPTERS.filter(c => isSectionPresent(c, key)).map(c => c.id);
  it('faq only in s11, glossary only in s15', () => {
    expect(idsWith('faq')).toEqual(['s11']);
    expect(idsWith('glossary')).toEqual(['s15']);
  });
  it('reference exactly in s1, s2, s5, s6, s8, s12, s13, s14', () => {
    expect(idsWith('reference')).toEqual(['s1', 's2', 's5', 's6', 's8', 's12', 's13', 's14']);
  });
  it('mindset, friction, diagram in every chapter', () => {
    for (const key of ['mindset', 'friction', 'diagram'] as SectionKey[]) expect(idsWith(key)).toHaveLength(15);
  });
});

describe('sectionHasTool', () => {
  it('diagram in all chapters; friction only in s1, s2, s6', () => {
    expect(CHAPTERS.every(c => sectionHasTool(c, 'diagram'))).toBe(true);
    expect(CHAPTERS.filter(c => sectionHasTool(c, 'friction')).map(c => c.id)).toEqual(['s1', 's2', 's6']);
    expect(sectionHasTool(ch('s1'), 'primer')).toBe(false);
  });
});

describe('open state', () => {
  const layout = getChapterLayout('beginner', ch('s1'));
  const present = layout.flatMap(g => g.sections);
  it('deriveOpenState opens core layer + core sections only', () => {
    const s = deriveOpenState(layout);
    expect(s.layers).toEqual({ core: true, apply: false, deep: false });
    for (const k of present) expect(!!s.sections[k]).toBe(layout[0].sections.includes(k));
  });
  it('collapseAll expands all layers, closes all sections', () => {
    const s = collapseAll(layout);
    expect(s.layers).toEqual({ core: true, apply: true, deep: true });
    for (const k of present) expect(!!s.sections[k]).toBe(false);
  });
  it('expandAll opens everything present', () => {
    const s = expandAll(layout);
    expect(s.layers).toEqual({ core: true, apply: true, deep: true });
    for (const k of present) expect(s.sections[k]).toBe(true);
  });
  it('openSection on a deep key expands deep and opens only that key', () => {
    const base = deriveOpenState(layout);
    const s = openSection(base, layout, 'mindset');
    expect(s.layers.deep).toBe(true);
    expect(s.sections.mindset).toBe(true);
    const deepOthers = layout[2].sections.filter(k => k !== 'mindset');
    for (const k of deepOthers) expect(!!s.sections[k]).toBe(false);
  });
  it('openSection for an absent key returns the same state', () => {
    const base = deriveOpenState(layout);
    expect(openSection(base, layout, 'faq')).toBe(base);
  });
  it('toggleSection and toggleLayer flip one flag', () => {
    const base = deriveOpenState(layout);
    expect(toggleSection(base, 'primer').sections.primer).toBe(false);
    expect(toggleLayer(base, 'apply').layers.apply).toBe(true);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run `bun run test`. Expected: FAIL. `sectionLayers.test.ts` cannot resolve `./sectionLayers`.

- [ ] **Step 4: Write the implementation** — `src/data/sectionLayers.ts`

```ts
import type { Chapter, ChapterContentSection, ExperienceLevel } from '../types';

export type Layer = 'core' | 'apply' | 'deep';
export const LAYERS: readonly Layer[] = ['core', 'apply', 'deep'];

export type SectionKey =
  | 'mindset' | 'friction' | 'primer' | 'jargon' | 'dialogue' | 'diagram' | 'faq'
  | 'examples' | 'coreConcepts' | 'reference' | 'glossary' | 'workflow' | 'pitfalls' | 'checklist';

export const SECTION_KEYS: readonly SectionKey[] = [
  'mindset', 'friction', 'primer', 'jargon', 'dialogue', 'diagram', 'faq',
  'examples', 'coreConcepts', 'reference', 'glossary', 'workflow', 'pitfalls', 'checklist',
];

export const LAYER_CONFIG: Record<ExperienceLevel, Record<Layer, readonly SectionKey[]>> = {
  beginner: {
    core: ['primer', 'jargon', 'diagram'],
    apply: ['dialogue', 'examples', 'workflow', 'checklist', 'faq', 'friction'],
    deep: ['coreConcepts', 'pitfalls', 'reference', 'glossary', 'mindset'],
  },
  experienced: {
    core: ['coreConcepts', 'pitfalls', 'diagram'],
    apply: ['friction', 'dialogue', 'workflow', 'checklist', 'faq', 'examples'],
    deep: ['primer', 'jargon', 'reference', 'glossary', 'mindset'],
  },
};

/** Chapter-signature sections promoted to Core for BOTH levels (owner decision, spec §10 D10). */
export const CHAPTER_CORE_OVERRIDES: Readonly<Record<string, readonly SectionKey[]>> = {
  s11: ['faq'],
  s15: ['glossary'],
};

export const SECTION_META: Record<SectionKey, { chip: string; minutes: number }> = {
  primer: { chip: 'ปฐมบท', minutes: 2 },
  jargon: { chip: 'ศัพท์จำเป็น', minutes: 2 },
  diagram: { chip: 'แผนภาพ', minutes: 3 },
  dialogue: { chip: 'บทสนทนา', minutes: 2 },
  examples: { chip: 'กรณีศึกษา', minutes: 3 },
  workflow: { chip: 'ขั้นตอนงาน', minutes: 2 },
  checklist: { chip: 'เช็กลิสต์', minutes: 1 },
  faq: { chip: 'คำถามที่เจอบ่อย', minutes: 6 },
  friction: { chip: 'รับมือ Friction', minutes: 4 },
  coreConcepts: { chip: 'แนวคิดหลัก', minutes: 3 },
  pitfalls: { chip: 'กับดัก', minutes: 2 },
  reference: { chip: 'อ้างอิง', minutes: 3 },
  glossary: { chip: 'คลังคำศัพท์', minutes: 5 },
  mindset: { chip: 'วิธีคิดแต่ละบทบาท', minutes: 2 },
};

/** Layer header name (spec §2.3) and short outline label (spec §2.1). */
export const LAYER_META: Record<Layer, { name: string; short: string }> = {
  core: { name: 'แก่น (Core)', short: 'แก่น' },
  apply: { name: 'นำไปใช้ (Apply)', short: 'นำไปใช้' },
  deep: { name: 'เจาะลึก (Deep)', short: 'เจาะลึก' },
};

export interface LayerGroup { layer: Layer; sections: SectionKey[]; minutes: number }
export interface OpenState { layers: Record<Layer, boolean>; sections: Partial<Record<SectionKey, boolean>> }

export function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value);
}

export function getReferenceSections(chapter: Chapter): ChapterContentSection[] {
  return (chapter.contentSections ?? []).filter(section => section.placement !== 'diagram');
}

/** Mirrors the pre-refactor render guards in GuideTab exactly (spec §1.3). */
export function isSectionPresent(chapter: Chapter, key: SectionKey): boolean {
  switch (key) {
    case 'mindset': case 'friction': case 'diagram': return true;
    case 'primer': return !!chapter.beginnerPrimer;
    case 'jargon': return (chapter.jargonList?.length ?? 0) > 0;
    case 'dialogue': return !!chapter.dialogueExample;
    case 'faq': return chapter.id === 's11';
    case 'examples': return (chapter.realWorldExamples?.length ?? 0) > 0;
    case 'coreConcepts': return (chapter.coreConcepts?.length ?? 0) > 0;
    case 'reference': return getReferenceSections(chapter).length > 0;
    case 'glossary': return chapter.id === 's15';
    case 'workflow': return (chapter.realWorldWorkflow?.length ?? 0) > 0;
    case 'pitfalls': return (chapter.commonPitfalls?.length ?? 0) > 0;
    case 'checklist': return (chapter.checklist?.length ?? 0) > 0;
  }
}

export function sectionHasTool(chapter: Chapter, key: SectionKey): boolean {
  if (key === 'diagram') return true;
  if (key === 'friction') return !!chapter.frictionPlaybook?.dilemma;
  return false;
}

function layerKeys(level: ExperienceLevel, layer: Layer, chapterId: string): SectionKey[] {
  const overrides = CHAPTER_CORE_OVERRIDES[chapterId] ?? [];
  const base = LAYER_CONFIG[level][layer].filter(k => !overrides.includes(k));
  return layer === 'core' ? [...overrides, ...base] : base;
}

export function getLayerOf(level: ExperienceLevel, key: SectionKey, chapterId: string): Layer {
  return LAYERS.find(layer => layerKeys(level, layer, chapterId).includes(key)) ?? 'deep';
}

export function getChapterLayout(level: ExperienceLevel, chapter: Chapter): LayerGroup[] {
  return LAYERS.map(layer => {
    const sections = layerKeys(level, layer, chapter.id).filter(k => isSectionPresent(chapter, k));
    return { layer, sections, minutes: sections.reduce((sum, k) => sum + SECTION_META[k].minutes, 0) };
  });
}

const allLayers = (value: boolean): Record<Layer, boolean> => ({ core: value, apply: value, deep: value });
const sectionsWhere = (layout: LayerGroup[], pick: (g: LayerGroup) => boolean) => {
  const sections: Partial<Record<SectionKey, boolean>> = {};
  for (const g of layout) for (const k of g.sections) sections[k] = pick(g);
  return sections;
};

export function deriveOpenState(layout: LayerGroup[]): OpenState {
  return { layers: { core: true, apply: false, deep: false }, sections: sectionsWhere(layout, g => g.layer === 'core') };
}

export function expandAll(layout: LayerGroup[]): OpenState {
  return { layers: allLayers(true), sections: sectionsWhere(layout, () => true) };
}

export function collapseAll(layout: LayerGroup[]): OpenState {
  return { layers: allLayers(true), sections: sectionsWhere(layout, () => false) };
}

export function openSection(state: OpenState, layout: LayerGroup[], key: SectionKey): OpenState {
  const group = layout.find(g => g.sections.includes(key));
  if (!group) return state;
  return { layers: { ...state.layers, [group.layer]: true }, sections: { ...state.sections, [key]: true } };
}

export function toggleSection(state: OpenState, key: SectionKey): OpenState {
  return { ...state, sections: { ...state.sections, [key]: !state.sections[key] } };
}

export function toggleLayer(state: OpenState, layer: Layer): OpenState {
  return { ...state, layers: { ...state.layers, [layer]: !state.layers[layer] } };
}
```

If `ChapterContentSection` is not the exported name of the `contentSections` element type in `src/types.ts`, use the exported name (check with `grep -n 'contentSections' src/types.ts`).

- [ ] **Step 5: Run the tests to verify they pass**

Run `bun run test`. Expected: PASS, all `sectionLayers.test.ts` cases. If a data-derived expectation fails (reference ids, friction-tool ids), **stop and report**. Do not edit the expected value, because it comes from the spec's verified facts.

- [ ] **Step 6: Lint and build**

Run `bun run lint && bun run build`. Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add package.json bun.lock src/data/sectionLayers.ts src/data/sectionLayers.test.ts
git commit -m "feat: add vitest and section layer model

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: `readingTracks` module

**Files:**
- Create: `src/data/readingTracks.ts`
- Test: `src/data/readingTracks.test.ts`

**Interfaces:**
- Consumes: `Chapter`, `ExperienceLevel` from `src/types.ts`. Vitest from Task 1.
- Produces:
  - `const TRACK_CHAPTER_NUMS: Record<ExperienceLevel, readonly number[]>`
  - `const TRACK_META: Record<ExperienceLevel, { title: string; description: string }>`
  - `type ChapterRef = Pick<Chapter, 'id' | 'num' | 'readTime'>`
  - `resolveTrack(level: ExperienceLevel, chapters: ChapterRef[]): string[]`
  - `parseReadMinutes(readTime: string): number`
  - `getTrackMinutes(trackIds: string[], chapters: ChapterRef[]): number`
  - `type TrackNext = { kind: 'next'; chapterId: string } | { kind: 'end' } | { kind: 'not-in-track' }`
  - `getTrackNext(trackIds: string[], chapterId: string): TrackNext`
  - `getTrackProgress(trackIds: string[], readChapters: string[]): { read: number; total: number; firstUnreadId: string | null }`

- [ ] **Step 1: Write the failing test** — `src/data/readingTracks.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import { resolveTrack, parseReadMinutes, getTrackMinutes, getTrackNext, getTrackProgress } from './readingTracks';

const BEGINNER = ['s1', 's2', 's3', 's4', 's6', 's7', 's11', 's14'];
const EXPERIENCED = ['s11', 's1', 's6', 's9', 's12', 's13', 's14'];

describe('resolveTrack', () => {
  it('maps nums to ids in config order', () => {
    expect(resolveTrack('beginner', CHAPTERS)).toEqual(BEGINNER);
    expect(resolveTrack('experienced', CHAPTERS)).toEqual(EXPERIENCED);
  });
  it('skips unknown nums', () => {
    expect(resolveTrack('beginner', CHAPTERS.filter(c => c.num !== 3))).toEqual(BEGINNER.filter(id => id !== 's3'));
  });
});

describe('minutes', () => {
  it('parseReadMinutes', () => {
    expect(parseReadMinutes('10 นาที')).toBe(10);
    expect(parseReadMinutes('')).toBe(0);
    expect(parseReadMinutes('นาที')).toBe(0);
  });
  it('track minutes 92 / 83', () => {
    expect(getTrackMinutes(BEGINNER, CHAPTERS)).toBe(92);
    expect(getTrackMinutes(EXPERIENCED, CHAPTERS)).toBe(83);
  });
});

describe('getTrackNext', () => {
  it('beginner', () => {
    expect(getTrackNext(BEGINNER, 's4')).toEqual({ kind: 'next', chapterId: 's6' });
    expect(getTrackNext(BEGINNER, 's14')).toEqual({ kind: 'end' });
    expect(getTrackNext(BEGINNER, 's5')).toEqual({ kind: 'not-in-track' });
  });
  it('experienced', () => {
    expect(getTrackNext(EXPERIENCED, 's11')).toEqual({ kind: 'next', chapterId: 's1' });
    expect(getTrackNext(EXPERIENCED, 's1')).toEqual({ kind: 'next', chapterId: 's6' });
  });
});

describe('getTrackProgress', () => {
  it('counts only track ids', () => {
    expect(getTrackProgress(BEGINNER, ['s1', 's5'])).toEqual({ read: 1, total: 8, firstUnreadId: 's2' });
  });
  it('firstUnreadId skips read ids', () => {
    expect(getTrackProgress(EXPERIENCED, ['s11', 's1']).firstUnreadId).toBe('s6');
  });
  it('all read -> null', () => {
    expect(getTrackProgress(BEGINNER, BEGINNER)).toEqual({ read: 8, total: 8, firstUnreadId: null });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run `bun run test`. Expected: FAIL, `./readingTracks` not found.

- [ ] **Step 3: Write the implementation** — `src/data/readingTracks.ts`

```ts
import type { Chapter, ExperienceLevel } from '../types';

export const TRACK_CHAPTER_NUMS: Record<ExperienceLevel, readonly number[]> = {
  beginner: [1, 2, 3, 4, 6, 7, 11, 14],
  experienced: [11, 1, 6, 9, 12, 13, 14],
};

export const TRACK_META: Record<ExperienceLevel, { title: string; description: string }> = {
  beginner: { title: 'เส้นทางมือใหม่', description: 'ปูพื้นจากต้นน้ำถึงการทดสอบ แล้วปิดด้วยความขัดแย้งที่เจอบ่อย' },
  experienced: { title: 'เส้นทางคนทำงานข้ามทีม', description: 'เริ่มจากความขัดแย้งจริง แล้วลงลึกเรื่องประตูงาน หนี้เทคนิค และยุค AI' },
};

export type ChapterRef = Pick<Chapter, 'id' | 'num' | 'readTime'>;

export function resolveTrack(level: ExperienceLevel, chapters: ChapterRef[]): string[] {
  return TRACK_CHAPTER_NUMS[level]
    .map(num => chapters.find(c => c.num === num)?.id)
    .filter((id): id is string => id !== undefined);
}

export function parseReadMinutes(readTime: string): number {
  const match = /\d+/.exec(readTime);
  return match ? Number(match[0]) : 0;
}

export function getTrackMinutes(trackIds: string[], chapters: ChapterRef[]): number {
  return trackIds.reduce((sum, id) => {
    const chapter = chapters.find(c => c.id === id);
    return sum + (chapter ? parseReadMinutes(chapter.readTime) : 0);
  }, 0);
}

export type TrackNext = { kind: 'next'; chapterId: string } | { kind: 'end' } | { kind: 'not-in-track' };

export function getTrackNext(trackIds: string[], chapterId: string): TrackNext {
  const index = trackIds.indexOf(chapterId);
  if (index === -1) return { kind: 'not-in-track' };
  if (index === trackIds.length - 1) return { kind: 'end' };
  return { kind: 'next', chapterId: trackIds[index + 1] };
}

export function getTrackProgress(
  trackIds: string[],
  readChapters: string[],
): { read: number; total: number; firstUnreadId: string | null } {
  return {
    read: trackIds.filter(id => readChapters.includes(id)).length,
    total: trackIds.length,
    firstUnreadId: trackIds.find(id => !readChapters.includes(id)) ?? null,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run `bun run test`. Expected: PASS. If the 92/83 minutes fail, **stop and report** the actual sums. Do not change the expectation.

- [ ] **Step 5: Lint, build, commit**

Run `bun run lint && bun run build`. Expected: both exit 0.

```bash
git add src/data/readingTracks.ts src/data/readingTracks.test.ts
git commit -m "feat: add reading track model

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: `chapterRoute` hash routing module

**Files:**
- Create: `src/lib/chapterRoute.ts`
- Test: `src/lib/chapterRoute.test.ts`

**Interfaces:**
- Consumes: `Chapter` from `src/types.ts`. `SectionKey` and `isSectionKey` from `src/data/sectionLayers.ts` (Task 1).
- Produces:
  - `interface ChapterRoute { chapterId: string; section?: SectionKey }`
  - `interface RequestedSection { key: SectionKey; nonce: number }`
  - `formatChapterHash(num: number, section?: SectionKey): string`
  - `parseChapterHash(hash: string, chapters: Pick<Chapter, 'id' | 'num'>[]): ChapterRoute | null`

- [ ] **Step 1: Write the failing test** — `src/lib/chapterRoute.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../data/chaptersData';
import { formatChapterHash, parseChapterHash } from './chapterRoute';

const parse = (hash: string) => parseChapterHash(hash, CHAPTERS);

describe('formatChapterHash', () => {
  it('formats and round-trips', () => {
    expect(formatChapterHash(5)).toBe('#/ch/5');
    expect(formatChapterHash(5, 'diagram')).toBe('#/ch/5/diagram');
    for (const num of [1, 15]) {
      const id = `s${num}`;
      expect(parse(formatChapterHash(num))).toEqual({ chapterId: id });
      expect(parse(formatChapterHash(num, 'checklist'))).toEqual({ chapterId: id, section: 'checklist' });
    }
  });
});

describe('parseChapterHash', () => {
  it('chapter and section forms', () => {
    expect(parse('#/ch/5')).toEqual({ chapterId: 's5' });
    expect(parse('#/ch/5/diagram')).toEqual({ chapterId: 's5', section: 'diagram' });
    expect(parse('#/ch/5/')).toEqual({ chapterId: 's5' });
  });
  it('drops an unknown section but keeps the chapter', () => {
    expect(parse('#/ch/5/xyz')).toEqual({ chapterId: 's5' });
  });
  it('invalid -> null', () => {
    for (const h of ['#/ch/16', '#/ch/0', '#/ch/abc', '#/foo', '', '#']) expect(parse(h)).toBeNull();
  });
  it('legacy #sN', () => {
    expect(parse('#s11')).toEqual({ chapterId: 's11' });
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run `bun run test`. Expected: FAIL, `./chapterRoute` not found.

- [ ] **Step 3: Write the implementation** — `src/lib/chapterRoute.ts`

```ts
import type { Chapter } from '../types';
import { isSectionKey, type SectionKey } from '../data/sectionLayers';

export interface ChapterRoute { chapterId: string; section?: SectionKey }
export interface RequestedSection { key: SectionKey; nonce: number }

type ChapterRef = Pick<Chapter, 'id' | 'num'>;

const ROUTE_RE = /^#\/ch\/(\d{1,2})(?:\/([A-Za-z]+))?\/?$/;
const LEGACY_RE = /^#s(\d{1,2})$/;

export function formatChapterHash(num: number, section?: SectionKey): string {
  return section ? `#/ch/${num}/${section}` : `#/ch/${num}`;
}

export function parseChapterHash(hash: string, chapters: ChapterRef[]): ChapterRoute | null {
  if (hash === '' || hash === '#') return null;
  const byNum = (raw: string) => chapters.find(c => c.num === Number(raw));

  const route = ROUTE_RE.exec(hash);
  if (route) {
    const chapter = byNum(route[1]);
    if (!chapter) return null;
    const section = route[2];
    return section && isSectionKey(section) ? { chapterId: chapter.id, section } : { chapterId: chapter.id };
  }

  const legacy = LEGACY_RE.exec(hash);
  if (legacy) {
    const chapter = byNum(legacy[1]);
    return chapter ? { chapterId: chapter.id } : null;
  }
  return null;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run `bun run test`. Expected: PASS for all three test files.

- [ ] **Step 5: Lint, build, commit**

Run `bun run lint && bun run build`. Expected: both exit 0.

```bash
git add src/lib/chapterRoute.ts src/lib/chapterRoute.test.ts
git commit -m "feat: add chapter hash route parsing

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Section extraction (Tasks 4–6): shared procedure

Tasks 4, 5 and 6 are behaviour-preserving. Each moves some section blocks out of `GuideTab.tsx` into `src/components/guide/sections/<Name>Section.tsx`. GuideTab keeps `openSections`, `toggleSection` and the level-order branch until Task 7. The only change in GuideTab is that each moved block becomes one component element at the same position.

**Component shape** (use it for every section; `<Name>` and the key come from the task's table):

```tsx
import React from 'react';
// import exactly the lucide icons, components and data the moved block uses (copy the import lines from GuideTab)
import type { SectionProps } from './registry';

export const <Name>Section: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => (
  <>
    {/* the original block, verbatim, with only the substitutions below */}
  </>
);
```

Omit `ctx` or `onToggle` from the destructuring when the block does not use them. Keep the block's own presence guard (for example `{chapter.beginnerPrimer && (...)}`).

**Substitutions (the only allowed edits inside the block):**
- `activeChapter` → `chapter`
- `openSections.<key>` → `isOpen`
- `toggleSection('<key>')` → `onToggle()`. Keep the surrounding arrow, so `onClick={() => toggleSection('primer')}` becomes `onClick={() => onToggle()}`.
- `handleSelectChapter` → `ctx.onNavigateChapter`
- `handleDiagramJump` → `ctx.onDiagramJump`
- `handleScrollToPlaybook` → `ctx.onScrollToPlaybook`
- `handleSearchGlossary` → `ctx.onSearchGlossary`
- `handleSelectGlossaryCategory` → `ctx.onSelectGlossaryCategory`
- `glossaryCategory`, `setGlossaryCategory`, `glossaryQuery`, `setGlossaryQuery`, `c4Level`, `setC4Level`, `checkedChecklist`, `audienceMode`, `chapters` → `ctx.<same name>`
- `toggleChecklistItem` → `ctx.onToggleChecklistItem`

**GuideTab call site** (replace the block, keep its leading JSX comment):

```tsx
<PrimerSection chapter={activeChapter} isOpen={openSections.primer} onToggle={() => toggleSection('primer')} ctx={sectionCtx} />
```

**Verbatim check** (run for every moved block; `A,B` = base line range from the task table; `F` = new component file):

```bash
cd /Users/Pathompong/Sites/Personal/biz-dev-guide
git show 06df5e5:src/components/GuideTab.tsx | sed -n 'A,Bp' > /tmp/claude-orig.txt   # use the scratchpad dir if /tmp is disallowed
diff -w /tmp/claude-orig.txt F
```

Expected: the only differing lines are the import/wrapper lines and lines containing one of the substitutions above. Any other difference (class names, markup, text) is a defect: fix it before committing.

**Browser check for extraction tasks.** Run it on `main`-equivalent behaviour. Nothing may look or behave differently from before the task.

---

### Task 4: Section context types + extract Primer, Jargon, Dialogue, Diagram

**Files:**
- Create: `src/components/guide/sections/registry.tsx` (types only in this task)
- Create: `src/components/guide/sections/PrimerSection.tsx` from base `GuideTab.tsx:807-865` (marker `{/* SECTION 1: ปฐมบทสำหรับมือใหม่ (Beginner Primer) */}`)
- Create: `src/components/guide/sections/JargonSection.tsx` from `:866-927` (marker `SECTION 2: พจนานุกรมศัพท์จำเป็น`)
- Create: `src/components/guide/sections/DialogueSection.tsx` from `:928-997` (marker `SECTION 3: ตัวอย่างบทสนทนาจริงในที่ทำงาน`)
- Create: `src/components/guide/sections/DiagramSection.tsx` from `:998-1242` (marker `SECTION 4: อินโฟกราฟิก & แผนภาพจำลองกระบวนการ`). It uses `FIGURES`, `GLOSSARY`, `S5_JUMP_TARGET_IDS`, `ChapterDiagram`, `ContentBlocks`, `DiagramFamilyGrid`, `SwimlaneVsSequence`, `GlossaryCategoryMap`, `ctx.c4Level`/`setC4Level`/`glossaryCategory`, `ctx.onDiagramJump`, `ctx.onNavigateChapter`, `ctx.onSelectGlossaryCategory`.
- Modify: `src/components/GuideTab.tsx`: add `sectionCtx` after `toggleChecklistItem` (base `:291-296`), and replace the four blocks with elements.

**Interfaces:**
- Consumes: `Chapter`, `AudienceMode` (`src/types.ts`). `DiagramJumpTarget` (`src/data/diagramFamilies.ts`). `GlossaryCategory` (`src/data/glossary.ts`). `GlossaryFilter` (`src/components/glossary/GlossaryPanel.tsx`).
- Produces, in `src/components/guide/sections/registry.tsx`:

```tsx
import type React from 'react';
import type { AudienceMode, Chapter } from '../../../types';
import type { DiagramJumpTarget } from '../../../data/diagramFamilies';
import type { GlossaryCategory } from '../../../data/glossary';
import type { GlossaryFilter } from '../../glossary/GlossaryPanel';

export interface GuideSectionContext {
  chapters: Chapter[];                                      // GlossaryPanel needs the chapter list (not in spec §1.7; required by the glossary block)
  audienceMode: AudienceMode;
  onAudienceChange?: (m: AudienceMode) => void;
  onEarnXp?: (amount: number, reason: string) => void;
  onNavigateChapter: (chapterId: string) => void;
  onDiagramJump: (t: DiagramJumpTarget) => void;
  onScrollToPlaybook: (chapterId: string) => void;
  onSearchGlossary: (q: string) => void;
  onSelectGlossaryCategory: (c: GlossaryCategory) => void;
  glossaryCategory: GlossaryFilter; setGlossaryCategory: (c: GlossaryFilter) => void;
  glossaryQuery: string; setGlossaryQuery: (q: string) => void;
  c4Level: number; setC4Level: (n: number) => void;
  checkedChecklist: Record<string, boolean>; onToggleChecklistItem: (key: string) => void;
}

export interface SectionProps { chapter: Chapter; isOpen: boolean; onToggle: () => void; ctx: GuideSectionContext }
```

  - Section components: `PrimerSection`, `JargonSection`, `DialogueSection`, `DiagramSection`, each `React.FC<SectionProps>`.

- [ ] **Step 1: Create `registry.tsx`** with exactly the code above.

- [ ] **Step 2: Add `sectionCtx` in GuideTab**, directly after `toggleChecklistItem`:

```tsx
  const sectionCtx: GuideSectionContext = {
    chapters,
    audienceMode,
    onAudienceChange,
    onEarnXp,
    onNavigateChapter: handleSelectChapter,
    onDiagramJump: handleDiagramJump,
    onScrollToPlaybook: handleScrollToPlaybook,
    onSearchGlossary: handleSearchGlossary,
    onSelectGlossaryCategory: handleSelectGlossaryCategory,
    glossaryCategory, setGlossaryCategory,
    glossaryQuery, setGlossaryQuery,
    c4Level, setC4Level,
    checkedChecklist, onToggleChecklistItem: toggleChecklistItem,
  };
```

Add `import type { GuideSectionContext } from './guide/sections/registry';`.

- [ ] **Step 3: Move the four blocks.** Follow the shared procedure: create each component and replace each block with its element (`isOpen={openSections.<key>}`, `onToggle={() => toggleSection('<key>')}`). Then remove GuideTab imports that no longer have a use (check each with `grep -c`).

- [ ] **Step 4: Verbatim check** for the four ranges. Expected: only substitution lines differ.

- [ ] **Step 5: `bun run lint && bun run test && bun run build`.** Expected: all exit 0.

- [ ] **Step 6: Browser verification** (Global Constraints procedure, desktop and 375px):
  1. `http://localhost:53479/`, ch.1. `find` with `ปฐมบทสำหรับมือใหม่` and with `Jargon Buster` both return a heading. Click each heading: the body toggles.
  2. Open ch.5 from the index. Open the diagram section, click a C4 level button, collapse the diagram section and reopen it: the chosen C4 level is still selected.
  3. On ch.5, click a family-grid jump card: the page scrolls to the target block.
  4. Open ch.15. Click a category tile in the diagram section: the glossary filter changes and the panel scrolls into view.
  5. The console has no errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/guide/sections src/components/GuideTab.tsx
git commit -m "refactor: extract primer, jargon, dialogue and diagram sections

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Extract FAQ, Examples, Core Concepts, Reference, Glossary

**Files:**
- Create: `src/components/guide/sections/FaqSection.tsx` from base `GuideTab.tsx:1243-1279` (marker `SECTION 4.4: คำถามที่เจอบ่อย`). It uses `FrictionFaqSection`, `ctx.audienceMode`, `ctx.onScrollToPlaybook`, `ctx.onSearchGlossary`, `ctx.onNavigateChapter`.
- Create: `src/components/guide/sections/ExamplesSection.tsx` from `:1280-1358` (marker `SECTION 4.5: กรณีศึกษาจริงจากบริษัทเทค`)
- Create: `src/components/guide/sections/CoreConceptsSection.tsx` from `:1359-1409` (marker `SECTION 5: ความรู้เชิงลึก & แนวคิดหลัก`)
- Create: `src/components/guide/sections/ReferenceSection.tsx` from `:1410-1445` (marker `SECTION 5.5: เนื้อหาอ้างอิง (Reference)`)
- Create: `src/components/guide/sections/GlossarySection.tsx` from `:683-722` (marker `GLOSSARY (chapter 15 only)`). It uses `GlossaryPanel`, `GLOSSARY`, `ctx.chapters`, `ctx.glossaryCategory`/`setGlossaryCategory`/`glossaryQuery`/`setGlossaryQuery`, `ctx.onNavigateChapter`.
- Modify: `src/components/GuideTab.tsx`: replace the five blocks, and delete `referenceSections`/`referenceBlockCount` (base `:198-199`).

**Interfaces:**
- Consumes: `SectionProps`, `GuideSectionContext` from `registry.tsx` (Task 4). `getReferenceSections(chapter: Chapter): ChapterContentSection[]` from `src/data/sectionLayers.ts` (Task 1).
- Produces: `FaqSection`, `ExamplesSection`, `CoreConceptsSection`, `ReferenceSection`, `GlossarySection` (each `React.FC<SectionProps>`).

- [ ] **Step 1: Move the five blocks** following the shared procedure. In `ReferenceSection` the block reads `referenceSections` and `referenceBlockCount`. Add these two lines at the top of the component body; this is the one allowed non-substitution edit:

```tsx
export const ReferenceSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  const referenceSections = getReferenceSections(chapter);
  const referenceBlockCount = referenceSections.reduce((sum, section) => sum + section.blocks.length, 0);
  return (
    <>
      {/* block verbatim */}
    </>
  );
};
```

The Glossary element stays where the glossary block was (before the mindset/friction branch). Delete `referenceSections` and `referenceBlockCount` from GuideTab only after `grep -n 'referenceSections\|referenceBlockCount' src/components/GuideTab.tsx` shows no other use.

- [ ] **Step 2: Verbatim check** for the five ranges.

- [ ] **Step 3: `bun run lint && bun run test && bun run build`.** Expected: all exit 0.

- [ ] **Step 4: Browser verification**:
  1. ch.11: the FAQ renders. Click a playbook link inside an FAQ item: the page lands on `#friction-playbook-card` of the linked chapter (`document.getElementById('friction-playbook-card').getBoundingClientRect().top` is between 0 and 200 after the scroll settles).
  2. ch.11: click an FAQ concept chip. The app opens ch.15 with the glossary search box prefilled with that term.
  3. ch.15: type into the glossary search and filter by category. The results change.
  4. ch.1: the Reference section renders with its block count. ch.3 has no Reference heading (`find` `เนื้อหาอ้างอิง (Reference)` returns nothing).
  5. ch.1: toggle Examples and Core Concepts open and closed.

- [ ] **Step 5: Commit**

```bash
git add src/components/guide/sections src/components/GuideTab.tsx
git commit -m "refactor: extract faq, examples, concepts, reference and glossary sections

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Extract Workflow, Pitfalls, Checklist; add mindset/friction adapters and the registry

**Files:**
- Create: `src/components/guide/sections/WorkflowSection.tsx` from base `GuideTab.tsx:1446-1491` (marker `SECTION 6: ขั้นตอนการทำงานจริง`)
- Create: `src/components/guide/sections/PitfallsSection.tsx` from `:1492-1536` (marker `SECTION 7: กับดักที่เจอบ่อยและทางออก`)
- Create: `src/components/guide/sections/ChecklistSection.tsx` from `:1537-1588` (marker `SECTION 8: Pre-flight Checklist`). It uses `ctx.checkedChecklist` and `ctx.onToggleChecklistItem`.
- Modify: `src/components/guide/sections/registry.tsx`: add the adapters and `SECTION_COMPONENTS`.
- Modify: `src/components/GuideTab.tsx`:
  - Replace the three blocks.
  - In the level-order branch (base `:723-764`), replace the `FrictionPlaybookCard`/`RoleMindsetCard` elements with `<FrictionSection …/>`/`<MindsetSection …/>`. Keep the branch; Task 7 removes it.
  - Delete the dead state `mindsetSubTab` and `dilemmaAnswers` (base `:91-92`).

**Interfaces:**
- Consumes: all section components from Tasks 4–5. `RoleMindsetCard` (`src/components/RoleMindsetCard.tsx`) and `FrictionPlaybookCard` (`src/components/FrictionPlaybookCard.tsx`), unchanged. `SectionKey` (Task 1).
- Produces, in `registry.tsx`:
  - `MindsetSection: React.FC<SectionProps>`
  - `FrictionSection: React.FC<SectionProps>`
  - `SECTION_COMPONENTS: Record<SectionKey, React.FC<SectionProps>>`
  - `WorkflowSection`, `PitfallsSection`, `ChecklistSection`

- [ ] **Step 1: Move the three blocks** following the shared procedure.

- [ ] **Step 2: Add the adapters and the registry** to the end of `registry.tsx`. Change the file's first import from `import type React` to `import React`.

```tsx
import { RoleMindsetCard } from '../../RoleMindsetCard';
import { FrictionPlaybookCard } from '../../FrictionPlaybookCard';
import type { SectionKey } from '../../../data/sectionLayers';
import { PrimerSection } from './PrimerSection';
import { JargonSection } from './JargonSection';
import { DialogueSection } from './DialogueSection';
import { DiagramSection } from './DiagramSection';
import { FaqSection } from './FaqSection';
import { ExamplesSection } from './ExamplesSection';
import { CoreConceptsSection } from './CoreConceptsSection';
import { ReferenceSection } from './ReferenceSection';
import { GlossarySection } from './GlossarySection';
import { WorkflowSection } from './WorkflowSection';
import { PitfallsSection } from './PitfallsSection';
import { ChecklistSection } from './ChecklistSection';

export const MindsetSection: React.FC<SectionProps> = ({ isOpen, onToggle, ctx }) => (
  <RoleMindsetCard audienceMode={ctx.audienceMode} onSelectRole={ctx.onAudienceChange} isOpen={isOpen} onToggle={onToggle} />
);

export const FrictionSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => (
  <FrictionPlaybookCard
    playbook={chapter.frictionPlaybook}
    chapterTitle={chapter.title}
    audienceMode={ctx.audienceMode}
    isOpen={isOpen}
    onToggle={onToggle}
    onEarnXp={ctx.onEarnXp}
  />
);

export const SECTION_COMPONENTS: Record<SectionKey, React.FC<SectionProps>> = {
  mindset: MindsetSection,
  friction: FrictionSection,
  primer: PrimerSection,
  jargon: JargonSection,
  dialogue: DialogueSection,
  diagram: DiagramSection,
  faq: FaqSection,
  examples: ExamplesSection,
  coreConcepts: CoreConceptsSection,
  reference: ReferenceSection,
  glossary: GlossarySection,
  workflow: WorkflowSection,
  pitfalls: PitfallsSection,
  checklist: ChecklistSection,
};
```

Section files import `SectionProps` with `import type`, so the circular import is erased at build time.

- [ ] **Step 3: Replace the four card elements** in the level branch. For example, `<RoleMindsetCard audienceMode=… />` becomes `<MindsetSection chapter={activeChapter} isOpen={openSections.mindset} onToggle={() => toggleSection('mindset')} ctx={sectionCtx} />`. Delete the `mindsetSubTab` and `dilemmaAnswers` `useState` lines. `grep -n 'mindsetSubTab\|dilemmaAnswers' src/components/GuideTab.tsx` must print nothing.

- [ ] **Step 4: Verbatim check** for the three ranges.

- [ ] **Step 5: `bun run lint && bun run test && bun run build`.** Expected: all exit 0.

- [ ] **Step 6: Browser verification**:
  1. ch.1: open the checklist and tick two items. Collapse the checklist and reopen it: both are still ticked (AC 7).
  2. ch.1 beginner: Role Mindset renders before Friction. Toggle the level to experienced: Friction renders first (the pre-Task-7 behaviour is still intact).
  3. ch.1: the friction dilemma (inside the playbook) is answerable and awards XP as before.
  4. Workflow and Pitfalls toggle.

- [ ] **Step 7: Commit**

```bash
git add src/components/guide/sections src/components/GuideTab.tsx
git commit -m "refactor: extract remaining sections and add section registry

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: Config-driven layer rendering, layer headers and hero

**Files:**
- Create: `src/components/guide/LayerGroup.tsx`
- Create: `src/components/guide/ChapterHero.tsx`. It takes the chapter header from base `GuideTab.tsx:584-611`, **excluding** the expand/collapse block `:612-632`, and the analogy + perspective notes from `:766-805` (marker `Quick Perspective & Metaphor Box`).
- Modify: `src/components/GuideTab.tsx`:
  - Replace `openSections` and its level effect (base `:155-190`), `toggleSection`, `expandAllSections` and `collapseAllSections` (`:252-289`) with `OpenState`.
  - Remove the glossary element's standalone position and the level-order branch (`:683-764`).
  - Render layers in place of all section elements (`:807-1588`).
  - Change the lens-banner copy (`:651-681`).
  - Update `handleSelectGlossaryCategory`, `handleSearchGlossary` and `handleScrollToPlaybook` (`:219-250`).

**Interfaces:**
- Consumes (Task 1):
  - `getChapterLayout`, `deriveOpenState`, `expandAll`, `collapseAll`, `openSection`, `toggleSection`, `toggleLayer`
  - `isSectionPresent`, `SECTION_META`, `LAYER_META`
  - types `LayerGroup`, `OpenState`, `SectionKey`
- Consumes: `RequestedSection` (Task 3); `SECTION_COMPONENTS`, `GuideSectionContext` (Task 6).
- Produces:
  - `LayerGroupView: React.FC<{ group: LayerGroup; isExpanded: boolean; onToggle: () => void; children: React.ReactNode }>` in `LayerGroup.tsx`
  - `ChapterHero: React.FC<{ chapter: Chapter; experienceLevel: ExperienceLevel; audienceMode: AudienceMode; isRead: boolean }>` in `ChapterHero.tsx`
  - In GuideTab (used by Tasks 8, 11):
    - `const layout: LayerGroup[]`
    - `const [openState, setOpenState] = useState<OpenState>`
    - `const [sectionRequest, setSectionRequest] = useState<RequestedSection | null>(null)`
    - `requestSection(key: SectionKey): void`

- [ ] **Step 1: Create `LayerGroup.tsx`**

```tsx
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LAYER_META, SECTION_META, type LayerGroup } from '../../data/sectionLayers';

interface LayerGroupViewProps {
  group: LayerGroup;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const LayerGroupView: React.FC<LayerGroupViewProps> = ({ group, isExpanded, onToggle, children }) => (
  <div className="space-y-4 sm:space-y-5" data-layer-group={group.layer}>
    <div>
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 py-2 border-b border-neutral-200 dark:border-[#262626] text-left cursor-pointer"
      >
        <span className="text-sm sm:text-base font-extrabold text-neutral-900 dark:text-[#fafafa]">
          {LAYER_META[group.layer].name}
          <span className="ml-2 text-xs font-medium text-neutral-500 dark:text-[#8e8e8e] font-mono">
            · {group.sections.length} หัวข้อ · ≈ {group.minutes} นาที
          </span>
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
      </button>
      {!isExpanded && (
        <p className="mt-1.5 text-xs text-neutral-500 dark:text-[#737373]" data-layer-preview>
          {group.sections.map(k => SECTION_META[k].chip).join(' · ')}
        </p>
      )}
    </div>
    {isExpanded && children}
  </div>
);
```

- [ ] **Step 2: Create `ChapterHero.tsx`.** Move base `:585-611` verbatim: the header `div`'s opening tag through the subtitle `<p>`. Leave out the expand/collapse block and the helper line `คลิกที่หัวข้อเพื่อเปิด/ปิดเนื้อหาย่อย หรือดูทีละส่วน`, which is deleted. Close the header `div` after the subtitle. The `isCurrentRead` badge reads the `isRead` prop. Insert the key takeaway right after the subtitle `<p>`, inside the header div:

```tsx
<p className="text-sm text-neutral-800 dark:text-[#d4d4d4] leading-relaxed" data-key-takeaway>
  <span className="font-semibold">สาระสำคัญของบทนี้:</span> {chapter.keyTakeaway}
</p>
```

Then move the analogy + notes block (`:766-805`) verbatim after the header. Wrap only the analogy box (`:768-777`, marker `Plain Language Metaphor`) by level:
- beginner: unchanged markup.
- experienced: `<details data-analogy>` with the same outer classes, then a `<summary className="cursor-pointer">` holding the existing heading element (`เปรียบแบบบ้านๆ (Real-World Analogy)`), then the analogy body. It starts closed (no `open` attribute).

Add `data-analogy` to the beginner box's outer element too, so both are selectable. The Business/Engineer notes (`:779-804`) stay unchanged and keep reading `audienceMode`.

- [ ] **Step 3: Replace the open-state code in GuideTab.** Delete the `openSections` `useState`, its level effect, `toggleSection`, `expandAllSections` and `collapseAllSections`. After `activeChapter`/`activeIndex` are computed, add:

```tsx
  const layout = useMemo(() => getChapterLayout(experienceLevel, activeChapter), [experienceLevel, activeChapter]);
  const [openState, setOpenState] = useState<OpenState>(() => deriveOpenState(layout));
  const [sectionRequest, setSectionRequest] = useState<RequestedSection | null>(null);
  const requestSection = (key: SectionKey) => setSectionRequest(prev => ({ key, nonce: (prev?.nonce ?? 0) + 1 }));

  // Each chapter (and each level) opens at its Core (spec §1.4, D3).
  useEffect(() => {
    setOpenState(deriveOpenState(layout));
  }, [layout]);

  // A requested section opens on top of the re-derived defaults. Declared after the
  // re-derive effect so that, when both fire in one commit, this update wins.
  useEffect(() => {
    if (!sectionRequest) return;
    if (!isSectionPresent(activeChapter, sectionRequest.key)) return;
    setOpenState(openSection(deriveOpenState(layout), layout, sectionRequest.key));
    setPendingScrollId(`sec-${sectionRequest.key}`);
  }, [sectionRequest?.nonce]);
```

`useState` hooks must stay above any early return. Add `useMemo` to the React import. Remove the now-unused `ChevronDown`/`ChevronUp` imports from GuideTab only if grep shows no other use.

- [ ] **Step 4: Update the three handlers**:

```tsx
  const handleSelectGlossaryCategory = (category: GlossaryCategory) => {
    setGlossaryCategory(category);
    setOpenState(prev => openSection(prev, layout, 'glossary'));
    window.setTimeout(() => {
      document.getElementById('glossary-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const handleSearchGlossary = (query: string) => {
    setGlossaryQuery(query);
    setGlossaryCategory('all');
    setActiveChapterId('s15');
    setIsIndexOpen(false);
    requestSection('glossary');
  };

  const handleScrollToPlaybook = (chapterId: string) => {
    if (chapterId !== activeChapterId) {
      setActiveChapterId(chapterId);
      setIsIndexOpen(false);
      requestSection('friction');
      return;
    }
    setOpenState(prev => openSection(prev, layout, 'friction'));
    setPendingScrollId('friction-playbook-card');
  };
```

- [ ] **Step 5: Render the hero and layers.** In the chapter card, replace the header `div` (`:584-633`) with:

```tsx
<ChapterHero chapter={activeChapter} experienceLevel={experienceLevel} audienceMode={audienceMode} isRead={isCurrentRead} />
```

Keep the lens banner next. Delete the glossary element, the level branch and the analogy block from their old positions. Replace all remaining section elements with the renderer, followed by a temporary expand/collapse pair that Task 8 moves into the outline:

```tsx
<div className="flex items-center justify-end gap-2 text-xs" data-temp-expand-controls>
  <button type="button" onClick={() => setOpenState(expandAll(layout))} className="text-neutral-800 dark:text-[#d4d4d4] hover:underline font-semibold cursor-pointer">ขยายทั้งหมด</button>
  <span className="text-neutral-300 dark:text-[#333333]">|</span>
  <button type="button" onClick={() => setOpenState(collapseAll(layout))} className="text-neutral-500 dark:text-[#737373] hover:underline font-semibold cursor-pointer">ย่อทั้งหมด</button>
</div>

{layout.filter(group => group.sections.length > 0).map(group => (
  <LayerGroupView
    key={group.layer}
    group={group}
    isExpanded={openState.layers[group.layer]}
    onToggle={() => setOpenState(prev => toggleLayer(prev, group.layer))}
  >
    {group.sections.map(key => {
      const Section = SECTION_COMPONENTS[key];
      return (
        <section key={key} id={`sec-${key}`} className="anchor-target" data-layer={group.layer}>
          <Section
            chapter={activeChapter}
            isOpen={!!openState.sections[key]}
            onToggle={() => setOpenState(prev => toggleSection(prev, key))}
            ctx={sectionCtx}
          />
        </section>
      );
    })}
  </LayerGroupView>
))}
```

Import `toggleSection` as `toggleSection` from `sectionLayers`. The old local `toggleSection` has been deleted, so there is no clash. The footer (`Chapter Footer Actions`) stays after the layers.

- [ ] **Step 6: Lens banner copy (spec §4.4).** Change the beginner button text from `🌱 ปูพื้นฐาน Mindset` to `🌱 ใหม่กับเรื่องนี้`, and the experienced one from `⚡ คัมภีร์รับมือ Friction` to `⚡ ทำงานข้ามทีมมาแล้ว`. Replace the explanation strings:
  - beginner: `💡 โหมดมือใหม่: เปิด ปฐมบท · ศัพท์จำเป็น · แผนภาพ ไว้ก่อน ส่วนอื่นพับไว้ในชั้น "นำไปใช้" และ "เจาะลึก"`
  - experienced: `⚡ โหมดทำงานข้ามทีม: เปิด แนวคิดหลัก · กับดัก · แผนภาพ ไว้ก่อน วิธีรับมือ Friction อยู่ในชั้น "นำไปใช้"`

  Button handlers do not change.

- [ ] **Step 7: Static checks.** Both of these must print nothing (AC 8):

```bash
grep -n "openSections\|expandAllSections\|collapseAllSections\|experienceLevel === 'experienced' ?" src/components/GuideTab.tsx
```

Then run `bun run lint && bun run test && bun run build`. Expected: all exit 0.

- [ ] **Step 8: Browser verification** (fresh profile; desktop, 375px, light and dark):
  1. Beginner, ch.1 (AC 1). The `[data-key-takeaway]` text starts with `สาระสำคัญของบทนี้:`; `[data-analogy]` is not a closed `details`. The three layer headers read `แก่น (Core) · 3 หัวข้อ · ≈ 7 นาที`, then `นำไปใช้ (Apply) …`, `เจาะลึก (Deep) …`. Check with JS: `[...document.querySelectorAll('section[data-layer]')].map(s=>s.id)` equals `['sec-primer','sec-jargon','sec-diagram']`. Apply and Deep each show a `[data-layer-preview]` line.
  2. The Jargon Buster heading is visible by scrolling, with 0 clicks (AC 2).
  3. Switch to experienced on ch.1 (AC 3). The section ids are `['sec-coreConcepts','sec-pitfalls','sec-diagram']`, all open. `document.querySelector('details[data-analogy]').open === false`.
  4. Expand Deep: `sec-mindset` is inside the `[data-layer-group="deep"]` element for both levels (AC 4).
  5. AC 5:
     - ch.15, both levels: no `#sec-jargon`, and the first Core section is `sec-glossary`, open.
     - ch.11, both levels: the first Core section is `sec-faq`.
     - ch.3: expand all; there is no `#sec-reference`.
  6. Click `ขยายทั้งหมด`: every section body is open. Click `ย่อทั้งหมด`: every layer header has `aria-expanded="true"` and every section is closed, including mindset, friction, reference and glossary (check on ch.1 and ch.15) (AC 6).
  7. AC 7:
     - Checklist ticks survive collapsing and reopening the layer.
     - ch.5: the C4 level persists across a collapse.
     - ch.11: an FAQ playbook link lands on the friction playbook of the target chapter, opened, even when friction is in a collapsed layer.
     - ch.15: a category tile click filters and reveals the glossary after you close the glossary section.
  8. Navigating ch.1 → ch.2 opens ch.2 at its Core defaults.

- [ ] **Step 9: Commit**

```bash
git add src/components/guide src/components/GuideTab.tsx
git commit -m "feat: render chapter sections in level-driven reading layers

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: Sticky section outline (chip bar)

**Files:**
- Create: `src/components/guide/SectionOutline.tsx`
- Modify: `src/index.css:56-66` (anchor rule block)
- Modify: `src/components/GuideTab.tsx`:
  - Add the optional prop `onReplaceSection`.
  - Add `handleOutlineSelect`.
  - Render `SectionOutline` right after the lens banner.
  - Delete the `[data-temp-expand-controls]` block from Task 7.

**Interfaces:**
- Consumes (Task 1):
  - `LayerGroup`, `OpenState`, `SectionKey`
  - `LAYER_META`, `SECTION_META`, `sectionHasTool`, `openSection`, `expandAll`, `collapseAll`
- Consumes (Task 7): `layout`, `openState`, `setOpenState`, `setPendingScrollId` in GuideTab.
- Produces:
  - `SectionOutline: React.FC<SectionOutlineProps>` with

    ```ts
    interface SectionOutlineProps {
      chapter: Chapter;
      layout: LayerGroup[];
      openState: OpenState;
      onSelectSection: (key: SectionKey) => void;
      onExpandAll: () => void;
      onCollapseAll: () => void;
    }
    ```

  - GuideTab prop `onReplaceSection?: (section: SectionKey | null) => void`. It is optional here; Task 11 makes it required and wires it.
  - CSS var `--outline-h`.

- [ ] **Step 1: CSS.** In `src/index.css`, change the unlayered block to:

```css
:root {
  --header-h: 0px;
  --outline-h: 0px;
}

[id],
.anchor-target {
  scroll-margin-top: calc(var(--header-h) + var(--outline-h, 0px) + 16px);
}
```

Update the comment above it to mention that SectionOutline writes `--outline-h`.

- [ ] **Step 2: Create `SectionOutline.tsx`**

```tsx
import React, { useEffect, useRef } from 'react';
import type { Chapter } from '../../types';
import { LAYER_META, SECTION_META, sectionHasTool, type LayerGroup, type OpenState, type SectionKey } from '../../data/sectionLayers';

interface SectionOutlineProps {
  chapter: Chapter;
  layout: LayerGroup[];
  openState: OpenState;
  onSelectSection: (key: SectionKey) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

export const SectionOutline: React.FC<SectionOutlineProps> = ({ chapter, layout, openState, onSelectSection, onExpandAll, onCollapseAll }) => {
  const barRef = useRef<HTMLDivElement>(null);

  // Publish the bar height as --outline-h so anchor targets clear it (spec §2.2).
  useEffect(() => {
    const bar = barRef.current;
    const root = document.documentElement;
    if (!bar) return;
    const update = () => root.style.setProperty('--outline-h', `${Math.ceil(bar.getBoundingClientRect().height)}px`);
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(bar);
    return () => {
      observer?.disconnect();
      root.style.setProperty('--outline-h', '0px');
    };
  }, []);

  return (
    <div
      ref={barRef}
      data-section-outline
      className="sticky z-30 -mx-4 sm:-mx-6 lg:-mx-7 px-4 sm:px-6 lg:px-7 py-2 bg-white dark:bg-[#141414] border-b border-neutral-200 dark:border-[#262626]"
      style={{ top: 'var(--header-h)' }}
    >
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-1.5 overflow-x-auto">
        {layout.filter(g => g.sections.length > 0).map(group => (
          <React.Fragment key={group.layer}>
            <span data-outline-layer={group.layer} className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-[#737373] font-mono">
              {LAYER_META[group.layer].short}
            </span>
            {group.sections.map(key => {
              const open = !!openState.sections[key] && openState.layers[group.layer];
              return (
                <button
                  key={key}
                  type="button"
                  data-outline-chip={key}
                  aria-controls={`sec-${key}`}
                  aria-pressed={open}
                  onClick={() => onSelectSection(key)}
                  className={`shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full border text-xs font-semibold cursor-pointer transition-colors ${
                    open
                      ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-[#0a0a0a] dark:border-white'
                      : 'bg-transparent text-neutral-700 border-neutral-200 dark:text-[#d4d4d4] dark:border-[#333333]'
                  }`}
                >
                  {SECTION_META[key].chip}
                  {sectionHasTool(chapter, key) && (
                    <span data-tool-tag className="ml-1.5 px-1.5 py-px rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-[10px]">
                      ลองเล่น
                    </span>
                  )}
                </button>
              );
            })}
          </React.Fragment>
        ))}
        <span className="shrink-0 ml-auto flex items-center gap-2 pl-2 text-xs">
          <button type="button" onClick={onExpandAll} className="text-neutral-800 dark:text-[#d4d4d4] hover:underline font-semibold cursor-pointer">ขยายทั้งหมด</button>
          <span className="text-neutral-300 dark:text-[#333333]">|</span>
          <button type="button" onClick={onCollapseAll} className="text-neutral-500 dark:text-[#737373] hover:underline font-semibold cursor-pointer">ย่อทั้งหมด</button>
        </span>
      </div>
    </div>
  );
};
```

The negative margins match the chapter card padding (`p-4 sm:p-6 lg:p-7`, base `GuideTab.tsx:582`), so the opaque bar spans the card width.

- [ ] **Step 3: Wire it in GuideTab.** Add `onReplaceSection` to `GuideTabProps` and the destructuring. Add the handler:

```tsx
  // Chip click: open (never close) the section, scroll to it, and record it in the URL (spec §2.1).
  const handleOutlineSelect = (key: SectionKey) => {
    setOpenState(prev => openSection(prev, layout, key));
    setPendingScrollId(`sec-${key}`);
    onReplaceSection?.(key);
  };
```

Render it immediately after the lens banner's closing `</div>`:

```tsx
<SectionOutline
  chapter={activeChapter}
  layout={layout}
  openState={openState}
  onSelectSection={handleOutlineSelect}
  onExpandAll={() => setOpenState(expandAll(layout))}
  onCollapseAll={() => setOpenState(collapseAll(layout))}
/>
```

Delete the `[data-temp-expand-controls]` div.

- [ ] **Step 4: Sticky sanity.** `position: sticky` fails if an ancestor has `overflow` other than `visible`. In the browser, run:

```js
let e=document.querySelector('[data-section-outline]').parentElement, bad=[];
while(e){const o=getComputedStyle(e).overflow; if(o!=='visible') bad.push(e.className); e=e.parentElement;}
bad
```

Expected: `[]` (or only `html`/`body`). If an ancestor clips, change that ancestor's overflow class only when it is inside GuideTab. Otherwise report it.

- [ ] **Step 5: `bun run lint && bun run test && bun run build`.** Expected: all exit 0.

- [ ] **Step 6: Browser verification** (desktop and 375px, light and dark):
  1. AC 9. Scroll to the middle of ch.1: `document.querySelector('[data-section-outline]').getBoundingClientRect().top` equals `parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))` (±1). At 375px, `document.documentElement.scrollWidth === 375`, and the chip row scrolls horizontally.
  2. AC 10. As beginner on ch.1, click the `วิธีคิดแต่ละบทบาท` chip. Deep expands, `#sec-mindset` is open, and after the smooth scroll the section heading's `getBoundingClientRect().top` is ≥ header height + outline height. Its chip has `aria-pressed="true"`. Click the chip again: the section stays open.
  3. AC 11. `document.querySelector('[data-outline-chip="diagram"] [data-tool-tag]')` exists on ch.1, ch.5 and ch.15. `[data-outline-chip="friction"] [data-tool-tag]` exists on ch.1, ch.2 and ch.6, and not on ch.3 or ch.4.
  4. The opaque background is correct in both themes. Switch to the Quiz tab and back: `--outline-h` is `0px` while on Quiz.

- [ ] **Step 7: Commit**

```bash
git add src/components/guide/SectionOutline.tsx src/components/GuideTab.tsx src/index.css
git commit -m "feat: add sticky in-chapter section outline

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: Reading tracks in the index and chapter footer

**Files:**
- Create: `src/components/guide/TrackPanel.tsx`
- Create: `src/components/guide/TrackFooter.tsx`
- Modify: `src/components/GuideTab.tsx`:
  - desktop sidebar: the search at base `:396`, the list at `:436`
  - drawer: the list at `:1717-1719` (marker `Chapter Items List`)
  - footer: `:1589-1650` (marker `Chapter Footer Actions`)

**Interfaces:**
- Consumes (Task 2): `resolveTrack`, `getTrackMinutes`, `getTrackNext`, `getTrackProgress`, `TRACK_META`, `TrackNext`.
- Consumes (GuideTab): `handleSelectChapter`, `openIndex`, `onStartQuiz`, `onToggleReadChapter`, `isCurrentRead`.
- Produces:
  - `TrackPanel: React.FC<{ chapters: Chapter[]; experienceLevel: ExperienceLevel; readChapters: string[]; activeChapterId: string; onSelectChapter: (id: string) => void; onStartQuiz: () => void }>`
  - `TrackNextCard: React.FC<{ next: Extract<TrackNext, { kind: 'next' }>; chapters: Chapter[]; onSelectChapter: (id: string) => void }>`
  - `TrackEndCard: React.FC<{ experienceLevel: ExperienceLevel; onStartQuiz: () => void; onOpenIndex: (e: React.MouseEvent<HTMLElement>) => void }>`

- [ ] **Step 1: Create `TrackPanel.tsx`**

```tsx
import React from 'react';
import { Check } from 'lucide-react';
import type { Chapter, ExperienceLevel } from '../../types';
import { TRACK_META, getTrackMinutes, getTrackProgress, resolveTrack } from '../../data/readingTracks';

interface TrackPanelProps {
  chapters: Chapter[];
  experienceLevel: ExperienceLevel;
  readChapters: string[];
  activeChapterId: string;
  onSelectChapter: (id: string) => void;
  onStartQuiz: () => void;
}

export const TrackPanel: React.FC<TrackPanelProps> = ({ chapters, experienceLevel, readChapters, activeChapterId, onSelectChapter, onStartQuiz }) => {
  const trackIds = resolveTrack(experienceLevel, chapters);
  const { read, total, firstUnreadId } = getTrackProgress(trackIds, readChapters);
  const minutes = getTrackMinutes(trackIds, chapters);
  const pct = total === 0 ? 0 : Math.round((read / total) * 100);

  return (
    <div data-track-panel={experienceLevel} className="p-3 rounded-xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#181818] space-y-2.5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-[#fafafa]">{TRACK_META[experienceLevel].title}</h3>
        <span className="text-[11px] text-neutral-500 dark:text-[#8e8e8e] font-mono">≈ {minutes} นาที</span>
      </div>
      <div className="space-y-1">
        <div className="text-[11px] text-neutral-600 dark:text-[#a3a3a3] font-mono" data-track-progress>อ่านแล้ว {read}/{total}</div>
        <div className="h-1 rounded-full bg-neutral-200 dark:bg-[#262626] overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ol className="space-y-1">
        {trackIds.map((id, index) => {
          const chapter = chapters.find(c => c.id === id);
          if (!chapter) return null;
          const isActive = id === activeChapterId;
          const isRead = readChapters.includes(id);
          return (
            <li key={id}>
              <button
                type="button"
                data-track-item={id}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => onSelectChapter(id)}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-xs cursor-pointer ${
                  isActive ? 'bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a]' : 'text-neutral-800 dark:text-[#d4d4d4] hover:bg-neutral-100 dark:hover:bg-[#1f1f1f]'
                }`}
              >
                <span className="w-5 shrink-0 font-mono text-[10px] opacity-70">{index + 1}</span>
                <span className="flex-1 truncate">บทที่ {chapter.num}: {chapter.title}</span>
                {isRead && <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" aria-label="อ่านแล้ว" />}
              </button>
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        data-track-primary
        onClick={() => (firstUnreadId === null ? onStartQuiz() : onSelectChapter(firstUnreadId))}
        className="w-full px-3 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] text-xs font-bold cursor-pointer"
      >
        {firstUnreadId === null ? 'จบเส้นทางแล้ว — ทำแบบทดสอบ' : read === 0 ? 'เริ่มอ่าน' : 'อ่านต่อ'}
      </button>
    </div>
  );
};
```

- [ ] **Step 2: Create `TrackFooter.tsx`**

```tsx
import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Chapter, ExperienceLevel } from '../../types';
import { TRACK_META, type TrackNext } from '../../data/readingTracks';

const cardClass = 'p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] text-right bg-neutral-50/70 dark:bg-[#181818]';

export const TrackNextCard: React.FC<{
  next: Extract<TrackNext, { kind: 'next' }>;
  chapters: Chapter[];
  onSelectChapter: (id: string) => void;
}> = ({ next, chapters, onSelectChapter }) => {
  const chapter = chapters.find(c => c.id === next.chapterId);
  if (!chapter) return null;
  return (
    <button type="button" data-track-next={chapter.id} onClick={() => onSelectChapter(chapter.id)} className={`${cardClass} hover:border-neutral-400 dark:hover:border-[#404040] transition-all cursor-pointer group`}>
      <div className="flex items-center justify-end gap-1 text-[11px] text-neutral-900 dark:text-white font-semibold font-mono">
        <span>บทถัดไปใน track</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
      <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa] mt-1 truncate">
        บทที่ {chapter.num}: {chapter.title}
      </div>
    </button>
  );
};

export const TrackEndCard: React.FC<{
  experienceLevel: ExperienceLevel;
  onStartQuiz: () => void;
  onOpenIndex: (e: React.MouseEvent<HTMLElement>) => void;
}> = ({ experienceLevel, onStartQuiz, onOpenIndex }) => (
  <div data-track-end className={`${cardClass} space-y-2`}>
    <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa]">จบเส้นทาง{TRACK_META[experienceLevel].title}แล้ว</div>
    <div className="flex flex-wrap justify-end gap-2">
      <button type="button" onClick={onStartQuiz} className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] text-xs font-bold cursor-pointer">ทำแบบทดสอบ</button>
      <button type="button" onClick={onOpenIndex} className="px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-[#333333] text-xs font-semibold cursor-pointer">ดูสารบัญทั้งหมด</button>
    </div>
  </div>
);
```

- [ ] **Step 3: Index surfaces.** Render the track panel in the desktop sidebar directly above the search input (base `:396`) and in the drawer directly above the drawer search (marker `Drawer Search & Filter`):

```tsx
<TrackPanel chapters={chapters} experienceLevel={experienceLevel} readChapters={readChapters} activeChapterId={activeChapterId} onSelectChapter={handleSelectChapter} onStartQuiz={onStartQuiz} />
```

In both surfaces the order becomes: track panel, then this heading, then the existing search/role filter and full list (the search and filter apply to the full list only):

```tsx
<h3 data-all-chapters-heading className="text-xs font-bold text-neutral-500 dark:text-[#8e8e8e] font-mono">ทุกบท ({chapters.length})</h3>
```

`handleSelectChapter` already closes the drawer.

- [ ] **Step 4: Footer.** Before the `return`, compute:

```tsx
  const trackNext = getTrackNext(resolveTrack(experienceLevel, chapters), activeChapter.id);
```

Change the "อ่านจบแล้ว!" button (marker: the `onToggleReadChapter && !isCurrentRead` block). Keep its condition, classes and icon; change only `onClick` and the label:

```tsx
onClick={() => {
  onToggleReadChapter(activeChapter.id);
  if (trackNext.kind === 'next') handleSelectChapter(trackNext.chapterId);
  else if (trackNext.kind === 'not-in-track' && nextChapter) handleSelectChapter(nextChapter.id);
}}
```

The label is:
- `next`: `อ่านจบแล้ว! ไปบทถัดไปใน track (+30 XP)`
- `end`: `อ่านจบแล้ว! (+30 XP)`
- `not-in-track`: the original `อ่านจบแล้ว! ไปบทถัดไป (+30 XP)`

In the pagination grid, keep the previous card unchanged. Replace the `{nextChapter && (…)}` element with:

```tsx
{trackNext.kind === 'next' ? (
  <TrackNextCard next={trackNext} chapters={chapters} onSelectChapter={handleSelectChapter} />
) : trackNext.kind === 'end' ? (
  <TrackEndCard experienceLevel={experienceLevel} onStartQuiz={onStartQuiz} onOpenIndex={openIndex} />
) : (
  /* the original {nextChapter && (…)} element, unchanged */
)}
```

- [ ] **Step 5: `bun run lint && bun run test && bun run build`.** Expected: all exit 0.

- [ ] **Step 6: Browser verification**:
  1. AC 12. Fresh profile, desktop: the sidebar shows `[data-track-panel="beginner"]` above `[data-all-chapters-heading]` reading `ทุกบท (15)`. At 375px, open the drawer: the same panel appears above the heading. Mark ch.5 read (navigate there, click `อ่านจบแล้ว!`): `[data-track-progress]` still reads `อ่านแล้ว 0/8`.
  2. AC 13. Beginner on ch.4: `[data-track-next="s6"]` contains `บทถัดไปใน track`. On ch.14: `[data-track-end]` has the buttons `ทำแบบทดสอบ` and `ดูสารบัญทั้งหมด`, and the latter opens the drawer. On ch.5: the original `บทถัดไป` card shows `บทที่ 6`.
  3. AC 14. Beginner on ch.14 (unread): click `อ่านจบแล้ว! (+30 XP)`. The chapter is marked read (the `ผ่านแล้ว` badge appears) and the chapter title is unchanged.
  4. AC 15. On ch.4, switch the level to experienced. The panel becomes `[data-track-panel="experienced"]` titled `เส้นทางคนทำงานข้ามทีม`, and the footer shows the sequential card (s4 is not in that track), without a reload.
  5. Click a track item in the drawer: the chapter opens and the drawer closes.

- [ ] **Step 7: Commit**

```bash
git add src/components/guide/TrackPanel.tsx src/components/guide/TrackFooter.tsx src/components/GuideTab.tsx
git commit -m "feat: show reading tracks in the index and chapter footer

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 10: First-visit level card

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/components/guide/FirstVisitCard.tsx`
- Modify: `src/App.tsx`:
  - `:16-19` (level init)
  - `:147-156` (`handleExperienceLevelChange`)
  - `:272-287` (GuideTab props)
- Modify: `src/components/GuideTab.tsx`:
  - props
  - the welcome banner at base `:320-378` (marker `Top Welcome & Quick Jump Banner`)

**Interfaces:**
- Consumes (Task 2): `TRACK_CHAPTER_NUMS`, `resolveTrack`, `getTrackMinutes`.
- Produces:
  - `readStorage(key: string): string | null`
  - `writeStorage(key: string, value: string): void`
  - `FirstVisitCard: React.FC<{ chapters: Chapter[]; onChoose: (level: ExperienceLevel) => void; onSkip: () => void }>`
  - New GuideTab props, all optional until Task 11:
    - `showFirstVisit?: boolean`
    - `onChooseInitialLevel?: (level: ExperienceLevel) => void`
    - `loadedFromHash?: boolean`, default `false`
  - App: `levelChosen` state and `handleChooseInitialLevel(level: ExperienceLevel): void`

- [ ] **Step 1: Create `src/lib/storage.ts`**

```ts
/** Guarded localStorage access: private mode or blocked storage degrades to defaults (spec §6). */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: keep the in-memory value only.
  }
}
```

- [ ] **Step 2: App changes.** After the `experienceLevel` state, add:

```tsx
  const [levelChosen, setLevelChosen] = useState(() => readStorage('be_guide_exp_level') !== null);

  // First-visit choice or skip: set and persist the level, no XP (spec §4.1).
  const handleChooseInitialLevel = (level: ExperienceLevel) => {
    setExperienceLevel(level);
    writeStorage('be_guide_exp_level', level);
    setLevelChosen(true);
  };
```

Make `setLevelChosen(true);` the first statement of `handleExperienceLevelChange`, before its early return. Pass the new props to `<GuideTab>`:

```tsx
            showFirstVisit={!levelChosen}
            onChooseInitialLevel={handleChooseInitialLevel}
```

- [ ] **Step 3: Create `FirstVisitCard.tsx`**

```tsx
import React from 'react';
import type { Chapter, ExperienceLevel } from '../../types';
import { TRACK_CHAPTER_NUMS, getTrackMinutes, resolveTrack } from '../../data/readingTracks';

const OPTIONS: { level: ExperienceLevel; label: string; line: string }[] = [
  { level: 'beginner', label: '🌱 ใหม่กับเรื่องนี้', line: 'ยังไม่คุ้นศัพท์และขั้นตอนระหว่าง Business กับ Engineering เริ่มจากปฐมบท ศัพท์ และแผนภาพ' },
  { level: 'experienced', label: '⚡ ทำงานข้ามทีมมาแล้ว', line: 'เคยคุยงานกับอีกฝั่งมาแล้ว อยากได้แนวคิดหลัก กับดัก และวิธีรับมือความขัดแย้ง' },
];

export const FirstVisitCard: React.FC<{
  chapters: Chapter[];
  onChoose: (level: ExperienceLevel) => void;
  onSkip: () => void;
}> = ({ chapters, onChoose, onSkip }) => (
  <div data-first-visit className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs space-y-4">
    <h2 className="text-lg sm:text-xl font-extrabold text-neutral-900 dark:text-[#fafafa]">เริ่มจากตรงไหนดี?</h2>
    <div className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map(option => (
        <button
          key={option.level}
          type="button"
          data-first-visit-option={option.level}
          onClick={() => onChoose(option.level)}
          className="text-left p-4 rounded-xl border border-neutral-200 dark:border-[#333333] hover:border-neutral-400 dark:hover:border-[#525252] cursor-pointer space-y-1.5"
        >
          <div className="font-bold text-sm text-neutral-900 dark:text-[#fafafa]">{option.label}</div>
          <div className="text-xs text-neutral-600 dark:text-[#a3a3a3] leading-relaxed">{option.line}</div>
          <div className="text-[11px] text-neutral-500 dark:text-[#8e8e8e] font-mono">
            เส้นทาง: บท {TRACK_CHAPTER_NUMS[option.level].join(' → ')} · ≈ {getTrackMinutes(resolveTrack(option.level, chapters), chapters)} นาที
          </div>
        </button>
      ))}
    </div>
    <button type="button" data-first-visit-skip onClick={onSkip} className="text-xs font-semibold text-neutral-500 dark:text-[#8e8e8e] hover:underline cursor-pointer">
      ข้ามไปก่อน (ใช้โหมดมือใหม่)
    </button>
  </div>
);
```

Use `TRACK_CHAPTER_NUMS` for the display so it matches the spec copy exactly. `resolveTrack` feeds the minutes.

- [ ] **Step 4: GuideTab wiring.** Add the three props, with `loadedFromHash = false` in the destructuring. Add the handlers:

```tsx
  const handleFirstVisitChoice = (level: ExperienceLevel) => {
    onChooseInitialLevel?.(level);
    if (loadedFromHash) return; // a shared link wins over onboarding (spec §4.3, D5)
    const first = resolveTrack(level, chapters)[0];
    if (first) handleSelectChapter(first);
    if (!window.matchMedia('(min-width: 1024px)').matches) setIsIndexOpen(true);
  };
  const handleFirstVisitSkip = () => onChooseInitialLevel?.('beginner');
```

`handleSelectChapter` sets the drawer closed and `setIsIndexOpen(true)` then reopens it in the same batch. Wrap the welcome banner:

```tsx
{showFirstVisit ? (
  <FirstVisitCard chapters={chapters} onChoose={handleFirstVisitChoice} onSkip={handleFirstVisitSkip} />
) : (
  /* existing welcome banner, unchanged */
)}
```

- [ ] **Step 5: `bun run lint && bun run test && bun run build`.** Expected: all exit 0.

- [ ] **Step 6: Browser verification** (fresh profile each time; read XP with `JSON.parse(localStorage.be_guide_stats||'{}').xp`):
  1. AC 16, at 375px. `[data-first-visit]` is present and the welcome banner is absent. The beginner option shows `เส้นทาง: บท 1 → 2 → 3 → 4 → 6 → 7 → 11 → 14 · ≈ 92 นาที`. Record the XP, then click `[data-first-visit-option="experienced"]`. Then `localStorage.be_guide_exp_level === 'experienced'`, the XP is unchanged, the chapter title is ch.11's, and the drawer is open showing `[data-track-panel="experienced"]`. At desktop width the same choice opens ch.11 with the drawer closed.
  2. AC 17. Click `[data-first-visit-skip]`: the key is `beginner`, the chapter stays ch.1, and the XP is unchanged. After a reload, `[data-first-visit]` is absent.
  3. AC 18. With the card showing, click the lens banner's `⚡ ทำงานข้ามทีมมาแล้ว`. The card disappears and XP is awarded as before (button behaviour unchanged). After a reload the card stays gone (the key was written). Then clear storage and click the already-active `🌱 ใหม่กับเรื่องนี้`: the card disappears for this page session. Because of the unchanged early return, it reappears after a reload. Report this in the task summary (see Self-review, open ambiguity).
  4. AC 19 is verified in Task 11 (it needs the hash loader).

- [ ] **Step 7: Commit**

```bash
git add src/lib/storage.ts src/components/guide/FirstVisitCard.tsx src/components/GuideTab.tsx src/App.tsx
git commit -m "feat: add first-visit level card

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 11: Hash deep links and lifted `activeChapterId`

**Files:**
- Create: `src/hooks/useChapterRoute.ts`
- Modify: `src/App.tsx`: use the hook, add the tab ↔ hash effect, and pass the new GuideTab props (`:272-287`).
- Modify: `src/components/GuideTab.tsx`:
  - Remove `activeChapterId` state (base `:85`).
  - Make the props required.
  - Change all `setActiveChapterId` call sites (spec §0: base `:214, 233, 246, 356, 444, 501, 567, 1605, 1620, 1635, 1727`, many now inside `handleSelectChapter`).
  - Replace `sectionRequest` local state (Task 7) with the prop.
  - Update the handlers.
- Modify: `src/components/content/RichText.tsx:44` (href only)

**Interfaces:**
- Consumes (Task 3): `parseChapterHash`, `formatChapterHash`, `RequestedSection`.
- Consumes (Task 1): `SectionKey`, `isSectionPresent`.
- Produces, in `src/hooks/useChapterRoute.ts`:

```ts
export interface ChapterRouteApi {
  activeChapterId: string;
  requestedSection: RequestedSection | null;
  loadedFromHash: boolean;
  navigate: (chapterId: string, section?: SectionKey) => void;
  replaceSection: (section: SectionKey | null) => void;
}
export function useChapterRoute(chapters: Chapter[], opts: { onChapterRoute: () => void }): ChapterRouteApi;
```

- GuideTab props (now required):
  - `activeChapterId: string`
  - `requestedSection: RequestedSection | null`
  - `onNavigateChapter: (chapterId: string, section?: SectionKey) => void`
  - `onReplaceSection: (section: SectionKey | null) => void`
  - `loadedFromHash: boolean`

- [ ] **Step 1: Create the hook**

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Chapter } from '../types';
import type { SectionKey } from '../data/sectionLayers';
import { formatChapterHash, parseChapterHash, type RequestedSection } from '../lib/chapterRoute';
// Task 12 adds: import { readStorage, writeStorage } from '../lib/storage';

export interface ChapterRouteApi {
  activeChapterId: string;
  requestedSection: RequestedSection | null;
  loadedFromHash: boolean;
  navigate: (chapterId: string, section?: SectionKey) => void;
  replaceSection: (section: SectionKey | null) => void;
}

const DEFAULT_CHAPTER = 's1';

export function useChapterRoute(chapters: Chapter[], opts: { onChapterRoute: () => void }): ChapterRouteApi {
  const [init] = useState(() => {
    const route = parseChapterHash(window.location.hash, chapters);
    return { route, chapterId: route?.chapterId ?? DEFAULT_CHAPTER };
  });
  const [activeChapterId, setActiveChapterId] = useState(init.chapterId);
  const [requestedSection, setRequestedSection] = useState<RequestedSection | null>(
    init.route?.section ? { key: init.route.section, nonce: 1 } : null,
  );
  const nonceRef = useRef(1);
  const activeRef = useRef(activeChapterId);
  activeRef.current = activeChapterId;
  const onRouteRef = useRef(opts.onChapterRoute);
  onRouteRef.current = opts.onChapterRoute;

  const numOf = useCallback((id: string) => chapters.find(c => c.id === id)?.num, [chapters]);

  // Initial canonicalisation: fix an invalid or non-canonical hash; never write one on a bare load.
  useEffect(() => {
    const { hash } = window.location;
    if (!hash) return;
    const num = numOf(init.chapterId);
    if (num === undefined) return;
    const canonical = formatChapterHash(num, init.route?.section);
    if (hash !== canonical) window.history.replaceState(null, '', canonical);
  }, [init, numOf]);

  // Back/forward and manual hash edits. Never pushes.
  useEffect(() => {
    const onPopState = () => {
      const { hash } = window.location;
      if (hash === '' || hash === '#') {
        // The bare entry is the untouched initial page, which shows the default chapter.
        setActiveChapterId(DEFAULT_CHAPTER);
        setRequestedSection(null);
        onRouteRef.current();
        return;
      }
      const route = parseChapterHash(hash, chapters);
      if (!route) {
        const num = numOf(activeRef.current);
        if (num !== undefined) window.history.replaceState(null, '', formatChapterHash(num));
        return;
      }
      setActiveChapterId(route.chapterId);
      setRequestedSection(route.section ? { key: route.section, nonce: ++nonceRef.current } : null);
      onRouteRef.current();
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [chapters, numOf]);

  const navigate = useCallback((chapterId: string, section?: SectionKey) => {
    const num = numOf(chapterId);
    if (num === undefined) return;
    setActiveChapterId(chapterId);
    setRequestedSection(section ? { key: section, nonce: ++nonceRef.current } : null);
    const hash = formatChapterHash(num, section);
    if (window.location.hash !== hash) window.history.pushState(null, '', hash);
  }, [numOf]);

  const replaceSection = useCallback((section: SectionKey | null) => {
    const num = numOf(activeRef.current);
    if (num === undefined) return;
    window.history.replaceState(null, '', formatChapterHash(num, section ?? undefined));
  }, [numOf]);

  return { activeChapterId, requestedSection, loadedFromHash: init.route !== null, navigate, replaceSection };
}
```

- [ ] **Step 2: App wiring.** Call the hook after `activeTab`. Use the same chapter array App passes to GuideTab (`CHAPTERS`, `App.tsx:274`):

```tsx
  const route = useChapterRoute(CHAPTERS, { onChapterRoute: () => setActiveTab('guide') });

  // Tabs are not routes: clear the hash off the guide, restore it on return (spec §5.2).
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    const prev = prevTabRef.current;
    prevTabRef.current = activeTab;
    if (activeTab !== 'guide') {
      if (window.location.hash) window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return;
    }
    if (prev !== 'guide') {
      const num = CHAPTERS.find(c => c.id === route.activeChapterId)?.num;
      if (num !== undefined) window.history.replaceState(null, '', formatChapterHash(num));
    }
  }, [activeTab, route.activeChapterId]);
```

Add `useRef` to the React import. Pass the props to `<GuideTab>`:

```tsx
            activeChapterId={route.activeChapterId}
            requestedSection={route.requestedSection}
            onNavigateChapter={route.navigate}
            onReplaceSection={route.replaceSection}
            loadedFromHash={route.loadedFromHash}
```

- [ ] **Step 3: GuideTab changes.**
  1. Delete `const [activeChapterId, setActiveChapterId] = useState<string>('s1');`. Add the five props to `GuideTabProps` (required) and the destructuring. Remove the `= false` default on `loadedFromHash` and the `?` on `onReplaceSection`.
  2. `handleSelectChapter` becomes:
     ```tsx
     const handleSelectChapter = (chapterId: string) => {
       onNavigateChapter(chapterId);
       setIsIndexOpen(false);
       window.scrollTo({ top: 0, behavior: 'smooth' });
     };
     ```
  3. Replace every other `setActiveChapterId(x)` with `onNavigateChapter(x)`. `grep -n setActiveChapterId src/components/GuideTab.tsx` must print nothing.
  4. Delete the `sectionRequest` state and `requestSection`. The request effect now reads the prop, and when the section is absent it clears it from the URL:
     ```tsx
     useEffect(() => {
       if (!requestedSection) return;
       if (!isSectionPresent(activeChapter, requestedSection.key)) {
         onReplaceSection(null);
         return;
       }
       setOpenState(openSection(deriveOpenState(layout), layout, requestedSection.key));
       setPendingScrollId(`sec-${requestedSection.key}`);
     }, [requestedSection?.nonce]);
     ```
  5. `handleSearchGlossary`: replace `setActiveChapterId('s15'); …; requestSection('glossary');` with `onNavigateChapter('s15', 'glossary');`. Keep the query/category setters and `setIsIndexOpen(false)`.
  6. `handleScrollToPlaybook`: in the chapter-change branch, replace `setActiveChapterId(chapterId); …; requestSection('friction');` with `onNavigateChapter(chapterId, 'friction');`. Keep `setIsIndexOpen(false)`. The same-chapter branch is unchanged.

- [ ] **Step 4: RichText href.** In `src/components/content/RichText.tsx`, change `href={\`#${chapterId}\`}` so that it produces the canonical hash. The chapter id has the form `sN`:

```tsx
              href={formatChapterHash(Number(chapterId.slice(1)))}
```

Import `formatChapterHash` from `'../../lib/chapterRoute'`. The `onClick` stays unchanged.

- [ ] **Step 5: `bun run lint && bun run test && bun run build`.** Expected: all exit 0.

- [ ] **Step 6: Browser verification**:
  1. AC 20. Load `http://localhost:53479/#/ch/6/checklist` (level key set). The guide tab shows ch.6, `#sec-checklist` is open (its checklist items are visible), and it is scrolled so that its top is within the viewport, below the outline bar.
  2. AC 21. Load `/#/ch/99`: ch.1 shows and `location.hash === '#/ch/1'`. Load `/#/ch/6/xyz`: ch.6 shows with `scrollY` near 0 and `location.hash === '#/ch/6'`. Load `/#/ch/3/reference`: ch.3 shows and the hash becomes `#/ch/3`. No console errors.
  3. AC 22. From `/#/ch/1`, navigate ch.1 → ch.2 → ch.3 via the next-chapter card or the index, then run `history.back()` twice with a short wait between. The chapter title updates each time, ending at ch.1. `history.length` grew by exactly 2.
  4. Outline chip click: `location.hash` becomes `#/ch/<num>/<key>` and `history.length` is unchanged (AC 10 URL part).
  5. AC 23. On ch.4, switch to the Quiz tab: `location.hash === ''`. Return to the guide: ch.4 is still shown and `location.hash === '#/ch/4'`.
  6. AC 19. Fresh profile (`localStorage.clear()`), load `/#/ch/8`. The first-visit card shows; choose `⚡ ทำงานข้ามทีมมาแล้ว`. ch.8 stays and the drawer does not open.
  7. With the Quiz tab open, press Back to a `#/ch/…` entry: the app switches to the guide tab.
  8. ch.11: an FAQ playbook link and a concept chip still work, and the URL reflects `#/ch/<n>/friction` or `#/ch/15/glossary`.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useChapterRoute.ts src/App.tsx src/components/GuideTab.tsx src/components/content/RichText.tsx
git commit -m "feat: add chapter deep links and lift active chapter into a route hook

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 12: Last-chapter persistence and resume banner

**Files:**
- Modify: `src/hooks/useChapterRoute.ts`
- Create: `src/components/guide/ResumeBanner.tsx`
- Modify: `src/App.tsx` (pass `resumeCandidate`)
- Modify: `src/components/GuideTab.tsx`: add the prop, and add the banner above the chapter top navigation bar (marker `Chapter Top Navigation Bar`, base `:494-495`)

**Interfaces:**
- Consumes (Task 10): `readStorage`, `writeStorage`.
- Consumes (Task 11): `ChapterRouteApi`.
- Produces:
  - `ChapterRouteApi` gains `resumeCandidate: string | null`.
  - `ResumeBanner: React.FC<{ chapter: Chapter; onResume: () => void; onDismiss: () => void }>`
  - GuideTab prop `resumeCandidate: string | null`

- [ ] **Step 1: Hook persistence.** In `useChapterRoute`:

```ts
const LAST_CHAPTER_KEY = 'be_guide_last_chapter';
// inside the hook:
  const [resumeCandidate] = useState(() => readStorage(LAST_CHAPTER_KEY));
  const navigatedRef = useRef(false);
```

Set `navigatedRef.current = true;` as the first line of `navigate` and in `onPopState` before each `setActiveChapterId`. Add:

```ts
  // Persist only after a real navigation (or a hash load) so the untouched default 's1'
  // never overwrites the stored chapter before the resume banner can use it (spec §5.3).
  useEffect(() => {
    if (navigatedRef.current || init.route !== null) writeStorage(LAST_CHAPTER_KEY, activeChapterId);
  }, [activeChapterId, init]);
```

Add `resumeCandidate` to `ChapterRouteApi` and the return value.

- [ ] **Step 2: Create `ResumeBanner.tsx`**

```tsx
import React from 'react';
import { X } from 'lucide-react';
import type { Chapter } from '../../types';

export const ResumeBanner: React.FC<{ chapter: Chapter; onResume: () => void; onDismiss: () => void }> = ({ chapter, onResume, onDismiss }) => (
  <div data-resume-banner className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#181818]">
    <p className="text-xs sm:text-sm text-neutral-800 dark:text-[#d4d4d4] min-w-0">
      อ่านต่อจากครั้งก่อน? บทที่ {chapter.num}: {chapter.title}
    </p>
    <div className="flex items-center gap-2 shrink-0">
      <button type="button" onClick={onResume} className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] text-xs font-bold cursor-pointer">
        อ่านต่อบทที่ {chapter.num}
      </button>
      <button type="button" onClick={onDismiss} aria-label="ปิดแถบอ่านต่อ" title="ปิด" className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-200 dark:hover:bg-[#262626] cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  </div>
);
```

- [ ] **Step 3: GuideTab.** Add the prop `resumeCandidate: string | null`. Pass `resumeCandidate={route.resumeCandidate}` from App. Add:

```tsx
  const [resumeDismissed, setResumeDismissed] = useState(false);
  const initialChapterRef = useRef(activeChapterId);
  // Any navigation away from the initial chapter hides the banner for this page session.
  useEffect(() => {
    if (activeChapterId !== initialChapterRef.current) setResumeDismissed(true);
  }, [activeChapterId]);
  const resumeChapter = resumeCandidate ? chapters.find(c => c.id === resumeCandidate) : undefined;
  const showResume = !loadedFromHash && !!resumeChapter && resumeChapter.id !== activeChapterId && !showFirstVisit && !resumeDismissed;
```

Immediately before the `Chapter Top Navigation Bar` element:

```tsx
{showResume && resumeChapter && (
  <ResumeBanner
    chapter={resumeChapter}
    onResume={() => { setResumeDismissed(true); handleSelectChapter(resumeChapter.id); }}
    onDismiss={() => setResumeDismissed(true)}
  />
)}
```

- [ ] **Step 4: `bun run lint && bun run test && bun run build`.** Expected: all exit 0.

- [ ] **Step 5: Browser verification** (AC 24; level key set so the first-visit card is hidden):
  1. `localStorage.removeItem('be_guide_last_chapter')`, then load the bare URL: `localStorage.be_guide_last_chapter` is still absent (no write on the untouched default).
  2. Navigate to ch.7: the key equals `s7`.
  3. Open `http://localhost:53479/` with no hash in the same tab (`location.href = location.origin + '/'`). `[data-resume-banner]` shows `อ่านต่อจากครั้งก่อน? บทที่ 7: …` and a button `อ่านต่อบทที่ 7`. Reload once more without clicking: the key is still `s7`.
  4. Click `อ่านต่อบทที่ 7`: ch.7 opens and the banner is gone.
  5. Repeat step 3 and click `ปิด` (`[aria-label="ปิดแถบอ่านต่อ"]`): the banner hides. Reload: it shows again.
  6. Load `/#/ch/3`: no banner (loaded from hash). With the level key removed and a bare URL: the first-visit card shows and there is no banner.
  7. Final regression pass: rerun AC 1, 6, 10, 13, 20 and 22 quickly at 375px, in dark mode.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useChapterRoute.ts src/components/guide/ResumeBanner.tsx src/components/GuideTab.tsx src/App.tsx
git commit -m "feat: remember the last chapter and offer to resume it

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Self-review

**Spec coverage (acceptance criterion → task):**

| AC | Task | AC | Task | AC | Task |
|---|---|---|---|---|---|
| 1 | 7 | 9 | 8 | 17 | 10 |
| 2 | 7 | 10 | 8 (+URL in 11) | 18 | 10 |
| 3 | 7 | 11 | 1 (logic), 8 (UI) | 19 | 11 |
| 4 | 7 | 12 | 9 | 20 | 11 |
| 5 | 1, 7 | 13 | 2, 9 | 21 | 3, 11 |
| 6 | 1, 7 | 14 | 9 | 22 | 11 |
| 7 | 4–7 | 15 | 9 | 23 | 11 |
| 8 | 7 | 16 | 10 | 24 | 12 |
| 25 | 1–3 (tests), every task (lint/build) | | | | |

Spec sections:
- §1.1–1.4 → Task 1
- §1.5/1.6 → Task 7
- §1.7 → Tasks 4–7
- §2 → Tasks 7–8
- §3 → Tasks 2, 9
- §4 → Tasks 7 (lens copy), 10
- §5.1 → Task 3
- §5.2 → Task 11
- §5.3/5.4 → Task 12
- §6 storage helpers → Task 10
- §8 → Tasks 1–3

**Resolved spec gaps (decisions made in this plan):**
1. `GuideSectionContext` adds `chapters: Chapter[]`. The glossary block passes `chapters` to `GlossaryPanel` (base `:711`), and spec §1.7 omits it.
2. `navigate(chapterId, section)` also sets `requestedSection`. Spec §5.2 relies on this for `handleScrollToPlaybook` but does not say it.
3. `useChapterRoute` returns `resumeCandidate`. §5.3 says the hook captures it but §5.2's API omits it.
4. `popstate` to an empty hash shows `s1` instead of "keep state + replace". Otherwise Back to the bare initial entry could never return to ch.1 (AC 22 from a bare load).
5. The requested-section scroll targets `sec-friction`, the wrapper whose top is the playbook card's top, not `friction-playbook-card`. The same-chapter playbook path still scrolls to `friction-playbook-card`.
6. The outline gets the ids `sec-<key>`, and `TrackFooter.tsx` exports two components (`TrackNextCard`, `TrackEndCard`) because the next card and the read button live in different footer rows.

**Open ambiguity to confirm with the owner:** AC 18 says toggling the level "hides the card permanently". But `handleExperienceLevelChange` early-returns without writing the key when the chosen level equals the current one (spec §4.1 keeps that behaviour). Clicking the already-active `🌱` button therefore hides the card only until reload. Task 10 records this and does not change button behaviour. The fix, if wanted, is to write the key before the early return.
