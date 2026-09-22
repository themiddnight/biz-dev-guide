import { ChapterIllustration } from '../types';

export const CHAPTER_ILLUSTRATIONS: Record<string, ChapterIllustration> = {
  s1: {
    id: 'ill-s1',
    title: 'The Subway Release Train (จากไอเดียสู่เซิร์ฟเวอร์จริง)',
    subtitle: 'เส้นทางรถไฟ 5 สถานี: ความต้องการรั่วไหลและการตรวจตั๋ว 4-Eyes Check',
    visualMetaphor: 'เปรียบเหมือนขบวนรถไฟใต้ดินที่ต้องวิ่งผ่าน 5 สถานีตรวจตั๋วความปลอดภัย หากมีสถานีไหนแอบปล่อยให้คนไม่มีตั๋วผ่าน รถไฟจะตกรางที่สถานีปลายทาง Production',
    elements: [
      { label: 'Business Vision', role: 'ต้นสาย', color: '#f59e0b', detail: 'โจทย์ตั้งต้นจากเจ้าของงบ เช่น อยากเพิ่มยอดขาย 30%' },
      { label: 'PRD & Spec', role: 'จุดแปลภาษา', color: '#8b5cf6', detail: 'กลั่นกรองวิสัยทัศน์เป็น User Story และ Acceptance Criteria' },
      { label: 'Local & PR Branch', role: 'รางประกอบ', color: '#3b82f6', detail: 'เขียนโค้ดและทำ Code Review แบบ 4-Eyes ก่อนรวมเข้า Mainline' },
      { label: 'Automated CI Gates', role: 'สถานีตรวจสภาพ', color: '#06b6d4', detail: 'รัน Unit Tests, Security Scanner, และ Linting ตรวจสอบอัตโนมัติ' },
      { label: 'Production Line', role: 'ปลายทางผู้ใช้', color: '#10b981', detail: 'ระบบพร้อมใช้งานจริง ไม่ล่ม ไม่รั่ว และตรงกับเป้าหมายแรกเริ่ม' }
    ],
    takeaway: 'การส่งมอบซอฟต์แวร์ไม่ใช่การเสก แต่คือขบวนรถไฟที่มีด่านตรวจความถูกต้องทุกรอยต่อ'
  },
  s8: {
    id: 'ill-s8',
    title: 'The Canary Release Valve & Traffic Splitter',
    subtitle: 'วาล์วผันน้ำทราฟฟิก: ปล่อยของใหม่ให้ผู้ใช้ 5% แรก หากตัวชี้วัดเกินเกณฑ์ ระบบสับทราฟฟิกกลับเวอร์ชันเดิมอัตโนมัติ',
    visualMetaphor: 'นกขมิ้นในเหมืองถ่านหิน (Canary in a Coal Mine) ที่คนงานส่งเข้าไปตรวจก๊าซพิษก่อน หากนกปลอดภัย คนงานจึงจะเดินเข้าไปทำงาน',
    elements: [
      { label: 'Total Traffic (100%)', role: 'กระแสน้ำเข้า', color: '#64748b', detail: 'ผู้ใช้งานทุกคนที่เปิดแอปพร้อมกัน' },
      { label: 'Traffic Balancer Valve', role: 'วาล์วควบคุม', color: '#8b5cf6', detail: 'สามารถปรับสัดส่วน 5% ➔ 20% ➔ 50% ➔ 100% ตามความมั่นใจ' },
      { label: 'Canary Fleet (New)', role: 'นกขมิ้นทดสอบ', color: '#f59e0b', detail: 'เครื่องเซิร์ฟเวอร์เวอร์ชันใหม่ คอยจับตาดู Error Log และ Crash Report' },
      { label: 'Instant Rollback Button', role: 'เบรกฉุกเฉิน', color: '#ef4444', detail: 'ถ้า Error Rate หรือ Latency เกินเกณฑ์ที่ตั้งไว้ วาล์วจะสับทราฟฟิกกลับสู่เวอร์ชันเดิมอัตโนมัติ (เร็วแค่ไหนขึ้นกับรอบการเฝ้าวัดผล)' }
    ],
    takeaway: 'ในโลกวิศวกรรมยุคใหม่ เราไม่หวังพึ่งโชคชะตา แต่เราออกแบบระบบให้ผิดพลาดได้อย่างจำกัดและฟื้นตัวได้ทันที'
  },
  s12: {
    id: 'ill-s12',
    title: 'Dual-Track Agile: Discovery & Delivery Gears',
    subtitle: 'ฟันเฟืองคู่ขนาน: ฝั่งค้นคว้าวิ่งนำหน้า 1-2 สปรินต์เพื่อส่งแบบแปลนที่พิสูจน์แล้วให้ฝั่งก่อสร้าง',
    visualMetaphor: 'ล้อหน้าและล้อหลังของจักรยาน: ล้อหน้า (Discovery) คอยเลี้ยวสำรวจทางและหลบหลุมบ่อ ล้อหลัง (Delivery) คอยปั่นส่งแรงขับเคลื่อนให้รถพุ่งไปข้างหน้าอย่างมั่นคง',
    elements: [
      { label: 'Discovery Track', role: 'วงล้อสำรวจ', color: '#ec4899', detail: 'ค้นหาปัญหาที่แท้จริง ทดลองไอเดียด้วยต้นทุนต่ำ' },
      { label: 'Validated Backlog', role: 'สะพานส่งต่อ', color: '#8b5cf6', detail: 'คัดกรองเฉพาะฟีเจอร์ที่พิสูจน์แล้วว่ามีผู้ใช้ต้องการจริง' },
      { label: 'Delivery Track', role: 'วงล้อก่อสร้าง', color: '#3b82f6', detail: 'สร้างระบบที่มั่นคง ปลอดภัย รองรับสเกล และไม่มีหนี้ทางเทคนิค' },
      { label: 'Customer Value', role: 'ผลลัพธ์ปลายทาง', color: '#10b981', detail: 'ส่งมอบคุณค่าที่ตรงใจลูกค้าอย่างสม่ำเสมอทุกสองสัปดาห์' }
    ],
    takeaway: 'อย่าส่งงานที่ไม่ผ่าน Discovery ไปให้ทีม Delivery ทำ เพราะการเขียนโค้ดเพื่อทิ้งคือการเผาผลาญงบประมาณที่แพงที่สุด'
  },
};
