import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import type { Chapter } from '../../../types';
import { ctxFor } from './testCtx';
import { ExamplesSection } from './ExamplesSection';

const ctx = ctxFor();
const s1 = CHAPTERS.find(c => c.id === 's1')!;
const render = (chapter: Chapter, isOpen = true) =>
  renderToStaticMarkup(<ExamplesSection chapter={chapter} isOpen={isOpen} onToggle={() => {}} ctx={ctx} />);

describe('ExamplesSection (spec A3)', () => {
  it('header: merged title and the case count; closed shows no body', () => {
    const html = render(s1, false);
    expect(html).toContain('ตัวอย่างจริง: บทสนทนาและเคสจากบริษัท');
    expect(html).toContain('พูดแบบไหนพัง แบบไหนได้ผล และบทเรียนจากบริษัทจริง (2 เคส)');
    expect(html).not.toContain('data-examples-dialogue');
  });

  it('open: the dialogue comes before the first case', () => {
    const html = render(s1);
    const dialogue = html.indexOf('data-examples-dialogue');
    const cases = html.indexOf('data-examples-cases');
    expect(dialogue).toBeGreaterThan(0);
    expect(cases).toBeGreaterThan(dialogue);
    expect(html.indexOf('บทสนทนาในที่ทำงาน</h4>')).toBeLessThan(html.indexOf('เคสจริงจากบริษัท</h4>'));
    expect(html.indexOf('สถานการณ์: ')).toBeLessThan(cases);
  });

  it('a dialogue without cases: dialogue only, no count', () => {
    const html = render({ ...s1, realWorldExamples: [] });
    expect(html).toContain('data-examples-dialogue');
    expect(html).not.toContain('data-examples-cases');
    expect(html).toContain('พูดแบบไหนพัง แบบไหนได้ผล และบทเรียนจากบริษัทจริง</p>');
  });

  it('cases without a dialogue: cases only', () => {
    const html = render({ ...s1, dialogueExample: undefined });
    expect(html).not.toContain('data-examples-dialogue');
    expect(html).toContain('data-examples-cases');
  });

  it('renders nothing when both are absent', () => {
    expect(render({ ...s1, realWorldExamples: [], dialogueExample: undefined })).toBe('');
  });
});
