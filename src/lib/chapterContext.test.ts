import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../data/chaptersData';
import type { Chapter } from '../types';
import { buildChapterContext } from './chapterContext';

const base: Chapter = { ...CHAPTERS[0], coreConcepts: undefined, checklist: undefined };

describe('buildChapterContext', () => {
  it('labels the chapter and leads with its title and key points', () => {
    const ctx = buildChapterContext({ ...base, num: 3, title: 'ประเมินงาน', enTerm: 'Estimation', subtitle: 'ย่อย', keyTakeaway: 'ข้อคิด' });
    expect(ctx.label).toBe('บทที่ 3 · ประเมินงาน');
    expect(ctx.text.split('\n').slice(0, 2)).toEqual(['บทที่ 3 · ประเมินงาน (Estimation): ย่อย', 'ใจความสำคัญ: ข้อคิด']);
  });

  it('strips RichText markers down to their words', () => {
    const ctx = buildChapterContext({
      ...base,
      keyTakeaway: '[[!g:sales-pipeline]]ดู **ตัวหนา** กับ [[g:api|API]] และ [[s4|บทที่ 4]]',
      coreConcepts: [{ heading: 'หัวข้อ', detail: 'รายละเอียด\nบรรทัดสอง' }],
    });
    expect(ctx.text).toContain('ใจความสำคัญ: ดู ตัวหนา กับ API และ บทที่ 4');
    expect(ctx.text).toContain('- หัวข้อ: รายละเอียด บรรทัดสอง');
    expect(ctx.text).not.toMatch(/\[\[|\*\*/);
  });

  it('caps the text at 1,500 chars, dropping the tail', () => {
    const concepts = Array.from({ length: 20 }, (_, i) => ({ heading: `แนวคิด ${i}`, detail: 'ก'.repeat(300) }));
    const ctx = buildChapterContext({ ...base, coreConcepts: concepts });
    expect(ctx.text.length).toBeLessThanOrEqual(1500);
    expect(ctx.text.length).toBeGreaterThan(1400);
    expect(ctx.text.endsWith('…')).toBe(true);
    expect(ctx.text.startsWith(`บทที่ ${base.num}`)).toBe(true);
  });

  it('stays within the cap for every real chapter', () => {
    for (const ch of CHAPTERS) expect(buildChapterContext(ch).text.length).toBeLessThanOrEqual(1500);
  });
});
