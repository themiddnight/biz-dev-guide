import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChapterDiagram } from './ChapterDiagram';

describe('ChapterDiagram iron triangle (s11)', () => {
  const html = renderToStaticMarkup(<ChapterDiagram chapterId="s11" />);
  const svg = html.slice(html.indexOf('<svg viewBox="0 0 100 90"'), html.indexOf('</svg>', html.indexOf('<svg viewBox="0 0 100 90"')));

  it('tints the triangle with a colour-mix of the token, not hex + alpha', () => {
    expect(svg).toMatch(/<polygon[^>]*fill="color-mix\(in oklab, var\(--color-(success|engineer|warning|error)\) 15%, transparent\)"/);
    expect(svg).toMatch(/<polygon[^>]*stroke="var\(--color-(success|engineer|warning|error)\)"/);
  });

  it('labels use token fill classes and no hex remains in the figure', () => {
    for (const cls of ['fill-primary-content', 'fill-warning', 'fill-data-1', 'fill-data-2']) expect(svg).toContain(`class="${cls}"`);
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}/);
  });
});
