import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../data/chaptersData';
import { GLOSSARY } from '../../data/glossary';
import { GlossaryPanel } from './GlossaryPanel';
import { GlossaryCategoryMap } from './GlossaryCategoryMap';

const noop = () => {};

describe('Glossary hierarchy (spec §10.1, §10.2)', () => {
  it('filter chips are soft toggles with one pressed per row', () => {
    const html = renderToStaticMarkup(<GlossaryPanel terms={GLOSSARY} chapters={CHAPTERS} onNavigateChapter={noop} />);
    expect(html).not.toMatch(/(?<![\w:/-])bg-primary(?![\w/-])/);
    expect(html).toContain('border-base-border-strong bg-base-300 text-base-content font-bold');
  });

  it('an empty search offers a soft clear-filters button, not a primary', () => {
    const html = renderToStaticMarkup(<GlossaryPanel terms={GLOSSARY} chapters={CHAPTERS} onNavigateChapter={noop} query="zzzz-no-match" onQueryChange={noop} />);
    expect(html).toContain('ล้างตัวกรอง');
    expect(html).not.toContain('bg-primary text-primary-content');
  });

  it('category cards are soft toggles', () => {
    const html = renderToStaticMarkup(<GlossaryCategoryMap terms={GLOSSARY} activeCategory="all" onSelectCategory={noop} />);
    expect(html).toContain('aria-pressed');
    expect(html).not.toMatch(/(?<![\w:/-])bg-primary(?![\w/-])/);
  });

  it('no longer reads the old tokens module', () => {
    const src = readFileSync(join(process.cwd(), 'src/components/glossary/GlossaryPanel.tsx'), 'utf8');
    expect(src).not.toContain('styles/tokens');
  });
});
