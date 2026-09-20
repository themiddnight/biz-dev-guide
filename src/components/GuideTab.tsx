import React, { useState, useEffect } from 'react';
import { Chapter, AudienceMode } from '../types';
import { ChapterDiagram } from './ChapterDiagram';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Bot, 
  Sparkles, 
  Layers, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown, 
  ChevronUp,
  Info,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  CheckSquare,
  Square,
  Workflow,
  BookOpen,
  ShieldAlert,
  List,
  X,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  MessageSquare,
  Check,
  Share2,
  SlidersHorizontal
} from 'lucide-react';

interface GuideTabProps {
  chapters: Chapter[];
  audienceMode: AudienceMode;
  plainModeEnabled: boolean;
  bookmarks: string[];
  readChapters?: string[];
  onToggleBookmark: (chapterId: string) => void;
  onToggleReadChapter?: (chapterId: string) => void;
  onAskAIWithPrompt: (prompt: string) => void;
  onStartQuiz: () => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({
  chapters,
  audienceMode,
  plainModeEnabled,
  bookmarks,
  readChapters = [],
  onToggleBookmark,
  onToggleReadChapter,
  onAskAIWithPrompt,
  onStartQuiz,
}) => {
  const [activeChapterId, setActiveChapterId] = useState<string>('s1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({});
  const [c4Level, setC4Level] = useState<number>(1);
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(1);

  // Accordion section states for the active chapter
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    primer: true,
    jargon: true,
    dialogue: true,
    diagram: true,
    coreConcepts: true,
    workflow: false,
    pitfalls: false,
    checklist: false,
  });

