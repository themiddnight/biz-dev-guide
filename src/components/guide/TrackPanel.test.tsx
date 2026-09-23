import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../../data/chaptersData';
import { TrackPanel } from './TrackPanel';

const noop = () => {};
const render = (readChapters: string[]) =>
  renderToStaticMarkup(
    <TrackPanel
      chapters={CHAPTERS}
      trackKey="biz"
      readChapters={readChapters}
      activeChapterId="s2"
      onSelectChapter={noop}
      onStartQuiz={noop}
    />,
  );

describe('TrackPanel primary button', () => {
  it('a fresh track invites the first chapter', () => {
    const html = render([]);
    expect(html).toContain('data-track-primary');
    expect(html).toContain('เริ่มอ่านบทแรกของเส้นทาง');
  });

  it('part way through it names the next unread chapter and never says อ่านต่อ', () => {
    const html = render(['s2', 's1']);
    expect(html).toContain('data-track-primary');
    expect(html).toContain('ไปบทถัดไปที่ยังไม่อ่าน');
    expect(html).not.toContain('อ่านต่อ');
  });
});


describe('TrackPanel hierarchy (spec §10.1, §10.2)', () => {
  const html = render(['s2']);
  const activeRow = html.match(/<button[^>]*data-track-item="s2"[^>]*>/)![0];
  const primary = html.match(/<button[^>]*data-track-primary[^>]*>/)![0];

  it('the active row is soft and stays aria-current; no row becomes aria-pressed', () => {
    expect(activeRow).toContain('aria-current="true"');
    expect(html).not.toContain('aria-pressed');
    expect(activeRow).toContain('bg-base-300');
    expect(activeRow).not.toMatch(/(?<![\w:/-])bg-primary(?![\w/-])/);
  });

  it('the track button is a soft full-width button, not a primary fill', () => {
    expect(primary).toContain('bg-base-300');
    expect(primary).toContain('w-full');
    expect(primary).not.toMatch(/(?<![\w:/-])bg-primary(?![\w/-])/);
  });

  it('the panel sits on bg-base-100 so the soft (bg-base-300) button and active row keep a visible boundary', () => {
    const panel = html.match(/<div[^>]*data-track-panel[^>]*>/)![0];
    expect(panel).toMatch(/(?<![\w:/-])bg-base-100(?![\w/-])/);
    expect(panel).not.toMatch(/(?<![\w:/-])bg-base-300(?![\w/-])/);
  });
});
