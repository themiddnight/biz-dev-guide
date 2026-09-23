import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chapter, ExperienceLevel } from '../types';
import { CHAPTER_START_ID, scrollToChapterStart } from '../lib/chapterScroll';
import { S5_JUMP_TARGET_IDS, DiagramJumpTarget } from '../data/diagramFamilies';
import { GlossaryFilter } from './glossary/GlossaryPanel';
import { GLOSSARY, GlossaryCategory } from '../data/glossary';
import { filterIndexChapters } from '../lib/chapterSearch';
import { IndexEmptyState } from './guide/IndexEmptyState';
import { SECTION_COMPONENTS, type GuideSectionContext, type OtherSideView } from './guide/sections/registry';
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
  SECTION_META,
  type OpenState,
  type SectionKey,
} from '../data/sectionLayers';
import type { RequestedSection } from '../lib/chapterRoute';
import { LayerGroupView } from './guide/LayerGroup';
import { InlineSections } from './guide/InlineSections';
import { ChapterHero } from './guide/ChapterHero';
import { SectionOutline } from './guide/SectionOutline';
import { TrackPanel } from './guide/TrackPanel';
import { chapterLevelResetLabel, chapterLevelScopeLabel } from './guide/rolePerspectiveUi';
import { TrackNextCard, TrackEndCard } from './guide/TrackFooter';
import { getTrackNext, resolveTrack, type TrackKey, type TrackNext } from '../data/readingTracks';
import { planChapterLevelChoice } from '../lib/rolePrefs';
import { ROLE_META, otherRole, resolveChapterLevel, getActiveTrackKey, type LevelInputs, type LevelMode, type Role } from '../data/rolePerspective';
import { FirstVisitCard, type FirstVisitMode } from './guide/FirstVisitCard';
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
import { TAP, TAP_GAP } from './ui/tapTarget';
import { Button } from './ui/Button';
import { IconBadge } from './ui/IconBadge';
import { Tabs } from './ui/Tabs';

/** Glossary terms the index search matches for s15, computed once. */
const GLOSSARY_TERMS = GLOSSARY.map(g => g.term);

const ROLE_FILTERS = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'pm', label: 'PM' },
  { value: 'ux', label: 'UX' },
  { value: 'ba', label: 'BA' },
  { value: 'sa', label: 'SA' },
  { value: 'eng', label: 'Dev' },
  { value: 'qa', label: 'QA' },
  { value: 'friction', label: 'ขัดแย้ง' },
  { value: 'biz', label: 'ธุรกิจ' },
] as const;