  // Find active chapter object
  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];
  const activeIndex = chapters.findIndex(c => c.id === activeChapterId);
  const prevChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
  const nextChapter = activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;

  const isCurrentBookmarked = bookmarks.includes(activeChapter.id);
  const isCurrentRead = readChapters.includes(activeChapter.id);

  // Scroll to top when active chapter changes
  const handleSelectChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setIsIndexOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const expandAllSections = () => {
    setOpenSections({
      primer: true,
      jargon: true,
      dialogue: true,
      diagram: true,
      coreConcepts: true,
      workflow: true,
      pitfalls: true,
      checklist: true,
    });
  };

  const collapseAllSections = () => {
    setOpenSections({
      primer: false,
      jargon: false,
      dialogue: false,
      diagram: false,
      coreConcepts: false,
      workflow: false,
      pitfalls: false,
      checklist: false,
    });
  };

  const toggleChecklistItem = (key: string) => {
    setCheckedChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Filtered chapters for the Index
  const filteredChapters = chapters.filter((ch) => {
    const matchesSearch = 
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.plainAnalogy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ch.jargonList && ch.jargonList.some(j => j.term.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesRole = 
      selectedRole === 'all' || 
      ch.roleTag === selectedRole || 
      ch.roleTag === 'all';

    return matchesSearch && matchesRole;
  });

  const percentCompleted = Math.round((readChapters.length / chapters.length) * 100);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Welcome & Quick Jump Banner */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-950/40 dark:via-zinc-900 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>โหมดอ่านทีละบท พร้อมสารบัญกระโดดข้ามได้ตลอดเวลา</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              คู่มือสองโลก Business ↔ Engineering (15 บทฉบับเริ่มจาก 0)
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              ครอบคลุมปฐมบทสำหรับมือใหม่ ศัพท์เทคนิคแปลเป็นภาษาคน ตัวอย่างบทสนทนาจริงในที่ทำงาน แผนภาพจำลองระบบ และทางออกของข้อขัดแย้ง
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Open Table of Contents Button */}
            <button
              onClick={() => setIsIndexOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <List className="w-4 h-4" />
              <span>สารบัญทั้ง 15 บท (Index)</span>
            </button>

            <button
              onClick={onStartQuiz}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs sm:text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-500" />
              <span>ทำควิซสะสม XP</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 pt-4 border-t border-indigo-100/80 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>ความคืบหน้าการอ่าน: อ่านจบแล้ว {readChapters.length} จาก {chapters.length} บท ({percentCompleted}%)</span>
          </div>
          <div className="w-full sm:w-64 h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${percentCompleted}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Index + Chapter Reader Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Persistent Sticky Index on Desktop (Hidden on smaller screens, accessed via drawer/modal) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 shadow-sm space-y-4 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">สารบัญบทเรียน (15 บท)</h3>
              </div>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                บทที่ {activeIndex + 1}/{chapters.length}
              </span>
            </div>

            {/* Quick Search in Index */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาบท หรือ คำศัพท์..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Role Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {[
                { id: 'all', label: 'ทั้งหมด' },
                { id: 'pm', label: 'PM' },
                { id: 'ux', label: 'UX' },
                { id: 'ba', label: 'BA' },
                { id: 'sa', label: 'SA' },
                { id: 'eng', label: 'Dev' },
                { id: 'qa', label: 'QA' },
                { id: 'friction', label: 'ขัดแย้ง' },
              ].map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedRole === role.id
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200'
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* Chapter List Scrollable */}
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 scrollbar-thin">
              {filteredChapters.map((chapter) => {
                const isActive = chapter.id === activeChapterId;
                const isRead = readChapters.includes(chapter.id);
                const isBookmarked = bookmarks.includes(chapter.id);

                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleSelectChapter(chapter.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-xs'
                        : 'bg-zinc-50/50 dark:bg-zinc-850/50 border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 hover:bg-zinc-100/80 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isRead
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}>
                      {isRead && !isActive ? <Check className="w-3.5 h-3.5" /> : chapter.num}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs font-semibold truncate ${
                          isActive ? 'text-indigo-950 dark:text-indigo-200 font-bold' : 'text-zinc-800 dark:text-zinc-200'
                        }`}>
                          {chapter.title}
                        </span>
                        {isBookmarked && (
                          <BookmarkCheck className="w-3 h-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-zinc-400">
                        <span className="uppercase font-mono">{chapter.roleTag}</span>
                        <span>•</span>
                        <span>{chapter.readTime}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Chapter Reader Card ("บทละหน้า") */}
        <div className="lg:col-span-8 space-y-6">
          {/* Chapter Top Navigation Bar */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {/* Prev Chapter Button */}
              <button
                disabled={!prevChapter}
                onClick={() => prevChapter && handleSelectChapter(prevChapter.id)}
                className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
                  prevChapter
                    ? 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer'
                    : 'border-zinc-100 dark:border-zinc-850 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                }`}
                title={prevChapter ? `บทก่อนหน้า: ${prevChapter.title}` : 'นี่คือบทแรก'}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">บทก่อนหน้า</span>
              </button>

              {/* Mobile Table of Contents Toggle */}
              <button
                onClick={() => setIsIndexOpen(true)}
                className="lg:hidden px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <List className="w-3.5 h-3.5" />
                <span>สารบัญ ({activeChapter.num}/15)</span>
              </button>

              {/* Current Chapter Indicator on Desktop */}
              <div className="hidden lg:flex items-center gap-2 pl-2">
                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                  บทที่ {activeChapter.num} จาก {chapters.length}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[200px]">
                  {activeChapter.title}
                </span>
              </div>
            </div>

            {/* Next Chapter & Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Mark as read toggle */}
              {onToggleReadChapter && (
                <button
                  onClick={() => onToggleReadChapter(activeChapter.id)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isCurrentRead
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100'
                  }`}
                  title="ทำเครื่องหมายว่าอ่านและเข้าใจบทนี้แล้ว (+30 XP)"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrentRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`} />
                  <span className="hidden md:inline">{isCurrentRead ? 'อ่านแล้ว' : 'ทำเครื่องหมายว่าอ่านแล้ว'}</span>
                </button>
              )}

              {/* Bookmark Toggle */}
              <button
                onClick={() => onToggleBookmark(activeChapter.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isCurrentBookmarked
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                    : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-600'
                }`}
                title={isCurrentBookmarked ? 'ลบบุ๊กมาร์ก' : 'บันทึกบทนี้ (+15 XP)'}
              >
                {isCurrentBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>

              {/* Next Chapter Button */}
              <button
                disabled={!nextChapter}
                onClick={() => nextChapter && handleSelectChapter(nextChapter.id)}
                className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
                  nextChapter
                    ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 cursor-pointer'
                    : 'border-zinc-100 dark:border-zinc-850 text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                }`}
                title={nextChapter ? `บทถัดไป: ${nextChapter.title}` : 'นี่คือบทสุดท้าย'}
              >
                <span className="hidden sm:inline">บทถัดไป</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chapter Main Content Reader Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-8 shadow-sm space-y-7">
            
            {/* Chapter Header */}
            <div className="space-y-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                  {activeChapter.num}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                  {activeChapter.roleTag}
                </span>
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  {activeChapter.readTime}
                </span>
                {isCurrentRead && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    <Check className="w-3 h-3" />
                    ผ่านแล้ว
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
                {activeChapter.title}
              </h1>
              <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                {activeChapter.subtitle}
              </p>

              {/* Expand/Collapse All Accordion Control */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-zinc-400">
                  คลิกที่หัวข้อเพื่อเปิด/ปิดเนื้อหาย่อย หรือดูทีละส่วน
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={expandAllSections}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
                  >
                    ขยายทั้งหมด
                  </button>
                  <span className="text-zinc-300 dark:text-zinc-700">|</span>
                  <button
                    onClick={collapseAllSections}
                    className="text-xs text-zinc-500 hover:underline font-semibold cursor-pointer"
                  >
                    ย่อทั้งหมด
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Perspective & Metaphor Box */}
            <div className="space-y-3">
              {/* Plain Language Metaphor (เปรียบแบบบ้านๆ) */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>เปรียบแบบบ้านๆ (Real-World Analogy)</span>
                </div>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-200 leading-relaxed">
                  {activeChapter.plainAnalogy}
                </p>
              </div>

              {/* Audience Perspectives (Business & Engineer Notes) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(audienceMode === 'business' || audienceMode === 'both') && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <Info className="w-4 h-4 text-amber-600" />
                      <span>มุมมองฝั่ง Business</span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {activeChapter.businessNote}
                    </p>
                  </div>
                )}

                {(audienceMode === 'engineer' || audienceMode === 'both') && (
                  <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/60 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      <span>มุมมองฝั่ง Engineer</span>
                    </div>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {activeChapter.engineerNote}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 1: ปฐมบทสำหรับมือใหม่ (Beginner Primer) */}
            {activeChapter.beginnerPrimer && (
              <div className="border border-indigo-200/80 dark:border-indigo-900/60 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
                <button
                  onClick={() => toggleSection('primer')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/30 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      🌟
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-indigo-950 dark:text-indigo-200">
                        ปฐมบทสำหรับมือใหม่ (ปูพื้นฐานจาก 0)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        อธิบายเรื่องนี้แบบไม่ใช้ศัพท์ยาก เข้าใจได้แม้ไม่เคยเขียนโค้ด
                      </p>
                    </div>
                  </div>
                  {openSections.primer ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </button>

                {openSections.primer && (
                  <div className="p-4 sm:p-6 space-y-4 border-t border-indigo-100 dark:border-indigo-900/50 bg-white dark:bg-zinc-900 text-xs sm:text-sm">
                    <div className="space-y-1.5">
                      <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                        <span>สิ่งนี้คืออะไร? (What is it?)</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed pl-3">
                        {activeChapter.beginnerPrimer.whatIsIt}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                        <span>ทำไมถึงสำคัญมาก? ถ้าไม่มีจะเกิดอะไรขึ้น? (Why it matters?)</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed pl-3">
                        {activeChapter.beginnerPrimer.whyItMatters}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                      <div className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-amber-500" />
                        <span>สถานการณ์จริงในชีวิตประจำวัน (Real-World Analogy Scenario)</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {activeChapter.beginnerPrimer.realWorldScenario}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: พจนานุกรมศัพท์จำเป็น (Jargon Buster) */}
            {activeChapter.jargonList && activeChapter.jargonList.length > 0 && (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
                <button
                  onClick={() => toggleSection('jargon')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-850/50 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      📖
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                        พจนานุกรมคำศัพท์จำเป็น (Jargon Buster)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        ศัพท์เทคนิคประจำบท แปลเป็นภาษาคนแบบเห็นภาพชัดเจน ({activeChapter.jargonList.length} คำ)
                      </p>
                    </div>
                  </div>
                  {openSections.jargon ? <ChevronUp className="w-5 h-5 text-purple-500" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </button>

                {openSections.jargon && (
                  <div className="p-4 sm:p-6 grid grid-cols-1 gap-3.5 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    {activeChapter.jargonList.map((item, jIdx) => (
                      <div 
                        key={jIdx}
                        className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2 text-xs sm:text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-indigo-700 dark:text-indigo-400 text-sm sm:text-base">
                            {item.term}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[11px] font-semibold">
                            ศัพท์เทคนิค
                          </span>
                        </div>
                        <div className="text-zinc-500 dark:text-zinc-400 text-xs">
                          <span className="font-semibold text-zinc-600 dark:text-zinc-300">นิยามทางการ: </span>
                          <span>{item.formalDefinition}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs leading-relaxed">
                          <span className="font-bold">🗣️ แปลภาษาคน: </span>
                          <span>{item.humanTranslation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 3: ตัวอย่างบทสนทนาจริงในที่ทำงาน (Workplace Dialogue) */}
            {activeChapter.dialogueExample && (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
                <button
                  onClick={() => toggleSection('dialogue')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-850/50 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                      💬
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                        บทสนทนาจริงในที่ทำงาน (วิธีพูดที่พัง vs วิธีพูดที่ปัง)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        เปรียบเทียบประโยคพูดคุยในห้องประชุม พร้อมบทเรียนการสื่อสาร
                      </p>
                    </div>
                  </div>
                  {openSections.dialogue ? <ChevronUp className="w-5 h-5 text-amber-500" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </button>

                {openSections.dialogue && (
                  <div className="p-4 sm:p-6 space-y-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                      <span className="font-bold text-zinc-800 dark:text-zinc-100">บริบทสถานการณ์: </span>
                      {activeChapter.dialogueExample.context}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Wrong Way */}
                      <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/50 space-y-2.5 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
                          <ShieldAlert className="w-4 h-4 text-rose-600" />
                          <span>❌ วิธีพูดที่สร้างปัญหา (Wrong Way)</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-rose-100 dark:border-rose-950 text-rose-950 dark:text-rose-100 italic">
                          {activeChapter.dialogueExample.wrongWay.speaker}
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                          {activeChapter.dialogueExample.wrongWay.text}
                        </p>
                        <div className="text-[11px] text-rose-700 dark:text-rose-400 font-semibold pt-1">
                          ⚠️ ผลเสีย: {activeChapter.dialogueExample.wrongWay.issue}
                        </div>
                      </div>

                      {/* Right Way */}
                      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/50 space-y-2.5 text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>✅ วิธีพูดที่ถูกต้องและได้ผล (Right Way)</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-950 text-emerald-950 dark:text-emerald-100 italic">
                          {activeChapter.dialogueExample.rightWay.speaker}
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                          {activeChapter.dialogueExample.rightWay.text}
                        </p>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold pt-1">
                          💡 ผลลัพธ์: {activeChapter.dialogueExample.rightWay.benefit}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 4: อินโฟกราฟิก & แผนภาพจำลองกระบวนการ (Visual Diagram) */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
              <button
                onClick={() => toggleSection('diagram')}
                className="w-full p-4 sm:p-5 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-850/50 text-left cursor-pointer select-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    🗺️
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {activeChapter.diagramTitle || `แผนภาพโครงสร้างและกระบวนการบทที่ ${activeChapter.num}`}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {activeChapter.diagramDescription || 'แผนภาพจำลองสถาปัตยกรรมและกระบวนการทำงานร่วมกัน'}
                    </p>
                  </div>
                </div>
                {openSections.diagram ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
              </button>

              {openSections.diagram && (
                <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/60 space-y-5">
                  {/* Structured Visual Illustration & Metaphor Schema */}
                  {activeChapter.illustrations && activeChapter.illustrations.length > 0 && (
                    <div className="space-y-4">
                      {activeChapter.illustrations.map((ill) => (
                        <div 
                          key={ill.id}
                          className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 shadow-2xs space-y-3.5"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2.5">
                              <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                🎨 Visual Architecture
                              </span>
                              <div>
                                <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                  {ill.title}
                                </h4>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                  {ill.subtitle}
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 text-[10px] font-mono">
                              Type: {ill.svgType}
                            </span>
                          </div>

                          {/* Visual Analogy Metaphor */}
                          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1">
                            <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                              <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                              <span>ภาพเปรียบเทียบในชีวิตจริง (Mental Model Metaphor)</span>
                            </div>
                            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-[11px] sm:text-xs">
                              {ill.visualMetaphor}
                            </p>
                          </div>

                          {/* Structured SVG Visual Blueprint Scene */}
                          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-[11px] space-y-1">
                            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider block">
                              📐 โครงสร้างแผนผังเชิงนามธรรม (Visual Blueprint Scene):
                            </span>
                            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                              {ill.svgDescription}
                            </p>
                          </div>

                          {/* Visual Elements Matrix */}
                          {ill.elements && ill.elements.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              <span className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300 block">
                                องค์ประกอบสำคัญในแผนภาพ ({ill.elements.length} ส่วน):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                                {ill.elements.map((elem, eIdx) => (
                                  <div 
                                    key={eIdx}
                                    className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/70 space-y-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-[11px] text-zinc-900 dark:text-zinc-100 truncate">
                                        {elem.label}
                                      </span>
                                      <span 
                                        className="w-2.5 h-2.5 rounded-full shrink-0" 
                                        style={{ backgroundColor: elem.color }}
                                      />
                                    </div>
                                    <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                                      {elem.role}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal">
                                      {elem.detail}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Key Takeaway */}
                          <div className="pt-1 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span><b>สาระสำคัญ:</b> {ill.takeaway}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Chapter Diagram Simulator */}
                  <ChapterDiagram chapterId={activeChapter.id} />

                  {/* Interactive C4 Model Zoom for Chapter 5 */}
                  {activeChapter.id === 's5' && (
                    <div className="mt-4 p-5 rounded-2xl bg-white dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-500" />
                          <span>Interactive C4 Model Explorer (คลิกซูมเข้าดูทีละระดับ)</span>
                        </h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4].map((lvl) => (
                            <button
                              key={lvl}
                              onClick={() => setC4Level(lvl)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                c4Level === lvl
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                              }`}
                            >
                              L{lvl}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm space-y-1">
                        {c4Level === 1 && (
                          <div>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">Level 1: System Context</span>
                            <p className="text-zinc-600 dark:text-zinc-300 mt-1">
                              ซูมออกสุด เห็นระบบเป็นกล่องเดียวตรงกลาง ล้อมรอบด้วย Actor (ลูกค้า, ร้านค้า, ไรเดอร์) และระบบภายนอก (Payment Gateway, Map API) — <b>เหมาะที่สุดสำหรับ Business Stakeholders และผู้บริหาร</b>
                            </p>
                          </div>
                        )}
                        {c4Level === 2 && (
                          <div>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">Level 2: Container Diagram</span>
                            <p className="text-zinc-600 dark:text-zinc-300 mt-1">
                              ซูมเข้ามา 1 ชั้น เห็นหน่วยที่ Deploy แยกกันได้ เช่น Single Page App, Mobile App, Backend API, Database — <b>เหมาะสำหรับ Tech Lead &amp; Software Architects</b>
                            </p>
                          </div>
                        )}
                        {c4Level === 3 && (
                          <div>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">Level 3: Component Diagram</span>
                            <p className="text-zinc-600 dark:text-zinc-300 mt-1">
                              ซูมเข้าไปในหนึ่ง Container (เช่น Backend API) แสดงโมดูลย่อย เช่น OrderComponent, PaymentController, NotificationService — <b>เหมาะสำหรับทีม Developer ที่ Implement</b>
                            </p>
                          </div>
                        )}
                        {c4Level === 4 && (
                          <div>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">Level 4: Code Diagram (UML Class)</span>
                            <p className="text-zinc-600 dark:text-zinc-300 mt-1">
                              ซูมระดับ Class / Functions ในโค้ดจริง — <i>คำแนะนำ:</i> มักไม่ต้องวาดมือเพราะโค้ดเปลี่ยนเร็ว ให้ IDE สร้างอัตโนมัติ
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interactive Friction Scenarios for Chapter 11 */}
                  {activeChapter.id === 's11' && (
                    <div className="mt-4 space-y-2.5">
                      <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span>คลิกเพื่อดูทางออกของ 4 ข้อขัดแย้งยอดนิยมตลอดกาล:</span>
                      </h4>

                      {[
                        {
                          id: 1,
                          q: 'ทำไม "แค่เพิ่มปุ่มเดียว" ถึงใช้เวลาเป็นสัปดาห์?',
                          root: 'ปุ่มที่ตาเห็นคือ 5% ที่เหลือคือ logic คืนเงิน ตัดสต็อก แจ้งเตือนร้านค้า และ edge cases',
                          script: 'ถามว่า: "เวอร์ชันที่เล็กที่สุดที่ยังใช้งานได้ (MVP) มีอะไรบ้าง ตัดเงื่อนไขไหนออกก่อนได้บ้าง?"',
                        },
                        {
                          id: 2,
                          q: 'ทำไม Requirement ถึงเปลี่ยนบ่อย ไม่มีวิธีรับมือเลยเหรอ?',
                          root: 'โลกธุรกิจเปลี่ยนจริง (คู่แข่ง/ผู้ใช้) แต่ถ้ากระบวนการหย่อนจะเกิด Scope Creep เงียบๆ',
                          script: 'ถามหา "ทำไม" เบื้องหลังความต้องการเสมอ และทำระบบ Change Request เบาๆ เพื่อให้เห็นต้นทุน',
                        },
                        {
                          id: 3,
                          q: 'ทำไมงาน Technical Debt ไม่เคยได้เข้า Sprint สักที?',
                          root: 'ทีม Dev เสนอด้วยศัพท์เทคนิคที่ Business คำนวณความคุ้มค่าไม่ถูก เลยแพ้ Feature ใหม่เสมอ',
                          script: 'Dev ต้องแปลเป็นความเสี่ยง: "ถ้าไม่แก้ตรงนี้ เมื่อยอดขายโต 2 เท่า ระบบจะรับไม่ไหวและส่งผลให้สูญเสียรายได้ X บาท"',
                        },
                        {
                          id: 4,
                          q: 'ทำไม Estimate ไม่เคยตรง แล้วจะวางแผนธุรกิจยังไง?',
                          root: 'Cone of Uncertainty: วันแรกคือวันที่รู้น้อยที่สุด การขอตัวเลขเป๊ะๆ คือการขอสิ่งที่ไม่มีอยู่จริง',
                          script: 'ขอ Estimate เป็นช่วง (เช่น 2-4 สัปดาห์) พร้อมระบุสมมติฐาน และมี Checkpoint ตรวจสอบความคืบหน้าถี่ๆ',
                        },
                      ].map((item) => (
                        <div 
                          key={item.id}
                          className="p-3.5 bg-white dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2"
                        >
                          <div 
                            onClick={() => setExpandedFaqId(expandedFaqId === item.id ? null : item.id)}
                            className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 flex items-center justify-between cursor-pointer select-none"
                          >
                            <span>{item.q}</span>
                            <span className="text-zinc-400">{expandedFaqId === item.id ? '−' : '+'}</span>
                          </div>
                          {expandedFaqId === item.id && (
                            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-700 text-xs space-y-2">
                              <div>
                                <span className="font-semibold text-zinc-500">สาเหตุที่แท้จริง: </span>
                                <span className="text-zinc-700 dark:text-zinc-300">{item.root}</span>
                              </div>
                              <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                <span className="font-bold text-emerald-800 dark:text-emerald-300">ประโยคทางออกในห้องประชุม: </span>
                                <span className="text-emerald-900 dark:text-emerald-200">{item.script}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECTION 5: ความรู้เชิงลึก & แนวคิดหลัก (Core Concepts) */}
            {activeChapter.coreConcepts && activeChapter.coreConcepts.length > 0 && (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
                <button
                  onClick={() => toggleSection('coreConcepts')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-850/50 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                      💡
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                        ความรู้เชิงลึกและหลักการสำคัญ (Core Deep-Dive Concepts)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        แนวคิดและทฤษฎีสำคัญที่ใช้ในการทำงานจริง ({activeChapter.coreConcepts.length} หัวข้อ)
                      </p>
                    </div>
                  </div>
                  {openSections.coreConcepts ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </button>

                {openSections.coreConcepts && (
                  <div className="p-4 sm:p-6 space-y-4 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    {activeChapter.coreConcepts.map((concept, cIdx) => (
                      <div 
                        key={cIdx}
                        className="p-4 sm:p-5 rounded-2xl bg-zinc-50/60 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/80 space-y-2.5"
                      >
                        <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block"></span>
                          <span>{concept.heading}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed pl-4">
                          {concept.detail}
                        </p>
                        {concept.bulletPoints && concept.bulletPoints.length > 0 && (
                          <ul className="pt-2 pl-8 space-y-2 list-disc text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                            {concept.bulletPoints.map((bp, bpIdx) => (
                              <li key={bpIdx} className="leading-relaxed">{bp}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 6: ขั้นตอนการทำงานจริง (Real-World Workflow) */}
            {activeChapter.realWorldWorkflow && activeChapter.realWorldWorkflow.length > 0 && (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
                <button
                  onClick={() => toggleSection('workflow')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-850/50 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      🔄
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                        ขั้นตอนการทำงานจริงในองค์กร (Real-World Workflow)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        ลำดับขั้นตอนส่งต่องานจริงระหว่างฝ่าย ({activeChapter.realWorldWorkflow.length} ขั้นตอน)
                      </p>
                    </div>
                  </div>
                  {openSections.workflow ? <ChevronUp className="w-5 h-5 text-purple-500" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </button>

                {openSections.workflow && (
                  <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    {activeChapter.realWorldWorkflow.map((wf, wIdx) => (
                      <div 
                        key={wIdx}
                        className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{wf.step}</span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold text-[11px]">
                            {wf.role}
                          </span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                          {wf.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 7: กับดักที่เจอบ่อยและทางออก (Common Pitfalls & Solutions) */}
            {activeChapter.commonPitfalls && activeChapter.commonPitfalls.length > 0 && (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
                <button
                  onClick={() => toggleSection('pitfalls')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-850/50 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold text-xs">
                      ⚠️
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                        กับดักที่เจอบ่อยและทางออกที่แนะนำ (Pitfalls &amp; Solutions)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        สิ่งที่มักทำให้โปรเจกต์ล่าช้าหรือล้มเหลว พร้อมวิธีป้องกัน
                      </p>
                    </div>
                  </div>
                  {openSections.pitfalls ? <ChevronUp className="w-5 h-5 text-rose-500" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </button>

                {openSections.pitfalls && (
                  <div className="p-4 sm:p-6 space-y-3 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                    {activeChapter.commonPitfalls.map((cp, cpIdx) => (
                      <div 
                        key={cpIdx}
                        className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 space-y-1.5 text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300">
                          <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>กับดัก: {cp.pitfall}</span>
                        </div>
                        <div className="pl-5 text-zinc-700 dark:text-zinc-300 leading-relaxed text-xs">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">💡 ทางออกที่แนะนำ: </span>
                          <span>{cp.solution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 8: Pre-flight Checklist */}
            {activeChapter.checklist && activeChapter.checklist.length > 0 && (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
                <button
                  onClick={() => toggleSection('checklist')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-850/50 text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      ✅
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                        Pre-flight Checklist ก่อนเข้าประชุมหรือส่งต่องาน
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        เช็กลิสต์ตรวจความพร้อม ป้องกันการตกหล่นก่อนส่งต่องาน ({activeChapter.checklist.length} ข้อ)
                      </p>
                    </div>
                  </div>
                  {openSections.checklist ? <ChevronUp className="w-5 h-5 text-emerald-500" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </button>

                {openSections.checklist && (
                  <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 text-xs">
                    {activeChapter.checklist.map((item, idx) => {
                      const itemKey = `${activeChapter.id}_cl_${idx}`;
                      const isChecked = !!checkedChecklist[itemKey];
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleChecklistItem(itemKey)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 line-through opacity-85'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                          )}
                          <span className="leading-relaxed">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Chapter Footer Actions */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => onAskAIWithPrompt(`ช่วยอธิบายบทที่ ${activeChapter.num} "${activeChapter.title}" ให้ฟังอย่างละเอียด พร้อมยกตัวอย่างเคสจริงในบริษัทเทคให้เห็นภาพ`)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs sm:text-sm font-semibold border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>ถาม AI Bridge Assistant เจาะลึกบทนี้</span>
                </button>

                {onToggleReadChapter && !isCurrentRead && (
                  <button
                    onClick={() => {
                      onToggleReadChapter(activeChapter.id);
                      if (nextChapter) {
                        handleSelectChapter(nextChapter.id);
                      }
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>อ่านจบแล้ว! ไปบทถัดไป (+30 XP)</span>
                  </button>
                )}
              </div>

              {/* Bottom Pagination Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {prevChapter ? (
                  <button
                    onClick={() => handleSelectChapter(prevChapter.id)}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-left transition-all cursor-pointer bg-zinc-50/50 dark:bg-zinc-850/40 group"
                  >
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 group-hover:text-indigo-600 transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>บทก่อนหน้า</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 mt-1 truncate">
                      บทที่ {prevChapter.num}: {prevChapter.title}
                    </div>
                  </button>
                ) : <div />}

                {nextChapter && (
                  <button
                    onClick={() => handleSelectChapter(nextChapter.id)}
                    className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 text-right transition-all cursor-pointer bg-indigo-50/30 dark:bg-indigo-950/20 group"
                  >
                    <div className="flex items-center justify-end gap-1 text-[11px] text-indigo-500 font-semibold">
                      <span>บทถัดไป</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 mt-1 truncate">
                      บทที่ {nextChapter.num}: {nextChapter.title}
                    </div>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Slide-over Drawer / Modal for Table of Contents (Index) on all screens */}
      {isIndexOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col overflow-hidden border-l border-zinc-200 dark:border-zinc-800 animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <List className="w-4 h-4 text-indigo-600" />
                  <span>สารบัญทั้ง 15 บท</span>
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  อ่านแล้ว {readChapters.length}/{chapters.length} บท • เลือกเพื่อกระโดดข้ามทันที
                </p>
              </div>
              <button
                onClick={() => setIsIndexOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Search & Filter */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-850 space-y-3 bg-zinc-50/50 dark:bg-zinc-850/30">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อบท, คำศัพท์ เช่น C4, DoR, API..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'pm', label: 'PM' },
                  { id: 'ux', label: 'UX' },
                  { id: 'ba', label: 'BA' },
                  { id: 'sa', label: 'SA' },
                  { id: 'eng', label: 'Dev' },
                  { id: 'qa', label: 'QA' },
                  { id: 'friction', label: 'ขัดแย้ง' },
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedRole === role.id
                        ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold'
                        : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Items List */}
            <div className="p-4 overflow-y-auto flex-1 space-y-2 divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredChapters.map((chapter) => {
                const isActive = chapter.id === activeChapterId;
                const isRead = readChapters.includes(chapter.id);
                const isBookmarked = bookmarks.includes(chapter.id);

                return (
                  <div
                    key={chapter.id}
                    onClick={() => handleSelectChapter(chapter.id)}
                    className={`pt-2.5 first:pt-0 p-3 rounded-2xl transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-700'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : isRead
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}>
                      {isRead && !isActive ? <Check className="w-4 h-4" /> : chapter.num}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs sm:text-sm font-bold truncate ${
                          isActive ? 'text-indigo-900 dark:text-indigo-200' : 'text-zinc-800 dark:text-zinc-200'
                        }`}>
                          {chapter.title}
                        </span>
                        {isBookmarked && (
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
                        {chapter.subtitle}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400">
                        <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono uppercase text-[10px]">
                          {chapter.roleTag}
                        </span>
                        <span>{chapter.readTime}</span>
                        {isRead && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• อ่านแล้ว</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 flex items-center justify-between text-xs">
              <span className="text-zinc-500">สะสม XP จากการอ่านและการทำควิซ</span>
              <button
                onClick={() => setIsIndexOpen(false)}
                className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold rounded-xl cursor-pointer"
              >
                ปิดสารบัญ
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
