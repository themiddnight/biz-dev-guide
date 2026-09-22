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
