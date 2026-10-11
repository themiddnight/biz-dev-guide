import React, { useMemo } from 'react';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';
import { Prose } from './Prose';
import { pitfallTerms } from '../../../lib/sectionTerms';

export const PitfallsSection: React.FC<SectionProps> = props => {
  const { chapter, ctx } = props;
  // One first-occurrence walk for the section, computed purely from the chapter.
  const marked = useMemo(() => pitfallTerms(chapter), [chapter]);
  if (!chapter.commonPitfalls || chapter.commonPitfalls.length === 0) return null;
  return (
    <SectionShell {...props} sectionKey="pitfalls" title="กับดักที่เจอบ่อย" note={`${chapter.commonPitfalls.length} ข้อ`}>
      <div className="divide-y divide-base-border">
        {chapter.commonPitfalls.map((cp, cpIdx) => {
          const { symptom, solution } = marked[cpIdx];
          return (
            <div key={cpIdx} className="space-y-1 py-4 first:pt-0 last:pb-0">
              <h3 className="font-semibold text-base-content">{cp.pitfall}</h3>
              {symptom !== undefined && (
                <p data-pitfall-symptom><span className="text-base-content-muted">อาการเตือน</span> <Prose text={symptom} ctx={ctx} /></p>
              )}
              <p data-pitfall-solution><span className="font-semibold text-success">ทางแก้</span> <Prose text={solution} ctx={ctx} /></p>
            </div>
          );
        })}
      </div>
    </SectionShell>
  );
};
