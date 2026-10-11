import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement } from 'react';
import { CHAPTERS } from '../../data/chaptersData';
import { deriveOpenState, expandAll, getChapterLayout } from '../../data/sectionLayers';
import type { ExperienceLevel } from '../../types';
import { ChapterControlRow, LevelSwitch, type ChapterLevelOverride } from './ChapterControlRow';

const noop = () => {};
const ch = (id: string) => CHAPTERS.find(c => c.id === id)!;

function render(id: string, level: ExperienceLevel, over: { levelOverride?: ChapterLevelOverride; allOpen?: boolean } = {}) {
  const layout = getChapterLayout(level, ch(id));
  return renderToStaticMarkup(
    <ChapterControlRow
      chapterNum={ch(id).num}
      layout={layout}
      openState={over.allOpen ? expandAll(layout) : deriveOpenState(layout)}
      level={level}
      onLevelChange={noop}
      levelOverride={over.levelOverride ?? null}
      onSelectSection={noop}
      onSetAllOpen={noop}
    />,
  );
}

/** `layer: label > href` for every link, in document order. */
const links = (html: string) =>
  html.split('data-control-layer="').slice(1).flatMap(part => {
    const layer = part.slice(0, part.indexOf('"'));
    return [...part.matchAll(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g)].map(a => `${layer}: ${a[2]} > ${a[1]}`);
  });

describe('ChapterControlRow', () => {
  it('beginner: one link per section, grouped by layer in layout order', () => {
    expect(links(render('s16', 'beginner'))).toEqual([
      'core: ศัพท์จำเป็น > #/ch/16/jargon',
      'core: อีกฝั่งมองยังไง > #/ch/16/otherSide',
      'core: แนวคิดหลัก > #/ch/16/coreConcepts',
      'apply: ตัวอย่างจริง > #/ch/16/examples',
      'apply: ลงมือทำ > #/ch/16/practice',
      'apply: กับดัก > #/ch/16/pitfalls',
      'apply: รับมือ Friction > #/ch/16/friction',
    ]);
  });

  it('experienced: the same sections regrouped, pitfalls in Core and jargon in Deep', () => {
    expect(links(render('s16', 'experienced'))).toEqual([
      'core: อีกฝั่งมองยังไง > #/ch/16/otherSide',
      'core: แนวคิดหลัก > #/ch/16/coreConcepts',
      'core: กับดัก > #/ch/16/pitfalls',
      'apply: รับมือ Friction > #/ch/16/friction',
      'apply: ตัวอย่างจริง > #/ch/16/examples',
      'apply: ลงมือทำ > #/ch/16/practice',
      'deep: ศัพท์จำเป็น > #/ch/16/jargon',
    ]);
  });

  it('names each layer once, in order, and skips a layer with no section', () => {
    const labels = (html: string) => [...html.matchAll(/data-control-layer="\w+"[^>]*><span[^>]*>([^<]+)</g)].map(m => m[1]);
    expect(labels(render('s16', 'experienced'))).toEqual(['ต้องรู้', 'นำไปใช้', 'เจาะลึก']);
    expect(labels(render('s16', 'beginner'))).toEqual(['ต้องรู้', 'นำไปใช้']);
  });

  it('marks the current level as pressed', () => {
    const pressed = (html: string) => [...html.matchAll(/data-level="(\w+)" aria-pressed="(\w+)"/g)].map(m => `${m[1]}=${m[2]}`);
    expect(pressed(render('s1', 'beginner'))).toEqual(['beginner=true', 'experienced=false']);
    expect(pressed(render('s1', 'experienced'))).toEqual(['beginner=false', 'experienced=true']);
  });

  it('the level switch calls back with the level pressed', () => {
    const picked: ExperienceLevel[] = [];
    const tree = LevelSwitch({ level: 'beginner', onChange: lvl => { picked.push(lvl); } }) as ReactElement<{
      children: [unknown, ReactElement<{ onClick: () => void }>[]];
    }>;
    const buttons = tree.props.children[1];
    buttons[1].props.onClick();
    buttons[0].props.onClick();
    expect(picked).toEqual(['experienced', 'beginner']);
  });

  it('shows the reset control only while the chapter carries its own level', () => {
    const plain = render('s1', 'beginner');
    expect(plain).not.toContain('data-chapter-level-reset');
    expect(plain).not.toContain('เฉพาะบทนี้');
    const auto = render('s1', 'beginner', { levelOverride: { role: 'eng', levelMode: 'auto', onReset: noop } });
    expect(auto).toContain('data-chapter-level-reset');
    expect(auto).toContain('เฉพาะบทนี้ ของสาย Engineering');
    expect(auto).toContain('กลับไปใช้ค่าตามสายงาน');
    const fixed = render('s1', 'beginner', { levelOverride: { role: 'biz', levelMode: 'experienced', onReset: noop } });
    expect(fixed).toContain('เฉพาะบทนี้ ของสาย Business');
    expect(fixed).toContain('กลับไปใช้ระดับจากแถบบน');
  });

  it('one control opens every section, and folds them once all are open', () => {
    const label = (html: string) => /data-toggle-all[^>]*>([^<]+)</.exec(html)?.[1];
    expect(label(render('s1', 'beginner'))).toBe('เปิดทั้งหมด');
    expect(label(render('s1', 'beginner', { allOpen: true }))).toBe('พับทั้งหมด');
  });

  it('sticks under the app header', () => {
    expect(render('s1', 'beginner')).toMatch(/<nav data-control-row[^>]*class="sticky [^"]*"[^>]*style="top:var\(--header-h\)"/);
  });
});
