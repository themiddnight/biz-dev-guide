import React from 'react';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { ChapterDiagram } from '../../ChapterDiagram';
import { ContentBlocks } from '../../content/ContentBlocks';
import { DiagramFamilyGrid } from '../../diagrams/DiagramFamilyGrid';
import { SwimlaneVsSequence } from '../../diagrams/SwimlaneVsSequence';
import { S5_JUMP_TARGET_IDS } from '../../../data/diagramFamilies';
import { FIGURES } from '../../figures';
import { GlossaryCategoryMap } from '../../glossary/GlossaryCategoryMap';
import { GLOSSARY } from '../../../data/glossary';
import type { SectionProps } from './registry';

export const DiagramSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  return (
    <div className="border border-neutral-200 dark:border-[#262626] rounded-2xl overflow-hidden bg-white dark:bg-[#141414] shadow-2xs">
      <button
        onClick={onToggle}
        className="w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-neutral-50 dark:bg-[#181818] hover:bg-neutral-100/70 dark:hover:bg-[#1f1f1f] text-left cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-[#0a0a0a] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            🗺️
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa]">
              {chapter.diagramTitle || `แผนภาพโครงสร้างและกระบวนการบทที่ ${chapter.num}`}
            </h3>
            <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e]">
              {chapter.diagramDescription || 'แผนภาพจำลองสถาปัตยกรรมและกระบวนการทำงานร่วมกัน'}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" /> : <ChevronDown className="w-4 h-4 text-neutral-400 dark:text-[#737373]" />}
      </button>

      {isOpen && (
        <div className="p-3.5 sm:p-5 border-t border-neutral-100 dark:border-[#262626] bg-neutral-50/50 dark:bg-[#111111] space-y-4">
          {/* s5: diagram families + T1 render above the Monolith vs Microservices simulator (spec §3.4 order) */}
          {chapter.id === 's5' && (
            <div className="space-y-3">
              <DiagramFamilyGrid onJump={ctx.onDiagramJump} />
              {chapter.contentSections && (
                <ContentBlocks
                  sections={chapter.contentSections}
                  placement="diagram"
                  onNavigateChapter={ctx.onNavigateChapter}
                />
              )}
            </div>
          )}

          {/* Interactive Chapter Diagram Simulator */}
          {chapter.id === 's15' ? (
            <GlossaryCategoryMap
              terms={GLOSSARY}
              activeCategory={ctx.glossaryCategory}
              onSelectCategory={ctx.onSelectGlossaryCategory}
            />
          ) : (
            <ChapterDiagram chapterId={chapter.id} />
          )}

          {/* Restored static-guide blocks placed inside the diagram section (s5 renders them above) */}
          {chapter.id !== 's5' && chapter.contentSections && (
            <ContentBlocks
              sections={chapter.contentSections}
              placement="diagram"
              onNavigateChapter={ctx.onNavigateChapter}
            />
          )}

          {/* Interactive C4 Model Zoom for Chapter 5 */}
          {chapter.id === 's5' && (
            <>
            <div
              id={S5_JUMP_TARGET_IDS.c4}
              className="anchor-target mt-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-[#fafafa] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-neutral-600 dark:text-[#a3a3a3]" />
                  <span>Interactive C4 Model Explorer (คลิกซูมเข้าดูทีละระดับ)</span>
                </h4>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => ctx.setC4Level(lvl)}
                      aria-pressed={ctx.c4Level === lvl}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        ctx.c4Level === lvl
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-[#0a0a0a] shadow-xs'
                          : 'bg-neutral-100 dark:bg-[#1f1f1f] text-neutral-600 dark:text-[#a3a3a3] hover:bg-neutral-200 dark:hover:bg-[#262626]'
                      }`}
                    >
                      L{lvl}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-[#8e8e8e] leading-relaxed">
                Metaphor แบบ Google Maps — ซูมเข้าไปทีละชั้น ยิ่งซูมเข้ายิ่งเห็นรายละเอียดมากขึ้น แต่ดูทีละระดับพอ
              </p>

              {/* Static C4 figure for the selected level (c4-l1…c4-l4) */}
              {(() => {
                const C4Figure = FIGURES[`c4-l${ctx.c4Level}` as 'c4-l1' | 'c4-l2' | 'c4-l3' | 'c4-l4'];
                return (
                  <div className="p-3 rounded-xl bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626]">
                    <C4Figure className="w-full" />
                  </div>
                );
              })()}

              <div className="p-3.5 bg-neutral-50 dark:bg-[#181818] rounded-xl border border-neutral-200 dark:border-[#262626] text-xs sm:text-sm space-y-1">
                {ctx.c4Level === 1 && (
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-[#fafafa]">Level 1: System Context</span>
                    <p className="text-neutral-600 dark:text-[#a3a3a3] mt-1 leading-relaxed text-xs">
                      ซูมออกสุด เห็นระบบเป็นกล่องเดียวตรงกลาง ล้อมรอบด้วย Actor (ลูกค้า, ร้านค้า, ไรเดอร์) และระบบภายนอก (Payment Gateway, Map API) — <b>เหมาะที่สุดสำหรับ Business Stakeholders และผู้บริหาร</b>
                    </p>
                    <p className="text-neutral-600 dark:text-[#a3a3a3] mt-1 leading-relaxed text-xs">
                      ไม่มีรายละเอียดเทคโนโลยีเลย ผู้อ่าน: ทุกคนรวมถึงคนไม่เทคนิค
                    </p>
                  </div>
                )}
                {ctx.c4Level === 2 && (
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-[#fafafa]">Level 2: Container Diagram</span>
                    <p className="text-neutral-600 dark:text-[#a3a3a3] mt-1 leading-relaxed text-xs">
                      ซูมเข้ามา 1 ชั้น เห็นหน่วยที่ Deploy แยกกันได้ เช่น Single Page App, Mobile App, Backend API, Database — <b>เหมาะสำหรับ Tech Lead &amp; Software Architects</b>
                    </p>
                    <p className="text-neutral-600 dark:text-[#a3a3a3] mt-1 leading-relaxed text-xs">
                      "container" คือหน่วยที่ deploy/run แยกกันได้ ผู้อ่าน: คนเทคนิคที่ต้องเข้าใจ tech choice ระดับสูง
                    </p>
                  </div>
                )}
                {ctx.c4Level === 3 && (
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-[#fafafa]">Level 3: Component Diagram</span>
                    <p className="text-neutral-600 dark:text-[#a3a3a3] mt-1 leading-relaxed text-xs">
                      ซูมเข้าไปในหนึ่ง Container (เช่น Backend API) แสดงโมดูลย่อย เช่น OrderComponent, PaymentController, NotificationService — <b>เหมาะสำหรับทีม Developer ที่ Implement</b>
                    </p>
                  </div>
                )}
                {ctx.c4Level === 4 && (
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-[#fafafa]">Level 4: Code Diagram (UML Class)</span>
                    <p className="text-neutral-600 dark:text-[#a3a3a3] mt-1 leading-relaxed text-xs">
                      ซูมระดับ Class / Functions ในโค้ดจริง — <i>คำแนะนำ:</i> มักไม่ต้องวาดมือเพราะโค้ดเปลี่ยนเร็ว ให้ IDE สร้างอัตโนมัติ
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Swimlane vs sequence worked example (static s5 dg-behavior) */}
            <SwimlaneVsSequence />
            </>
          )}
        </div>
      )}
    </div>
  );
};
