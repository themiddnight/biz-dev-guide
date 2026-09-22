import type { Chapter, ChapterContentSection, ContentPlacement, ExperienceLevel } from '../types';
import { DIAGRAM_WIDGET_CHAPTERS, GLOSSARY_MAP_CHAPTER } from './diagramWidgets';

export type Layer = 'core' | 'apply' | 'deep';
export const LAYERS: readonly Layer[] = ['core', 'apply', 'deep'];

export type SectionKey =
  | 'mindset' | 'otherSide' | 'friction' | 'primer' | 'jargon' | 'dialogue' | 'diagram' | 'faq'
  | 'examples' | 'coreConcepts' | 'reference' | 'glossary' | 'workflow' | 'pitfalls' | 'checklist';

export const SECTION_KEYS: readonly SectionKey[] = [
  'mindset', 'otherSide', 'friction', 'primer', 'jargon', 'dialogue', 'diagram', 'faq',
  'examples', 'coreConcepts', 'reference', 'glossary', 'workflow', 'pitfalls', 'checklist',
];

export const LAYER_CONFIG: Record<ExperienceLevel, Record<Layer, readonly SectionKey[]>> = {
  beginner: {
    core: ['primer', 'otherSide', 'coreConcepts', 'jargon', 'diagram'],
    apply: ['dialogue', 'examples', 'workflow', 'checklist', 'pitfalls', 'faq', 'friction'],
    deep: ['reference', 'glossary', 'mindset'],
  },
  experienced: {
    core: ['otherSide', 'coreConcepts', 'pitfalls', 'diagram'],
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
  primer: { chip: 'จุดเริ่มต้น', minutes: 2 },
  jargon: { chip: 'ศัพท์จำเป็น', minutes: 2 },
  diagram: { chip: 'แผนภาพ', minutes: 3 },
  dialogue: { chip: 'บทสนทนา', minutes: 2 },
  examples: { chip: 'ตัวอย่างจริง', minutes: 3 },
  workflow: { chip: 'ขั้นตอนงาน', minutes: 2 },
  checklist: { chip: 'เช็กลิสต์', minutes: 1 },
  faq: { chip: 'คำถามที่เจอบ่อย', minutes: 6 },
  friction: { chip: 'รับมือ Friction', minutes: 4 },
  coreConcepts: { chip: 'แนวคิดหลัก', minutes: 3 },
  pitfalls: { chip: 'กับดัก', minutes: 2 },
  reference: { chip: 'อ้างอิง', minutes: 3 },
  glossary: { chip: 'รวมคำศัพท์', minutes: 5 },
  mindset: { chip: 'วิธีคิดแต่ละบทบาท', minutes: 2 },
  otherSide: { chip: 'อีกฝั่งมองยังไง', minutes: 2 },
};

/**
 * Reading minutes of one section at a level. Beginners see core concepts compact
 * (heading + detail only), so they count 1 minute instead of 3 (role UX fixes D3).
 */
export function sectionMinutes(level: ExperienceLevel, key: SectionKey): number {
  if (level === 'beginner' && key === 'coreConcepts') return 1;
  return SECTION_META[key].minutes;
}

/** Layer header name (spec §2.3) and short outline label (spec §2.1). */
export const LAYER_META: Record<Layer, { name: string; short: string }> = {
  core: { name: 'ต้องรู้ (Core)', short: 'ต้องรู้' },
  apply: { name: 'นำไปใช้ (Apply)', short: 'นำไปใช้' },
  deep: { name: 'เจาะลึก (Deep)', short: 'เจาะลึก' },
};

export interface LayerGroup { layer: Layer; sections: SectionKey[]; minutes: number }
export interface OpenState { layers: Record<Layer, boolean>; sections: Partial<Record<SectionKey, boolean>> }

export function isSectionKey(value: string): value is SectionKey {
  return (SECTION_KEYS as readonly string[]).includes(value);
}

/** A section's effective placement; unset means Reference. */
export function placementOf(section: ChapterContentSection): ContentPlacement {
  return section.placement ?? 'reference';
}

export function getReferenceSections(chapter: Chapter): ChapterContentSection[] {
  return (chapter.contentSections ?? []).filter(section => placementOf(section) === 'reference');
}

export type InlineContentSection = Extract<ChapterContentSection, { placement: 'inline' }>;

export function getInlineSections(chapter: Chapter): InlineContentSection[] {
  return (chapter.contentSections ?? []).filter(
    (section): section is InlineContentSection => section.placement === 'inline',
  );
}

/**
 * Inline sections anchored after `key`. With `conceptIndex` omitted, returns those that
 * follow the whole section body; with a number, those that follow that core concept.
 */
export function getInlineSectionsAt(chapter: Chapter, key: SectionKey, conceptIndex?: number): InlineContentSection[] {
  return getInlineSections(chapter).filter(s => s.after === key && s.conceptIndex === conceptIndex);
}

/**
 * Whether the Diagram section has anything to show: a widget, the glossary map,
 * or content placed in it. Chapters whose hero replaced all of these
 * (s1 after Q4, s14 after Q6) drop the section.
 */
export function hasDiagramContent(chapter: Chapter): boolean {
  return (
    DIAGRAM_WIDGET_CHAPTERS.has(chapter.id) ||
    chapter.id === GLOSSARY_MAP_CHAPTER ||
    (chapter.contentSections ?? []).some(section => placementOf(section) === 'diagram')
  );
}

/** Mirrors the pre-refactor render guards in GuideTab exactly (spec §1.3). */
export function isSectionPresent(chapter: Chapter, key: SectionKey): boolean {
  switch (key) {
    case 'mindset': case 'friction': return true;
    case 'otherSide': return !!chapter.perspectives;
    case 'diagram': return hasDiagramContent(chapter);
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
  if (key === 'diagram') return hasDiagramContent(chapter);
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
    return { layer, sections, minutes: sections.reduce((sum, k) => sum + sectionMinutes(level, k), 0) };
  });
}

const allLayers = (value: boolean): Record<Layer, boolean> => ({ core: value, apply: value, deep: value });
const sectionsWhere = (layout: LayerGroup[], pick: (g: LayerGroup) => boolean) => {
  const sections: Partial<Record<SectionKey, boolean>> = {};
  for (const g of layout) for (const k of g.sections) sections[k] = pick(g);
  return sections;
};

/** Core sections that start closed for a chapter (visual-first pilot). Layer stays expanded. */
export const CHAPTER_CORE_COLLAPSED: Readonly<Record<string, readonly SectionKey[]>> = { s3: ['jargon'] };

export function deriveOpenState(layout: LayerGroup[], chapterId?: string): OpenState {
  const sections = sectionsWhere(layout, g => g.layer === 'core');
  for (const k of (chapterId && CHAPTER_CORE_COLLAPSED[chapterId]) || []) {
    if (sections[k]) sections[k] = false;
  }
  return { layers: { core: true, apply: false, deep: false }, sections };
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
