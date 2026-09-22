import { ChapterIllustration } from '../types';

export const CHAPTER_ILLUSTRATIONS: Record<string, ChapterIllustration> = {
  s1: {
    id: 'ill-s1',
    title: 'The Subway Release Train (จากไอเดียสู่เซิร์ฟเวอร์จริง)',
    subtitle: 'เส้นทางรถไฟ 5 สถานี: ความต้องการรั่วไหลและการตรวจตั๋ว 4-Eyes Check',
    visualMetaphor: 'เปรียบเหมือนขบวนรถไฟใต้ดินที่ต้องวิ่งผ่าน 5 สถานีตรวจตั๋วความปลอดภัย หากมีสถานีไหนแอบปล่อยให้คนไม่มีตั๋วผ่าน รถไฟจะตกรางที่สถานีปลายทาง Production',
    svgType: 'pipeline',
    svgDescription: 'ไดอะแกรมเส้นทางรถไฟ 5 สถานี: 1. Business Vision (ต้นทาง) ➔ 2. PRD & Spec (สถานีกลั่นกรอง) ➔ 3. Dev Branch (รางประกอบตู้รถไฟ) ➔ 4. Automated CI Tests (สถานีตรวจสภาพความปลอดภัย) ➔ 5. Production Live (สถานีปลายทาง)',
    elements: [
      { label: 'Business Vision', role: 'ต้นสาย', color: '#f59e0b', detail: 'โจทย์ตั้งต้นจากเจ้าของงบ เช่น อยากเพิ่มยอดขาย 30%' },
      { label: 'PRD & Spec', role: 'จุดแปลภาษา', color: '#8b5cf6', detail: 'กลั่นกรองวิสัยทัศน์เป็น User Story และ Acceptance Criteria' },
      { label: 'Local & PR Branch', role: 'รางประกอบ', color: '#3b82f6', detail: 'เขียนโค้ดและทำ Code Review แบบ 4-Eyes ก่อนรวมเข้า Mainline' },
      { label: 'Automated CI Gates', role: 'สถานีตรวจสภาพ', color: '#06b6d4', detail: 'รัน Unit Tests, Security Scanner, และ Linting ตรวจสอบอัตโนมัติ' },
      { label: 'Production Line', role: 'ปลายทางผู้ใช้', color: '#10b981', detail: 'ระบบพร้อมใช้งานจริง ไม่ล่ม ไม่รั่ว และตรงกับเป้าหมายแรกเริ่ม' }
    ],
    takeaway: 'การส่งมอบซอฟต์แวร์ไม่ใช่การเสก แต่คือขบวนรถไฟที่มีด่านตรวจความถูกต้องทุกรอยต่อ'
  },
  s2: {
    id: 'ill-s2',
    title: 'The 2x2 Scientific Prioritization Matrix (MoSCoW & RICE)',
    subtitle: 'การคัดแยกฟีเจอร์ด้วยหลักวิทยาศาสตร์ ไม่ใช้อารมณ์หรือเสียงของคนที่ตำแหน่งสูงสุด',
    visualMetaphor: 'เปรียบเหมือนการจัดกระเป๋าเดินป่าข้ามทวีป: Must Have คือน้ำดื่มและยาประจำตัว, Won\'t Have คือชุดราตรีและเครื่องประดับหรู',
    svgType: 'matrix',
    svgDescription: 'ผังแกน 2 มิติ: แกนตั้งคือ Business Impact / Value, แกนนอนคือ Implementation Effort / Cost แบ่งเป็น 4 ควอแดรนต์: Quick Wins, Big Bets, Fill-ins, และ Time Wasters',
    elements: [
      { label: 'Must Have (60%)', role: 'ขาดไม่ได้', color: '#ef4444', detail: 'หากไม่มีฟีเจอร์นี้ ระบบเปิดตัวไม่ได้หรือผิดกฎหมาย เช่น ชำระเงิน' },
      { label: 'Should Have (20%)', role: 'จำเป็นมาก', color: '#f59e0b', detail: 'ฟังก์ชันสำคัญแต่ยังมีทางเลี่ยงชั่วคราวได้ในรอบแรก' },
      { label: 'Could Have (20%)', role: 'ถ้ามีก็ดี', color: '#3b82f6', detail: 'ช่วยเพิ่มความประทับใจ แต่พร้อมตัดทิ้งเมื่อเวลาจวนตัว' },
      { label: 'Won\'t Have (0%)', role: 'ตัดทิ้งเด็ดขาด', color: '#6b7280', detail: 'ตัดออกจากสปรินต์นี้เพื่อไม่ให้กินพลังงานและสมาธิทีม' }
    ],
    takeaway: 'การบอกปฏิเสธฟีเจอร์ที่ไม่จำเป็น คือวิธีเดียวที่จะทำให้ฟีเจอร์ที่สำคัญที่สุดส่งมอบได้ทันเวลา'
  },
  s3: {
    id: 'ill-s3',
    title: 'The Design Fidelity Cost Escalation Ladder',
    subtitle: 'บันไดความละเอียด 4 ขั้น: ยิ่งรื้อช้า ต้นทุนการแก้พุ่งขึ้น 100 เท่า',
    visualMetaphor: 'การแก้งานบนกระดาษร่างดินสอใช้แค่ยางลบก้อนละ 5 บาท แต่การแก้ตอนตึกสร้างเสร็จแล้วต้องทุบเสาเข็มคอนกรีตทิ้งด้วยเงินล้าน',
    svgType: 'pipeline',
    svgDescription: 'บันได 4 ขั้นไต่ระดับความสมจริง: 1. Paper Sketch ($10) ➔ 2. Low-Fi Wireframe ($100) ➔ 3. Hi-Fi Interactive Prototype ($1,000) ➔ 4. Live Production Code ($100,000)',
    elements: [
      { label: 'Sketch / Napkin', role: 'ขั้นที่ 1', color: '#94a3b8', detail: 'วาดมือ 10 นาที เพื่อทดสอบว่าไอเดียและ Flow เข้าใจตรงกันหรือไม่' },
      { label: 'Low-Fi Wireframe', role: 'ขั้นที่ 2', color: '#3b82f6', detail: 'จัดวางกล่องข้อความและปุ่มกดเพื่อดูโครงสร้างหน้าจอโดยไม่สนใจสี' },
      { label: 'Hi-Fi Prototype', role: 'ขั้นที่ 3', color: '#8b5cf6', detail: 'หน้าจอสมจริงใน Figma ให้ผู้บริหารและลูกค้าคลิกลองเล่นจับเวลา' },
      { label: 'Production Code', role: 'ขั้นที่ 4', color: '#ef4444', detail: 'โค้ดจริงเชื่อม Database การรื้อขั้นนี้หมายถึงการเลื่อนวันเปิดตัว' }
    ],
    takeaway: 'ทดสอบสมมติฐานและเปลี่ยนใจให้เสร็จสิ้นใน Figma ก่อนส่งมอบเข้าสู่ขั้นตอนการเขียนโค้ด'
  },
  s4: {
    id: 'ill-s4',
    title: 'The Requirement Iceberg (ภูเขาน้ำแข็งแห่งระบบ)',
    subtitle: '10% เหนือผิวน้ำที่ตามองเห็น vs 90% ใต้ผิวน้ำที่ทำให้ระบบไม่ล่ม',
    visualMetaphor: 'เรือไททานิกชนภูเขาน้ำแข็งส่วนที่มองไม่เห็นใต้น้ำ เช่นเดียวกับซอฟต์แวร์ที่ล่มเพราะทีมมองข้ามระบบความปลอดภัยและการรองรับผู้ใช้พร้อมกัน',
    svgType: 'iceberg',
    svgDescription: 'ภาพตัดขวางภูเขาน้ำแข็งกลางมหาสมุทร: ยอดเขาพ้นน้ำคือ Functional Requirements (ปุ่มกด, ตะกร้าสินค้า, หน้าโปรไฟล์) ฐานยักษ์ใต้น้ำคือ Non-Functional Requirements (Scalability, Security, Uptime, Disaster Recovery)',
    elements: [
      { label: 'Functional (10%)', role: 'เหนือผิวน้ำ', color: '#0ea5e9', detail: 'ฟังก์ชันที่ผู้ใช้กดใช้งานได้โดยตรง: ค้นหา, สั่งซื้อ, สมัครสมาชิก' },
      { label: 'Performance (NFR)', role: 'ใต้น้ำ', color: '#3b82f6', detail: 'เวลาตอบสนองต้องเร็วกว่า 200ms แม้มีคนเข้าพร้อมกัน 10,000 คน' },
      { label: 'Security & PDPA (NFR)', role: 'ใต้น้ำ', color: '#6366f1', detail: 'การเข้ารหัสข้อมูลบัตรเครดิต, การป้องกัน SQL Injection' },
      { label: 'Disaster Recovery (NFR)', role: 'ฐานลึกสุด', color: '#1e1b4b', detail: 'ระบบสำรองข้อมูลอัตโนมัติ กู้คืนระบบได้ใน 15 นาทีเมื่อคลาวด์ดับ' }
    ],
    takeaway: 'ฟีเจอร์ที่ไม่มี NFR รองรับ ก็เหมือนบ้านสวยงามที่สร้างอยู่บนเสาเข็มผุพัง'
  },
  s5: {
    id: 'ill-s5',
    title: 'The Kitchen Metaphor: Monolith vs Microservices & Gateway',
    subtitle: 'ครัวรวมศูนย์ชะงักงัน vs ครัวสถานีแยกพร้อม Maitre d\' API Gateway',
    visualMetaphor: 'ครัวเดี่ยวที่เชฟคนเดียวทำทุกอย่าง (Monolith) ถ้ากระทะไหม้ทั้งร้านต้องหยุด เทียบกับครัวโรงแรมหรู (Microservices) ที่แยกสถานีซุป สเต็ก ขนมหวาน โดยมีหัวหน้าบริกร (API Gateway) คอยจัดคิว',
    svgType: 'kitchen-architecture',
    svgDescription: 'แผนผังเปรียบเทียบสถาปัตยกรรม: ซ้ายคือกล่อง Monolithic บรรจุ Order, User, Payment, Inventory ไว้ในก้อนเดียว ขวาคือ Microservices แยก 4 กล่องอิสระ มี API Gateway รับคำขอจาก Mobile/Web และกระจายอย่างมีระเบียบ',
    elements: [
      { label: 'API Gateway', role: 'หัวหน้าบริกร', color: '#8b5cf6', detail: 'จุดรับคำขอเดียว ตรวจสิทธิ์ Rate Limiting และแจกจ่ายงาน' },
      { label: 'User Service', role: 'สถานีสมาชิก', color: '#3b82f6', detail: 'ดูแลบัญชีและโปรไฟล์ ข้อมูลไม่ปะปนกับบริการอื่น' },
      { label: 'Order & Payment', role: 'สถานีเงินสด', color: '#10b981', detail: 'ประมวลผลคำสั่งซื้อและตัดบัตร มีความมั่นคงปลอดภัยสูงสุด' },
      { label: 'Inventory Service', role: 'สถานีคลังสินค้า', color: '#f59e0b', detail: 'ตัดสต็อกแบบเรียลไทม์ พร้อมระบบสำรองป้องกันของหมด' }
    ],
    takeaway: 'เลือก Monolith สำหรับความเร็วในการเริ่มต้น และแยกเป็น Microservices เมื่อขนาดทีมและโหลดของระบบต้องการความอิสระ'
  },
  s6: {
    id: 'ill-s6',
    title: 'The Two Quality Tollbooths: Definition of Ready vs Done',
    subtitle: 'สองประตูกั้นคุณภาพ: DoR ป้องกันงานมั่วเข้าสปรินต์, DoD ป้องกันบั๊กหลุดสู่ลูกค้า',
    visualMetaphor: 'ด่านตรวจคนเข้าเมือง: DoR ตรวจวีซ่าและเอกสารก่อนให้เข้าทำงาน, DoD ตรวจสินค้าและสัมภาระอย่างละเอียดก่อนปล่อยเครื่องบินขึ้นฟ้า',
    svgType: 'matrix',
    svgDescription: 'อุโมงค์ Sprint Development โดยมีประตูเปิด-ปิด 2 ชั้น: ประตูหน้า DoR (สเปกครบ, Wireframe พร้อม, ข้อมูลพร้อม) และประตูหลัง DoD (Test ครอบคลุม 80%, ผ่าน Security Scan, Deploy Staging สำเร็จ)',
    elements: [
      { label: 'Definition of Ready', role: 'ประตูปากทางเข้า', color: '#f59e0b', detail: 'เกณฑ์ว่าพร้อมทำ: ไม่เอางานครึ่งๆ กลางๆ เข้ามาสร้างความสับสนในสปรินต์' },
      { label: 'Active Development', role: 'ภายในสปรินต์', color: '#3b82f6', detail: 'ทีมโฟกัสเขียนโค้ดและจับคู่ทำงานโดยไม่มีงานด่วนแทรกซ้อน' },
      { label: 'Definition of Done', role: 'ประตูปากทางออก', color: '#10b981', detail: 'เกณฑ์ว่าเสร็จจริง: ผ่าน Code Review, Automation Test, และ Staging Sign-off' },
      { label: 'Production Ready', role: 'ส่งมอบลูกค้า', color: '#059669', detail: 'ฟีเจอร์ขึ้นเซิร์ฟเวอร์อย่างสงบสุข ไม่ต้องตาม Hotfix ตอนดึก' }
    ],
    takeaway: 'อย่าปล่อยให้ความรีบร้อนพังประตูกั้นคุณภาพ เพราะต้นทุนการแก้งานทีหลังแพงกว่าเสมอ'
  },
  s7: {
    id: 'ill-s7',
    title: 'The Testing Pyramid vs Inverted Ice-Cream Cone',
    subtitle: 'สถาปัตยกรรมการทดสอบ: ฐานกว้างมั่นคง vs โคนไอศกรีมกลับหัวที่พร้อมล้ม',
    visualMetaphor: 'ฐานปิรามิดอียิปต์ที่อยู่รอดมาหลายพันปีด้วย Unit Tests 70% เทียบกับโคนไอศกรีมปลายแหลมทิ่มลงที่มีแต่การเทสต์มือที่เหนื่อยล้าและช้า',
    svgType: 'pyramid',
    svgDescription: 'ปิรามิด 3 ชั้น: ฐานล่างสุดคือ Unit Tests (70% - รวดเร็ว ถูก เสถียร), ชั้นกลางคือ Integration Tests (20% - ตรวจรอยต่อ API/DB), ชั้นบนสุดคือ End-to-End Tests (10% - จำลองคลิกหน้าจอช้าและแพง)',
    elements: [
      { label: 'Unit Tests (70%)', role: 'ฐานรากปิรามิด', color: '#10b981', detail: 'ทดสอบตรรกะระดับฟังก์ชัน รันพันข้อเสร็จใน 5 วินาที เป็นเกราะคุ้มกันชั้นแรก' },
      { label: 'Integration Tests (20%)', role: 'ข้อต่อสะพาน', color: '#6366f1', detail: 'ทดสอบการส่งข้อมูลระหว่างระบบ เช่น API คุยกับฐานข้อมูลจริง' },
      { label: 'E2E / UI Tests (10%)', role: 'ยอดปิรามิด', color: '#f43f5e', detail: 'ทดสอบเส้นทางหลักของลูกค้า ช้าและเสียง่าย ควรมีเฉพาะ Critical Flow' }
    ],
    takeaway: 'ลงทุนกับ Unit Tests ให้หนาแน่น เพื่อให้ทีมกล้าแก้ไขและปล่อยโค้ดได้ทุกวันอย่างมั่นใจ'
  },
  s8: {
    id: 'ill-s8',
    title: 'The Canary Release Valve & Traffic Splitter',
    subtitle: 'วาล์วผันน้ำทราฟฟิก: ปล่อยของใหม่ให้ผู้ใช้ 5% แรก หากผิดพลาดดึงกลับใน 30 วินาที',
    visualMetaphor: 'นกขมิ้นในเหมืองถ่านหิน (Canary in a Coal Mine) ที่คนงานส่งเข้าไปตรวจก๊าซพิษก่อน หากนกปลอดภัย คนงานจึงจะเดินเข้าไปทำงาน',
    svgType: 'pipeline',
    svgDescription: 'ไดอะแกรมระบบผันน้ำทราฟฟิก: ผู้ใช้ 100% วิ่งมาที่ Load Balancer จากนั้นวาล์วผัน 95% ไปยังระบบเดิมที่เสถียร (Blue) และ 5% ไปยังระบบเวอร์ชันใหม่ (Green Canary) พร้อมเซ็นเซอร์วัด Error Rate',
    elements: [
      { label: 'Total Traffic (100%)', role: 'กระแสน้ำเข้า', color: '#64748b', detail: 'ผู้ใช้งานทุกคนที่เปิดแอปพร้อมกัน' },
      { label: 'Traffic Balancer Valve', role: 'วาล์วควบคุม', color: '#8b5cf6', detail: 'สามารถปรับสัดส่วน 5% ➔ 20% ➔ 50% ➔ 100% ตามความมั่นใจ' },
      { label: 'Canary Fleet (New)', role: 'นกขมิ้นทดสอบ', color: '#f59e0b', detail: 'เครื่องเซิร์ฟเวอร์เวอร์ชันใหม่ คอยจับตาดู Error Log และ Crash Report' },
      { label: 'Instant Rollback Button', role: 'เบรกฉุกเฉิน', color: '#ef4444', detail: 'ถ้าพบข้อผิดพลาด วาล์วจะสับทราฟฟิกกลับสู่เวอร์ชันเดิมอัตโนมัติ' }
    ],
    takeaway: 'ในโลกวิศวกรรมยุคใหม่ เราไม่หวังพึ่งโชคชะตา แต่เราออกแบบระบบให้ผิดพลาดได้อย่างจำกัดและฟื้นตัวได้ทันที'
  },
  s9: {
    id: 'ill-s9',
    title: 'Barry Boehm\'s Exponential Cost-of-Change Curve',
    subtitle: 'กราฟความชันต้นทุน: การเปลี่ยนใจในห้องประชุมถูกกว่าการแก้ระบบ Production 200 เท่า',
    visualMetaphor: 'ก้อนหินเล็กๆ ที่เริ่มกลิ้งจากยอดเขา: ถ้ายกมือหยุดแต่แรกใช้แรงแค่ปลายนิ้ว แต่ถ้าปล่อยให้กลิ้งถึงตีนเขาจะกลายเป็นหินถล่มที่ทำลายทั้งหมู่บ้าน',
    svgType: 'custom',
    svgDescription: 'กราฟเส้นโค้งพุ่งขึ้นแบบชัน (Exponential): แกนนอนคือขั้นตอน Requirements ➔ Design ➔ Coding ➔ Testing ➔ Production แกนตั้งคือต้นทุนทางการเงิน $100 ➔ $500 ➔ $1,000 ➔ $5,000 ➔ $50,000+',
    elements: [
      { label: 'Requirement ($100)', role: 'ลบแล้วพิมพ์ใหม่', color: '#10b981', detail: 'แก้ข้อความในเอกสาร ใช้เวลา 5 นาที ไม่เสียต้นทุนเชิงวิศวกรรม' },
      { label: 'Design ($500)', role: 'ปรับ Flow Figma', color: '#3b82f6', detail: 'แก้รูปทรงและปฏิสัมพันธ์บนหน้าจอ ใช้เวลาครึ่งวัน' },
      { label: 'Coding ($1,000)', role: 'รื้อโค้ดและทดสอบ', color: '#f59e0b', detail: 'ต้องแก้ Logic และแก้ Unit Tests ที่เขียนไปแล้ว' },
      { label: 'Live Prod ($50,000+)', role: 'วิกฤติต่อเนื่อง', color: '#ef4444', detail: 'ระบบล่ม เสียรายได้ ข้อมูลเพี้ยน และชื่อเสียงบริษัทเสียหาย' }
    ],
    takeaway: 'คุยกันให้ตกผลึกและกล้าถามคำถามที่ยากที่สุดตั้งแต่วันแรก เพื่อประหยัดเงินนับล้านในวันเปิดตัว'
  },
  s10: {
    id: 'ill-s10',
    title: 'Closed-Loop Incident Escalation Funnel (L1 ➔ L2 ➔ L3)',
    subtitle: 'กรวยคัดกรองปัญหา: จัดการหน้าบ้านให้ไว นำข้อผิดพลาดมาเป็นโจทย์พัฒนาหลังบ้าน',
    visualMetaphor: 'ห้องฉุกเฉินโรงพยาบาล: พยาบาลคัดกรองอาการ (L1) ➔ แพทย์ตรวจทั่วไป (L2) ➔ ทีมศัลยแพทย์เฉพาะทางผ่าตัดด่วน (L3)',
    svgType: 'pipeline',
    svgDescription: 'กรวยคัดกรอง 3 ระดับ: Ticket จากลูกค้าเข้าสู่ L1 Support (แก้ได้ 70%) ➔ L2 Technical Ops (แก้ได้ 20%) ➔ L3 Core Engineering (แก้ Bug ลึก 10%) พร้อมท่อ Closed-loop Feedback ไหลกลับสู่ Product Backlog',
    elements: [
      { label: 'Tier 1: Customer Support', role: 'ด่านหน้า', color: '#38bdf8', detail: 'ช่วยเหลือลูกค้า ตอบคำถามตามคู่มือ แก้ปัญหาทั่วไป' },
      { label: 'Tier 2: Tech Ops', role: 'ตรวจเช็คเชิงลึก', color: '#818cf8', detail: 'ตรวจ Log, เช็ค Database, ตรวจสอบสิทธิ์ผู้ใช้' },
      { label: 'Tier 3: Core Engineers', role: 'ผ่าตัดระบบ', color: '#c084fc', detail: 'เขียน Hotfix แก้โค้ดระดับรากเหง้าของปัญหา' },
      { label: 'Closed-Loop Backlog', role: 'วงจรเรียนรู้', color: '#34d399', detail: 'บันทึกสาเหตุเข้า Sprint ถัดไปเพื่อป้องกันไม่ให้เกิดซ้ำ' }
    ],
    takeaway: 'การบริการที่ดีไม่ใช่แค่ขอโทษลูกค้า แต่คือการมีระบบส่งต่อข้อมูลที่ทำให้บั๊กเดิมไม่มีวันเกิดขึ้นเป็นครั้งที่สอง'
  },
  s11: {
    id: 'ill-s11',
    title: 'The Interactive Iron Triangle Trade-Off Simulator',
    subtitle: 'สามเหลี่ยมเหล็กแห่งโครงการ: ขยับ Scope, Time, หรือ Cost จะกระทบ Quality ทันที',
    visualMetaphor: 'เส้นยางยืด 3 ด้าน: ถ้าคุณดึงให้เวลาร่นเร็วขึ้น แต่ไม่ยอมลดของและไม่เพิ่มงบ เส้นยางจะตึงจนขาดตรงกลาง ซึ่งก็คือ "คุณภาพของซอฟต์แวร์"',
    svgType: 'triangle',
    svgDescription: 'รูปสามเหลี่ยมด้านเท่า 3 ยอด: Scope (ขอบเขตงาน), Time (กำหนดส่ง), Cost / Resources (งบและจำนวนคน) โดยมีใจกลางรูปคือ Quality & Technical Debt ที่แปรผันตามแรงดึงทั้งสามด้าน',
    elements: [
      { label: 'Scope (ขอบเขตงาน)', role: 'ยอดบน', color: '#f59e0b', detail: 'จำนวนฟีเจอร์และระดับความละเอียดของระบบ' },
      { label: 'Time (เวลาส่งมอบ)', role: 'ยอดซ้าย', color: '#3b82f6', detail: 'กำหนดวันเปิดตัว (Deadline) ของโครงการ' },
      { label: 'Cost / People (ทรัพยากร)', role: 'ยอดขวา', color: '#8b5cf6', detail: 'งบประมาณ ขนาดทีม และโครงสร้างพื้นฐาน' },
      { label: 'Quality Core (ใจกลาง)', role: 'ผลลัพธ์', color: '#ef4444', detail: 'หากกดดันทั้ง 3 ด้าน คุณภาพจะพังทลายเกิดบั๊กมหาศาล' }
    ],
    takeaway: 'คุณเลือกปรับได้ 2 ด้านเสมอเพื่อแลกกับอีก 1 ด้าน ไม่มีโปรเจกต์ใดที่เร็วที่สุด เยอะที่สุด และถูกที่สุดไปพร้อมกันได้'
  },
  s12: {
    id: 'ill-s12',
    title: 'Dual-Track Agile: Discovery & Delivery Gears',
    subtitle: 'ฟันเฟืองคู่ขนาน: ฝั่งค้นคว้าวิ่งนำหน้า 1-2 สปรินต์เพื่อส่งแบบแปลนที่พิสูจน์แล้วให้ฝั่งก่อสร้าง',
    visualMetaphor: 'ล้อหน้าและล้อหลังของจักรยาน: ล้อหน้า (Discovery) คอยเลี้ยวสำรวจทางและหลบหลุมบ่อ ล้อหลัง (Delivery) คอยปั่นส่งแรงขับเคลื่อนให้รถพุ่งไปข้างหน้าอย่างมั่นคง',
    svgType: 'dual-orbit',
    svgDescription: 'ฟันเฟืองคู่ที่หมุนประสานกัน: วงโคจรซ้าย Discovery Track (PM + Designer ทำ User Research, Prototype, พิสูจน์สมมติฐาน) ส่งต่อ User Story ที่ชัดเจนเข้าสู่วงโคจรขวา Delivery Track (Dev + QA สร้าง Production Code และ Automated Tests)',
    elements: [
      { label: 'Discovery Track', role: 'วงล้อสำรวจ', color: '#ec4899', detail: 'ค้นหาปัญหาที่แท้จริง ทดลองไอเดียด้วยต้นทุนต่ำ' },
      { label: 'Validated Backlog', role: 'สะพานส่งต่อ', color: '#8b5cf6', detail: 'คัดกรองเฉพาะฟีเจอร์ที่พิสูจน์แล้วว่ามีผู้ใช้ต้องการจริง' },
      { label: 'Delivery Track', role: 'วงล้อก่อสร้าง', color: '#3b82f6', detail: 'สร้างระบบที่มั่นคง ปลอดภัย รองรับสเกล และไม่มีหนี้ทางเทคนิค' },
      { label: 'Customer Value', role: 'ผลลัพธ์ปลายทาง', color: '#10b981', detail: 'ส่งมอบคุณค่าที่ตรงใจลูกค้าอย่างสม่ำเสมอทุกสองสัปดาห์' }
    ],
    takeaway: 'อย่าส่งงานที่ไม่ผ่าน Discovery ไปให้ทีม Delivery ทำ เพราะการเขียนโค้ดเพื่อทิ้งคือการเผาผลาญงบประมาณที่แพงที่สุด'
  },
  s13: {
    id: 'ill-s13',
    title: 'AI-Assisted SDLC: The Copilot Cockpit & Guardrails',
    subtitle: 'ห้องนักบิน AI: AI ช่วยเร่งความเร็ว 10 เท่า แต่มนุษย์ต้องเป็นคนตรวจเช็คความปลอดภัย',
    visualMetaphor: 'ระบบขับเคลื่อนอัตโนมัติในเครื่องบิน: Auto-pilot ช่วยลดความเหนื่อยล้าของนักบิน แต่กัปตันมนุษย์ต้องมีสติคอยตรวจเครื่องวัดและตัดสินใจเมื่อเจอสภาพอากาศแปรปรวน',
    svgType: 'custom',
    svgDescription: 'ผังการทำงานของ AI ในกระบวนการพัฒนา: Input Prompt + Context Window ➔ LLM Generation (สร้างโค้ด/เทสต์อย่างรวดเร็ว) ➔ ชั้นกรอง 4-Eyes Security & Architecture Review ➔ Verified Production Code',
    elements: [
      { label: 'Rich Context & Prompt', role: 'อินพุตสเปก', color: '#a855f7', detail: 'ป้อนข้อมูลทางธุรกิจ Type Definitions และตัวอย่างที่ชัดเจน (Few-shot)' },
      { label: 'AI Code Engine', role: 'เครื่องทุ่นแรง', color: '#ec4899', detail: 'เขียน Boilerplate, เขียน Unit Test, แปลงดีไซน์เป็นโค้ดในไม่กี่วินาที' },
      { label: 'Security Guardrails', role: 'เกราะป้องกัน', color: '#f59e0b', detail: 'สแกนหาช่องโหว่ ตรวจสอบ Token และป้องกันปัญหา Hallucination' },
      { label: 'Human Engineer Review', role: 'กัปตันผู้ตรวจรับ', color: '#10b981', detail: 'วิศวกรมนุษย์ใช้ Domain Judgment ตรวจสอบความถูกต้องขั้นสุดท้าย' }
    ],
    takeaway: 'AI ไม่ได้มาแทนที่วิศวกร แต่วิศวกรที่ใช้ AI อย่างรู้เท่าทันและมีระบบตรวจสอบ จะก้าวล้ำหน้าคนที่ไม่ใช้อย่างมหาศาล'
  },
  s14: {
    id: 'ill-s14',
    title: 'The Specification Hierarchy Pyramid (BRD ➔ PRD ➔ Story ➔ ADR)',
    subtitle: 'พิมพ์เขียว 4 ชั้น: แปลงเป้าหมายกำไรขององค์กร ให้กลายเป็นโค้ด 1 บรรทัดที่รันได้จริง',
    visualMetaphor: 'การสร้างตึกระฟ้า: BRD คือการศึกษาความเป็นไปได้ทางการเงิน, PRD คือแบบสถาปัตยกรรมภายนอก, User Story คือแปลนห้องและปลั๊กไฟ, ADR คือสูตรผสมคอนกรีตของวิศวกรโครงสร้าง',
    svgType: 'pyramid',
    svgDescription: 'พีระมิด 4 ขั้นลดหลั่นจากบนลงล่าง: ยอดบนสุด BRD (ทำไมถึงทำ งบเท่าไหร่) ➔ ชั้นที่สอง PRD (ฟีเจอร์คืออะไร หน้าตาเป็นอย่างไร) ➔ ชั้นที่สาม User Story & AC (เงื่อนไขตรวจรับ Given-When-Then) ➔ ฐานล่างสุด Technical Spec & ADR (Database, API, สถาปัตยกรรม)',
    elements: [
      { label: '1. BRD (Business Goal)', role: 'เป้าหมายธุรกิจ', color: '#f59e0b', detail: 'ระบุผลตอบแทนการลงทุน (ROI) และโอกาสทางการตลาด' },
      { label: '2. PRD (Product Spec)', role: 'พิมพ์เขียวฟังก์ชัน', color: '#3b82f6', detail: 'ระบุพฤติกรรมของระบบและขอบเขตฟีเจอร์สำหรับผู้ใช้' },
      { label: '3. User Story & AC', role: 'เกณฑ์ตรวจรับงาน', color: '#8b5cf6', detail: 'เขียนเงื่อนไข Given-When-Then ให้ทั้งเดฟและ QA ตรวจตรงกัน' },
      { label: '4. Tech Design & ADR', role: 'บันทึกวิศวกรรม', color: '#10b981', detail: 'บันทึกเหตุผลว่าทำไมถึงเลือกเทคโนโลยีนี้ เพื่อคนรุ่นหลัง' }
    ],
    takeaway: 'ความชัดเจนในเอกสารเพียง 1 ประโยค ช่วยประหยัดเวลาการถกเถียงและเขียนโค้ดผิดพลาดได้นับร้อยชั่วโมง'
  }
};

