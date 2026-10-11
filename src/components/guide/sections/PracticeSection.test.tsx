import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import type { Chapter } from '../../../types';
import type { GuideSectionContext } from './registry';
import { PracticeSection } from './PracticeSection';
import { ChecklistItems } from './ChecklistItems';
import { CORE, foldable, ctxFor } from './testCtx';

const noop = () => {};
const s1 = CHAPTERS.find(c => c.id === 's1')!;
const render = (chapter: Chapter, over: Partial<GuideSectionContext> = {}, isOpen = true) =>
  renderToStaticMarkup(<PracticeSection chapter={chapter} fold={isOpen ? CORE : foldable(false)} ctx={ctxFor(over)} />);

describe('PracticeSection (spec A2)', () => {
  it('heading: the section name and both counts; folded shows no body', () => {
    const html = render(s1, {}, false);
    expect(html).toContain('>ลงมือทำ</span>');
    expect(html).toContain('>4 ขั้นตอน และเช็กลิสต์ 5 ข้อ</span>');
    expect(html).not.toContain('data-practice-steps');
  });

  it('open: workflow steps first, then the checklist', () => {
    const html = render(s1);
    const steps = html.indexOf('data-practice-steps');
    const list = html.indexOf('data-practice-checklist');
    expect(steps).toBeGreaterThan(0);
    expect(list).toBeGreaterThan(steps);
    expect(html.indexOf(s1.realWorldWorkflow![0].step)).toBeLessThan(html.indexOf('เช็กลิสต์ก่อนส่งต่องาน</h3>'));
  });

  it('a tick made before the change still shows: key s1_cl_0 is unchanged', () => {
    expect(render(s1, { checkedChecklist: { s1_cl_0: true } }).match(/<input type="checkbox"[^>]* checked=""/g)).toHaveLength(1);
  });

  it('ticking the first item reports key s1_cl_0', () => {
    const toggled: string[] = [];
    const tree = ChecklistItems({
      chapter: s1,
      items: s1.checklist!,
      ctx: ctxFor({ onToggleChecklistItem: key => { toggled.push(key); } }),
    }) as ReactElement<{ children: ReactElement<{ children: ReactElement<{ children: ReactElement<{ onChange: () => void }>[] }> }>[] }>;
    tree.props.children[0].props.children.props.children[0].props.onChange();
    expect(toggled).toEqual(['s1_cl_0']);
  });

  it('drops an empty half and its count', () => {
    const noList = render({ ...s1, checklist: [] });
    expect(noList).toContain('>4 ขั้นตอน</span>');
    expect(noList).not.toContain('data-practice-checklist');
    const noSteps = render({ ...s1, realWorldWorkflow: [] });
    expect(noSteps).toContain('>เช็กลิสต์ 5 ข้อ</span>');
    expect(noSteps).not.toContain('data-practice-steps');
  });

  it('renders nothing when both halves are empty', () => {
    expect(render({ ...s1, realWorldWorkflow: [], checklist: [] })).toBe('');
  });
});
