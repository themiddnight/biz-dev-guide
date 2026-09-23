import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ContentBlocks } from '../../content/ContentBlocks';
import { getReferenceSections } from '../../../data/sectionLayers';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';

export const ReferenceSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  const referenceSections = getReferenceSections(chapter);
  const referenceBlockCount = referenceSections.reduce((sum, section) => sum + section.blocks.length, 0);
  return (
    <>
      {referenceSections.length > 0 && (
        <div className="border border-base-border rounded-2xl overflow-hidden bg-base-100 shadow-2xs">
          <button
            onClick={onToggle}
            aria-expanded={!!isOpen}
            className={`${TAP} w-full p-3.5 sm:p-4.5 flex items-center justify-between bg-base-300 hover:bg-base-300 text-left cursor-pointer select-none transition-colors`}
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                📚
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-base-content">
                  เนื้อหาอ้างอิง (Reference)
                </h3>
                <p className="text-[11px] sm:text-xs text-base-content-muted">
                  ตาราง การ์ด และที่มาของบทนี้ ({referenceBlockCount} รายการ)
                </p>
              </div>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
          </button>

          {isOpen && (
            <div className="p-3.5 sm:p-5 border-t border-base-border bg-base-100">
              <ContentBlocks
                sections={referenceSections}
                placement="reference"
                onNavigateChapter={ctx.onNavigateChapter}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
};
