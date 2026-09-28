import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ScrollFade } from './ScrollFade';

describe('ScrollFade wrapperClassName (F-06, B3)', () => {
  it('wrapperClassName lands on the outer wrapper, not the inner scroller', () => {
    const html = renderToStaticMarkup(
      <ScrollFade wrapperClassName="max-sm:-mb-2.5" className="overflow-x-auto">
        <span>a</span>
      </ScrollFade>
    );
    expect(html).toMatch(/^<div data-scroll-fade="true" class="relative max-sm:-mb-2\.5">/);
    expect(html).toMatch(/<div class="overflow-x-auto">/);
  });

  it('without wrapperClassName the wrapper stays plain', () => {
    const html = renderToStaticMarkup(
      <ScrollFade className="overflow-x-auto">
        <span>a</span>
      </ScrollFade>
    );
    expect(html).toMatch(/^<div data-scroll-fade="true" class="relative">/);
  });
});
