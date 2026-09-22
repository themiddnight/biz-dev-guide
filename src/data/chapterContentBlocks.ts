import { ChapterContentSection } from '../types';

/**
 * Reference content restored from the static guide
 * (`biz-dev-guide-static/index.html`), keyed by React chapter id.
 * Text uses the RichText subset: `**bold**`, `\n`, `[[sN|label]]`.
 */
export const CHAPTER_CONTENT: Record<string, ChapterContentSection[]> = {
  // Static s1 line 359 (fig 1) and 423; static s9 fig 7 (lines 1363–1423), placed here because React s1 is the pipeline chapter
  s1: [
    {
      // Inline after core concept 2 "งานรั่วตรงไหนบ้างตอนเปลี่ยนมือ" (figure briefs s1)
      placement: 'inline',
      after: 'coreConcepts',
      conceptIndex: 1,
      blocks: [
        {
          kind: 'figure',
          id: 's1-translation-layers',
          figureKey: 'translation-layers',
          title: 'ความคิดหนึ่งประโยค ผ่านการแปลกี่ชั้นกว่าจะเป็นโค้ด',
          caption:
            'วงกลมสีเหลืองคือรอยต่อระหว่างชั้น — เอกสารทุกชนิดในคู่มือนี้มีไว้อุดรอยพวกนี้ ไม่ใช่เพื่อความสวยงาม',
        },
      ],
    },
    {
      blocks: [
        {
          kind: 'note',
          id: 's1-pm-vs-pjm',
          tone: 'warn',
          body:
            '**PM vs PjM** — คำว่า "PM" กำกวมมาก มีสองความหมาย: **Product Manager** (ตัดสินใจว่าจะสร้างอะไร เพื่อใคร ทำไม) กับ **Project Manager** (บริหาร timeline/ทรัพยากรให้ส่งของทันตามแผน) สองงานนี้คนละทักษะ คนละความรับผิดชอบ',
        },
        {
          kind: 'figure',
          id: 's1-gate-timeline',
          figureKey: 'gate-timeline',
          title: 'gate แต่ละจุด และต้นทุนของการเปลี่ยนใจที่ไต่ขึ้นเรื่อยๆ',
          caption:
            'gate ไม่ได้มีไว้ห้ามเปลี่ยน แต่มีไว้ทำให้เห็นว่าตอนนี้การเปลี่ยนมีราคาเท่าไหร่แล้ว — ทีมที่ไม่มี gate เลย การเปลี่ยนแปลงไม่ได้หายไป มันแค่กลายเป็นภาระเงียบๆ ของคนสร้าง',
        },
      ],
    },
  ],

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
            { key: 'deliverable', label: 'PM ส่ง', widthHint: 'wide' },
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

  // Static s5 lines 757–925 (T1 in the Diagram section; fig 4 inline after core concept 1; 5.2 and 5.3 in Reference)
  s5: [
    {
      placement: 'diagram',
      blocks: [
        {
          kind: 'table',
          id: 's5-diagram-types',
          title: 'ตารางอ้างอิง — ไดอะแกรมแต่ละชนิดใช้ตอนไหน อ่านโดยใคร',
          collapsed: true,
          columns: [
            { key: 'type', label: 'ชนิด' },
            { key: 'family', label: 'หมวด', widthHint: 'narrow' },
            { key: 'question', label: 'ตอบคำถามอะไร', widthHint: 'wide' },
            { key: 'reader', label: 'คนอ่านหลัก' },
          ],
          rows: [
            { cells: { type: 'C4 context (L1)', family: 'โครงสร้าง', question: 'ระบบเราไปแตะใครบ้าง', reader: 'ทุกคน รวมคนไม่เทคนิค' } },
            { cells: { type: 'C4 container (L2)', family: 'โครงสร้าง', question: 'ระบบประกอบด้วยส่วนที่รันแยกกันอะไรบ้าง', reader: 'คนเทคนิค' } },
            { cells: { type: 'Component / module map', family: 'โครงสร้าง', question: 'ข้างในส่วนหนึ่งมีก้อนย่อยอะไร', reader: 'architect · tech lead' } },
            { cells: { type: 'ERD', family: 'โครงสร้าง', question: 'ข้อมูลมีตารางอะไร เชื่อมกันด้วยอะไร', reader: 'dev · data analyst' } },
            { cells: { type: 'Use case', family: 'พฤติกรรม', question: 'ใครทำอะไรกับระบบได้บ้าง', reader: 'BA · QA · business' } },
            { cells: { type: 'Sequence', family: 'พฤติกรรม', question: 'ใน 1 สถานการณ์ ใครเรียกใครตามลำดับไหน', reader: 'dev · QA' } },
            { cells: { type: 'State machine', family: 'พฤติกรรม', question: 'สิ่งหนึ่งมีสถานะอะไรได้บ้าง เปลี่ยนเมื่อไหร่', reader: 'dev · BA' } },
            { cells: { type: 'User flow', family: 'พฤติกรรม', question: 'ผู้ใช้เดินผ่านหน้าจอไหนบ้างกว่าจะถึงเป้าหมาย', reader: 'designer · PM' } },
            { cells: { type: 'Swimlane / BPMN', family: 'กระบวนการ', question: 'งานส่งต่อระหว่างคน/แผนกยังไง อนุมัติตรงไหน', reader: 'business · ops' } },
            { cells: { type: 'Customer journey map', family: 'กระบวนการ', question: 'ลูกค้ารู้สึกยังไงในแต่ละช่วงของการใช้บริการ', reader: 'PM · marketing · designer' } },
            { cells: { type: 'Wireframe / mockup', family: 'หน้าจอ', question: 'หน้าตาและตำแหน่งของสิ่งต่างๆ บนจอ', reader: 'ทุกคน' } },
            { cells: { type: 'Mind map / affinity', family: 'จัดระเบียบความคิด', question: 'ไอเดียดิบๆ จัดกลุ่มได้ยังไง', reader: 'ทีมตอน workshop' } },
            { cells: { type: 'Gantt / roadmap', family: 'แผนและเวลา', question: 'งานไหนทำก่อนหลัง เสร็จเมื่อไหร่', reader: 'PjM · ผู้บริหาร' } },
            { cells: { type: 'Dependency graph', family: 'แผนและเวลา', question: 'อะไรต้องเสร็จก่อนอะไรถึงเริ่มได้', reader: 'architect · PjM' } },
          ],
          footnote: 'ไม่ต้องรู้จักครบทุกชนิด — ในการทำงานจริงส่วนใหญ่ใช้ซ้ำๆ อยู่ 3-4 ชนิดเท่านั้น ตารางนี้มีไว้ให้เปิดดูตอนไปเจอชื่อที่ไม่คุ้นในที่ประชุม',
          mobile: 'stack',
        },
      ],
    },
    {
      // Inline after core concept 1 "C4 Model ทั้ง 4 ระดับ" (figure briefs s5)
      placement: 'inline',
      after: 'coreConcepts',
      conceptIndex: 0,
      blocks: [
        {
          kind: 'figure',
          id: 's5-three-lenses',
          figureKey: 'three-lenses',
          title: 'ระบบเดียวกัน มองด้วยเลนส์สามแบบ ได้คนละภาพ',
          caption: 'สองมุมแรกบอกว่า "มีอะไรอยู่" มุมที่สามเท่านั้นที่บอกเรื่อง "เวลา" — ระบบที่มีชิ้นส่วนครบทุกอย่างยังพังได้ ถ้าลำดับการเรียกผิด',
        },
      ],
    },
    {
      heading: '5.2 สามมุมมองที่ใช้ในงาน solution design',
      blocks: [
        {
          kind: 'table',
          id: 's5-three-views',
          columns: [
            { key: 'doc', label: 'เอกสาร' },
            { key: 'question', label: 'ตอบคำถามว่า', widthHint: 'wide' },
            { key: 'reader', label: 'ผู้อ่านหลัก' },
          ],
          rows: [
            { cells: { doc: '**High-level solution**\nSystem context / C4 level 1', question: 'ขอบเขตระบบอยู่ตรงไหน ใคร/อะไรแตะมันบ้าง', reader: 'ผู้บริหาร ลูกค้าที่ไม่สนใจรายละเอียด' } },
            { cells: { doc: '**Module + function mapping**\nStatic structure', question: 'ข้างในมีความสามารถอะไรบ้าง แต่ละก้อนพึ่งพากันยังไง', reader: 'Architect / tech lead แบ่งงาน ประเมินเวลา' } },
            { cells: { doc: '**Use case / sequence diagram**\nDynamic behavior', question: 'สถานการณ์จริงหนึ่งอันไหลผ่านระบบยังไงตามลำดับเวลา', reader: 'Developer ที่ implement, QA ที่เขียน test case' } },
          ],
          footnote: 'ในตัวอย่างแอปสั่งอาหาร: high-level solution บอกว่ามี "ลูกค้า" "ร้านค้า" "rider" เป็น actor และเชื่อมกับ payment gateway/maps API ภายนอก, module mapping แจกแจงว่ามี module อย่าง Cart, Order, Payment, Rider matching, Notification และแต่ละอันเชื่อมกันยังไง, ส่วน sequence diagram ลงรายละเอียด scenario เช่น "ร้านปิดกะทันหันหลังลูกค้าสั่งไปแล้ว" ว่าระบบจัดการยังไงทีละสเต็ป',
          mobile: 'stack',
        },
        {
          kind: 'note',
          id: 's5-sequence-note',
          tone: 'info',
          body: 'Use case diagram เองก็ยังตอบเรื่อง "เวลา/ลำดับ" ไม่ได้ ต้องเป็น **sequence diagram** โดยเฉพาะถึงจะเห็น step ที่ระบบ "รอ (async)" ก่อนไปสเต็ปถัดไป',
        },
        {
          kind: 'details',
          id: 's5-nfr-sequence',
          summary: 'ตัวอย่างการต่อจุด: NFR ไปโผล่ใน sequence diagram ได้ยังไง',
          body: [
            {
              kind: 'note',
              id: 's5-nfr-sequence-steps',
              tone: 'info',
              body: 'สมมติมี NFR ว่า "ร้านต้องกดรับออเดอร์ภายใน 2 นาที ถ้าเกินต้องเสนอร้านอื่น" ไม่ได้ก๊อบตัวเลขนี้ไปแปะทุกที่ แต่ "โยง" กันไว้:\n1. เกิดตอน elicit → เก็บเป็น NFR แยกจาก feature list\n2. traceability โยง NFR ไปหา mechanism ที่รองรับ (เช่น timeout/re-route logic ใน order module)\n3. sequence diagram ปัก annotation สั้นๆ ตรง arrow ที่รอ เช่น "async wait — ref NFR ร้านรับออเดอร์" ไม่ก๊อบเนื้อหาเต็ม\n4. engineer ตามรอย reference กลับไปหาตัวเลขจริงมาใส่ config\n\nหลักการเดียวกับ DRY ในโค้ด — แก้ตัวเลขที่เดียว ไม่ต้องไล่แก้ทุกไดอะแกรมที่อ้างถึง',
            },
          ],
        },
      ],
    },
    {
      heading: '5.3 มาตรฐานการวาดไดอะแกรมที่เจอบ่อย',
      blocks: [
        {
          kind: 'table',
          id: 's5-standards',
          columns: [
            { key: 'standard', label: 'มาตรฐาน', widthHint: 'narrow' },
            { key: 'owner', label: 'ดูแลโดย' },
            { key: 'use', label: 'ใช้ทำอะไร' },
            { key: 'examples', label: 'ตัวอย่างไดอะแกรม' },
          ],
          rows: [
            { cells: { standard: '**UML**', owner: 'OMG', use: 'โครงสร้าง + พฤติกรรมของซอฟต์แวร์', examples: 'Class, Component, Use case, Sequence, Activity, State machine' } },
            { cells: { standard: '**C4 Model**', owner: 'Simon Brown (อิสระ ไม่ใช่ OMG)', use: 'ภาพรวมสถาปัตยกรรมแบบซูมทีละระดับ เบากว่า UML', examples: 'Context, Container, Component, Code' } },
            { cells: { standard: '**BPMN**', owner: 'OMG', use: 'กระบวนการทางธุรกิจข้ามแผนก/บทบาท', examples: 'Swimlane / cross-functional flowchart' } },
          ],
          mobile: 'stack',
        },
        {
          kind: 'note',
          id: 's5-standards-note',
          tone: 'info',
          body: 'UML กับ BPMN ดูแลโดยองค์กรเดียวกัน (OMG) แต่คนละจุดเน้น — UML มองจากมุมซอฟต์แวร์ BPMN มองจากมุม process ธุรกิจ ส่วน C4 เป็น convention ที่ได้รับความนิยมจนกลายเป็นมาตรฐานที่ใช้กันจริง แม้ไม่ใช่มาตรฐานทางการของ OMG',
        },
      ],
    },
  ],

  // Static s6 lines 1136–1164
  s6: [
    {
      blocks: [
        {
          kind: 'cards',
          id: 's6-engineer-docs',
          title: 'เอกสารที่ engineer เขียนก่อนลงมือ',
          intro:
            'SA ส่ง solution design ที่ตอบว่า "ระบบจะมีหน้าตาแบบไหน" แต่ยังไม่ได้ตอบทุกรายละเอียดว่า "จะ implement ยังไงให้รอดในโค้ดจริง" engineer จึงต้องมีขั้นตอนคิดต่อและ "เขียนลง" ก่อนลงมือ เพราะการตัดสินใจที่อยู่แค่ในหัวใครคนหนึ่งจะหายไปเมื่อเขาลืม และคนอื่นในทีม (รวมถึงตัวเขาเองในอีก 6 เดือนข้างหน้า) จะไม่มีทางรู้ว่าทำไมถึงเลือกทางนี้',
          cards: [
            {
              term: 'Technical design doc',
              def: 'เอกสารอธิบายแผน implementation ของ feature หนึ่งชิ้น ก่อนเริ่มเขียนโค้ดจริง เพื่อให้เพื่อนร่วมทีม review แนวทางได้ก่อนที่จะสายเกินแก้\n**พูดแบบบ้านๆ** แบบแปลนก่อนสร้างบ้าน ให้ทุกคนดูก่อนว่าท่อน้ำจะเดินยังไง ไม่ใช่รู้ตอนผนังปิดไปแล้ว',
            },
            {
              term: 'ADR (Architecture Decision Record)',
              def: 'บันทึกสั้นๆ ว่าทำไมทีมถึงเลือกทางเทคนิคทางหนึ่ง แทนอีกทางที่เคยคิดไว้ พร้อมเหตุผลและสิ่งที่ยอมแลก (trade-off) — ดูลำดับชั้นเอกสารและตัวอย่าง ADR ได้ที่ [[s14|บทที่ 14]]\n**พูดแบบบ้านๆ** สมุดบันทึกเหตุผลตอนซื้อบ้าน — ทำไมเลือกหลังนี้ไม่ใช่อีกหลัง จะได้ไม่ต้องมานั่งเถียงซ้ำเมื่อคนใหม่เข้าทีมแล้วถามว่า "ทำไมไม่ทำแบบอื่น"',
            },
            {
              term: 'RFC (Request for Comments)',
              def: 'เอกสารเสนอแนวทางเทคนิคที่ยังไม่ได้ข้อสรุป เปิดให้ทีมเข้ามาถกและคอมเมนต์ก่อนตัดสินใจ ต่างจาก ADR ตรงที่ ADR คือบันทึกผลลัพธ์หลังตัดสินใจแล้ว\n**พูดแบบบ้านๆ** โยนร่างแผนให้เพื่อนช่วยติงก่อนลงมือ ไม่ใช่ทำเสร็จแล้วค่อยถามความเห็น',
            },
          ],
        },
        {
          kind: 'cards',
          id: 's6-branching',
          title: 'Branching strategy และ code review — ความเร็วที่แลกกับความปลอดภัย',
          intro:
            'เมื่อมีคนเขียนโค้ดพร้อมกันหลายคนในไฟล์เดียวกัน ต้องมีกติกาว่าใครเอาโค้ดของใครไปรวมเมื่อไหร่ นี่คือที่มาของ branching strategy สองแบบหลักที่คิดกันคนละขั้ว: trunk-based development เน้นรวมโค้ดเข้า branch หลักบ่อยๆ ชิ้นเล็กๆ เพื่อลดความเสี่ยงจากการรวมกันก้อนใหญ่ทีเดียว ส่วน git-flow เน้นแยก branch ตามหน้าที่ (feature, release, hotfix) ชัดเจน เหมาะกับทีมที่ release เป็นรอบใหญ่ไม่บ่อย\nส่วน Pull Request (PR) และ code review คือขั้นตอนที่คนอื่นในทีมอ่านโค้ดก่อนให้มันเข้า branch หลัก เหตุผลไม่ใช่แค่ "จับบั๊ก" แต่รวมถึงกระจายความรู้เรื่องระบบให้ไม่กระจุกอยู่ที่คนเดียว และรักษามาตรฐานโค้ดให้สม่ำเสมอ — แต่นี่คือจุดที่สร้างความตึงเครียดจริงในทีมด้วย เพราะ review ที่ละเอียดเกินไปทำให้ของช้าลง ส่วน review ที่หลวมเกินไปทำให้บั๊กหลุดไปที่ user จริง ทีมที่ดีต้องหาจุดสมดุลระหว่างสองฝั่งนี้ ไม่ใช่เลือกสุดโต่งข้างใดข้างหนึ่ง',
          cards: [
            {
              term: 'Trunk-based development',
              def: 'ทุกคน merge โค้ดกลับเข้า branch หลักบ่อยๆ (มักเป็นรายวัน) รวมโค้ดแต่ละรอบจะได้ชนกันน้อยลง\n**พูดแบบบ้านๆ** ล้างจานทันทีหลังใช้ทีละใบ ดีกว่าปล่อยกองไว้แล้วมาล้างทีเดียวตอนจานเต็มอ่าง',
            },
            {
              term: 'Git-flow',
              def: 'แยก branch ตามหน้าที่ชัดเจน (feature/release/hotfix) เหมาะกับ release cycle ที่วางแผนล่วงหน้าเป็นรอบใหญ่\n**พูดแบบบ้านๆ** แยกลิ้นชักเก็บของตามหมวดชัดเจน เหมาะกับของที่หยิบใช้เป็นรอบๆ ไม่ใช่ทุกวัน',
            },
            {
              term: 'Pull Request (PR) / Code review',
              def: 'ขั้นตอนเสนอโค้ดที่เขียนเสร็จให้เพื่อนร่วมทีมอ่านและอนุมัติ ก่อนรวมเข้า branch หลัก\n**พูดแบบบ้านๆ** ให้เพื่อนช่วยตรวจงานก่อนส่งอาจารย์ ไม่ใช่ส่งตรงจากที่เขียนคนเดียว',
            },
          ],
        },
        {
          kind: 'note',
          id: 's6-pair-programming',
          tone: 'info',
          title: 'Pair programming',
          body:
            'บางทีมให้ engineer สองคนนั่งเขียนโค้ดชิ้นเดียวกันพร้อมกัน คนหนึ่งพิมพ์ อีกคนคอยดูและคิดภาพรวม สลับกันเป็นระยะ วิธีนี้แลกความเร็วระยะสั้นกับคุณภาพและการกระจายความรู้ที่ดีขึ้น มักใช้กับงานที่ซับซ้อนหรือมีความเสี่ยงสูง มากกว่าใช้ทุกงาน',
        },
      ],
    },
  ],

  // Static s8 fig 6, lines 1264–1296
  s8: [
    {
      blocks: [
        {
          kind: 'figure',
          id: 's8-env-flow',
          figureKey: 'env-flow',
          title: 'การไหลของโค้ดผ่าน environment แต่ละชุดก่อนถึง user จริง',
          caption:
            'โค้ดไม่ได้กระโดดจาก dev ไป production ตรงๆ แต่ไล่ผ่านแต่ละ environment ทีละขั้น เพื่อให้จับปัญหาได้ก่อนถึงมือ user จริง',
        },
      ],
    },
  ],

  // Static s12 fig 10 (lines 1725–1770) and lines 1773–1787
  s12: [
    {
      blocks: [
        {
          kind: 'figure',
          id: 's12-uncertainty-spectrum',
          figureKey: 'uncertainty-spectrum',
          title: 'จากเดิมพันด้วยข้อมูลไม่ครบ ไปจนถึงทำซ้ำได้แม่นยำ',
          caption:
            'ตำแหน่งบนเส้นนี้ไม่ได้บอกว่าใครสำคัญกว่าใคร แต่บอกว่าแต่ละคน "ควรทนความไม่แน่นอน" ได้มากแค่ไหนถึงจะทำงานได้ดี — เอาเกณฑ์ของฝั่งหนึ่งไปวัดอีกฝั่งจึงมักออกมาเป็นความขัดแย้ง',
        },
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
            '**สิ่งที่ทำให้สองฝั่งคุยกันรู้เรื่องขึ้น** — ไม่ใช่การให้ทุกคนมี mindset เดียวกัน (เป็นไปไม่ได้ และไม่ควรด้วย) แต่คือการรู้ว่าตอนนี้กำลังคุยกับใครที่อยู่จุดไหนของเส้นนี้ แล้วปรับคำถาม/ความคาดหวังให้ตรงจุด — ถามฝั่งซ้ายด้วยคำถามที่ต้องการคำตอบตายตัว หรือถามฝั่งขวาด้วยคำถามที่ยังไม่มีข้อมูลพอ ก็จบที่หงุดหงิดทั้งคู่',
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
                trend: 'ใช้ AI รวบ requirement จากหลายแหล่งพร้อมกันได้เร็วขึ้นมาก แต่ยังต้อง own priority/tradeoff เอง — AI ไม่ตัดสินใจแทน',
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
                difference: 'Estimate = การกะเวลาตอนที่ยังไม่รู้ครบ / Commitment = สัญญาว่าจะส่งของวันนั้น — ปัญหาเกิดเมื่อฝ่ายหนึ่งพูดอย่างแรก อีกฝ่ายได้ยินอย่างหลัง',
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
              def: 'ทางที่ไปต่อง่ายที่สุด skill เทคนิคยกมาใช้ต่อตรงๆ สิ่งที่ต้องเพิ่มคือความกว้างแทนความลึก และการสื่อสาร trade-off ให้คนไม่ใช่ engineer เข้าใจได้',
            },
            {
              term: 'Engineer → Business Analyst',
              def: 'คนไปทางนี้น้อยกว่า เหมาะกับคนที่ชอบ "แปล/สื่อสาร" มากกว่า "สร้าง" ต้องฝึก elicitation และการเขียนไม่กำกวม',
            },
            {
              term: 'Engineer → Product Manager',
              def: 'mindset เปลี่ยนมากที่สุด จาก reward ความถูกต้อง เป็น reward การตัดสินใจที่ดีพอทั้งที่ข้อมูลไม่ครบ',
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
              term: 'เข้าใจว่า estimate ไม่ใช่คำสัญญาตายตัว',
              def: 'เป็นการกะเวลาตอนที่ยังไม่รู้ครบ ไม่ใช่ราคาสินค้าที่ fix ได้เป๊ะ',
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
  // Role-perspective spec P4.1: the #A1024 refund as a P&L, right after the s16 primer
  s16: [
    {
      placement: 'inline',
      after: 'primer',
      blocks: [
        {
          kind: 'table',
          id: 's16-refund-pnl',
          title: 'หูฟัง #A1024 หนึ่งออเดอร์ ร้านเหลือเงินเท่าไร',
          intro:
            'ออเดอร์ #A1024 หูฟังไร้สาย ราคา ฿1,290 เทียบสามกรณี: ขายปกติ, คืนเงินแล้วได้ของกลับมาขายต่อ และคืนเงินโดยไม่ได้ของคืน (กรณีบั๊กที่เปิดให้คืนเงินทั้งที่ของส่งถึงแล้ว) **ตัวเลขสมมติ**',
          columns: [
            { key: 'item', label: 'รายการ', widthHint: 'wide' },
            { key: 'sale', label: 'ขายปกติ', widthHint: 'narrow' },
            { key: 'returned', label: 'คืนเงิน ได้ของคืน', widthHint: 'narrow' },
            { key: 'lost', label: 'คืนเงิน ไม่ได้ของคืน', widthHint: 'narrow' },
          ],
          rows: [
            { cells: { item: 'รายได้ (ลูกค้าจ่าย)', sale: '+฿1,290', returned: '฿0 (คืนลูกค้าแล้ว)', lost: '฿0 (คืนลูกค้าแล้ว)' } },
            { cells: { item: 'ทุนสินค้า', sale: '−฿780', returned: '฿0 (ของกลับเข้าสต็อก)', lost: '−฿780' } },
            { cells: { item: 'ค่าส่งไปหาลูกค้า', sale: '−฿50', returned: '−฿50', lost: '−฿50' } },
            { cells: { item: 'ค่าส่งของกลับ', sale: '—', returned: '−฿50', lost: '—' } },
            { cells: { item: 'ค่าธรรมเนียมรับชำระ 3% (ผู้ให้บริการส่วนใหญ่ไม่คืนเมื่อคืนเงิน)', sale: '−฿39', returned: '−฿39', lost: '−฿39' } },
            { cells: { item: 'เวลาแอดมินตรวจเคส', sale: '—', returned: '−฿30', lost: '−฿30' } },
            { cells: { item: '**เหลือต่อออเดอร์**', sale: '**+฿421**', returned: '**−฿169**', lost: '**−฿899**' } },
          ],
          footnote:
            'กำไรขั้นต้นของขายปกติคือ ฿1,290 − ฿780 = ฿510 (ราว 40%) แต่หลังหักค่าส่งและค่าธรรมเนียมเหลือ ฿421 คืนเงินหนึ่งเคสที่ไม่ได้ของคืน ต้องขายปกติเกิน 2 ออเดอร์ถึงจะได้เงินกลับมา นี่คือเหตุผลที่บั๊กคืนเงินใน [[s1|บทที่ 1]] แพงกว่าที่เห็น **ตัวเลขสมมติ**',
          mobile: 'stack',
        },
      ],
    },
  ],
};

/**
 * Static s5 lines 1091–1103: table T4 and the quick-pick tip, rendered inside
 * `SwimlaneVsSequence` (Diagram section) rather than through `CHAPTER_CONTENT`.
 */
export const S5_SWIMLANE_SEQUENCE_BLOCKS: ChapterContentSection[] = [
  {
    placement: 'diagram',
    blocks: [
      {
        kind: 'table',
        id: 's5-swimlane-vs-sequence-table',
        columns: [
          { key: 'aspect', label: '', widthHint: 'narrow' },
          { key: 'swimlane', label: 'Swimlane' },
          { key: 'sequence', label: 'Sequence' },
        ],
        rows: [
          { cells: { aspect: 'จัดตาม', swimlane: 'ผู้รับผิดชอบ (คน/แผนก/ระบบ)', sequence: 'ผู้เกี่ยวข้อง + เวลาที่ไหลลงล่าง' } },
          { cells: { aspect: 'เน้น', swimlane: 'การส่งต่องาน จุดอนุมัติ ทางแยกตัดสินใจ', sequence: 'ลำดับการเรียก การตอบกลับ และการรอ' } },
          { cells: { aspect: 'เหมาะกับ', swimlane: 'งานที่มีคนทำเอง มีหลายแผนกเกี่ยวข้อง', sequence: 'ระบบคุยกับระบบ หรือ flow ที่ลำดับสำคัญมาก' } },
          { cells: { aspect: 'คนอ่านหลัก', swimlane: 'business · ops · ผู้บริหาร', sequence: 'developer · QA' } },
          { cells: { aspect: 'มาตรฐาน', swimlane: 'BPMN', sequence: 'UML' } },
        ],
        mobile: 'scroll',
      },
      {
        kind: 'note',
        id: 's5-swimlane-vs-sequence-tip',
        tone: 'ok',
        body: '**วิธีเลือกแบบเร็วๆ** — ถ้าคำถามที่ต้องตอบขึ้นต้นด้วย "ใครเป็นคนทำขั้นนี้" ให้ใช้ swimlane / ถ้าขึ้นต้นด้วย "แล้วเกิดอะไรต่อ" หรือ "ตรงนี้รออะไรอยู่" ให้ใช้ sequence — และถ้าเป็นการคุยกับฝั่ง business ที่ยังไม่คุ้นสัญลักษณ์ swimlane มักเป็นจุดเริ่มที่ปลอดภัยกว่า เพราะกล่องกับลูกศรอ่านเข้าใจง่ายกว่า',
      },
    ],
  },
];
