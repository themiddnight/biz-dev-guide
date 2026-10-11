import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import { DiagramSection } from './DiagramSection';
import { CORE, ctxFor } from './testCtx';

const ch = (id: string) => CHAPTERS.find(c => c.id === id)!;
const render = (id: string, c4Level = 1) =>
  renderToStaticMarkup(<DiagramSection chapter={ch(id)} fold={CORE} ctx={ctxFor({ c4Level })} />);

describe('DiagramSection', () => {
  it('is headed "แผนภาพ" like its control-row link, with the diagram title and description below', () => {
    const s5 = ch('s5');
    const html = render('s5').replace(/&amp;/g, '&');
    expect(/<h2>.*?<\/h2>/.exec(html)![0]).toContain('>แผนภาพ<');
    expect(html).toContain(`<h3 data-diagram-title="true" class="font-semibold text-base-content">${s5.diagramTitle}</h3>`);
    expect(html).toContain(`<p class="mt-1 text-base-content-secondary">${s5.diagramDescription}</p>`);
  });

  it('s5: the C4 explorer shows the note of the selected level only', () => {
    const noteOf = (level: number) => /data-c4-note="(\d)"><p[^>]*>([^<]+)</.exec(render('s5', level))!.slice(1);
    expect(noteOf(1)).toEqual(['1', 'Level 1 System Context']);
    expect(noteOf(3)).toEqual(['3', 'Level 3 Component Diagram']);
    expect(render('s5', 2)).not.toContain('Level 1 System Context');
  });

  it('only s5 has the C4 explorer, and s15 shows the glossary category map', () => {
    expect(render('s5')).toContain('data-c4-explorer');
    expect(render('s6')).not.toContain('data-c4-explorer');
    expect(render('s15')).toContain('กดที่หมวดเพื่อกรองคำศัพท์');
    expect(render('s6')).not.toContain('กดที่หมวดเพื่อกรองคำศัพท์');
  });
});
