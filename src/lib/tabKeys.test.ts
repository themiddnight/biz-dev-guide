import { describe, it, expect } from 'vitest';
import { nextTabIndex } from './tabKeys';

describe('nextTabIndex', () => {
  it('ArrowRight wraps from the last tab to the first', () => {
    expect(nextTabIndex(3, 'ArrowRight', 4)).toBe(0);
  });

  it('ArrowLeft wraps from the first tab to the last', () => {
    expect(nextTabIndex(0, 'ArrowLeft', 4)).toBe(3);
  });

  it('Home jumps to the first tab', () => {
    expect(nextTabIndex(2, 'Home', 4)).toBe(0);
  });

  it('End jumps to the last tab', () => {
    expect(nextTabIndex(1, 'End', 4)).toBe(3);
  });

  it('returns null for any other key', () => {
    expect(nextTabIndex(1, 'a', 4)).toBeNull();
  });
});
