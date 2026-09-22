import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { IndexEmptyState } from './IndexEmptyState';

const noop = () => {};

describe('IndexEmptyState', () => {
  it('no role filter: suggests a shorter or English query', () => {
    const html = renderToStaticMarkup(<IndexEmptyState query="  ด่วนมาก " roleFiltered={false} onClear={noop} />);
    expect(html).toContain('ไม่พบบทที่มีคำว่า &quot;ด่วนมาก&quot;');
    expect(html).toContain('ลองคำที่สั้นลง หรือค้นเป็นภาษาอังกฤษ');
    expect(html).toContain('ล้างการค้นหา');
    expect(html).toContain('data-index-empty');
    expect(html).toContain('role="status"');
  });
  it('role filter active: suggests the ทั้งหมด chip', () => {
    const html = renderToStaticMarkup(<IndexEmptyState query="canary" roleFiltered onClear={noop} />);
    expect(html).toContain('ลองกด &quot;ทั้งหมด&quot; หรือใช้คำอื่น');
  });
});
