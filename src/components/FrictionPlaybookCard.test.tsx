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
