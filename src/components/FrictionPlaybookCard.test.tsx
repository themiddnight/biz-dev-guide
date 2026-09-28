import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CHAPTERS } from '../data/chaptersData';
import { FRICTION_PLAYBOOKS } from '../data/frictionPlaybooks';
import { SECTION_COMPONENTS } from './guide/sections/registry';
import { ctxFor } from './guide/sections/testCtx';
import { FrictionPlaybookCard } from './FrictionPlaybookCard';

describe('FrictionPlaybookCard (spec A4)', () => {
  it('renders the playbook, never the removed generic fallback', () => {
    const html = renderToStaticMarkup(<FrictionPlaybookCard playbook={FRICTION_PLAYBOOKS.s1} isOpen onToggle={() => {}} />);
    expect(html).toContain('id="friction-playbook-card"');
    expect(html).not.toContain('3 ข้อที่ควรจำเมื่อคุยเรื่อง');
  });

  it('the registry friction component renders nothing for a chapter without a playbook (s3)', () => {
    const chapter = CHAPTERS.find(c => c.id === 's3')!;
    const Friction = SECTION_COMPONENTS.friction;
    const html = renderToStaticMarkup(
      <Friction chapter={chapter} isOpen onToggle={() => {}} ctx={ctxFor()} />
    );
    expect(html).toBe('');
  });
});
