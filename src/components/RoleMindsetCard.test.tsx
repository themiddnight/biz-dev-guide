import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { RoleMindsetCard } from './RoleMindsetCard';

const noop = () => {};

describe('RoleMindsetCard (spec A5)', () => {
  it('open: the friction principles close the card, below the role content', () => {
    const html = renderToStaticMarkup(<RoleMindsetCard isOpen onToggle={noop} />);
    const bridge = html.indexOf('วิธีคุยกับฝั่งนี้ (Bridge Advice)');
    const principles = html.indexOf('3 ข้อที่ควรจำเมื่อทีมเห็นไม่ตรงกัน');
    expect(bridge).toBeGreaterThan(0);
    expect(principles).toBeGreaterThan(bridge);
    expect(html).toContain('อย่าสั่งเป็นวิธีแก้ ให้บอกปัญหาและ Impact:');
    expect(html).toContain('ห้ามพูดเดี่ยวๆ:');
    expect(html).toContain('Technical Debt คือเรื่องการเงิน:');
  });
  it('closed: no principles', () => {
    expect(renderToStaticMarkup(<RoleMindsetCard isOpen={false} onToggle={noop} />)).not.toContain('3 ข้อที่ควรจำ');
  });
});
