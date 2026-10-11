import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import { CHAPTERS } from '../../../data/chaptersData';
import { SectionShell } from './SectionShell';
import type { SectionFold } from './registry';
import { CORE, ctxFor, foldable } from './testCtx';

const s1 = CHAPTERS.find(c => c.id === 's1')!;
const s16 = CHAPTERS.find(c => c.id === 's16')!;
const render = (fold: SectionFold, chapter = s1) =>
  renderToStaticMarkup(
    <SectionShell chapter={chapter} fold={fold} ctx={ctxFor()} sectionKey="pitfalls" note="3 ข้อ">
      <p>BODY_TEXT</p>
    </SectionShell>,
  );

describe('SectionShell', () => {
  it('carries the anchor that routes and control-row links scroll to', () => {
    expect(render(CORE)).toMatch(/^<section id="sec-pitfalls"[^>]*class="[^"]*anchor-target/);
  });

  it('a Core section is open and has no control', () => {
    const html = render(CORE);
    expect(html).toContain('BODY_TEXT');
    expect(html).not.toContain('<button');
    expect(html).not.toContain('aria-expanded');
  });

  it('a folded section shows its heading as a button and hides its body', () => {
    const html = render(foldable(false));
    expect(html).toMatch(/<h2><button type="button" aria-expanded="false"/);
    expect(html).toContain('เปิดอ่าน');
    expect(html).not.toContain('BODY_TEXT');
  });

  it('an unfolded section shows its body and points the button at it', () => {
    const html = render(foldable(true));
    expect(html).toContain('aria-expanded="true" aria-controls="sec-pitfalls-body"');
    expect(html).toContain('<div id="sec-pitfalls-body"');
    expect(html).toContain('BODY_TEXT');
    expect(html).toContain('พับเก็บ');
  });

  it('the heading button calls the toggle it was given', () => {
    let toggles = 0;
    const tree = SectionShell({
      chapter: s1, fold: foldable(false, () => { toggles++; }), ctx: ctxFor(), sectionKey: 'pitfalls', children: null,
    }) as ReactElement<{ children: ReactElement<{ children: ReactElement<{ onClick: () => void }> }>[] }>;
    tree.props.children[0].props.children.props.onClick();
    expect(toggles).toBe(1);
  });

  it('the heading is the section label unless a title is given, with the note beside it', () => {
    expect(render(CORE)).toContain('<span class="text-xl font-bold leading-7 text-base-content">กับดัก</span>');
    expect(render(CORE)).toContain('>3 ข้อ</span>');
    const titled = renderToStaticMarkup(
      <SectionShell chapter={s1} fold={CORE} ctx={ctxFor()} sectionKey="pitfalls" title="กับดักที่เจอบ่อย">x</SectionShell>,
    );
    expect(titled).toContain('>กับดักที่เจอบ่อย</span>');
    expect(titled).not.toContain('>กับดัก</span>');
  });

  it('renders the inline content placed after its section, only while open', () => {
    const shell = (fold: SectionFold) => renderToStaticMarkup(
      <SectionShell chapter={s16} fold={fold} ctx={ctxFor()} sectionKey="coreConcepts">x</SectionShell>,
    );
    expect(shell(CORE)).toContain('data-inline-figure');
    expect(shell(foldable(false))).not.toContain('data-inline-figure');
    expect(render(CORE)).not.toContain('data-inline-figure');
  });
});