interface GuideTabProps {
  chapters: Chapter[];
  levelInputs: LevelInputs;
  onExperienceLevelChange?: (lvl: ExperienceLevel) => void;
  onChooseRole?: (role: Role | null) => void;
  onChapterLevelChange?: (chapterId: string, level: ExperienceLevel | null) => void;
  showFirstVisit?: boolean;
  onChooseInitialLevel?: (level: ExperienceLevel) => void;
  /** First-visit card: the level that goes with the chosen role (spec 2026-09-23-first-visit-role-and-level). */
  onLevelModeChange?: (mode: LevelMode) => void;
  loadedFromHash: boolean;
  initialSource: 'hash' | 'stored' | 'default';
  hasNavigated: boolean;
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

/**
 * The "next chapter" button beside the reader is the one place GuideTab picks a Button
 * color/variant conditionally (spec §9/§10.1): on a track's last chapter it must not be a
 * second primary solid beside TrackEndCard. Extracted so the choice is unit-testable without a
 * full GuideTab render (the static literal-props guard in hierarchy.test.ts cannot see a
 * conditional color/variant).
 */
export function nextChapterButtonStyle(kind: TrackNext['kind']): { color: 'primary' | 'neutral'; variant: 'solid' | 'outline' } {
  return kind === 'end'
    ? { color: 'neutral', variant: 'outline' }
    : { color: 'primary', variant: 'solid' };
}

export const GuideTab: React.FC<GuideTabProps> = ({
  chapters,
  levelInputs,
  onExperienceLevelChange,
  onChooseRole,
  onChapterLevelChange,
  showFirstVisit,
  onChooseInitialLevel,
  onLevelModeChange,
  loadedFromHash,
  initialSource,
  hasNavigated,
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

  const { role, levelMode } = levelInputs;
  const { level: chapterLevel, source: levelSource } = resolveChapterLevel(levelInputs, activeChapter);
  const trackKey = getActiveTrackKey(role, levelInputs.baseLevel);
  const layout = useMemo(() => getChapterLayout(chapterLevel, activeChapter), [chapterLevel, activeChapter]);
  const [openState, setOpenState] = useState<OpenState>(() => deriveOpenState(layout, activeChapter.id));

  // Other-side box: defaults to the other side (both when no role); resets on role change, not persisted (spec P2.2).
  const defaultOtherSideView: OtherSideView = role ? otherRole(role) : 'both';
  // The pick remembers the role it was made under, so a role change falls back to the
  // default in the same render (no effect, no stale frame).
  const [otherSidePick, setOtherSidePick] = useState<{ role: Role | null; view: OtherSideView } | null>(null);
  const otherSideView = otherSidePick && otherSidePick.role === role ? otherSidePick.view : defaultOtherSideView;
  const setOtherSideView = (view: OtherSideView) => setOtherSidePick({ role, view });

  // Hero seat: the reader's own seat unless flipped; resets on chapter or role change, not persisted (spec P3.3).
  // Stored with the chapter:role key it applies to, so it is derived rather than reset by an effect.
  const seatKey = `${activeChapter.id}:${role}`;
  const [flippedFor, setFlippedFor] = useState<string | null>(null);
  const seatFlipped = flippedFor === seatKey;
  const seat = role ? (seatFlipped ? otherRole(role) : role) : 'biz';

  // Lens hint names the Core sections this chapter actually opens with (from the layer config).
  const coreHint = (layout.find(g => g.layer === 'core')?.sections ?? []).map(k => SECTION_META[k].chip).join(' · ');

  // Per-chapter level button: no redundant override; picking the fallback level clears it.
  const handleChapterLevelPick = (lvl: ExperienceLevel) => {
    const action = planChapterLevelChoice(levelInputs, activeChapter, lvl);
    if (action.kind === 'clear') onChapterLevelChange?.(activeChapter.id, null);
    else if (action.kind === 'set') onChapterLevelChange?.(activeChapter.id, action.level);
  };

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
  const trackNext = getTrackNext(resolveTrack(trackKey, chapters), activeChapter.id);

  // Start the new chapter at its title (page top on desktop, reader card on mobile)
  const handleSelectChapter = (chapterId: string) => {
    onNavigateChapter(chapterId);
    setIsIndexOpen(false);
    scrollToChapterStart('smooth');
  };

  // After a first-visit choice, jump to the chosen track's first chapter.
  // An explicit first-visit choice wins over the loaded hash (round3 spec D4).
  const jumpToTrackStart = (key: TrackKey) => {
    const first = resolveTrack(key, chapters)[0];
    if (first) handleSelectChapter(first);
    if (!window.matchMedia('(min-width: 1024px)').matches) setIsIndexOpen(true);
  };
  const handleFirstVisitChoice = (chosen: Role, mode: FirstVisitMode) => {
    onChooseRole?.(chosen);
    onLevelModeChange?.(mode); // always written, so a stale stored mode never survives the choice
    jumpToTrackStart(chosen);
  };
  const handleFirstVisitSkip = () => onChooseInitialLevel?.('beginner');

  // The chapter was restored from storage: say so once, until the reader navigates (round3 spec D2).
  const showResumedLine = initialSource === 'stored' && !hasNavigated && !showFirstVisit;

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
    role,
    chapterLevel,
    otherSideView, setOtherSideView,
  };

  // Filtered chapters for the Index (search reads core concepts too; role UX fixes P4.1)
  const filteredChapters = filterIndexChapters(chapters, searchQuery, selectedRole, GLOSSARY_TERMS);
  const clearIndexFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
  };
  const indexEmpty = filteredChapters.length === 0 && (
    <IndexEmptyState query={searchQuery} roleFiltered={selectedRole !== 'all'} onClear={clearIndexFilters} />
  );

