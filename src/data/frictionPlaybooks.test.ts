import { describe, it, expect } from 'vitest';
import { FRICTION_PLAYBOOKS } from './frictionPlaybooks';

const NEW_IN_B2 = ['s12', 's16', 's17', 's18', 's19'];

describe('friction playbooks', () => {
  it('each key is the chapterId it describes', () => {
    for (const [key, playbook] of Object.entries(FRICTION_PLAYBOOKS)) expect(playbook.chapterId, key).toBe(key);
  });

  it('the Blame vs Blameless playbook sits on the incident chapter s10 (spec B1)', () => {
    expect(FRICTION_PLAYBOOKS.s10.battlegroundTitle).toContain('Blameless');
    expect(FRICTION_PLAYBOOKS.s12.battlegroundTitle).not.toContain('Blameless');
  });

  it.each(NEW_IN_B2)('%s has both frustrations, a root cause, one trade-off row, one script and no dilemma (spec B2)', id => {
    const p = FRICTION_PLAYBOOKS[id];
    for (const text of [p.battlegroundTitle, p.businessFrustration, p.engineerFrustration, p.underlyingRootCause]) {
      expect(text.trim().length, `${id} text`).toBeGreaterThan(20);
    }
    expect(p.tradeOffMatrix).toHaveLength(1);
    expect(p.goldenScripts).toHaveLength(1);
    expect(p.dilemma).toBeUndefined();
  });

  it('money is written in baht, never with a dollar sign', () => {
    expect(JSON.stringify(FRICTION_PLAYBOOKS)).not.toContain('$');
  });

  it('no two playbooks share a golden script', () => {
    const scripts = Object.values(FRICTION_PLAYBOOKS).flatMap(p => p.goldenScripts.flatMap(g => [g.businessScript, g.engineerScript]));
    expect(new Set(scripts).size).toBe(scripts.length);
  });
});