// Extra cards shown after a chapter's primary illustration.
export const EXTRA_CHAPTER_ILLUSTRATIONS: Record<string, ChapterIllustration[]> = {
  s5: [
    {
      id: 'ill-s5-protocols',
      title: 'The Visual Communication Matrix (REST API vs Webhook vs WebSocket)',
      subtitle: 'เปรียบเทียบ 3 โปรโตคอล: เลือกวิธีส่งข้อมูลให้ถูกงาน ประหยัดค่าเซิร์ฟเวอร์และลดอาการค้าง',
      visualMetaphor: 'การติดตามพัสดุ: REST คือการโทรเช็คกับไปรษณีย์ทุกๆ 5 นาที (เหนื่อยและเปลือง), Webhook คือบุรุษไปรษณีย์มากดกริ่งหน้าบ้านเมื่อของถึง (ทันทีและประหยัด), WebSocket คือเปิดสายโทรศัพท์คุยสดตลอดเวลา (สำหรับเรื่องฉุกเฉิน)',
      svgType: 'protocol-comparison',
      svgDescription: 'ตารางเปรียบเทียบ Flow การทำงานของทั้ง 3 รูปแบบ: Client Polling (Request-Response ซ้ำๆ), Server Push Webhook (Event Triggered ส่งตรงเข้า Endpoint), และ Duplex WebSocket (ท่อข้อมูลเปิดค้างไว้สองทาง)',
      elements: [
        { label: 'REST API (Polling)', role: 'ถามซ้ำๆ เป็นรอบ', color: '#3b82f6', detail: 'Client ส่งคำขอไปถาม Server เหมาะสำหรับการดึงข้อมูลทั่วไป เช่น หน้ารายการสินค้า' },
        { label: 'Webhook (Event-Driven)', role: 'กริ่งประตูดังทันที', color: '#10b981', detail: 'Server ต้นทางยิงข้อมูลมาบอกเมื่อเกิดเหตุการณ์ เช่น แจ้งเตือนเงินเข้าจากธนาคาร' },
        { label: 'WebSocket (Real-Time)', role: 'ท่อสายตรงสองทาง', color: '#f59e0b', detail: 'เปิดการเชื่อมต่อค้างไว้ เหมาะสำหรับแอปแชท หุ้น และการติดตามพิกัดไรเดอร์' }
      ],
      takeaway: 'ไม่มีโปรโตคอลที่ดีที่สุดสำหรับทุกงาน มีแต่โปรโตคอลที่เหมาะสมที่สุดกับลักษณะการใช้งานและทรัพยากร'
    }
  ]
};
