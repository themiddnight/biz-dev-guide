import { ChapterContentSection } from '../types';

/**
 * Reference content restored from the static guide
 * (`biz-dev-guide-static/index.html`), keyed by React chapter id.
 * Text uses the RichText subset: `**bold**`, `\n`, `[[sN|label]]`.
 */
export const CHAPTER_CONTENT: Record<string, ChapterContentSection[]> = {
  // Static s2 lines 457–467
  s2: [
    {
      blocks: [
        {
          kind: 'table',
          id: 's2-pm-handoff',
          title: 'PM ส่งอะไรต่อให้ใคร — สะพานไปบทถัดไป',
          intro:
            'งานของ PM ไม่ได้จบที่การตัดสินใจ แต่ต้องส่งผลลัพธ์ในรูปที่คนถัดไปนำไปทำต่อได้ ตัวอย่างจากแอปสั่งอาหาร ("ให้ลูกค้าสั่งอาหารได้ง่ายขึ้น"):',
          columns: [
            { key: 'deliverable', label: 'PM ส่งมอบ', widthHint: 'wide' },
            { key: 'receiver', label: 'ผู้รับ', widthHint: 'narrow' },
            { key: 'question', label: 'คำถามที่ผู้รับจะถามกลับ' },
          ],
          rows: [
            {
              cells: {
                deliverable: 'โจทย์ + เป้าหมายที่วัดได้ (เช่น ลดขั้นตอนสั่งอาหารจาก 6 เหลือ 3 ขั้น)',
                receiver: 'UX/UI ([[s3|บทที่ 3]])',
                question: 'ใครคือผู้ใช้ตัวจริง และเขาติดขัดตรงไหนของขั้นตอนตอนนี้',
              },
            },
            {
              cells: {
                deliverable: 'ลำดับความสำคัญ (Must/Should) และขอบเขตรอบแรก',
                receiver: 'BA ([[s4|บทที่ 4]])',
                question: '"ง่ายขึ้น" แปลว่าอะไรเป็นข้อๆ ที่ทดสอบได้ และอะไรอยู่นอกขอบเขต',
              },
            },
            {
              cells: {
                deliverable: 'ข้อจำกัดด้านเวลาและงบ',
                receiver: 'SA ([[s5|บทที่ 5]])',
                question: 'แบบไหนทำได้จริงในเวลานี้ และต้องแลกอะไร',
              },
            },
          ],
          footnote:
            'ถ้า PM ส่งได้แค่ประโยคกว้างๆ อย่าง "ทำให้ง่ายขึ้น" คำถามทั้งหมดในตารางจะตกไปเป็นภาระของคนถัดไปโดยไม่มีใครบอก และมักกลายเป็นการแก้ตอนที่แพงขึ้นแล้ว (ดู [[s9|บทที่ 9]])',
          mobile: 'stack',
        },
      ],
    },
  ],

  // Static s12 lines 1773–1787
  s12: [
    {
      blocks: [
        {
          kind: 'table',
          id: 's12-role-mindsets',
          title: 'ตารางเทียบมุมมองแต่ละบทบาท',
          columns: [
            { key: 'role', label: 'บทบาท', widthHint: 'narrow' },
            { key: 'focus', label: 'โฟกัสหลัก' },
            { key: 'done', label: 'นิยาม "เสร็จ"' },
            { key: 'ifWrong', label: 'ถ้าคิดผิด จะเกิดอะไร' },
          ],
          rows: [
            {
              cells: {
                role: '**PM**',
                focus: 'อะไรควรทำก่อน และทำไมต้องทำตอนนี้ — ทั้งที่ยังไม่มีคำตอบชัดเจน',
                done: 'ตัดสินใจได้ว่าจะทำอะไร และจัดลำดับ backlog เสร็จ ไม่ใช่ระบบต้อง work จริง',
                ifWrong: 'เสียเวลา/ทรัพยากรไปกับสิ่งที่ไม่มีคนต้องการ แต่กว่าจะรู้ตัวก็ผ่านไปเป็นสัปดาห์หรือเดือน',
              },
            },
            {
              cells: {
                role: '**UX/UI**',
                focus: 'ทำให้ไอเดียของ PM จับต้องได้ ก่อนใครจะลงมือสร้างจริง',
                done: 'user ทดสอบ prototype แล้วใช้งานได้ตามที่ตั้งใจ พร้อม handoff ให้ทีม dev',
                ifWrong: 'ทีมสร้างของตาม design ที่ user จริงใช้ไม่เป็น ต้องแก้ทีหลังหลังลงทุนพัฒนาไปแล้ว',
              },
            },
            {
              cells: {
                role: '**BA**',
                focus: 'ทำ requirement ให้ชัดพอที่ทีมจะสร้างของถูกต้องตั้งแต่รอบแรก',
                done: 'stakeholder เซ็นรับ requirement/spec ตรงกับสิ่งที่ต้องการจริง ไม่ใช่แค่ "เขียนครบ"',
                ifWrong: 'ทีม dev สร้างของถูกต้องตาม spec เป๊ะ แต่ผิดจากความต้องการจริง ต้องทำใหม่ทั้งก้อน',
              },
            },
            {
              cells: {
                role: '**SA**',
                focus: 'วางโครงสร้างที่รองรับทั้งวันนี้และการเติบโตข้างหน้า โดยไม่ over-engineer',
                done: 'ทีม dev เข้าใจตรงกันว่าจะสร้างยังไง ไม่มีจุดกำกวมที่ต้องเดาเอง',
                ifWrong: 'ปัญหาโผล่ตอนระบบโตแล้ว แก้ยากกว่าตอนเริ่มมาก เพราะเปลี่ยน foundation ทีหลังแพงกว่าตอนวางแผน',
              },
            },
            {
              cells: {
                role: '**Engineer**',
                focus: 'โค้ดที่ทำงานถูกต้อง อ่านง่าย แก้ต่อได้ ไม่ใช่แค่ "รันผ่าน"',
                done: 'ผ่าน Definition of Done — code review ผ่าน, test ผ่าน, merge เข้า branch หลักแล้ว',
                ifWrong: 'bug หรือ tech debt สะสมเงียบๆ กระทบความเร็วของทีมทั้งหมดในระยะยาว',
              },
            },
            {
              cells: {
                role: '**QA**',
                focus: 'หาช่องที่ระบบจะพัง ก่อนที่ user จริงจะเป็นคนเจอมันเอง',
                done: 'ผ่านทุก test case ที่วางแผนไว้ รวมถึง UAT sign-off จาก stakeholder',
                ifWrong: 'พลาด edge case ที่ควรจับได้ตั้งแต่ในบ้าน แล้ว bug หลุดไปถึง production แทน',
              },
            },
            {
              cells: {
                role: '**DevOps**',
                focus: 'ทำให้การปล่อยของ "ทำซ้ำได้" และปลอดภัย ไม่ต้องพึ่งความจำของคนคนเดียว',
                done: 'ขึ้น production สำเร็จ มี monitoring ครบ และ rollback ได้ทันทีถ้าพัง',
                ifWrong: 'production ล่ม กระทบ user จริงตรงๆ ทันที ไม่มีขั้นตอนกันชนเหมือนช่วงก่อนหน้านี้แล้ว',
              },
            },
          ],
          mobile: 'stack',
        },
        {
          kind: 'note',
          id: 's12-role-mindsets-note',
          tone: 'ok',
          body:
            '**สิ่งที่ทำให้สองฝั่งคุยกันรู้เรื่องขึ้น** — ไม่ใช่การให้ทุกคนมี mindset เดียวกัน (เป็นไปไม่ได้ และไม่ควรด้วย) แต่คือการรู้ว่าตอนนี้กำลังคุยกับใครที่อยู่จุดไหนของเส้นนี้ แล้วปรับคำถาม/ความคาดหวังให้ตรงจุด — ถามฝั่งซ้ายด้วยคำถามที่ต้องการคำตอบตายตัว หรือถามฝั่งขวาด้วยคำถามที่ยังไม่มีข้อมูลพอ ล้วนจบด้วยความหงุดหงิดทั้งคู่',
        },
      ],
    },
  ],

  // Static s13 lines 1796–1821
  s13: [
    {
      blocks: [
        {
          kind: 'note',
          id: 's13-ai-trend-caveat',
          tone: 'warn',
          body:
            'คอลัมน์ขวาเป็น **แนวโน้มตามรายงานปี 2026** (Gartner, McKinsey, PwC) ซึ่งบางส่วนมาจากผู้ขายเครื่องมือหรือที่ปรึกษาที่มีส่วนได้เสียกับเรื่องนี้ ถือเป็นทิศทาง ไม่ใช่ข้อเท็จจริงที่ยืนยันแล้วสำหรับทุกองค์กร',
        },
        {
          kind: 'table',
          id: 's13-ai-trends',
          title: 'เทียบงานเดิม vs แนวโน้ม AI ต่อบทบาท',
          columns: [
            { key: 'role', label: 'บทบาท', widthHint: 'narrow' },
            { key: 'before', label: 'งานเดิม (ก่อน AI)' },
            { key: 'trend', label: 'แนวโน้ม AI (2026 เป็นต้นไป)', widthHint: 'wide' },
          ],
          rows: [
            {
              cells: {
                role: '**PM**',
                before: 'อ่าน feedback/data ทีละแหล่ง สรุป requirement เอง',
                trend: 'ใช้ AI สังเคราะห์ requirement จากหลายแหล่งพร้อมกันได้เร็วขึ้นมาก แต่ยังต้อง own priority/tradeoff เอง — AI ไม่ตัดสินใจแทน',
              },
            },
            {
              cells: {
                role: '**UX/UI**',
                before: 'ทำ wireframe/mockup ทีละเวอร์ชันด้วยมือ',
                trend: 'AI generate ตัวเลือก design ได้เร็วขึ้น แต่ usability testing กับ user จริงยังเป็นงานที่ต้องใช้คนตัดสิน',
              },
            },
            {
              cells: {
                role: '**BA**',
                before: 'เขียน spec ให้ "คนอ่านแล้วเข้าใจ"',
                trend: 'spec กลายเป็นสิ่งที่ AI agent ต้องอ่านแล้วทำงานถูกด้วย — ต้องเขียน acceptance criteria ให้ชัดและ precise ขึ้นกว่าเดิมมาก',
              },
            },
            {
              cells: {
                role: '**SA**',
                before: 'ออกแบบ architecture คนเดียวหรือทีมเล็ก',
                trend: 'รายงานหลายฉบับมองว่าเป็นจุดที่ AI ยังอ่อนกว่างานอื่น (system design, ตัดสินใจ tradeoff ระยะยาว) — role นี้จึงสำคัญขึ้น ไม่ใช่ลดลง โดยเฉพาะงาน flag ความขัดแย้งก่อนใครเริ่มเขียนโค้ด',
              },
            },
            {
              cells: {
                role: '**Engineer**',
                before: 'เขียนโค้ดเองทุกบรรทัด',
                trend: 'ใช้เวลาไปกับการ orchestrate/review โค้ดที่ AI generate มากกว่าพิมพ์เอง โฟกัสย้ายไปที่ code quality และผลลัพธ์ทาง business แทน',
              },
            },
            {
              cells: {
                role: '**QA**',
                before: 'เขียนและรัน test case เองทีละเคส',
                trend: 'AI generate test case จากโค้ด/spec ให้ ส่วนคนโฟกัสไปที่ออกแบบ quality strategy ว่าควรเทสอะไรและเทสแค่ไหนถึงพอ',
              },
            },
            {
              cells: {
                role: '**DevOps**',
                before: 'ตั้งค่า pipeline, deploy, monitor ด้วยมือเป็นส่วนใหญ่',
                trend: 'CI/CD หลายองค์กรที่โตแล้ว automate ไปได้มาก รวม env config, pre-deploy check, rollback — งานคนเหลือที่ policy/governance มากกว่าลงมือกดปุ่มเอง',
              },
            },
            {
              cells: {
                role: '**Support**',
                before: 'ตอบ ticket ทุกใบเอง ไล่ severity ด้วยมือ',
                trend: 'AI ช่วย triage และตอบคำถามซ้ำๆ ก่อน เหลือให้คนโฟกัส case ที่กำกวมหรือกระทบหนักจริงๆ',
              },
            },
          ],
          mobile: 'stack',
        },
        {
          kind: 'sources',
          id: 's13-sources',
          title: 'สรุปแหล่งอ้างอิงและข้อจำกัดของบทนี้',
          items: [
            { label: 'Gartner — Software Engineering 2030' },
            { label: 'Gartner — Predicts 2026' },
            { label: 'McKinsey' },
            { label: 'PwC — Agentic SDLC' },
          ],
          caveat:
            'เนื้อหาในบทนี้สรุปจากรายงานของ Gartner (Software Engineering 2030, Predicts 2026), McKinsey, PwC (Agentic SDLC) และรายงานอุตสาหกรรมอื่นๆ ที่เผยแพร่ในปี 2026 ข้อควรระวัง: ตัวเลขและ % ในรายงานเหล่านี้มาจากบริบทองค์กรต่างประเทศเป็นหลัก อาจไม่สะท้อนความเร็วของการนำ AI มาใช้ในทุกองค์กรหรือทุกอุตสาหกรรมเท่ากัน และเทคโนโลยีฝั่งนี้เปลี่ยนเร็ว — สิ่งที่เขียนไว้ตอนนี้อาจล้าสมัยเร็วกว่าบทอื่นในเล่มนี้มาก',
        },
      ],
    },
  ],

  // Static s14 lines 1829–1874 (placed in React s14 per owner decision Q3)
  s14: [
    {
      heading: 'คู่คำสับสนและเส้นทางข้ามฝั่ง',
      blocks: [
        {
          kind: 'table',
          id: 's14-confusing-pairs',
          title: 'คู่คำที่ฟังคล้ายกันแต่คนละเรื่อง',
          intro:
            'จุดที่คนสะดุดจริงมักไม่ใช่ศัพท์เดี่ยวๆ แต่คือคู่คำที่ฟังคล้ายกันจนใช้สลับกันมั่ว แล้วคุยกันคนละเรื่องโดยไม่รู้ตัว',
          columns: [
            { key: 'pair', label: 'คู่ที่มักสับสน', widthHint: 'narrow' },
            { key: 'difference', label: 'ต่างกันตรงไหน', widthHint: 'wide' },
            { key: 'analogy', label: 'เทียบแบบบ้านๆ' },
          ],
          rows: [
            {
              cells: {
                pair: '**PM** vs **PjM**',
                difference: 'Product Manager ตัดสินใจว่า จะทำอะไร ทำไม / Project Manager ดูว่า จะทำให้เสร็จทันได้ยังไง',
                analogy: 'คนเลือกว่าจะไปเที่ยวที่ไหน กับคนวางแผนการเดินทางให้ไปถึง',
              },
            },
            {
              cells: {
                pair: '**PRD** vs **BRD** vs **SOW**',
                difference: 'PRD = โน้ตภายในว่าจะสร้างอะไร / BRD = คำบรรยาย requirement ละเอียด / SOW = ข้อตกลงที่ผูกพัน แก้ทีหลังต้องขออนุมัติ',
                analogy: 'ไอเดียในหัว → แบบบ้านที่วาดละเอียด → สัญญาจ้างที่เซ็นกับผู้รับเหมา',
              },
            },
            {
              cells: {
                pair: '**Functional** vs **Non-functional**',
                difference: 'ทำอะไรได้ vs ทำได้ดีแค่ไหน / ปลอดภัยแค่ไหน / เร็วแค่ไหน',
                analogy: 'เมนูอาหาร vs ความสะอาดกับความเร็วในการเสิร์ฟ',
              },
            },
            {
              cells: {
                pair: '**User story** vs **Use case**',
                difference: 'User story = โน้ตสั้นบอกความต้องการ (ฝั่ง requirement) / Use case = รายการว่า actor ทำอะไรกับระบบได้บ้าง (ฝั่ง design)',
                analogy: 'โพสต์อิทว่า "อยากมีที่เก็บรองเท้า" vs ผังบ้านที่ระบุว่าตู้รองเท้าอยู่ตรงไหน',
              },
            },
            {
              cells: {
                pair: '**Use case** vs **Sequence**',
                difference: 'ทั้งคู่พูดเรื่องพฤติกรรม แต่ use case แค่ลิสต์ว่ามีสถานการณ์อะไรบ้าง / sequence ลงรายละเอียดลำดับเวลาในสถานการณ์นั้น',
                analogy: 'รายชื่อฉากในหนัง vs สคริปต์ทีละช็อตของฉากหนึ่ง',
              },
            },
            {
              cells: {
                pair: '**Estimate** vs **Commitment**',
                difference: 'Estimate = การประมาณภายใต้ความไม่แน่นอน / Commitment = คำมั่นที่จะส่งของ ณ วันนั้น — ปัญหาเกิดเมื่อฝ่ายหนึ่งพูดอย่างแรก อีกฝ่ายได้ยินอย่างหลัง',
                analogy: '"น่าจะถึงประมาณบ่ายสอง" vs "นัดกันบ่ายสองนะ"',
              },
            },
            {
              cells: {
                pair: '**Scope creep** vs **Change request**',
                difference: 'เนื้องานที่เพิ่มเหมือนกัน ต่างกันแค่ว่า ผ่านการอนุมัติและปรับแผนแล้วหรือยัง',
                analogy: 'งานเพิ่มที่ไม่มีใครคิดราคา vs งานเพิ่มที่มีใบสั่งงาน',
              },
            },
            {
              cells: {
                pair: '**Tech debt** vs **Over-engineering**',
                difference: 'ทำน้อยไปจนต้องกลับมาแก้ vs ทำเผื่อมากเกินจนเสียเวลาเปล่า — เป็นความผิดพลาดคนละทิศที่ทั้งสองฝ่ายควรรู้ว่ามีทั้งคู่',
                analogy: 'สร้างบ้านลวกๆ ต้องซ่อมทุกปี vs สร้างบ้านเผื่อลูก 5 คนทั้งที่ยังไม่แต่งงาน',
              },
            },
          ],
          mobile: 'stack',
        },
        {
          kind: 'table',
          id: 's14-frameworks',
          title: 'Framework/certification อ้างอิงต่อ layer',
          columns: [
            { key: 'layer', label: 'Layer', widthHint: 'narrow' },
            { key: 'framework', label: 'Framework' },
            { key: 'summary', label: 'คำอธิบายสั้น', widthHint: 'wide' },
          ],
          rows: [
            {
              cells: {
                layer: 'BA',
                framework: 'BABOK',
                summary: 'Business Analysis Body of Knowledge — มาตรฐานกลางสาย BA, cert โดย IIBA',
              },
            },
            { cells: { layer: 'PjM', framework: 'PMBOK / PMP', summary: 'มาตรฐานสาย waterfall' } },
            { cells: { layer: 'PjM (agile)', framework: 'Scrum — CSM / PSM', summary: 'มาตรฐานสาย agile' } },
            { cells: { layer: 'SA/EA', framework: 'TOGAF', summary: 'framework งาน Enterprise Architecture' } },
            {
              cells: {
                layer: 'SA',
                framework: 'C4 Model',
                summary: '4 ระดับจากกว้างไปแคบ: Context → Container → Component → Code',
              },
            },
            {
              cells: {
                layer: 'SA',
                framework: 'UML',
                summary: 'ภาษาไดอะแกรมมาตรฐาน (use case, sequence, class ฯลฯ)',
              },
            },
            {
              cells: {
                layer: 'PM',
                framework: 'Jobs-to-be-Done, Lean Startup',
                summary: 'แนวคิดที่ใช้บ่อยฝั่ง product แต่ไม่มี cert เดียวที่ dominant',
              },
            },
          ],
          mobile: 'stack',
        },
        {
          kind: 'cards',
          id: 's14-career-eng-to-biz',
          title: 'เส้นทางข้ามฝั่ง — engineer อยากเข้าใจ business',
          cards: [
            {
              term: 'Engineer → Solution Architect',
              def: 'เส้นทางธรรมชาติที่สุด skill เทคนิคยกมาใช้ต่อตรงๆ สิ่งที่ต้องเพิ่มคือความกว้างแทนความลึก และการสื่อสาร trade-off ให้คนไม่ใช่ engineer เข้าใจได้',
            },
            {
              term: 'Engineer → Business Analyst',
              def: 'พบน้อยกว่า เหมาะกับคนที่ชอบ "แปล/สื่อสาร" มากกว่า "สร้าง" ต้องฝึก elicitation และการเขียนไม่กำกวม',
            },
            {
              term: 'Engineer → Product Manager',
              def: 'mindset เปลี่ยนมากที่สุด จาก reward ความถูกต้อง เป็น reward การตัดสินใจที่ดีพอภายใต้ข้อมูลไม่ครบ',
            },
          ],
        },
        {
          kind: 'cards',
          id: 's14-career-biz-to-tech',
          title: 'เส้นทางข้ามฝั่ง — business อยากเข้าใจ technical (ไม่ใช่การเรียน programming)',
          intro:
            'สิ่งที่ช่วยจริงไม่ใช่การเขียนโค้ดเป็น แต่คือ "technical literacy" — รู้พอจะคุยกับ engineer ได้ตรงจุด:',
          cards: [
            {
              term: 'อ่านไดอะแกรม level 1-2 ของ C4 ออก',
              def: 'พอจะเข้าใจว่าระบบมีชิ้นส่วนอะไรบ้าง ไม่ต้องรู้ว่าข้างในเขียนยังไง',
            },
            {
              term: 'รู้จักคำว่า API, database, schema แบบ conceptual',
              def: 'พอจะเข้าใจว่าทำไม "แค่เพิ่มปุ่มเดียว" บางทีถึงต้องแก้หลายจุด',
            },
            {
              term: 'เข้าใจว่า estimate ไม่ใช่คำมั่นสัญญาตายตัว',
              def: 'เป็นการประมาณภายใต้ความไม่แน่นอน ไม่ใช่ราคาสินค้าที่ fix ได้เป๊ะ',
            },
            {
              term: 'นั่งฟัง sprint planning/stand-up บ้าง',
              def: 'ซึม vocabulary จากบริบทจริง เร็วกว่าอ่านทฤษฎีเปล่าๆ',
            },
            {
              term: 'เขียน user story ร่วมกับ engineer สักครั้ง',
              def: 'ฝึกแปล "อยากได้อะไร" ให้เป็น requirement ที่ไม่กำกวมด้วยตัวเอง จะเห็นจุดกำกวมที่ตัวเองมองไม่เห็นตอนพูดปากเปล่า',
            },
          ],
        },
      ],
    },
  ],
};
