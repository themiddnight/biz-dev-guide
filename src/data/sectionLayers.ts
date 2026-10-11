import type { Chapter, ChapterContentSection, ContentPlacement, ExperienceLevel } from '../types';
import { DIAGRAM_WIDGET_CHAPTERS, GLOSSARY_MAP_CHAPTER } from './diagramWidgets.js';

export type Layer = 'core' | 'apply' | 'deep';
export const LAYERS: readonly Layer[] = ['core', 'apply', 'deep'];

export type SectionKey =
  | 'otherSide' | 'friction' | 'jargon' | 'diagram' | 'faq'
  | 'examples' | 'coreConcepts' | 'reference' | 'glossary' | 'practice' | 'pitfalls';

export const SECTION_KEYS: readonly SectionKey[] = [
  'otherSide', 'friction', 'jargon', 'diagram', 'faq',
  'examples', 'coreConcepts', 'reference', 'glossary', 'practice', 'pitfalls',
];

export const LAYER_CONFIG: Record<ExperienceLevel, Record<Layer, readonly SectionKey[]>> = {
  beginner: {
    core: ['jargon', 'otherSide', 'coreConcepts', 'diagram'],
    apply: ['examples', 'practice', 'pitfalls', 'faq', 'friction'],
    deep: ['reference', 'glossary'],
  },
  experienced: {
    core: ['otherSide', 'coreConcepts', 'pitfalls', 'diagram'],
    apply: ['friction', 'examples', 'practice', 'faq'],
    deep: ['jargon', 'reference', 'glossary'],
  },
};

/** Chapter-signature sections promoted to Core for BOTH levels (owner decision, spec §10 D10). */
const CHAPTER_CORE_OVERRIDES: Readonly<Record<string, readonly SectionKey[]>> = {
  s11: ['faq'],
  s15: ['glossary'],
};

/** Short section name: the control-row link and the default section heading. */
export const SECTION_LABEL: Record<SectionKey, string> = {
  jargon: 'ศัพท์จำเป็น',
  diagram: 'แผนภาพ',
  examples: 'ตัวอย่างจริง',
  practice: 'ลงมือทำ',
  faq: 'คำถามที่เจอบ่อย',
  friction: 'รับมือ Friction',
  coreConcepts: 'แนวคิดหลัก',
  pitfalls: 'กับดัก',
  reference: 'อ้างอิง',
  glossary: 'รวมคำศัพท์',
  otherSide: 'อีกฝั่งมองยังไง',
};

export const LAYER_LABEL: Record<Layer, string> = {
  core: 'ต้องรู้',
  apply: 'นำไปใช้',
  deep: 'เจาะลึก',
};

export interface LayerGroup { layer: Layer; sections: SectionKey[] }
/** Which sections are open. Core sections are always open; the others fold. */
export interface OpenState { sections: Partial<Record<SectionKey, boolean>> }

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
function hasDiagramContent(chapter: Chapter): boolean {
  return (
    DIAGRAM_WIDGET_CHAPTERS.has(chapter.id) ||
    chapter.id === GLOSSARY_MAP_CHAPTER ||
    (chapter.contentSections ?? []).some(section => placementOf(section) === 'diagram')
  );
}

/** A section renders iff this returns true. */
export function isSectionPresent(chapter: Chapter, key: SectionKey): boolean {
  switch (key) {
    case 'friction': return !!chapter.frictionPlaybook;
    case 'otherSide': return !!chapter.perspectives;
    case 'diagram': return hasDiagramContent(chapter);
    case 'jargon': return (chapter.jargonList?.length ?? 0) > 0;
    case 'faq': return chapter.id === 's11';
    case 'examples': return (chapter.realWorldExamples?.length ?? 0) > 0 || !!chapter.dialogueExample;
    case 'coreConcepts': return (chapter.coreConcepts?.length ?? 0) > 0;
    case 'reference': return getReferenceSections(chapter).length > 0;
    case 'glossary': return chapter.id === 's15';
    case 'practice': return (chapter.realWorldWorkflow?.length ?? 0) > 0 || (chapter.checklist?.length ?? 0) > 0;
    case 'pitfalls': return (chapter.commonPitfalls?.length ?? 0) > 0;
  }
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
  return LAYERS.map(layer => ({
    layer,
    sections: layerKeys(level, layer, chapter.id).filter(k => isSectionPresent(chapter, k)),
  }));
}

const sectionsWhere = (layout: LayerGroup[], pick: (g: LayerGroup) => boolean) => {
  const sections: Partial<Record<SectionKey, boolean>> = {};
  for (const g of layout) for (const k of g.sections) sections[k] = pick(g);
  return sections;
};

/** A chapter's starting state: Core open, everything else folded. */
export function deriveOpenState(layout: LayerGroup[]): OpenState {
  return { sections: sectionsWhere(layout, g => g.layer === 'core') };
}

export function expandAll(layout: LayerGroup[]): OpenState {
  return { sections: sectionsWhere(layout, () => true) };
}

/** Core has no fold control, so folding everything is the starting state. */
export function collapseAll(layout: LayerGroup[]): OpenState {
  return deriveOpenState(layout);
}

export function openSection(state: OpenState, layout: LayerGroup[], key: SectionKey): OpenState {
  if (!layout.some(g => g.sections.includes(key))) return state;
  return { sections: { ...state.sections, [key]: true } };
}

export function toggleSection(state: OpenState, key: SectionKey): OpenState {
  return { sections: { ...state.sections, [key]: !state.sections[key] } };
}
