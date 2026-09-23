import { describe, it, expect } from 'vitest';
import { CHAPTERS } from './chaptersData';
import {
  LAYERS, SECTION_KEYS, LAYER_CONFIG, SECTION_META, sectionMinutes,
  getLayerOf, getChapterLayout, deriveOpenState, expandAll, collapseAll,
  openSection, toggleSection, toggleLayer, isSectionPresent, isSectionKey, sectionHasTool,
  CHAPTER_CORE_COLLAPSED,
  type SectionKey,
} from './sectionLayers';
import type { ExperienceLevel } from '../types';
import { resolveChapterLevel } from './rolePerspective';

const ch = (id: string) => {
  const c = CHAPTERS.find(x => x.id === id);
  if (!c) throw new Error(`missing ${id}`);
  return c;
};
const LEVELS: ExperienceLevel[] = ['beginner', 'experienced'];
const core = (level: ExperienceLevel, id: string) =>
  getChapterLayout(level, ch(id)).find(g => g.layer === 'core')!.sections;

describe('LAYER_CONFIG', () => {
  it.each(LEVELS)('%s contains all 15 keys exactly once', level => {
    const all = LAYERS.flatMap(l => LAYER_CONFIG[level][l]);
    expect(all).toHaveLength(15);
    expect([...all].sort()).toEqual([...SECTION_KEYS].sort());
  });
  it('isSectionKey accepts keys and rejects others', () => {
    expect(isSectionKey('diagram')).toBe(true);
    expect(isSectionKey('xyz')).toBe(false);
  });
  it('core puts jargon after the primer for beginners and otherSide first for experienced (P2.2, term-definitions P1)', () => {
    expect(LAYER_CONFIG.beginner.core).toEqual(['primer', 'jargon', 'otherSide', 'coreConcepts', 'diagram']);
    expect(LAYER_CONFIG.beginner.apply).toContain('pitfalls');
    expect(LAYER_CONFIG.beginner.deep).toEqual(['reference', 'glossary', 'mindset']);
    expect(LAYER_CONFIG.experienced.core).toEqual(['otherSide', 'coreConcepts', 'pitfalls', 'diagram']);
    expect(SECTION_META.otherSide).toEqual({ chip: 'อีกฝั่งมองยังไง', minutes: 2 });
  });
  it('beginner jargon precedes every section that uses terms bare (term-definitions D3)', () => {
    const at = (key: SectionKey) => LAYER_CONFIG.beginner.core.indexOf(key);
    expect(at('jargon')).toBeLessThan(at('coreConcepts'));
    expect(at('jargon')).toBeLessThan(at('otherSide'));
    expect(at('jargon')).toBeLessThan(at('diagram'));
    expect(at('primer')).toBeLessThan(at('jargon'));
  });
  it('no chapter forces a Core section closed (term-definitions D4)', () => {
    expect(CHAPTER_CORE_COLLAPSED.s3).toBeUndefined();
    expect(Object.keys(CHAPTER_CORE_COLLAPSED)).toEqual([]);
  });
});

describe('role-resolved layout', () => {
  const coreFor = (role: 'biz' | 'eng', id: string) => {
    const level = resolveChapterLevel({ role, baseLevel: 'beginner', levelMode: 'auto', chapterLevels: {} }, ch(id)).level;
    return getChapterLayout(level, ch(id)).find(g => g.layer === 'core')!.sections;
  };
  it('s6 opens as experienced for eng and beginner for biz', () => {
    expect(coreFor('eng', 's6')).toEqual(['otherSide', 'coreConcepts', 'pitfalls', 'diagram']);
    expect(coreFor('biz', 's6')).toEqual(['primer', 'jargon', 'otherSide', 'coreConcepts', 'diagram']);
  });
});

