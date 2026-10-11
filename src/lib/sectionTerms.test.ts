import { describe, it, expect } from 'vitest';
import { CHAPTERS } from '../data/chaptersData';
import type { Chapter, FrictionPlaybook } from '../types';
import { examplesTerms, frictionTerms, heroTerms, jargonTerms, pitfallTerms, practiceTerms } from './sectionTerms';

const ch = (id: string): Chapter => CHAPTERS.find(c => c.id === id)!;
/** `id(label)` of every marker in a walk's output, in walk order. */
const markers = (walked: unknown) =>
  [...JSON.stringify(walked).matchAll(/\[\[g:([a-z0-9-]+)\|([^\]]+)\]\]/g)].map(m => `${m[1]}(${m[2]})`);

describe('heroTerms seat lines', () => {
  it('marks only the seats asked for, in the order given', () => {
    expect(markers(heroTerms(ch('s16'), ['biz']).seats)).toEqual(['revenue(ยอดขาย)']);
    expect(markers(heroTerms(ch('s16'), ['eng']).seats)).toEqual(['pm-vs-pjm(PM)']);
    expect(Object.keys(heroTerms(ch('s16'), ['eng']).seats)).toEqual(['eng']);
    expect(markers(heroTerms(ch('s16'), ['biz', 'eng']).seats)).toEqual(['revenue(ยอดขาย)', 'pm-vs-pjm(PM)']);
  });

  it('marks a seat line from what the opening defined, without moving the markers below it', () => {
    const chapter: Chapter = {
      ...ch('s16'),
      chapterOpening: 'เปิดบทด้วย KPI',
      heroFigure: { ...ch('s16').heroFigure!, seats: { biz: 'ที่นั่งนี้พูดถึง KPI และ Sprint', eng: 'อีกฝั่ง' } },
      plainAnalogy: 'เปรียบกับ Sprint และ MVP',
      keyTakeaway: 'สรุปด้วย MVP',
    };
    const hero = heroTerms(chapter, ['biz']);
    expect(hero.chapterOpening).toBe('เปิดบทด้วย [[g:okr-kpi|KPI]]');
    expect(hero.seats.biz).toBe('ที่นั่งนี้พูดถึง KPI และ [[g:sprint|Sprint]]');
    expect(hero.plainAnalogy).toBe('เปรียบกับ [[g:sprint|Sprint]] และ [[g:mvp|MVP]]');
    expect(hero.keyTakeaway).toBe('สรุปด้วย MVP');
    // The other seat shows the same analogy and takeaway.
    const flipped = heroTerms(chapter, ['eng']);
    expect(flipped.plainAnalogy).toBe(hero.plainAnalogy);
    expect(flipped.keyTakeaway).toBe(hero.keyTakeaway);
  });

  it('a chapter without a hero figure has no seat line', () => {
    expect(heroTerms({ ...ch('s16'), heroFigure: undefined }, ['biz', 'eng']).seats).toEqual({});
  });
});

describe('jargonTerms formal definition', () => {
  it('marks the formal definition between the translation and the meeting example', () => {
    const rows = jargonTerms(ch('s1'));
    expect(rows[4].formalDefinition).toBe('วงคุยสั้นๆ ที่ต้องมีครบ 3 มุม: Business ดูว่าคุ้มไหม, Dev ดูว่าทำได้ไหม, [[g:qa|QA]] ดูว่าจะพังตรงไหน');
    const chapter: Chapter = {
      ...ch('s1'),
      jargonList: [{ term: 'Hand-off', humanTranslation: 'ส่งงานใน Sprint', formalDefinition: 'Sprint กับ MVP', meetingExample: 'พูดถึง MVP' }],
    };
    expect(jargonTerms(chapter)).toEqual([
      { humanTranslation: 'ส่งงานใน [[g:sprint|Sprint]]', formalDefinition: 'Sprint กับ [[g:mvp|MVP]]', meetingExample: 'พูดถึง MVP' },
    ]);
  });

  it('leaves a row without a formal definition without one', () => {
    const chapter: Chapter = { ...ch('s1'), jargonList: [{ term: 'Hand-off', humanTranslation: 'ส่งงาน' }] };
    expect(jargonTerms(chapter)).toEqual([{ humanTranslation: 'ส่งงาน', formalDefinition: undefined, meetingExample: undefined }]);
  });
});

