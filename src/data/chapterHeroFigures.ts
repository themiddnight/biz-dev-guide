import type { ChapterHeroFigure } from '../types';

export const CHAPTER_HERO_FIGURES: Readonly<Record<string, ChapterHeroFigure>> = {
  s3: {
    figureKey: 'refund-fidelity',
    caption: 'หน้าจอขอคืนเงินหน้าเดียว 4 ขั้น ยิ่งใกล้ของจริง ยิ่งแก้ยาก',
  },
  s5: {
    figureKey: 'refund-c4-impact',
    caption: 'ระบบคืนเงินล่มตัวเดียว ดูแผนผังก็ชี้ได้ว่าใครโดนบ้าง',
  },
};
