import React, { useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Loader2, 
  HelpCircle, 
  User, 
  Copy, 
  Check, 
  Lightbulb, 
  RefreshCw,
  WifiOff
} from 'lucide-react';
import { TAP, TAP_GAP } from './ui/tapTarget';
import { Button } from './ui/Button';
import { IconBadge } from './ui/IconBadge';
import { Alert } from './ui/Alert';

interface AIAssistantTabProps {
  initialPrompt?: string;
  onQuestionAsked: () => void;
}

export const AIAssistantTab: React.FC<AIAssistantTabProps> = ({
  initialPrompt = '',
  onQuestionAsked,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `สวัสดีครับ! ผมคือ **AI Bridge Specialist** 🤖
ผมช่วยตอบข้อสงสัยเรื่องงานระหว่าง Business กับ Engineering ได้

คุณถามอะไรก็ได้ เช่น:
- ขอวิธีอธิบายศัพท์เทคนิคยากๆ ให้ผู้บริหารฟัง
- ขอเหตุผลให้ Developer เข้าใจความเร่งด่วนของธุรกิจ
- ปรึกษากรณีความขัดแย้งในที่ประชุม หรือวิธีประเมินงาน
- ขอตัวอย่าง Acceptance Criteria หรือ User Story`,
      timestamp: 'ตอนนี้',
    },
  ]);

  const [inputQuestion, setInputQuestion] = useState(initialPrompt);
  const [rolePerspective, setRolePerspective] = useState<'both' | 'business' | 'engineer'>('both');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quickPrompts = [
    'ลูกค้าขอ "เพิ่มปุ่มเดียว" ช่วยอธิบายงานใต้น้ำให้ฟังหน่อย',
    'ช่วยเขียน Acceptance Criteria ให้ระบบชำระเงิน',
    'PM กับ Dev เถียงกันเรื่อง Deadline ควรแก้ปัญหายังไง?',
    'อธิบาย NFR เรื่อง Scalability แบบภาษาบ้านๆ',
    'เปรียบเทียบ Trunk-based กับ Git-flow เหมาะกับทีมแบบไหน?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputQuestion;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setIsLoading(true);
    onQuestionAsked();

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          role: rolePerspective,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server error');
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `ขออภัย รับคำตอบไม่สำเร็จ: ${err.message || 'ลองเช็กการเชื่อมต่อ'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Source of the most recent server answer ('gemini' | 'fallback' | undefined before any answer).
  const lastSource = [...messages].reverse().find((m) => m.role === 'assistant' && m.source)?.source;
  const isOffline = lastSource !== undefined && lastSource !== 'gemini';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-section pb-16">
      {isOffline && (
        <Alert color="warning" live icon={<WifiOff className="w-4 h-4" />}>
          <p>
            <strong className="font-semibold">โหมดออฟไลน์:</strong> ยังไม่ได้เชื่อมต่อ AI จริง คำตอบเป็นคำแนะนำทั่วไป
          </p>
        </Alert>
      )}

      {/* Header Info */}
      <div className="bg-base-100 p-box-spacious rounded-box border border-base-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-base-300 text-base-content-body text-[11px] sm:text-xs font-semibold border border-base-border">
            <Sparkles className="w-3 h-3 text-warning" />
            <span>{lastSource === 'gemini' ? 'AI Bridge Assistant Powered by Gemini' : 'AI Bridge Assistant'}</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-base-content">
            ถาม AI เพิ่มเติม &amp; ปรึกษาสถานการณ์จริง
          </h2>
          <p className="text-xs sm:text-sm text-base-content-muted">
            ถามข้อสงสัย หาทางออก และแปลศัพท์ข้ามสายงานได้ทันที
          </p>
        </div>

        {/* Perspective selector */}
        <div className="flex items-center gap-1 bg-base-300 p-1 rounded-xl border border-base-border shrink-0 shadow-2xs">
          <span className="text-[11px] font-semibold text-base-content-muted px-2">มุมมอง:</span>
          {(['both', 'business', 'engineer'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRolePerspective(r)}
              className={`${TAP} px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                rolePerspective === r
                  ? 'bg-base-100 text-base-content shadow-2xs font-bold'
                  : 'text-base-content-muted hover:text-base-content'
              }`}
            >
              {r === 'both' ? 'ทั้งคู่' : r === 'business' ? 'Business' : 'Engineer'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content-muted">
          <Lightbulb className="w-3.5 h-3.5 text-warning" />
          <span>คำถามยอดฮิตที่เลือกถามได้ทันที:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className={`${TAP_GAP[8]} text-xs px-3 py-1.5 rounded-xl bg-base-100 hover:bg-base-300 text-base-content-body border border-base-border hover:border-base-border-strong transition-all text-left cursor-pointer shadow-2xs`}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Thread */}
      <div className="bg-base-100 border border-base-border rounded-box p-box-spacious min-h-[420px] max-h-[600px] overflow-y-auto space-y-4 shadow-2xs">
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
            >
              <IconBadge size="md">{isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}</IconBadge>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-box p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  isAi
                    ? 'bg-base-300 border border-base-border text-base-content'
                    : 'bg-base-300 text-base-content border border-base-border'
                }`}
              >
                {isAi ? (
                  <div className="markdown-body space-y-2.5 leading-relaxed break-words text-xs sm:text-sm">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-base sm:text-lg font-bold text-base-content mt-3 mb-1.5 border-b border-base-border pb-1">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm sm:text-base font-bold text-base-content mt-2.5 mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xs sm:text-sm font-bold text-base-content-body mt-2 mb-0.5">{children}</h3>,
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-base-content-body">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-base-content-body">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-base-content-body">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-base-border-strong pl-3 italic text-base-content-body my-2 bg-base-100 py-1.5 rounded-r-lg">
                            {children}
                          </blockquote>
                        ),
                        code: ({ className, children, ...props }: any) => {
                          const isInline = !String(children).includes('\n') && !className;
                          if (isInline) {
                            return (
                              <code className="px-1.5 py-0.5 rounded bg-base-border text-base-content text-[11px] sm:text-xs" {...props}>
                                {children}
                              </code>
                            );
                          }
                          return (
                            <div className="my-2.5 rounded-xl overflow-hidden border border-base-border bg-neutral text-neutral-content p-3 text-xs overflow-x-auto">
                              <code {...props}>{children}</code>
                            </div>
                          );
                        },
                        table: ({ children }) => (
                          <div className="my-2.5 overflow-x-auto rounded-xl border border-base-border">
                            <table className="w-full text-left border-collapse text-xs">{children}</table>
                          </div>
                        ),
                        th: ({ children }) => <th className="bg-base-300 p-2.5 font-bold border-b border-base-border text-base-content">{children}</th>,
                        td: ({ children }) => <td className="p-2.5 border-b border-base-border text-base-content-body">{children}</td>,
                        strong: ({ children }) => <strong className="font-bold text-base-content">{children}</strong>,
                      }}
                    >
                      {msg.content}
                    </Markdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-line break-words font-medium">
                    {msg.content}
                  </div>
                )}

                {isAi && (
                  <div className="flex items-center justify-between pt-2 border-t border-base-border text-[11px] text-base-content-muted">
                    <span className="flex items-center gap-1">
                      {msg.source === 'gemini' ? (
                        <span className="text-warning font-semibold">● Gemini Model</span>
                      ) : (
                        <span>{msg.source ? '● โหมดออฟไลน์ (คำแนะนำทั่วไป)' : '● Expert Assistant'}</span>
                      )}
                      <span>• {msg.timestamp}</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className={`${TAP} hover:text-base-content flex items-center gap-1 cursor-pointer transition-colors`}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-success" />
                          <span className="text-success font-semibold">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>คัดลอก</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3">
            <IconBadge size="md"><Bot className="w-4 h-4" /></IconBadge>
            <div className="p-3 rounded-box bg-base-300 border border-base-border text-xs text-base-content-secondary flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-base-content-muted" />
              <span>กำลังคิดคำตอบ...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder="พิมพ์คำถามของคุณ เช่น 'ทำไม Dev ถึงบ่นเรื่อง Flaky test?' หรือ 'วิธีเขียน User story ที่ดี'..."
          disabled={isLoading}
          className="w-full pl-4 sm:pl-5 pr-28 py-3.5 bg-base-100 border border-base-border rounded-box text-xs sm:text-sm text-base-content placeholder-base-content-subtle focus:outline-none focus:ring-1 focus:ring-base-border-strong shadow-2xs"
        />
        <Button
          type="submit"
          color="primary" variant="solid"
          size="sm"
          tap="positioned"
          disabled={!inputQuestion.trim() || isLoading}
          className="absolute right-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>ส่งคำถาม</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
