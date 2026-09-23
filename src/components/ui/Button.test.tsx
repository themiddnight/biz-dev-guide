import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Button, buttonClass, type ButtonProps } from './Button';
import { TAP_GAP } from './tapTarget';
import type { Color, Tap } from './types';

const COLORS: Color[] = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error', 'business', 'engineer'];
const VARIANTS: NonNullable<ButtonProps['variant']>[] = ['solid', 'outline', 'soft', 'ghost', 'link'];
const SIZES: NonNullable<ButtonProps['size']>[] = ['xs', 'sm', 'md', 'lg'];
const SHAPES: NonNullable<ButtonProps['shape']>[] = ['default', 'square', 'circle'];
const TAPS: Tap[] = ['full', 'y', 'positioned', 'gap-4', 'gap-6', 'gap-8', 'gap-16'];

/** A tap ring: the 44px one, or a TAP_GAP ring. */
const hasRing = (cls: string) => cls.includes('max-sm:before:min-h-11') || Object.values(TAP_GAP).some(g => cls.includes(g));

describe('Button', () => {
  it('defaults to a neutral outline md button with a full tap ring and type="button"', () => {
    const html = renderToStaticMarkup(<Button>Go</Button>);
    expect(html).toContain('type="button"');
    expect(html).toContain('border-base-border-strong text-base-content hover:bg-base-300');
    expect(html).toContain('px-4 py-2 text-xs sm:text-sm');
    expect(html).toContain('max-sm:before:min-w-11');
  });

  it('the primary solid is the only fill that uses bg-primary', () => {
    expect(buttonClass({ color: 'primary', variant: 'solid' })).toContain('bg-primary text-primary-content border-primary hover:bg-primary/90');
    for (const c of COLORS) for (const v of VARIANTS) {
      if (c === 'primary' && v === 'solid') continue;
      expect(buttonClass({ color: c, variant: v }).split(' '), `${c} ${v}`).not.toContain('bg-primary');
    }
  });

  it('maps chromatic variants to their own hue and monochrome ones to base tokens', () => {
    expect(buttonClass({ color: 'error', variant: 'soft' })).toContain('bg-error/10 text-error border-error/25 hover:bg-error/15');
    expect(buttonClass({ color: 'success', variant: 'outline' })).toContain('border-success/40 text-success hover:bg-success/10');
    expect(buttonClass({ color: 'engineer', variant: 'ghost' })).toContain('text-engineer hover:bg-engineer/10');
    expect(buttonClass({ color: 'neutral', variant: 'soft' })).toContain('bg-base-300 text-base-content border-transparent hover:bg-base-border');
    expect(buttonClass({ color: 'neutral', variant: 'ghost' })).toContain('text-base-content-secondary hover:text-base-content hover:bg-base-300');
    expect(buttonClass({ variant: 'link' })).toContain('underline underline-offset-2 decoration-base-border-strong');
  });

  it('every colour/variant writes only token colours (no palette, hex or dark:)', () => {
    for (const c of COLORS) for (const v of VARIANTS) {
      const cls = buttonClass({ color: c, variant: v });
      expect(cls, `${c} ${v}`).not.toMatch(/dark:|-\[#|-(?:neutral|slate|amber|rose|emerald|indigo|sky)-\d/);
    }
  });

  it('every size, shape and tap combination carries a tap ring', () => {
    for (const size of SIZES) for (const shape of SHAPES) for (const tap of TAPS) {
      expect(hasRing(buttonClass({ size, shape, tap })), `${size} ${shape} ${tap}`).toBe(true);
    }
  });

  it('square and circle use icon padding; circle is round; block is full width', () => {
    expect(buttonClass({ size: 'sm', shape: 'square' })).toContain('p-1.5');
    expect(buttonClass({ size: 'sm', shape: 'square' })).not.toContain('px-3');
    expect(buttonClass({ shape: 'circle' })).toContain('rounded-full');
    expect(buttonClass({ block: true }).split(' ')).toContain('w-full');
  });

  it('passes native props through (submit type, disabled, aria, data)', () => {
    const html = renderToStaticMarkup(<Button type="submit" disabled aria-label="send" data-x="1" className="absolute">x</Button>);
    expect(html).toMatch(/^<button type="submit"[^>]* disabled=""/);
    expect(html).toContain('aria-label="send"');
    expect(html).toContain('data-x="1"');
    expect(html).toContain(' absolute"');
  });
});