describe('getLayerOf', () => {
  it('beginner samples', () => {
    expect(getLayerOf('beginner', 'jargon', 's1')).toBe('core');
    expect(getLayerOf('beginner', 'friction', 's1')).toBe('apply');
    expect(getLayerOf('beginner', 'mindset', 's1')).toBe('deep');
    expect(getLayerOf('beginner', 'coreConcepts', 's1')).toBe('core');
    expect(getLayerOf('beginner', 'pitfalls', 's1')).toBe('apply');
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
    expect(core('beginner', 's1')).toEqual(['primer', 'jargon', 'otherSide', 'coreConcepts']);
  });
  it('experienced s1 core', () => {
    expect(core('experienced', 's1')).toEqual(['otherSide', 'coreConcepts', 'pitfalls']);
  });
  it('always returns 3 groups in LAYERS order', () => {
    for (const level of LEVELS) for (const c of CHAPTERS) {
      expect(getChapterLayout(level, c).map(g => g.layer)).toEqual(['core', 'apply', 'deep']);
    }
  });
  it('s15 leads core with the glossary, then its own jargon list (term-definitions P2.3)', () => {
    expect(core('beginner', 's15')).toEqual(['glossary', 'primer', 'jargon', 'otherSide', 'coreConcepts', 'diagram']);
    expect(core('experienced', 's15')).toEqual(['glossary', 'otherSide', 'coreConcepts', 'pitfalls', 'diagram']);
    expect(getChapterLayout('experienced', ch('s15')).find(g => g.layer === 'deep')!.sections).toContain('jargon');
  });
  it('override keys appear only in core for s11/s15', () => {
    for (const level of LEVELS) {
      expect(core(level, 's11')[0]).toBe('faq');
      expect(core(level, 's15')[0]).toBe('glossary');
      const rest = (id: string) => getChapterLayout(level, ch(id)).filter(g => g.layer !== 'core').flatMap(g => g.sections);
      expect(rest('s11')).not.toContain('faq');
      expect(rest('s15')).not.toContain('glossary');
    }
    expect(core('beginner', 's11')).toEqual(['faq', 'primer', 'jargon', 'otherSide', 'coreConcepts', 'diagram']);
  });
  it('layer minutes = sum of sectionMinutes', () => {
    for (const level of LEVELS) for (const g of getChapterLayout(level, ch('s1'))) {
      expect(g.minutes).toBe(g.sections.reduce((s, k) => s + sectionMinutes(level, k), 0));
    }
    expect(getChapterLayout('beginner', ch('s1'))[0].minutes).toBe(7); // primer + jargon + otherSide + coreConcepts (1); s1 has no Diagram section after Q4
  });
  it('sectionMinutes: compact core concepts count 1 minute for beginners only', () => {
    expect(sectionMinutes('beginner', 'coreConcepts')).toBe(1);
    expect(sectionMinutes('experienced', 'coreConcepts')).toBe(3);
    expect(sectionMinutes('beginner', 'primer')).toBe(SECTION_META.primer.minutes);
  });
  it('every chapter has coreConcepts in the beginner Core layer', () => {
    for (const c of CHAPTERS) expect(core('beginner', c.id)).toContain('coreConcepts');
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
  it('mindset, friction, otherSide in every chapter', () => {
    for (const key of ['mindset', 'friction', 'otherSide'] as SectionKey[]) expect(idsWith(key)).toHaveLength(CHAPTERS.length);
  });
  it('diagram in every chapter except s1 (widget moved to s8, Q4), s14 (Q6) and s16-s19 (P4.1)', () => {
    expect(idsWith('diagram')).toHaveLength(13);
    expect(idsWith('diagram')).not.toContain('s1');
    expect(idsWith('diagram')).not.toContain('s14');
  });
});

describe('sectionHasTool', () => {
  it('diagram in all chapters but s1, s14 and s16-s19; friction only in s1, s2, s6', () => {
    expect(CHAPTERS.filter(c => !sectionHasTool(c, 'diagram')).map(c => c.id)).toEqual(['s1', 's14', 's16', 's17', 's18', 's19']);
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
  it('deriveOpenState opens s3\'s jargon block, whose title needs it (term-definitions D4)', () => {
    const s3 = getChapterLayout('beginner', ch('s3'));
    const s = deriveOpenState(s3, 's3');
    expect(s.layers.core).toBe(true);
    expect(s.sections.jargon).toBe(true);
    expect(s.sections.primer).toBe(true);
    expect(s.sections.diagram).toBe(true);
    expect(s).toEqual(deriveOpenState(s3));
    expect(deriveOpenState(layout, 's1')).toEqual(deriveOpenState(layout));
    const exp = getChapterLayout('experienced', ch('s3'));
    expect(deriveOpenState(exp, 's3')).toEqual(deriveOpenState(exp));
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
