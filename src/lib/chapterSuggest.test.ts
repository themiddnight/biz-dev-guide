import { describe, expect, it } from 'vitest';
import { CHAPTERS } from '../data/chaptersData';
import { GLOSSARY } from '../data/glossary';
import { mentions, suggestChapters } from './chapterSuggest';

const nums = (question: string) => suggestChapters(question, CHAPTERS, GLOSSARY).map(c => c.num);

describe('mentions', () => {
  it('matches an English phrase only as whole words, ignoring case', () => {
    expect(mentions('ช่วยเขียน AC ให้หน่อย', 'ac')).toBe(true);
    expect(mentions('ACของหน้านี้', 'ac')).toBe(true);
    expect(mentions('React กับ cache ต่างกันยังไง', 'ac')).toBe(false);
    expect(mentions('ขอ test pyramid', 'Test Pyramid')).toBe(true);
  });

  it('matches a Thai phrase anywhere, since Thai has no word breaks', () => {
    expect(mentions('ทำไมเดดไลน์ที่เลื่อนไม่ได้ถึงเกิดขึ้น', 'เดดไลน์')).toBe(true);
  });

  it('treats regex characters in a phrase literally', () => {
    expect(mentions('ทำ CI/CD ยังไง', 'ci/cd')).toBe(true);
    expect(mentions('C++ ดีไหม', 'c++')).toBe(true);
    expect(mentions('cxx', 'c.x')).toBe(false);
  });
});

describe('suggestChapters', () => {
  it('ranks the chapter that names the topic first', () => {
    expect(nums('test pyramid คืออะไร')[0]).toBe(7);
    expect(nums('อธิบาย C4 model หน่อย')[0]).toBe(5);
    expect(nums('ทำไม CI/CD ถึงสำคัญ')[0]).toBe(8);
  });

  it('finds chapters through glossary terms and returns at most 3', () => {
    const found = nums('SLA กับ SLO ต่างกันยังไง');
    expect(found.length).toBeGreaterThan(0);
    expect(found.length).toBeLessThanOrEqual(3);
  });

  it('returns nothing for an unrelated question or a short word inside another', () => {
    expect(nums('กินข้าวยัง')).toEqual([]);
    expect(nums('React state กับ cache ต่างกันยังไง')).toEqual([]);
  });
});
