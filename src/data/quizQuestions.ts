import { QuizQuestion } from '../types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    category: 'Product Management',
    role: 'PM',
    scenario: 'บริษัทกำลังเตรียมเปิดตัวแอปส่งของรอบแรกใน 3 เดือน มีคนในทีมบอกว่า "เราเป็น PM เหมือนกัน ช่วยดู timeline ให้หน่อยว่า developer คนไหนว่างบ้าง"',
    question: 'บทบาทของ Product Manager (PM) และ Project Manager (PjM) แตกต่างกันอย่างไรในทางปฏิบัติ?',
    options: [
      {
        text: 'เหมือนกันทุกประการ เพียงแต่บริษัทต่างประเทศเรียกย่อไม่เหมือนกัน',
        isCorrect: false,
        explanation: 'ไม่เหมือนกันเลย เป็นงานคนละทักษะและคนละชุดเป้าหมาย',
      },
      {
        text: 'PM ตัดสินใจว่า "ควรสร้างอะไร เพื่อใคร และทำไม" ส่วน PjM บริหารเวลา คน และทรัพยากรเพื่อให้งานเสร็จตามแผน',
        isCorrect: true,
        explanation: 'ถูกต้อง! PM โฟกัส What & Why (คุณค่าทางธุรกิจ/ผู้ใช้) ส่วน PjM โฟกัส How & When (การจัดส่งงานและ timeline)',
      },
      {
        text: 'PM มีหน้าที่เขียนโค้ด ส่วน PjM มีหน้าที่พูดคุยกับลูกค้าอย่างเดียว',
        isCorrect: false,
        explanation: 'ทั้งสองบทบาทไม่ได้มีหน้าที่หลักในการเขียนโปรแกรม',
      },
      {
        text: 'PjM มีอำนาจตัดสินใจเหนือกว่า PM เสมอในทุกเรื่องของผลิตภัณฑ์',
        isCorrect: false,
        explanation: 'PM เป็นเจ้าของ Product Backlog และคุณค่าของผลิตภัณฑ์ ส่วน PjM คุม Delivery Discipline คู่ขนานกัน',
      },
    ],
    xp: 25,
  },
  {
    id: 2,
    category: 'Requirement Analysis',
    role: 'BA',
    scenario: 'ลูกค้าบอกว่า "อยากให้ระบบสามารถกดยกเลิกออเดอร์ได้ และระบบต้องกดยืนยันเสร็จภายใน 2 วินาที รองรับคนใช้พร้อมกัน 5,000 คน"',
    question: 'ข้อใดคือตัวอย่างของ Non-Functional Requirement (NFR) จากสถานการณ์นี้?',
    options: [
      {
        text: 'ลูกค้าสามารถกดยกเลิกออเดอร์ได้',
        isCorrect: false,
        explanation: 'นี่คือ Functional Requirement (สิ่งที่ระบบต้องทำได้ / capability)',
      },
      {
        text: 'ต้องยืนยันเสร็จภายใน 2 วินาที และรองรับ 5,000 คนพร้อมกัน',
        isCorrect: true,
        explanation: 'ถูกต้อง! NFR คือเงื่อนไขคุณภาพ (Performance & Scalability) ที่แปะอยู่กับฟังก์ชัน ไม่ใช่ตัวฟังก์ชันเอง',
      },
      {
        text: 'ลูกค้าต้องได้รับอีเมลแจ้งเตือน',
        isCorrect: false,
        explanation: 'นี่คือ Functional Requirement อีกข้อหนึ่ง',
      },
      {
        text: 'ลูกค้าต้องมีบัญชีสมาชิกก่อนเข้าใช้งาน',
        isCorrect: false,
        explanation: 'นี่คือ Business Rule / Functional Requirement',
      },
    ],
    xp: 25,
  },
  {
    id: 3,
    category: 'Engineering & Delivery',
    role: 'Dev',
    scenario: 'ผู้บริหารขอให้ "แค่เพิ่มปุ่มยกเลิกออเดอร์สีแดง 1 ปุ่มในหน้าสรุปรายการ" แต่ Developer แจ้งว่าต้องใช้เวลาประมาณ 1 สัปดาห์',
    question: 'อะไรคือสาเหตุที่งานที่ดูเหมือน "แค่ปุ่มเดียว" ถึงใช้เวลามากกว่าที่ตาเห็น?',
    options: [
      {
        text: 'Developer ขี้เกียจและต้องการประเมินเวลาให้เกินจริงไว้ก่อน',
        isCorrect: false,
        explanation: 'การมองว่าทีมจงใจอู้เป็นอคติที่ทำลายความสัมพันธ์ ความจริงมีงานใต้น้ำมหาศาล',
      },
      {
        text: 'ปุ่มเป็นแค่ 5% ของงาน ที่เหลือคือ Logic คืนเงิน ตัดสต็อก แจ้งเตือนร้านค้า/ไรเดอร์ และจัดการ Edge Cases เมื่อกดยกเลิกตอนสถานะเปลี่ยน',
        isCorrect: true,
        explanation: 'ถูกต้อง! ปุ่มคือจุดกระตุ้น State Machine และ Flow ระบบทั้งเส้น เช่น การคุยกับ Payment Gateway และคืนสถานะร้านค้า',
      },
      {
        text: 'เพราะ CSS สำหรับทำปุ่มสีแดงเขียนยากที่สุดในภาษาโปรแกรม',
        isCorrect: false,
        explanation: 'การทำ UI หน้าตาปุ่มใช้เวลาไม่กี่นาที แต่งานระบบหลังบ้านคือจุดที่กินเวลา',
      },
      {
        text: 'ต้องส่งเรื่องขอใบอนุญาตจากองค์กรมาตรฐานคอมพิวเตอร์โลกก่อนเพิ่มปุ่ม',
        isCorrect: false,
        explanation: 'ไม่จำเป็นต้องขอใบอนุญาตใดๆ',
      },
    ],
    xp: 25,
  },
  {
    id: 4,
    category: 'Architecture & Diagrams',
    role: 'SA',
    scenario: 'คุณต้องการนำเสนอภาพรวมของระบบใหม่ให้ประธานบริษัทและทีมการตลาดที่ไม่มีพื้นฐานเทคนิคเลยเข้าใจว่าระบบไปแตะใครบ้าง',
    question: 'ไดอะแกรมแบบใดเหมาะสมที่สุดในการนำเสนอตาม C4 Model?',
    options: [
      {
        text: 'C4 Level 4 — Code Diagram (UML Class Diagram แสดง Methods และ Attributes)',
        isCorrect: false,
        explanation: 'Level 4 ละเอียดเกินไป เต็มไปด้วยคลาสและโค้ด คนทั่วไปจะอ่านไม่รู้เรื่อง',
      },
      {
        text: 'C4 Level 1 — System Context Diagram (แสดงระบบเราตรงกลาง ล้อมรอบด้วย Actor และระบบภายนอก)',
        isCorrect: true,
        explanation: 'ถูกต้อง! C4 Level 1 เป็นภาพมุมกว้างที่สุด ไม่มีศัพท์เทคนิคซับซ้อน เหมาะสำหรับผู้บริหารและ Stakeholder ทุกคน',
      },
      {
        text: 'Database Entity Relationship Diagram (ERD) แสดง Foreign Keys 80 ตาราง',
        isCorrect: false,
        explanation: 'ERD เหมาะสำหรับ Data Analyst และ Developer ไม่ใช่ภาพรวมเชิงธุรกิจ',
      },
      {
        text: 'Assembly Language Flowchart',
        isCorrect: false,
        explanation: 'ไม่ใช่ไดอะแกรมระดับสถาปัตยกรรมระบบที่ใช้นำเสนอผู้บริหาร',
      },
    ],
    xp: 25,
  },
  {
    id: 5,
    category: 'Quality Assurance',
    role: 'QA',
    scenario: 'ทีมตรวจพบบั๊ก: ตัวหนังสือหัวข้อหน้าแรกพิมพ์ผิดจาก "ยินดีต้อนรับ" เป็น "ยินดีต้อนรับบ" แต่ทำงานได้ปกติ ส่วนอีกบั๊กคือระบบคำนวณภาษีผิดในกรณีที่ลูกค้ามีที่อยู่บนเกาะสมุย (เดือนละ 2 คน)',
    question: 'การประเมิน Bug Severity (ความรุนแรงเชิงเทคนิค) และ Bug Priority (ความเร่งด่วนทางธุรกิจ) ในสองกรณีนี้คือข้อใด?',
    options: [
      {
        text: 'ทั้งสองบั๊กเท่ากันหมด เพราะถือเป็นบั๊กในระบบเหมือนกัน',
        isCorrect: false,
        explanation: 'ระบบจัดการบั๊กที่ดีต้องแยกสองมิตินี้ออกจากกันอย่างชัดเจน',
      },
      {
        text: 'ตัวสะกดผิด: Severity ต่ำ (แค่ตัวอักษร) แต่ Priority อาจสูง (เพราะทุกคนเห็นหน้าแรก) ส่วนภาษีเกาะสมุย: Severity สูง (คำนวณเงินผิด) แต่ Priority อาจต่ำกว่าถ้ากระทบน้อยคนและเลี่ยงได้',
        isCorrect: true,
        explanation: 'ถูกต้อง! Severity วัดผลกระทบเชิงระบบ ส่วน Priority วัดความเร่งด่วนในการแก้ผลกระทบทางธุรกิจ',
      },
      {
        text: 'ถ้าบั๊กไหน Developer อยากแก้ก่อน ให้ถือว่า Priority สูงสุดเสมอ',
        isCorrect: false,
        explanation: 'Priority ควรตัดสินจากผลกระทบทางธุรกิจร่วมกับทีม Product',
      },
      {
        text: 'ตัวสะกดผิดคือ Severity ระดับ Sev1 ระบบวิกฤติต้องปิดเซิร์ฟเวอร์ทันที',
        isCorrect: false,
        explanation: 'Sev1 ใช้สำหรับระบบล่มหรือข้อมูลรั่วไหลรุนแรงเท่านั้น',
      },
    ],
    xp: 25,
  },
  {
    id: 6,
    category: 'DevOps & Reliability',
    role: 'DevOps',
    scenario: 'หลังปล่อยอัปเดตเวอร์ชันใหม่ตอนตี 2 ระบบมี Alerting แจ้งว่า Error Rate พุ่งสูงขึ้น 40% และมีลูกค้าร้องเรียนว่าจ่ายเงินไม่ผ่าน',
    question: 'แนวทางปฏิบัติแรกที่ทีมวิศวกรรมที่มีวุฒิภาวะควรทำคืออะไร?',
    options: [
      {
        text: 'เปิดโค้ดแก้สดๆ บน Production ทันทีโดยไม่ต้องผ่าน Git หรือ CI',
        isCorrect: false,
        explanation: 'การแก้สดบน Production คือกับดักอันตรายที่มักทำให้เกิดเหตุการณ์ร้ายแรงกว่าเดิม',
      },
      {
        text: 'สั่ง Rollback กลับไปเวอร์ชันก่อนหน้า หรือปิด Feature Flag เพื่อคืนความเสถียรให้ลูกค้าทันทีก่อน แล้วค่อยสืบหาสาเหตุในสภาพแวดล้อมทดสอบ',
        isCorrect: true,
        explanation: 'ถูกต้อง! หยุดความเสียหายที่กระทบลูกค้าจริงก่อนด้วย Rollback/Feature Flag แล้วทำ Blameless Post-Mortem ทีหลัง',
      },
      {
        text: 'ปิดเครื่องหนีและรอเข้างาน 9 โมงเช้าค่อยมาดู',
        isCorrect: false,
        explanation: 'ทำให้ธุรกิจและลูกค้าเสียหายอย่างหนัก',
      },
      {
        text: 'ตามหาตัวคนเขียนโค้ดบรรทัดนั้นแล้วต่อว่าในไลน์กลุ่มเพื่อหาคนรับผิดชอบ',
        isCorrect: false,
        explanation: 'การโทษบุคคล (Blame culture) ทำให้คนปกปิดปัญหาและไม่กล้ารายงานข้อผิดพลาด',
      },
    ],
    xp: 25,
  },
  {
    id: 7,
    category: 'Technical Debt',
    role: 'Bridge',
    scenario: 'ทีมกำลังตัดสินใจระหว่างการเขียนโค้ดลัดขั้นตอนเพื่อให้ทันวันเปิดตัว หรือการใช้เวลาออกแบบสถาปัตยกรรมให้เรียบร้อย',
    question: 'ตามกรอบ Technical Debt Quadrant ของ Martin Fowler หนี้ทางเทคนิคแบบใดที่ "อันตรายและสร้างความเสียหายในระยะยาวที่สุด"?',
    options: [
      {
        text: 'ตั้งใจ + รอบคอบ (Deliberate & Prudent): "ต้องรีบปล่อยเพื่อทดสอบตลาด แล้วลงบันทึกว่าจะกลับมาทำความสะอาด"',
        isCorrect: false,
        explanation: 'นี่คือการกู้หนี้ทางธุรกิจที่มีการวางแผนยอมรับความเสี่ยง คล้ายการกู้เงินมาลงทุน',
      },
      {
        text: 'ตั้งใจ + ประมาท (Deliberate & Reckless): "ไม่มีเวลาออกแบบหรอก ลัดๆ ไปเลย ไม่ต้องสนสถาปัตยกรรมและไม่มีแผนแก้"',
        isCorrect: true,
        explanation: 'ถูกต้อง! นี่คือการลัดขั้นตอนโดยไม่คำนึงถึงผลพวง และไม่มีแผนจ่ายคืน ดอกเบี้ยจะทบต้นจนระบบพัง',
      },
      {
        text: 'ไม่ตั้งใจ + รอบคอบ (Inadvertent & Prudent): "ตอนนี้เราเพิ่งเข้าใจลึกซึ้งว่าควรจะออกแบบอย่างไรเมื่อระบบเติบโต"',
        isCorrect: false,
        explanation: 'นี่เป็นเรื่องปกติของการเรียนรู้เมื่อซอฟต์แวร์วิวัฒนาการ',
      },
      {
        text: 'การเขียนโค้ดที่มีคอมเมนต์มากเกินไป',
        isCorrect: false,
        explanation: 'ไม่ใช่หนี้ทางเทคนิคตามนิยามของ Martin Fowler',
      },
    ],
    xp: 25,
  },
  {
    id: 8,
    category: 'Estimation & Planning',
    role: 'Bridge',
    scenario: 'ผู้บริหารอยากได้วันที่ "แน่นอน 100%" ว่าระบบใหม่ทั้งหมดจะเสร็จวันไหน ตั้งแต่สัปดาห์แรกของโปรเจกต์',
    question: 'แนวคิด "Cone of Uncertainty" อธิบายสถานการณ์นี้ไว้อย่างไร?',
    options: [
      {
        text: 'ทีมสามารถคำนวณวันเสร็จได้เป๊ะๆ ตั้งแต่วันแรกถ้าใช้โปรแกรม Excel อย่างเชี่ยวชาญ',
        isCorrect: false,
        explanation: 'Excel ไม่สามารถลบล้างความไม่แน่นอนของสิ่งที่ไม่เคยสร้างมาก่อนได้',
      },
      {
        text: 'วันแรกคือช่วงที่ความไม่แน่นอนสูงสุด ช่วงการประเมินจึงกว้างมาก และจะแคบลงได้ก็ต่อเมื่อทีมได้ลงมือทำและเรียนรู้จริง',
        isCorrect: true,
        explanation: 'ถูกต้อง! การขอตัวเลขเป๊ะๆ ในวันแรกคือการขอสิ่งที่ยังไม่มีอยู่จริง ทางออกที่ดีคือให้ช่วงเวลา (Range) และมี Checkpoint ถี่ๆ',
      },
      {
        text: 'ยิ่งใช้เวลานาน กรวยจะยิ่งกว้างขึ้นเรื่อยๆ จนไม่มีวันจบสิ้นเสมอ',
        isCorrect: false,
        explanation: 'กรวยจะแคบลงเมื่อปัญหาและข้อสงสัยถูกคลี่คลายไปทีละเปลาะ',
      },
      {
        text: 'Cone of Uncertainty ใช้ได้กับธุรกิจขายไอศกรีมโคนเท่านั้น',
        isCorrect: false,
        explanation: 'เป็นแนวคิดคลาสสิกของวิศวกรรมซอฟต์แวร์โดย Boehm และ McConnell',
      },
    ],
    xp: 25,
  },
];
