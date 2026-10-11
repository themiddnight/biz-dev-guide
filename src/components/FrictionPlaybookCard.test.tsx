import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../data/chaptersData';
import { FRICTION_PLAYBOOKS } from '../data/frictionPlaybooks';
import { SECTION_COMPONENTS } from './guide/sections/registry';
import { CORE, ctxFor } from './guide/sections/testCtx';
import { FrictionPlaybookCard } from './FrictionPlaybookCard';

describe('FrictionPlaybookCard (spec A4)', () => {
  it('renders the playbook, never the removed generic fallback', () => {
    const html = renderToStaticMarkup(<FrictionPlaybookCard playbook={FRICTION_PLAYBOOKS.s1} />);
    expect(html).toContain(FRICTION_PLAYBOOKS.s1.battlegroundTitle);
    expect(html).not.toContain('3 ข้อที่ควรจำเมื่อคุยเรื่อง');
  });

  it('labels every block in plain Thai, with no English chrome name', () => {
    const html = renderToStaticMarkup(<FrictionPlaybookCard playbook={FRICTION_PLAYBOOKS.s1} />);
    for (const label of ['ฝั่ง Business หงุดหงิดเรื่อง', 'ฝั่ง Engineering หงุดหงิดเรื่อง', 'สาเหตุจริง', 'ถ้าต้องการ', 'ต้องยอมเสีย', 'วิธีคุย', 'ลองตอบดู']) {
      expect(html, label).toContain(`>${label}</`);
    }
    for (const english of ['Under the Surface', 'Win-Win', 'Trade-off Matrix', 'How to Negotiate', 'Battle-tested', 'Meeting Dilemma']) {
      expect(html, english).not.toContain(english);
    }
  });

  it('shows one row per trade-off and per script, and the dilemma only where the playbook has one', () => {
    const s1 = renderToStaticMarkup(<FrictionPlaybookCard playbook={FRICTION_PLAYBOOKS.s1} />);
    expect(s1.match(/>ถ้าต้องการ</g)).toHaveLength(FRICTION_PLAYBOOKS.s1.tradeOffMatrix.length);
    expect(s1.match(/>สถานการณ์<\/dt>/g)).toHaveLength(FRICTION_PLAYBOOKS.s1.goldenScripts.length);
    expect(s1.match(/aria-pressed="false"/g)).toHaveLength(FRICTION_PLAYBOOKS.s1.dilemma!.options.length);
    const s4 = renderToStaticMarkup(<FrictionPlaybookCard playbook={FRICTION_PLAYBOOKS.s4} />);
    expect(FRICTION_PLAYBOOKS.s4.dilemma).toBeUndefined();
    expect(s4).not.toContain('data-playbook-dilemma');
    expect(s4).not.toContain('aria-pressed');
  });

  it('the registry friction component renders the playbook under the sec-friction anchor', () => {
    const chapter = CHAPTERS.find(c => c.id === 's1')!;
    const Friction = SECTION_COMPONENTS.friction;
    const html = renderToStaticMarkup(<Friction chapter={chapter} fold={CORE} ctx={ctxFor()} />);
    expect(html).toContain('id="sec-friction"');
    expect(html).toContain(FRICTION_PLAYBOOKS.s1.underlyingRootCause);
  });

  it('the registry friction component renders nothing for a chapter without a playbook (s3)', () => {
    const chapter = CHAPTERS.find(c => c.id === 's3')!;
    const Friction = SECTION_COMPONENTS.friction;
    const html = renderToStaticMarkup(
      <Friction chapter={chapter} fold={CORE} ctx={ctxFor()} />
    );
    expect(html).toBe('');
  });
});
