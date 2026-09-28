import type { ExperienceLevel } from '../../types';
import { SECTION_META, type Layer, type LayerGroup } from '../../data/sectionLayers';

const FOLDED = ' ส่วนอื่นพับไว้ในชั้น "นำไปใช้" และ "เจาะลึก"';

/**
 * Lens banner hint: names the Core sections the chapter opens with. For experienced readers it
 * points at Friction only when this chapter has it in Apply (spec A8).
 */
export function lensHint(level: ExperienceLevel, layout: readonly LayerGroup[]): string {
  const keysIn = (layer: Layer) => layout.find(g => g.layer === layer)?.sections ?? [];
  const coreHint = keysIn('core').map(k => SECTION_META[k].chip).join(' · ');
  if (level === 'beginner') return `💡 โหมดมือใหม่: เปิด ${coreHint} ไว้ก่อน${FOLDED}`;
  const rest = keysIn('apply').includes('friction') ? ' วิธีรับมือ Friction อยู่ในชั้น "นำไปใช้"' : FOLDED;
  return `⚡ โหมดทำงานข้ามทีม: เปิด ${coreHint} ไว้ก่อน${rest}`;
}
