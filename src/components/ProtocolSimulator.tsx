import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio, Zap } from 'lucide-react';

/**
 * Sync vs Async protocol simulator (Polling / Webhook / WebSocket).
 * Polling is still plain HTTP/REST underneath; the contrast is who asks, not the protocol.
 * Moved from ChapterDiagram's former s15 branch into chapter 5
 * (owner decision Q2); chapter 15 now hosts the glossary.
 */
export const ProtocolSimulator: React.FC = () => {
  // Chapter 15: Protocol Simulator state
  const [protocolMode, setProtocolMode] = useState<'polling' | 'webhook' | 'websocket'>('webhook');
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollCount, setPollCount] = useState<number>(0);
  const [webhookLogs, setWebhookLogs] = useState<string[]>([]);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [wsMessages, setWsMessages] = useState<number>(0);

  // Polling simulator effect
  useEffect(() => {
    let interval: any;
    if (isPolling) {
      interval = setInterval(() => {
        setPollCount((prev) => prev + 1);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isPolling]);

  // WebSocket simulator effect
  useEffect(() => {
    let wsInterval: any;
    if (wsConnected) {
      wsInterval = setInterval(() => {
        setWsMessages((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(wsInterval);
  }, [wsConnected]);

    return (
      <div className="space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📡</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  The Visual Communication Protocol Matrix &amp; Simulator
                </h4>
                <p className="text-[11px] text-slate-500">
                  จำลองการสื่อสาร 3 รูปแบบ: โทรเช็คทุก 5 นาที (Polling) vs กริ่งหน้าบ้านดัง (Webhook) vs เปิดสายคุยสด (WebSocket)
                </p>
              </div>
            </div>

            {/* Protocol Switcher */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
              <button
                onClick={() => { setProtocolMode('polling'); setIsPolling(false); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  protocolMode === 'polling' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                1. Polling (ถามซ้ำ)
              </button>
              <button
                onClick={() => { setProtocolMode('webhook'); setIsPolling(false); setWsConnected(false); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  protocolMode === 'webhook' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                2. Webhook
              </button>
              <button
                onClick={() => { setProtocolMode('websocket'); setIsPolling(false); }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  protocolMode === 'websocket' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                3. WebSocket
              </button>
            </div>
          </div>

          {/* Interactive Protocol Workspace */}
          {protocolMode === 'polling' && (
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-blue-500" />
                  <span>Polling: ฝั่งเราต้องยิงถามเซิร์ฟเวอร์ซ้ำๆ ตลอดเวลา</span>
                </span>
                <button
                  onClick={() => setIsPolling(!isPolling)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    isPolling ? 'bg-rose-500 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isPolling ? 'หยุด Polling' : 'เริ่ม Polling (จำลองเร็วขึ้น: 1.5 วินาที แทน 5 นาทีจริง)'}
                </button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-900 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500">จำนวนคำขอที่ยิงไปเปลืองทรัพยากร: </span>
                  <b className="text-base text-blue-600 dark:text-blue-400">{pollCount} ครั้ง</b>
                </div>
                <span className="text-[11px] text-slate-400">
                  {pollCount > 0 ? 'ผลลัพธ์ส่วนใหญ่: "ยังไม่มีของมาถึง... ถามซ้ำ"' : 'กดปุ่มเพื่อเริ่มยิงจำลอง'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                💡 <b>คำอธิบาย:</b> เหมือนคุณโทรไปหาบริษัทส่งของทุก 5 นาที เปลืองแบตโทรศัพท์และเปลืองเงินทั้งสองฝ่าย (ตัวจำลองนี้เร่งให้เร็วขึ้น ถามทุก 1.5 วินาที เพื่อให้เห็นภาพทันที) เบื้องหลังแต่ละครั้งก็ยังเป็นการเรียก HTTP/REST ธรรมดา ต่างกันแค่ว่าฝั่งเราต้องเป็นคนถาม
              </p>
            </div>
          )}

          {protocolMode === 'webhook' && (
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  <span>Webhook (Event-Driven): เซิร์ฟเวอร์ยิงมาบอกทันทีที่มีเหตุการณ์</span>
                </span>
                <button
                  onClick={() => {
                    const time = new Date().toLocaleTimeString();
                    setWebhookLogs((prev) => [`[${time}] Event: payment.succeeded - ได้รับเงิน 1,500 บาทจากธนาคารทันที!`, ...prev.slice(0, 2)]);
                  }}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer hover:bg-emerald-700"
                >
                  กดจำลองลูกค้าสแกนจ่ายเงินสำเร็จ
                </button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900 text-xs space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Webhook Event Logs (ยิงเฉพาะตอนเงินเข้า):</div>
                {webhookLogs.length === 0 ? (
                  <span className="text-slate-400 text-[11px]">ยังไม่มีเหตุการณ์ — ระบบอยู่นิ่งๆ ไม่เปลืองเน็ต</span>
                ) : (
                  webhookLogs.map((log, lIdx) => (
                    <div key={lIdx} className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      ⚡ {log}
                    </div>
                  ))
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                💡 <b>คำอธิบาย:</b> เหมือนบุรุษไปรษณีย์มากดกริ่งหน้าบ้านเฉพาะตอนพัสดุมาถึง ประหยัดเน็ต ประหยัดเซิร์ฟเวอร์ และทำงานได้ทันที
              </p>
              <p className="text-[11px] text-slate-500">
                ⚠️ <b>ระวัง:</b> Webhook อาจส่งไม่ถึงหรือส่งซ้ำ งานรับเงินจึงต้องมี Retry และกระทบยอดกับธนาคาร (Reconciliation) เป็นประจำ
              </p>
            </div>
          )}

          {protocolMode === 'websocket' && (
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>WebSocket: ท่อเปิดค้างไว้สองทาง ส่งข้อมูลระดับมิลลิวินาที (Full Duplex)</span>
                </span>
                <button
                  onClick={() => setWsConnected(!wsConnected)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    wsConnected ? 'bg-rose-500 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  {wsConnected ? 'ตัดการเชื่อมต่อ' : 'เปิดการเชื่อมต่อ (Connect Stream)'}
                </button>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-900 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500">สถานะท่อข้อมูล: </span>
                  <b className={`text-xs ${wsConnected ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {wsConnected ? '🟢 OPEN (ต่อสายสด)' : '⚪ CLOSED'}
                  </b>
                </div>
                <div className="text-[11px] text-amber-600 dark:text-amber-400">
                  แพ็กเก็ตแบบเรียลไทม์: <b>{wsMessages} frames</b>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                💡 <b>คำอธิบาย:</b> เหมือนการยกหูโทรศัพท์คุยค้างไว้ เหมาะสำหรับระบบแชท กราฟหุ้น และติดตามรถไรเดอร์บนแผนที่
              </p>
            </div>
          )}

          {/* Quick Matrix Comparison Table */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <b className="text-blue-600 dark:text-blue-400 block mb-0.5">Polling (ถามซ้ำ)</b>
              <span className="text-[10px] text-slate-500">เหมาะกับ: เช็คสถานะงานที่ไม่รีบ, ปลายทางที่ส่ง Webhook ไม่ได้</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <b className="text-emerald-600 dark:text-emerald-400 block mb-0.5">Webhook</b>
              <span className="text-[10px] text-slate-500">เหมาะกับ: รับเงิน, ผลตรวจ KYC, แจ้งเตือนอีเมล</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <b className="text-amber-600 dark:text-amber-400 block mb-0.5">WebSocket</b>
              <span className="text-[10px] text-slate-500">เหมาะกับ: แชทสด, ตลาดหุ้น, พิกัด GPS ไรเดอร์</span>
            </div>
          </div>
        </div>
      </div>
    );
};
