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
import { TAP } from '../../ui/tapTarget';
import { IconBadge } from '../../ui/IconBadge';
import { Tabs } from '../../ui/Tabs';

export const DiagramSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  return (
    <div className="border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-box flex items-center justify-between bg-base-300 hover:bg-base-border text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <IconBadge size="md">🗺️</IconBadge>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              {chapter.diagramTitle || `แผนภาพโครงสร้างและกระบวนการบทที่ ${chapter.num}`}
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              {chapter.diagramDescription || 'ภาพรวมระบบและขั้นตอนการทำงาน'}
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-box border-t border-base-border bg-base-100 space-y-4">
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
              className="anchor-target mt-4 p-box-dense rounded-box bg-base-100 border border-base-border space-y-3"
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-base-content flex items-center gap-2">
                  <Layers className="w-4 h-4 text-base-content-secondary" />
                  <span>Interactive C4 Model Explorer (คลิกซูมเข้าดูทีละระดับ)</span>
                </h4>
                <Tabs<string>
                  variant="segmented"
                  aria-label="ระดับ C4"
                  items={[1, 2, 3, 4].map(lvl => ({ value: String(lvl), label: `L${lvl}` }))}
                  value={String(ctx.c4Level)}
                  onChange={v => ctx.setC4Level(Number(v))}
                />
              </div>

              <p className="text-[11px] sm:text-xs text-base-content-muted leading-relaxed">
                Metaphor แบบ Google Maps — ซูมเข้าไปทีละชั้น ยิ่งซูมเข้ายิ่งเห็นรายละเอียดมากขึ้น แต่ดูทีละระดับพอ
              </p>

              {/* Static C4 figure for the selected level (c4-l1…c4-l4) */}
              {(() => {
                const C4Figure = FIGURES[`c4-l${ctx.c4Level}` as 'c4-l1' | 'c4-l2' | 'c4-l3' | 'c4-l4'];
                return (
                  <div className="p-3 rounded-xl bg-base-100 border border-base-border">
                    <C4Figure className="w-full" />
                  </div>
                );
              })()}

              <div className="p-3.5 bg-base-300 rounded-xl border border-base-border text-xs sm:text-sm space-y-1">
                {ctx.c4Level === 1 && (
                  <div>
                    <span className="font-bold text-base-content">Level 1: System Context</span>
                    <p className="text-base-content-secondary mt-1 leading-relaxed text-xs">
                      ซูมออกสุด เห็นระบบเป็นกล่องเดียวตรงกลาง ล้อมรอบด้วย Actor (ลูกค้า, ร้านค้า, ไรเดอร์) และระบบภายนอก (Payment Gateway, Map API) — <b>เหมาะที่สุดสำหรับ Business Stakeholders และผู้บริหาร</b>
                    </p>
                    <p className="text-base-content-secondary mt-1 leading-relaxed text-xs">
                      ไม่มีรายละเอียดเทคโนโลยีเลย ผู้อ่าน: ทุกคนรวมถึงคนไม่เทคนิค
                    </p>
                  </div>
                )}
                {ctx.c4Level === 2 && (
                  <div>
                    <span className="font-bold text-base-content">Level 2: Container Diagram</span>
                    <p className="text-base-content-secondary mt-1 leading-relaxed text-xs">
                      ซูมเข้ามา 1 ชั้น เห็นหน่วยที่ Deploy แยกกันได้ เช่น Single Page App, Mobile App, Backend API, Database — <b>เหมาะสำหรับ Tech Lead &amp; Software Architects</b>
                    </p>
                    <p className="text-base-content-secondary mt-1 leading-relaxed text-xs">
                      "container" คือหน่วยที่ deploy/run แยกกันได้ ผู้อ่าน: คนเทคนิคที่ต้องเข้าใจ tech choice ระดับสูง
                    </p>
                  </div>
                )}
                {ctx.c4Level === 3 && (
                  <div>
                    <span className="font-bold text-base-content">Level 3: Component Diagram</span>
                    <p className="text-base-content-secondary mt-1 leading-relaxed text-xs">
                      ซูมเข้าไปในหนึ่ง Container (เช่น Backend API) แสดงโมดูลย่อย เช่น OrderComponent, PaymentController, NotificationService — <b>เหมาะสำหรับทีม Developer ที่ Implement</b>
                    </p>
                  </div>
                )}
                {ctx.c4Level === 4 && (
                  <div>
                    <span className="font-bold text-base-content">Level 4: Code Diagram (UML Class)</span>
                    <p className="text-base-content-secondary mt-1 leading-relaxed text-xs">
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
