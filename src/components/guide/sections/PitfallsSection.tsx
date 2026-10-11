import React from 'react';
import type { SectionProps } from './registry';
import { SectionShell } from './SectionShell';

export const PitfallsSection: React.FC<SectionProps> = props => {
  const { chapter } = props;
  if (!chapter.commonPitfalls || chapter.commonPitfalls.length === 0) return null;
  return (
    <SectionShell {...props} sectionKey="pitfalls" title="กับดักที่เจอบ่อย" note={`${chapter.commonPitfalls.length} ข้อ`}>
      <div className="divide-y divide-base-border">
        {chapter.commonPitfalls.map((cp, cpIdx) => (
          <div key={cpIdx} className="space-y-1 py-4 first:pt-0 last:pb-0">
            <h3 className="font-semibold text-base-content">{cp.pitfall}</h3>
            {cp.symptom && (
              <p><span className="text-base-content-muted">อาการเตือน</span> {cp.symptom}</p>
            )}
            <p><span className="font-semibold text-success">ทางแก้</span> {cp.solution}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
};
