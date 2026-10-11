import { FigureKey, RichText } from '../types';

/** Jump targets inside the s5 Diagram section (stable DOM ids). */
export const S5_JUMP_TARGET_IDS = {
  c4: 's5-c4-explorer',
  behavior: 's5-swimlane-vs-sequence',
} as const;

export type DiagramJumpTarget = keyof typeof S5_JUMP_TARGET_IDS;

export interface DiagramFamily {
  id: string;
  figureKey: FigureKey;
  name: string;
  question: string;
  examples: string;
  note?: string;
  jumpTo?: DiagramJumpTarget;
  jumpLabel?: string;
}

/** Static s5 family grid (index.html 652–755). Labels use words, not arrows or middle dots. */
export const DIAGRAM_FAMILIES: DiagramFamily[] = [
  {
    id: 'structure',
    figureKey: 'family-structure',
    name: 'โครงสร้าง',
    question: '"มีอะไรอยู่ข้างใน และแต่ละชิ้นเกี่ยวกันยังไง"',
    examples: 'C4, component, module map และ ERD (โครงข้อมูล)',
    jumpTo: 'c4',
    jumpLabel: 'ดูรายละเอียด C4 ทั้ง 4 ระดับ',
  },
  {
    id: 'behavior',
    figureKey: 'family-behavior',
    name: 'พฤติกรรม',
    question: '"เกิดอะไรก่อนหลัง ใครคุยกับใคร"',
    examples: 'sequence, use case, state machine และ user flow',
    jumpTo: 'behavior',
    jumpLabel: 'ดูตัวอย่าง sequence เทียบ swimlane',
  },
  {
    id: 'process',
    figureKey: 'family-process',
    name: 'กระบวนการ',
    question: '"งานส่งต่อจากใครไปใคร อนุมัติตรงไหน"',
    examples: 'swimlane หรือ BPMN และ customer journey map',
    jumpTo: 'behavior',
    jumpLabel: 'ดูตัวอย่าง swimlane',
  },
  {
    id: 'screen',
    figureKey: 'family-screen',
    name: 'หน้าจอ',
    question: '"ผู้ใช้จะเห็นอะไร กดตรงไหน"',
    examples: 'wireframe, mockup และ prototype',
    note: 'เป็นหมวดที่ฝั่ง Business อ่านง่ายที่สุด เลยมักใช้เปิดบทสนทนา แต่ระวังว่าไม่ได้บอกอะไรเลยเรื่องสิ่งที่อยู่หลังจอ',
  },
  {
    id: 'thinking',
    figureKey: 'family-thinking',
    name: 'จัดระเบียบความคิด',
    question: '"ไอเดียที่กระจัดกระจายจัดกลุ่มยังไงได้บ้าง"',
    examples: 'mind map, affinity diagram และ impact map',
    note: 'ใช้ตอนยังไม่มีคำตอบ ไม่ใช่ตอนจะสื่อสารคำตอบ เหมาะกับช่วง elicit ในบทที่ 4',
  },
  {
    id: 'plan',
    figureKey: 'family-plan',
    name: 'แผนและเวลา',
    question: '"อะไรทำก่อนหลัง อะไรต้องรออะไร"',
    examples: 'gantt, roadmap และ dependency graph',
    note: 'ระวังสับสนกับหมวดพฤติกรรม หมวดนี้พูดถึงเวลาของ "โปรเจกต์" ส่วนพฤติกรรมพูดถึงเวลาของ "ระบบตอนทำงาน"',
  },
];

/** Static s5 swimlane-vs-sequence worked example (index.html 1002–1104). */
export const SWIMLANE_VS_SEQUENCE: {
  summary: string;
  intro: RichText;
  columns: { figureKey: FigureKey; title: string; sub: string; caption: RichText }[];
} = {
  summary: 'เรื่องเดียวกัน วาดสองแบบ swimlane เทียบ sequence diagram',
  intro: 'สองแบบนี้พูดเรื่องพฤติกรรมเหมือนกัน แต่จัดระเบียบคนละแกน จึงเน้นคนละอย่าง ด้านล่างคือ **เรื่องเดียวกันเป๊ะ** (ลูกค้าแจ้งว่าของไม่ถึง แล้วขอคืนเงิน) วาดด้วยสองมาตรฐาน ใช้เรื่องเดียวกันเพื่อให้ความต่างที่เห็นเป็นความต่างของวิธีวาดล้วนๆ ไม่ปนกับความต่างของเนื้อเรื่อง',
  columns: [
    {
      figureKey: 'refund-swimlane',
      title: 'Swimlane (BPMN)',
      sub: 'จัดตาม "ใครรับผิดชอบ"',
      caption: 'เห็นชัดว่า **งานข้ามมือใครบ้าง** และมีจุดตัดสินใจของคนอยู่ตรงไหน แต่ไม่บอกว่าแต่ละก้าวใช้เวลาเท่าไหร่ หรือใครรอใครอยู่',
    },
    {
      figureKey: 'refund-sequence',
      title: 'Sequence (UML)',
      sub: 'จัดตาม "เวลาไหลลงล่าง"',
      caption: 'เห็นชัดว่า **ลำดับและการรอ** เป็นยังไง เลข 1 ถึง 5 คือลำดับเวลา เส้นประคือการตอบกลับ และแท่งทึบยาวๆ ของ support บอกว่าเขาต้องรออยู่ตลอดทั้ง flow',
    },
  ],
};
