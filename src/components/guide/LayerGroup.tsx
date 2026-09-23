import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { LAYER_META, SECTION_META, type LayerGroup } from '../../data/sectionLayers';
import { TAP } from '../ui/tapTarget';

interface LayerGroupViewProps {
  group: LayerGroup;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const LayerGroupView: React.FC<LayerGroupViewProps> = ({ group, isExpanded, onToggle, children }) => (
  <div className="space-y-4 sm:space-y-5" data-layer-group={group.layer}>
    <div>
      <button
        type="button"
        aria-expanded={isExpanded}
        onClick={onToggle}
        className={`${TAP} w-full flex items-center justify-between gap-3 py-2 border-b border-base-border text-left cursor-pointer`}
      >
        <span className="text-sm sm:text-base font-extrabold text-base-content">
          {LAYER_META[group.layer].name}
          <span className="ml-2 text-xs font-medium text-base-content-muted">
            · {group.sections.length} หัวข้อ · ≈ {group.minutes} นาที
          </span>
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
      </button>
      {!isExpanded && (
        <p className="mt-1.5 text-xs text-base-content-muted" data-layer-preview>
          {group.sections.map(k => SECTION_META[k].chip).join(' · ')}
        </p>
      )}
    </div>
    {isExpanded && children}
  </div>
);
