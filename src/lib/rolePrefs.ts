import type { ExperienceLevel } from '../types';
import type { LevelMode, Role } from '../data/rolePerspective';

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
