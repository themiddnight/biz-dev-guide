import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../data/chaptersData';
import { collectTermIds, isAbbreviationKey, markTerms } from './autoTerms';

/** One guardrail per block (term-definitions spec P3.5, D16). */
const mark = (text: string, seen = new Set<string>()) => markTerms(text, 'prose', seen);
const ids = (marked: string) => [...marked.matchAll(/\[\[g:([a-z0-9-]+)\|([^\]]+)\]\]/g)].map(m => `${m[1]}|${m[2]}`);

describe('markTerms guardrails', () => {
  it('1. prose only: heading and quote kinds return the input unchanged', () => {
    const text = 'Sprint ของทีม KPI และ QA [[!g:sprint]]';
    expect(markTerms(text, 'heading', new Set())).toBe(text);
    expect(markTerms(text, 'quote', new Set())).toBe(text);
    expect(ids(markTerms('Sprint ของทีม', 'prose', new Set()))).toEqual(['sprint|Sprint']);
  });

  it('2. quoted and code-like runs inside a prose field are untouched', () => {
    expect(ids(mark('ทีมบอกว่า "ไว้ Sprint หน้า" แล้วก็เงียบ'))).toEqual([]);
    expect(ids(mark('ทีมบอกว่า “ไว้ Sprint หน้า” แล้วก็เงียบ'))).toEqual([]);
    expect(ids(mark("ทีมบอกว่า 'ไว้ Sprint หน้า' แล้วก็เงียบ"))).toEqual([]);
    expect(ids(mark('ทีมบอกว่า 「ไว้ Sprint หน้า」 แล้วก็เงียบ'))).toEqual([]);
    expect(ids(mark('รัน `npm run QA` ก่อน'))).toEqual([]);
    // Arrow chains, `->`, `→` and `➔`: the s1 primer's hand-off chain (chapters1_5.ts:20).
    expect(ids(mark('ตั้งแต่ผู้บริหาร → PM → Designer → SA → Dev เพราะแต่ละคนตีความ'))).toEqual([]);
    expect(ids(mark('ลูกค้าแจ้ง -> QA ตรวจ'))).toEqual([]);
    expect(ids(mark('Business Concept ➔ PO ➔ UX ➔ BA'))).toEqual([]);
    // The same term outside the quote is still marked.
    expect(ids(mark('"ไว้ Sprint หน้า" คือคำที่ได้ยินทุก Sprint'))).toEqual(['sprint|Sprint']);
  });

  it('3. first occurrence per section: one `seen` set marks a term once', () => {
    const seen = new Set<string>();
    expect(ids(mark('Sprint นี้ และ Sprint หน้า', seen))).toEqual(['sprint|Sprint']);
    expect(ids(mark('อีกย่อหน้าที่พูดถึง Sprint', seen))).toEqual([]);
    expect(seen.has('sprint')).toBe(true);
    expect(ids(mark('อีกส่วนที่พูดถึง Sprint', new Set()))).toEqual(['sprint|Sprint']);
  });

  it('4. longest match wins', () => {
    expect(ids(mark('ต่อท่อ CI/CD ให้ครบ'))).toEqual(['ci-cd|CI/CD']);
    expect(ids(mark('ใช้ Test Pyramid วางสัดส่วนเทสต์'))).toEqual(['test-pyramid|Test Pyramid']);
    expect(ids(mark('ทีม UX/UI ส่งแบบแล้ว'))).toEqual(['ux-ui|UX/UI']);
    expect(ids(mark('ตั้ง SLO ก่อนเซ็น SLA'))).toEqual(['slo|SLO', 'sla|SLA']);
  });

  it('5. abbreviations are case-sensitive and whole-token; words are case-insensitive', () => {
    expect(isAbbreviationKey('PM')).toBe(true);
    expect(isAbbreviationKey('CI/CD')).toBe(true);
    expect(isAbbreviationKey('DoR')).toBe(true);
    expect(isAbbreviationKey('PjM')).toBe(true);
    expect(isAbbreviationKey('Sprint')).toBe(false);
    expect(ids(mark('ทีม PMO กับ NPM และ pm'))).toEqual([]);
    expect(ids(mark('ระบบ SLOW ลง'))).toEqual([]);
    expect(ids(mark('ทีมมี PM สองคน'))).toEqual(['pm-vs-pjm|PM']);
    expect(ids(mark('รอบ sprint นี้'))).toEqual(['sprint|sprint']);
    expect(ids(mark('ยก KPIs ขึ้นมาดู'))).toEqual(['okr-kpi|KPIs']);
  });

  it('6. already-expanded text is skipped: the literal chapters6_10.ts:161 string', () => {
    const s7 = CHAPTERS.find(c => c.id === 's7')!.beginnerPrimer!.whatIsIt;
    expect(s7.startsWith('QA (Quality Assurance) คือ')).toBe(true);
    const marked = mark(s7);
    expect(marked.startsWith('QA (Quality Assurance) คือ')).toBe(true);
    expect(ids(marked).some(id => id.startsWith('qa|'))).toBe(false);
    expect(ids(mark('KR (ผลลัพธ์หลัก) ของไตรมาส'))).toEqual([]);
    expect(ids(mark('ดู Key Results (KR) ทุกเดือน'))).toEqual([]);
    // An expanded first use still counts as the section's one use of that term.
    const seen = new Set<string>();
    mark('QA (Quality Assurance) คือ', seen);
    expect(ids(mark('แล้ว QA ก็ตรวจ', seen))).toEqual([]);
  });

  it('7. `[[!g:id]]` suppresses one term and `[[!g:*]]` suppresses all; both are stripped', () => {
    const one = mark('ใน Sprint นี้ QA ตรวจทุกงาน[[!g:sprint]]');
    expect(one).not.toContain('[[!g:');
    expect(ids(one)).toEqual(['qa|QA']);
    const all = mark('[[!g:*]]ใน Sprint นี้ QA ตรวจทุกงาน');
    expect(all).toBe('ใน Sprint นี้ QA ตรวจทุกงาน');
  });

  it('7b. a hand-authored marker wins and is not duplicated', () => {
    const seen = new Set<string>();
    const text = '[[g:sprint|สปรินต์]] คือรอบทำงาน ทุก Sprint มีเป้า';
    expect(mark(text, seen)).toBe(text);
    expect(seen.has('sprint')).toBe(true);
  });

  it('8. text inside a marker or a chapter link is never re-scanned', () => {
    const once = mark('ต่อท่อ CI/CD ก่อนเปิด Sprint แรก อ่าน [[s6|บท Sprint และ QA]]');
    expect(ids(once)).toEqual(['ci-cd|CI/CD', 'sprint|Sprint']);
    expect(mark(once)).toBe(once); // idempotent: no marker inside a marker
  });

  it('keys that mean something else in this guide are never auto-matched', () => {
    expect(ids(mark('Leaky Pipeline คืออาการที่โจทย์เพี้ยน'))).toEqual([]);
    expect(ids(mark('ผู้บริหารดู L1 ส่วน Dev ดู L3'))).toEqual([]);
  });

  it('collectTermIds names every term once, ignoring `seen`', () => {
    expect(collectTermIds('Monolith vs Microservices')).toEqual(['monolith', 'microservices']);
  });
});