describe('examplesTerms', () => {
  it('marks each term once across the dialogue and the cases, on real chapters', () => {
    expect(markers(examplesTerms(ch('s16')))).toEqual(['pm-vs-pjm(PM)']);
    expect(markers(examplesTerms(ch('s6')))).toEqual([
      'sprint(Sprint)', 'definition-of-ready(DoR)', 'velocity(Velocity)', 'unit-test(Unit Test)',
      'definition-of-done(Definition of Done)', 'pm-vs-pjm(PM)', 'agile(Agile)',
    ]);
  });

  it('walks context, wrong way, right way, then the cases, and never marks a case title', () => {
    const chapter: Chapter = {
      ...ch('s1'),
      dialogueExample: {
        context: 'ประชุม Sprint',
        wrongWay: { speaker: 'PM', text: 'ขอ MVP ใน Sprint นี้', issue: 'ไม่มี KPI' },
        rightWay: { speaker: 'PM', text: 'MVP วัดด้วย KPI', benefit: 'ดีขึ้น' },
      },
      realWorldExamples: [{ title: 'เคส API', companyOrIndustry: 'Fintech', situation: 'ต่อ API', whatHappened: 'API ล่ม', resolution: 'แก้', keyLesson: 'จำไว้ว่า KPI' }],
    };
    expect(examplesTerms(chapter)).toEqual({
      dialogue: {
        context: 'ประชุม [[g:sprint|Sprint]]',
        wrongWay: { speaker: '[[g:pm-vs-pjm|PM]]', text: 'ขอ [[g:mvp|MVP]] ใน Sprint นี้', outcome: 'ไม่มี [[g:okr-kpi|KPI]]' },
        rightWay: { speaker: 'PM', text: 'MVP วัดด้วย KPI', outcome: 'ดีขึ้น' },
      },
      cases: [{ situation: 'ต่อ [[g:api|API]]', whatHappened: 'API ล่ม', resolution: 'แก้', keyLesson: 'จำไว้ว่า KPI' }],
    });
  });

  it('a chapter with neither has an empty walk', () => {
    expect(examplesTerms({ ...ch('s1'), dialogueExample: undefined, realWorldExamples: undefined })).toEqual({ dialogue: undefined, cases: [] });
  });
});

describe('practiceTerms', () => {
  it('marks step descriptions first, then checklist items (s1)', () => {
    const practice = practiceTerms(ch('s1'));
    expect(practice.steps[0]).toBe('เขียนปัญหา, [[g:okr-kpi|KPI]] และกลุ่มผู้ใช้ ลงเอกสารหน้าเดียว (1-pager)');
    expect(practice.checklist[2]).toBe('Dev และ [[g:qa|QA]] ได้ฟังโจทย์ตั้งแต่ต้น');
    expect(markers(practice)).toEqual(['okr-kpi(KPI)', 'qa(QA)']);
  });

  it('a term a step already marked is bare in the checklist', () => {
    const chapter: Chapter = {
      ...ch('s1'),
      realWorldWorkflow: [{ step: 'ตั้ง KPI', role: 'PM', description: 'ตั้ง KPI ก่อน' }],
      checklist: ['มี KPI แล้ว', 'มี MVP แล้ว'],
    };
    expect(practiceTerms(chapter)).toEqual({ steps: ['ตั้ง [[g:okr-kpi|KPI]] ก่อน'], checklist: ['มี KPI แล้ว', 'มี [[g:mvp|MVP]] แล้ว'] });
  });
});

