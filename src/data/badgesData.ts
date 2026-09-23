import { Badge } from '../types';

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'first_step',
    title: 'ก้าวแรกบนสะพานเชื่อม',
    description: 'เปิดอ่านคู่มือบทแรกเพื่อเริ่มเข้าใจอีกฝั่ง',
    icon: 'Compass',
    category: 'reading',
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
    title: 'แชมป์แก้สถานการณ์',
    description: 'ได้คะแนนควิซรวม 80% ขึ้นไป',
    icon: 'Trophy',
    category: 'quiz',
    unlocked: false,
  },
  {
    id: 'ai_consultant',
    title: 'คู่คิด AI',
    description: 'ถามคำถามกับ AI Bridge Specialist อย่างน้อย 1 ครั้ง',
    icon: 'Sparkles',
    category: 'ai',
    unlocked: false,
  },
  {
    id: 'deep_scholar',
    title: 'อ่านจบทุกสายงาน',
    description: 'อ่านครบทุกบท ทั้งฝั่ง Business และ Engineering',
    icon: 'GraduationCap',
    category: 'reading',
    unlocked: false,
  },
  {
    id: 'conflict_mediator',
    title: 'ผู้เจรจาสงบศึก',
    description: 'ลองใช้เครื่องมือจำลองสถานการณ์ความขัดแย้ง 12 ข้อ',
    icon: 'ShieldCheck',
    category: 'exploration',
    unlocked: false,
  },
];

export const LEVEL_TIERS = [
  { level: 1, minXp: 0, title: 'Novice Observer (มือใหม่หัดสังเกต)', color: 'text-base-content-secondary' },
  { level: 2, minXp: 100, title: 'Bridge Apprentice (นักเชื่อมฝึกหัด)', color: 'text-data-1' },
  { level: 3, minXp: 250, title: 'Solution Navigator (นักนำทางโซลูชัน)', color: 'text-engineer' },
  { level: 4, minXp: 500, title: 'Cross-Functional Architect (สถาปนิกข้ามสายงาน)', color: 'text-success' },
  { level: 5, minXp: 1000, title: 'Product & Tech Whisperer (กูรูที่เข้าใจทั้งสองฝั่ง)', color: 'text-warning' },
];
