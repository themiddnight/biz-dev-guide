import React from 'react';
import { Scale } from 'lucide-react';

/** The universal friction principles, shown once, at the end of the role-mindset card (spec A5). */
export const FrictionPrinciples: React.FC = () => (
  <div className="p-box-dense rounded-xl bg-warning/10 border border-warning/25 space-y-2" data-friction-principles>
    <div className="flex items-center gap-1.5 font-bold text-warning text-xs sm:text-sm">
      <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-warning" />
      <span>3 ข้อที่ควรจำเมื่อทีมเห็นไม่ตรงกัน</span>
    </div>
    <ul className="space-y-1.5 text-base-content-body text-xs">
      <li className="flex items-start gap-1.5">
        <span className="font-bold text-warning shrink-0">1.</span>
        <span><strong>อย่าสั่งเป็นวิธีแก้ ให้บอกปัญหาและ Impact:</strong> Business ควรอธิบายว่า User เจอปัญหาอะไรและกระทบยอดขายแค่ไหน ส่วน Engineer ควรเสนอ 2 ทางเลือก (Fast vs Solid) พร้อม Trade-off</span>
      </li>
      <li className="flex items-start gap-1.5">
        <span className="font-bold text-warning shrink-0">2.</span>
        <span><strong>คำว่า "ทำไม่ได้" ห้ามพูดเดี่ยวๆ:</strong> ให้เปลี่ยนเป็น &ldquo;ทำได้ 2 แบบ: แบบเสร็จสัปดาห์นี้แต่รองรับได้แค่ 100 คน กับแบบทำ 3 สัปดาห์แต่รองรับได้ 10,000 คน อยากเลือกแบบไหน?&rdquo;</span>
      </li>
      <li className="flex items-start gap-1.5">
        <span className="font-bold text-warning shrink-0">3.</span>
        <span><strong>Technical Debt คือเรื่องการเงิน:</strong> หนี้เทคโนโลยีเหมือนบัตรเครดิต รูดใช้ก่อนได้ (เพื่อส่งงานเร็ว) แต่ถ้าไม่เคยจ่ายเงินต้น ดอกเบี้ยจะทบจนแอปพัง</span>
      </li>
    </ul>
  </div>
);
