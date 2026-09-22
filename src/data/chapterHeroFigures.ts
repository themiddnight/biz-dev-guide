import type { ChapterHeroFigure } from '../types';

export const CHAPTER_HERO_FIGURES: Readonly<Record<string, ChapterHeroFigure>> = {
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
  s9: {
    figureKey: 'refund-debt-diff',
    caption: 'งานเท่ากัน: โค้ดมีหนี้แก้ 6 ไฟล์ หลัง Refactor แก้ไฟล์เดียว',
  },
  s14: {
    figureKey: 'refund-spec-stack',
    caption: 'ฟีเจอร์ขอคืนเงินใน 4 เอกสาร ทุกชั้นชี้กลับไปหาเหตุผลได้',
  },
};