describe('pitfallTerms', () => {
  it('marks the warning sign and the fix, never the pitfall line (s1)', () => {
    const pitfalls = pitfallTerms(ch('s1'));
    expect(pitfalls).toHaveLength(4);
    expect(pitfalls[3].symptom).toBe('บอกว่า 2 วันเสร็จ แต่ลืมเผื่อเวลาต่อ [[g:api|API]] ภายนอก เขียน Test และแก้บั๊ก สุดท้ายเลทเป็นสัปดาห์');
    expect(markers(pitfalls)).toEqual(['api(API)']);
  });

  it('keeps a pitfall without a warning sign without one, and marks a repeated term once', () => {
    const chapter: Chapter = {
      ...ch('s1'),
      commonPitfalls: [{ pitfall: 'ลืม KPI', solution: 'ตั้ง KPI' }, { pitfall: 'อีกข้อ', symptom: 'ไม่มี KPI', solution: 'ทำ MVP' }],
    };
    expect(pitfallTerms(chapter)).toEqual([
      { symptom: undefined, solution: 'ตั้ง [[g:okr-kpi|KPI]]' },
      { symptom: 'ไม่มี KPI', solution: 'ทำ [[g:mvp|MVP]]' },
    ]);
  });
});

describe('frictionTerms', () => {
  const base = ch('s1').frictionPlaybook!;

  it('marks the playbook top to bottom on a real chapter (s6)', () => {
    expect(markers(frictionTerms(ch('s6').frictionPlaybook!))).toEqual([
      'sprint(Sprint)', 'refactoring(Refactor)', 'technical-debt(Technical Debt)', 'velocity(Velocity)',
    ]);
  });

  it('never marks the battleground title or a script situation', () => {
    const playbook: FrictionPlaybook = {
      ...base,
      battlegroundTitle: 'เถียงเรื่อง KPI',
      businessFrustration: 'ไม่มีอะไร', engineerFrustration: 'ไม่มีอะไร', underlyingRootCause: 'ไม่มีอะไร',
      tradeOffMatrix: [],
      goldenScripts: [{ situation: 'คุยเรื่อง KPI', businessScript: 'ขอดู KPI', engineerScript: 'KPI คืออะไร' }],
      dilemma: undefined,
    };
    expect(frictionTerms(playbook).scripts).toEqual([{ businessScript: 'ขอดู [[g:okr-kpi|KPI]]', engineerScript: 'KPI คืออะไร' }]);
  });

  it('walks each dilemma option from what the playbook marked above it, not from the other options', () => {
    const playbook: FrictionPlaybook = {
      ...base,
      businessFrustration: 'งานไม่ทัน Sprint', engineerFrustration: 'x', underlyingRootCause: 'x',
      tradeOffMatrix: [], goldenScripts: [],
      dilemma: {
        scenario: 'ห้องประชุม', counterpartQuote: 'ขอเพิ่ม',
        options: [
          { id: 'a', text: 'ตอบ KPI', isOptimal: false, result: 'Sprint พัง เพราะไม่มี KPI', tip: 'ดู KPI' },
          { id: 'b', text: 'ตอบ', isOptimal: true, result: 'ได้ KPI ครบ', tip: 'จบ' },
        ],
      },
    };
    expect(frictionTerms(playbook).dilemma).toEqual({
      scenario: 'ห้องประชุม', counterpartQuote: 'ขอเพิ่ม',
      options: [
        { result: 'Sprint พัง เพราะไม่มี [[g:okr-kpi|KPI]]', tip: 'ดู KPI' },
        { result: 'ได้ [[g:okr-kpi|KPI]] ครบ', tip: 'จบ' },
      ],
    });
  });

  it('a playbook without a dilemma has none', () => {
    expect(frictionTerms({ ...base, dilemma: undefined }).dilemma).toBeUndefined();
    expect(frictionTerms(base).dilemma!.options).toHaveLength(3);
  });
});
