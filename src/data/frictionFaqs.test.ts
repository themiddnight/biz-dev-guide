import { describe, it, expect } from 'vitest';
import { FRICTION_FAQS } from './frictionFaqs';
import { FRICTION_PLAYBOOKS } from './frictionPlaybooks';

describe('FRICTION_FAQS', () => {
  it('every playbook link targets a chapter that has a playbook (spec A4: no fallback left to land on)', () => {
    const targets = FRICTION_FAQS.flatMap(f => (f.relatedPlaybookChapterId ? [f.relatedPlaybookChapterId] : []));
    expect(targets.length).toBeGreaterThan(0);
    for (const id of targets) expect(Object.keys(FRICTION_PLAYBOOKS), id).toContain(id);
  });
});
