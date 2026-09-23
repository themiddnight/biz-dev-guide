import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge, badgeClass } from './Badge';
import { IconBadge, iconBadgeClass } from './IconBadge';

describe('Badge', () => {
  it('defaults to a neutral soft sm badge', () => {
    expect(renderToStaticMarkup(<Badge>new</Badge>)).toBe(
      '<span class="inline-flex items-center gap-1 rounded-selector border font-semibold whitespace-nowrap bg-base-300 text-base-content border-base-border px-2 py-0.5 text-[11px]">new</span>',
    );
  });

  it('tints chromatic colours and fills solids with their content colour', () => {
    expect(badgeClass({ color: 'business' })).toContain('bg-business/10 text-business border-business/25');
    expect(badgeClass({ color: 'engineer', variant: 'outline' })).toContain('bg-transparent border-engineer/40 text-engineer');
    expect(badgeClass({ color: 'success', variant: 'solid' })).toContain('bg-success text-success-content');
    expect(badgeClass({ variant: 'outline' })).toContain('text-base-content-secondary border-base-border-strong');
  });

  it('appends className (e.g. font-bold for the XP badge)', () => {
    expect(renderToStaticMarkup(<Badge color="warning" className="font-bold">+10 XP</Badge>)).toContain('text-[11px] font-bold"');
  });
});

describe('IconBadge', () => {
  it('is a soft square, hidden from screen readers by default', () => {
    const html = renderToStaticMarkup(<IconBadge>🗺️</IconBadge>);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('bg-base-300 text-base-content border-base-border w-7 h-7');
    expect(html).not.toContain('bg-primary');
  });

  it('is announced when labelled', () => {
    const html = renderToStaticMarkup(<IconBadge label="Level 3">3</IconBadge>);
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Level 3"');
    expect(html).not.toContain('aria-hidden');
  });

  it('sizes sm/md/lg, none leaves the size to the caller, outline uses the strong border', () => {
    expect(iconBadgeClass({ size: 'sm' })).toContain('w-6 h-6');
    expect(iconBadgeClass({ size: 'lg' })).toContain('w-14 h-14 sm:w-16 sm:h-16');
    expect(iconBadgeClass({ size: 'none' })).not.toMatch(/\bw-\d/);
    expect(iconBadgeClass({ variant: 'outline' })).toContain('bg-transparent text-base-content border-base-border-strong');
    expect(iconBadgeClass({ color: 'success' })).toContain('bg-success/10 text-success border-success/25');
  });
});
