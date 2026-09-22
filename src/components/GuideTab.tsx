import React, { useState, useEffect, useRef } from 'react';
import { Chapter, AudienceMode, ExperienceLevel } from '../types';
import { ROLE_MINDSETS } from '../data/roleMindsets';
import { FRICTION_PLAYBOOKS } from '../data/frictionPlaybooks';
import { S5_JUMP_TARGET_IDS, DiagramJumpTarget } from '../data/diagramFamilies';
import { GlossaryFilter } from './glossary/GlossaryPanel';
import { GLOSSARY, GlossaryCategory } from '../data/glossary';
import type { GuideSectionContext } from './guide/sections/registry';
import { PrimerSection } from './guide/sections/PrimerSection';
import { JargonSection } from './guide/sections/JargonSection';
import { DialogueSection } from './guide/sections/DialogueSection';
import { DiagramSection } from './guide/sections/DiagramSection';
import { FaqSection } from './guide/sections/FaqSection';
import { ExamplesSection } from './guide/sections/ExamplesSection';
import { CoreConceptsSection } from './guide/sections/CoreConceptsSection';
import { ReferenceSection } from './guide/sections/ReferenceSection';
import { GlossarySection } from './guide/sections/GlossarySection';
import { WorkflowSection } from './guide/sections/WorkflowSection';
import { PitfallsSection } from './guide/sections/PitfallsSection';
import { ChecklistSection } from './guide/sections/ChecklistSection';
import { MindsetSection, FrictionSection } from './guide/sections/registry';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Bot, 
  Sparkles,
  Clock,
  ChevronRight,
  ChevronLeft,
  Info,
  CheckCircle2,
  Workflow,
  BookOpen,
  List,
  X,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  MessageSquare,
  Check,
  Share2,
  SlidersHorizontal,
  Briefcase,
  Code2,
  Users,
  Handshake,
  Sprout,
  Scale,
  Flame,
  Zap
} from 'lucide-react';

