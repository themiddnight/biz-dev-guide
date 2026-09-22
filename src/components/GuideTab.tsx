import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chapter, ExperienceLevel } from '../types';
import { CHAPTER_START_ID, scrollToChapterStart } from '../lib/chapterScroll';
import { S5_JUMP_TARGET_IDS, DiagramJumpTarget } from '../data/diagramFamilies';
import { GlossaryFilter } from './glossary/GlossaryPanel';
import { GLOSSARY, GlossaryCategory } from '../data/glossary';
import { SECTION_COMPONENTS, type GuideSectionContext } from './guide/sections/registry';
import {
  getChapterLayout,
  deriveOpenState,
  expandAll,
  collapseAll,
  openSection,
  toggleSection,
  toggleLayer,
  isSectionPresent,
  getInlineSectionsAt,
  type OpenState,
  type SectionKey,
} from '../data/sectionLayers';
import type { RequestedSection } from '../lib/chapterRoute';
import { LayerGroupView } from './guide/LayerGroup';
import { InlineSections } from './guide/InlineSections';
import { ChapterHero } from './guide/ChapterHero';
import { SectionOutline } from './guide/SectionOutline';
import { TrackPanel } from './guide/TrackPanel';
import { TrackNextCard, TrackEndCard } from './guide/TrackFooter';
import { getTrackNext, resolveTrack } from '../data/readingTracks';
import { FirstVisitCard } from './guide/FirstVisitCard';
import { ResumeBanner } from './guide/ResumeBanner';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Bot, 
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  List,
  X,
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  Check,
  SlidersHorizontal
} from 'lucide-react';

interface GuideTabProps {
  chapters: Chapter[];
  experienceLevel?: ExperienceLevel;
  onExperienceLevelChange?: (lvl: ExperienceLevel) => void;
  showFirstVisit?: boolean;
  onChooseInitialLevel?: (level: ExperienceLevel) => void;
  loadedFromHash: boolean;
  resumeCandidate: string | null;
  resumeDismissed: boolean;
  onDismissResume: () => void;
  bookmarks: string[];
  readChapters?: string[];
  onToggleBookmark: (chapterId: string) => void;
  onToggleReadChapter?: (chapterId: string) => void;
  onAskAIWithPrompt: (prompt: string) => void;
  onStartQuiz: () => void;
  onEarnXp?: (chapterId: string, amount: number, reason: string) => void;
  activeChapterId: string;
  requestedSection: RequestedSection | null;
  onNavigateChapter: (chapterId: string, section?: SectionKey) => void;
  onReplaceSection: (section: SectionKey | null) => void;
  onRequestedSectionApplied: () => void;
}

