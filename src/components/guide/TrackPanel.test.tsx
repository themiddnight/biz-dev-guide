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
