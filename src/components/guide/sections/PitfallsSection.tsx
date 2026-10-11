import React from 'react';
import { ShieldAlert } from 'lucide-react';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';

export const PitfallsSection: React.FC<SectionProps> = props => {
  const { chapter } = props;
  /* SECTION 7: กับดักที่เจอบ่อยและทางออก (Common Pitfalls & Solutions) */
  if (!chapter.commonPitfalls || chapter.commonPitfalls.length === 0) return null;
  return (
    <SectionShell {...props} sectionKey="pitfalls" title="กับดักที่เจอบ่อย" note={`${chapter.commonPitfalls.length} ข้อ`}>
        <div className="space-y-3">
          {chapter.commonPitfalls.map((cp, cpIdx) => (
            <div
              key={cpIdx}
              className="p-3.5 rounded-xl bg-error/10 border border-error/40 space-y-1.5 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-1.5 font-bold text-error text-xs">
                <ShieldAlert className="w-4 h-4 text-error shrink-0" />
                <span>กับดัก: {cp.pitfall}</span>
              </div>
              {cp.symptom && (
                <div className="pl-5 text-base-content-body leading-relaxed text-xs">
                  <span className="font-bold text-base-content">👀 อาการเตือน: </span>
                  <span>{cp.symptom}</span>
                </div>
              )}
              <div className="pl-5 text-base-content-body leading-relaxed text-xs">
                <span className="font-bold text-success">💡 ทางแก้: </span>
                <span>{cp.solution}</span>
              </div>
            </div>
          ))}
        </div>
    </SectionShell>
  );
};