export const GuideTab: React.FC<GuideTabProps> = ({
  chapters,
  experienceLevel = 'beginner',
  onExperienceLevelChange,
  showFirstVisit,
  onChooseInitialLevel,
  loadedFromHash,
  resumeCandidate,
  resumeDismissed,
  onDismissResume,
  bookmarks,
  readChapters = [],
  onToggleBookmark,
  onToggleReadChapter,
  onAskAIWithPrompt,
  onStartQuiz,
  onEarnXp,
  onReplaceSection,
  onRequestedSectionApplied,
  activeChapterId,
  requestedSection,
  onNavigateChapter,
}) => {
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

  // Find active chapter object
  const activeChapter = chapters.find(c => c.id === activeChapterId) || chapters[0];
  const activeIndex = chapters.findIndex(c => c.id === activeChapterId);

  const layout = useMemo(() => getChapterLayout(experienceLevel, activeChapter), [experienceLevel, activeChapter]);
  const [openState, setOpenState] = useState<OpenState>(() => deriveOpenState(layout, activeChapter.id));

  // Each chapter (and each level) opens at its Core (spec §1.4, D3).
  useEffect(() => {
    setOpenState(deriveOpenState(layout, activeChapter.id));
  }, [layout]);

  // A requested section opens on top of the re-derived defaults. Declared after the
  // re-derive effect so that, when both fire in one commit, this update wins.
  // Keyed on the nonce alone on purpose: it fires once per request, not on layout/level changes.
  useEffect(() => {
    if (!requestedSection) return;
    // Consume the request so a remount (Quiz -> Guide) never re-opens and re-scrolls to it.
    onRequestedSectionApplied();
    if (!isSectionPresent(activeChapter, requestedSection.key)) {
      onReplaceSection(null);
      return;
    }
    setOpenState(openSection(deriveOpenState(layout, activeChapter.id), layout, requestedSection.key));
    setPendingScrollId(`sec-${requestedSection.key}`);
  }, [requestedSection?.nonce]);

  // Chip click: open (never close) the section, scroll to it, and record it in the URL (spec §2.1).
  const handleOutlineSelect = (key: SectionKey) => {
    setOpenState(prev => openSection(prev, layout, key));
    setPendingScrollId(`sec-${key}`);
    onReplaceSection(key);
  };
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
  const trackNext = getTrackNext(resolveTrack(experienceLevel, chapters), activeChapter.id);

  // Start the new chapter at its title (page top on desktop, reader card on mobile)
  const handleSelectChapter = (chapterId: string) => {
    onNavigateChapter(chapterId);
    setIsIndexOpen(false);
    scrollToChapterStart('smooth');
  };

  const handleFirstVisitChoice = (level: ExperienceLevel) => {
    onChooseInitialLevel?.(level);
    if (loadedFromHash) return; // a shared link wins over onboarding (spec §4.3, D5)
    const first = resolveTrack(level, chapters)[0];
    if (first) handleSelectChapter(first);
    if (!window.matchMedia('(min-width: 1024px)').matches) setIsIndexOpen(true);
  };
  const handleFirstVisitSkip = () => onChooseInitialLevel?.('beginner');

  // resumeDismissed lives in useChapterRoute: any navigation or back/forward sets it, and it
  // survives this component unmounting on other tabs (spec §5.4).
  const resumeChapter = resumeCandidate ? chapters.find(c => c.id === resumeCandidate) : undefined;
  const showResume = !loadedFromHash && !!resumeChapter && resumeChapter.id !== activeChapterId && !showFirstVisit && !resumeDismissed;

  // Category map tile (s15 diagram) -> filter the glossary panel and scroll to it
  const handleSelectGlossaryCategory = (category: GlossaryCategory) => {
    setGlossaryCategory(category);
    setOpenState(prev => openSection(prev, layout, 'glossary'));
    window.setTimeout(() => {
      document.getElementById('glossary-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // s11 FAQ concept chip -> open the s15 glossary with the search prefilled
  const handleSearchGlossary = (query: string) => {
    setGlossaryQuery(query);
    setGlossaryCategory('all');
    onNavigateChapter('s15', 'glossary');
    setIsIndexOpen(false);
  };

  // s11 FAQ playbook link -> open (and navigate to) a chapter's friction playbook, then scroll to it.
  // A cross-chapter jump requests the section via the route so the open lands on top of the new
  // chapter's re-derived defaults; the scroll then runs after the new chapter has rendered.
  const handleScrollToPlaybook = (chapterId: string) => {
    if (chapterId !== activeChapterId) {
      onNavigateChapter(chapterId, 'friction');
      setIsIndexOpen(false);
      return;
    }
    setOpenState(prev => openSection(prev, layout, 'friction'));
    setPendingScrollId('friction-playbook-card');
  };

  const toggleChecklistItem = (key: string) => {
    setCheckedChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const sectionCtx: GuideSectionContext = {
    chapters,
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
      (ch.enTerm?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
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
      {showFirstVisit ? (
        <FirstVisitCard chapters={chapters} onChoose={handleFirstVisitChoice} onSkip={handleFirstVisitSkip} />
      ) : (
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
        <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
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
      )}

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
              <span className="text-[11px] font-semibold text-neutral-500 dark:text-[#8e8e8e]">
                บทที่ {activeIndex + 1}/{chapters.length}
              </span>
            </div>

            <TrackPanel chapters={chapters} experienceLevel={experienceLevel} readChapters={readChapters} activeChapterId={activeChapterId} onSelectChapter={handleSelectChapter} onStartQuiz={onStartQuiz} />

            <h3 data-all-chapters-heading className="text-xs font-bold text-neutral-500 dark:text-[#8e8e8e]">ทุกบท ({chapters.length})</h3>

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
            <div className="flex items-center gap-1 shrink-0 overflow-x-auto pb-1 scrollbar-none text-[11px]">
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
                    <div className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
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
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-500 dark:text-[#737373]">
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
          {showResume && resumeChapter && (
            <ResumeBanner
              chapter={resumeChapter}
              onResume={() => handleSelectChapter(resumeChapter.id)}
              onDismiss={onDismissResume}
            />
          )}

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
                className="lg:hidden px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#1f1f1f] hover:bg-neutral-200 text-neutral-700 dark:text-[#d4d4d4] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <List className="w-3.5 h-3.5" />
                <span>สารบัญ ({activeChapter.num}/15)</span>
              </button>

              {/* Current Chapter Indicator on Desktop */}
              <div className="hidden lg:flex items-center gap-2 pl-2">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-800 dark:text-[#d4d4d4] text-xs font-bold border border-neutral-200 dark:border-[#333333]">
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
          <div id={CHAPTER_START_ID} className="bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-2xs space-y-5 sm:space-y-6">
            
            <ChapterHero chapter={activeChapter} experienceLevel={experienceLevel} isRead={isCurrentRead} />

            {/* ADAPTIVE LENS CONTROLLER BANNER */}
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-[#262626] space-y-2 sm:space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-neutral-800 dark:text-[#e5e5e5] flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600 dark:text-[#a3a3a3]" />
                    <span>Active Mode:</span>
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
                    🌱 ใหม่กับเรื่องนี้
                  </button>
                  <button
                    onClick={() => onExperienceLevelChange && onExperienceLevelChange('experienced')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                      experienceLevel === 'experienced'
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] shadow-xs font-bold'
                        : 'bg-white dark:bg-[#1f1f1f] text-neutral-600 dark:text-[#a3a3a3] border border-neutral-200 dark:border-[#333333] hover:bg-neutral-100 dark:hover:bg-[#262626]'
                    }`}
                  >
                    ⚡ ทำงานข้ามทีมมาแล้ว
                  </button>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] leading-relaxed">
                {experienceLevel === 'beginner'
                  ? '💡 โหมดมือใหม่: เปิด ปฐมบท · ศัพท์จำเป็น · แผนภาพ ไว้ก่อน ส่วนอื่นพับไว้ในชั้น "นำไปใช้" และ "เจาะลึก"'
                  : '⚡ โหมดทำงานข้ามทีม: เปิด แนวคิดหลัก · กับดัก · แผนภาพ ไว้ก่อน วิธีรับมือ Friction อยู่ในชั้น "นำไปใช้"'}
              </p>
            </div>

            <SectionOutline
              chapter={activeChapter}
              layout={layout}
              openState={openState}
              onSelectSection={handleOutlineSelect}
              onExpandAll={() => setOpenState(expandAll(layout))}
              onCollapseAll={() => setOpenState(collapseAll(layout))}
            />

            {layout.filter(group => group.sections.length > 0).map(group => (
              <LayerGroupView
                key={group.layer}
                group={group}
                isExpanded={openState.layers[group.layer]}
                onToggle={() => setOpenState(prev => toggleLayer(prev, group.layer))}
              >
                {group.sections.map(key => {
                  const Section = SECTION_COMPONENTS[key];
                  return (
                    <section key={key} id={`sec-${key}`} className="anchor-target" data-layer={group.layer}>
                      <Section
                        chapter={activeChapter}
                        isOpen={!!openState.sections[key]}
                        onToggle={() => setOpenState(prev => toggleSection(prev, key))}
                        ctx={sectionCtx}
                      />
                      {openState.sections[key] && (
                        <InlineSections
                          className="mt-3.5"
                          sections={getInlineSectionsAt(activeChapter, key)}
                          onNavigateChapter={sectionCtx.onNavigateChapter}
                        />
                      )}
                    </section>
                  );
                })}
              </LayerGroupView>
            ))}

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
                      if (trackNext.kind === 'next') handleSelectChapter(trackNext.chapterId);
                      else if (trackNext.kind === 'not-in-track' && nextChapter) handleSelectChapter(nextChapter.id);
                    }}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {trackNext.kind === 'next'
                        ? 'อ่านจบแล้ว! ไปบทถัดไปใน track (+30 XP)'
                        : trackNext.kind === 'end'
                        ? 'อ่านจบแล้ว! (+30 XP)'
                        : 'อ่านจบแล้ว! ไปบทถัดไป (+30 XP)'}
                    </span>
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
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-[#737373] group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>บทก่อนหน้า</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa] mt-1 truncate">
                      บทที่ {prevChapter.num}: {prevChapter.title}
                    </div>
                  </button>
                ) : <div />}

                {trackNext.kind === 'next' ? (
                  <TrackNextCard next={trackNext} chapters={chapters} onSelectChapter={handleSelectChapter} />
                ) : trackNext.kind === 'end' ? (
                  <TrackEndCard experienceLevel={experienceLevel} onStartQuiz={onStartQuiz} onOpenIndex={openIndex} />
                ) : (
                  nextChapter && (
                    <button
                      onClick={() => handleSelectChapter(nextChapter.id)}
                      className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-[#404040] text-right transition-all cursor-pointer bg-neutral-50/70 dark:bg-[#181818] group"
                    >
                      <div className="flex items-center justify-end gap-1 text-[11px] text-neutral-900 dark:text-white font-semibold">
                        <span>บทถัดไป</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-[#fafafa] mt-1 truncate">
                        บทที่ {nextChapter.num}: {nextChapter.title}
                      </div>
                    </button>
                  )
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
                <p className="text-xs text-neutral-500 dark:text-[#8e8e8e] mt-0.5">
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
              <TrackPanel chapters={chapters} experienceLevel={experienceLevel} readChapters={readChapters} activeChapterId={activeChapterId} onSelectChapter={handleSelectChapter} onStartQuiz={onStartQuiz} />

              <h3 data-all-chapters-heading className="text-xs font-bold text-neutral-500 dark:text-[#8e8e8e]">ทุกบท ({chapters.length})</h3>

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
                    className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer text-[11px] ${
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
                    <div className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
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
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-neutral-500 dark:text-[#737373] font-normal">
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
              <span className="text-neutral-500 dark:text-[#8e8e8e] text-[11px]">สะสม XP จากการอ่านและการทำควิซ</span>
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
