import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../../data/chaptersData';
import { getChapterLayout } from '../../data/sectionLayers';
import type { ExperienceLevel } from '../../types';
import { lensHint } from './lensHint';

const ch = (id: string) => CHAPTERS.find(c => c.id === id)!;
const hint = (level: ExperienceLevel, id: string) => lensHint(level, getChapterLayout(level, ch(id)));
const FRICTION = ['s1', 's2', 's4', 's6', 's7', 's8', 's11', 's12'];
const FOLDED = ' ส่วนอื่นพับไว้ในชั้น "นำไปใช้" และ "เจาะลึก"';

describe('lensHint (spec A8)', () => {
  it('beginner names the open Core sections', () => {
    expect(hint('beginner', 's1')).toBe(`💡 โหมดมือใหม่: เปิด ศัพท์จำเป็น · อีกฝั่งมองยังไง · แนวคิดหลัก ไว้ก่อน${FOLDED}`);
  });
  it('experienced points at Friction in a playbook chapter', () => {
    expect(hint('experienced', 's1')).toBe('⚡ โหมดทำงานข้ามทีม: เปิด อีกฝั่งมองยังไง · แนวคิดหลัก · กับดัก ไว้ก่อน วิธีรับมือ Friction อยู่ในชั้น "นำไปใช้"');
  });
  it('experienced mentions Friction only in s1, s2, s4, s6, s7, s8, s11, s12 (spec A.7 #3)', () => {
    for (const c of CHAPTERS) {
      const text = hint('experienced', c.id);
      expect(text.includes('Friction'), c.id).toBe(FRICTION.includes(c.id));
      if (!FRICTION.includes(c.id)) expect(text.endsWith(FOLDED), c.id).toBe(true);
    }
  });
});
