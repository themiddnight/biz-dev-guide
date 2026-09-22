import type { ChapterHeroFigure } from '../types';

export const CHAPTER_HERO_FIGURES: Readonly<Record<string, ChapterHeroFigure>> = {
  s1: {
    figureKey: 'refund-handoff-drift',
    caption: 'ข้อความลูกค้าประโยคเดียว ส่งต่อ 4 มือ เงื่อนไขสำคัญหายไป',
  },
  s2: {
    figureKey: 'refund-backlog-cut',
    caption: 'งาน 6 อย่าง ทีมทำได้ 2 ฝีมือ PM คือบอกว่าอีก 4 อย่างไม่ทำ',
  },
  s3: {
    figureKey: 'refund-fidelity',
    caption: 'หน้าจอขอคืนเงินหน้าเดียว 4 ขั้น ยิ่งใกล้ของจริง ยิ่งแก้ยาก',
  },
  s4: {
    figureKey: 'refund-nfr-spec',
    caption: 'สเปกเดียวกัน ขาด NFR ล่มวันแคมเปญ เติม 4 บรรทัดก็รอด',
  },
  s5: {
    figureKey: 'refund-c4-impact',
    caption: 'ระบบคืนเงินล่มตัวเดียว ดูแผนผังก็ชี้ได้ว่าใครโดนบ้าง',
  },
  s6: {
    figureKey: 'refund-story-gates',
    caption: 'ข้าม DoR/DoD ไม่ได้เร็วขึ้น บั๊กแค่ย้ายไปโผล่ Sprint หน้า',
  },
  s7: {
    figureKey: 'refund-test-report',
    caption: 'เทสต์ชุดเดียวกัน จัดเป็นพีระมิด รันเร็วกว่าและล้มมั่วน้อยลง',
  },
  s8: {
    figureKey: 'refund-deploy-log',
    caption: 'ก้อนใหญ่พังแล้วหาต้นเหตุไม่เจอ ชิ้นเล็กพังก็ย้อนได้ทันที',
  },
  s9: {
    figureKey: 'refund-debt-diff',
    caption: 'งานเท่ากัน: โค้ดมีหนี้แก้ 6 ไฟล์ หลัง Refactor แก้ไฟล์เดียว',
  },
  s10: {
    figureKey: 'refund-slo-dashboard',
    caption: 'เส้น SLO อยู่เหนือ SLA ระบบจึงเตือนก่อนผิดสัญญากับลูกค้า',
  },
  s11: {
    figureKey: 'refund-kpi-split',
    caption: 'คำขอเดียวกัน ดูหน้าปัด KPI คนละตัว จึงเห็นความเสี่ยงคนละแบบ',
  },
  s12: {
    figureKey: 'refund-dual-track-board',
    caption: 'บอร์ดสองแถว: ฝั่งสำรวจทดลองก่อน ฝั่งสร้างรับเฉพาะที่ผ่าน',
  },
  s13: {
    figureKey: 'refund-ai-review',
    caption: 'AI เขียนโค้ดเสร็จในนาที แต่ตั้งโจทย์กับตรวจงานยังเป็นของคน',
  },
  s14: {
    figureKey: 'refund-spec-stack',
    caption: 'ฟีเจอร์ขอคืนเงินใน 4 เอกสาร ทุกชั้นชี้กลับไปหาเหตุผลได้',
  },
  s15: {
    figureKey: 'refund-glossary-fix',
    caption: 'เรียกเรื่องเดียวกัน 3 ชื่อ ทีมสร้างผิด ตกลงคำเดียวก็จบ',
  },
};