interface GuideTabProps {
  chapters: Chapter[];
  audienceMode: AudienceMode;
  experienceLevel?: ExperienceLevel;
  onExperienceLevelChange?: (lvl: ExperienceLevel) => void;
  onAudienceChange?: (mode: AudienceMode) => void;
  bookmarks: string[];
  readChapters?: string[];
  onToggleBookmark: (chapterId: string) => void;
  onToggleReadChapter?: (chapterId: string) => void;
  onAskAIWithPrompt: (prompt: string) => void;
  onStartQuiz: () => void;
  onEarnXp?: (amount: number, reason: string) => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({
  chapters,
  audienceMode,
  experienceLevel = 'beginner',
  onExperienceLevelChange,
  onAudienceChange,
  bookmarks,
  readChapters = [],
  onToggleBookmark,
  onToggleReadChapter,
  onAskAIWithPrompt,
  onStartQuiz,
  onEarnXp,
}) => {
  const [activeChapterId, setActiveChapterId] = useState<string>('s1');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [checkedChecklist, setCheckedChecklist] = useState<Record<string, boolean>>({});
  const [c4Level, setC4Level] = useState<number>(1);
  const [glossaryCategory, setGlossaryCategory] = useState<GlossaryFilter>('all');
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  // Button that opened the index drawer, so focus can return to it on close (I-25).
  const indexOpenerRef = useRef<HTMLElement | null>(null);

  const openIndex = (event: React.MouseEvent<HTMLElement>) => {
    indexOpenerRef.current = event.currentTarget;
    setIsIndexOpen(true);
  };

  const closeIndex = () => {
    setIsIndexOpen(false);
    const opener = indexOpenerRef.current;
    indexOpenerRef.current = null;
    if (opener && document.contains(opener)) {
      window.requestAnimationFrame(() => opener.focus());
    }
  };

  // Esc closes the index drawer and returns focus to its opener.
  useEffect(() => {
    if (!isIndexOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeIndex();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isIndexOpen]);

  // Publish the sticky app header height as --header-h so anchor targets clear it (I-18).
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('header.sticky') ?? document.querySelector<HTMLElement>('header');
    if (!header) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty('--header-h', `${Math.ceil(header.getBoundingClientRect().height)}px`);
    update();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Deferred scroll: wait for the committed render + layout before scrolling to the target.
  useEffect(() => {
    if (!pendingScrollId) return;
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        document.getElementById(pendingScrollId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setPendingScrollId(null);
      });
    });
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
    };
  }, [pendingScrollId, activeChapterId]);

  // Accordion section states for the active chapter
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    mindset: true,
    friction: true,
    primer: experienceLevel === 'beginner',
    jargon: experienceLevel === 'beginner',
    dialogue: true,
    diagram: true,
    faq: true,
    examples: true,
    coreConcepts: true,
    reference: true,
    glossary: true,
    workflow: false,
    pitfalls: experienceLevel === 'experienced',
    checklist: false,
  });

  // Automatically adapt default visible sections when user toggles Experience Level
  useEffect(() => {
    if (experienceLevel === 'experienced') {
      setOpenSections(prev => ({
        ...prev,
        friction: true,
        dialogue: true,
        pitfalls: true,
      }));
    } else {
      setOpenSections(prev => ({
        ...prev,
        mindset: true,
        primer: true,
        jargon: true,
      }));
    }
  }, [experienceLevel]);

  // Find active chapter object
  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];
  const activeIndex = chapters.findIndex(c => c.id === activeChapterId);
  const prevChapter = activeIndex > 0 ? chapters[activeIndex - 1] : null;
  const nextChapter = activeIndex < chapters.length - 1 ? chapters[activeIndex + 1] : null;

  const isCurrentBookmarked = bookmarks.includes(activeChapter.id);

  // s5 family-grid jump cards: open the target block (if it is a disclosure) and scroll it into view.
  const handleDiagramJump = (target: DiagramJumpTarget) => {
    const el = document.getElementById(S5_JUMP_TARGET_IDS[target]);
    if (!el) return;
    if (el instanceof HTMLDetailsElement) el.open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const isCurrentRead = readChapters.includes(activeChapter.id);

  // Scroll to top when active chapter changes
  const handleSelectChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setIsIndexOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category map tile (s15 diagram) -> filter the glossary panel and scroll to it
  const handleSelectGlossaryCategory = (category: GlossaryCategory) => {
    setGlossaryCategory(category);
    setOpenSections(prev => ({ ...prev, glossary: true }));
    window.setTimeout(() => {
      document.getElementById('glossary-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // s11 FAQ concept chip -> open the s15 glossary with the search prefilled
  const handleSearchGlossary = (query: string) => {
    setGlossaryQuery(query);
    setGlossaryCategory('all');
    setOpenSections(prev => ({ ...prev, glossary: true }));
    setActiveChapterId('s15');
    setIsIndexOpen(false);
    window.setTimeout(() => {
      document.getElementById('glossary-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // s11 FAQ playbook link -> open (and navigate to) a chapter's friction playbook, then scroll to it.
  // The scroll runs after the new chapter has rendered (see pendingScrollId effect) so it lands
  // on the playbook heading instead of a position computed from the previous chapter's layout.
  const handleScrollToPlaybook = (chapterId: string) => {
    setOpenSections(prev => ({ ...prev, friction: true }));
    if (chapterId !== activeChapterId) {
      setActiveChapterId(chapterId);
      setIsIndexOpen(false);
    }
    setPendingScrollId('friction-playbook-card');
  };

  const toggleSection = (sectionKey: string) => {
    setOpenSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const expandAllSections = () => {
    setOpenSections({
      mindset: true,
      friction: true,
      primer: true,
      jargon: true,
      dialogue: true,
      diagram: true,
      faq: true,
      examples: true,
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
      faq: false,
      examples: false,
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

  const sectionCtx: GuideSectionContext = {
    chapters,
    audienceMode,
    onAudienceChange,
    onEarnXp,
    onNavigateChapter: handleSelectChapter,
    onDiagramJump: handleDiagramJump,
    onScrollToPlaybook: handleScrollToPlaybook,
    onSearchGlossary: handleSearchGlossary,
    onSelectGlossaryCategory: handleSelectGlossaryCategory,
    glossaryCategory, setGlossaryCategory,
    glossaryQuery, setGlossaryQuery,
    c4Level, setC4Level,
    checkedChecklist, onToggleChecklistItem: toggleChecklistItem,
  };

  // Filtered chapters for the Index
  const filteredChapters = chapters.filter((ch) => {
    const matchesSearch = 
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.plainAnalogy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ch.jargonList && ch.jargonList.some(j => j.term.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (ch.id === 's15' && GLOSSARY.some(g => g.term.toLowerCase().includes(searchQuery.toLowerCase())));

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
      <div className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-800 dark:text-[#d4d4d4] text-[11px] sm:text-xs font-semibold border border-neutral-200 dark:border-[#333333]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>โหมดอ่านทีละบท พร้อมสารบัญกระโดดข้ามได้ตลอดเวลา</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-neutral-900 dark:text-[#fafafa] tracking-tight">
              คู่มือสองโลก Business ↔ Engineering (15 บทฉบับเริ่มจาก 0)
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#8e8e8e] leading-relaxed font-normal">
              ครอบคลุมปฐมบทสำหรับมือใหม่ ศัพท์เทคนิคแปลเป็นภาษาคน ตัวอย่างบทสนทนาจริงในที่ทำงาน แผนภาพจำลองระบบ และทางออกของข้อขัดแย้ง
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Open Table of Contents Button */}
            <button
              onClick={openIndex}
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-[#0a0a0a] text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <List className="w-4 h-4" />
              <span>สารบัญทั้ง 15 บท (Index)</span>
            </button>

            <button
              onClick={onStartQuiz}
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#262626] text-neutral-700 dark:text-[#d4d4d4] text-xs sm:text-sm font-medium hover:bg-neutral-200/70 dark:hover:bg-[#222222] transition-all cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-amber-500" />
              <span>ทำควิซสะสม XP</span>
            </button>

            {/* Quick jump to the glossary (chapter 15) */}
            <button
              onClick={() => handleSelectChapter('s15')}
              className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#262626] text-neutral-700 dark:text-[#d4d4d4] text-xs sm:text-sm font-medium hover:bg-neutral-200/70 dark:hover:bg-[#222222] transition-all cursor-pointer"
            >
              <span aria-hidden="true">📖</span>
              <span>Glossary</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-600 dark:text-[#a3a3a3] font-medium text-[11px] sm:text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>ความคืบหน้าการอ่าน: อ่านจบแล้ว {readChapters.length} จาก {chapters.length} บท ({percentCompleted}%)</span>
          </div>
          <div className="w-full sm:w-64 h-1.5 sm:h-2 rounded-full bg-neutral-100 dark:bg-[#262626] overflow-hidden">
            <div 
              className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-500"
              style={{ width: `${percentCompleted}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Index + Chapter Reader Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* Left Column: Persistent Sticky Index on Desktop (Hidden on smaller screens, accessed via drawer/modal) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-20 space-y-4">
          <div className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-2xl sm:rounded-3xl p-3.5 shadow-2xs space-y-3.5 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-neutral-900 dark:text-white" />
                <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">สารบัญบทเรียน (15 บท)</h3>
              </div>
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-[#8e8e8e] font-mono">
                บทที่ {activeIndex + 1}/{chapters.length}
              </span>
            </div>

            {/* Quick Search in Index */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-[#737373]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาบท หรือ คำศัพท์..."
                className="w-full pl-8 pr-3 py-1.5 bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#262626] rounded-xl text-xs text-neutral-900 dark:text-[#fafafa] placeholder-neutral-400 dark:placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
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
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] font-bold shadow-xs'
                      : 'bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-600 dark:text-[#a3a3a3] hover:bg-neutral-200 dark:hover:bg-[#262626]'
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
                        ? 'bg-neutral-100 dark:bg-[#1f1f1f] border-neutral-300 dark:border-[#3a3a3a] shadow-xs'
                        : 'bg-neutral-50/50 dark:bg-[#141414]/60 border-neutral-200/60 dark:border-[#262626] hover:border-neutral-300 dark:hover:border-[#333333] hover:bg-neutral-100/70 dark:hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono ${
                      isActive
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] shadow-xs'
                        : isRead
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300/60 dark:border-emerald-800/60'
                        : 'bg-neutral-200 dark:bg-[#262626] text-neutral-700 dark:text-[#a3a3a3] border border-neutral-300/60 dark:border-[#333333]'
                    }`}>
                      {isRead && !isActive ? <Check className="w-3.5 h-3.5" /> : chapter.num}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${
                          isActive 
                            ? 'text-neutral-900 dark:text-white font-bold' 
                            : 'text-neutral-800 dark:text-[#c4c4c4] font-medium'
                        }`}>
                          {chapter.title}
                        </span>
                        {isBookmarked && (
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-500 dark:text-[#737373] font-mono">
                        <span className="uppercase font-semibold">{chapter.roleTag}</span>
                        <span>•</span>
                        <span>{chapter.readTime}</span>
                        {isRead && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">อ่านแล้ว</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Chapter Reader Card ("บทละหน้า") */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {/* Chapter Top Navigation Bar */}
          <div className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              {/* Prev Chapter Button */}
              <button
                disabled={!prevChapter}
                onClick={() => prevChapter && handleSelectChapter(prevChapter.id)}
                className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
                  prevChapter
                    ? 'border-neutral-200 dark:border-[#262626] hover:bg-neutral-100 dark:hover:bg-[#1f1f1f] text-neutral-700 dark:text-[#d4d4d4] cursor-pointer'
                    : 'border-neutral-100 dark:border-[#1c1c1c] text-neutral-300 dark:text-[#444444] cursor-not-allowed'
                }`}
                title={prevChapter ? `บทก่อนหน้า: ${prevChapter.title}` : 'นี่คือบทแรก'}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">บทก่อนหน้า</span>
              </button>

              {/* Mobile Table of Contents Toggle */}
              <button
                onClick={openIndex}
                className="lg:hidden px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#1f1f1f] hover:bg-neutral-200 text-neutral-700 dark:text-[#d4d4d4] text-xs font-semibold flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <List className="w-3.5 h-3.5" />
                <span>สารบัญ ({activeChapter.num}/15)</span>
              </button>

              {/* Current Chapter Indicator on Desktop */}
              <div className="hidden lg:flex items-center gap-2 pl-2">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-800 dark:text-[#d4d4d4] text-xs font-bold border border-neutral-200 dark:border-[#333333] font-mono">
                  บทที่ {activeChapter.num} จาก {chapters.length}
                </span>
                <span className="text-xs text-neutral-600 dark:text-[#8e8e8e] font-medium truncate max-w-[200px]">
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
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300'
                      : 'bg-neutral-50 dark:bg-[#1a1a1a] border-neutral-200 dark:border-[#262626] text-neutral-700 dark:text-[#d4d4d4] hover:bg-neutral-100 dark:hover:bg-[#222222]'
                  }`}
                  title="ทำเครื่องหมายว่าอ่านและเข้าใจบทนี้แล้ว (+30 XP)"
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrentRead ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400'}`} />
                  <span className="hidden md:inline">{isCurrentRead ? 'อ่านแล้ว' : 'ทำเครื่องหมายว่าอ่านแล้ว'}</span>
                </button>
              )}

              {/* Bookmark Toggle */}
              <button
                onClick={() => onToggleBookmark(activeChapter.id)}
                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                  isCurrentBookmarked
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400'
                    : 'bg-neutral-50 dark:bg-[#1a1a1a] border-neutral-200 dark:border-[#262626] text-neutral-500 hover:text-neutral-800 dark:hover:text-[#fafafa]'
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
                    ? 'border-neutral-200 dark:border-[#262626] bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] hover:opacity-90 cursor-pointer shadow-xs'
                    : 'border-neutral-100 dark:border-[#1c1c1c] text-neutral-300 dark:text-[#444444] cursor-not-allowed'
                }`}
                title={nextChapter ? `บทถัดไป: ${nextChapter.title}` : 'นี่คือบทสุดท้าย'}
              >
                <span className="hidden sm:inline">บทถัดไป</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chapter Main Content Reader Card */}
          <div className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-2xs space-y-5 sm:space-y-6">
            
            {/* Chapter Header */}
            <div className="space-y-3 pb-4 sm:pb-5 border-b border-neutral-100 dark:border-[#262626]">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] font-black text-sm flex items-center justify-center shrink-0 shadow-xs font-mono">
                  {activeChapter.num}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-[#1f1f1f] border border-neutral-200 dark:border-[#333333] text-neutral-800 dark:text-[#d4d4d4] text-[11px] sm:text-xs font-semibold uppercase tracking-wider font-mono">
                  {activeChapter.roleTag}
                </span>
                <span className="flex items-center gap-1 text-[11px] sm:text-xs text-neutral-500 dark:text-[#737373] font-medium font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {activeChapter.readTime}
                </span>
                {isCurrentRead && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/50 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300 text-[11px] sm:text-xs font-semibold font-mono">
                    <Check className="w-3 h-3" />
                    ผ่านแล้ว
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-neutral-900 dark:text-[#fafafa] tracking-tight leading-tight">
                {activeChapter.title}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#8e8e8e] leading-relaxed font-normal">
                {activeChapter.subtitle}
              </p>

              {/* Expand/Collapse All Accordion Control */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="text-neutral-500 dark:text-[#737373] font-normal">
                  คลิกที่หัวข้อเพื่อเปิด/ปิดเนื้อหาย่อย หรือดูทีละส่วน
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={expandAllSections}
                    className="text-neutral-800 dark:text-[#d4d4d4] hover:underline font-semibold cursor-pointer"
                  >
                    ขยายทั้งหมด
                  </button>
                  <span className="text-neutral-300 dark:text-[#333333]">|</span>
                  <button
                    onClick={collapseAllSections}
                    className="text-neutral-500 dark:text-[#737373] hover:underline font-semibold cursor-pointer"
                  >
                    ย่อทั้งหมด
                  </button>
                </div>
              </div>
            </div>

            {/* ADAPTIVE LENS CONTROLLER BANNER */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-2 sm:space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-neutral-800 dark:text-[#e5e5e5] flex items-center gap-1.5 font-mono">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600 dark:text-[#a3a3a3]" />
                    <span>Active Lens:</span>
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-[#262626] text-neutral-800 dark:text-[#d4d4d4]">
                    {audienceMode === 'business' ? '💼 Business' : audienceMode === 'engineer' ? '💻 Engineer' : '👥 The Bridge (ทั้งสองฝั่ง)'}
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                    {experienceLevel === 'beginner' ? '🌱 Beginner' : '⚡ Experienced'}
                  </span>
                </div>

                {/* Quick Switch Buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    onClick={() => onExperienceLevelChange && onExperienceLevelChange('beginner')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      experienceLevel === 'beginner'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] shadow-xs font-bold'
                        : 'bg-white dark:bg-[#1f1f1f] text-neutral-600 dark:text-[#a3a3a3] border border-neutral-200 dark:border-[#333333] hover:bg-neutral-100 dark:hover:bg-[#262626]'
                    }`}
                  >
                    🌱 ปูพื้นฐาน Mindset
                  </button>
                  <button
                    onClick={() => onExperienceLevelChange && onExperienceLevelChange('experienced')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      experienceLevel === 'experienced'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] shadow-xs font-bold'
                        : 'bg-white dark:bg-[#1f1f1f] text-neutral-600 dark:text-[#a3a3a3] border border-neutral-200 dark:border-[#333333] hover:bg-neutral-100 dark:hover:bg-[#262626]'
                    }`}
                  >
                    ⚡ คัมภีร์รับมือ Friction
                  </button>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] leading-relaxed">
                {experienceLevel === 'beginner'
                  ? '💡 โหมด Beginner: เน้นปูพื้นฐานวิธีคิด (Mindset) ของบทบาทที่เลือก สิ่งที่เขาแคร์ และคำแนะนำเชื่อมความสัมพันธ์'
                  : '⚡ โหมด Experienced: เน้นกลยุทธ์รับมือข้อขัดแย้ง (Friction Playbook) ตาราง Trade-off ในการต่อรอง และสคริปต์พูดจริงในห้องประชุม'}
              </p>
            </div>

            <GlossarySection
              chapter={activeChapter}
              isOpen={openSections.glossary}
              onToggle={() => toggleSection('glossary')}
              ctx={sectionCtx}
            />

            {/* ADAPTIVE SECTION RENDERING: Beginner vs Experienced ordering */}
            {experienceLevel === 'experienced' ? (
              <>
                {/* 1. Friction & Negotiation Playbook (Prioritized in Experienced mode) */}
                <FrictionSection
                  chapter={activeChapter}
                  isOpen={openSections.friction}
                  onToggle={() => toggleSection('friction')}
                  ctx={sectionCtx}
                />

                {/* 2. Role Mindset & Empathy Guide */}
                <MindsetSection
                  chapter={activeChapter}
                  isOpen={openSections.mindset}
                  onToggle={() => toggleSection('mindset')}
                  ctx={sectionCtx}
                />
              </>
            ) : (
              <>
                {/* 1. Role Mindset & Empathy Guide (Prioritized in Beginner mode) */}
                <MindsetSection
                  chapter={activeChapter}
                  isOpen={openSections.mindset}
                  onToggle={() => toggleSection('mindset')}
                  ctx={sectionCtx}
                />

                {/* 2. Friction & Negotiation Playbook */}
                <FrictionSection
                  chapter={activeChapter}
                  isOpen={openSections.friction}
                  onToggle={() => toggleSection('friction')}
                  ctx={sectionCtx}
                />
              </>
            )}

            {/* Quick Perspective & Metaphor Box */}
            <div className="space-y-3">
              {/* Plain Language Metaphor (เปรียบแบบบ้านๆ) */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-[#fafafa]">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>เปรียบแบบบ้านๆ (Real-World Analogy)</span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 dark:text-[#c4c4c4] leading-relaxed font-normal">
                  {activeChapter.plainAnalogy}
                </p>
              </div>

              {/* Audience Perspectives (Business & Engineer Notes) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(audienceMode === 'business' || audienceMode === 'both') && (
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                      <Info className="w-4 h-4 text-amber-500" />
                      <span>มุมมองฝั่ง Business</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-[#a3a3a3] leading-relaxed font-normal">
                      {activeChapter.businessNote}
                    </p>
                  </div>
                )}

                {(audienceMode === 'engineer' || audienceMode === 'both') && (
                  <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" />
                      <span>มุมมองฝั่ง Engineer</span>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-[#a3a3a3] leading-relaxed font-normal">
                      {activeChapter.engineerNote}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <PrimerSection
              chapter={activeChapter}
              isOpen={openSections.primer}
              onToggle={() => toggleSection('primer')}
              ctx={sectionCtx}
            />

            <JargonSection
              chapter={activeChapter}
              isOpen={openSections.jargon}
              onToggle={() => toggleSection('jargon')}
              ctx={sectionCtx}
            />

            <DialogueSection
              chapter={activeChapter}
              isOpen={openSections.dialogue}
              onToggle={() => toggleSection('dialogue')}
              ctx={sectionCtx}
            />

            <DiagramSection
              chapter={activeChapter}
              isOpen={openSections.diagram}
              onToggle={() => toggleSection('diagram')}
              ctx={sectionCtx}
            />

            <FaqSection
              chapter={activeChapter}
              isOpen={openSections.faq}
              onToggle={() => toggleSection('faq')}
              ctx={sectionCtx}
            />

            <ExamplesSection
              chapter={activeChapter}
              isOpen={openSections.examples}
              onToggle={() => toggleSection('examples')}
              ctx={sectionCtx}
            />

            <CoreConceptsSection
              chapter={activeChapter}
              isOpen={openSections.coreConcepts}
              onToggle={() => toggleSection('coreConcepts')}
              ctx={sectionCtx}
            />

            <ReferenceSection
              chapter={activeChapter}
              isOpen={openSections.reference}
              onToggle={() => toggleSection('reference')}
              ctx={sectionCtx}
            />

            <WorkflowSection
              chapter={activeChapter}
              isOpen={openSections.workflow}
              onToggle={() => toggleSection('workflow')}
              ctx={sectionCtx}
            />

            <PitfallsSection
              chapter={activeChapter}
              isOpen={openSections.pitfalls}
              onToggle={() => toggleSection('pitfalls')}
              ctx={sectionCtx}
            />

            <ChecklistSection
              chapter={activeChapter}
              isOpen={openSections.checklist}
              onToggle={() => toggleSection('checklist')}
              ctx={sectionCtx}
            />

            {/* Chapter Footer Actions */}
            <div className="pt-5 border-t border-neutral-100 dark:border-[#262626] space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => onAskAIWithPrompt(`ช่วยอธิบายบทที่ ${activeChapter.num} "${activeChapter.title}" ให้ฟังอย่างละเอียด พร้อมยกตัวอย่างเคสจริงในบริษัทเทคให้เห็นภาพ`)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-900 dark:text-[#fafafa] hover:bg-neutral-200 dark:hover:bg-[#262626] text-xs sm:text-sm font-semibold border border-neutral-200 dark:border-[#333333] transition-colors cursor-pointer"
                >
                  <Bot className="w-4 h-4 text-neutral-700 dark:text-[#a3a3a3]" />
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
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer font-mono"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>อ่านจบแล้ว! ไปบทถัดไป (+30 XP)</span>
                  </button>
                )}
              </div>

              {/* Bottom Pagination Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {prevChapter ? (
                  <button
                    onClick={() => handleSelectChapter(prevChapter.id)}
                    className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-[#404040] text-left transition-all cursor-pointer bg-neutral-50/70 dark:bg-[#181818] group"
                  >
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-[#737373] group-hover:text-neutral-900 dark:group-hover:text-white transition-colors font-mono">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>บทก่อนหน้า</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa] mt-1 truncate">
                      บทที่ {prevChapter.num}: {prevChapter.title}
                    </div>
                  </button>
                ) : <div />}

                {nextChapter && (
                  <button
                    onClick={() => handleSelectChapter(nextChapter.id)}
                    className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-[#404040] text-right transition-all cursor-pointer bg-neutral-50/70 dark:bg-[#181818] group"
                  >
                    <div className="flex items-center justify-end gap-1 text-[11px] text-neutral-900 dark:text-white font-semibold font-mono">
                      <span>บทถัดไป</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa] mt-1 truncate">
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#141414] h-full shadow-2xl flex flex-col overflow-hidden border-l border-neutral-200 dark:border-[#262626] animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-neutral-200 dark:border-[#262626] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-neutral-900 dark:text-[#fafafa] flex items-center gap-2">
                  <List className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" />
                  <span>สารบัญทั้ง 15 บท</span>
                </h3>
                <p className="text-xs text-neutral-500 dark:text-[#8e8e8e] mt-0.5 font-mono">
                  อ่านแล้ว {readChapters.length}/{chapters.length} บท • เลือกเพื่อกระโดดข้ามทันที
                </p>
              </div>
              <button
                onClick={closeIndex}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-[#fafafa] hover:bg-neutral-100 dark:hover:bg-[#1f1f1f] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Search & Filter */}
            <div className="p-4 border-b border-neutral-100 dark:border-[#262626] space-y-3 bg-neutral-50 dark:bg-[#181818]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-[#737373]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อบท, คำศัพท์ เช่น C4, DoR, API..."
                  className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#333333] rounded-xl text-xs text-neutral-900 dark:text-[#fafafa] placeholder-neutral-400 dark:placeholder-[#666666] focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-[#666666]"
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
                    className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer font-mono text-[11px] ${
                      selectedRole === role.id
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] font-bold'
                        : 'bg-neutral-200/80 dark:bg-[#262626] text-neutral-700 dark:text-[#a3a3a3] hover:bg-neutral-300 dark:hover:bg-[#333333]'
                    }`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chapter Items List */}
            <div className="p-3.5 overflow-y-auto flex-1 space-y-1.5 divide-y divide-neutral-100 dark:divide-[#262626]">
              {filteredChapters.map((chapter) => {
                const isActive = chapter.id === activeChapterId;
                const isRead = readChapters.includes(chapter.id);
                const isBookmarked = bookmarks.includes(chapter.id);

                return (
                  <div
                    key={chapter.id}
                    onClick={() => handleSelectChapter(chapter.id)}
                    className={`pt-2 first:pt-0 p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'bg-neutral-100 dark:bg-[#1f1f1f] border border-neutral-300 dark:border-[#404040]'
                        : 'hover:bg-neutral-50 dark:hover:bg-[#181818]'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono ${
                      isActive
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a]'
                        : isRead
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                        : 'bg-neutral-100 dark:bg-[#262626] text-neutral-700 dark:text-[#a3a3a3]'
                    }`}>
                      {isRead && !isActive ? <Check className="w-3.5 h-3.5" /> : chapter.num}
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs sm:text-sm font-bold truncate ${
                          isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-800 dark:text-[#d4d4d4]'
                        }`}>
                          {chapter.title}
                        </span>
                        {isBookmarked && (
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-[#8e8e8e] line-clamp-1 font-normal">
                        {chapter.subtitle}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-neutral-500 dark:text-[#737373] font-normal font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-[#262626] uppercase text-neutral-700 dark:text-[#a3a3a3]">
                          {chapter.roleTag}
                        </span>
                        <span>{chapter.readTime}</span>
                        {isRead && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">• อ่านแล้ว</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-neutral-200 dark:border-[#262626] bg-neutral-50 dark:bg-[#181818] flex items-center justify-between text-xs">
              <span className="text-neutral-500 dark:text-[#8e8e8e] font-mono text-[11px]">สะสม XP จากการอ่านและการทำควิซ</span>
              <button
                onClick={closeIndex}
                className="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] font-semibold rounded-xl cursor-pointer"
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
