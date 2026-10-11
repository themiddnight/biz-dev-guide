import React from 'react';
import { ChapterDiagram } from '../../ChapterDiagram';
import { ContentBlocks } from '../../content/ContentBlocks';
import { DiagramFamilyGrid } from '../../diagrams/DiagramFamilyGrid';
import { SwimlaneVsSequence } from '../../diagrams/SwimlaneVsSequence';
import { S5_JUMP_TARGET_IDS } from '../../../data/diagramFamilies';
import { FIGURES } from '../../figures';
import { GlossaryCategoryMap } from '../../glossary/GlossaryCategoryMap';
import { GLOSSARY } from '../../../data/glossary';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';
import { Tabs } from '../../ui/Tabs';

type C4Level = 1 | 2 | 3 | 4;
const C4_LEVELS: readonly C4Level[] = [1, 2, 3, 4];

const C4_NOTES: Record<C4Level, { name: string; lines: string[] }> = {
  1: {
    name: 'Level 1 System Context',
    lines: [
      'ซูมออกสุด เห็นระบบเป็นกล่องเดียวตรงกลาง ล้อมด้วย Actor (ลูกค้า ร้านค้า ไรเดอร์) และระบบภายนอก (Payment Gateway, Map API) ระดับนี้เหมาะกับฝั่ง Business และผู้บริหารที่สุด',
      'ยังไม่มีรายละเอียดเทคโนโลยีเลย คนที่ไม่ได้ทำงานเทคนิคก็อ่านได้',
    ],
  },
  2: {
    name: 'Level 2 Container Diagram',
    lines: [
      'ซูมเข้ามาหนึ่งชั้น เห็นหน่วยที่ Deploy แยกกันได้ เช่น Single Page App, Mobile App, Backend API, Database ระดับนี้เหมาะกับ Tech Lead และ Software Architect',
      'Container ในที่นี้คือหน่วยที่ Deploy และรันแยกกันได้ คนอ่านคือคนเทคนิคที่ต้องเข้าใจการเลือกเทคโนโลยีในภาพรวม',
    ],
  },
  3: {
    name: 'Level 3 Component Diagram',
    lines: [
      'ซูมเข้าไปใน Container หนึ่งตัว (เช่น Backend API) เห็นโมดูลย่อย เช่น OrderComponent, PaymentController, NotificationService ระดับนี้เหมาะกับทีม Dev ที่ลงมือเขียน',
    ],
  },
  4: {
    name: 'Level 4 Code Diagram',
    lines: [
      'ซูมถึงระดับ Class และ Function ในโค้ดจริง (UML Class) ปกติไม่ต้องวาดเองเพราะโค้ดเปลี่ยนเร็ว ให้ IDE สร้างให้',
    ],
  },
};

export const DiagramSection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
  const c4Level = (C4_LEVELS as readonly number[]).includes(ctx.c4Level) ? (ctx.c4Level as C4Level) : 1;
  const C4Figure = FIGURES[`c4-l${c4Level}`];
  const diagramBlocks = chapter.contentSections && (
    <ContentBlocks sections={chapter.contentSections} placement="diagram" onNavigateChapter={ctx.onNavigateChapter} />
  );
  return (
    <SectionShell {...props} sectionKey="diagram">
      <div className="space-y-6">
        {(chapter.diagramTitle || chapter.diagramDescription) && (
          <div>
            {chapter.diagramTitle && <h3 data-diagram-title className="font-semibold text-base-content">{chapter.diagramTitle}</h3>}
            {chapter.diagramDescription && <p className="mt-1 text-base-content-secondary">{chapter.diagramDescription}</p>}
          </div>
        )}

        {/* s5: diagram families and their table sit above the Monolith vs Microservices simulator (spec §3.4 order) */}
        {chapter.id === 's5' && (
          <>
            <DiagramFamilyGrid onJump={ctx.onDiagramJump} />
            {diagramBlocks}
          </>
        )}

        {chapter.id === 's15' ? (
          <GlossaryCategoryMap
            terms={GLOSSARY}
            activeCategory={ctx.glossaryCategory}
            onSelectCategory={ctx.onSelectGlossaryCategory}
          />
        ) : (
          <ChapterDiagram chapterId={chapter.id} />
        )}

        {chapter.id !== 's5' && diagramBlocks}

        {chapter.id === 's5' && (
          <>
            <div
              id={S5_JUMP_TARGET_IDS.c4}
              data-c4-explorer
              className="anchor-target space-y-3 rounded-box border border-base-border p-box"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-base-content">ซูมดู C4 ทีละระดับ</h3>
                <Tabs<string>
                  variant="segmented"
                  aria-label="ระดับ C4"
                  items={C4_LEVELS.map(lvl => ({ value: String(lvl), label: `L${lvl}` }))}
                  value={String(c4Level)}
                  onChange={v => ctx.setC4Level(Number(v))}
                />
              </div>
              <p className="text-sm text-base-content-muted">
                เหมือนซูม Google Maps ยิ่งซูมเข้ายิ่งเห็นรายละเอียด ดูทีละระดับก็พอ
              </p>
              <C4Figure className="w-full" />
              <div data-c4-note={c4Level}>
                <p className="font-semibold text-base-content">{C4_NOTES[c4Level].name}</p>
                {C4_NOTES[c4Level].lines.map(line => <p key={line} className="mt-1">{line}</p>)}
              </div>
            </div>

            {/* Swimlane vs sequence worked example (static s5 dg-behavior) */}
            <SwimlaneVsSequence />
          </>
        )}
      </div>
    </SectionShell>
  );
};
