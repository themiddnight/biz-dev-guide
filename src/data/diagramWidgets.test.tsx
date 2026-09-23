import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChapterDiagram } from '../components/ChapterDiagram';
import { CHAPTERS } from './chaptersData';
import { DIAGRAM_WIDGET_CHAPTERS } from './diagramWidgets';

describe('DIAGRAM_WIDGET_CHAPTERS', () => {
  it.each(CHAPTERS.map((c) => c.id))('matches what ChapterDiagram renders for %s', (id) => {
    const rendersWidget = renderToStaticMarkup(<ChapterDiagram chapterId={id} />) !== '';
    expect(rendersWidget).toBe(DIAGRAM_WIDGET_CHAPTERS.has(id));
  });
});
