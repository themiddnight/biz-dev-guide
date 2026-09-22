import type React from 'react';
import type { FigureKey } from '../../types';
import { C4L1 } from './C4L1';
import { C4L1Hero } from './C4L1Hero';
import { C4L2 } from './C4L2';
import { C4L3 } from './C4L3';
import { C4L4 } from './C4L4';
import { ConeOfUncertainty } from './ConeOfUncertainty';
import { EnvFlow } from './EnvFlow';
import { FamilyBehaviorSig } from './FamilyBehaviorSig';
import { FamilyPlanSig } from './FamilyPlanSig';
import { FamilyProcessSig } from './FamilyProcessSig';
import { FamilyScreenSig } from './FamilyScreenSig';
import { FamilyStructureSig } from './FamilyStructureSig';
import { FamilyThinkingSig } from './FamilyThinkingSig';
import { GateTimeline } from './GateTimeline';
import { RefundFidelity } from './RefundFidelity';
import { RefundSequence } from './RefundSequence';
import { RefundSwimlane } from './RefundSwimlane';
import { TechDebtQuadrant } from './TechDebtQuadrant';
import { ThreeLenses } from './ThreeLenses';
import { TranslationLayers } from './TranslationLayers';
import { UncertaintySpectrum } from './UncertaintySpectrum';

/**
 * Registry of static figures ported from the original HTML guide (SVG -> JSX).
 *
 * Porting rules (spec §1.2):
 * - One file per figure in this folder; keep `viewBox`, `role="img"`, `<title>`/`<desc>`.
 * - Convert attributes to JSX (`text-anchor` -> `textAnchor`, `stroke-width` -> `strokeWidth`, ...).
 * - Replace every `var(--X)` with `var(--fig-X)` (tokens live in `.fig-scope`, `src/index.css`).
 * - Make every `id` (markers, `url(#…)`, `aria-labelledby`) unique per instance with `useId()`.
 * - Wrap the root in `<div className="fig-scope">`; scale with `width: 100%; height: auto`,
 *   capped by the static per-figure `max-width`.
 * - Figures may hold view-only UI state (e.g. mobile tabs); content stays static.
 */
export interface FigureProps {
  className?: string;
}

export const FIGURES: Record<FigureKey, React.FC<FigureProps>> = {
  'tech-debt-quadrant': TechDebtQuadrant,
  'cone-of-uncertainty': ConeOfUncertainty,
  // s5 diagram literacy (spec §3.3)
  'family-structure': FamilyStructureSig,
  'family-behavior': FamilyBehaviorSig,
  'family-process': FamilyProcessSig,
  'family-screen': FamilyScreenSig,
  'family-thinking': FamilyThinkingSig,
  'family-plan': FamilyPlanSig,
  'three-lenses': ThreeLenses,
  'c4-l1-hero': C4L1Hero,
  'c4-l1': C4L1,
  'c4-l2': C4L2,
  'c4-l3': C4L3,
  'c4-l4': C4L4,
  'refund-swimlane': RefundSwimlane,
  'refund-sequence': RefundSequence,
  // s3 visual-first pilot hero (spec 2026-09-22 §2)
  'refund-fidelity': RefundFidelity,
  // Appendix figures (spec §6)
  'translation-layers': TranslationLayers,
  'gate-timeline': GateTimeline,
  'env-flow': EnvFlow,
  'uncertainty-spectrum': UncertaintySpectrum,
};
