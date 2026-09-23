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

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

function parseJsonObject(raw: string | null): Record<string, unknown> | null {
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isPlainObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Per-entry filter shared by both override parsers: unknown chapter ids and non-level values are dropped. */
function sanitizeLevels(obj: Record<string, unknown>, validIds: readonly string[]): Record<string, ExperienceLevel> {
  const out: Record<string, ExperienceLevel> = {};
  for (const [id, level] of Object.entries(obj)) {
    if (validIds.includes(id) && isLevel(level)) out[id] = level;
  }
  return out;
}

/** Legacy flat map (`be_guide_chapter_levels`). Read only for migration. */
export function parseChapterLevels(raw: string | null, validIds: readonly string[]): Record<string, ExperienceLevel> {
  const obj = parseJsonObject(raw);
  return obj ? sanitizeLevels(obj, validIds) : {};
}

/** Per-chapter overrides kept per role (`be_guide_chapter_levels_by_role`, role UX fixes Phase 3). */
export type ChapterLevelsByRole = Partial<Record<Role, Record<string, ExperienceLevel>>>;

const ROLES: readonly Role[] = ['biz', 'eng'];

/** Sanitised per-role map; garbage → {}. Reuses parseChapterLevels' per-entry rules. */
export function parseChapterLevelsByRole(raw: string | null, validIds: readonly string[]): ChapterLevelsByRole {
  const obj = parseJsonObject(raw);
  const out: ChapterLevelsByRole = {};
  if (!obj) return out;
  for (const role of ROLES) {
    const set = obj[role];
    if (!isPlainObject(set)) continue;
    const levels = sanitizeLevels(set, validIds);
    if (Object.keys(levels).length > 0) out[role] = levels;
  }
  return out;
}

/** P3.1 migration. `migrated` = the caller must write the new key and remove the legacy key. */
export function loadChapterLevelsByRole(
  byRoleRaw: string | null, legacyRaw: string | null, role: Role | null, validIds: readonly string[],
): { byRole: ChapterLevelsByRole; migrated: boolean } {
  const migrated = legacyRaw !== null;
  if (byRoleRaw !== null) return { byRole: parseChapterLevelsByRole(byRoleRaw, validIds), migrated };
  if (legacyRaw !== null && role !== null) {
    const legacy = parseChapterLevels(legacyRaw, validIds);
    return { byRole: Object.keys(legacy).length > 0 ? { [role]: legacy } : {}, migrated };
  }
  return { byRole: {}, migrated };
}

const EMPTY_LEVELS: Readonly<Record<string, ExperienceLevel>> = Object.freeze({});

/** Overrides in force: the role's set, or {} when role is null. Returns a shared frozen EMPTY for "none". */
export function chapterLevelsFor(byRole: ChapterLevelsByRole, role: Role | null): Readonly<Record<string, ExperienceLevel>> {
  return (role !== null && byRole[role]) || EMPTY_LEVELS;
}

/** Immutable update of one role's set; `level: null` deletes; an emptied role map is removed. */
export function withChapterLevel(
  byRole: ChapterLevelsByRole, role: Role, chapterId: string, level: ExperienceLevel | null,
): ChapterLevelsByRole {
  const set = { ...(byRole[role] ?? {}) };
  if (level === null) delete set[chapterId];
  else set[chapterId] = level;
  const next: ChapterLevelsByRole = { ...byRole };
  if (Object.keys(set).length > 0) next[role] = set;
  else delete next[role];
  return next;
}

export interface RoleChoicePlan {
  /** Persist the new role. Per-chapter overrides are kept per role and swap with it (supersedes D4). */
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
