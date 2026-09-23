import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Tabs, TABS_LAYOUT } from './Tabs';
import { ToggleChip, chipClass } from './ToggleChip';
import { TAP_GAP } from './tapTarget';
import type { Tap } from './types';

const hasRing = (cls: string) => cls.includes('max-sm:before:min-h-11') || Object.values(TAP_GAP).some(g => cls.includes(g));
const SHAPES = ['chip', 'pill', 'segment', 'tab', 'card'] as const;
const TAPS: Tap[] = ['full', 'y', 'positioned', 'gap-4', 'gap-6', 'gap-8', 'gap-16'];

describe('ToggleChip', () => {
  it('selected is soft: base-300, bold, strong border, never a primary fill', () => {
    const cls = chipClass({ selected: true });
    expect(cls).toContain('border-base-border-strong bg-base-300 text-base-content font-bold');
    expect(cls.split(' ')).not.toContain('bg-primary');
  });

  it('unselected is quiet; underline tab selected is a base-content bottom border', () => {
    expect(chipClass({ selected: false })).toContain('border-transparent text-base-content-secondary hover:bg-base-300');
    expect(chipClass({ selected: true, shape: 'tab' })).toContain('border-b-2');
    expect(chipClass({ selected: true, shape: 'tab' })).toContain('border-base-content text-base-content font-bold');
  });

  it('unselected card shape keeps a visible frame; unselected pill does not', () => {
    expect(chipClass({ selected: false, shape: 'card' })).toContain('border-base-border');
    expect(chipClass({ selected: false, shape: 'card' }).split(' ')).not.toContain('border-transparent');
    expect(chipClass({ selected: false, shape: 'pill' }).split(' ')).not.toContain('border-base-border');
    expect(chipClass({ selected: false, shape: 'pill' })).toContain('border-transparent');
  });

  it('solid selection exists only when asked for (a chosen quiz answer)', () => {
    expect(chipClass({ selected: true, selectedStyle: 'solid' })).toContain('bg-primary text-primary-content');
    expect(chipClass({ selected: false, selectedStyle: 'solid' })).not.toContain('bg-primary');
  });

  it('segments keep the 32px minimum height of the old header segments (P1.4)', () => {
    expect(chipClass({ selected: false, shape: 'segment' })).toContain('min-h-8');
  });

  it('every shape, size and tap carries a tap ring', () => {
    for (const shape of SHAPES) for (const size of ['xs', 'sm'] as const) for (const tap of TAPS)
      expect(hasRing(chipClass({ selected: false, shape, size, tap })), `${shape} ${size} ${tap}`).toBe(true);
  });

  it('sets aria-pressed, or leaves it to aria-current', () => {
    expect(renderToStaticMarkup(<ToggleChip selected>a</ToggleChip>)).toContain('aria-pressed="true"');
    expect(renderToStaticMarkup(<ToggleChip selected={false}>a</ToggleChip>)).toContain('aria-pressed="false"');
    const row = renderToStaticMarkup(<ToggleChip selected aria-current="true" data-track-item="s1">a</ToggleChip>);
    expect(row).not.toContain('aria-pressed');
    expect(row).toContain('aria-current="true"');
    expect(row).toContain('data-track-item="s1"');
  });

  it('keeps the label as direct text after aria-pressed (QuizTab/OtherSide tests match on it)', () => {
    expect(renderToStaticMarkup(<ToggleChip selected>สาย Engineering</ToggleChip>)).toMatch(/aria-pressed="true"[^>]*>สาย Engineering<\/button>/);
  });
});

describe('Tabs', () => {
  const items = [{ value: 'a', label: 'A' }, { value: 'b', label: 'B', title: 'bee' }, { value: 'c', label: 'C' }] as const;
  const render = (variant: 'segmented' | 'pills' | 'underline', scroll?: boolean) =>
    renderToStaticMarkup(<Tabs items={items} value="b" onChange={() => {}} variant={variant} aria-label="pick" scroll={scroll} />);

  it('is a labelled group with exactly one pressed item', () => {
    const html = render('pills');
    expect(html).toMatch(/^<div role="group" aria-label="pick"/);
    expect(html.match(/aria-pressed="true"/g)).toHaveLength(1);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(2);
    expect(html).toContain('data-value="b"');
    expect(html).toContain('title="bee"');
  });

  it('pairs each variant gap with the matching tap ring', () => {
    expect(TABS_LAYOUT.pills.group).toContain('gap-1.5');
    expect(TABS_LAYOUT.pills.gapPx).toBe(6);
    expect(TABS_LAYOUT.pills.tap).toBe('gap-6');
    for (const v of ['segmented', 'underline'] as const) {
      expect(TABS_LAYOUT[v].group).not.toMatch(/\bgap-/);
      expect(TABS_LAYOUT[v].tap).toBe('y');
    }
    expect(render('pills')).toContain(TAP_GAP[6]);
    expect(render('segmented')).not.toContain('calc(100%+');
  });

  it('a scrolling strip gets room for the rings and chips that do not shrink', () => {
    const html = render('pills', true);
    expect(html).toContain('overflow-x-auto');
    expect(html).toContain('max-sm:-my-2.5 max-sm:py-2.5');
    expect(html).toContain('shrink-0');
  });
});
