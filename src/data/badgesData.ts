import { Badge } from '../types';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'ก้าวแรกสู่สะพานเชื่อม',
    description: 'เปิดอ่านคู่มือบทแรกเพื่อเริ่มต้นทำความเข้าใจอีกฝั่ง',
    icon: 'Compass',
    category: 'reading',
    unlocked: true,
    unlockedAt: 'เริ่มต้นแล้ว',
  },
  {
    id: 'view_switcher',
    title: 'ผู้มองสองฟากฟ้า',
    description: 'ลองสลับมุมมองระหว่าง "ฝั่ง Business" และ "ฝั่ง Engineer"',
    icon: 'Repeat',
    category: 'exploration',
    unlocked: false,
  },
  {
    id: 'plain_talker',
    title: 'ล่ามภาษาบ้านๆ',
    description: 'เปิดใช้งานโหมด "แปลภาษาบ้านๆ" เพื่อดูคำอุปมาเชิงเปรียบเทียบ',
    icon: 'MessageSquareText',
    category: 'exploration',
    unlocked: false,
  },
  {
    id: 'quiz_starter',
    title: 'ผู้ท้าชิงมือใหม่',
    description: 'ทำแบบทดสอบจำลองสถานการณ์ข้อแรกสำเร็จ',
    icon: 'Award',
    category: 'quiz',
    unlocked: false,
  },
  {
    id: 'quiz_master',
    title: 'แชมป์คลี่คลายสถานการณ์',
    description: 'ได้คะแนนควิซรวม 80% ขึ้นไปในการทดสอบทักษะ',
    icon: 'Trophy',
    category: 'quiz',
    unlocked: false,
  },
  {
    id: 'ai_consultant',
    title: 'คู่คิดปัญญาประดิษฐ์',
    description: 'ถามคำถามกับ AI Bridge Specialist อย่างน้อย 1 ครั้ง',
    icon: 'Sparkles',
    category: 'ai',
    unlocked: false,
  },
  {
    id: 'deep_scholar',
    title: 'บัณฑิตข้ามสายงาน',
    description: 'อ่านครบทุกส่วนตั้งแต่ PM, BA, SA จนถึง DevOps และ Support',
    icon: 'GraduationCap',
    category: 'reading',
    unlocked: false,
  },
  {
    id: 'conflict_mediator',
    title: 'ผู้เจรจาสงบศึก',
    description: 'ทดลองใช้งานเครื่องมือจำลองสถานการณ์ความขัดแย้ง 12 ข้อ',
    icon: 'ShieldCheck',
    category: 'exploration',
    unlocked: false,
  },
];

export const LEVEL_TIERS = [
  { level: 1, minXp: 0, title: 'Novice Observer (ผู้สังเกตการณ์มือใหม่)', color: 'text-slate-600 dark:text-slate-400' },
  { level: 2, minXp: 100, title: 'Bridge Apprentice (ผู้เชื่อมโยงฝึกหัด)', color: 'text-blue-600 dark:text-blue-400' },
  { level: 3, minXp: 250, title: 'Solution Navigator (นักนำทางโซลูชัน)', color: 'text-indigo-600 dark:text-indigo-400' },
  { level: 4, minXp: 500, title: 'Cross-Functional Architect (สถาปัตยกรข้ามสายงาน)', color: 'text-emerald-600 dark:text-emerald-400' },
  { level: 5, minXp: 1000, title: 'Product & Tech Whisperer (กูรูผู้เข้าใจทั้งสองโลก)', color: 'text-amber-500 dark:text-amber-400' },
];
