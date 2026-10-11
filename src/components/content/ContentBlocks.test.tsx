import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ChapterContentSection } from '../../types';
import { ContentBlocks } from './ContentBlocks';

const section = (blocks: ChapterContentSection['blocks']): ChapterContentSection[] => [{ blocks }];
const render = (blocks: ChapterContentSection['blocks']) =>
  renderToStaticMarkup(<ContentBlocks sections={section(blocks)} placement="reference" />);

describe('ContentBlocks', () => {
  it('a note is a ruled paragraph whose tone colours the title word only', () => {
    const warn = render([{ id: 'n1', kind: 'note', tone: 'warn', title: 'NOTE_TITLE', body: 'NOTE_BODY' }]);
    expect(warn).toContain('<div class="font-semibold text-warning">NOTE_TITLE</div>');
    expect(warn).toContain('<div>NOTE_BODY</div>');
    expect(warn).not.toMatch(/bg-warning/);
    const ok = render([{ id: 'n2', kind: 'note', tone: 'ok', title: 'NOTE_TITLE', body: 'NOTE_BODY' }]);
    expect(ok).toContain('<div class="font-semibold text-success">NOTE_TITLE</div>');
  });

  it('cards are a definition list: one term and one definition per row', () => {
    const html = render([{ id: 'c1', kind: 'cards', cards: [{ term: 'TERM_A', def: 'DEF_A' }, { term: 'TERM_B', def: 'DEF_B' }] }]);
    expect([...html.matchAll(/<dt[^>]*>([^<]+)<\/dt><dd[^>]*>([^<]+)<\/dd>/g)].map(m => `${m[1]}=${m[2]}`)).toEqual(['TERM_A=DEF_A', 'TERM_B=DEF_B']);
  });

  it('renders only the sections of the placement asked for', () => {
    const sections: ChapterContentSection[] = [
      { blocks: [{ id: 'a', kind: 'note', tone: 'info', body: 'REFERENCE_NOTE' }] },
      { placement: 'diagram', blocks: [{ id: 'b', kind: 'note', tone: 'info', body: 'DIAGRAM_NOTE' }] },
    ];
    const html = renderToStaticMarkup(<ContentBlocks sections={sections} placement="diagram" />);
    expect(html).toContain('DIAGRAM_NOTE');
    expect(html).not.toContain('REFERENCE_NOTE');
  });
});
