import { describe, it, expect } from 'vitest';
import { scrollEdges } from './scrollEdges';

describe('scrollEdges (F-06)', () => {
  it('a row that fits hides nothing', () => {
    expect(scrollEdges(0, 300, 300)).toEqual({ start: false, end: false });
  });
  it('at the start only the end hides content', () => {
    expect(scrollEdges(0, 300, 600)).toEqual({ start: false, end: true });
  });
  it('in the middle both edges hide content', () => {
    expect(scrollEdges(150, 300, 600)).toEqual({ start: true, end: true });
  });
  it('at the end only the start hides content', () => {
    expect(scrollEdges(300, 300, 600)).toEqual({ start: true, end: false });
  });
  it('ignores sub-pixel overflow within the tolerance', () => {
    expect(scrollEdges(0.5, 300, 300.8)).toEqual({ start: false, end: false });
    expect(scrollEdges(299.5, 300, 600)).toEqual({ start: true, end: false });
  });
});
