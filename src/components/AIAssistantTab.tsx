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
  RefreshCw 
} from 'lucide-react';

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
ผมยินดีช่วยคุณคลี่คลายข้อสงสัยและสร้างสะพานเชื่อมระหว่างโลกของ Business และ Engineering

คุณสามารถถามอะไรก็ได้ เช่น:
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
        content: `ขออภัย เกิดข้อผิดพลาดในการรับคำตอบ: ${err.message || 'โปรดตรวจสอบการเชื่อมต่อ'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 pb-16">
      {/* Header Info */}
      <div className="bg-white dark:bg-[#141414] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-neutral-200 dark:border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-800 dark:text-[#d4d4d4] text-[11px] sm:text-xs font-semibold border border-neutral-200 dark:border-[#333333]">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>AI Bridge Assistant Powered by Gemini</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-neutral-900 dark:text-[#fafafa]">
            ถาม AI เพิ่มเติม &amp; ปรึกษาสถานการณ์จริง
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#8e8e8e]">
            ไขข้อสงสัย เจรจาหาทางออกตรงจุด และแปลคำศัพท์ข้ามสายงานได้ทันที
          </p>
        </div>

        {/* Perspective selector */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-[#1a1a1a] p-1 rounded-xl border border-neutral-200 dark:border-[#262626] shrink-0 shadow-2xs">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-[#737373] px-2 font-mono">มุมมอง:</span>
          {(['both', 'business', 'engineer'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRolePerspective(r)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                rolePerspective === r
                  ? 'bg-white dark:bg-[#262626] text-neutral-900 dark:text-white shadow-2xs font-bold'
                  : 'text-neutral-500 dark:text-[#737373] hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              {r === 'both' ? 'ทั้งคู่' : r === 'business' ? 'Business' : 'Engineer'}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-[#8e8e8e]">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>คำถามยอดฮิตที่เลือกถามได้ทันที:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-[#141414] hover:bg-neutral-50 dark:hover:bg-[#1c1c1c] text-neutral-700 dark:text-[#c4c4c4] border border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-[#404040] transition-all text-left cursor-pointer shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Conversation Thread */}
      <div className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 min-h-[420px] max-h-[600px] overflow-y-auto space-y-4 shadow-2xs">
        {messages.map((msg) => {
          const isAi = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white ${
                  isAi ? 'bg-neutral-900 dark:bg-white dark:text-[#0a0a0a]' : 'bg-neutral-700 dark:bg-[#333333]'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  isAi
                    ? 'bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] text-neutral-800 dark:text-[#e5e5e5]'
                    : 'bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] shadow-xs'
                }`}
              >
                {isAi ? (
                  <div className="markdown-body space-y-2.5 leading-relaxed break-words text-xs sm:text-sm">
                    <Markdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-[#fafafa] mt-3 mb-1.5 border-b border-neutral-200 dark:border-[#262626] pb-1">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-[#fafafa] mt-2.5 mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xs sm:text-sm font-bold text-neutral-800 dark:text-[#d4d4d4] mt-2 mb-0.5">{children}</h3>,
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed text-neutral-700 dark:text-[#d4d4d4]">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 text-neutral-700 dark:text-[#d4d4d4]">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-neutral-700 dark:text-[#d4d4d4]">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-neutral-400 dark:border-[#555555] pl-3 italic text-neutral-700 dark:text-[#c4c4c4] my-2 bg-neutral-100/60 dark:bg-[#202020] py-1.5 rounded-r-lg">
                            {children}
                          </blockquote>
                        ),
                        code: ({ className, children, ...props }: any) => {
                          const isInline = !String(children).includes('\n') && !className;
                          if (isInline) {
                            return (
                              <code className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-[#262626] text-neutral-900 dark:text-[#e5e5e5] font-mono text-[11px] sm:text-xs" {...props}>
                                {children}
                              </code>
                            );
                          }
                          return (
                            <div className="my-2.5 rounded-xl overflow-hidden border border-neutral-200 dark:border-[#262626] bg-[#0a0a0a] text-neutral-100 p-3 font-mono text-xs overflow-x-auto">
                              <code {...props}>{children}</code>
                            </div>
                          );
                        },
                        table: ({ children }) => (
                          <div className="my-2.5 overflow-x-auto rounded-xl border border-neutral-200 dark:border-[#262626]">
                            <table className="w-full text-left border-collapse text-xs">{children}</table>
                          </div>
                        ),
                        th: ({ children }) => <th className="bg-neutral-100 dark:bg-[#222222] p-2.5 font-bold border-b border-neutral-200 dark:border-[#262626] text-neutral-900 dark:text-[#fafafa]">{children}</th>,
                        td: ({ children }) => <td className="p-2.5 border-b border-neutral-100 dark:border-[#262626] text-neutral-700 dark:text-[#c4c4c4]">{children}</td>,
                        strong: ({ children }) => <strong className="font-bold text-neutral-900 dark:text-[#fafafa]">{children}</strong>,
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
                  <div className="flex items-center justify-between pt-2 border-t border-neutral-200/60 dark:border-[#262626] text-[11px] text-neutral-500 dark:text-[#8e8e8e] font-mono">
                    <span className="flex items-center gap-1">
                      {msg.source === 'gemini' ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">● Gemini Model</span>
                      ) : (
                        <span>● Expert Assistant</span>
                      )}
                      <span>• {msg.timestamp}</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">คัดลอกแล้ว</span>
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
            <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white dark:text-[#0a0a0a] flex items-center justify-center text-white shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#262626] text-xs text-neutral-600 dark:text-[#a3a3a3] flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
              <span>กำลังวิเคราะห์และเรียบเรียงคำตอบ...</span>
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
          className="w-full pl-4 sm:pl-5 pr-28 py-3.5 bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-xl sm:rounded-2xl text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa] placeholder-neutral-400 dark:placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 shadow-2xs"
        />
        <button
          type="submit"
          disabled={!inputQuestion.trim() || isLoading}
          className="absolute right-2 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-[#0a0a0a] disabled:opacity-40 rounded-lg sm:rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>ส่งคำถาม</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
