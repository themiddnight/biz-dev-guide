import type { Chapter, ExperienceLevel } from '../types';
import { resolveChapterLevel, type LevelInputs, type LevelMode, type Role } from '../data/rolePerspective';

/** Pure parsers for the role-perspective storage keys (spec §7). Garbage returns the default. */
const isLevel = (v: unknown): v is ExperienceLevel => v === 'beginner' || v === 'experienced';

export function parseRole(raw: string | null): Role | null {
  return raw === 'biz' || raw === 'eng' ? raw : null;
}

export function parseLevelMode(raw: string | null): LevelMode {
  return raw === 'auto' || isLevel(raw) ? raw : 'auto';
}

export function parseChapterLevels(raw: string | null, validIds: readonly string[]): Record<string, ExperienceLevel> {
  if (raw === null) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
  const out: Record<string, ExperienceLevel> = {};
  for (const [id, level] of Object.entries(parsed)) {
    if (validIds.includes(id) && isLevel(level)) out[id] = level;
  }
  return out;
}

export interface RoleChoicePlan {
  /** Persist the new role and clear per-chapter overrides (D4). */
  changeRole: boolean;
  /** Mark the first-visit card as answered (an explicit "no role" is a choice too). */
  dismissFirstVisit: boolean;
}

/** Re-choosing the current role is a no-op, except that "no role" still dismisses the first-visit card. */
export function planRoleChoice(current: Role | null, next: Role | null, levelChosen: boolean): RoleChoicePlan {
  return {
    changeRole: current !== next,
    dismissFirstVisit: next === null && !levelChosen,
  };
}

export type ChapterLevelAction =
  | { kind: 'noop' }
  | { kind: 'clear' }
  | { kind: 'set'; level: ExperienceLevel };

/**
 * Per-chapter level button (spec P1.2). Picking the level the chapter would open at anyway
 * (global mode or role default) removes the override instead of writing a redundant one;
 * picking the level already shown by the override does nothing.
 */
export function planChapterLevelChoice(
  inputs: LevelInputs,
  chapter: Pick<Chapter, 'id' | 'home'>,
  chosen: ExperienceLevel,
): ChapterLevelAction {
  const hasOverride = inputs.chapterLevels[chapter.id] !== undefined;
  const fallback = resolveChapterLevel({ ...inputs, chapterLevels: {} }, chapter).level;
  if (chosen === fallback) return hasOverride ? { kind: 'clear' } : { kind: 'noop' };
  if (hasOverride && inputs.chapterLevels[chapter.id] === chosen) return { kind: 'noop' };
  return { kind: 'set', level: chosen };
}
