import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { Alert } from './Alert';

describe('Input and Textarea', () => {
  it('render token surfaces with a subtle placeholder and a focus ring', () => {
    const html = renderToStaticMarkup(<Input placeholder="ค้นหา" />);
    expect(html).toContain('bg-base-100 border text-base-content placeholder-base-content-subtle');
    expect(html).toContain('focus-visible:ring-primary');
    expect(html).toContain('border-base-border focus:border-base-border-strong');
    expect(html).toContain('px-4 py-2.5 text-xs sm:text-sm');
    expect(html).not.toContain('aria-invalid');
  });

  it('size sm is compact; invalid sets aria-invalid and the error border', () => {
    expect(renderToStaticMarkup(<Input size="sm" />)).toContain('px-3 py-2 text-xs');
    const bad = renderToStaticMarkup(<Input invalid />);
    expect(bad).toContain('aria-invalid="true"');
    expect(bad).toContain('border-error');
    expect(bad).not.toContain('border-base-border');
    expect(renderToStaticMarkup(<Textarea invalid rows={3} />)).toMatch(/<textarea aria-invalid="true"[^>]*border-error[^>]*rows="3"/);
  });

  it('passes native props through', () => {
    const html = renderToStaticMarkup(<Input type="search" value="x" onChange={() => {}} disabled aria-label="q" />);
    expect(html).toContain('type="search"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('aria-label="q"');
  });
});

describe('Alert', () => {
  it('is a soft tinted box, silent unless live', () => {
    const html = renderToStaticMarkup(<Alert color="warning" title="หมายเหตุ">ใช้คำตอบสำรอง</Alert>);
    expect(html).not.toContain('role=');
    expect(html).toContain('bg-warning/10 border-warning/25');
    expect(html).toContain('<div class="font-bold text-warning">หมายเหตุ</div>');
  });

  it('announces when live and hides the decorative icon', () => {
    const html = renderToStaticMarkup(<Alert color="error" live icon={<svg />}>x</Alert>);
    expect(html).toMatch(/^<div role="status"/);
    expect(html).toContain('aria-hidden="true"');
  });
});
