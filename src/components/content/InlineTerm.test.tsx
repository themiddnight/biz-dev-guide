import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GLOSSARY_BY_ID } from '../../data/glossary';
import { plainSearchText } from '../../lib/glossarySearch';
import { InlineTermPanel, InlineTermTrigger } from './InlineTerm';

const noop = () => {};
const sprint = GLOSSARY_BY_ID.get('sprint')!;
const trigger = (open: boolean) =>
  renderToStaticMarkup(<InlineTermTrigger termId="sprint" label="Sprint" open={open} panelId="p-1" onToggle={noop} />);
const textOf = (html: string) =>
  html.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');

describe('InlineTerm (term-definitions spec P3.3)', () => {
  it('closed: a real button, aria-expanded false, and no panel id in the markup', () => {
    const html = trigger(false);
    expect(html).toMatch(/^<button type="button"/);
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('p-1');
  });

  it('the trigger keeps the 44px mobile tap-target pattern (CoreConceptsSection.tsx)', () => {
    const cls = /class="([^"]+)"/.exec(trigger(false))![1].split(' ');
    for (const c of ['-my-3.5', 'py-3.5', 'sm:my-0', 'sm:py-0']) expect(cls).toContain(c);
  });

  it('open: aria-expanded true and aria-controls points at the panel', () => {
    const html = trigger(true);
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls="p-1"');
  });

  it('the panel is a labelled region with the glossary definition, read from the glossary', () => {
    const html = renderToStaticMarkup(<InlineTermPanel term={sprint} panelId="p-1" onSearchGlossary={noop} />);
    expect(html).toContain('id="p-1"');
    expect(html).toContain('role="region"');
    expect(html).toContain(`aria-label="${sprint.term}"`);
    expect(textOf(html)).toContain(plainSearchText(sprint.definition));
    if (sprint.plain) expect(textOf(html)).toContain(plainSearchText(sprint.plain));
    expect(html).toContain('ดูในหน้ารวมคำศัพท์');
    expect(html).not.toMatch(/<(div|p)\b/); // phrasing content only: valid inside the <p> that holds the term
  });

  it('the glossary link is optional; the definition never requires it', () => {
    const html = renderToStaticMarkup(<InlineTermPanel term={sprint} panelId="p-1" />);
    expect(html).not.toContain('ดูในหน้ารวมคำศัพท์');
    expect(textOf(html)).toContain(plainSearchText(sprint.definition));
  });
});
