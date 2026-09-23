import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio, Zap } from 'lucide-react';
import { TAP } from './ui/tapTarget';

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
        <div className="p-box-dense rounded-box bg-base-100 border border-base-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📡</span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-base-content">
                  The Visual Communication Protocol Matrix &amp; Simulator
                </h4>
                <p className="text-[11px] text-base-content-muted">
                  จำลองการสื่อสาร 3 รูปแบบ: โทรเช็คทุก 5 นาที (Polling) vs กริ่งหน้าบ้านดัง (Webhook) vs เปิดสายคุยสด (WebSocket)
                </p>
              </div>
            </div>

            {/* Protocol Switcher */}
            <div className="flex rounded-xl bg-base-300 p-1">
              <button
                onClick={() => { setProtocolMode('polling'); setIsPolling(false); }}
                className={`${TAP} px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  protocolMode === 'polling' ? 'bg-data-1 text-data-content shadow-xs' : 'text-base-content-secondary'
                }`}
              >
                1. Polling (ถามซ้ำ)
              </button>
              <button
                onClick={() => { setProtocolMode('webhook'); setIsPolling(false); setWsConnected(false); }}
                className={`${TAP} px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  protocolMode === 'webhook' ? 'bg-success text-success-content shadow-xs' : 'text-base-content-secondary'
                }`}
              >
                2. Webhook
              </button>
              <button
                onClick={() => { setProtocolMode('websocket'); setIsPolling(false); }}
                className={`${TAP} px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  protocolMode === 'websocket' ? 'bg-warning text-warning-content shadow-xs' : 'text-base-content-secondary'
                }`}
              >
                3. WebSocket
              </button>
            </div>
          </div>

          {/* Interactive Protocol Workspace */}
          {protocolMode === 'polling' && (
            <div className="p-4 rounded-xl bg-data-1/10 border border-data-1/25 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-data-1 flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 text-data-1" />
                  <span>Polling: ฝั่งเราต้องยิงถามเซิร์ฟเวอร์ซ้ำๆ ตลอดเวลา</span>
                </span>
                <button
                  onClick={() => setIsPolling(!isPolling)}
                  className={`${TAP} px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    isPolling ? 'bg-error text-error-content' : 'bg-data-1 text-data-content'
                  }`}
                >
                  {isPolling ? 'หยุด Polling' : 'เริ่ม Polling (จำลองเร็วขึ้น: 1.5 วินาที แทน 5 นาทีจริง)'}
                </button>
              </div>

              <div className="p-3 bg-base-100 rounded-xl border border-data-1/25 text-xs flex items-center justify-between">
                <div>
                  <span className="text-base-content-muted">คำขอที่ยิงไปเปล่าๆ: </span>
                  <b className="text-base text-data-1">{pollCount} ครั้ง</b>
                </div>
                <span className="text-[11px] text-base-content-muted">
                  {pollCount > 0 ? 'ผลลัพธ์ส่วนใหญ่: "ยังไม่มีของมาถึง... ถามซ้ำ"' : 'กดปุ่มเพื่อเริ่มยิงจำลอง'}
                </span>
              </div>
              <p className="text-[11px] text-base-content-muted">
                💡 <b>คำอธิบาย:</b> เหมือนคุณโทรไปหาบริษัทส่งของทุก 5 นาที เปลืองแบตโทรศัพท์และเปลืองเงินทั้งสองฝ่าย (ตัวจำลองนี้เร่งให้เร็วขึ้น ถามทุก 1.5 วินาที เพื่อให้เห็นภาพทันที) เบื้องหลังแต่ละครั้งก็ยังเป็นการเรียก HTTP/REST ธรรมดา ต่างกันแค่ว่าฝั่งเราต้องเป็นคนถาม
              </p>
            </div>
          )}

          {protocolMode === 'webhook' && (
            <div className="p-4 rounded-xl bg-success/10 border border-success/25 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-success flex items-center gap-1.5">
                  <Radio className="w-4 h-4 text-success" />
                  <span>Webhook (Event-Driven): เซิร์ฟเวอร์ยิงมาบอกทันทีที่มีเหตุการณ์</span>
                </span>
                <button
                  onClick={() => {
                    const time = new Date().toLocaleTimeString();
                    setWebhookLogs((prev) => [`[${time}] Event: payment.succeeded - ได้รับเงิน 1,500 บาทจากธนาคารทันที!`, ...prev.slice(0, 2)]);
                  }}
                  className={`${TAP} px-3 py-1 bg-success text-success-content rounded-lg text-xs font-bold cursor-pointer hover:bg-success/90`}
                >
                  กดจำลองลูกค้าสแกนจ่ายเงินสำเร็จ
                </button>
              </div>

              <div className="p-3 bg-base-100 rounded-xl border border-success/25 text-xs space-y-1.5">
                <div className="text-[11px] font-bold text-base-content-muted uppercase">Webhook Event Logs (ยิงเฉพาะตอนเงินเข้า):</div>
                {webhookLogs.length === 0 ? (
                  <span className="text-base-content-muted text-[11px]">ยังไม่มีเหตุการณ์ — ระบบอยู่นิ่งๆ ไม่เปลืองเน็ต</span>
                ) : (
                  webhookLogs.map((log, lIdx) => (
                    <div key={lIdx} className="text-[11px] text-success">
                      ⚡ {log}
                    </div>
                  ))
                )}
              </div>
              <p className="text-[11px] text-base-content-muted">
                💡 <b>คำอธิบาย:</b> เหมือนบุรุษไปรษณีย์มากดกริ่งหน้าบ้านเฉพาะตอนพัสดุมาถึง ประหยัดเน็ต ประหยัดเซิร์ฟเวอร์ และทำงานได้ทันที
              </p>
              <p className="text-[11px] text-base-content-muted">
                ⚠️ <b>ระวัง:</b> Webhook อาจส่งไม่ถึงหรือส่งซ้ำ งานรับเงินจึงต้องมี Retry และกระทบยอดกับธนาคาร (Reconciliation) เป็นประจำ
              </p>
            </div>
          )}

          {protocolMode === 'websocket' && (
            <div className="p-4 rounded-xl bg-warning/10 border border-warning/25 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-warning flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-warning" />
                  <span>WebSocket: ท่อเปิดค้างไว้สองทาง ส่งข้อมูลระดับมิลลิวินาที (Full Duplex)</span>
                </span>
                <button
                  onClick={() => setWsConnected(!wsConnected)}
                  className={`${TAP} px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    wsConnected ? 'bg-error text-error-content' : 'bg-warning text-warning-content'
                  }`}
                >
                  {wsConnected ? 'ตัดการเชื่อมต่อ' : 'เปิดการเชื่อมต่อ (Connect Stream)'}
                </button>
              </div>

              <div className="p-3 bg-base-100 rounded-xl border border-warning/25 text-xs flex items-center justify-between">
                <div>
                  <span className="text-base-content-muted">สถานะท่อข้อมูล: </span>
                  <b className={`text-xs ${wsConnected ? 'text-success' : 'text-base-content-muted'}`}>
                    {wsConnected ? '🟢 OPEN (ต่อสายสด)' : '⚪ CLOSED'}
                  </b>
                </div>
                <div className="text-[11px] text-warning">
                  แพ็กเก็ตแบบเรียลไทม์: <b>{wsMessages} frames</b>
                </div>
              </div>
              <p className="text-[11px] text-base-content-muted">
                💡 <b>คำอธิบาย:</b> เหมือนการยกหูโทรศัพท์คุยค้างไว้ เหมาะสำหรับระบบแชท กราฟหุ้น และติดตามรถไรเดอร์บนแผนที่
              </p>
            </div>
          )}

          {/* Quick Matrix Comparison Table */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-base-300 border border-base-border">
              <b className="text-data-1 block mb-0.5">Polling (ถามซ้ำ)</b>
              <span className="text-[10px] text-base-content-muted">เหมาะกับ: เช็คสถานะงานที่ไม่รีบ, ปลายทางที่ส่ง Webhook ไม่ได้</span>
            </div>
            <div className="p-2.5 rounded-xl bg-base-300 border border-base-border">
              <b className="text-success block mb-0.5">Webhook</b>
              <span className="text-[10px] text-base-content-muted">เหมาะกับ: รับเงิน, ผลตรวจ KYC, แจ้งเตือนอีเมล</span>
            </div>
            <div className="p-2.5 rounded-xl bg-base-300 border border-base-border">
              <b className="text-warning block mb-0.5">WebSocket</b>
              <span className="text-[10px] text-base-content-muted">เหมาะกับ: แชทสด, ตลาดหุ้น, พิกัด GPS ไรเดอร์</span>
            </div>
          </div>
        </div>
      </div>
    );
};
