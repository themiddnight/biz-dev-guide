import { describe, it, expect } from 'vitest';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../../data/chaptersData';
import type { Chapter } from '../../../types';
import type { GuideSectionContext } from './registry';
import { PracticeSection } from './PracticeSection';
import { ChecklistItems } from './ChecklistItems';
import { ctxFor } from './testCtx';

const noop = () => {};
const s1 = CHAPTERS.find(c => c.id === 's1')!;
const render = (chapter: Chapter, over: Partial<GuideSectionContext> = {}, isOpen = true) =>
  renderToStaticMarkup(<PracticeSection chapter={chapter} isOpen={isOpen} onToggle={noop} ctx={ctxFor(over)} />);

describe('PracticeSection (spec A2)', () => {
  it('header: title and both counts; closed shows no body', () => {
    const html = render(s1, {}, false);
    expect(html).toContain('🛠️');
    expect(html).toContain('ลงมือทำ: ขั้นตอนงานและเช็กลิสต์');
    expect(html).toContain('ส่งต่องานทีละขั้น แล้วเช็กให้ครบก่อนส่ง (4 ขั้น · 5 ข้อ)');
    expect(html).not.toContain('data-practice-steps');
  });

  it('open: workflow steps first, then the checklist', () => {
    const html = render(s1);
    const steps = html.indexOf('data-practice-steps');
    const list = html.indexOf('data-practice-checklist');
    expect(steps).toBeGreaterThan(0);
    expect(list).toBeGreaterThan(steps);
    expect(html.indexOf('ขั้นตอนงาน</h4>')).toBeLessThan(html.indexOf('เช็กลิสต์ก่อนส่งต่องาน</h4>'));
  });

  it('a tick made before the change still shows: key s1_cl_0 is unchanged', () => {
    expect(render(s1, { checkedChecklist: { s1_cl_0: true } }).match(/line-through/g)).toHaveLength(1);
  });

  it('ticking the first item reports key s1_cl_0', () => {
    const toggled: string[] = [];
    const tree = ChecklistItems({
      chapter: s1,
      ctx: { checkedChecklist: {}, onToggleChecklistItem: key => { toggled.push(key); } },
    }) as ReactElement<{ children: ReactElement<{ onClick: () => void }>[] }>;
    tree.props.children[0].props.onClick();
    expect(toggled).toEqual(['s1_cl_0']);
  });

  it('drops an empty half and its count', () => {
    const noList = render({ ...s1, checklist: [] });
    expect(noList).toContain('ส่งต่องานทีละขั้น แล้วเช็กให้ครบก่อนส่ง (4 ขั้น)');
    expect(noList).not.toContain('data-practice-checklist');
    const noSteps = render({ ...s1, realWorldWorkflow: [] });
    expect(noSteps).toContain('ส่งต่องานทีละขั้น แล้วเช็กให้ครบก่อนส่ง (5 ข้อ)');
    expect(noSteps).not.toContain('data-practice-steps');
  });

  it('renders nothing when both halves are empty', () => {
    expect(render({ ...s1, realWorldWorkflow: [], checklist: [] })).toBe('');
  });
});
