import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import type { Chapter } from '../../../types';
import { PitfallsSection } from './PitfallsSection';
import { CORE, foldable, ctxFor } from './testCtx';

const noop = () => {};
const s1 = CHAPTERS.find(c => c.id === 's1')!;
const first = s1.commonPitfalls![0];
const second = s1.commonPitfalls![1];
const render = (chapter: Chapter, isOpen = true) =>
  renderToStaticMarkup(<PitfallsSection chapter={chapter} fold={isOpen ? CORE : foldable(false)} ctx={ctxFor()} />);

describe('PitfallsSection warning sign (spec A1)', () => {
  it('shows pitfall, then the labelled warning sign, then the solution', () => {
    const html = render(s1);
    const pitfall = html.indexOf(first.pitfall);
    const label = html.indexOf('อาการเตือน:');
    const symptom = html.indexOf(first.symptom!, label);
    const solution = html.indexOf(first.solution);
    expect(pitfall).toBeGreaterThan(0);
    expect(label).toBeGreaterThan(pitfall);
    expect(symptom).toBeGreaterThan(label);
    expect(solution).toBeGreaterThan(symptom);
  });

  it('renders one warning sign per pitfall that has a symptom', () => {
    const withSymptoms = s1.commonPitfalls!.filter(p => p.symptom).length;
    expect(render(s1).match(/อาการเตือน:/g)).toHaveLength(withSymptoms);
  });

  it('omits the label and the line when a pitfall has no symptom', () => {
    const noSymptom = { ...s1, commonPitfalls: [{ pitfall: first.pitfall, solution: first.solution }] };
    const html = render(noSymptom);
    expect(html).toContain(first.pitfall);
    expect(html).toContain(first.solution);
    expect(html).not.toContain('อาการเตือน');
  });

  it('only the pitfall without a symptom loses its line', () => {
    const mixed = {
      ...s1,
      commonPitfalls: [first, { pitfall: second.pitfall, solution: second.solution }],
    };
    const html = render(mixed);
    expect(html.match(/อาการเตือน:/g)).toHaveLength(1);
    expect(html).toContain(first.symptom!);
  });

  it('closed shows no cards', () => {
    expect(render(s1, false)).not.toContain('อาการเตือน');
  });
});
