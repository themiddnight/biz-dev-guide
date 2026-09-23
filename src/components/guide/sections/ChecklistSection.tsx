import React from 'react';
import { ChevronDown, ChevronUp, CheckSquare, Square } from 'lucide-react';
import type { SectionProps } from './registry';
import { TAP } from '../../ui/tapTarget';
import { IconBadge } from '../../ui/IconBadge';

export const ChecklistSection: React.FC<SectionProps> = ({ chapter, isOpen, onToggle, ctx }) => {
  /* SECTION 8: Pre-flight Checklist */
  if (!chapter.checklist || chapter.checklist.length === 0) return null;
  return (
    <div className="border border-base-border rounded-box overflow-hidden bg-base-100 shadow-2xs">
      <button
        onClick={onToggle}
        className={`${TAP} w-full p-box flex items-center justify-between bg-base-300 hover:bg-base-border text-left cursor-pointer select-none transition-colors`}
      >
        <div className="flex items-center gap-3">
          <IconBadge size="md">✅</IconBadge>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-base-content">
              Pre-flight Checklist ก่อนเข้าประชุมหรือส่งต่องาน
            </h3>
            <p className="text-[11px] sm:text-xs text-base-content-muted">
              เช็กให้ครบก่อนส่งต่องาน จะได้ไม่มีอะไรตกหล่น ({chapter.checklist.length} ข้อ)
            </p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-base-content-secondary" /> : <ChevronDown className="w-4 h-4 text-base-content-muted" />}
      </button>

      {isOpen && (
        <div className="p-box border-t border-base-border bg-base-100 space-y-1.5 text-xs">
          {chapter.checklist.map((item, idx) => {
            const itemKey = `${chapter.id}_cl_${idx}`;
            const isChecked = !!ctx.checkedChecklist[itemKey];
            return (
              <div
                key={idx}
                onClick={() => ctx.onToggleChecklistItem(itemKey)}
                className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isChecked
                    ? 'bg-base-300 text-base-content-muted line-through opacity-80'
                    : 'hover:bg-base-300 text-base-content-body'
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-success shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-base-content-muted shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed font-normal">{item}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
