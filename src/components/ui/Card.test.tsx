import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card, cardClass } from './Card';

describe('Card', () => {
  it('defaults to a bordered base-100 div with box padding and box radius', () => {
    expect(renderToStaticMarkup(<Card>x</Card>)).toBe('<div class="rounded-box bg-base-100 border border-base-border p-box">x</div>');
  });

  it('renders the requested element and passes attributes through', () => {
    const html = renderToStaticMarkup(<Card as="details" padding="none" open data-card="1"><summary>s</summary></Card>);
    expect(html).toMatch(/^<details class="rounded-box bg-base-100 border border-base-border" open="" data-card="1">/);
  });

  it('maps variants and padding to tokens', () => {
    expect(cardClass({ variant: 'elevated' })).toContain('border-base-border-strong shadow-xs');
    expect(cardClass({ variant: 'subtle' })).toContain('bg-base-300 border border-base-border');
    expect(cardClass({ variant: 'interactive' })).toContain('hover:border-base-border-strong transition-colors');
    expect(cardClass({ padding: 'dense' })).toContain('p-box-dense');
    expect(cardClass({ padding: 'spacious' })).toContain('p-box-spacious');
  });
});