  const percentCompleted = Math.round((readChapters.length / chapters.length) * 100);

  return (
    <div className="space-y-6 pb-20">
      {/* Top Welcome & Quick Jump Banner */}
      {showFirstVisit ? (
        <FirstVisitCard chapters={chapters} onChoose={handleFirstVisitChoice} onSkip={handleFirstVisitSkip} />
      ) : (
      <div className="bg-base-100 border border-base-border rounded-box p-box-spacious shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-base-300 text-base-content-body text-[11px] sm:text-xs font-semibold border border-base-border">
              <Sparkles className="w-3.5 h-3.5 text-warning" />
              <span>โหมดอ่านทีละบท พร้อมสารบัญกระโดดข้ามได้ตลอดเวลา</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-extrabold text-base-content tracking-tight">
              คู่มือสองโลก Business ↔ Engineering ({chapters.length} บท เริ่มจากศูนย์)
            </h2>
            <p className="text-xs sm:text-sm text-base-content-muted leading-relaxed font-normal">
              มีตั้งแต่จุดเริ่มต้นสำหรับมือใหม่ ศัพท์เทคนิคแปลเป็นภาษาคน ตัวอย่างบทสนทนาจริงในที่ทำงาน แผนภาพจำลองระบบ และทางออกของข้อขัดแย้ง
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Open Table of Contents Button */}
            <Button color="neutral" variant="outline" size="md" tap="gap-8" onClick={openIndex}>
              <List className="w-4 h-4" />
              <span>สารบัญทั้ง {chapters.length} บท (Index)</span>
            </Button>

            <button
              onClick={onStartQuiz}
              className={`${TAP_GAP[8]} inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-base-300 border border-base-border text-base-content-body text-xs sm:text-sm font-medium hover:bg-base-border transition-all cursor-pointer`}
            >
              <GraduationCap className="w-4 h-4 text-warning" />
              <span>ทำควิซสะสม XP</span>
            </button>

            {/* Quick jump to the glossary (chapter 15) */}
            <button
              onClick={() => handleSelectChapter('s15')}
              className={`${TAP_GAP[8]} inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-base-300 border border-base-border text-base-content-body text-xs sm:text-sm font-medium hover:bg-base-border transition-all cursor-pointer`}
            >
              <span aria-hidden="true">📖</span>
              <span>Glossary</span>
            </button>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 pt-3.5 border-t border-base-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 text-base-content-secondary font-medium text-[11px] sm:text-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-success" />
            <span>ความคืบหน้าการอ่าน: อ่านจบแล้ว {readChapters.length} จาก {chapters.length} บท ({percentCompleted}%)</span>
          </div>
          <div className="w-full sm:w-64 h-1.5 sm:h-2 rounded-full bg-base-300 overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
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
          <div className="space-y-3.5 max-h-[calc(100vh-6rem)] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-base-border">
              <div className="flex items-center gap-2">
                <List className="w-4 h-4 text-base-content" />
                <h3 className="text-xs sm:text-sm font-bold text-base-content">สารบัญบทเรียน ({chapters.length} บท)</h3>
              </div>
              <span className="text-[11px] font-semibold text-base-content-muted">
                บทที่ {activeIndex + 1}/{chapters.length}
              </span>
            </div>

            <TrackPanel chapters={chapters} trackKey={trackKey} readChapters={readChapters} activeChapterId={activeChapterId} onSelectChapter={handleSelectChapter} onStartQuiz={onStartQuiz} />

            <h3 data-all-chapters-heading className="text-xs font-bold text-base-content-muted">ทุกบท ({chapters.length})</h3>

            {/* Quick Search in Index */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาบท หรือ คำศัพท์..."
                className="w-full pl-8 pr-3 py-1.5 bg-base-300 border border-base-border rounded-xl text-xs text-base-content placeholder-base-content-subtle focus:outline-none focus:ring-1 focus:ring-base-border-strong"
              />
            </div>

            {/* Role Filter Chips */}
            <Tabs<string>
              variant="pills"
              size="xs"
              scroll
              aria-label="กรองตามสายงาน"
              items={ROLE_FILTERS}
              value={selectedRole}
              onChange={setSelectedRole}
              className="shrink-0"
            />

            {/* Chapter List Scrollable */}
            <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 scrollbar-thin">
              {indexEmpty}
              {filteredChapters.map((chapter) => {
                const isActive = chapter.id === activeChapterId;
                const isRead = readChapters.includes(chapter.id);
                const isBookmarked = bookmarks.includes(chapter.id);

                return (
                  <button
                    key={chapter.id}
                    onClick={() => handleSelectChapter(chapter.id)}
                    className={`${TAP} w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isActive
                        ? 'bg-base-300 border-base-border-strong shadow-xs'
                        : 'bg-base-100 border-base-border hover:border-base-border-strong hover:bg-base-300'
                    }`}
                  >
                    <IconBadge
                      size="sm"
                      variant={isActive ? 'outline' : 'soft'}
                      color={isRead && !isActive ? 'success' : 'neutral'}
                      label={`บทที่ ${chapter.num}`}
                      className="mt-0.5"
                    >
                      {isRead && !isActive ? <Check className="w-3.5 h-3.5" /> : chapter.num}
                    </IconBadge>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${
                          isActive 
                            ? 'text-base-content font-bold' 
                            : 'text-base-content-body font-medium'
                        }`}>
                          {chapter.title}
                        </span>
                        {isBookmarked && (
                          <BookmarkCheck className="w-3.5 h-3.5 text-warning shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-base-content-muted">
                        <span className="uppercase font-semibold">{chapter.roleTag}</span>
                        <span>•</span>
                        <span>{chapter.readTime}</span>
                        {isRead && (
                          <>
                            <span>•</span>
                            <span className="text-success font-semibold">อ่านแล้ว</span>
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
        <div className="lg:col-span-8 space-y-section">
          {/* Chapter Top Navigation Bar */}
          <div className="bg-base-100 border border-base-border rounded-box p-box shadow-2xs">
            {showResumedLine && (
              <p data-resumed className="mb-2 text-xs text-base-content-muted truncate">
                อ่านต่อจากครั้งก่อน · บทที่ {activeChapter.num}
              </p>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                {/* Prev Chapter Button */}
                <button
                  disabled={!prevChapter}
                  onClick={() => prevChapter && handleSelectChapter(prevChapter.id)}
                  className={`${TAP} p-2 rounded-xl border flex items-center gap-1 text-xs font-semibold transition-all ${
                    prevChapter
                      ? 'border-base-border hover:bg-base-300 text-base-content-body cursor-pointer'
                      : 'border-base-border text-base-content-subtle cursor-not-allowed'
                  }`}
                  title={prevChapter ? `บทก่อนหน้า: ${prevChapter.title}` : 'นี่คือบทแรก'}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">บทก่อนหน้า</span>
                </button>

                {/* Mobile Table of Contents Toggle */}
                <button
                  onClick={openIndex}
                  className={`${TAP} lg:hidden px-3 py-2 rounded-xl bg-base-300 hover:bg-base-border text-base-content-body text-xs font-semibold flex items-center gap-1.5 cursor-pointer`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>สารบัญ ({activeChapter.num}/{chapters.length})</span>
                </button>

                {/* Current Chapter Indicator on Desktop */}
                <div className="hidden lg:flex items-center gap-2 pl-2">
                  <span className="px-2.5 py-1 rounded-lg bg-base-300 text-base-content-body text-xs font-bold border border-base-border">
                    บทที่ {activeChapter.num} จาก {chapters.length}
                  </span>
                  <span className="text-xs text-base-content-secondary font-medium truncate max-w-[200px]">
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
                    className={`${TAP} px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCurrentRead
                        ? 'bg-success/10 border-success/25 text-success'
                        : 'bg-base-300 border-base-border text-base-content-body hover:bg-base-border'
                    }`}
                    title="ทำเครื่องหมายว่าอ่านและเข้าใจบทนี้แล้ว (+30 XP)"
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrentRead ? 'text-success' : 'text-base-content-muted'}`} />
                    <span className="hidden md:inline">{isCurrentRead ? 'อ่านแล้ว' : 'ทำเครื่องหมายว่าอ่านแล้ว'}</span>
                  </button>
                )}

                {/* Bookmark Toggle */}
                <button
                  onClick={() => onToggleBookmark(activeChapter.id)}
                  className={`${TAP} p-2 rounded-xl border transition-all cursor-pointer ${
                    isCurrentBookmarked
                      ? 'bg-warning/10 border-warning/25 text-warning'
                      : 'bg-base-300 border-base-border text-base-content-muted hover:text-base-content'
                  }`}
                  title={isCurrentBookmarked ? 'ลบบุ๊กมาร์ก' : 'บันทึกบทนี้ (+15 XP)'}
                >
                  {isCurrentBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                </button>

                {/* Next Chapter Button */}
                <Button
                  {...nextChapterButtonStyle(trackNext.kind)}
                  size="sm"
                  disabled={!nextChapter}
                  onClick={() => nextChapter && handleSelectChapter(nextChapter.id)}
                  title={nextChapter ? `บทถัดไป: ${nextChapter.title}` : 'นี่คือบทสุดท้าย'}
                >
                  <span className="hidden sm:inline">บทถัดไป</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Chapter Main Content Reader Card */}
          <div id={CHAPTER_START_ID} className="bg-base-100 border border-base-border rounded-box p-box-spacious shadow-2xs space-y-section">
            
            <ChapterHero
              chapter={activeChapter}
              experienceLevel={chapterLevel}
              isRead={isCurrentRead}
              role={role}
              seat={seat}
              onFlipSeat={() => setFlippedFor((f) => (f === seatKey ? null : seatKey))}
              onNavigateChapter={handleSelectChapter}
              onSearchGlossary={handleSearchGlossary}
            />

            {/* ADAPTIVE LENS CONTROLLER BANNER */}
            <div className="p-box-dense rounded-box bg-base-300 border border-base-border space-y-2 sm:space-y-2.5">
              {role === null ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-base-content flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-base-content-secondary" />
                      <span>Active Mode:</span>
                    </span>
                    <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 rounded-md bg-success/10 text-success">
                      {chapterLevel === 'beginner' ? '🌱 Beginner' : '⚡ Experienced'}
                    </span>
                  </div>

                  {/* Quick Switch Buttons */}
                  <Tabs<ExperienceLevel>
                    variant="segmented"
                    aria-label="สลับเลนส์เนื้อหา"
                    className="self-start sm:self-auto"
                    items={[
                      { value: 'beginner', label: '🌱 ใหม่กับเรื่องนี้' },
                      { value: 'experienced', label: '⚡ ทำงานข้ามทีมมาแล้ว' },
                    ]}
                    value={chapterLevel}
                    onChange={lvl => onExperienceLevelChange?.(lvl)}
                  />
                </div>
              ) : (
                <div data-role-lens={role} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-xs font-bold text-base-content flex items-start gap-1.5" data-role-lens-status>
                    <SlidersHorizontal className="w-3.5 h-3.5 mt-0.5 shrink-0 text-base-content-secondary" />
                    <span>
                      {activeChapter.home === 'shared'
                        ? 'บทนี้เป็นงานที่สองฝั่งทำร่วมกัน'
                        : `บทนี้เป็นงาน${ROLE_META[activeChapter.home === role ? role : otherRole(role)].side}`}
                      {' · '}
                      {levelSource === 'global'
                        ? 'ใช้ระดับเดียวกันทุกบท'
                        : chapterLevel === 'experienced' ? 'เปิดแบบคุ้นงาน' : 'เปิดแบบมือใหม่'}
                    </span>
                  </p>

                  {/* Per-chapter level switch (this chapter only) */}
                  <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                    <Tabs<ExperienceLevel>
                      variant="segmented"
                      aria-label="ระดับของบทนี้"
                      items={[
                        { value: 'beginner', label: '🌱 มือใหม่' },
                        { value: 'experienced', label: '⚡ คุ้นงานแล้ว' },
                      ]}
                      value={chapterLevel}
                      onChange={handleChapterLevelPick}
                    />
                    {levelSource === 'chapter' && (
                      <>
                        <span data-chapter-level-scope className="text-xs text-base-content-muted">
                          {chapterLevelScopeLabel(role)}
                        </span>
                        <button
                          type="button"
                          data-chapter-level-reset
                          onClick={() => onChapterLevelChange?.(activeChapter.id, null)}
                          className={`${TAP} text-xs font-semibold text-base-content-muted hover:underline cursor-pointer`}
                        >
                          {chapterLevelResetLabel(levelMode)}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              <p className="text-[11px] sm:text-xs text-base-content-muted leading-relaxed">
                {chapterLevel === 'beginner'
                  ? `💡 โหมดมือใหม่: เปิด ${coreHint} ไว้ก่อน ส่วนอื่นพับไว้ในชั้น "นำไปใช้" และ "เจาะลึก"`
                  : `⚡ โหมดทำงานข้ามทีม: เปิด ${coreHint} ไว้ก่อน วิธีรับมือ Friction อยู่ในชั้น "นำไปใช้"`}
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
            <div className="pt-5 border-t border-base-border space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => onAskAIWithPrompt(`ช่วยอธิบายบทที่ ${activeChapter.num} "${activeChapter.title}" ให้ฟังอย่างละเอียด พร้อมยกตัวอย่างเคสจริงในบริษัทเทคให้เห็นภาพ`)}
                  className={`${TAP} inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-base-300 text-base-content hover:bg-base-border text-xs sm:text-sm font-semibold border border-base-border transition-colors cursor-pointer`}
                >
                  <Bot className="w-4 h-4 text-base-content-secondary" />
                  <span>ถาม AI เพิ่มเรื่องบทนี้</span>
                </button>

                {onToggleReadChapter && !isCurrentRead && (
                  <Button
                    color="success"
                    variant="soft"
                    size="md"
                    onClick={() => {
                      onToggleReadChapter(activeChapter.id);
                      if (trackNext.kind === 'next') handleSelectChapter(trackNext.chapterId);
                      else if (trackNext.kind === 'not-in-track' && nextChapter) handleSelectChapter(nextChapter.id);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {trackNext.kind === 'next'
                        ? 'อ่านจบแล้ว! ไปบทถัดไปใน track (+30 XP)'
                        : trackNext.kind === 'end'
                        ? 'อ่านจบแล้ว! (+30 XP)'
                        : 'อ่านจบแล้ว! ไปบทถัดไป (+30 XP)'}
                    </span>
                  </Button>
                )}
              </div>

              {/* Bottom Pagination Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {prevChapter ? (
                  <button
                    onClick={() => handleSelectChapter(prevChapter.id)}
                    className={`${TAP} p-box-dense rounded-box border border-base-border hover:border-base-border-strong text-left transition-all cursor-pointer bg-base-300 group`}
                  >
                    <div className="flex items-center gap-1 text-[11px] text-base-content-muted group-hover:text-base-content transition-colors">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>บทก่อนหน้า</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-base-content mt-1 truncate">
                      บทที่ {prevChapter.num}: {prevChapter.title}
                    </div>
                  </button>
                ) : <div />}

                {trackNext.kind === 'next' ? (
                  <TrackNextCard next={trackNext} chapters={chapters} onSelectChapter={handleSelectChapter} />
                ) : trackNext.kind === 'end' ? (
                  <TrackEndCard trackKey={trackKey} onStartQuiz={onStartQuiz} onOpenIndex={openIndex} />
                ) : (
                  nextChapter && (
                    <button
                      onClick={() => handleSelectChapter(nextChapter.id)}
                      className={`${TAP} p-box-dense rounded-box border border-base-border hover:border-base-border-strong text-right transition-all cursor-pointer bg-base-300 group`}
                    >
                      <div className="flex items-center justify-end gap-1 text-[11px] text-base-content font-semibold">
                        <span>บทถัดไป</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-base-content mt-1 truncate">
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
        <div className="fixed inset-0 z-50 flex justify-end bg-neutral/60 backdrop-blur-xs transition-opacity animate-fadeIn">
          <div className="w-full max-w-md bg-base-100 h-full shadow-2xl flex flex-col overflow-hidden border-l border-base-border animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="p-box border-b border-base-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-base-content flex items-center gap-2">
                  <List className="w-4 h-4 text-base-content-secondary" />
                  <span>สารบัญทั้ง {chapters.length} บท</span>
                </h3>
                <p className="text-xs text-base-content-muted mt-0.5">
                  อ่านแล้ว {readChapters.length}/{chapters.length} บท • เลือกเพื่อกระโดดข้ามทันที
                </p>
              </div>
              <button
                onClick={closeIndex}
                className={`${TAP} p-2 rounded-xl text-base-content-muted hover:text-base-content-body hover:bg-base-300 cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Search & Filter */}
            <div className="p-4 border-b border-base-border space-y-3 bg-base-300">
              <TrackPanel chapters={chapters} trackKey={trackKey} readChapters={readChapters} activeChapterId={activeChapterId} onSelectChapter={handleSelectChapter} onStartQuiz={onStartQuiz} />

              <h3 data-all-chapters-heading className="text-xs font-bold text-base-content-muted">ทุกบท ({chapters.length})</h3>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อบท, คำศัพท์ เช่น C4, DoR, API..."
                  className="w-full pl-9 pr-3 py-2 bg-base-100 border border-base-border rounded-xl text-xs text-base-content placeholder-base-content-subtle focus:outline-none focus:ring-1 focus:ring-base-border-strong"
                />
              </div>

              <div className="pb-1 max-sm:-mt-2.5 max-sm:pt-2.5 max-sm:-mb-2.5 max-sm:pb-3.5">
                <Tabs<string>
                  variant="pills"
                  size="xs"
                  scroll
                  aria-label="กรองตามสายงาน"
                  items={ROLE_FILTERS}
                  value={selectedRole}
                  onChange={setSelectedRole}
                />
              </div>
            </div>

            {/* Chapter Items List */}
            <div className="p-3.5 overflow-y-auto flex-1 space-y-1.5 divide-y divide-base-border">
              {indexEmpty}
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
                        ? 'bg-base-300 border border-base-border-strong'
                        : 'hover:bg-base-300'
                    }`}
                  >
                    <IconBadge
                      size="md"
                      variant={isActive ? 'outline' : 'soft'}
                      color={isRead && !isActive ? 'success' : 'neutral'}
                      label={`บทที่ ${chapter.num}`}
                      className="mt-0.5"
                    >
                      {isRead && !isActive ? <Check className="w-3.5 h-3.5" /> : chapter.num}
                    </IconBadge>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs sm:text-sm font-bold truncate ${
                          isActive ? 'text-base-content' : 'text-base-content-body'
                        }`}>
                          {chapter.title}
                        </span>
                        {isBookmarked && (
                          <BookmarkCheck className="w-3.5 h-3.5 text-warning shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-base-content-muted line-clamp-1 font-normal">
                        {chapter.subtitle}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-base-content-muted font-normal">
                        <span className="px-1.5 py-0.5 rounded bg-base-300 uppercase text-base-content-secondary">
                          {chapter.roleTag}
                        </span>
                        <span>{chapter.readTime}</span>
                        {isRead && (
                          <span className="text-success font-semibold">• อ่านแล้ว</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-base-border bg-base-300 flex items-center justify-between text-xs">
              <span className="text-base-content-muted text-[11px]">สะสม XP จากการอ่านและการทำควิซ</span>
              <Button color="neutral" variant="ghost" size="md" onClick={closeIndex}>ปิดสารบัญ</Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
