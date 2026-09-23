/**
 * Chapters whose `ChapterDiagram` branch renders a widget. diagramWidgets.test.tsx
 * renders every chapter and fails if this list and the component disagree.
 */
export const DIAGRAM_WIDGET_CHAPTERS: ReadonlySet<string> = new Set([
  's2', 's3', 's4', 's5', 's6', 's7', 's8', 's9', 's10', 's11', 's12', 's13',
]);

/** s15's Diagram section is the glossary category map rather than a widget. */
export const GLOSSARY_MAP_CHAPTER = 's15';
